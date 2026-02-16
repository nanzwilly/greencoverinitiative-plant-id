"use client";

import { useState } from "react";
import ImageUpload from "@/components/ImageUpload";
import Button from "@/components/Button";
import Card from "@/components/Card";
import type { HealthDiagnosis } from "@/types";

export default function HealthPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [diagnoses, setDiagnoses] = useState<HealthDiagnosis[] | null>(null);

  async function handleSubmit() {
    if (files.length === 0) return;
    setLoading(true);
    setDiagnoses(null);

    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("images", f));

      const res = await fetch("/api/health", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setDiagnoses(data.diagnoses);
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-green-800 mb-2">
        Plant Health Check
      </h1>
      <p className="text-gray-600 mb-6">
        Upload images of your plant&apos;s issue — spots, wilting, discoloration
        — and get a diagnosis.
      </p>

      <ImageUpload maxFiles={5} onFilesChange={setFiles} />

      <div className="mt-6">
        <Button
          onClick={handleSubmit}
          disabled={files.length === 0 || loading}
          type="button"
        >
          {loading ? "Analyzing…" : "Check Health"}
        </Button>
      </div>

      {diagnoses && (
        <section className="mt-10 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Diagnosis</h2>
          {diagnoses.map((d, i) => (
            <Card key={i}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-red-700">
                    {d.condition}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{d.description}</p>
                  <div className="mt-3 bg-green-50 rounded-md p-3">
                    <p className="text-sm font-semibold text-green-800 mb-1">
                      Recommended Treatment
                    </p>
                    <p className="text-sm text-green-700">{d.treatment}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${
                      d.confidence >= 0.8
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {Math.round(d.confidence * 100)}% match
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </section>
      )}
    </div>
  );
}
