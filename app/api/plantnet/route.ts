import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

const PLANTNET_API_URL = "https://my-api.plantnet.org/v2/identify/all";

export async function POST(request: NextRequest) {
  const apiKey = process.env.PLANTNET_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Pl@ntNet API key is not configured. Add PLANTNET_API_KEY to your .env.local file.",
      },
      { status: 500 }
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

    // Build multipart form data for Pl@ntNet
    const plantnetForm = new FormData();
    for (const file of imageFiles) {
      plantnetForm.append("images", file);
      plantnetForm.append("organs", "auto");
    }

    // Call Pl@ntNet API
    const response = await fetch(
      `${PLANTNET_API_URL}?include-related-images=true&no-reject=false&nb-results=3&lang=en&api-key=${apiKey}`,
      {
        method: "POST",
        body: plantnetForm,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Pl@ntNet API error:", response.status, errorText);
      return NextResponse.json(
        {
          success: false,
          error: `Pl@ntNet returned an error (${response.status}).`,
        },
        { status: 502 }
      );
    }

    const data = await response.json();

    // Parse results into a simple format for comparison
    const results = (data.results || []).map(
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
      }) => ({
        name:
          r.species.commonNames?.length > 0
            ? r.species.commonNames[0]
            : r.species.scientificNameWithoutAuthor,
        scientific_name: r.species.scientificName,
        common_names: r.species.commonNames || [],
        confidence: r.score,
        family: r.species.family?.scientificNameWithoutAuthor || "",
        genus: r.species.genus?.scientificNameWithoutAuthor || "",
        image_url: r.images?.[0]?.url?.m || "",
      })
    );

    return NextResponse.json({
      success: true,
      bestMatch: data.bestMatch || "",
      results,
      remaining: data.remainingIdentificationRequests,
    });
  } catch (error) {
    console.error("Pl@ntNet identification error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
