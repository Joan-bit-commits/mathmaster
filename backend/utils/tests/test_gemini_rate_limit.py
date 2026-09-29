import threading
import time
from unittest.mock import MagicMock, patch

from django.test import TestCase

from utils.gemini import (
    MAX_429_RETRIES,
    _RateLimiter,
    _generate_content,
    _is_daily_quota_error,
    _is_rate_limit_error,
    _parse_retry_delay_seconds,
)

# Captured verbatim (unescaped) from this project's own logged 429 errors —
# see math.sql. Using the real text rather than a synthetic approximation
# means these tests are checking against what Gemini actually sends, not
# a guess at its format.
REAL_RPM_ERROR = (
    '429 You exceeded your current quota, please check your plan and billing details. '
    'For more information on this error, head to: https://ai.google.dev/gemini-api/docs/rate-limits. '
    'To monitor your current usage, head to: https://ai.dev/rate-limit. \n'
    '* Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, '
    'limit: 5, model: gemini-3.6-flash\n'
    'Please retry in 35.99236313s. [links {\n'
    '  description: "Learn more about Gemini API quotas"\n'
    '  url: "https://ai.google.dev/gemini-api/docs/rate-limits"\n'
    '}\n'
    ', violations {\n'
    '  quota_metric: "generativelanguage.googleapis.com/generate_content_free_tier_requests"\n'
    '  quota_id: "GenerateRequestsPerMinutePerProjectPerModel-FreeTier"\n'
    '  quota_dimensions {\n'
    '    key: "model"\n'
    '    value: "gemini-3.6-flash"\n'
    '  }\n'
    '  quota_dimensions {\n'
    '    key: "location"\n'
    '    value: "global"\n'
    '  }\n'
    '  quota_value: 5\n'
    '}\n'
    ', retry_delay {\n'
    '  seconds: 35\n'
    '}\n'
    ']'
)

REAL_RPD_ERROR = (
    '429 You exceeded your current quota, please check your plan and billing details. '
    'For more information on this error, head to: https://ai.google.dev/gemini-api/docs/rate-limits. '
    'To monitor your current usage, head to: https://ai.dev/rate-limit. \n'
    '* Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, '
    'limit: 20, model: gemini-3.6-flash\n'
    'Please retry in 9.192676965s. [links {\n'
    '  description: "Learn more about Gemini API quotas"\n'
    '  url: "https://ai.google.dev/gemini-api/docs/rate-limits"\n'
    '}\n'
    ', violations {\n'
    '  quota_metric: "generativelanguage.googleapis.com/generate_content_free_tier_requests"\n'
    '  quota_id: "GenerateRequestsPerDayPerProjectPerModel-FreeTier"\n'
    '  quota_dimensions {\n'
    '    key: "model"\n'
    '    value: "gemini-3.6-flash"\n'
    '  }\n'
    '  quota_value: 20\n'
    '}\n'
    ', retry_delay {\n'
    '  seconds: 9\n'
    '}\n'
    ']'
)


class ErrorParsingTests(TestCase):
    """These check the parsing helpers directly against the real error
    text above — no mocking involved, just string parsing."""

    def test_parses_retry_delay_from_real_rpm_error(self):
        exc = RuntimeError(REAL_RPM_ERROR)
        assert _parse_retry_delay_seconds(exc) == 35.0  # matches the structured `retry_delay { seconds: 35 }`

    def test_rpm_error_is_recognized_as_a_rate_limit_error(self):
        assert _is_rate_limit_error(RuntimeError(REAL_RPM_ERROR)) is True

    def test_rpm_error_is_not_classified_as_a_daily_quota_error(self):
        assert _is_daily_quota_error(RuntimeError(REAL_RPM_ERROR)) is False

    def test_rpd_error_is_classified_as_a_daily_quota_error(self):
        assert _is_daily_quota_error(RuntimeError(REAL_RPD_ERROR)) is True

    def test_rpd_error_is_also_recognized_as_a_rate_limit_error(self):
        # It's both: a 429/quota error in general, AND specifically the
        # daily variant — the daily check is a refinement, not a
        # replacement, of the general rate-limit check.
        assert _is_rate_limit_error(RuntimeError(REAL_RPD_ERROR)) is True

    def test_an_ordinary_non_429_error_is_not_treated_as_a_rate_limit(self):
        assert _is_rate_limit_error(RuntimeError('connection reset by peer')) is False

    def test_parse_retry_delay_falls_back_to_the_human_readable_line_if_structured_field_is_absent(self):
        text_only = 'Quota exceeded.\nPlease retry in 12.5s. [no structured block here]'
        assert _parse_retry_delay_seconds(RuntimeError(text_only)) == 12.5

    def test_parse_retry_delay_returns_none_when_nothing_matches(self):
        assert _parse_retry_delay_seconds(RuntimeError('some unrelated error')) is None


