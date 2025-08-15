import React from 'react';
import { View, Text, Image, Modal, Pressable, StyleSheet } from 'react-native';
import { TKosherItem } from '../types';

interface KosherModalProps {
  visible: boolean;
  item: TKosherItem | null;
  onClose: () => void;
}

export const KosherModal: React.FC<KosherModalProps> = ({ visible, item, onClose }) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContent}>
          {item?.imgSrc ? (
            <Image source={{ uri: item.imgSrc }} style={styles.modalImage} />
          ) : null}
          <Text style={styles.modalTitle}>{item?.name}</Text>
          {item?.company ? (
            <Text style={styles.modalCompany}>{item.company}</Text>
          ) : null}
          <Text style={styles.modalCertification}>{item?.kosherCertification}</Text>
          {item?.notes ? (
            <Text style={styles.modalNotes}>{item.notes}</Text>
          ) : null}
          <Pressable style={styles.modalCloseButton} onPress={onClose}>
            <Text style={styles.modalCloseButtonText}>סגור</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  modalImage: {
    width: '100%',
    height: 240,
    borderRadius: 8,
    backgroundColor: '#eee',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
    textAlign: 'right',
  },
  modalCompany: {
    fontSize: 16,
    color: '#666',
    marginBottom: 6,
    textAlign: 'right',
  },
  modalCertification: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'right',
  },
  modalNotes: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
    textAlign: 'right',
  },
  modalCloseButton: {
    alignSelf: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
