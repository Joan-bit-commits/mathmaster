/**
 * Converts common LaTeX-style math notation to plain Unicode text, for
 * display in a plain <Text> component — this app has no LaTeX renderer,
 * so `\frac{a}{b}` or `\sqrt{x}` shown as-is just looks like broken text
 * (literal backslashes and braces).
 *
 * This is a defensive fallback, not the primary fix — the backend prompts
 * now explicitly ask Gemini to avoid LaTeX in the first place (see
 * utils/math_notation.py on the backend). This still matters for content
 * generated before that prompt existed, and for any response that ignores
 * the instruction anyway. Best-effort: it won't perfectly reconstruct
 * complex nested LaTeX, but it turns the common cases (fractions, roots,
 * exponents, subscripts, Greek letters, set/comparison symbols) into
 * something readable instead of raw commands.
 */

const SUPERSCRIPT_MAP = {
  0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹',
  '+': '⁺', '-': '⁻', n: 'ⁿ', i: 'ⁱ',
};
const SUBSCRIPT_MAP = {
  0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉',
  '+': '₊', '-': '₋',
};

const toSuperscript = (text) => text.split('').map((c) => SUPERSCRIPT_MAP[c] ?? c).join('');
const toSubscript = (text) => text.split('').map((c) => SUBSCRIPT_MAP[c] ?? c).join('');
const isFullyMappable = (text, map) => text.split('').every((c) => map[c] !== undefined);

// Order matters: \mathbb{R}-style commands must be replaced before the
// generic backslash-strip pass below would otherwise mangle them.
const SYMBOL_REPLACEMENTS = [
  [/\\mathbb\{R\}/g, 'ℝ'], [/\\mathbb\{N\}/g, 'ℕ'], [/\\mathbb\{Z\}/g, 'ℤ'], [/\\mathbb\{Q\}/g, 'ℚ'],
  [/\\times/g, '×'], [/\\cdot/g, '·'], [/\\div/g, '÷'], [/\\pm/g, '±'],
  [/\\leq/g, '≤'], [/\\geq/g, '≥'], [/\\neq/g, '≠'], [/\\approx/g, '≈'],
  [/\\infty/g, '∞'], [/\\degree/g, '°'],
  [/\\pi/g, 'π'], [/\\theta/g, 'θ'], [/\\alpha/g, 'α'], [/\\beta/g, 'β'], [/\\gamma/g, 'γ'], [/\\Delta/g, 'Δ'],
  [/\\in/g, '∈'], [/\\subset/g, '⊂'], [/\\cup/g, '∪'], [/\\cap/g, '∩'],
  [/\\rightarrow/g, '→'], [/\\leftrightarrow/g, '↔'],
  [/\\sum/g, '∑'], [/\\int/g, '∫'], [/\\sqrt/g, '√'],
];

export function cleanMathText(input) {
  if (typeof input !== 'string' || !input) return input;
  let text = input;

  // \sqrt{x} -> √(x), \frac{a}{b} -> (a)/(b) — handled before the generic
  // symbol pass since \sqrt alone (no braces) is also a valid replacement.
  text = text.replace(/\\sqrt\{([^{}]*)\}/g, '√($1)');
  text = text.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '($1)/($2)');

  for (const [pattern, replacement] of SYMBOL_REPLACEMENTS) {
    text = text.replace(pattern, replacement);
  }

  // Exponents: prefer clean superscript when every character in the group
  // has a proper Unicode mapping (digits, +, -, n, i). Unicode has no
  // superscript form for most letters, so a group like "y-1" would
  // otherwise render as a plain "y" jammed against a tiny "⁻¹" — worse
  // than either pure form. Fall back to "^(...)" in that case.
  text = text.replace(/\^\{([^{}]+)\}/g, (_, inner) =>
    isFullyMappable(inner, SUPERSCRIPT_MAP) ? toSuperscript(inner) : `^(${inner})`
  );
  text = text.replace(/\^([0-9a-zA-Z+-])/g, (_, ch) =>
    SUPERSCRIPT_MAP[ch] !== undefined ? SUPERSCRIPT_MAP[ch] : `^${ch}`
  );

  // Subscripts: same reasoning.
  text = text.replace(/_\{([^{}]+)\}/g, (_, inner) =>
    isFullyMappable(inner, SUBSCRIPT_MAP) ? toSubscript(inner) : `_(${inner})`
  );
  text = text.replace(/_([0-9+-])/g, (_, ch) => toSubscript(ch));

  // Anything left with a backslash is an unhandled LaTeX command — strip
  // the backslash so at least the command name reads as plain text
  // rather than a stray backslash, then drop now-redundant braces.
  text = text.replace(/\\([a-zA-Z]+)/g, '$1');
  text = text.replace(/\{([^{}]*)\}/g, '$1');

  // A few common markdown artifacts that also show up literally in a
  // plain <Text> (AI tutor responses use markdown-style headers/bold).
  text = text.replace(/^#{1,6}\s*/gm, '');
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
  text = text.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '$1');

  return text;
}
