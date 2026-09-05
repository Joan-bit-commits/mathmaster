import React from 'react';
import Svg, { Polyline } from 'react-native-svg';

/** Minimal trend line — no axes, just the shape of recent scores. */
export default function Sparkline({ values = [], width = 56, height = 20, color = '#006591' }) {
  if (!values.length) return null;
  const max = Math.max(...values, 1);
  const points = values
    .map((v, i) => `${(i / Math.max(values.length - 1, 1)) * width},${height - (v / max) * height}`)
    .join(' ');
  return (
    <Svg width={width} height={height} accessibilityLabel="7-day trend">
      <Polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}