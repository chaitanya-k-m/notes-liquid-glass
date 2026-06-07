// On-device semantic search using transformers.js (loaded from CDN at runtime).
// Model: all-MiniLM-L6-v2 (384-dim sentence embeddings, ~25MB, cached by the
// browser after first load). Everything runs locally — notes never leave the device.
// Falls back to keyword scoring if the model can't load (offline / blocked).

const CDN = 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';
const MODEL = 'Xenova/all-MiniLM-L6-v2';
const CACHE_KEY = 'embeds_v1';

let pipePromise = null;

export function loadEmbedder() {
  if (pipePromise) return pipePromise;
  pipePromise = (async () => {
    const tf = await import(/* @vite-ignore */ CDN);
    tf.env.allowLocalModels = false;
    tf.env.useBrowserCache = true;
    return tf.pipeline('feature-extraction', MODEL, { quantized: true });
  })();
  return pipePromise;
}

export async function embed(extractor, text) {
  const out = await extractor(text || ' ', { pooling: 'mean', normalize: true });
  return Array.from(out.data);
}

// Both vectors are L2-normalized, so dot product == cosine similarity.
export function cosine(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

export function noteText(n) {
  const parts = [n.title, n.text];
  if (n.items?.length) parts.push(n.items.map(i => i.text).join('. '));
  if (n.imageLabels?.length) parts.push(n.imageLabels.join(', '));
  return parts.filter(Boolean).join('. ') || 'note';
}

// ── On-device image labeling (so photos become searchable) ────────────────────
let labelerPromise = null;
export function loadImageLabeler() {
  if (labelerPromise) return labelerPromise;
  labelerPromise = (async () => {
    const tf = await import(/* @vite-ignore */ CDN);
    tf.env.allowLocalModels = false;
    tf.env.useBrowserCache = true;
    return tf.pipeline('image-classification', 'Xenova/mobilevit-small', { quantized: true });
  })();
  return labelerPromise;
}

// A few coarse buckets so e.g. "pizza" also matches "food".
const LABEL_GROUPS = {
  food: ['pizza', 'burger', 'cheeseburger', 'hotdog', 'sandwich', 'plate', 'guacamole', 'burrito', 'taco', 'soup', 'bowl', 'meat', 'bread', 'cake', 'ice cream', 'salad', 'pasta', 'curry', 'rice', 'noodle', 'sushi', 'consomme', 'trifle', 'dough', 'pretzel', 'bagel', 'espresso', 'red wine', 'banana', 'orange', 'lemon', 'strawberry', 'pineapple', 'fruit', 'restaurant', 'dish', 'breakfast'],
};

export async function classifyImage(blobOrFile) {
  try {
    const labeler = await loadImageLabeler();
    const url = URL.createObjectURL(blobOrFile);
    const out = await labeler(url, { topk: 5 });
    URL.revokeObjectURL(url);
    const labels = out.map(o => o.label.split(',')[0].trim().toLowerCase());
    // add coarse group words for better semantic matches
    const extra = new Set();
    for (const l of labels) for (const [group, members] of Object.entries(LABEL_GROUPS)) {
      if (members.some(m => l.includes(m))) extra.add(group);
    }
    return [...new Set([...labels, ...extra])];
  } catch { return []; }
}

export function hashContent(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

// ── Embedding cache (localStorage) ────────────────────────────────────────────
export function loadCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'); } catch { return {}; }
}
export function saveCache(cache) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch { /* quota */ }
}

// ── Keyword fallback (no model) ───────────────────────────────────────────────
const SYNONYMS = {
  movie: ['movies', 'film', 'films', 'cinema', 'watched', 'netflix', 'show', 'series', 'actor', 'director'],
  food:  ['recipe', 'recipes', 'cook', 'cooking', 'meal', 'restaurant', 'dinner', 'lunch', 'eat'],
  travel:['trip', 'flight', 'hotel', 'vacation', 'holiday', 'visit', 'itinerary', 'destination'],
  work:  ['job', 'meeting', 'project', 'task', 'deadline', 'office', 'client', 'email'],
  money: ['budget', 'expense', 'cost', 'price', 'pay', 'bill', 'invoice', 'finance'],
  health:['workout', 'gym', 'exercise', 'doctor', 'medicine', 'diet', 'sleep'],
  music: ['song', 'songs', 'album', 'artist', 'playlist', 'concert', 'spotify'],
  book:  ['books', 'read', 'reading', 'author', 'novel', 'chapter'],
};

function expand(tokens) {
  const set = new Set(tokens);
  for (const t of tokens) {
    for (const [key, syns] of Object.entries(SYNONYMS)) {
      if (t === key || syns.includes(t)) { set.add(key); syns.forEach(s => set.add(s)); }
    }
  }
  return [...set];
}

const tokenize = (s) => (s || '').toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length > 1);

export function scoreText(query, text) {
  const qTokens = expand(tokenize(query));
  if (!qTokens.length) return 0;
  const hay = ' ' + tokenize(text).join(' ') + ' ';
  let hits = 0;
  for (const t of qTokens) if (hay.includes(t)) hits++;
  return hits / qTokens.length;
}

export function keywordScore(query, n) {
  return scoreText(query, noteText(n));
}

export function titleScore(query, n) {
  return scoreText(query, n.title || '');
}
