'use client';

// ─────────────────────────────────────────────────────────
// FILE: src/components/FileUpload.jsx
//
// Reusable drag-and-drop file upload component.
// Uses Supabase Storage directly from the browser.
//
// Props:
//   onUploadComplete(result)  — called with { url, fileName, fileType, size }
//   onClear()                 — called when user removes the file
//   role                      — 'teacher' | 'student' (determines storage path)
//   userId                    — Clerk user ID (for storage path)
//   existingFile              — { url, fileName, fileType } if editing
//   accept                    — optional MIME string e.g. "image/*,application/pdf"
//   label                     — optional label override
//   compact                   — if true, renders smaller inline style
// ─────────────────────────────────────────────────────────

import { useState, useRef, useCallback } from 'react';
import { uploadFile, validateFile, getFileCategory, formatFileSize } from '../lib/uploadFile';

const DEFAULT_ACCEPT = 'image/*,application/pdf,.doc,.docx,audio/*,video/mp4,video/webm';

export default function FileUpload({
  onUploadComplete,
  onClear,
  role = 'student',
  userId,
  existingFile = null,
  accept = DEFAULT_ACCEPT,
  label = 'Attach a file',
  compact = false,
}) {
  const [file,       setFile]       = useState(null);
  const [preview,    setPreview]    = useState(existingFile || null);
  const [uploading,  setUploading]  = useState(false);
  const [progress,   setProgress]   = useState(0);
  const [error,      setError]      = useState('');
  const [dragging,   setDragging]   = useState(false);
  const inputRef = useRef(null);

  const processFile = useCallback(async (selectedFile) => {
    const err = validateFile(selectedFile);
    if (err) { setError(err); return; }

    setFile(selectedFile);
    setError('');
    setUploading(true);
    setProgress(10);

    // Simulate progress for UX
    const interval = setInterval(() => {
      setProgress(p => Math.min(p + 15, 85));
    }, 200);

    try {
      const result = await uploadFile(selectedFile, { role, userId });
      clearInterval(interval);
      setProgress(100);
      setPreview({ url: result.url, fileName: result.fileName, fileType: result.fileType, size: result.size });
      onUploadComplete(result);
    } catch (err) {
      clearInterval(interval);
      setError(err.message);
      setProgress(0);
    } finally {
      setUploading(false);
    }
  }, [role, userId, onUploadComplete]);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) processFile(selected);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) processFile(dropped);
  };

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);

  const handleClear = () => {
    setFile(null);
    setPreview(null);
    setProgress(0);
    setError('');
    if (inputRef.current) inputRef.current.value = '';
    onClear?.();
  };

  // ── Already uploaded — show file card ─────────────────
  if (preview) {
    return (
      <FileCard
        url={preview.url}
        fileName={preview.fileName}
        fileType={preview.fileType}
        size={preview.size}
        onClear={handleClear}
        compact={compact}
      />
    );
  }

  // ── Upload zone ────────────────────────────────────────
  return (
    <div>
      {/* Drop zone */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          border:       `2px dashed ${dragging ? '#28b7d9' : error ? '#ef4444' : '#e2e8f0'}`,
          borderRadius: 10,
          padding:      compact ? '12px 16px' : '20px',
          background:   dragging ? 'rgba(40,183,217,0.05)' : '#fafbfc',
          cursor:       uploading ? 'wait' : 'pointer',
          transition:   'all 150ms ease',
          textAlign:    'center',
          display:      'flex',
          flexDirection: compact ? 'row' : 'column',
          alignItems:   'center',
          gap:          compact ? 10 : 8,
          justifyContent: compact ? 'flex-start' : 'center',
        }}
      >
        {/* Icon */}
        <div style={{ fontSize: compact ? 20 : 28, flexShrink: 0 }}>
          {uploading ? '⏳' : '📎'}
        </div>

        {uploading ? (
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#0e6e8a', marginBottom: 6 }}>
              Uploading… {progress}%
            </div>
            <div style={{ height: 4, borderRadius: 2, background: '#e2e8f0', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: '#28b7d9', borderRadius: 2, transition: 'width 200ms ease' }} />
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: compact ? 13 : 14, fontWeight: 700, color: '#0f172a' }}>{label}</div>
            {!compact && (
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                Drag and drop, or click to browse · Max 10 MB
              </div>
            )}
            {!compact && (
              <div style={{ fontSize: 11, color: '#cbd5e1', marginTop: 6 }}>
                Images · PDF · Word · Audio · Video
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{ marginTop: 6, fontSize: 12, color: '#ef4444', fontWeight: 600 }}>
          ⚠️ {error}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
}


