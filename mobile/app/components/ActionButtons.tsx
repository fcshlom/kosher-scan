import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ActionButtonsProps {
  onCameraPress: () => void;
  onRefreshPress: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  onCameraPress, 
  onRefreshPress 
}) => {
  return (
    <View>
      <TouchableOpacity style={styles.cameraButton} onPress={onCameraPress}>
        <Text style={styles.cameraButtonText}>📷 סרוק מוצר</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.refreshButton} onPress={onRefreshPress}>
        <Text style={styles.refreshButtonText}>🔄 עדכן רשימה</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cameraButton: {
    backgroundColor: '#2196F3',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cameraButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  refreshButton: {
    backgroundColor: '#007bff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
