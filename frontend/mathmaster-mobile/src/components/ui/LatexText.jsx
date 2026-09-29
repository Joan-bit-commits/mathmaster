import React, { useMemo, useState } from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import { WebView } from 'react-native-webview';

import { cleanMathText } from '../../lib/mathText';

// Loaded from a CDN rather than bundled — KaTeX's JS + CSS + web fonts add
// up to a few hundred KB, and bundling all of that as local Expo assets is
// a separate, heavier undertaking. This means LatexText needs network
// access the first time each WebView mounts; on a slow/offline connection
// a formula will show blank (or fall back to raw text — see below) until
// it loads. Worth revisiting if that turns out to matter for real usage
// in low-connectivity conditions.
const KATEX_VERSION = '0.16.9';
const KATEX_CSS = `https://cdn.jsdelivr.net/npm/katex@${KATEX_VERSION}/dist/katex.min.css`;
const KATEX_JS = `https://cdn.jsdelivr.net/npm/katex@${KATEX_VERSION}/dist/katex.min.js`;
const AUTORENDER_JS = `https://cdn.jsdelivr.net/npm/katex@${KATEX_VERSION}/dist/contrib/auto-render.min.js`;

// Cheap check so plain text (the common case — most sentences have no
// math in them at all) never pays for a WebView. Matches $...$, $$...$$,
// \(...\), and \[...\].
const HAS_LATEX_DELIMITERS = /(?:\$\$[\s\S]+?\$\$|\$[^$\n]+\$|\\\([\s\S]+?\\\)|\\\[[\s\S]+?\\\])/;

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Converts the small set of markdown the AI tutor prompt actually asks
// for (# headings, **bold**, *italic*) into real HTML tags, rather than
// just deleting the syntax — this path already renders a full WebView for
// KaTeX, so real <h3>/<strong> elements cost nothing extra and look
// better than flattened plain text. This previously didn't run at all in
// the math path: AI tutor answers routinely contain both markdown structure
// and LaTeX math in the same response, so they always hit this branch
// (not the plain-<Text> fallback below, which does clean up markdown) —
// meaning "#"/"**" were showing up completely literally.
//
// Applied to already-HTML-escaped text, so the tags this inserts are the
// only real HTML in the string — everything else stays inert text content
// exactly as before.
function markdownToHtml(escapedContent) {
  let html = escapedContent;
  html = html.replace(/^(#{1,6})\s+(.*)$/gm, (_, hashes, inner) => `<h${hashes.length}>${inner}</h${hashes.length}>`);
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
  return html;
}

function buildHtml(content, { fontSize, color }) {
  const withMarkdown = markdownToHtml(escapeHtml(content.trim()));
  const withLineBreaks = withMarkdown.replace(/\n/g, '<br/>');
  return `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<link rel="stylesheet" href="${KATEX_CSS}">
<style>
  html, body { margin: 0; padding: 0; background: transparent; width: 100%; }
  body {
    font-family: -apple-system, Roboto, sans-serif;
    font-size: ${fontSize}px;
    line-height: 1.5;
    color: ${color};
    word-wrap: break-word;
    overflow-wrap: anywhere;
  }
  #content { max-width: 100%; }
  h1, h2, h3, h4, h5, h6 { margin: 0.6em 0 0.3em; line-height: 1.3; }
  h1 { font-size: 1.4em; } h2 { font-size: 1.25em; } h3 { font-size: 1.1em; }
  h4, h5, h6 { font-size: 1em; }
  .katex { font-size: 1.05em; }
  .katex-display { margin: 0.4em 0; overflow-x: auto; overflow-y: hidden; max-width: 100%; }
</style>
</head>
<body>
<div id="content">${withLineBreaks}</div>
<script src="${KATEX_JS}"></script>
<script src="${AUTORENDER_JS}"></script>
<script>
  function postHeight() {
    window.ReactNativeWebView.postMessage(String(document.body.scrollHeight));
  }
  function render() {
    try {
      renderMathInElement(document.getElementById('content'), {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '\\\\[', right: '\\\\]', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\\\(', right: '\\\\)', display: false }
        ],
        throwOnError: false
      });
    } catch (e) {
      // KaTeX failed to load or render — leave the raw text visible
      // rather than showing a blank view.
    }
    postHeight();
    setTimeout(postHeight, 200); // catch late webfont-driven reflow
  }
  if (document.readyState === 'complete') render();
  else window.addEventListener('load', render);
</script>
</body></html>`;
}

/**
 * Renders text containing $...$ (inline) or $$...$$ (display) LaTeX as
 * real typeset math, via a WebView running KaTeX. Anything outside those
 * delimiters renders as plain text. Falls back to a plain <Text> with no
 * WebView at all when the content has no math in it — the common case —
 * so an AI tutor chat full of ordinary sentences doesn't spin up a WebView
 * per message for nothing.
 */
export default function LatexText({
  children,
  style,
  className,
  fontSize = 16,
  color = '#1a1a1a',
  // Fraction of screen width to give the math bubble. Tune this to roughly
  // match your chat bubble's max-w-[85%] minus avatar + padding.
  maxWidthRatio = 0.72,
}) {
  const { width: screenWidth } = useWindowDimensions();
  const text = typeof children === 'string' ? children : children == null ? '' : String(children);

  // All hooks below are called unconditionally, in the same order, on
  // every render — regardless of whether hasMath is true or false. This
  // matters because the same LatexText instance can flip between the two
  // (e.g. streaming tokens crossing a "$" delimiter mid-message), and
  // conditionally-called hooks there previously threw
  // "Rendered more hooks than during the previous render."
  const hasMath = useMemo(() => HAS_LATEX_DELIMITERS.test(text), [text]);
  const [height, setHeight] = useState(fontSize * 1.6);
  const html = useMemo(
    () => (hasMath ? buildHtml(text, { fontSize, color }) : null),
    [hasMath, text, fontSize, color]
  );
  // WebView has no intrinsic content width like Text does — without an
  // explicit width the bubble collapses toward 0 and content wraps one
  // character per line.
  const containerWidth = useMemo(
    () => Math.round(screenWidth * maxWidthRatio),
    [screenWidth, maxWidthRatio]
  );

  if (!hasMath) {
    // No $...$/$$...$$ delimiters found — either plain text (the common
    // case) or a stray, undelimited LaTeX command that slipped past the
    // backend prompt. cleanMathText() converts common LaTeX patterns to
    // Unicode as a safety net either way; it's a no-op on plain text.
    return (
      <Text style={style} className={className}>
        {cleanMathText(text)}
      </Text>
    );
  }

  return (
    <View style={[{ height, width: containerWidth }, style]}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        onMessage={(event) => {
          const parsed = parseInt(event.nativeEvent.data, 10);
          if (!Number.isNaN(parsed) && parsed > 0 && parsed !== height) setHeight(parsed);
        }}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        javaScriptEnabled
        style={{ backgroundColor: 'transparent' }}
      />
    </View>
  );
}