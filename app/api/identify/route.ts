import { NextRequest, NextResponse } from "next/server";
import type {
  IdentifyResponse,
  PlantMatch,
  HealthDiagnosis,
  SimilarImage,
} from "@/types";
import { getGCILink } from "@/lib/utils";
import { checkRateLimit, consumeScan } from "@/lib/rateLimit";
import { createClient as createSupabaseServer } from "@/lib/supabase-server";

// Allow longer execution time for Plant.id API calls with multiple images
export const maxDuration = 30;

const PLANT_ID_API_URL = "https://api.plant.id/v3/identification";

export async function GET(request: NextRequest) {
  const rateCheck = checkRateLimit(request);
  return NextResponse.json({
    remaining: rateCheck.remaining,
    limit: rateCheck.limit,
  });
}

const DEFAULT_CARE = {
  light: "Bright indirect light",
  water: "Water when top soil is dry",
  soil: "Well-drained potting mix",
};

export async function POST(
  request: NextRequest
): Promise<
  NextResponse<IdentifyResponse | { success: false; error: string }>
> {
  const apiKey = process.env.PLANT_ID_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Plant.id API key is not configured. Add PLANT_ID_API_KEY to your .env.local file.",
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

    // Convert each image to base64
    const base64Images: string[] = [];
    for (const file of imageFiles) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString("base64");
      base64Images.push(base64);
    }

    // Build request body
    const requestBody = {
      images: base64Images,
      similar_images: true,
      health: "all",
    };

    // details and disease_details go as query parameters
    const queryParams = new URLSearchParams({
      details: "common_names,url,description,taxonomy,watering,edible_parts",
      disease_details: "local_name,description,treatment,cause",
    });

    // Call Plant.id API v3
    const plantIdResponse = await fetch(
      `${PLANT_ID_API_URL}?${queryParams.toString()}`,
      {
        method: "POST",
        headers: {
          "Api-Key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!plantIdResponse.ok) {
      const errorText = await plantIdResponse.text();
      console.error("Plant.id API error:", plantIdResponse.status, errorText);
      return NextResponse.json(
        {
          success: false,
          error: `Plant identification service returned an error (${plantIdResponse.status}).`,
        },
        { status: 502 }
      );
    }

    const plantIdData = await plantIdResponse.json();

    // Check if the image contains a plant
    if (plantIdData.result?.is_plant?.binary === false) {
      return NextResponse.json({
        success: true,
        matches: [],
        is_healthy: null,
        health_diagnoses: [],
      });
    }

    // --- Parse identification results (top 3) ---
    const suggestions =
      plantIdData.result?.classification?.suggestions || [];

    const matches: PlantMatch[] = suggestions.slice(0, 3).map(
      (
        suggestion: {
          name: string;
          probability: number;
          similar_images?: { id: string; url: string; similarity: number }[];
          details?: {
            common_names?: string[];
            url?: string;
            description?: { value?: string };
            taxonomy?: {
              family?: string;
              genus?: string;
              order?: string;
            };
            watering?: { min?: number; max?: number };
          };
        }
      ) => {
        const commonNames = suggestion.details?.common_names || [];
        const displayName =
          commonNames.length > 0 ? commonNames[0] : suggestion.name;
        const scientificName = suggestion.name;

        let description = "";
        if (suggestion.details?.description?.value) {
          description = suggestion.details.description.value;
        } else if (commonNames.length > 1) {
          description = `Also known as: ${commonNames.slice(0, 3).join(", ")}.`;
        }

        const watering = suggestion.details?.watering;
        let waterTip = DEFAULT_CARE.water;
        if (watering) {
          if (watering.max && watering.max <= 1) {
            waterTip = "Low water needs — water sparingly";
          } else if (watering.min && watering.min >= 2) {
            waterTip = "High water needs — keep soil consistently moist";
          } else {
            waterTip = "Moderate watering — water when soil feels dry";
          }
        }

        // Parse similar images
        const similarImages: SimilarImage[] = (
          suggestion.similar_images || []
        )
          .slice(0, 2)
          .map(
            (img: { id: string; url: string; similarity: number }) => ({
              id: img.id,
              url: img.url,
              similarity: img.similarity,
            })
          );

        return {
          name: displayName,
          scientific_name: scientificName,
          confidence: suggestion.probability,
          description:
            description ||
            `Identified as ${scientificName}. Confidence: ${Math.round(suggestion.probability * 100)}%.`,
          care: {
            light: DEFAULT_CARE.light,
            water: waterTip,
            soil: DEFAULT_CARE.soil,
          },
          image_url: "",
          similar_images: similarImages,
          gci_url: getGCILink(scientificName),
        };
      }
    );

    // --- Parse health assessment results ---
    const isHealthy =
      plantIdData.result?.disease?.is_healthy?.binary ?? null;

    const diseaseSuggestions =
      plantIdData.result?.disease?.suggestions || [];

    const healthDiagnoses: HealthDiagnosis[] = diseaseSuggestions
      .filter(
        (d: { probability: number }) => d.probability > 0.01
      )
      .slice(0, 5)
      .map(
        (d: {
          name: string;
          probability: number;
          details?: {
            local_name?: string;
            description?: string;
            treatment?: { biological?: string[]; chemical?: string[]; prevention?: string[] };
            cause?: string;
          };
        }) => {
          // Build treatment string from structured data
          const treatmentParts: string[] = [];
          if (d.details?.treatment?.biological?.length) {
            treatmentParts.push(d.details.treatment.biological.join(". "));
          }
          if (d.details?.treatment?.chemical?.length) {
            treatmentParts.push(d.details.treatment.chemical.join(". "));
          }
          if (d.details?.treatment?.prevention?.length) {
            treatmentParts.push(
              "Prevention: " + d.details.treatment.prevention.join(". ")
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
      // Don't fail identification if history save fails
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
      maxAge: 60 * 60 * 24, // 1 day
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
