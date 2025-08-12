import { getKosherList } from '@/services/kosherList';

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0591-\u05C7]/g, '') // strip Hebrew niqqud if present
    .replace(/[^a-z\u05D0-\u05EA0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function matchKosherCertification(ocrText: string): Promise<string | null> {
  const list = await getKosherList();
  const haystack = normalize(ocrText);
  for (const name of list) {
    const needle = normalize(name);
    if (!needle) continue;
    if (haystack.includes(needle)) {
      return name;
    }
  }
  return null;
}


