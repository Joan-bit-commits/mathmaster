import React, { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import MaterialIcon from './MaterialIcon';

export default function ImageCropper({ uri, onConfirm, onCancel }) {
  const [rotation, setRotation] = useState(0);
  const confirm = async () => { const result = await ImageManipulator.manipulateAsync(uri, [{ rotate: rotation }], { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }); onConfirm?.(result.uri); };
  return <View className="flex-1 bg-background"><View className="flex-1 items-center justify-center bg-black"><Image source={{ uri }} className="h-full w-full" resizeMode="contain" /><View className="absolute inset-10 rounded-2xl border-2 border-primary-fixed" /></View><View className="flex-row items-center justify-between px-6 py-5"><Pressable onPress={onCancel} accessibilityRole="button" accessibilityLabel="Cancel image review"><Text className="font-label-sm text-on-surface-variant">Cancel</Text></Pressable><Pressable onPress={() => setRotation((value) => (value + 90) % 360)} className="items-center" accessibilityRole="button" accessibilityLabel="Rotate image"><MaterialIcon name="rotate_90_degrees_ccw" size={25} color="primary" /><Text className="font-label-sm text-primary">Rotate</Text></Pressable><Pressable onPress={confirm} className="rounded-full bg-primary px-5 py-3" accessibilityRole="button" accessibilityLabel="Use this image"><Text className="font-label-sm text-on-primary">Use image</Text></Pressable></View></View>;
}