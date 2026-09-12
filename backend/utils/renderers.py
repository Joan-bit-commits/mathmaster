"""Shared DRF renderer for Server-Sent Event streaming views.

DRF's APIView runs content negotiation in `initial()`, before the view's
`post()`/`get()` even executes. It matches the request's `Accept` header
against the view's `renderer_classes` and raises `NotAcceptable` (406) if
nothing matches. The default renderer classes only declare
`application/json` and `text/html` — neither matches a client explicitly
sending `Accept: text/event-stream`, so any streaming view left with the
default renderers 406s on every request before its body ever runs.

Any view that returns a raw `StreamingHttpResponse` (rather than a DRF
`Response`) needs this in its `renderer_classes` so content negotiation
succeeds. The `render()` method itself is only reached on the (non-streaming)
error path — e.g. a 404 or a validation error, where DRF's exception handler
builds a `Response` and renders it through `request.accepted_renderer` — so
it needs to cope with being handed either a raw string (shouldn't normally
happen here) or an error dict.
"""

import json

from rest_framework.renderers import BaseRenderer


class ServerSentEventRenderer(BaseRenderer):
    media_type = 'text/event-stream'
    format = 'txt'
    charset = 'utf-8'

    def render(self, data, accepted_media_type=None, renderer_context=None):
        if isinstance(data, (bytes, str)):
            return data
        return json.dumps(data)
