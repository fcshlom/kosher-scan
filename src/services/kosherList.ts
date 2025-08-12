import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocalKosherList } from '@/utils/localData';

const LIST_KEY = 'kosher_list_json_v1';
const META_KEY = 'kosher_list_updated_at_v1';
const UPDATE_URL = process.env.EXPO_PUBLIC_KOSHER_LIST_URL ?? 'https://example.com/kosher-list.json';

export type KosherList = string[];

export async function getKosherList(): Promise<KosherList> {
  const fromStorage = await AsyncStorage.getItem(LIST_KEY);
  if (fromStorage) {
    try {
      return JSON.parse(fromStorage) as KosherList;
    } catch {}
  }
  // fallback to bundled
  const bundled = await getLocalKosherList();
  return bundled;
}

export async function updateKosherList(): Promise<void> {
  const res = await fetch(UPDATE_URL);
  if (!res.ok) throw new Error('Failed to download list');
  const list = (await res.json()) as KosherList;
  await AsyncStorage.setItem(LIST_KEY, JSON.stringify(list));
  await AsyncStorage.setItem(META_KEY, new Date().toISOString());
}

export async function getLastUpdateDate(): Promise<string | null> {
  const iso = await AsyncStorage.getItem(META_KEY);
  if (!iso) return null;
  try {
    const d = new Date(iso);
    return d.toDateString();
  } catch {
    return null;
  }
}

export async function shouldRefreshList(): Promise<boolean> {
  const iso = await AsyncStorage.getItem(META_KEY);
  if (!iso) return true;
  const last = new Date(iso).getTime();
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  return now - last > oneDayMs;
}


