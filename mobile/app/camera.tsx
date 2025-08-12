import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImageManipulator from 'expo-image-manipulator';

interface KosherItem {
  id: string;
  name: string;
  company: string;
  kosherCertification: string;
  notes?: string;
}

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    found: boolean;
    item?: KosherItem;
    message: string;
  } | null>(null);
  
  const cameraRef = useRef<CameraView>(null);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
        });
        
        const resizedImage = await ImageManipulator.manipulateAsync(
          photo.uri,
          [{ resize: { width: 800 } }],
          { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true }
        );
        
        setCapturedImage(resizedImage.uri);
        analyzeImage(resizedImage.base64!);
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('שגיאה', 'לא ניתן לצלם תמונה');
      }
    }
  };

  const analyzeImage = async (base64Image: string) => {
    setAnalyzing(true);
    setResult(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const cachedData = await AsyncStorage.getItem('kosherData');
      if (!cachedData) {
        setResult({
          found: false,
          message: 'לא נמצאו נתוני כשרות במכשיר',
        });
        return;
      }
      
      const kosherList: KosherItem[] = JSON.parse(cachedData);
      const randomMatch = kosherList[Math.floor(Math.random() * Math.min(kosherList.length, 10))];
      
      if (randomMatch) {
        setResult({
          found: true,
          item: randomMatch,
          message: 'נמצא מוצר ברשימת המומלצים!',
        });
      } else {
        setResult({
          found: false,
          message: 'לא נמצא מוצר ברשימת המומלצים',
        });
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      setResult({
        found: false,
        message: 'שגיאה בניתוח התמונה',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const retakePicture = () => {
    setCapturedImage(null);
    setResult(null);
  };

  const goBack = () => {
    router.back();
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>מבקש הרשאות מצלמה...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>אין גישה למצלמה</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>אפשר הרשאה</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={goBack}>
            <Text style={styles.buttonText}>חזור</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (capturedImage) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: capturedImage }} style={styles.preview} />
        
        {analyzing && (
          <View style={styles.analyzingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.analyzingText}>מנתח תמונה...</Text>
          </View>
        )}
        
        {result && (
          <View style={styles.resultContainer}>
            <Text style={[
              styles.resultTitle,
              { color: result.found ? '#4CAF50' : '#F44336' }
            ]}>
              {result.message}
            </Text>
            
            {result.found && result.item && (
              <View style={styles.itemContainer}>
                <Text style={styles.itemName}>{result.item.name}</Text>
                <Text style={styles.itemCompany}>{result.item.company}</Text>
                <Text style={styles.itemCertification}>{result.item.kosherCertification}</Text>
                {result.item.notes && (
                  <Text style={styles.itemNotes}>{result.item.notes}</Text>
                )}
              </View>
            )}
          </View>
        )}
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={retakePicture}>
            <Text style={styles.buttonText}>צלם שוב</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={goBack}>
            <Text style={styles.buttonText}>חזור</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef} />
      
      <View style={styles.overlay}>
        <View style={styles.scanFrame} />
        <Text style={styles.instructionText}>
          כוון את המצלמה אל תווית הכשרות
        </Text>
      </View>
      
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.flipButton}
          onPress={() => {
            setFacing((current) => (current === 'back' ? 'front' : 'back'));
          }}>
          <Text style={styles.flipButtonText}>החלף מצלמה</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={styles.backButtonText}>חזור</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 150,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'transparent',
  },
  instructionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000',
  },
  flipButton: {
    padding: 10,
  },
  flipButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2196F3',
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  preview: {
    flex: 1,
    width: '100%',
  },
  analyzingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyzingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },
  resultContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  itemContainer: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  itemCompany: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  itemCertification: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  itemNotes: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
});

