import React from 'react';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import CameraViewfinder from '../../../src/components/ui/CameraViewfinder';
import useCamera from '../../../src/hooks/useCamera';

export default function ScanCamera() {
  const camera = useCamera();
  const capture = async () => { const photo = await camera.takePicture(); if (photo?.uri) router.push({ pathname: '/(student)/scan/review', params: { uri: photo.uri } }); };
  const gallery = async () => { const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.85 }); if (!result.canceled) router.push({ pathname: '/(student)/scan/review', params: { uri: result.assets[0].uri } }); };
  return <CameraViewfinder {...camera} onCapture={capture} onClose={() => router.back()} onGallery={gallery} onToggleFlash={() => camera.setFlashMode(camera.flashMode === 'off' ? 'on' : 'off')} onFlip={() => camera.setFacing(camera.facing === 'back' ? 'front' : 'back')} />;
}