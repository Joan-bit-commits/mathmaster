import React from 'react';
import { KeyboardStickyView } from 'react-native-keyboard-controller';

/** Pins children to the top of the keyboard, tracking its movement 1:1 — no jump. */
export default function StickyInputBar({ children, className = '', offset, ...rest }) {
  return (
    <KeyboardStickyView className={className} offset={{ closed: 0, opened: 0, ...offset }} {...rest}>
      {children}
    </KeyboardStickyView>
  );
}