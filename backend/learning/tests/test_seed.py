from django.core.management import call_command

import pytest

from learning.models import Lesson, Question, Quiz, Topic


@pytest.fixture
def seeded(db):
    call_command('seed_learning', verbosity=0)


@pytest.mark.django_db
class TestSeedLearning:
    def test_seed_creates_expected_counts(self, seeded):
        # S1-S4 fully seeded: 4 levels, 18 level-topic pairs, each topic >= 2 lessons
        assert Topic.objects.count() == 24
        assert Lesson.objects.count() >= 48
        assert Quiz.objects.count() >= 48
        # each quiz >= 5 questions
        for quiz in Quiz.objects.all():
            assert quiz.questions.count() >= 5
        assert Question.objects.count() >= 200

    def test_seed_is_idempotent(self, seeded):
        before = (Topic.objects.count(), Lesson.objects.count(),
                  Quiz.objects.count(), Question.objects.count())
        call_command('seed_learning', verbosity=0)
        after = (Topic.objects.count(), Lesson.objects.count(),
                 Quiz.objects.count(), Question.objects.count())
        assert before == after

    def test_seed_reset_wipes(self, seeded):
        call_command('seed_learning', '--reset', verbosity=0)
        assert Topic.objects.count() == 24  # re-seeded after wipe

    def test_topics_have_levels(self, seeded):
        levels = set(Topic.objects.values_list('level', flat=True))
        assert levels <= {'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'UNIVERSITY'}
        assert {'S1', 'S2', 'S3', 'S4'} <= levels

    def test_questions_mix_mc_and_short_answer(self, seeded):
        assert Question.objects.filter(choices=[]).exists()
        assert Question.objects.exclude(choices=[]).exists()
