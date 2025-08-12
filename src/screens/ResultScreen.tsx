import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Linking } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;

export default function ResultScreen({ route, navigation }: Props) {
  const { isKosher, match, rawText } = route.params;

  const onOpenKosharot = () => {
    const url = 'https://www.kosharot.co.il/';
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={styles.container}>
      <View style={[styles.card, isKosher ? styles.positive : styles.negative]}>
        <Text style={styles.title}>{isKosher ? 'Kosher certification found' : 'No kosher certification found'}</Text>
        {isKosher && match ? (
          <>
            <Text style={styles.subtitle}>Match: {match}</Text>
            <TouchableOpacity style={styles.linkButton} onPress={onOpenKosharot}>
              <Text style={styles.linkText}>Open Kosharot</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.subtitle}>Try scanning again, or verify manually.</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.replace('Camera')}>
              <Text style={styles.primaryText}>Re-scan</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
      <View style={styles.rawBox}>
        <Text style={styles.rawTitle}>Extracted text</Text>
        <Text style={styles.rawText}>{rawText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 16, backgroundColor: '#0f172a' },
  card: { padding: 16, borderRadius: 12 },
  positive: { backgroundColor: '#064e3b' },
  negative: { backgroundColor: '#3f1d1d' },
  title: { color: '#e5e7eb', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: '#cbd5e1', fontSize: 14, marginBottom: 12 },
  linkButton: { backgroundColor: '#22c55e', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, alignSelf: 'flex-start' },
  linkText: { color: '#0b1220', fontWeight: '700' },
  primaryButton: { backgroundColor: '#e11d48', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, alignSelf: 'flex-start' },
  primaryText: { color: '#0b1220', fontWeight: '700' },
  rawBox: { flex: 1, backgroundColor: '#0b1220', borderRadius: 12, padding: 12 },
  rawTitle: { color: '#94a3b8', fontWeight: '600', marginBottom: 6 },
  rawText: { color: '#e5e7eb' }
});


