import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { TKosherItem } from '../types';

interface KosherItemProps {
  item: TKosherItem;
  onPress: (item: TKosherItem) => void;
}

export const KosherItem: React.FC<KosherItemProps> = ({ item, onPress }) => {
  return (
    <TouchableOpacity style={styles.itemContainer} onPress={() => onPress(item)}>
      <View style={styles.itemRow}>
        {item.imgSrc !== '' && (
          <Image source={{ uri: item.imgSrc }} style={styles.itemImage} />
        )}
        <View style={styles.itemContent}>
          <Text style={styles.itemName}>{item.name}</Text>
          {item.company ? (
            <Text style={styles.itemCompany}>{item.company}</Text>
          ) : null}
          <Text style={styles.itemCertification}>{item.kosherCertification}</Text>
          {item.notes ? (
            <Text style={styles.itemNotes} numberOfLines={2}>
              {item.notes}
            </Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    backgroundColor: '#fff',
    margin: 8,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#eee',
    marginLeft: 12,
    marginRight: 0,
    marginStart: 12,
    marginEnd: 0,
  },
  itemContent: {
    flex: 1,
    writingDirection: 'rtl',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  itemCompany: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  itemCertification: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  itemNotes: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    fontStyle: 'italic',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
