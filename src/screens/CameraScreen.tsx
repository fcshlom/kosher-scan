import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Platform } from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import * as ImageManipulator from 'expo-image-manipulator';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation';
import { sendImageToOcr } from '@/services/ocrClient';
import { matchKosherCertification } from '@/utils/matchers';
import { useFocusEffect } from '@react-navigation/native';
import CameraFrame from '@/components/CameraFrame';

type Props = NativeStackScreenProps<RootStackParamList, 'Camera'>;

export default function CameraScreen({ navigation }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [isActive, setIsActive] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setIsActive(true);
      return () => setIsActive(false);
    }, [])
  );

  useEffect(() => {
    if (!permission) requestPermission();
  }, [permission, requestPermission]);

  const onCapture = useCallback(async () => {
    if (!cameraRef.current || isBusy) return;
    try {
      setIsBusy(true);
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8, skipProcessing: Platform.OS === 'android' });
      const manipulated = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 1280 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      const ocrText = await sendImageToOcr(manipulated.uri);
      const match = await matchKosherCertification(ocrText);

      navigation.navigate('Result', {
        isKosher: !!match,
        match: match ?? undefined,
        rawText: ocrText
      });
    } catch (e) {
      navigation.navigate('Result', { isKosher: false, rawText: 'OCR failed or permission denied.' });
    } finally {
      setIsBusy(false);
    }
  }, [navigation, isBusy]);

  const onBarcodeScanned = useCallback(
    async (result: BarcodeScanningResult) => {
      if (isBusy) return;
      try {
        setIsBusy(true);
        // For barcodes, send the raw value to OCR path as text to keep flow uniform
        const text = result.rawValue;
        const match = await matchKosherCertification(text);
        navigation.navigate('Result', {
          isKosher: !!match,
          match: match ?? undefined,
          rawText: text
        });
      } finally {
        setIsBusy(false);
      }
    },
    [isBusy, navigation]
  );

  if (!permission) {
    return (
      <View style={styles.center}> 
        <ActivityIndicator color="#22c55e" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Camera permission is required.</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        ref={cameraRef}
        facing="back"
        active={isActive}
        barcodeScannerSettings={{ barcodeTypes: ['qr', 'ean13', 'ean8', 'upc_a', 'upc_e'] }}
        onBarcodeScanned={onBarcodeScanned}
      >
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.settings} onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="settings-outline" size={26} color="#e5e7eb" />
          </TouchableOpacity>
          <CameraFrame />
          <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.shutter} onPress={onCapture} disabled={isBusy}>
              {isBusy ? <ActivityIndicator color="#0b1220" /> : <Ionicons name="scan" size={26} color="#0b1220" />}
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  camera: { flex: 1 },
  overlay: { flex: 1, justifyContent: 'space-between' },
  settings: { alignSelf: 'flex-end', padding: 16 },
  bottomBar: { alignItems: 'center', marginBottom: 24 },
  shutter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center'
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a' },
  text: { color: '#e5e7eb', fontSize: 16, marginBottom: 12 },
  button: { backgroundColor: '#22c55e', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  buttonText: { color: '#0b1220', fontWeight: '700' }
});


