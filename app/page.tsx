"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import ImageUpload from "@/components/ImageUpload";
import Card from "@/components/Card";
import type { PlantMatch } from "@/types";

export default function HomePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PlantMatch[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [noPlant, setNoPlant] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);

  // When files change, update state and clear results
  const handleFilesChange = useCallback((newFiles: File[]) => {
    setFiles(newFiles);
    setResults(null);
    setError(null);
    setNoPlant(false);
  }, []);

  // Auto-submit when a file is uploaded
  const hasTriggered = useRef(false);
  useEffect(() => {
    if (files.length > 0 && !loading && !hasTriggered.current) {
      hasTriggered.current = true;
      handleSubmit();
    }
    if (files.length === 0) {
      hasTriggered.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  // Compress an image using canvas to stay within Vercel's 4.5MB body limit
  function compressImage(
    file: File,
    maxWidth = 800,
    quality = 0.6
  ): Promise<File> {
    return new Promise((resolve) => {
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
    setError(null);
    setNoPlant(false);

    try {
      const compressedFiles = await Promise.all(
        files.map((f) => compressImage(f))
      );

      const formData = new FormData();
      compressedFiles.forEach((f) => formData.append("images", f));

      const res = await fetch("/api/identify", {
        method: "POST",
        body: formData,
      });

      if (!res.ok && res.status === 413) {
        setError("Image is too large. Please try with a smaller photo.");
        return;
      }

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Identification failed.");
        return;
      }

      if (data.matches.length === 0) {
        setNoPlant(true);
        return;
      }

      setResults(data.matches);

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
      setError("Something went wrong. Try uploading a different photo.");
    } finally {
      setLoading(false);
    }
  }

  const hasResults = results && results.length > 0;

  return (
    <div>
      {/* Hero section with green gradient */}
      <section className="relative overflow-hidden bg-gradient-to-b from-green-50/80 to-white">
        {/* Line-art flower — bottom left */}
        <svg
          className="absolute left-8 bottom-6 w-56 h-56 opacity-[0.07] hidden md:block"
          viewBox="0 0 100 130"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M50 130 C50 110 48 90 50 70" stroke="#0a6b14" strokeWidth="1.5" />
          <path d="M50 100 C40 90 30 88 25 92 C30 96 40 98 50 100Z" fill="#0a6b14" opacity="0.6" />
          <path d="M50 85 C60 75 70 73 75 77 C70 81 60 83 50 85Z" fill="#0a6b14" opacity="0.6" />
          <path d="M50 70 C45 55 35 45 30 48 C28 55 38 65 50 70Z" stroke="#0a6b14" strokeWidth="1.2" fill="none" />
          <path d="M50 70 C55 55 65 45 70 48 C72 55 62 65 50 70Z" stroke="#0a6b14" strokeWidth="1.2" fill="none" />
          <path d="M50 70 C42 58 38 42 42 38 C48 38 52 52 50 70Z" stroke="#0a6b14" strokeWidth="1.2" fill="none" />
          <path d="M50 70 C58 58 62 42 58 38 C52 38 48 52 50 70Z" stroke="#0a6b14" strokeWidth="1.2" fill="none" />
          <path d="M50 70 C50 52 50 38 50 32 C50 38 50 52 50 70Z" stroke="#0a6b14" strokeWidth="1.2" />
          <circle cx="50" cy="68" r="3" fill="#0a6b14" opacity="0.5" />
        </svg>

        {/* Small botanical sprig — top right */}
        <svg
          className="absolute right-16 top-6 w-40 h-40 opacity-[0.07] rotate-[10deg] hidden lg:block"
          viewBox="0 0 80 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M40 120 C40 100 38 80 40 40" stroke="#0a6b14" strokeWidth="1.5" />
          <path d="M40 95 C30 85 22 82 20 86 C24 92 32 94 40 95Z" fill="#0a6b14" />
          <path d="M40 80 C50 70 58 67 60 71 C56 77 48 79 40 80Z" fill="#0a6b14" />
          <path d="M40 65 C30 55 22 52 20 56 C24 62 32 64 40 65Z" fill="#0a6b14" />
          <path d="M40 50 C50 40 58 37 60 41 C56 47 48 49 40 50Z" fill="#0a6b14" />
          <ellipse cx="40" cy="36" rx="5" ry="8" fill="#0a6b14" opacity="0.7" />
        </svg>

        {/* Line-art leaf sprig — mid right */}
        <svg
          className="absolute right-2 top-1/3 w-44 h-44 opacity-[0.06] rotate-[50deg] hidden lg:block"
          viewBox="0 0 80 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M40 120 C40 100 42 80 40 40" stroke="#0a6b14" strokeWidth="1.5" />
          <path d="M40 100 C50 90 58 87 60 91 C56 97 48 99 40 100Z" fill="#0a6b14" />
          <path d="M40 85 C30 75 22 72 20 76 C24 82 32 84 40 85Z" fill="#0a6b14" />
          <path d="M40 70 C50 60 58 57 60 61 C56 67 48 69 40 70Z" fill="#0a6b14" />
          <path d="M40 55 C30 45 22 42 20 46 C24 52 32 54 40 55Z" fill="#0a6b14" />
          <ellipse cx="40" cy="36" rx="4" ry="7" fill="#0a6b14" opacity="0.7" />
        </svg>

        {/* Content */}
        <div className="relative z-10 py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white border border-green-200 text-green-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6 shadow-sm">
              <span>🌿</span> AI-Powered Plant Identification
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold text-[#303030] mb-4">
              Welcome to Green Cover Initiative
            </h1>
            <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
              Upload a photo to identify any plant instantly.
            </p>

            {/* Upload area */}
            <div className="max-w-lg mx-auto">
              <ImageUpload maxFiles={1} onFilesChange={handleFilesChange} />
            </div>

            {/* Loading */}
            {loading && (
              <div className="mt-6 flex items-center justify-center gap-3 text-sm text-gray-500">
                <svg
                  className="animate-spin h-5 w-5 text-[#0a6b14]"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Identifying your plant...
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mt-6 max-w-lg mx-auto bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* No plant found */}
            {noPlant && (
              <div className="mt-6 max-w-lg mx-auto bg-amber-50 border border-amber-200 rounded-lg p-5 flex items-center gap-3 text-left">
                <span className="text-3xl">🌱</span>
                <div>
                  <p className="font-semibold text-amber-800">
                    Sorry, we didn&apos;t find any plant in this picture.
                  </p>
                  <p className="text-sm text-amber-600 mt-0.5">
                    Try uploading a clearer photo with the plant in focus.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Results: 2-column layout ────────────────────────── */}
      {hasResults && (
        <section className="max-w-6xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* ── LEFT: Identification (top 3) ─── */}
            <section>
              <h2 className="text-lg font-bold text-[#0a6b14] uppercase tracking-wide mb-4">
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

            {/* ── RIGHT: Where to Find This Plant ─── */}
            <section>
              <h2 className="text-lg font-bold text-[#0a6b14] uppercase tracking-wide mb-4">
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
                    Search for <strong>{results[0].name}</strong> on popular
                    stores:
                  </p>
                  <a
                    href={`https://www.google.com/search?tbm=shop&q=${encodeURIComponent(results[0].name + " plant")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[#0a6b14] text-white rounded-lg text-sm font-semibold hover:bg-[#085a10] transition"
                  >
                    🛒 Shop for {results[0].name} on Google
                  </a>
                </Card>
              )}
            </section>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-px bg-green-200 flex-1 max-w-[60px]" />
          <h2 className="text-2xl font-bold text-[#303030] text-center">
            How It Works
          </h2>
          <div className="h-px bg-green-200 flex-1 max-w-[60px]" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card>
            <div className="text-center">
              <div className="w-14 h-14 bg-green-50 border border-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📸</span>
              </div>
              <h3 className="font-semibold text-[#303030] mb-1">
                1. Take a Photo
              </h3>
              <p className="text-sm text-gray-500">
                Snap a picture of any plant or upload an existing photo.
              </p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="w-14 h-14 bg-green-50 border border-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="font-semibold text-[#303030] mb-1">
                2. Get Results
              </h3>
              <p className="text-sm text-gray-500">
                AI identifies the plant with care instructions and confidence
                scores.
              </p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="w-14 h-14 bg-green-50 border border-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🌱</span>
              </div>
              <h3 className="font-semibold text-[#303030] mb-1">
                3. Grow Greener
              </h3>
              <p className="text-sm text-gray-500">
                Find nearby nurseries and learn how to care for your plants.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Browse on main site CTA */}
      <section className="relative overflow-hidden bg-gradient-to-b from-green-50/60 to-green-50/30 border-t border-green-200 py-12">
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-xl font-bold text-[#303030] mb-2">
            🌳 Browse Our Plant Catalog
          </h2>
          <p className="text-sm text-gray-600 mb-5">
            Explore flowering plants, leafy plants, trees, vegetables, herbs,
            and wild plants on our main site.
          </p>
          <a
            href="https://www.greencoverinitiative.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#0a6b14] text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-[#085a10] transition text-sm"
          >
            Visit greencoverinitiative.com &rarr;
          </a>
        </div>
      </section>
    </div>
  );
}
