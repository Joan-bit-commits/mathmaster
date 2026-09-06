import React from 'react';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

/** Standardized keyboard-avoiding wrapper. Use in place of RN's KeyboardAvoidingView. */
export default function KeyboardScreen({ children, className = '', ...rest }) {
  return (
    <KeyboardAvoidingView behavior="padding" className={className} {...rest}>
      {children}
    </KeyboardAvoidingView>
  );
}