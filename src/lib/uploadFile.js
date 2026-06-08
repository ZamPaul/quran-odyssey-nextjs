// ─────────────────────────────────────────────────────────
// FILE: src/lib/uploadFile.js  (frontend helper)
//
// Handles uploading a File object to Supabase Storage
// and returning the public URL + metadata.
//
// Bucket structure:
//   assignments/teacher/{teacherId}/{timestamp}_{filename}
//   submissions/student/{studentId}/{timestamp}_{filename}
// ─────────────────────────────────────────────────────────
 
import { supabase } from './supabaseClient';
 
const BUCKET = 'assignments';
 
// 10 MB limit
const MAX_SIZE_BYTES = 10 * 1024 * 1024;
 
// Allowed MIME types
const ALLOWED_TYPES = [
  // Images
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // Audio (for Quran recitation recordings)
  'audio/mpeg', 'audio/mp4', 'audio/ogg', 'audio/wav', 'audio/webm',
  // Video
  'video/mp4', 'video/webm',
];
 
export function validateFile(file) {
  if (!file) return 'No file selected';
  if (file.size > MAX_SIZE_BYTES) return `File too large. Maximum size is 10 MB.`;
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'File type not supported. Allowed: images, PDF, Word documents, audio, video.';
  }
  return null; // valid
}
 
export async function uploadFile(file, { role = 'student', userId }) {
  const validationError = validateFile(file);
  if (validationError) throw new Error(validationError);
 
  // Build a unique storage path
  const timestamp  = Date.now();
  const safeName   = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const folder     = role === 'teacher' ? 'teacher' : 'student';
  const path       = `${folder}/${userId}/${timestamp}_${safeName}`;
 
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert:       false,
    });
 
  if (error) {
    console.error('Supabase upload error:', error);
    throw new Error('Upload failed. Please try again.');
  }
 
  // Get the public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(data.path);
 
  return {
    url:      urlData.publicUrl,
    fileName: file.name,
    fileType: file.type,
    path:     data.path,
    size:     file.size,
  };
}
 
export function getFileCategory(mimeType) {
  if (!mimeType) return 'file';
  if (mimeType.startsWith('image/'))       return 'image';
  if (mimeType === 'application/pdf')      return 'pdf';
  if (mimeType.startsWith('audio/'))       return 'audio';
  if (mimeType.startsWith('video/'))       return 'video';
  return 'document';
}
 
export function formatFileSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}