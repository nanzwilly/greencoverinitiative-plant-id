import { NextRequest, NextResponse } from "next/server";
import type {
  IdentifyResponse,
  PlantMatch,
  HealthDiagnosis,
} from "@/types";
import { getGCILink } from "@/lib/utils";
import { checkRateLimit, consumeScan } from "@/lib/rateLimit";
import { createClient as createSupabaseServer } from "@/lib/supabase-server";

// Allow longer execution time for API calls
export const maxDuration = 30;

const PLANTNET_API_URL = "https://my-api.plantnet.org/v2/identify/all";
const PLANT_ID_API_URL = "https://api.plant.id/v3/identification";

const DEFAULT_CARE = {
  light: "Bright indirect light",
  water: "Water when top soil is dry",
  soil: "Well-drained potting mix",
};

export async function GET(request: NextRequest) {
  const rateCheck = checkRateLimit(request);
  return NextResponse.json({
    remaining: rateCheck.remaining,
    limit: rateCheck.limit,
  });
}

export async function POST(
  request: NextRequest
): Promise<
  NextResponse<IdentifyResponse | { success: false; error: string }>
> {
  const plantnetKey = process.env.PLANTNET_API_KEY;
  const plantIdKey = process.env.PLANT_ID_API_KEY;

  if (!plantnetKey) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Pl@ntNet API key is not configured. Add PLANTNET_API_KEY to your .env.local file.",
      },
      { status: 500 }
    );
  }

  // --- Rate limit check ---
  const rateCheck = checkRateLimit(request);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: `Daily limit reached (${rateCheck.limit} scans per day). Please try again tomorrow.`,
        remaining: 0,
        limit: rateCheck.limit,
      },
      { status: 429 }
    );
  }

  try {
    const formData = await request.formData();
    const imageFiles = formData.getAll("images") as File[];

    if (imageFiles.length === 0) {
      return NextResponse.json(
        { success: false, error: "No images provided." },
        { status: 400 }
      );
    }

    // ======================================================
    // STEP 1: Pl@ntNet for plant IDENTIFICATION (free, 500/day)
    // ======================================================
    const plantnetForm = new FormData();
    for (const file of imageFiles) {
      plantnetForm.append("images", file);
      plantnetForm.append("organs", "auto");
    }

    const plantnetResponse = await fetch(
      `${PLANTNET_API_URL}?include-related-images=true&no-reject=false&nb-results=3&lang=en&api-key=${plantnetKey}`,
      {
        method: "POST",
        body: plantnetForm,
      }
    );

    if (!plantnetResponse.ok) {
      const errorText = await plantnetResponse.text();
      console.error("Pl@ntNet API error:", plantnetResponse.status, errorText);
      return NextResponse.json(
        {
          success: false,
          error: `Plant identification service returned an error (${plantnetResponse.status}).`,
        },
        { status: 502 }
      );
    }

    const plantnetData = await plantnetResponse.json();

    // Check if any results were returned
    if (!plantnetData.results || plantnetData.results.length === 0) {
      return NextResponse.json({
        success: true,
        matches: [],
        is_healthy: null,
        health_diagnoses: [],
      });
    }

    // Parse Pl@ntNet results into PlantMatch format
    const matches: PlantMatch[] = plantnetData.results.slice(0, 3).map(
      (r: {
        score: number;
        species: {
          scientificName: string;
          scientificNameWithoutAuthor: string;
          commonNames: string[];
          family: { scientificNameWithoutAuthor: string };
          genus: { scientificNameWithoutAuthor: string };
        };
        images?: { url: { m: string } }[];
      }) => {
        const commonNames = r.species.commonNames || [];
        const displayName =
          commonNames.length > 0
            ? commonNames[0]
            : r.species.scientificNameWithoutAuthor;
        const scientificName = r.species.scientificNameWithoutAuthor;

        let description = "";
        if (commonNames.length > 1) {
          description = `Also known as: ${commonNames.slice(0, 4).join(", ")}.`;
        }
        if (r.species.family?.scientificNameWithoutAuthor) {
          description += ` Family: ${r.species.family.scientificNameWithoutAuthor}.`;
        }

        // Get a reference image from Pl@ntNet if available
        const refImage = r.images?.[0]?.url?.m || "";

        return {
          name: displayName,
          scientific_name: scientificName,
          confidence: r.score,
          description:
            description ||
            `Identified as ${scientificName}. Confidence: ${Math.round(r.score * 100)}%.`,
          care: {
            light: DEFAULT_CARE.light,
            water: DEFAULT_CARE.water,
            soil: DEFAULT_CARE.soil,
          },
          image_url: refImage,
          similar_images: [],
          gci_url: getGCILink(scientificName),
        };
      }
    );

    // ======================================================
    // STEP 2: Plant.id for HEALTH assessment only (saves credits)
    // ======================================================
    let isHealthy: boolean | null = null;
    let healthDiagnoses: HealthDiagnosis[] = [];

    if (plantIdKey) {
      try {
        // Convert images to base64 for Plant.id
        const base64Images: string[] = [];
        for (const file of imageFiles) {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          base64Images.push(buffer.toString("base64"));
        }

        const healthBody = {
          images: base64Images,
          health: "only",  // health assessment only — no identification, saves 1 credit
        };

        const healthParams = new URLSearchParams({
          disease_details: "local_name,description,treatment,cause",
        });

        const healthResponse = await fetch(
          `${PLANT_ID_API_URL}?${healthParams.toString()}`,
          {
            method: "POST",
            headers: {
              "Api-Key": plantIdKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(healthBody),
          }
        );

        if (healthResponse.ok) {
          const healthData = await healthResponse.json();

          isHealthy =
            healthData.result?.disease?.is_healthy?.binary ?? null;

          const diseaseSuggestions =
            healthData.result?.disease?.suggestions || [];

          healthDiagnoses = diseaseSuggestions
            .filter((d: { probability: number }) => d.probability > 0.01)
            .slice(0, 5)
            .map(
              (d: {
                name: string;
                probability: number;
                details?: {
                  local_name?: string;
                  description?: string;
                  treatment?: {
                    biological?: string[];
                    chemical?: string[];
                    prevention?: string[];
                  };
                  cause?: string;
                };
              }) => {
                const treatmentParts: string[] = [];
                if (d.details?.treatment?.biological?.length) {
                  treatmentParts.push(
                    d.details.treatment.biological.join(". ")
                  );
                }
                if (d.details?.treatment?.chemical?.length) {
                  treatmentParts.push(
                    d.details.treatment.chemical.join(". ")
                  );
                }
                if (d.details?.treatment?.prevention?.length) {
                  treatmentParts.push(
                    "Prevention: " +
                      d.details.treatment.prevention.join(". ")
                  );
                }

                return {
                  condition: d.details?.local_name || d.name,
                  confidence: d.probability,
                  description:
                    d.details?.description ||
                    `Detected condition: ${d.name}.`,
                  treatment:
                    treatmentParts.join(" ") ||
                    "Consult a local gardening expert for treatment options.",
                  cause: d.details?.cause,
                };
              }
            );
        } else {
          console.error(
            "Plant.id health API error:",
            healthResponse.status,
            await healthResponse.text()
          );
          // Health check failed but identification succeeded — still return results
        }
      } catch (healthError) {
        console.error("Health assessment error:", healthError);
        // Don't fail the whole request if health check fails
      }
    }

    // Consume one scan and set cookie
    const { cookieValue, remaining } = consumeScan(request);

    // Save to history if user is logged in (non-blocking)
    try {
      const supabase = await createSupabaseServer();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && matches.length > 0) {
        const topMatch = matches[0];
        await supabase.from("identification_history").insert({
          user_id: user.id,
          plant_name: topMatch.name,
          scientific_name: topMatch.scientific_name,
          confidence: topMatch.confidence,
          result_json: {
            matches,
            is_healthy: isHealthy,
            health_diagnoses: healthDiagnoses,
          },
        });
      }
    } catch (historyError) {
      console.error("Failed to save to history:", historyError);
    }

    const response = NextResponse.json({
      success: true,
      matches,
      is_healthy: isHealthy,
      health_diagnoses: healthDiagnoses,
      remaining,
    });

    response.cookies.set("plant_id_usage", cookieValue, {
      httpOnly: false,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error("Identification error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
