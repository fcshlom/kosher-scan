import kosherList from '@/data/kosher-list.json';

export async function getLocalKosherList(): Promise<string[]> {
  return kosherList as string[];
}


