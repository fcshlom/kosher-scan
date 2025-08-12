import * as FileSystem from 'expo-file-system';

const OCR_API_URL = process.env.EXPO_PUBLIC_OCR_API_URL ?? 'http://localhost:4000/ocr';

export async function sendImageToOcr(uri: string): Promise<string> {
  // Read file as base64 and POST to OCR backend
  const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
  const res = await fetch(OCR_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64: base64 })
  });

  if (!res.ok) {
    throw new Error('OCR request failed');
  }
  const data = (await res.json()) as { text: string };
  return data.text ?? '';
}


