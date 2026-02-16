import { NextResponse } from "next/server";
import type { HealthResponse } from "@/types";

export async function POST(): Promise<NextResponse<HealthResponse>> {
  // Mock response — will be replaced with real plant health diagnosis API
  const mockDiagnoses = [
    {
      condition: "Leaf Spot (Cercospora)",
      confidence: 0.85,
      description:
        "Fungal infection causing dark spots with yellow halos on leaves. Common in warm, humid conditions with poor air circulation.",
      treatment:
        "Remove affected leaves. Apply a copper-based fungicide. Improve air circulation around the plant and avoid overhead watering.",
    },
    {
      condition: "Nutrient Deficiency (Nitrogen)",
      confidence: 0.62,
      description:
        "Yellowing of older, lower leaves while newer growth remains green. Indicates insufficient nitrogen in the soil.",
      treatment:
        "Apply a balanced fertilizer with higher nitrogen content. Add compost or well-rotted manure to the soil.",
    },
  ];

  return NextResponse.json({ success: true, diagnoses: mockDiagnoses });
}
