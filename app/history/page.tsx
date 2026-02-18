"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase-browser";
import Card from "@/components/Card";
import Button from "@/components/Button";
import type { IdentificationHistoryRecord } from "@/types";

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const recordDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const diffMs = today.getTime() - recordDay.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const [history, setHistory] = useState<IdentificationHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchHistory() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("identification_history")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) {
          console.error("Failed to fetch history:", error);
        } else {
          setHistory(data || []);
        }
      } catch (err) {
        console.error("History fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [user]);

  // Group records by date
  const groupedHistory = useMemo(() => {
    const groups: { label: string; records: IdentificationHistoryRecord[] }[] =
      [];
    let currentLabel = "";

    for (const record of history) {
      const label = formatDateLabel(record.created_at);
      if (label !== currentLabel) {
        currentLabel = label;
        groups.push({ label, records: [record] });
      } else {
        groups[groups.length - 1].records.push(record);
      }
    }

    return groups;
  }, [history]);

  if (authLoading || loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 text-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-green-800 mb-6">
          Identification History
        </h1>

        <Card className="text-center py-12">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Login Required
          </h2>
          <p className="text-gray-500 mb-6">
            Sign in to view your past plant identifications.
          </p>
          <Button href="/account">Sign In</Button>
        </Card>
      </div>
    );
  }

  // Logged in but no history
  if (history.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-green-800 mb-6">
          Identification History
        </h1>

        <Card className="text-center py-12">
          <div className="text-5xl mb-4">🌿</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            No identifications yet
          </h2>
          <p className="text-gray-500 mb-6">
            Identify a plant and it will appear here automatically.
          </p>
          <Button href="/" variant="green">
            Identify a Plant
          </Button>
        </Card>
      </div>
    );
  }

  // Logged in with history
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-green-800 mb-2">
        Identification History
      </h1>
      <p className="text-gray-500 text-sm mb-6">
        {history.length} identification{history.length !== 1 ? "s" : ""} saved
      </p>

      <div className="space-y-8">
        {groupedHistory.map((group) => (
          <div key={group.label}>
            {/* Date header */}
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                {group.label}
              </h2>
              <div className="h-px bg-gray-200 flex-1" />
            </div>

            {/* Records for this date */}
            <div className="space-y-3">
              {group.records.map((record) => {
                const isExpanded = expandedId === record.id;

                return (
                  <Card key={record.id}>
                    {/* Summary row */}
                    <button
                      onClick={() =>
                        setExpandedId(isExpanded ? null : record.id)
                      }
                      className="w-full text-left"
                    >
                      <div className="flex items-center gap-4">
                        {/* Plant photo thumbnail */}
                        {record.image_thumbnail ? (
                          <img
                            src={record.image_thumbnail}
                            alt={record.plant_name}
                            className="w-14 h-14 rounded-lg object-cover border border-gray-200 shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center shrink-0">
                            <span className="text-2xl">🌿</span>
                          </div>
                        )}

                        {/* Plant info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-green-700 truncate">
                              {record.plant_name}
                            </h3>
                            {record.confidence !== null && (
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold shrink-0 ${
                                  record.confidence >= 0.8
                                    ? "bg-green-100 text-green-700"
                                    : record.confidence >= 0.6
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-red-100 text-red-700"
                                }`}
                              >
                                {Math.round(record.confidence * 100)}%
                              </span>
                            )}
                          </div>
                          {record.scientific_name && (
                            <p className="text-sm text-gray-500 italic truncate">
                              {record.scientific_name}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {formatTime(record.created_at)}
                          </p>
                        </div>

                        {/* Expand toggle */}
                        <span className="text-gray-400 text-sm shrink-0">
                          {isExpanded ? "▲" : "▼"}
                        </span>
                      </div>
                    </button>

                    {/* Expanded detail */}
                    {isExpanded && record.result_json && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        {/* Larger image */}
                        {record.image_thumbnail && (
                          <div className="mb-4">
                            <img
                              src={record.image_thumbnail}
                              alt={record.plant_name}
                              className="w-full max-w-xs rounded-lg border border-gray-200"
                            />
                          </div>
                        )}

                        {/* Identification Results */}
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">
                          Identification Results
                        </h4>
                        <div className="space-y-3">
                          {record.result_json.matches.map((match, i) => (
                            <div
                              key={i}
                              className="bg-gray-50 rounded-lg p-3"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-400">
                                  #{i + 1}
                                </span>
                                <span className="font-semibold text-green-700 text-sm">
                                  {match.name}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {Math.round(match.confidence * 100)}%
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 italic">
                                {match.scientific_name}
                              </p>
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {match.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
