export interface SimilarImage {
  id: string;
  url: string;
  similarity: number;
}

export interface PlantMatch {
  name: string;
  scientific_name: string;
  confidence: number;
  description: string;
  care: {
    light: string;
    water: string;
    soil: string;
  };
  image_url: string;
  similar_images: SimilarImage[];
  gci_url?: string;
}

export interface HealthDiagnosis {
  condition: string;
  confidence: number;
  description: string;
  treatment: string;
  cause?: string;
}

export interface IdentifyResponse {
  success: boolean;
  matches: PlantMatch[];
  is_healthy: boolean | null;
  health_diagnoses: HealthDiagnosis[];
}

export interface HealthResponse {
  success: boolean;
  diagnoses: HealthDiagnosis[];
}

export interface GCIPage {
  name: string;
  url: string;
}

export interface IdentificationHistoryRecord {
  id: string;
  user_id: string;
  plant_name: string;
  scientific_name: string | null;
  confidence: number | null;
  result_json: {
    matches: PlantMatch[];
    is_healthy: boolean | null;
    health_diagnoses: HealthDiagnosis[];
  };
  image_thumbnail: string | null;
  created_at: string;
}
