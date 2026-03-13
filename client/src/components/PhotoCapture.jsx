import { useState, useRef } from 'react';

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

export default function PhotoCapture({ value, onChange, labels }) {
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  async function handleFile(file) {
    if (!file) return;
    const blob = await compressImage(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
      onChange(e.target.result);
    };
    reader.readAsDataURL(blob);
  }

  function handleRemove() {
    setPreview(null);
    onChange(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  }

  if (preview || value) {
    return (
      <div className="space-y-2">
        <img
          src={preview || value}
          alt="ID"
          className="w-full max-w-sm rounded-lg border border-gray-200"
        />
        <p className="text-sm text-green-600 font-medium">{labels.photoTaken}</p>
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
    <div className="flex gap-3">
      <label className="cursor-pointer inline-flex items-center gap-2 bg-brand-50 hover:bg-brand-100 text-brand-700 font-medium py-2.5 px-4 rounded-lg text-sm transition-colors border border-brand-200">
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
      <label className="cursor-pointer inline-flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium py-2.5 px-4 rounded-lg text-sm transition-colors border border-gray-300">
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
  );
}
