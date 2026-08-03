import { ImageDimensionsInfo, ColorInfo } from '../types';

/**
 * Reads a File object into an HTMLImageElement
 */
export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(new Error('Failed to load image from file.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Reads a Data URL or Base64 string into an HTMLImageElement
 */
export function loadImageFromDataUrl(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Invalid image Data URI or string.'));
    img.src = dataUrl;
  });
}

/**
 * Format bytes to readable string (e.g. 1.25 MB)
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Convert canvas to Blob/DataURL helper with format fallback
 */
export function canvasToDataUrl(
  canvas: HTMLCanvasElement,
  format: 'png' | 'jpeg' | 'webp' = 'png',
  quality: number = 0.92
): string {
  const mimeType = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
  return canvas.toDataURL(mimeType, quality);
}

/**
 * Get approximate byte size of a Data URL string
 */
export function getDataUrlByteSize(dataUrl: string): number {
  if (!dataUrl) return 0;
  const head = 'data:image/';
  const base64Pos = dataUrl.indexOf(';base64,');
  if (base64Pos === -1) return 0;
  const base64Str = dataUrl.substring(base64Pos + 8);
  const padding = (base64Str.match(/=/g) || []).length;
  return Math.floor((base64Str.length * 3) / 4 - padding);
}

/**
 * 1. Image Compressor
 */
export async function compressImage(
  img: HTMLImageElement,
  quality: number = 0.8, // 0.1 to 1.0
  maxWidth?: number,
  maxHeight?: number,
  format: 'png' | 'jpeg' | 'webp' = 'jpeg'
): Promise<{ dataUrl: string; bytes: number; width: number; height: number }> {
  let width = img.naturalWidth;
  let height = img.naturalHeight;

  if (maxWidth && width > maxWidth) {
    height = Math.round((height * maxWidth) / width);
    width = maxWidth;
  }
  if (maxHeight && height > maxHeight) {
    width = Math.round((width * maxHeight) / height);
    height = maxHeight;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Fill white background for JPEG compression
  if (format === 'jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
  }

  ctx.drawImage(img, 0, 0, width, height);
  const dataUrl = canvasToDataUrl(canvas, format, quality);
  const bytes = getDataUrlByteSize(dataUrl);

  return { dataUrl, bytes, width, height };
}

/**
 * 2. Image Resizer
 */
export async function resizeImage(
  img: HTMLImageElement,
  targetWidth: number,
  targetHeight: number,
  format: 'png' | 'jpeg' | 'webp' = 'png',
  quality: number = 0.92,
  smooth: boolean = true
): Promise<{ dataUrl: string; bytes: number }> {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, targetWidth);
  canvas.height = Math.max(1, targetHeight);
  const ctx = canvas.getContext('2d')!;

  ctx.imageSmoothingEnabled = smooth;
  ctx.imageSmoothingQuality = 'high';

  if (format === 'jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const dataUrl = canvasToDataUrl(canvas, format, quality);
  const bytes = getDataUrlByteSize(dataUrl);

  return { dataUrl, bytes };
}

/**
 * 3. Crop Image
 */
export async function cropImage(
  img: HTMLImageElement,
  cropX: number,
  cropY: number,
  cropWidth: number,
  cropHeight: number,
  format: 'png' | 'jpeg' | 'webp' = 'png',
  quality: number = 0.95
): Promise<{ dataUrl: string; bytes: number }> {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, cropWidth);
  canvas.height = Math.max(1, cropHeight);
  const ctx = canvas.getContext('2d')!;

  if (format === 'jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(
    img,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    canvas.width,
    canvas.height
  );

  const dataUrl = canvasToDataUrl(canvas, format, quality);
  const bytes = getDataUrlByteSize(dataUrl);
  return { dataUrl, bytes };
}

/**
 * 4. Rotate Image
 */
