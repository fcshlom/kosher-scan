## kosher-scan (Expo, TypeScript)

Cross-platform React Native app to scan product labels or barcodes, send image to an OCR API, and match against a local Kosher certification list.

### Quick start

1. Install dependencies:

```bash
npm i
```

2. Configure environment (optional):

- `EXPO_PUBLIC_OCR_API_URL` — OCR endpoint (default `http://localhost:4000/ocr`)
- `EXPO_PUBLIC_KOSHER_LIST_URL` — Hosted JSON array of certification names

You can add these to your shell env or an `app.config.js`.

3. Run the app:

```bash
npm run start
```

Open on iOS/Android via Expo Go, or run a dev build.

### Folder structure

- `src/App.tsx` — Navigation setup
- `src/screens/CameraScreen.tsx` — Camera capture, OCR call, result navigation
- `src/screens/ResultScreen.tsx` — Renders positive/negative result
- `src/screens/SettingsScreen.tsx` — Update kosher list once per day
- `src/services/ocrClient.ts` — Sends base64 image to OCR API
- `src/services/kosherList.ts` — Manage list storage and updates
- `src/utils/matchers.ts` — Text normalization and matching logic
- `src/data/kosher-list.json` — Mock data

### OCR API (Node.js with Tesseract.js)

Minimal example server:

```ts
import express from 'express';
import cors from 'cors';
import { createWorker } from 'tesseract.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.post('/ocr', async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    const worker = await createWorker();
    await worker.loadLanguage('eng+heb');
    await worker.initialize('eng+heb');
    const { data } = await worker.recognize(Buffer.from(imageBase64, 'base64'));
    await worker.terminate();
    res.json({ text: data.text || '' });
  } catch (e) {
    res.status(500).json({ error: 'OCR failed' });
  }
});

app.listen(4000, () => console.log('OCR server on :4000'));
```


