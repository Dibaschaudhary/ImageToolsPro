/**
 * Web Worker Helper for Heavy Image Processing Operations
 * Offloads CPU-bound pixel loops (e.g. Gaussian Blur, Thresholding) off the main thread.
 */

export interface WorkerFilterMessage {
  type: 'BLUR' | 'THRESHOLD' | 'GRAYSCALE';
  imageData: ImageData;
  radius?: number;
  thresholdValue?: number;
}

/**
 * Creates an inline Web Worker from a string function to avoid external file loading issues
 */
function createInlineWorker(): Worker {
  const workerCode = `
    self.onmessage = function(e) {
      const { type, imageData, radius, thresholdValue } = e.data;
      const data = imageData.data;
      const width = imageData.width;
      const height = imageData.height;

      if (type === 'BLUR') {
        const rad = Math.max(1, Math.round(radius || 5));
        const copy = new Uint8ClampedArray(data);
        
        // Simple fast box blur pass
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            let r = 0, g = 0, b = 0, a = 0, count = 0;
            for (let dy = -rad; dy <= rad; dy += 2) {
              const ny = y + dy;
              if (ny >= 0 && ny < height) {
                for (let dx = -rad; dx <= rad; dx += 2) {
                  const nx = x + dx;
                  if (nx >= 0 && nx < width) {
                    const idx = (ny * width + nx) * 4;
                    r += copy[idx];
                    g += copy[idx + 1];
                    b += copy[idx + 2];
                    a += copy[idx + 3];
                    count++;
                  }
                }
              }
            }
            const i = (y * width + x) * 4;
            data[i] = r / count;
            data[i + 1] = g / count;
            data[i + 2] = b / count;
            data[i + 3] = a / count;
          }
        }
      } else if (type === 'THRESHOLD') {
        const thresh = thresholdValue ?? 128;
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          const val = avg >= thresh ? 255 : 0;
          data[i] = val;
          data[i + 1] = val;
          data[i + 2] = val;
        }
      }

      // Post back updated ImageData using zero-copy Transferable ArrayBuffer
      self.postMessage({ imageData }, [imageData.data.buffer]);
    };
  `;

  const blob = new Blob([workerCode], { type: 'application/javascript' });
  return new Worker(URL.createObjectURL(blob));
}

let workerInstance: Worker | null = null;

export function processImageWithWorker(
  imageData: ImageData,
  type: 'BLUR' | 'THRESHOLD' | 'GRAYSCALE',
  options?: { radius?: number; thresholdValue?: number }
): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    try {
      if (!workerInstance) {
        workerInstance = createInlineWorker();
      }

      const handleMessage = (e: MessageEvent) => {
        workerInstance?.removeEventListener('message', handleMessage);
        workerInstance?.removeEventListener('error', handleError);
        resolve(e.data.imageData);
      };

      const handleError = (err: ErrorEvent) => {
        workerInstance?.removeEventListener('message', handleMessage);
        workerInstance?.removeEventListener('error', handleError);
        reject(err);
      };

      workerInstance.addEventListener('message', handleMessage);
      workerInstance.addEventListener('error', handleError);

      // Transfer ArrayBuffer to worker thread with zero memory copies
      workerInstance.postMessage(
        {
          type,
          imageData,
          radius: options?.radius,
          thresholdValue: options?.thresholdValue,
        },
        [imageData.data.buffer]
      );
    } catch (err) {
      reject(err);
    }
  });
}
