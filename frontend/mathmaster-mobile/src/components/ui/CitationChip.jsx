import React from 'react';
import { Pressable, Text } from 'react-native';
import MaterialIcon from './MaterialIcon';

export default function CitationChip({ page, snippet, onPress, className = '' }) {
  return <Pressable onPress={onPress} onLongPress={onPress} className={`flex-row items-center gap-1 self-start rounded-full border border-outline-variant bg-surface-container-high px-3 py-1 ${className}`} accessibilityRole="button" accessibilityLabel={`Document citation page ${page}`}><MaterialIcon name="description" size={14} color="on-surface-variant" /><Text className="font-label-sm text-on-surface-variant">p. {page || '?'}</Text>{snippet ? <Text className="hidden">{snippet}</Text> : null}</Pressable>;
}