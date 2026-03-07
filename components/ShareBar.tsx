"use client";

import { useState, useEffect } from "react";

interface ShareBarProps {
  plantName: string;
  confidence: number;
  shareUrl?: string;
}

const APP_URL = "https://plantid.greencoverinitiative.com";

export default function ShareBar({ plantName, confidence, shareUrl }: ShareBarProps) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  const url = shareUrl || APP_URL;
  const confidencePercent = Math.round(confidence * 100);
  const shareText = `I just identified ${plantName} (${confidencePercent}% match) using Green Cover Initiative's Plant Identifier! Try it: ${url}`;

  async function handleNativeShare() {
    try {
      await navigator.share({
        title: `${plantName} - Plant Identifier`,
        text: shareText,
        url: url,
      });
    } catch {
      // User cancelled or error — silently ignore
    }
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: do nothing
    }
  }

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

  const btnBase =
    "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition";

  return (
    <div className="mt-6 pt-4 border-t border-gray-200">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Share Your Result
      </p>
      <div className="flex flex-wrap gap-2">
        {canShare && (
          <button
            onClick={handleNativeShare}
            className={`${btnBase} bg-[#0a6b14] text-white hover:bg-[#085a10]`}
          >
            Share
          </button>
        )}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${btnBase} bg-[#25D366] text-white hover:bg-[#1da851]`}
        >
          WhatsApp
        </a>
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${btnBase} bg-black text-white hover:bg-gray-800`}
        >
          X Post
        </a>
        <button
          onClick={handleCopyLink}
          className={`${btnBase} border border-gray-300 text-gray-600 hover:bg-gray-50`}
        >
          {copied ? "Copied!" : "Copy Link"}
        </button>
      </div>
    </div>
  );
}
