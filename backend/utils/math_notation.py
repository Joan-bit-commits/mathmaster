"""Shared prompt fragment for anything Gemini generates that might contain
mathematical notation.

The mobile app renders this via a KaTeX-based LaTeX renderer (see
src/components/ui/LatexText.jsx on the frontend), which scans for
$...$ (inline) and $$...$$ (display/block) delimited segments and renders
them as real typeset math — everything outside those delimiters is shown
as plain text. That means Gemini should write actual LaTeX, but every
formula must be wrapped in $ or $$ delimiters so the renderer knows where
math starts and stops; unwrapped LaTeX commands just show up as literal
text the same as before.

Raw LaTeX backslashes inside a JSON string aren't valid JSON on their own
(e.g. \\in isn't a legal JSON escape) — ask_gemini_json's repair step
handles this already by doubling stray backslashes before parsing, so this
doesn't reintroduce the escaping failures that were fixed earlier.
"""

LATEX_MATH_STYLE = (
    "Write mathematical notation as real LaTeX, and wrap every formula in "
    "dollar-sign delimiters so it can be rendered: $...$ for inline math "
    "(e.g. $x^2 + y^2 = r^2$) and $$...$$ for a standalone displayed "
    "equation on its own line. Use standard LaTeX commands normally "
    "(\\frac{a}{b}, \\sqrt{x}, \\in, \\mathbb{R}, \\leq, \\times, \\pi, "
    "etc.) — just make sure every one of them is inside a $...$ or $$...$$ "
    "pair. Never write a LaTeX command outside of a dollar-sign-delimited "
    "span."
)
