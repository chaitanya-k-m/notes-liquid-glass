// Daily inspirational quote. Tries a public "quote of the day" API and caches
// the result for the day; falls back to a curated local list when offline/blocked.

export const QUOTES = [
  ['Embrace the moment — let your spirit soar.', 'Morning Reflection'],
  ['What you do today can improve all your tomorrows.', 'Ralph Marston'],
  ['The quieter you become, the more you can hear.', 'Ram Dass'],
  ['Almost everything will work again if you unplug it — including you.', 'Anne Lamott'],
  ['Start where you are. Use what you have. Do what you can.', 'Arthur Ashe'],
  ['Little by little, one travels far.', 'J.R.R. Tolkien'],
  ['The best way out is always through.', 'Robert Frost'],
  ['Do the small things as if they were great.', 'Pascal'],
  ['You are allowed to be both a masterpiece and a work in progress.', 'Sophia Bush'],
  ['Simplicity is the ultimate sophistication.', 'Leonardo da Vinci'],
  ['How we spend our days is how we spend our lives.', 'Annie Dillard'],
  ['Slow is smooth, and smooth is fast.', 'Proverb'],
  ['A clear mind is a quiet superpower.', 'Daily Note'],
  ['Write it down. Make it real.', 'Daily Note'],
  ['Tend the thoughts you want to grow.', 'Daily Note'],
];

export function localDaily() {
  const n = new Date();
  const doy = Math.floor((n - new Date(n.getFullYear(), 0, 0)) / 86400000);
  const [text, author] = QUOTES[doy % QUOTES.length];
  return { text, author };
}

export function localRandom() {
  const [text, author] = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  return { text, author };
}

// ZenQuotes "today" endpoint → [{ q, a, h }]. Cached per calendar day.
export async function fetchDaily() {
  const key = 'quote_' + new Date().toDateString();
  try { const c = localStorage.getItem(key); if (c) return JSON.parse(c); } catch {}
  try {
    const r = await fetch('https://zenquotes.io/api/today', { cache: 'no-store' });
    if (!r.ok) throw new Error('bad');
    const d = await r.json();
    if (!d?.[0]?.q) throw new Error('shape');
    const q = { text: d[0].q, author: d[0].a || 'Unknown' };
    try { localStorage.setItem(key, JSON.stringify(q)); } catch {}
    return q;
  } catch {
    return null; // caller falls back to localDaily()
  }
}
