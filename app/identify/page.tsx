"use client";

import { useState, useEffect } from "react";
import ImageUpload from "@/components/ImageUpload";
import Button from "@/components/Button";
import Card from "@/components/Card";
import type { PlantMatch, HealthDiagnosis } from "@/types";

export default function IdentifyPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PlantMatch[] | null>(null);
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [healthDiagnoses, setHealthDiagnoses] = useState<
    HealthDiagnosis[] | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [limit, setLimit] = useState<number>(10);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);

  // Fetch remaining scans on load
  useEffect(() => {
    fetch("/api/identify")
      .then((r) => r.json())
      .then((data) => {
        setRemaining(data.remaining);
        setLimit(data.limit);
      })
      .catch(() => {});
  }, []);

  // Clear previous results when files change
  function handleFilesChange(newFiles: File[]) {
    setFiles(newFiles);
    // Clear old results and errors when user changes images
    if (results || error) {
      setResults(null);
      setHealthDiagnoses(null);
      setIsHealthy(null);
      setError(null);
    }
  }

  // Compress an image using canvas to stay within size limits
  function compressImage(file: File, maxWidth = 1024, quality = 0.7): Promise<File> {
    return new Promise((resolve) => {
      // If file is already small (<500KB), keep it as-is
      if (file.size < 500 * 1024) {
        resolve(file);
        return;
      }
      const img = new window.Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: "image/jpeg" }));
            } else {
              resolve(file);
            }
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(file);
      };
      img.src = url;
    });
  }

  async function handleSubmit() {
    if (files.length === 0) return;
    setLoading(true);
    setResults(null);
    setHealthDiagnoses(null);
    setIsHealthy(null);
    setError(null);

    try {
      // Compress images before uploading to stay within size limits
      const compressedFiles = await Promise.all(
        files.map((f) => compressImage(f))
      );

      const formData = new FormData();
      compressedFiles.forEach((f) => formData.append("images", f));

      const res = await fetch("/api/identify", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.remaining !== undefined) {
        setRemaining(data.remaining);
      }

      if (!data.success) {
        setError(data.error || "Identification failed.");
        return;
      }

      if (data.matches.length === 0) {
        setError(
          "No plant detected in the image. Please try a clearer photo of the plant."
        );
        return;
      }

      setResults(data.matches);
      setIsHealthy(data.is_healthy);
      setHealthDiagnoses(data.health_diagnoses || []);

      // Request location for nursery finder
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setUserLocation({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            });
            setLocationDenied(false);
          },
          () => {
            setLocationDenied(true);
          }
        );
      }
    } catch {
      setError("Something went wrong. The images may be too large — try using fewer or smaller photos.");
    } finally {
      setLoading(false);
    }
  }

  const hasResults = results && results.length > 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-green-800 mb-2">
        Identify a Plant
      </h1>
      <p className="text-gray-600 mb-4">
        Upload 1–5 images of a plant to identify it and check its health.
      </p>

      {remaining !== null && (
        <div className={`inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-full mb-6 ${
          remaining > 3
            ? "bg-green-50 text-green-700"
            : remaining > 0
              ? "bg-amber-50 text-amber-700"
              : "bg-red-50 text-red-700"
        }`}>
          <span className="font-semibold">{remaining}/{limit}</span> scans remaining today
        </div>
      )}

      <ImageUpload maxFiles={5} onFilesChange={handleFilesChange} />

      <div className="mt-6 flex items-center gap-4">
        <Button
          onClick={handleSubmit}
          disabled={files.length === 0 || loading}
          type="button"
        >
          {loading ? "Identifying…" : "Identify Plant"}
        </Button>
        {loading && (
          <span className="text-sm text-gray-500">
            Analyzing with AI — identification + health check...
          </span>
        )}
      </div>

      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ── Results: 2-column layout ────────────────────────── */}
      {hasResults && (
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ── LEFT: Identification (top 3) ─── */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Identification ({results.length} match
              {results.length !== 1 ? "es" : ""})
            </h2>
            <div className="space-y-4">
              {results.map((match, i) => (
                <Card key={i}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400">
                          #{i + 1}
                        </span>
                        <h3 className="text-lg font-bold text-green-700">
                          {match.name}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-500 italic">
                        {match.scientific_name}
                      </p>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                        {match.description}
                      </p>

                      {/* Similar images */}
                      {match.similar_images?.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-semibold text-gray-500 mb-1">
                            Similar reference images
                          </p>
                          <div className="flex gap-2">
                            {match.similar_images.map((img) => (
                              <img
                                key={img.id}
                                src={img.url}
                                alt="Similar plant"
                                className="w-16 h-16 object-cover rounded-md border border-gray-200"
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Care tips */}
                      <div className="mt-3 grid grid-cols-3 gap-1.5 text-xs">
                        <div className="bg-yellow-50 rounded-md p-2">
                          <span className="font-semibold text-yellow-700">
                            ☀️ Light
                          </span>
                          <br />
                          {match.care.light}
                        </div>
                        <div className="bg-blue-50 rounded-md p-2">
                          <span className="font-semibold text-blue-700">
                            💧 Water
                          </span>
                          <br />
                          {match.care.water}
                        </div>
                        <div className="bg-amber-50 rounded-md p-2">
                          <span className="font-semibold text-amber-700">
                            🪴 Soil
                          </span>
                          <br />
                          {match.care.soil}
                        </div>
                      </div>

                      {match.gci_url && (
                        <a
                          href={match.gci_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-3 text-sm text-green-600 hover:underline"
                        >
                          View on GreenCover Initiative →
                        </a>
                      )}
                    </div>

                    {/* Confidence badge */}
                    <div className="text-right shrink-0">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                          match.confidence >= 0.8
                            ? "bg-green-100 text-green-700"
                            : match.confidence >= 0.6
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {Math.round(match.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* ── RIGHT: Health Assessment + Where to Find ─── */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Health Assessment
            </h2>

            {/* Health status banner */}
            {isHealthy !== null && (
              <div
                className={`rounded-lg p-4 mb-4 flex items-center gap-3 ${
                  isHealthy
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                <span className="text-2xl">
                  {isHealthy ? "✅" : "⚠️"}
                </span>
                <div>
                  <p
                    className={`font-semibold ${isHealthy ? "text-green-700" : "text-red-700"}`}
                  >
                    {isHealthy
                      ? "Plant looks healthy!"
                      : "Potential issues detected"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {isHealthy
                      ? "No diseases or problems found."
                      : "See details below for diagnosis and treatment."}
                  </p>
                </div>
              </div>
            )}

            {/* Disease cards */}
            {healthDiagnoses && healthDiagnoses.length > 0 ? (
              <div className="space-y-4">
                {healthDiagnoses.map((d, i) => (
                  <Card key={i}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-red-700">
                          {d.condition}
                        </h3>
                        {d.cause && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            Cause: {d.cause}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                          {d.description}
                        </p>
                        <div className="mt-3 bg-green-50 rounded-md p-3">
                          <p className="text-xs font-semibold text-green-800 mb-1">
                            💊 Treatment
                          </p>
                          <p className="text-sm text-green-700 line-clamp-4">
                            {d.treatment}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                            d.confidence >= 0.5
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {Math.round(d.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-8">
                <div className="text-4xl mb-2">🌿</div>
                <p className="text-gray-500">
                  {isHealthy === true
                    ? "No issues found. Your plant appears to be in good condition."
                    : "No significant health issues detected. The plant appears to be mostly healthy."}
                </p>
              </Card>
            )}

            {/* ── Where to Find This Plant (inside right column) ─── */}
            <h2 className="text-xl font-semibold text-gray-800 mb-4 mt-8">
              Where to Find This Plant
            </h2>

            {/* Nearby Nurseries Map */}
            <Card>
              <h3 className="font-semibold text-[#303030] mb-3 text-sm">
                📍 Nearby Nurseries
              </h3>
              {userLocation ? (
                <div className="rounded-lg overflow-hidden border border-gray-200">
                  <iframe
                    title="Nearby plant nurseries"
                    width="100%"
                    height="250"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://maps.google.com/maps?q=plant+nurseries&ll=${userLocation.lat},${userLocation.lng}&z=13&output=embed`}
                  />
                </div>
              ) : locationDenied ? (
                <p className="text-sm text-gray-500">
                  Location access was denied.{" "}
                  <a
                    href="https://www.google.com/maps/search/plant+nurseries+near+me"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1279be] hover:underline"
                  >
                    Search on Google Maps →
                  </a>
                </p>
              ) : (
                <p className="text-sm text-gray-400">
                  Requesting your location...
                </p>
              )}

              {userLocation && (
                <a
                  href={`https://www.google.com/maps/search/plant+nurseries/@${userLocation.lat},${userLocation.lng},13z`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 text-sm text-[#1279be] hover:underline"
                >
                  Open in Google Maps →
                </a>
              )}
            </Card>

            {/* Buy Online */}
            {results && results.length > 0 && (
              <Card className="mt-4">
                <h3 className="font-semibold text-[#303030] mb-3 text-sm">
                  🛒 Buy Online
                </h3>
                <p className="text-xs text-gray-500 mb-3">
                  Search for <strong>{results[0].name}</strong> on popular stores:
                </p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`https://www.google.com/search?tbm=shop&q=${encodeURIComponent(results[0].name + " plant")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-xs font-medium text-gray-700 hover:bg-gray-200 transition"
                  >
                    Google Shopping
                  </a>
                  <a
                    href={`https://www.amazon.com/s?k=${encodeURIComponent(results[0].name + " plant")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-xs font-medium text-gray-700 hover:bg-gray-200 transition"
                  >
                    Amazon
                  </a>
                  <a
                    href={`https://www.etsy.com/search?q=${encodeURIComponent(results[0].name + " plant")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-xs font-medium text-gray-700 hover:bg-gray-200 transition"
                  >
                    Etsy
                  </a>
                </div>
              </Card>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
