"use client";

import { useRef, useState } from "react";

interface ImagePickerProps {
  initialUrl?: string;
  error?: string;
  onFileSelected: (file: File | null) => void;
}

export default function ImagePicker({ initialUrl, error, onFileSelected }: ImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(initialUrl ?? null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    onFileSelected(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleChange}
      />

      {preview ? (
        <div className="overflow-hidden rounded-2xl ring-1 ring-slate-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="תצוגה מקדימה של הליקוי" className="max-h-72 w-full object-contain bg-slate-50" />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="block w-full bg-slate-100 py-3 text-center text-base font-semibold text-brand-700 active:bg-slate-200"
          >
            החלפת תמונה
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`flex h-40 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed text-brand-700 active:bg-brand-50 ${
            error ? "border-red-400 bg-red-50" : "border-brand-300 bg-brand-50/40"
          }`}
        >
          <span className="text-4xl">📷</span>
          <span className="text-base font-semibold">צילום או העלאת תמונה</span>
        </button>
      )}

      {error && <p className="mt-1 text-sm font-medium text-red-600">{error}</p>}
    </div>
  );
}
