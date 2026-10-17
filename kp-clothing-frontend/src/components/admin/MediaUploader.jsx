import React, { useState } from 'react';
import { Upload, X, CheckCircle, AlertCircle, RefreshCw, Film, Image as ImageIcon } from 'lucide-react';
import * as api from '../../services/api.js';
import { compressImageToWebp } from '../../utils/compress.js';

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

const VIEW_SLOTS = [
  { key: 'FRONT', label: 'Front View (Primary)', icon: ImageIcon, req: true },
  { key: 'BACK', label: 'Back View (Pallu / Pleats)', icon: ImageIcon, req: false },
  { key: 'SIDE', label: 'Side View (Drape / Border)', icon: ImageIcon, req: false },
  { key: 'FABRIC', label: 'Fabric Close-up (Weave & Zari)', icon: ImageIcon, req: false },
];

export function MediaUploader({ media = [], onChange }) {
  const [uploadingSlot, setUploadingSlot] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [stats, setStats] = useState({});
  const [errorSlot, setErrorSlot] = useState(null);
  const [videoUrlInput, setVideoUrlInput] = useState(
    media.find((m) => m.type === 'VIDEO')?.url || ''
  );

  const getSlotMedia = (viewKey) => media.find((m) => m.view === viewKey && m.type === 'IMAGE');
  const getVideoMedia = () => media.find((m) => m.type === 'VIDEO');

  const handleImageFileChange = async (viewKey, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorSlot(null);
    setUploadingSlot(viewKey);
    setUploadProgress(20);

    try {
      // 1. Client-side canvas compression (1600px max side, webp 0.8, EXIF stripped)
      setUploadProgress(40);
      const { file: compressedFile, originalSize, compressedSize, ratio } = await compressImageToWebp(file, 1600, 0.8);

      setStats((prev) => ({
        ...prev,
        [viewKey]: { originalSize, compressedSize, ratio },
      }));

      setUploadProgress(60);

      // 2. Upload to server (presigned S3 or backend fallback)
      const uploadedUrl = await api.uploadImage(compressedFile, viewKey);
      setUploadProgress(100);

      // 3. Update parent media state
      const existingWithout = media.filter((m) => !(m.view === viewKey && m.type === 'IMAGE'));
      const newEntry = {
        url: uploadedUrl,
        type: 'IMAGE',
        view: viewKey,
        sortOrder: VIEW_SLOTS.findIndex((s) => s.key === viewKey),
      };
      onChange([...existingWithout, newEntry]);
    } catch (err) {
      console.error(`Upload error for slot ${viewKey}:`, err);
      setErrorSlot(viewKey);
    } finally {
      setUploadingSlot(null);
      e.target.value = '';
    }
  };

  const handleRemoveMedia = (viewKey) => {
    onChange(media.filter((m) => !(m.view === viewKey && m.type === 'IMAGE')));
    setStats((prev) => {
      const next = { ...prev };
      delete next[viewKey];
      return next;
    });
  };

  const handleVideoFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reject files > 50MB
    const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
    if (file.size > MAX_VIDEO_BYTES) {
      alert(`Video is too large (${formatBytes(file.size)}). Max allowed video size is 50 MB.`);
      e.target.value = '';
      return;
    }

    setUploadingSlot('VIDEO');
    setUploadProgress(30);

    try {
      const uploadedUrl = await api.uploadImage(file, 'VIDEO');
      setUploadProgress(100);

      const existingWithout = media.filter((m) => m.type !== 'VIDEO');
      onChange([
        ...existingWithout,
        {
          url: uploadedUrl,
          type: 'VIDEO',
          view: 'OTHER',
          sortOrder: 10,
        },
      ]);
      setVideoUrlInput(uploadedUrl);
    } catch (err) {
      console.error('Video upload error:', err);
      setErrorSlot('VIDEO');
    } finally {
      setUploadingSlot(null);
      e.target.value = '';
    }
  };

  const handleVideoUrlBlur = () => {
    const url = videoUrlInput.trim();
    const existingWithout = media.filter((m) => m.type !== 'VIDEO');
    if (url) {
      onChange([
        ...existingWithout,
        {
          url,
          type: 'VIDEO',
          view: 'OTHER',
          sortOrder: 10,
        },
      ]);
    } else {
      onChange(existingWithout);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: '#3d2b1f' }}>
          4-Perspective Saree Views (Auto-Compressed to WebP &lt; 500KB)
        </label>
        <p style={{ fontSize: 11, color: '#7a6858', margin: '0 0 10px 0' }}>
          Upload high-res photos. Each photo is compressed directly in your browser with EXIF stripped for instant load speed and Google SEO ranking.
        </p>
      </div>

      {/* 4 Image Perspective Slots Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
        {VIEW_SLOTS.map((slot) => {
          const current = getSlotMedia(slot.key);
          const isSlotUploading = uploadingSlot === slot.key;
          const isSlotError = errorSlot === slot.key;
          const stat = stats[slot.key];

          return (
            <div
              key={slot.key}
              style={{
                background: '#fff',
                border: current ? '2px solid #b8923a' : '1px dashed #c4b097',
                borderRadius: 8,
                padding: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                position: 'relative',
                minHeight: 140,
                justifyContent: 'center',
              }}
            >
              {current ? (
                <>
                  <div style={{ width: '100%', height: 90, borderRadius: 4, overflow: 'hidden', marginBottom: 6, position: 'relative' }}>
                    <img
                      src={current.url}
                      alt={slot.label}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveMedia(slot.key)}
                      style={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        background: 'rgba(153, 27, 27, 0.9)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        width: 20,
                        height: 20,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Remove image"
                    >
                      <X size={12} />
                    </button>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#3d2b1f' }}>{slot.label}</span>
                  {stat && (
                    <span style={{ fontSize: 10, color: '#2a6a3b', marginTop: 2 }}>
                      {formatBytes(stat.originalSize)} ➔ {formatBytes(stat.compressedSize)} ({stat.ratio}% smaller)
                    </span>
                  )}
                </>
              ) : (
                <>
                  {isSlotUploading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <RefreshCw size={20} className="spin" color="var(--gold)" />
                      <span style={{ fontSize: 11, color: '#7a6858' }}>Compressing...</span>
                    </div>
                  ) : (
                    <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: '100%' }}>
                      <Upload size={22} color="#a08b76" />
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#3d2b1f' }}>
                        {slot.label} {slot.req && '*'}
                      </span>
                      <span style={{ fontSize: 10, color: '#887463' }}>Click to upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handleImageFileChange(slot.key, e)}
                      />
                    </label>
                  )}

                  {isSlotError && (
                    <div style={{ marginTop: 4, color: '#b91c1c', fontSize: 10, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <AlertCircle size={10} /> Upload failed. Retry.
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Video Slot */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #d9c6a3',
          borderRadius: 8,
          padding: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Film size={18} color="var(--gold)" />
          <label style={{ fontSize: 12, fontWeight: 700, color: '#3d2b1f', margin: 0 }}>
            5th Perspective: Saree Flow Video (MP4 / WebM &le; 50MB or YouTube URL)
          </label>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <label
            className="btn o sm"
            style={{
              cursor: uploadingSlot === 'VIDEO' ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Upload size={14} />
            {uploadingSlot === 'VIDEO' ? 'Uploading Video...' : 'Upload Video File'}
            <input
              type="file"
              accept="video/mp4,video/webm"
              style={{ display: 'none' }}
              disabled={uploadingSlot === 'VIDEO'}
              onChange={handleVideoFileChange}
            />
          </label>

          <span style={{ fontSize: 12, color: '#7a6858' }}>or enter video URL:</span>

          <input
            type="url"
            placeholder="https://youtu.be/... or S3 video URL"
            value={videoUrlInput}
            onChange={(e) => setVideoUrlInput(e.target.value)}
            onBlur={handleVideoUrlBlur}
            style={{
              flex: '1 1 200px',
              padding: '6px 10px',
              border: '1px solid #d9c6a3',
              borderRadius: 6,
              fontSize: 13,
            }}
          />
        </div>

        {getVideoMedia()?.url && (
          <div style={{ marginTop: 8, fontSize: 11, color: '#2a6a3b', display: 'flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle size={13} /> Saree flow video attached ({getVideoMedia().url})
          </div>
        )}
      </div>
    </div>
  );
}
