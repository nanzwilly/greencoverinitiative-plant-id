"use client";

import { useRef, useState } from "react";
import type { PlantMatch } from "@/types";

interface ResultCardProps {
  match: PlantMatch;
  uploadedImageUrl?: string;
}

export default function ResultCard({
  match,
  uploadedImageUrl,
}: ResultCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  async function handleDownload() {
    if (!cardRef.current || generating) return;
    setGenerating(true);

    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
      });

      const link = document.createElement("a");
      link.download = `${match.name.replace(/\s+/g, "-").toLowerCase()}-plant-id.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Failed to generate card:", err);
    } finally {
      setGenerating(false);
    }
  }

  const confidencePercent = Math.round(match.confidence * 100);

  return (
    <>
      {/* Hidden card for html2canvas capture */}
      <div
        ref={cardRef}
        style={{
          position: "absolute",
          left: "-9999px",
          top: "-9999px",
          width: "600px",
        }}
      >
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            backgroundColor: "#ffffff",
            padding: "32px",
            borderRadius: "16px",
            border: "2px solid #e5e7eb",
          }}
        >
          {/* Header with branding */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "24px",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <span style={{ fontSize: "24px" }}>🌿</span>
              <span
                style={{
                  fontWeight: 700,
                  color: "#0a6b14",
                  fontSize: "16px",
                }}
              >
                Green Cover Initiative
              </span>
            </div>
            <span
              style={{
                display: "inline-block",
                padding: "4px 12px",
                borderRadius: "9999px",
                fontSize: "13px",
                fontWeight: 700,
                backgroundColor:
                  confidencePercent >= 80
                    ? "#dcfce7"
                    : confidencePercent >= 60
                      ? "#fef9c3"
                      : "#fee2e2",
                color:
                  confidencePercent >= 80
                    ? "#15803d"
                    : confidencePercent >= 60
                      ? "#a16207"
                      : "#dc2626",
              }}
            >
              {confidencePercent}% match
            </span>
          </div>

          {/* Plant image */}
          {(uploadedImageUrl || match.image_url) && (
            <div
              style={{
                marginBottom: "20px",
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={uploadedImageUrl || match.image_url}
                alt={match.name}
                style={{
                  width: "100%",
                  maxHeight: "300px",
                  objectFit: "contain",
                }}
                crossOrigin="anonymous"
              />
            </div>
          )}

          {/* Plant name */}
          <h2
            style={{
              fontSize: "28px",
              fontWeight: 700,
              color: "#15803d",
              margin: "0 0 4px 0",
            }}
          >
            {match.name}
          </h2>
          <p
            style={{
              fontSize: "14px",
              color: "#6b7280",
              fontStyle: "italic",
              margin: "0 0 16px 0",
            }}
          >
            {match.scientific_name}
          </p>

          {/* Care tips */}
          <div
            style={{ display: "flex", gap: "8px", marginBottom: "20px" }}
          >
            <div
              style={{
                flex: 1,
                backgroundColor: "#fefce8",
                borderRadius: "8px",
                padding: "12px",
                fontSize: "12px",
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  color: "#a16207",
                  marginBottom: "4px",
                }}
              >
                Light
              </div>
              {match.care.light}
            </div>
            <div
              style={{
                flex: 1,
                backgroundColor: "#eff6ff",
                borderRadius: "8px",
                padding: "12px",
                fontSize: "12px",
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  color: "#1d4ed8",
                  marginBottom: "4px",
                }}
              >
                Water
              </div>
              {match.care.water}
            </div>
            <div
              style={{
                flex: 1,
                backgroundColor: "#fffbeb",
                borderRadius: "8px",
                padding: "12px",
                fontSize: "12px",
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  color: "#b45309",
                  marginBottom: "4px",
                }}
              >
                Soil
              </div>
              {match.care.soil}
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              borderTop: "1px solid #e5e7eb",
              paddingTop: "12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "11px",
              color: "#9ca3af",
            }}
          >
            <span>Identified by plantid.greencoverinitiative.com</span>
            <span>Plant Identifier</span>
          </div>
        </div>
      </div>

      {/* Download button */}
      <button
        onClick={handleDownload}
        disabled={generating}
        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {generating ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
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
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Generating...
          </>
        ) : (
          <>Download Card</>
        )}
      </button>
    </>
  );
}
