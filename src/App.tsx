import React from 'react';
import { NavigationContainer, DefaultTheme, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import CameraScreen from '@/screens/CameraScreen';
import ResultScreen from '@/screens/ResultScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import { RootStackParamList } from '@/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#0f172a',
    card: '#0b1220',
    text: '#e5e7eb',
    primary: '#22c55e',
    border: '#1f2937'
  }
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={AppTheme}>
        <StatusBar style="light" />
        <Stack.Navigator
          initialRouteName="Camera"
          screenOptions={{ headerStyle: { backgroundColor: '#0b1220' }, headerTintColor: '#e5e7eb' }}
        >
          <Stack.Screen name="Camera" component={CameraScreen} options={{ title: 'Kosher Scan' }} />
          <Stack.Screen name="Result" component={ResultScreen} options={{ title: 'Result' }} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}


