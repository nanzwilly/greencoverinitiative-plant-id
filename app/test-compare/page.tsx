"use client";

import { useState, useCallback } from "react";
import ImageUpload from "@/components/ImageUpload";

interface PlantIdResult {
  name: string;
  scientific_name: string;
  confidence: number;
  description: string;
}

interface PlantNetResult {
  name: string;
  scientific_name: string;
  common_names: string[];
  confidence: number;
  family: string;
  genus: string;
  image_url: string;
}

/** Compress an image using canvas (same as identify page) */
function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const MAX = 800;
      let w = img.width;
      let h = img.height;
      if (w > MAX || h > MAX) {
        if (w > h) {
          h = Math.round((h * MAX) / w);
          w = MAX;
        } else {
          w = Math.round((w * MAX) / h);
          h = MAX;
        }
      }
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => {
          resolve(
            new File([blob!], file.name.replace(/\.\w+$/, ".jpg"), {
              type: "image/jpeg",
            })
          );
        },
        "image/jpeg",
        0.6
      );
    };
    img.src = URL.createObjectURL(file);
  });
}

export default function TestComparePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [plantIdResults, setPlantIdResults] = useState<PlantIdResult[] | null>(null);
  const [plantNetResults, setPlantNetResults] = useState<PlantNetResult[] | null>(null);
  const [plantIdError, setPlantIdError] = useState("");
  const [plantNetError, setPlantNetError] = useState("");
  const [plantIdTime, setPlantIdTime] = useState(0);
  const [plantNetTime, setPlantNetTime] = useState(0);

  const handleFilesChange = useCallback((newFiles: File[]) => {
    setFiles(newFiles);
    setPlantIdResults(null);
    setPlantNetResults(null);
    setPlantIdError("");
    setPlantNetError("");
  }, []);

  async function handleCompare() {
    if (files.length === 0) return;
    setLoading(true);
    setPlantIdResults(null);
    setPlantNetResults(null);
    setPlantIdError("");
    setPlantNetError("");

    // Compress images
    const compressed = await Promise.all(files.map(compressImage));

    // Build form data (same images for both)
    const formData = new FormData();
    for (const f of compressed) {
      formData.append("images", f);
    }

    // Call both APIs in parallel
    const plantIdPromise = (async () => {
      const start = Date.now();
      try {
        const res = await fetch("/api/identify", { method: "POST", body: formData });
        const elapsed = Date.now() - start;
        setPlantIdTime(elapsed);
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          setPlantIdError(data?.error || `Error ${res.status}`);
          return;
        }
        const data = await res.json();
        if (data.success) {
          setPlantIdResults(data.matches);
        } else {
          setPlantIdError(data.error || "Unknown error");
        }
      } catch (err) {
        setPlantIdTime(Date.now() - start);
        setPlantIdError(String(err));
      }
    })();

    // Build separate form data for PlantNet (needs its own FormData since fetch consumes it)
    const formData2 = new FormData();
    for (const f of compressed) {
      formData2.append("images", f);
    }

    const plantNetPromise = (async () => {
      const start = Date.now();
      try {
        const res = await fetch("/api/plantnet", { method: "POST", body: formData2 });
        const elapsed = Date.now() - start;
        setPlantNetTime(elapsed);
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          setPlantNetError(data?.error || `Error ${res.status}`);
          return;
        }
        const data = await res.json();
        if (data.success) {
          setPlantNetResults(data.results);
        } else {
          setPlantNetError(data.error || "Unknown error");
        }
      } catch (err) {
        setPlantNetTime(Date.now() - start);
        setPlantNetError(String(err));
      }
    })();

    await Promise.all([plantIdPromise, plantNetPromise]);
    setLoading(false);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-[#303030] mb-1">
        🧪 API Comparison Test
      </h1>
      <p className="text-gray-500 text-sm mb-6">
        Upload a plant photo to compare results from <strong>Plant.id</strong> vs <strong>Pl@ntNet</strong> side by side.
      </p>

      <div className="mb-6">
        <ImageUpload maxFiles={1} onFilesChange={handleFilesChange} />
      </div>

      <button
        onClick={handleCompare}
        disabled={files.length === 0 || loading}
        className="bg-[#0a6b14] text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-[#085a10] transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "⏳ Identifying..." : "🔍 Compare Both APIs"}
      </button>

      {/* Results side by side */}
      {(plantIdResults || plantNetResults || plantIdError || plantNetError) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Plant.id results */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#0a6b14] uppercase tracking-wide">
                Plant.id
              </h2>
              {plantIdTime > 0 && (
                <span className="text-xs text-gray-400">{(plantIdTime / 1000).toFixed(1)}s</span>
              )}
            </div>

            {plantIdError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {plantIdError}
              </div>
            )}

            {plantIdResults && plantIdResults.length === 0 && (
              <p className="text-gray-400 text-sm">No plant detected in image.</p>
            )}

            {plantIdResults &&
              plantIdResults.map((m, i) => (
                <div
                  key={i}
                  className={`py-3 ${i > 0 ? "border-t border-gray-100" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#303030]">
                      {i + 1}. {m.name}
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        m.confidence > 0.7
                          ? "text-green-600"
                          : m.confidence > 0.4
                          ? "text-yellow-600"
                          : "text-red-500"
                      }`}
                    >
                      {Math.round(m.confidence * 100)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 italic">
                    {m.scientific_name}
                  </p>
                  {m.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {m.description}
                    </p>
                  )}
                </div>
              ))}
          </div>

          {/* Pl@ntNet results */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#0a6b14] uppercase tracking-wide">
                Pl@ntNet
              </h2>
              {plantNetTime > 0 && (
                <span className="text-xs text-gray-400">{(plantNetTime / 1000).toFixed(1)}s</span>
              )}
            </div>

            {plantNetError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {plantNetError}
              </div>
            )}

            {plantNetResults && plantNetResults.length === 0 && (
              <p className="text-gray-400 text-sm">No plant detected in image.</p>
            )}

            {plantNetResults &&
              plantNetResults.map((m, i) => (
                <div
                  key={i}
                  className={`py-3 ${i > 0 ? "border-t border-gray-100" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#303030]">
                      {i + 1}. {m.name}
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        m.confidence > 0.7
                          ? "text-green-600"
                          : m.confidence > 0.4
                          ? "text-yellow-600"
                          : "text-red-500"
                      }`}
                    >
                      {Math.round(m.confidence * 100)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 italic">
                    {m.scientific_name}
                  </p>
                  {m.family && (
                    <p className="text-xs text-gray-500 mt-1">
                      Family: {m.family} · Genus: {m.genus}
                    </p>
                  )}
                  {m.common_names.length > 1 && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Also: {m.common_names.slice(1, 4).join(", ")}
                    </p>
                  )}
                  {m.image_url && (
                    <img
                      src={m.image_url}
                      alt={m.name}
                      className="w-16 h-16 object-cover rounded mt-2 border border-gray-200"
                    />
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-300 mt-8 text-center">
        This page is for testing only and will not be linked in the app.
      </p>
    </div>
  );
}
