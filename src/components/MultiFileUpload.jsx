'use client';

// ─────────────────────────────────────────────────────────
// FILE: src/components/MultiFileUpload.jsx
//
// Multi-file drag-and-drop uploader (up to `max` files). Uploads each
// file directly to Supabase Storage and maintains a controlled array.
//
// Controlled component:
//   files      — array of { url, name, type, path, size }
//   onChange   — (nextArray) => void   (called on add or remove)
//   role       — 'teacher' | 'student' (storage path)
//   userId     — Clerk user id (storage path)
//   bucket     — Supabase bucket (default 'assignments')
//   max        — max number of files (default 10)
//   accept     — file input accept string
//   label      — dropzone label
//   compact    — smaller inline style
//
// Removing a file here only updates the array. The server deletes the
// underlying storage object when the change is SAVED (it diffs the old
// set against the new set), so cancelling an edit never orphans a file
// that is still referenced in the database.
// ─────────────────────────────────────────────────────────

import { useState, useRef, useCallback } from 'react';
import { uploadFile, validateFile } from '../lib/uploadFile';
import { FileCard } from './FileUpload';

const DEFAULT_ACCEPT = 'image/*,application/pdf,.doc,.docx,audio/*,video/mp4,video/webm';

export default function MultiFileUpload({
  files = [],
  onChange,
  role = 'student',
  userId,
  bucket = 'assignments',
  max = 10,
  accept = DEFAULT_ACCEPT,
  label = 'Attach files',
  compact = false,
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [errors, setErrors] = useState([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const remaining = Math.max(0, max - files.length);

  const processFiles = useCallback(async (selectedList) => {
    const selected = Array.from(selectedList || []);
    if (selected.length === 0) return;

    const room = Math.max(0, max - files.length);
    const toUpload = selected.slice(0, room);
    const overflow = selected.length - toUpload.length;

    const newErrors = [];
    if (overflow > 0) {
      newErrors.push(`You can attach up to ${max} files — ${overflow} not added.`);
    }

    // Validate up front (type + size), skip invalid.
    const valid = [];
    for (const f of toUpload) {
      const err = validateFile(f);
      if (err) newErrors.push(`${f.name}: ${err}`);
      else valid.push(f);
    }

    if (valid.length === 0) {
      setErrors(newErrors);
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    setUploading(true);
    setUploadingCount(valid.length);

    const uploaded = [];
    for (const f of valid) {
      try {
        const r = await uploadFile(f, { role, userId, bucket });
        uploaded.push({ url: r.url, name: r.fileName, type: r.fileType, path: r.path, size: r.size });
      } catch (e) {
        newErrors.push(`${f.name}: ${e.message}`);
      }
    }

    setUploading(false);
    setUploadingCount(0);
    setErrors(newErrors);
    if (uploaded.length) onChange?.([...files, ...uploaded]);
    if (inputRef.current) inputRef.current.value = '';
  }, [files, max, onChange, role, userId, bucket]);

  const handleFileChange = (e) => processFiles(e.target.files);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (!uploading && remaining > 0) processFiles(e.dataTransfer.files);
  };
  const handleDragOver = (e) => { e.preventDefault(); if (remaining > 0) setDragging(true); };
  const handleDragLeave = () => setDragging(false);

  const removeAt = (idx) => {
    setErrors([]);
    onChange?.(files.filter((_, i) => i !== idx));
  };

  return (
    <div>
      {/* Uploaded files */}
      {files.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: files.length ? 10 : 0 }}>
          {files.map((f, i) => (
            <FileCard
              key={`${f.url}_${i}`}
              url={f.url}
              fileName={f.name}
              fileType={f.type}
              size={f.size}
              onClear={() => removeAt(i)}
              compact={compact}
            />
          ))}
        </div>
      )}

      {/* Dropzone (hidden once max reached, unless mid-upload) */}
      {(remaining > 0 || uploading) && (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          style={{
            border:        `2px dashed ${dragging ? '#28b7d9' : errors.length ? '#ef4444' : '#e2e8f0'}`,
            borderRadius:  10,
            padding:       compact ? '12px 16px' : '18px',
            background:    dragging ? 'rgba(40,183,217,0.05)' : '#fafbfc',
            cursor:        uploading ? 'wait' : 'pointer',
            transition:    'all 150ms ease',
            textAlign:     'center',
            display:       'flex',
            flexDirection: compact ? 'row' : 'column',
            alignItems:    'center',
            gap:           compact ? 10 : 8,
            justifyContent: compact ? 'flex-start' : 'center',
          }}
        >
          <div style={{ fontSize: compact ? 20 : 26, flexShrink: 0 }}>
            {uploading ? '⏳' : '📎'}
          </div>
          {uploading ? (
            <div style={{ fontSize: 13, fontWeight: 600, color: '#0e6e8a' }}>
              Uploading {uploadingCount} file{uploadingCount === 1 ? '' : 's'}…
            </div>
          ) : (
            <div>
              <div style={{ fontSize: compact ? 13 : 14, fontWeight: 700, color: '#0f172a' }}>
                {files.length > 0 ? 'Add more files' : label}
              </div>
              {!compact && (
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                  Drag &amp; drop or click · up to {max} files · 10 MB each
                </div>
              )}
              <div style={{ fontSize: 11, color: '#cbd5e1', marginTop: compact ? 0 : 6 }}>
                {remaining} slot{remaining === 1 ? '' : 's'} left · Images · PDF · Word · Audio · Video
              </div>
            </div>
          )}
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {errors.map((e, i) => (
            <div key={i} style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>⚠️ {e}</div>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// FileList — read-only display of multiple files.
// Accepts items shaped { url, name, type, size } OR the legacy
// { url, fileName, fileType } so it is safe to pass either.
// ─────────────────────────────────────────────────────────
export function FileList({ files = [], label, compact = false }) {
  const list = (files || []).filter((f) => f && (f.url));
  if (list.length === 0) return null;

  return (
    <div style={{ marginTop: 12 }}>
      {label && (
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', marginBottom: 6 }}>
          {label}{list.length > 1 ? ` (${list.length})` : ''}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {list.map((f, i) => (
          <FileCard
            key={`${f.url}_${i}`}
            url={f.url}
            fileName={f.name ?? f.fileName}
            fileType={f.type ?? f.fileType}
            size={f.size}
            onClear={null}
            compact={compact}
          />
        ))}
      </div>
    </div>
  );
}
