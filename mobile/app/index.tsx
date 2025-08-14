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
import { fetchKosherData, getSampleData } from '../services/kosherService';

interface KosherItem {
  id: string;
  name: string;
  company: string;
  kosherCertification: string;
  notes?: string;
  keywords?: string;
  imageUrl?: string;
}

const MIN_ITEMS = 100;

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

      const storedUpdateTime = await AsyncStorage.getItem('lastUpdateTime');
      const storedDate = storedUpdateTime ? new Date(storedUpdateTime).toISOString().split('T')[0] : '';
      const nowIso = new Date().toISOString();
      const today = nowIso.split('T')[0];

      if (storedDate !== today) {
        console.log('🔄 Fetching new data (date changed)...');
        const data = await fetchKosherData();
        console.log('📊 fetched items:', data.length);

        if (data.length >= MIN_ITEMS) {
          await AsyncStorage.setItem('kosherData', JSON.stringify(data));
          await AsyncStorage.setItem('lastUpdateTime', nowIso);
          setKosherList(data);
          setLastUpdate(nowIso);
        } else {
          console.log(`⚠️ Expected hundreds of items; got ${data.length}. Keeping cache.`);
          const cachedData = await AsyncStorage.getItem('kosherData');
          if (cachedData) {
            const parsedData = JSON.parse(cachedData);
            setKosherList(parsedData);
            setLastUpdate(storedUpdateTime || '');
          } else {
            setKosherList(getSampleData());
            setLastUpdate('');
          }
        }
      } else {
        console.log('📱 Loading cached data...');
        const cachedData = await AsyncStorage.getItem('kosherData');
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          console.log('📱 Loaded cached data:', parsedData.length, 'items');
          setKosherList(parsedData);
        } else {
          console.log('⚠️ No cached data found, fetching...');
          const data = await fetchKosherData();
          if (data.length >= MIN_ITEMS) {
            setKosherList(data);
            await AsyncStorage.setItem('kosherData', JSON.stringify(data));
            await AsyncStorage.setItem('lastUpdateTime', nowIso);
            setLastUpdate(nowIso);
          } else {
            setKosherList(getSampleData());
          }
        }
        setLastUpdate(storedUpdateTime || lastUpdate);
      }
    } catch (error) {
      console.error('❌ Error loading kosher data:', error);
      Alert.alert('שגיאה', 'לא ניתן לטעון את רשימת הכשרויות');
      setKosherList(getSampleData());
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
      console.log('📊 fetched items (force):', data.length);
      if (data.length >= MIN_ITEMS) {
        setKosherList(data);
        await AsyncStorage.setItem('kosherData', JSON.stringify(data));
        const now = new Date().toISOString();
        await AsyncStorage.setItem('lastUpdateTime', now);
        setLastUpdate(now);
        Alert.alert('עדכון', `עודכן בהצלחה! נמצאו ${data.length} פריטים`);
      } else {
        Alert.alert('עדכון', `התקבלו ${data.length} פריטים (פחות מהמינימום ${MIN_ITEMS}), הרשימה לא עודכנה`);
      }
    } catch (error) {
      console.error('❌ Force refresh failed:', error);
      Alert.alert('שגיאה', 'העדכון נכשל');
    } finally {
      setLoading(false);
    }
  };

  const renderKosherItem = ({ item }: { item: KosherItem }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemName}>{item.name}</Text>
        {item.imageUrl && (
          <View style={styles.certificationImage}>
            <Text style={styles.imageText}>🏷️</Text>
          </View>
        )}
      </View>
      <Text style={styles.itemCompany}>{item.company}</Text>
      <Text style={styles.itemCertification}>{item.kosherCertification}</Text>
      {item.notes && <Text style={styles.itemNotes}>{item.notes}</Text>}
      {item.keywords && <Text style={styles.itemKeywords}>🏷️ {item.keywords}</Text>}
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

      <TouchableOpacity
        style={styles.testButton}
        onPress={testKosherService}
      >
        <Text style={styles.testButtonText}>🧪 בדיקת שירות</Text>
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
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
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
  itemKeywords: {
    fontSize: 12,
    color: '#2196F3',
    marginTop: 4,
    fontWeight: '500',
  },
  certificationImage: {
    width: 30,
    height: 30,
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  imageText: {
    fontSize: 16,
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

