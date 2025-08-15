import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, FlatList, Alert, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchKosherData } from './services/kosherService';
import { SearchService } from './services/searchService';
import { TKosherItem } from './types';

// Import components
import { KosherHeader } from './components/KosherHeader';
import { KosherItem } from './components/KosherItem';
import { KosherModal } from './components/KosherModal';
import { ActionButtons } from './components/ActionButtons';
import { LoadingState } from './components/LoadingState';
import { EmptyState } from './components/EmptyState';
import { SearchBar } from './components/SearchBar';

export default function HomeScreen() {
  const [kosherList, setKosherList] = useState<TKosherItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<TKosherItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Memoized filtered list based on search term
  const filteredKosherList = useMemo(() => {
    return SearchService.filterItems(kosherList, {
      searchTerm,
      caseSensitive: false,
    });
  }, [kosherList, searchTerm]);

  useEffect(() => {
    loadKosherData();
  }, []);

  const loadKosherData = async () => {
    try {
      setLoading(true);
      
      const lastUpdateTime = await AsyncStorage.getItem('lastUpdateTime');
      const now = new Date().toISOString();
      const today = new Date().toDateString();
      
      if (!lastUpdateTime || refreshing || new Date(lastUpdateTime).toDateString() !== today) {
        console.log('🔄 Fetching new data...');
        const data = await fetchKosherData();
        console.log('💾 Saving data to storage:', data.length, 'items');
        await AsyncStorage.setItem('kosherData', JSON.stringify(data));
        await AsyncStorage.setItem('lastUpdateTime', now);
        setKosherList(data);
        setLastUpdate(now);
      } else {
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

  const openDetails = (item: TKosherItem) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const handleCameraPress = () => {
    router.push('/camera');
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <View style={styles.container}>
      <KosherHeader lastUpdate={lastUpdate} />
      
      <SearchBar
        onSearch={handleSearch}
        value={searchTerm}
        showResultsCount={true}
        resultsCount={filteredKosherList.length}
        totalCount={kosherList.length}
        placeholder="חפש לפי שם, חברה, כשרות או הערות..."
      />

      <FlatList
        data={filteredKosherList}
        renderItem={({ item }) => (
          <KosherItem item={item} onPress={openDetails} />
        )}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={{ direction: 'ltr' }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={<EmptyState />}
      />

      <KosherModal
        visible={modalVisible}
        item={selectedItem}
        onClose={() => setModalVisible(false)}
      />

      <ActionButtons
        onCameraPress={handleCameraPress}
        onRefreshPress={forceRefresh}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    flex: 1,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  noResultsText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
    writingDirection: 'rtl',
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
});