export async function rotateImage(
  img: HTMLImageElement,
  angleDegrees: number, // e.g. 90, 180, 270 or arbitrary
  bgColor: string = '#FFFFFF',
  format: 'png' | 'jpeg' | 'webp' = 'png',
  quality: number = 0.95
): Promise<{ dataUrl: string; bytes: number; width: number; height: number }> {
  const radians = (angleDegrees * Math.PI) / 180;
  const sin = Math.abs(Math.sin(radians));
  const cos = Math.abs(Math.cos(radians));

  const origWidth = img.naturalWidth;
  const origHeight = img.naturalHeight;

  const newWidth = Math.round(origWidth * cos + origHeight * sin);
  const newHeight = Math.round(origWidth * sin + origHeight * cos);

  const canvas = document.createElement('canvas');
  canvas.width = newWidth;
  canvas.height = newHeight;
  const ctx = canvas.getContext('2d')!;

  if (format === 'jpeg' || bgColor !== 'transparent') {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, newWidth, newHeight);
  }

  ctx.translate(newWidth / 2, newHeight / 2);
  ctx.rotate(radians);
  ctx.drawImage(img, -origWidth / 2, -origHeight / 2);

  const dataUrl = canvasToDataUrl(canvas, format, quality);
  const bytes = getDataUrlByteSize(dataUrl);
  return { dataUrl, bytes, width: newWidth, height: newHeight };
}

/**
 * 5. Flip Image
 */
export async function flipImage(
  img: HTMLImageElement,
  flipHorizontal: boolean,
  flipVertical: boolean,
  format: 'png' | 'jpeg' | 'webp' = 'png',
  quality: number = 0.95
): Promise<{ dataUrl: string; bytes: number }> {
  const width = img.naturalWidth;
  const height = img.naturalHeight;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  if (format === 'jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
  }

  ctx.save();
  ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);
  ctx.drawImage(
    img,
    flipHorizontal ? -width : 0,
    flipVertical ? -height : 0,
    width,
    height
  );
  ctx.restore();

  const dataUrl = canvasToDataUrl(canvas, format, quality);
  const bytes = getDataUrlByteSize(dataUrl);
  return { dataUrl, bytes };
}

/**
 * 6, 7, 8, 9. Format Converter (JPG to PNG, PNG to JPG, WebP to PNG, PNG to WebP)
 */
export async function convertImageFormat(
  img: HTMLImageElement,
  targetFormat: 'png' | 'jpeg' | 'webp',
  bgColor: string = '#FFFFFF',
  quality: number = 0.92
): Promise<{ dataUrl: string; bytes: number; format: string }> {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d')!;

  if (targetFormat === 'jpeg') {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0);
  const dataUrl = canvasToDataUrl(canvas, targetFormat, quality);
  const bytes = getDataUrlByteSize(dataUrl);

  return { dataUrl, bytes, format: targetFormat };
}

/**
 * 10. Quality Adjuster
 */
