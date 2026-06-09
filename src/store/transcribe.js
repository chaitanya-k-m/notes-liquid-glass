// On-device speech-to-text using transformers.js (same CDN/approach as semantic.js).
// Model: Whisper tiny.en (~40MB quantized, cached after first load). Runs locally
// in the WebView — audio never leaves the device. Used by VoiceScreen on platforms
// without the live Web Speech API (i.e. the native Android WebView), where we
// transcribe the recorded clip right after the user stops.

const CDN = 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';
const MODEL = 'Xenova/whisper-tiny.en';

let pipePromise = null;

// Loads (and caches) the ASR pipeline. onProgress receives 0..1 during the
// one-time model download.
export function loadTranscriber(onProgress) {
  if (pipePromise) return pipePromise;
  pipePromise = (async () => {
    const tf = await import(/* @vite-ignore */ CDN);
    tf.env.allowLocalModels = false;
    tf.env.useBrowserCache = true;
    return tf.pipeline('automatic-speech-recognition', MODEL, {
      quantized: true,
      progress_callback: (p) => {
        if (onProgress && p && p.status === 'progress' && typeof p.progress === 'number') {
          onProgress(Math.max(0, Math.min(1, p.progress / 100)));
        }
      },
    });
  })().catch((e) => { pipePromise = null; throw e; });
  return pipePromise;
}

// Decode an arbitrary audio Blob to 16kHz mono Float32 PCM (what Whisper expects).
async function decodeTo16kMono(blob) {
  const arrayBuf = await blob.arrayBuffer();
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) throw new Error('no-audio-context');
  const tmp = new AC();
  let decoded;
  try {
    decoded = await tmp.decodeAudioData(arrayBuf.slice(0));
  } finally {
    try { tmp.close(); } catch { /* ignore */ }
  }
  const targetRate = 16000;
  const length = Math.max(1, Math.ceil(decoded.duration * targetRate));
  const Offline = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  const off = new Offline(1, length, targetRate);
  const src = off.createBufferSource();
  src.buffer = decoded;
  src.connect(off.destination);
  src.start();
  const rendered = await off.startRendering();
  return rendered.getChannelData(0);
}

// Transcribe a recorded audio Blob. Returns the text (trimmed), or '' on any
// failure (so a transcription problem never blocks saving the voice note).
// onStatus(phase, value): phase is 'loading' (value=0..1) or 'working'.
export async function transcribeBlob(blob, onStatus) {
  if (!blob) return '';
  try {
    onStatus?.('loading', 0);
    const transcriber = await loadTranscriber((p) => onStatus?.('loading', p));
    onStatus?.('working');
    const pcm = await decodeTo16kMono(blob);
    if (!pcm || pcm.length === 0) return '';
    const out = await transcriber(pcm, { chunk_length_s: 30, stride_length_s: 5 });
    const text = (Array.isArray(out) ? out.map(o => o.text).join(' ') : out?.text) || '';
    return text.trim();
  } catch {
    return '';
  }
}
