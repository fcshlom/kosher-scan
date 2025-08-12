import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { getLastUpdateDate, shouldRefreshList, updateKosherList } from '@/services/kosherList';

export default function SettingsScreen() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const refreshMeta = async () => {
    const date = await getLastUpdateDate();
    setLastUpdated(date);
  };

  useEffect(() => {
    refreshMeta();
  }, []);

  const onUpdatePress = async () => {
    const allowed = await shouldRefreshList();
    if (!allowed) {
      Alert.alert('Recently updated', 'You can update the list once per day.');
      return;
    }
    try {
      setIsUpdating(true);
      await updateKosherList();
      await refreshMeta();
      Alert.alert('Success', 'Certification list updated.');
    } catch (e) {
      Alert.alert('Update failed', 'Could not update the list.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Kosher certification list</Text>
        <Text style={styles.subtitle}>Last updated: {lastUpdated ?? 'Never'}</Text>
        <TouchableOpacity style={styles.button} onPress={onUpdatePress} disabled={isUpdating}>
          {isUpdating ? <ActivityIndicator color="#0b1220" /> : <Text style={styles.buttonText}>Update now</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#0f172a' },
  card: { backgroundColor: '#0b1220', padding: 16, borderRadius: 12 },
  title: { color: '#e5e7eb', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: '#94a3b8', marginBottom: 16 },
  button: { backgroundColor: '#22c55e', alignSelf: 'flex-start', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
  buttonText: { color: '#0b1220', fontWeight: '700' }
});