// ─────────────────────────────────────────────────────────
// FileCard — shows uploaded file with preview + remove button
// ─────────────────────────────────────────────────────────
export function FileCard({ url, fileName, fileType, size, onClear, compact = false }) {
  const category = getFileCategory(fileType);
  const [showPreview, setShowPreview] = useState(false);

  const icons = { image: '🖼️', pdf: '📄', audio: '🎵', video: '🎬', document: '📝', file: '📎' };
  const icon  = icons[category] || icons.file;

  return (
    <div>
      {/* File row */}
      <div style={{
        display:      'flex',
        alignItems:   'center',
        gap:          10,
        padding:      compact ? '8px 12px' : '12px 14px',
        borderRadius: 8,
        border:       '1px solid #e2e8f0',
        background:   '#f7f9fb',
      }}>
        <span style={{ fontSize: compact ? 18 : 22, flexShrink: 0 }}>{icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {fileName || 'Attached file'}
          </div>
          {size && (
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>
              {formatFileSize(size)}
            </div>
          )}
        </div>

        {/* Preview toggle */}
        {['image', 'pdf', 'audio', 'video'].includes(category) && (
          <button
            onClick={() => setShowPreview(p => !p)}
            style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #28b7d9', background: 'rgba(40,183,217,0.08)', color: '#0e6e8a', fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}
          >
            {showPreview ? 'Hide' : 'Preview'}
          </button>
        )}

        {/* Open in new tab */}
        <a href={url} target="_blank" rel="noreferrer"
          style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontSize: 12, fontWeight: 600, cursor: 'pointer', textDecoration: 'none', flexShrink: 0 }}>
          Open ↗
        </a>

        {/* Remove */}
        {onClear && (
          <button
            onClick={onClear}
            style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid #fecaca', background: '#fff5f5', color: '#ef4444', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            title="Remove file"
          >
            ✕
          </button>
        )}
      </div>

      {/* Inline preview */}
      {showPreview && (
        <FilePreviewInline url={url} fileType={fileType} fileName={fileName} category={category} />
      )}
    </div>
  );
}


// ─────────────────────────────────────────────────────────
// FilePreviewInline — renders preview below the FileCard
// ─────────────────────────────────────────────────────────
function FilePreviewInline({ url, fileType, fileName, category }) {
  return (
    <div style={{ marginTop: 8, borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0', background: '#f0f4f8' }}>
      {category === 'image' && (
        <img
          src={url}
          alt={fileName}
          style={{ display: 'block', maxWidth: '100%', maxHeight: 320, objectFit: 'contain', margin: '0 auto' }}
        />
      )}
      {category === 'pdf' && (
        <iframe
          src={url}
          title={fileName}
          style={{ width: '100%', height: 400, border: 'none', display: 'block' }}
        />
      )}
      {category === 'audio' && (
        <div style={{ padding: '16px 20px' }}>
          <audio controls style={{ width: '100%' }}>
            <source src={url} type={fileType} />
            Your browser does not support audio playback.
          </audio>
        </div>
      )}
      {category === 'video' && (
        <video controls style={{ width: '100%', maxHeight: 360, display: 'block', background: '#000' }}>
          <source src={url} type={fileType} />
          Your browser does not support video playback.
        </video>
      )}
    </div>
  );
}


// ─────────────────────────────────────────────────────────
// FilePreview — standalone read-only preview component
// Use this to display already-uploaded files (no remove button)
//
// Props:
//   url        — Supabase Storage public URL
//   fileName   — original filename
//   fileType   — MIME type
//   label      — optional section label
// ─────────────────────────────────────────────────────────
export function FilePreview({ url, fileName, fileType, label = 'Attachment' }) {
  if (!url) return null;
  const category = getFileCategory(fileType);

  return (
    <div style={{ marginTop: 12 }}>
      {label && (
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', marginBottom: 6 }}>
          {label}
        </div>
      )}
      <FileCard url={url} fileName={fileName} fileType={fileType} onClear={null} />
    </div>
  );
}