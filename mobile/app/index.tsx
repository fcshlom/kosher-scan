import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchKosherData } from '../services/kosherService';

interface KosherItem {
  id: string;
  name: string;
  company: string;
  kosherCertification: string;
  notes?: string;
}

export default function HomeScreen() {
  const [kosherList, setKosherList] = useState<KosherItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    loadKosherData();
  }, []);

  const loadKosherData = async () => {
    try {
      setLoading(true);
      
      // Check if we need to update (once per day)
      const lastUpdateTime = await AsyncStorage.getItem('lastUpdateTime');
      const now = new Date().toISOString();
      const today = new Date().toDateString();
      
      if (!lastUpdateTime || new Date(lastUpdateTime).toDateString() !== today) {
        // Fetch new data
        console.log('🔄 Fetching new data...');
        const data = await fetchKosherData();
        console.log('💾 Saving data to storage:', data.length, 'items');
        await AsyncStorage.setItem('kosherData', JSON.stringify(data));
        await AsyncStorage.setItem('lastUpdateTime', now);
        setKosherList(data); // Set the data immediately
        setLastUpdate(now);
      } else {
        // Load cached data
        console.log('📱 Loading cached data...');
        const cachedData = await AsyncStorage.getItem('kosherData');
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          console.log('📱 Loaded cached data:', parsedData.length, 'items');
          setKosherList(parsedData);
        } else {
          console.log('⚠️ No cached data found, fetching fresh data...');
          const data = await fetchKosherData();
          setKosherList(data);
        }
        setLastUpdate(lastUpdateTime || now);
      }
    } catch (error) {
      console.error('❌ Error loading kosher data:', error);
      Alert.alert('שגיאה', 'לא ניתן לטעון את רשימת הכשרויות');
      // Load sample data as fallback
      const sampleData = await fetchKosherData();
      setKosherList(sampleData);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadKosherData();
    setRefreshing(false);
  };

  const forceRefresh = async () => {
    try {
      setLoading(true);
      console.log('🔄 Force refreshing data...');
      const data = await fetchKosherData();
      setKosherList(data);
      await AsyncStorage.setItem('kosherData', JSON.stringify(data));
      await AsyncStorage.setItem('lastUpdateTime', new Date().toISOString());
      setLastUpdate(new Date().toISOString());
      Alert.alert('עדכון', `עודכן בהצלחה! נמצאו ${data.length} פריטים`);
    } catch (error) {
      console.error('❌ Force refresh failed:', error);
      Alert.alert('שגיאה', 'העדכון נכשל');
    } finally {
      setLoading(false);
    }
  };

  const renderKosherItem = ({ item }: { item: KosherItem }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemCompany}>{item.company}</Text>
      <Text style={styles.itemCertification}>{item.kosherCertification}</Text>
      {item.notes && <Text style={styles.itemNotes}>{item.notes}</Text>}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>טוען רשימת כשרויות...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>רשימת המומלצים של כושרות</Text>
        <Text style={styles.updateText}>
          עודכן לאחרונה: {lastUpdate ? new Date(lastUpdate).toLocaleString('he-IL') : 'לא ידוע'}
        </Text>
      </View>

      <FlatList
        data={kosherList}
        renderItem={renderKosherItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>לא נמצאו מוצרים ברשימה</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.cameraButton}
        onPress={() => router.push('/camera')}
      >
        <Text style={styles.cameraButtonText}>📷 סרוק מוצר</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.refreshButton}
        onPress={forceRefresh}
      >
        <Text style={styles.refreshButtonText}>🔄 עדכן רשימה</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
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
  },
  updateText: {
    fontSize: 12,
    color: '#fff',
    marginTop: 4,
    opacity: 0.8,
  },
  list: {
    flex: 1,
  },
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
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
  testButton: {
    backgroundColor: '#FF9800',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButtonText: {
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

