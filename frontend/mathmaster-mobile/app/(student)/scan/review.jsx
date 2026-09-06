import React from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import ImageCropper from '../../../src/components/ui/ImageCropper';
export default function ScanReview() { const { uri } = useLocalSearchParams(); return <ImageCropper uri={uri} onCancel={() => router.back()} onConfirm={(imageUri) => router.push({ pathname: '/(student)/scan/result', params: { uri: imageUri, solve: 'true' } })} />; }