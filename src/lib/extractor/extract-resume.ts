import * as pdfjs from 'pdfjs-dist';
import mammoth from 'mammoth';
import JSZip from 'jszip';
import { createWorker } from 'tesseract.js';

export type ExtractionProgress = (percent: number, message: string) => void;
export type ExtractionResult = { text: string; source: 'text' | 'ocr' | 'mixed' };

if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

function cleanText(text: string): string {
  return text
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

async function runOcr(
  image: HTMLCanvasElement | HTMLImageElement | File | Blob,
  onProgress?: ExtractionProgress,
): Promise<string> {
  let worker: any = null;
  try {
    // Attempt local assets first (instant & offline)
    worker = await createWorker('eng', 1, {
      workerPath: '/tesseract/worker.min.js',
      corePath: '/tesseract',
      langPath: '/tesseract',
      gzip: false,
      logger: (event) => {
        if (event.status === 'recognizing text') {
          const percent = Math.round((event.progress || 0) * 100);
          onProgress?.(percent, `OCR reading image (${percent}%)`);
        } else if (event.status === 'loading tesseract core') {
          onProgress?.(15, 'Initializing OCR engine…');
        } else if (event.status === 'loading language traineddata') {
          onProgress?.(30, 'Loading OCR language data…');
        }
      },
    });
  } catch (localErr) {
    console.warn('Local OCR worker initialization failed, attempting fallback worker:', localErr);
    worker = await createWorker('eng', 1, {
      logger: (event) => {
        if (event.status === 'recognizing text') {
          const percent = Math.round((event.progress || 0) * 100);
          onProgress?.(percent, `OCR reading image (${percent}%)`);
        }
      },
    });
  }

  try {
    const result = await worker.recognize(image);
    return result.data.text;
  } finally {
    if (worker) {
      await worker.terminate().catch(() => {});
    }
  }
}

async function extractPdf(file: File, onProgress?: ExtractionProgress): Promise<ExtractionResult> {
  const bytes = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(bytes) });
  const pdfDocument = await loadingTask.promise;
  const pages: string[] = [];
  let ocrUsed = false;

  for (let index = 1; index <= pdfDocument.numPages; index += 1) {
    onProgress?.(Math.round(((index - 1) / pdfDocument.numPages) * 88), `Reading page ${index} of ${pdfDocument.numPages}`);
    const page = await pdfDocument.getPage(index);
    const content = await page.getTextContent();
    const rows: Array<{ y: number; height: number; parts: Array<{ x: number; text: string }> }> = [];
    for (const item of content.items) {
      if (!('str' in item) || !('transform' in item) || !item.str.trim()) continue;
      const transform = item.transform as number[];
      const x = transform[4] ?? 0;
      const y = transform[5] ?? 0;
      const height = Math.abs(transform[3] ?? 0);
      let row = rows.find((candidate) => Math.abs(candidate.y - y) <= 2.5);
      if (!row) {
        row = { y, height, parts: [] };
        rows.push(row);
      }
      row.height = Math.max(row.height, height);
      row.parts.push({ x, text: item.str });
    }
    const orderedRows = rows.sort((a, b) => b.y - a.y);
    const selectable = orderedRows
      .map((row, rowIndex) => {
        const text = row.parts.sort((a, b) => a.x - b.x).map((part) => part.text).join(' ').trim();
        const previousRow = orderedRows[rowIndex - 1];
        const gap = previousRow ? previousRow.y - row.y : 0;
        const separateSection = previousRow && gap > Math.max(previousRow.height, row.height, 1) * 1.7;
        return `${separateSection ? '\n' : ''}${text}`;
      })
      .join('\n')
      .trim();
    if (selectable.replace(/\s/g, '').length >= 28) {
      pages.push(selectable);
      continue;
    }

    const viewport = page.getViewport({ scale: 1.7 });
    const canvas = globalThis.document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) throw new Error('This browser could not prepare the page for text recognition.');
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    await page.render({ canvas, canvasContext: context, viewport }).promise;
    const ocrText = await runOcr(canvas, (percent) => {
      if (percent > 0) onProgress?.(Math.min(95, Math.round(((index - 1 + percent / 100) / pdfDocument.numPages) * 90)), `Recognizing page ${index} of ${pdfDocument.numPages}`);
    });
    pages.push(ocrText);
    ocrUsed = true;
    canvas.width = 0;
    canvas.height = 0;
  }
  await loadingTask.destroy();
  return { text: cleanText(pages.join('\n\n')), source: ocrUsed ? (pages.some((page) => page.trim()) ? 'mixed' : 'ocr') : 'text' };
}

async function extractDocx(file: File): Promise<ExtractionResult> {
  const extractFn = (mammoth as any).extractRawText || (mammoth as any).default?.extractRawText || mammoth;
  const result = await extractFn({ arrayBuffer: await file.arrayBuffer() });
  return { text: cleanText(result.value), source: 'text' };
}

