import { useState, useRef } from 'react';
import { createWorker } from 'tesseract.js';
import { parseMRZ } from '../utils/mrzParser';

function compressImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxWidth = 1200;
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(resolve, 'image/jpeg', 0.7);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function PhotoCapture({ value, onChange, onOcrResult, labels }) {
  const [preview, setPreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanDone, setScanDone] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  async function runOCR(imageDataUrl) {
    setScanning(true);
    try {
      const worker = await createWorker('eng');
      const { data } = await worker.recognize(imageDataUrl);
      await worker.terminate();
      const result = parseMRZ(data.text);
      if (result && onOcrResult) {
        onOcrResult(result);
      }
      setScanDone(true);
      return result;
    } catch (err) {
      console.warn('OCR failed:', err);
      setScanDone(true);
      return null;
    } finally {
      setScanning(false);
    }
  }

  async function handleFile(file) {
    if (!file) return;
    const blob = await compressImage(file);
    const reader = new FileReader();
    reader.onload = async (e) => {
      setPreview(e.target.result);
      onChange(e.target.result);
      setScanDone(false);
      await runOCR(e.target.result);
    };
    reader.readAsDataURL(blob);
  }

  function handleRemove() {
    setPreview(null);
    setScanDone(false);
    onChange(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  }

  if (preview || value) {
    return (
      <div className="space-y-3">
        <img
          src={preview || value}
          alt="ID"
          className="w-full rounded-lg border border-gray-200 shadow-sm"
        />
        {scanning && (
          <div className="flex items-center gap-2 text-brand-600 text-sm font-medium">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {labels.scanning}
          </div>
        )}
        {scanDone && !scanning && (
          <p className="text-sm text-green-600 font-medium">{labels.photoTaken}</p>
        )}
        <button
          type="button"
          onClick={handleRemove}
          className="text-sm text-red-600 hover:underline"
        >
          {labels.removePhoto}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-brand-50 border-2 border-dashed border-brand-300 rounded-xl p-6 text-center">
      <svg className="w-12 h-12 text-brand-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <p className="text-sm text-brand-600 font-medium mb-4">{labels.idPhoto}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <label className="cursor-pointer inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 px-6 rounded-lg text-sm transition-colors shadow-sm">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {labels.takePhoto}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={e => handleFile(e.target.files[0])}
          />
        </label>
        <label className="cursor-pointer inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg text-sm transition-colors border border-gray-300 shadow-sm">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          {labels.uploadFile}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => handleFile(e.target.files[0])}
          />
        </label>
      </div>
    </div>
  );
}
