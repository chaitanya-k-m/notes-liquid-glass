import React from 'react';
import { TYPE, GlassCard } from '../design-system.jsx';
import { ScreenHeader } from '../components/ScreensCommon.jsx';
import { useNotes, makeTitle, uuid, relativeTime, fmtDuration, fmtSize } from '../store/notes.jsx';
import { useTheme } from '../store/theme.jsx';
import { loadBlob, saveBlob, deleteBlob } from '../store/audioDB.js';

export function DetailScreen({ go, dark = false, payload }) {
  const { notes, addNote, updateNote, deleteNote } = useNotes();
  const isDraft = !!payload?.draft && !payload?.noteId;
  const existing = payload?.noteId ? notes.find(n => n.id === payload.noteId) : null;

  if (!existing && !isDraft) return <NotFound go={go} dark={dark} />;

  return (
    <Editor
      key={existing?.id || 'draft'}
      go={go} dark={dark}
      existing={existing}
      isDraft={isDraft}
      initialKind={payload?.kind || existing?.kind || 'text'}
      pickNow={!!payload?.pickNow}
      addNote={addNote} updateNote={updateNote} deleteNote={deleteNote}
    />
  );
}

function Editor({ go, dark, existing, isDraft, initialKind, pickNow, addNote, updateNote, deleteNote }) {
  const { accent } = useTheme();
  const ink    = dark ? '#fff' : '#1a1322';
  const subInk = dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.48)';
  const kind = existing?.kind || initialKind;

  const [title, setTitle] = React.useState(existing?.title || '');
  const [body, setBody]   = React.useState(existing?.text || '');
  const [items, setItems] = React.useState(existing?.items || (kind === 'todo' ? [{ id: uuid(), text: '', done: false }] : []));
  const [photos, setPhotos] = React.useState(existing?.photos || []);
  const [files, setFiles]   = React.useState(existing?.files || []);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  const idRef    = React.useRef(existing?.id || null);
  const photosRef = React.useRef(photos);
  const itemsRef  = React.useRef(items);
  const filesRef  = React.useRef(files);
  const bodyRef  = React.useRef(null);
  const fileRef  = React.useRef(null);   // image picker
  const docRef   = React.useRef(null);   // document picker
  const firstRun = React.useRef(true);

  React.useEffect(() => { photosRef.current = photos; }, [photos]);
  React.useEffect(() => { itemsRef.current = items; }, [items]);
  React.useEffect(() => { filesRef.current = files; }, [files]);

  // Autofocus / auto-pick on fresh drafts
  React.useEffect(() => {
    if (!isDraft) return;
    if (pickNow && kind === 'photo') setTimeout(() => fileRef.current?.click(), 300);
    else if (pickNow && kind === 'file') setTimeout(() => docRef.current?.click(), 300);
    else if (kind === 'text') setTimeout(() => bodyRef.current?.focus(), 300);
  }, []); // eslint-disable-line

  function autoTitle() {
    return title.trim() || makeTitle(body) || { todo: 'Checklist', photo: 'Photos', voice: 'Voice note', file: 'Saved files', text: 'Untitled note' }[kind];
  }

  function flash() {
    setSaved(true);
    clearTimeout(flash._t);
    flash._t = setTimeout(() => setSaved(false), 1400);
  }

  function ensureCreated() {
    if (idRef.current) return idRef.current;
    const n = addNote({ kind, title: autoTitle(), text: body, items: itemsRef.current, photos: photosRef.current, files: filesRef.current });
    idRef.current = n.id;
    return n.id;
  }

  // Debounced autosave
  React.useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return; }
    const hasContent = title.trim() || body.trim() || items.some(i => i.text.trim()) || photos.length || files.length;
    const t = setTimeout(() => {
      if (idRef.current) {
        updateNote(idRef.current, { kind, title: autoTitle(), text: body, items, photos, files });
        flash();
      } else if (hasContent) {
        const n = addNote({ kind, title: autoTitle(), text: body, items, photos, files });
        idRef.current = n.id;
        flash();
      }
    }, 500);
    return () => clearTimeout(t);
  }, [title, body, items, photos, files]); // eslint-disable-line

  function handleBack() {
    const hasContent = title.trim() || body.trim() || items.some(i => i.text.trim()) || photos.length || files.length;
    if (idRef.current) updateNote(idRef.current, { kind, title: autoTitle(), text: body, items, photos, files });
    else if (hasContent) addNote({ kind, title: autoTitle(), text: body, items, photos, files });
    go('home');
  }

  function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    if (idRef.current) deleteNote(idRef.current);
    go('home');
  }

  // ── Photo handling ──
  async function onFiles(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    ensureCreated();
    const added = [];
    for (const f of files) {
      const pid = uuid();
      if (await saveBlob(pid, f)) added.push(pid);
    }
    const next = [...photosRef.current, ...added];
    photosRef.current = next;
    setPhotos(next);
    if (idRef.current) updateNote(idRef.current, { kind, photos: next, title: autoTitle() });
  }
  function removePhoto(pid) {
    deleteBlob(pid);
    const next = photosRef.current.filter(p => p !== pid);
    photosRef.current = next;
    setPhotos(next);
    if (idRef.current) updateNote(idRef.current, { photos: next });
  }

  // ── File handling ──
  async function onDocs(e) {
    const picked = Array.from(e.target.files || []);
    e.target.value = '';
    if (!picked.length) return;
    ensureCreated();
    const added = [];
    for (const f of picked) {
      const fid = uuid();
      if (await saveBlob(fid, f)) added.push({ id: fid, name: f.name, type: f.type || '', size: f.size || 0 });
    }
    const next = [...filesRef.current, ...added];
    filesRef.current = next;
    setFiles(next);
    if (idRef.current) updateNote(idRef.current, { kind, files: next, title: autoTitle() });
  }
  function removeFile(fid) {
    deleteBlob(fid);
    const next = filesRef.current.filter(f => f.id !== fid);
    filesRef.current = next;
    setFiles(next);
    if (idRef.current) updateNote(idRef.current, { files: next });
  }
  async function openFile(f) {
    const blob = await loadBlob(f.id);
    if (!blob) return;
    const url = URL.createObjectURL(blob.type ? blob : new Blob([blob], { type: f.type || 'application/octet-stream' }));
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  // ── Todo handling ──
  const addItem    = () => setItems(p => [...p, { id: uuid(), text: '', done: false }]);
  const toggleItem = (id) => setItems(p => p.map(i => i.id === id ? { ...i, done: !i.done } : i));
  const editItem   = (id, text) => setItems(p => p.map(i => i.id === id ? { ...i, text } : i));
  const removeItem = (id) => setItems(p => p.filter(i => i.id !== id));

  const eyebrow = { text: 'Note', voice: 'Voice note', todo: 'Checklist', photo: 'Photo note' }[kind] || 'Note';
  const createdAt = existing?.createdAt;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <ScreenHeader dark={dark} back={handleBack} eyebrow={isDraft && !idRef.current ? `New · ${eyebrow}` : eyebrow} />

        <div style={{ padding: '8px 18px 24px' }}>
          {/* Title — serif for notes, pixel for checklists (matches home) */}
          <input
            value={title} onChange={e => setTitle(e.target.value)} placeholder={kind === 'todo' ? 'Checklist title' : 'Title'}
            style={kind === 'todo'
              ? { width: '100%', border: 'none', outline: 'none', background: 'transparent', fontFamily: TYPE.pixel, fontWeight: 400, fontSize: 36, lineHeight: 0.95, letterSpacing: 0.5, color: ink, marginBottom: 8, padding: 0 }
              : { width: '100%', border: 'none', outline: 'none', background: 'transparent', fontFamily: TYPE.serif, fontStyle: 'italic', fontWeight: 400, fontSize: 30, lineHeight: 1.12, letterSpacing: 0, color: ink, marginBottom: 8, padding: 0 }
            }
          />

          {/* Meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: TYPE.mono, fontSize: 9.5, letterSpacing: 1.2, textTransform: 'uppercase', color: subInk }}>
              {createdAt ? new Date(createdAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Now'}
            </span>
            {existing?.duration > 0 && <><span style={{ width: 3, height: 3, borderRadius: '50%', background: subInk }} /><span style={{ fontFamily: TYPE.mono, fontSize: 9.5, color: subInk }}>{fmtDuration(existing.duration)}</span></>}
            <span style={{ marginLeft: 'auto', fontFamily: TYPE.mono, fontSize: 9.5, color: saved ? '#3a9d6e' : subInk, transition: 'color 0.3s' }}>
              {saved ? '✓ saved' : createdAt ? relativeTime(createdAt) : ''}
            </span>
          </div>

          {/* Voice audio player */}
          {existing?.hasAudio && <AudioPlayer noteId={existing.id} duration={existing.duration} dark={dark} />}

          {/* Photo gallery — first image as hero, rest in a grid */}
          {(kind === 'photo' || photos.length > 0) && (
            <div style={{ marginBottom: 16 }}>
              {photos.length > 0 && (
                <PhotoTile id={photos[0]} onRemove={() => removePhoto(photos[0])} dark={dark} hero />
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: photos.length > 0 ? 8 : 0 }}>
                {photos.slice(1).map(pid => <PhotoTile key={pid} id={pid} onRemove={() => removePhoto(pid)} dark={dark} />)}
                <button onClick={() => fileRef.current?.click()} style={{
                  aspectRatio: '1', borderRadius: 14, cursor: 'pointer',
                  border: `1.5px dashed ${dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}`,
                  background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.4)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, color: subInk,
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                  <span style={{ fontFamily: TYPE.ui, fontSize: 10, fontWeight: 600 }}>Add</span>
                </button>
              </div>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={onFiles} style={{ display: 'none' }} />

          {/* File attachments */}
          {(kind === 'file' || files.length > 0) && (
            <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {files.map(f => <FileRow key={f.id} file={f} onOpen={() => openFile(f)} onRemove={() => removeFile(f.id)} dark={dark} ink={ink} subInk={subInk} />)}
              <button onClick={() => docRef.current?.click()} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 14, cursor: 'pointer',
                border: `1.5px dashed ${dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}`,
                background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.4)', color: subInk,
                fontFamily: TYPE.ui, fontWeight: 600, fontSize: 14,
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg>
                Attach a file
              </button>
            </div>
          )}
          <input ref={docRef} type="file" multiple onChange={onDocs} style={{ display: 'none' }} />

          {/* Checklist */}
          {kind === 'todo' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {items.length > 0 && (() => {
                const done = items.filter(i => i.done).length;
                const pct = (done / items.length) * 100;
                return (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontFamily: TYPE.mono, fontSize: 9.5, letterSpacing: 1, textTransform: 'uppercase', color: subInk }}>Progress</span>
                      <span style={{ fontFamily: TYPE.mono, fontSize: 9.5, color: pct === 100 ? accent : subInk }}>{done}/{items.length}{pct === 100 ? ' ✓' : ''}</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: dark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: accent, borderRadius: 3, transition: 'width 0.3s' }} />
                    </div>
                  </div>
                );
              })()}
              {items.map(it => {
                const checkFill = dark ? '#fff' : '#1f1830';
                return (
                  <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 9999, background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.55)', border: `0.75px solid ${dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.8)'}` }}>
                    <button onClick={() => toggleItem(it.id)} style={{
                      width: 20, height: 20, borderRadius: 9999, flexShrink: 0, cursor: 'pointer', padding: 0,
                      border: `1.5px solid ${it.done ? checkFill : (dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.28)')}`,
                      background: it.done ? checkFill : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
                    }}>
                      {it.done && <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke={dark ? '#1a1322' : '#fff'} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </button>
                    <input
                      value={it.text}
                      onChange={e => editItem(it.id, e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addItem(); } if (e.key === 'Backspace' && !it.text) { e.preventDefault(); removeItem(it.id); } }}
                      placeholder="List item…"
                      style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: TYPE.ui, fontSize: 15, color: it.done ? subInk : ink, textDecoration: it.done ? 'line-through' : 'none' }}
                    />
                    <button onClick={() => removeItem(it.id)} aria-label="Remove" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: subInk, padding: 2, flexShrink: 0, display: 'flex' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                    </button>
                  </div>
                );
              })}
              <button onClick={addItem} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', marginTop: 2, border: 'none', background: 'transparent', cursor: 'pointer', color: subInk, fontFamily: TYPE.ui, fontSize: 15 }}>
                <span style={{ width: 20, height: 20, borderRadius: 9999, border: `1.5px dashed ${dark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.25)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/></svg>
                </span>
                Add item
              </button>
            </div>
          )}

          {/* Body — for text, voice, photo caption, file description */}
          {kind !== 'todo' && (
            <textarea
              ref={bodyRef} value={body} onChange={e => setBody(e.target.value)}
              placeholder={kind === 'voice' ? 'Transcript — edit if needed…' : kind === 'photo' ? 'Add a caption…' : kind === 'file' ? 'Add a description…' : 'Start typing your note…'}
              style={{ width: '100%', minHeight: (kind === 'photo' || kind === 'file') ? 80 : 220, resize: 'none', border: 'none', outline: 'none', background: 'transparent', fontFamily: TYPE.ui, fontSize: 16, lineHeight: 1.7, color: ink, padding: 0, marginTop: (existing?.hasAudio || photos.length || files.length) ? 8 : 0 }}
            />
          )}
        </div>
      </div>

      {/* Bottom actions */}
      <div style={{ padding: '12px 18px', paddingBottom: 'max(20px, env(safe-area-inset-bottom, 20px))', display: 'flex', gap: 10, flexShrink: 0 }}>
        {kind === 'photo' && (
          <button onClick={() => fileRef.current?.click()} style={{ flex: 1, padding: '14px', borderRadius: 18, border: 'none', cursor: 'pointer', background: dark ? 'rgba(91,155,230,0.25)' : 'rgba(91,155,230,0.18)', color: dark ? '#bcd9ff' : '#2a6fbf', fontFamily: TYPE.ui, fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="13" r="3" stroke="currentColor" strokeWidth="2"/></svg>
            Add photo
          </button>
        )}
        {kind === 'file' && (
          <button onClick={() => docRef.current?.click()} style={{ flex: 1, padding: '14px', borderRadius: 18, border: 'none', cursor: 'pointer', background: dark ? 'rgba(220,120,170,0.25)' : 'rgba(220,120,170,0.16)', color: dark ? '#f3bcd9' : '#a8336f', fontFamily: TYPE.ui, fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M14 3v5h5M14 3l5 5v11a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>
            Attach file
          </button>
        )}
        {kind !== 'photo' && kind !== 'file' && (
          <button onClick={() => go('voice')} style={{ flex: 1, padding: '14px', borderRadius: 18, border: 'none', cursor: 'pointer', background: dark ? 'rgba(164,140,230,0.25)' : 'rgba(164,140,230,0.18)', color: dark ? '#d4c0ff' : '#5533aa', fontFamily: TYPE.ui, fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="9" y="3" width="6" height="12" rx="3" fill="currentColor"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg>
            New voice note
          </button>
        )}
        <button onClick={handleDelete} onBlur={() => setConfirmDelete(false)} style={{ padding: '14px 20px', borderRadius: 18, border: 'none', cursor: 'pointer', background: confirmDelete ? 'rgba(220,60,60,0.9)' : (dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'), color: confirmDelete ? '#fff' : (dark ? 'rgba(255,120,120,0.9)' : 'rgba(180,40,40,0.8)'), fontFamily: TYPE.ui, fontWeight: 600, fontSize: 14, transition: 'background 0.2s' }}>
          {confirmDelete ? 'Confirm' : 'Delete'}
        </button>
      </div>
    </div>
  );
}

// ── Photo tile with remove ────────────────────────────────────────────────────
function PhotoTile({ id, onRemove, dark, hero = false }) {
  const [url, setUrl] = React.useState(null);
  React.useEffect(() => {
    let revoked = false, obj;
    loadBlob(id).then(b => { if (b && !revoked) { obj = URL.createObjectURL(b); setUrl(obj); } });
    return () => { revoked = true; if (obj) URL.revokeObjectURL(obj); };
  }, [id]);
  return (
    <div style={{
      position: 'relative', borderRadius: hero ? 18 : 14, overflow: 'hidden',
      aspectRatio: hero ? '16 / 11' : '1', width: '100%',
      background: url ? `center/cover no-repeat url(${url})` : 'rgba(120,100,140,0.15)',
      boxShadow: hero ? '0 6px 20px rgba(60,40,80,0.18)' : 'none',
    }}>
      <button onClick={onRemove} aria-label="Remove photo" style={{ position: 'absolute', top: 7, right: 7, width: 26, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="#fff" strokeWidth="2.4" strokeLinecap="round"/></svg>
      </button>
    </div>
  );
}

// ── File attachment row ───────────────────────────────────────────────────────
function fileMeta(name = '', type = '') {
  const ext = (name.split('.').pop() || '').toLowerCase();
  if (type.includes('pdf') || ext === 'pdf')                       return { label: 'PDF', color: '#d4453c', bg: 'rgba(212,69,60,0.14)' };
  if (['doc', 'docx'].includes(ext) || type.includes('word'))     return { label: 'DOC', color: '#2a6fbf', bg: 'rgba(42,111,191,0.14)' };
  if (['xls', 'xlsx', 'csv'].includes(ext) || type.includes('sheet')) return { label: 'XLS', color: '#2c8a68', bg: 'rgba(44,138,104,0.14)' };
  if (['ppt', 'pptx'].includes(ext))                              return { label: 'PPT', color: '#d4843c', bg: 'rgba(212,132,60,0.14)' };
  if (['zip', 'rar', '7z'].includes(ext))                         return { label: 'ZIP', color: '#8a7a3c', bg: 'rgba(138,122,60,0.14)' };
  return { label: ext ? ext.slice(0, 4).toUpperCase() : 'FILE', color: '#7a6a8a', bg: 'rgba(122,106,138,0.14)' };
}

function FileRow({ file, onOpen, onRemove, dark, ink, subInk }) {
  const m = fileMeta(file.name, file.type);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 16, background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.6)', border: `0.75px solid ${dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.85)'}` }}>
      <button onClick={onOpen} style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0, border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
        <div style={{ width: 42, height: 42, borderRadius: 11, flexShrink: 0, background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M14 3v5h5M14 3l5 5v11a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" stroke={m.color} strokeWidth="1.8" strokeLinejoin="round"/></svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: TYPE.ui, fontWeight: 600, fontSize: 14, color: ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
          <div style={{ fontFamily: TYPE.mono, fontSize: 9.5, letterSpacing: 0.5, color: subInk, marginTop: 2 }}>{m.label}{file.size ? ` · ${fmtSize(file.size)}` : ''} · tap to open</div>
        </div>
      </button>
      <button onClick={onRemove} aria-label="Remove file" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: subInk, padding: 4, flexShrink: 0, display: 'flex' }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
      </button>
    </div>
  );
}

// ── Audio player ──────────────────────────────────────────────────────────────
function AudioPlayer({ noteId, duration, dark }) {
  const [url, setUrl] = React.useState(null);
  const [playing, setPlaying] = React.useState(false);
  const [cur, setCur] = React.useState(0);
  const [total, setTotal] = React.useState(duration || 0);
  const [missing, setMissing] = React.useState(false);
  const audioRef = React.useRef(null);

  React.useEffect(() => {
    let revoked = false, obj;
    loadBlob(noteId).then(b => { if (revoked) return; if (b) { obj = URL.createObjectURL(b); setUrl(obj); } else setMissing(true); });
    return () => { revoked = true; if (obj) URL.revokeObjectURL(obj); };
  }, [noteId]);

  const toggle = () => { const a = audioRef.current; if (!a) return; playing ? a.pause() : a.play().catch(() => {}); };
  const accent = '#7755cc';
  const pct = total ? Math.min(100, (cur / total) * 100) : 0;
  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  if (missing) return (
    <GlassCard radius={16} padding={14} tint={dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.5)'} style={{ marginBottom: 16 }}>
      <div style={{ fontFamily: TYPE.ui, fontSize: 13, color: dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }}>Audio unavailable on this device.</div>
    </GlassCard>
  );

  return (
    <GlassCard radius={16} padding={12} tint={dark ? 'rgba(164,140,230,0.18)' : 'rgba(164,140,230,0.14)'} style={{ marginBottom: 16 }}>
      <audio ref={audioRef} src={url || undefined} preload="metadata"
        onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); setCur(0); }}
        onTimeUpdate={e => setCur(e.currentTarget.currentTime)}
        onLoadedMetadata={e => { const d = e.currentTarget.duration; if (isFinite(d) && d > 0) setTotal(d); }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={toggle} disabled={!url} style={{ width: 44, height: 44, borderRadius: 22, border: 'none', cursor: url ? 'pointer' : 'default', background: accent, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(119,85,204,0.4)', opacity: url ? 1 : 0.5 }}>
          {playing
            ? <div style={{ display: 'flex', gap: 4 }}><div style={{ width: 4, height: 16, background: '#fff', borderRadius: 1 }} /><div style={{ width: 4, height: 16, background: '#fff', borderRadius: 1 }} /></div>
            : <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff" style={{ marginLeft: 2 }}><path d="M8 5v14l11-7z"/></svg>}
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ height: 5, borderRadius: 3, background: dark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: accent, borderRadius: 3, transition: 'width 0.2s linear' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontFamily: TYPE.mono, fontSize: 9.5, color: dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }}>
            <span>{fmt(cur)}</span><span>{fmt(total)}</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

function NotFound({ go, dark }) {
  const ink = dark ? '#fff' : '#1a1322';
  const sub = dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <ScreenHeader dark={dark} back={() => go('home')} eyebrow="Not found" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>📝</div>
        <div style={{ fontFamily: TYPE.ui, fontWeight: 600, fontSize: 16, color: ink, marginBottom: 8 }}>Note not found</div>
        <div style={{ fontFamily: TYPE.ui, fontSize: 14, color: sub, marginBottom: 24 }}>It may have been deleted.</div>
        <button onClick={() => go('home')} style={{ padding: '12px 24px', borderRadius: 9999, border: 'none', cursor: 'pointer', background: dark ? 'rgba(255,255,255,0.9)' : 'rgba(30,20,50,0.88)', color: dark ? '#1a1322' : '#fff', fontFamily: TYPE.ui, fontWeight: 600, fontSize: 14 }}>Back to notes</button>
      </div>
    </div>
  );
}
