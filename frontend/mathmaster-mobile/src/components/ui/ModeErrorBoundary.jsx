// src/components/ui/ModeErrorBoundary.jsx
import React from 'react';
import { Text, View } from 'react-native';

export default class ModeErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.warn('Mode panel crashed:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-[16px] font-semibold text-on-surface mb-1">This section hit a snag</Text>
          <Text className="font-body-sm text-on-surface-variant text-center">
            Try switching modes and back, or restart the app.
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}