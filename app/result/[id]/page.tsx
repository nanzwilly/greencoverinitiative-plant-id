import { notFound } from "next/navigation";
import { cache } from "react";
import { sql } from "@/lib/db";
import type { Metadata } from "next";
import type { PlantMatch } from "@/types";
import Card from "@/components/Card";
import ShareBar from "@/components/ShareBar";

interface SharedResult {
  share_id: string;
  plant_name: string;
  scientific_name: string | null;
  confidence: number | null;
  image_url: string | null;
  result_json: {
    matches: PlantMatch[];
    is_healthy: boolean | null;
    health_diagnoses: unknown[];
  };
  created_at: string;
}

const getSharedResult = cache(async (id: string): Promise<SharedResult | null> => {
  const rows = (await sql`
    SELECT share_id, plant_name, scientific_name, confidence, image_url,
           result_json, created_at::text as created_at
    FROM shared_results
    WHERE share_id = ${id}
    LIMIT 1
  `) as SharedResult[];

  return rows[0] ?? null;
});

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const result = await getSharedResult(id);

  if (!result) {
    return { title: "Result Not Found | Green Cover Initiative" };
  }

  const confidencePercent = result.confidence
    ? Math.round(result.confidence * 100)
    : null;
  const title = `${result.plant_name} - Plant Identifier | Green Cover Initiative`;
  const description = confidencePercent
    ? `Identified ${result.plant_name} (${result.scientific_name || ""}) with ${confidencePercent}% confidence using AI Plant Identifier by Green Cover Initiative.`
    : `Identified ${result.plant_name} using AI Plant Identifier by Green Cover Initiative.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: result.image_url
        ? [{ url: result.image_url, width: 600, height: 400, alt: result.plant_name }]
        : [],
      type: "article",
      siteName: "Green Cover Initiative",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: result.image_url ? [result.image_url] : [],
    },
  };
}

export default async function SharedResultPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await getSharedResult(id);

  if (!result) {
    notFound();
  }

  const matches = result.result_json.matches;
  const shareUrl = `https://plantid.greencoverinitiative.com/result/${result.share_id}`;

  return (
    <div>
      {/* Header banner */}
      <section className="bg-gradient-to-b from-green-50/80 to-white py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-green-200 text-green-700 text-xs font-medium px-3 py-1.5 rounded-full mb-4 shadow-sm">
            <span>🌿</span> Plant Identification Result
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#303030] mb-2">
            {result.plant_name}
          </h1>
          {result.scientific_name && (
            <p className="text-lg text-gray-500 italic">{result.scientific_name}</p>
          )}
          {result.confidence && (
            <div className="mt-3">
              <span
                className={`inline-block px-3 py-1.5 rounded-full text-sm font-bold ${
                  result.confidence >= 0.8
                    ? "bg-green-100 text-green-700"
                    : result.confidence >= 0.6
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                }`}
              >
                {Math.round(result.confidence * 100)}% match
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Results */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        {/* Plant reference image */}
        {result.image_url && (
          <div className="mb-8 max-w-md mx-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={result.image_url}
              alt={result.plant_name}
              className="w-full h-64 object-cover rounded-xl border border-gray-200 shadow-sm"
            />
          </div>
        )}

        {/* Match cards */}
        <h2 className="text-lg font-bold text-[#0a6b14] uppercase tracking-wide mb-4">
          Identification ({matches.length} match{matches.length !== 1 ? "es" : ""})
        </h2>
        <div className="space-y-4">
          {matches.map((match, i) => (
            <Card key={i}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400">#{i + 1}</span>
                    <h3 className="text-lg font-bold text-green-700">{match.name}</h3>
                  </div>
                  <p className="text-sm text-gray-500 italic">{match.scientific_name}</p>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-3">{match.description}</p>

                  {/* Care tips */}
                  <div className="mt-3 grid grid-cols-3 gap-1.5 text-xs">
                    <div className="bg-yellow-50 rounded-md p-2">
                      <span className="font-semibold text-yellow-700">Light</span>
                      <br />
                      {match.care.light}
                    </div>
                    <div className="bg-blue-50 rounded-md p-2">
                      <span className="font-semibold text-blue-700">Water</span>
                      <br />
                      {match.care.water}
                    </div>
                    <div className="bg-amber-50 rounded-md p-2">
                      <span className="font-semibold text-amber-700">Soil</span>
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

        {/* Share bar */}
        <ShareBar
          plantName={result.plant_name}
          confidence={result.confidence ?? 0}
          shareUrl={shareUrl}
        />

        {/* CTA */}
        <div className="mt-10 text-center">
          <p className="text-gray-500 mb-4">Want to identify your own plant?</p>
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-[#0a6b14] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[#085a10] transition text-sm"
          >
            🌿 Identify Your Own Plant
          </a>
        </div>
      </section>
    </div>
  );
}
