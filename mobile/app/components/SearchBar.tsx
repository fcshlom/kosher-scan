import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Keyboard,
} from 'react-native';

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
  placeholder?: string;
  value?: string;
  showResultsCount?: boolean;
  resultsCount?: number;
  totalCount?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'חפש מוצרים...',
  value = '',
  showResultsCount = true,
  resultsCount = 0,
  totalCount = 0,
}) => {
  const [searchTerm, setSearchTerm] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    Animated.timing(animation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [animation]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    Animated.timing(animation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [animation]);

  const handleSearch = useCallback((text: string) => {
    setSearchTerm(text);
    onSearch(text);
  }, [onSearch]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    onSearch('');
    Keyboard.dismiss();
  }, [onSearch]);

  const borderColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['#ddd', '#4CAF50'],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.searchContainer, { borderColor }]}>
        <Text style={styles.searchIcon}>🔍</Text>
        
        <TextInput
          style={styles.searchInput}
          placeholder={placeholder}
          placeholderTextColor="#999"
          value={searchTerm}
          onChangeText={handleSearch}
          onFocus={handleFocus}
          onBlur={handleBlur}
          textAlign="right"
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          onSubmitEditing={() => Keyboard.dismiss()}
        />

        {searchTerm.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </Animated.View>

      {showResultsCount && searchTerm.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsText}>
            נמצאו {resultsCount} מתוך {totalCount} מוצרים
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    fontSize: 16,
    marginLeft: 8,
    color: '#666',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  clearButton: {
    padding: 4,
    marginRight: 8,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#999',
    fontWeight: 'bold',
  },
  resultsContainer: {
    paddingTop: 8,
    alignItems: 'center',
  },
  resultsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