async function extractPptx(file: File): Promise<ExtractionResult> {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const slides = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
    .sort((a, b) => Number(a.match(/slide(\d+)/i)?.[1]) - Number(b.match(/slide(\d+)/i)?.[1]));
  if (!slides.length) throw new Error('No readable slides were found in this presentation.');
  const slideText: string[] = [];
  for (let i = 0; i < slides.length; i += 1) {
    const xml = await zip.file(slides[i])?.async('text');
    if (!xml) continue;
    const parsed = new DOMParser().parseFromString(xml, 'application/xml');
    const paragraphs = Array.from(parsed.getElementsByTagName('a:p')).map((paragraph) =>
      Array.from(paragraph.getElementsByTagName('a:t')).map((node) => node.textContent ?? '').join(''),
    );
    const text = paragraphs.map((paragraph) => paragraph.trim()).filter(Boolean).join('\n');
    if (text) slideText.push(`Slide ${i + 1}\n${text}`);
  }
  return { text: cleanText(slideText.join('\n\n')), source: 'text' };
}

async function prepareImageCanvas(file: File): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        try {
          let width = img.naturalWidth || img.width || 1200;
          let height = img.naturalHeight || img.height || 1600;

          // Limit maximum dimension to 2400 to prevent Web Worker out-of-memory crash on large photos
          const maxDim = 2400;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          // If low-res screenshot (< 1000px), upscale 1.5x for sharper character recognition
          if (width < 1000 && height < 1000) {
            width = Math.round(width * 1.5);
            height = Math.round(height * 1.5);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas 2D context not available.'));
            return;
          }

          // CRITICAL: Fill with pure solid white background (#FFFFFF)
          // Transparent PNGs with black text otherwise render black-on-black, causing OCR to detect 0 words!
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);

          // Draw the loaded image onto the canvas
          ctx.drawImage(img, 0, 0, width, height);

          resolve(canvas);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image format.'));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read image file data.'));
    reader.readAsDataURL(file);
  });
}

export async function extractImage(file: File, onProgress?: ExtractionProgress): Promise<ExtractionResult> {
  onProgress?.(15, 'Preparing image for OCR recognition…');
  let text = '';
  try {
    const canvas = await prepareImageCanvas(file);
    text = await runOcr(canvas, onProgress);
  } catch (canvasErr) {
    console.warn('Canvas preparation failed, attempting direct file OCR:', canvasErr);
    text = await runOcr(file, onProgress);
  }

  return { text: cleanText(text), source: 'ocr' };
}

// Backwards compatibility alias
export const extractPng = extractImage;

export function isSupportedResumeFile(file: File): boolean {
  return /\.(pdf|docx|doc|pptx|ppt|png|jpe?g|webp|bmp|tiff?)$/i.test(file.name)
    || /^image\//i.test(file.type)
    || file.type === 'application/pdf'
    || file.type.includes('word')
    || file.type.includes('presentation');
}

export async function extractFileText(file: File, onProgress?: ExtractionProgress): Promise<ExtractionResult> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  const mimeType = file.type?.toLowerCase() || '';

  onProgress?.(5, 'Opening document locally');

  if (extension === 'pdf' || mimeType === 'application/pdf') {
    return extractPdf(file, onProgress);
  }

  if (extension === 'docx' || extension === 'doc' || mimeType.includes('word')) {
    onProgress?.(35, 'Reading document paragraphs and tables');
    return extractDocx(file);
  }

  if (extension === 'pptx' || extension === 'ppt' || mimeType.includes('presentation')) {
    onProgress?.(35, 'Reading slide text');
    return extractPptx(file);
  }

  if (
    ['png', 'jpg', 'jpeg', 'webp', 'bmp', 'tif', 'tiff'].includes(extension || '')
    || mimeType.startsWith('image/')
  ) {
    return extractImage(file, onProgress);
  }

  throw new Error(`Unsupported file format (.${extension || 'unknown'}). Please upload a PDF, Word, PowerPoint, PNG, or JPG file.`);
}

const resumeSignals = [
  /\b(experience|employment|work history|professional history)\b/i,
  /\b(education|academic|degree|university|college)\b/i,
  /\b(skills|certifications?|projects|work experience|career summary)\b/i,
  /\b(resume|curriculum vitae|profile|objective)\b/i,
  /\b(achievements?|languages|references|portfolio)\b/i,
];

export function looksLikeResume(text: string): boolean {
  const normalized = text.trim();
  if (normalized.length < 90) return false;
  const hasContact = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(normalized)
    || /(?:\+?\d[\d\s().-]{7,}\d)/.test(normalized);
  const signalCount = resumeSignals.filter((signal) => signal.test(normalized)).length;
  const hasNameLikeHeading = /^[A-Z][A-Za-z.' -]{2,45}(?:\n|$)/m.test(normalized);
  return (hasContact && signalCount >= 1) || signalCount >= 3 || (hasNameLikeHeading && signalCount >= 2);
}
