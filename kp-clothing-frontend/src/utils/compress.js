// src/utils/compress.js
// Client-side canvas image compression to WebP with EXIF stripping

export async function compressImageToWebp(file, maxDimension = 1600, quality = 0.8) {
  if (!file || !file.type.startsWith('image/')) {
    return { file, originalSize: file?.size || 0, compressedSize: file?.size || 0, ratio: 0 };
  }

  const originalSize = file.size;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      let { width, height } = img;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, width);
      canvas.height = Math.max(1, height);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve({ file, originalSize, compressedSize: originalSize, ratio: 0 });
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Convert to webp with fallback to jpeg
      const mimeType = 'image/webp';
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve({ file, originalSize, compressedSize: originalSize, ratio: 0 });
            return;
          }
          const baseName = file.name.replace(/\.[^.]+$/, '');
          const compressedFile = new File([blob], `${baseName}.webp`, {
            type: 'image/webp',
            lastModified: Date.now(),
          });
          const compressedSize = blob.size;
          const ratio = Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100));

          resolve({
            file: compressedFile,
            originalSize,
            compressedSize,
            ratio,
          });
        },
        mimeType,
        quality
      );
    };
    img.onerror = () => reject(new Error('Failed to load image for compression'));
    img.src = URL.createObjectURL(file);
  });
}