export async function adjustImageQuality(
  img: HTMLImageElement,
  quality: number, // 0.05 to 1.0
  format: 'jpeg' | 'webp' | 'png' = 'jpeg'
): Promise<{ dataUrl: string; bytes: number }> {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d')!;

  if (format === 'jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0);
  const dataUrl = canvasToDataUrl(canvas, format, quality);
  const bytes = getDataUrlByteSize(dataUrl);
  return { dataUrl, bytes };
}

/**
 * 11. Add Watermark
 */
export interface WatermarkOptions {
  type: 'text' | 'image';
  text?: string;
  fontSize?: number; // relative px
  textColor?: string;
  textBgColor?: string;
  opacity?: number; // 0 to 1
  position?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'tiled';
  angleDegrees?: number;
  watermarkImage?: HTMLImageElement;
  watermarkScale?: number; // 0.1 to 1.0
}

export async function addWatermarkToImage(
  img: HTMLImageElement,
  options: WatermarkOptions,
  format: 'png' | 'jpeg' | 'webp' = 'png',
  quality: number = 0.95
): Promise<{ dataUrl: string; bytes: number }> {
  const width = img.naturalWidth;
  const height = img.naturalHeight;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  ctx.drawImage(img, 0, 0);

  ctx.save();
  ctx.globalAlpha = options.opacity ?? 0.7;

  if (options.type === 'text' && options.text) {
    const fontSize = Math.max(12, options.fontSize || Math.round(width / 20));
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.fillStyle = options.textColor || '#ffffff';
    ctx.textBaseline = 'middle';

    const textMetrics = ctx.measureText(options.text);
    const textWidth = textMetrics.width;
    const textHeight = fontSize * 1.2;

    const margin = Math.round(width * 0.04);

    const drawSingleText = (x: number, y: number) => {
      ctx.save();
      ctx.translate(x, y);
      if (options.angleDegrees) {
        ctx.rotate((options.angleDegrees * Math.PI) / 180);
      }
      if (options.textBgColor && options.textBgColor !== 'transparent') {
        ctx.fillStyle = options.textBgColor;
        ctx.fillRect(-textWidth / 2 - 8, -textHeight / 2, textWidth + 16, textHeight);
        ctx.fillStyle = options.textColor || '#ffffff';
      }
      ctx.fillText(options.text!, -textWidth / 2, 0);
      ctx.restore();
    };

    const pos = options.position || 'bottom-right';

    if (pos === 'tiled') {
      const stepX = textWidth + fontSize * 3;
      const stepY = textHeight + fontSize * 3;
      for (let x = 0; x < width + stepX; x += stepX) {
        for (let y = 0; y < height + stepY; y += stepY) {
          drawSingleText(x, y);
        }
      }
    } else if (pos === 'center') {
      drawSingleText(width / 2, height / 2);
    } else if (pos === 'top-left') {
      drawSingleText(margin + textWidth / 2, margin + textHeight / 2);
    } else if (pos === 'top-right') {
      drawSingleText(width - margin - textWidth / 2, margin + textHeight / 2);
    } else if (pos === 'bottom-left') {
      drawSingleText(margin + textWidth / 2, height - margin - textHeight / 2);
    } else {
      // bottom-right
      drawSingleText(width - margin - textWidth / 2, height - margin - textHeight / 2);
    }
  } else if (options.type === 'image' && options.watermarkImage) {
    const wImg = options.watermarkImage;
    const scale = options.watermarkScale || 0.25;
    const wWidth = Math.round(width * scale);
    const wHeight = Math.round((wImg.naturalHeight * wWidth) / wImg.naturalWidth);
    const margin = Math.round(width * 0.04);

    let x = width - wWidth - margin;
    let y = height - wHeight - margin;

    const pos = options.position || 'bottom-right';
    if (pos === 'center') {
      x = (width - wWidth) / 2;
      y = (height - wHeight) / 2;
    } else if (pos === 'top-left') {
      x = margin;
      y = margin;
    } else if (pos === 'top-right') {
      x = width - wWidth - margin;
      y = margin;
    } else if (pos === 'bottom-left') {
      x = margin;
      y = height - wHeight - margin;
    }

    ctx.drawImage(wImg, x, y, wWidth, wHeight);
  }

  ctx.restore();

  const dataUrl = canvasToDataUrl(canvas, format, quality);
  const bytes = getDataUrlByteSize(dataUrl);
  return { dataUrl, bytes };
}

/**
 * 12. Blur Image
 */
export async function blurImage(
  img: HTMLImageElement,
  blurRadiusPx: number = 10,
  format: 'png' | 'jpeg' | 'webp' = 'png',
  quality: number = 0.95
): Promise<{ dataUrl: string; bytes: number }> {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d')!;

  ctx.filter = `blur(${Math.max(0, blurRadiusPx)}px)`;
  ctx.drawImage(img, 0, 0);

  const dataUrl = canvasToDataUrl(canvas, format, quality);
  const bytes = getDataUrlByteSize(dataUrl);
  return { dataUrl, bytes };
}

/**
 * 13, 14, 15, 16. Color & Filter Adjustments (Brightness, Contrast, Saturation, Grayscale, Sepia)
 */
export interface ColorFilterOptions {
  brightness: number; // -100 to 100 (default 0)
  contrast: number; // -100 to 100 (default 0)
  saturation: number; // -100 to 100 (default 0)
  grayscale: number; // 0 to 100 (default 0)
  sepia: number; // 0 to 100 (default 0)
  hueRotate: number; // 0 to 360 (default 0)
  invert: number; // 0 to 100 (default 0)
}

export async function adjustImageFilters(
  img: HTMLImageElement,
  filters: Partial<ColorFilterOptions>,
  format: 'png' | 'jpeg' | 'webp' = 'png',
  quality: number = 0.95
): Promise<{ dataUrl: string; bytes: number }> {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d')!;

  const b = 100 + (filters.brightness ?? 0);
  const c = 100 + (filters.contrast ?? 0);
  const s = 100 + (filters.saturation ?? 0);
  const g = filters.grayscale ?? 0;
  const sep = filters.sepia ?? 0;
  const hue = filters.hueRotate ?? 0;
  const inv = filters.invert ?? 0;

  ctx.filter = `brightness(${b}%) contrast(${c}%) saturate(${s}%) grayscale(${g}%) sepia(${sep}%) hue-rotate(${hue}deg) invert(${inv}%)`;

  if (format === 'jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0);

  const dataUrl = canvasToDataUrl(canvas, format, quality);
  const bytes = getDataUrlByteSize(dataUrl);
  return { dataUrl, bytes };
}

/**
 * 17. Image to Base64
 */
export async function convertImageToBase64(file: File): Promise<{
  dataUrl: string;
  pureBase64: string;
  htmlSnippet: string;
  cssSnippet: string;
  fileSizeBytes: number;
  mimeType: string;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const base64Pos = dataUrl.indexOf(';base64,');
      const pureBase64 = base64Pos !== -1 ? dataUrl.substring(base64Pos + 8) : '';
      const mimeType = file.type || 'image/png';

      const htmlSnippet = `<img src="${dataUrl}" alt="${file.name}" />`;
      const cssSnippet = `background-image: url('${dataUrl}');`;

      resolve({
        dataUrl,
        pureBase64,
        htmlSnippet,
        cssSnippet,
        fileSizeBytes: file.size,
        mimeType,
      });
    };
    reader.onerror = (err) => reject(new Error('Failed to read file as Base64.'));
    reader.readAsDataURL(file);
  });
}

