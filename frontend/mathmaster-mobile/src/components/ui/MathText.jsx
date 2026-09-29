import React from 'react';
import { Text } from 'react-native';

import { cleanMathText } from '../../lib/mathText';

/**
 * Drop-in replacement for <Text> wherever the content might contain
 * AI-generated or OCR-extracted math notation (document text, scan
 * solutions, past-paper questions, AI tutor replies). See lib/mathText.js
 * for why this cleanup is still needed even with the backend prompts
 * fixed to avoid LaTeX in the first place.
 */
export default function MathText({ children, ...props }) {
  const cleaned = typeof children === 'string' ? cleanMathText(children) : children;
  return <Text {...props}>{cleaned}</Text>;
}
