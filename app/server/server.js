
import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fetch from 'node-fetch';
import FormData from 'form-data';
import os from 'os';

const app = express();
const port = process.env.PORT || 8787;
const ALIGN_URL = process.env.ALIGN_URL || 'http://localhost:8000/align';

app.use(cors());
app.use(express.json());

const upload = multer({ dest: os.tmpdir() });

app.get('/health', (_req, res) => {
  res.json({ ok: true, align_url: ALIGN_URL });
});

app.post('/api/analyze', upload.fields([
  { name: 'rtx', maxCount: 1 }, // we keep the field name for compatibility
  { name: 'rtf', maxCount: 1 },
  { name: 'audio', maxCount: 1 }
]), async (req, res) => {
  try {
    const rtfFile = req.files?.rtx?.[0] || req.files?.rtf?.[0]; // accept rtx or rtf field
    const audioFile = req.files?.audio?.[0];
    if (!rtfFile || !audioFile) {
      return res.status(400).json({ error: 'Missing files: rtf/rtx and audio are required' });
    }

    const form = new FormData();
    form.append('rtf_file', fs.createReadStream(rtfFile.path), { filename: rtfFile.originalname });
    form.append('audio_file', fs.createReadStream(audioFile.path), { filename: audioFile.originalname });
    form.append('whisper_model_size', process.env.WHISPER_MODEL || 'small');

    const resp = await fetch(ALIGN_URL, { method: 'POST', body: form });
    if (!resp.ok) {
      const t = await resp.text();
      return res.status(502).json({ error: 'Align service error', details: t });
    }
    const data = await resp.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', details: String(err) });
  }
});

import fs from 'fs';
app.listen(port, () => {
  console.log(`Case Scribe backend running on http://localhost:${port}`);
});