class GenerateContentRetryTests(TestCase):
    """Exercises _generate_content's actual retry behaviour, using the real
    error text as what a mocked model.generate_content() raises. Both the
    rate limiter and time.sleep are mocked out here so these tests don't
    actually wait — they're testing the retry DECISIONS, not real timing
    (that's covered separately by RateLimiterPacingTests)."""

    def setUp(self):
        patcher_limiter = patch('utils.gemini._get_rate_limiter', return_value=MagicMock(acquire=lambda: None))
        patcher_sleep = patch('utils.gemini.time.sleep')
        self.mock_sleep = patcher_sleep.start()
        patcher_limiter.start()
        self.addCleanup(patcher_limiter.stop)
        self.addCleanup(patcher_sleep.stop)

    def test_retries_and_succeeds_after_one_rpm_429(self):
        model = MagicMock()
        model.generate_content.side_effect = [RuntimeError(REAL_RPM_ERROR), 'a real response']

        result = _generate_content(model, ['prompt'], {'max_output_tokens': 100})

        assert result == 'a real response'
        assert model.generate_content.call_count == 2
        # Waited close to the server-specified 35s (capped at
        # MAX_429_WAIT_SECONDS=65, so 35 stays as-is), not some arbitrary
        # fixed backoff.
        self.mock_sleep.assert_called_once()
        assert self.mock_sleep.call_args.args[0] == 35.0

    def test_daily_quota_error_fails_immediately_without_retrying(self):
        model = MagicMock()
        model.generate_content.side_effect = RuntimeError(REAL_RPD_ERROR)

        with self.assertRaises(RuntimeError) as ctx:
            _generate_content(model, ['prompt'], {'max_output_tokens': 100})

        assert model.generate_content.call_count == 1  # no retry attempted at all
        self.mock_sleep.assert_not_called()
        assert 'daily' in str(ctx.exception).lower()

    def test_gives_up_after_max_retries_on_persistent_rpm_429(self):
        model = MagicMock()
        model.generate_content.side_effect = RuntimeError(REAL_RPM_ERROR)

        with self.assertRaises(RuntimeError):
            _generate_content(model, ['prompt'], {'max_output_tokens': 100})

        assert model.generate_content.call_count == MAX_429_RETRIES + 1

    def test_a_non_rate_limit_error_propagates_immediately_without_retry(self):
        model = MagicMock()
        model.generate_content.side_effect = ValueError('something else entirely')

        with self.assertRaises(ValueError):
            _generate_content(model, ['prompt'], {'max_output_tokens': 100})

        assert model.generate_content.call_count == 1
        self.mock_sleep.assert_not_called()

    def test_rate_limiter_is_acquired_before_every_attempt_including_retries(self):
        mock_limiter = MagicMock()
        with patch('utils.gemini._get_rate_limiter', return_value=mock_limiter):
            model = MagicMock()
            model.generate_content.side_effect = [RuntimeError(REAL_RPM_ERROR), 'ok']
            _generate_content(model, ['prompt'], {'max_output_tokens': 100})
        assert mock_limiter.acquire.call_count == 2  # once per attempt


class RateLimiterPacingTests(TestCase):
    """Real timing, on a small/fast configuration — proves the limiter
    actually paces calls rather than just tracking a count."""

    def test_calls_within_the_limit_do_not_wait(self):
        limiter = _RateLimiter(max_calls=3, period_seconds=1.0)
        started = time.monotonic()
        for _ in range(3):
            limiter.acquire()
        elapsed = time.monotonic() - started
        assert elapsed < 0.2, f"calls within budget should not be delayed, took {elapsed:.2f}s"

    def test_a_call_beyond_the_limit_waits_for_the_window_to_free_up(self):
        limiter = _RateLimiter(max_calls=2, period_seconds=0.4)
        started = time.monotonic()
        limiter.acquire()
        limiter.acquire()
        limiter.acquire()  # third call within the same 0.4s window must wait
        elapsed = time.monotonic() - started
        assert elapsed >= 0.35, f"third call should have waited for the window, only took {elapsed:.2f}s"

    def test_concurrent_threads_share_the_same_budget(self):
        """Mirrors the real usage: several ThreadPoolExecutor workers
        (e.g. concurrent per-page OCR calls) all acquiring the same
        limiter must collectively stay within the cap, not each get
        their own independent budget."""
        limiter = _RateLimiter(max_calls=2, period_seconds=0.4)
        call_times = []
        lock = threading.Lock()

        def worker():
            limiter.acquire()
            with lock:
                call_times.append(time.monotonic())

        threads = [threading.Thread(target=worker) for _ in range(4)]
        started = time.monotonic()
        for t in threads:
            t.start()
        for t in threads:
            t.join()

        # First 2 should get through quickly; the other 2 must wait for
        # (at least) the next window.
        early = [t for t in call_times if t - started < 0.2]
        late = [t for t in call_times if t - started >= 0.35]
        assert len(early) == 2
        assert len(late) == 2
