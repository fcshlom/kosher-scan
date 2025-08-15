import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface KosherHeaderProps {
  lastUpdate: string;
}

export const KosherHeader: React.FC<KosherHeaderProps> = ({ lastUpdate }) => {
  return (
    <View style={styles.header}>
      <Text style={styles.headerText}>רשימת המומלצים של כושרות</Text>
      <Text style={styles.updateText}>
        עודכן לאחרונה: {lastUpdate ? new Date(lastUpdate).toLocaleString('he-IL') : 'לא ידוע'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#4CAF50',
    padding: 16,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  updateText: {
    fontSize: 12,
    color: '#fff',
    marginTop: 4,
    opacity: 0.8,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
});