/**
 * 18. Base64 to Image
 */
export async function convertBase64ToImage(base64Input: string): Promise<{
  img: HTMLImageElement;
  dimensions: string;
  bytes: number;
  dataUrl: string;
}> {
  let formattedDataUrl = base64Input.trim();
  if (!formattedDataUrl.startsWith('data:image/')) {
    formattedDataUrl = `data:image/png;base64,${formattedDataUrl}`;
  }

  const img = await loadImageFromDataUrl(formattedDataUrl);
  const bytes = getDataUrlByteSize(formattedDataUrl);
  const dimensions = `${img.naturalWidth} x ${img.naturalHeight} px`;

  return { img, dimensions, bytes, dataUrl: formattedDataUrl };
}

/**
 * 19. Extract Image Dimensions & Color Palette Analysis
 */
export async function extractImageDetails(file: File): Promise<ImageDimensionsInfo> {
  const img = await loadImageFromFile(file);
  const width = img.naturalWidth;
  const height = img.naturalHeight;

  // Calculate GCD for clean aspect ratio representation
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const commonDivisor = gcd(width, height);
  const aspectW = Math.round(width / commonDivisor);
  const aspectH = Math.round(height / commonDivisor);
  const aspectRatio = `${aspectW}:${aspectH} (${(width / height).toFixed(2)})`;

  const megaPixels = ((width * height) / 1000000).toFixed(2) + ' MP';

  // Extract Dominant Palette via canvas sampling
  const canvas = document.createElement('canvas');
  const sampleSize = 100;
  canvas.width = sampleSize;
  canvas.height = sampleSize;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, sampleSize, sampleSize);

  const imgData = ctx.getImageData(0, 0, sampleSize, sampleSize).data;
  const colorMap: { [key: string]: number } = {};
  let totalPixels = 0;

  for (let i = 0; i < imgData.length; i += 16) { // step sample for speed
    const r = Math.round(imgData[i] / 32) * 32;
    const g = Math.round(imgData[i + 1] / 32) * 32;
    const b = Math.round(imgData[i + 2] / 32) * 32;
    const a = imgData[i + 3];

    if (a < 128) continue; // skip transparent

    const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
    colorMap[hex] = (colorMap[hex] || 0) + 1;
    totalPixels++;
  }

  const sortedColors = Object.entries(colorMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const dominantColors: ColorInfo[] = sortedColors.map(([hex, count]) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return {
      hex,
      rgb: `rgb(${r}, ${g}, ${b})`,
      percentage: Math.round((count / Math.max(1, totalPixels)) * 100),
    };
  });

  return {
    width,
    height,
    aspectRatio,
    fileSizeFormatted: formatBytes(file.size),
    fileSizeBytes: file.size,
    mimeType: file.type || 'image/unknown',
    fileName: file.name,
    megaPixels,
    colorDepth: '24-bit TrueColor',
    dominantColors,
  };
}

/**
 * Trigger browser file download
 */
export function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
