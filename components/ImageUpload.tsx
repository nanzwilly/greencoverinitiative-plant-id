"use client";

import { useRef, useState, useCallback } from "react";

interface ImageUploadProps {
  maxFiles?: number;
  onFilesChange: (files: File[]) => void;
}

export default function ImageUpload({
  maxFiles = 5,
  onFilesChange,
}: ImageUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const updateFiles = useCallback(
    (newFiles: File[], newPreviews: string[]) => {
      setFiles(newFiles);
      setPreviews(newPreviews);
      onFilesChange(newFiles);
    },
    [onFilesChange]
  );

  function handleFiles(incoming: FileList | null) {
    if (!incoming) return;
    setSizeError(false);

    const imageFiles = Array.from(incoming).filter((f) =>
      f.type.startsWith("image/")
    );

    // Check file size (reject files over 10MB)
    const oversized = imageFiles.some((f) => f.size > MAX_FILE_SIZE);
    if (oversized) {
      setSizeError(true);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const allowed = imageFiles.slice(0, maxFiles - files.length);
    if (allowed.length === 0) return;

    const newPreviews = allowed.map((f) => URL.createObjectURL(f));
    const mergedFiles = [...files, ...allowed].slice(0, maxFiles);
    const mergedPreviews = [...previews, ...newPreviews].slice(0, maxFiles);

    updateFiles(mergedFiles, mergedPreviews);

    // Reset the input so the same file can be re-selected
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeImage(index: number) {
    URL.revokeObjectURL(previews[index]);
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    updateFiles(newFiles, newPreviews);
  }

  return (
    <div className="space-y-4">
      {/* Hide the upload box when maxFiles is 1 and an image is already uploaded */}
      {!(maxFiles === 1 && files.length >= maxFiles) && (
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
            dragOver
              ? "border-green-500 bg-green-50"
              : "border-gray-300 hover:border-green-400 hover:bg-green-50/50"
          } ${files.length >= maxFiles ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={() => {
            if (files.length < maxFiles) inputRef.current?.click();
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (files.length < maxFiles) handleFiles(e.dataTransfer.files);
          }}
        >
          <div className="text-4xl mb-2">📷</div>
          <p className="text-gray-600 font-medium">
            {maxFiles === 1
              ? "Drag & drop an image here, or click to select"
              : files.length >= maxFiles
                ? `Maximum ${maxFiles} images reached`
                : "Drag & drop images here, or click to select"}
          </p>
          {maxFiles > 1 ? (
            <p className="text-gray-400 text-sm mt-1">
              {files.length} / {maxFiles} images (JPEG, PNG, WebP)
            </p>
          ) : (
            <p className="text-gray-400 text-sm mt-1">JPEG, PNG, WebP</p>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      )}

      {sizeError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          Photo is too large (max 10MB). Please use a smaller photo.
        </div>
      )}

      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {previews.map((src, i) => (
            <div key={i} className="relative group">
              <img
                src={src}
                alt={`Upload preview ${i + 1}`}
                className="w-full h-28 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
