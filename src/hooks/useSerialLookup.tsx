import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SerialLookupResult {
  confidence: "high" | "medium" | "low";
  confidencePercent: number;
  yearRange: string;
  models: Array<{
    id: string;
    name: string;
    series: string | null;
    country: string | null;
  }>;
  country: string;
  patterns: Array<{
    id: string;
    serial_prefix: string | null;
    year_range_start: number;
    year_range_end: number;
    confidence_notes: string | null;
  }>;
  similarGuitars: Array<{
    id: string;
    serial_number: string;
    estimated_year: number | null;
    model_name: string | null;
  }>;
}

export const useSerialLookup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SerialLookupResult | null>(null);

  const lookup = async (serialNumber: string, neckBlock?: string) => {
    if (!serialNumber.trim()) {
      setError("Please enter a serial number");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Get the first 2 digits as prefix
      const prefix = serialNumber.substring(0, 2);

      // Query serial patterns that match the prefix
      const { data: patterns, error: patternsError } = await supabase
        .from("serial_patterns")
        .select(`
          *,
          models (
            id,
            model_name,
            series,
            country_of_manufacture,
            production_start_year,
            production_end_year
          )
        `)
        .eq("serial_prefix", prefix);

      if (patternsError) throw patternsError;

      // Query similar approved guitars
      const { data: similarGuitars, error: guitarsError } = await supabase
        .from("guitars")
        .select(`
          id,
          serial_number,
          estimated_year,
          models (model_name)
        `)
        .eq("status", "approved")
        .ilike("serial_number", `${prefix}%`)
        .limit(5);

      if (guitarsError) throw guitarsError;

      if (!patterns || patterns.length === 0) {
        // No patterns found - low confidence
        setResult({
          confidence: "low",
          confidencePercent: 20,
          yearRange: "Unknown",
          models: [],
          country: "Unknown",
          patterns: [],
          similarGuitars: (similarGuitars || []).map((g) => ({
            id: g.id,
            serial_number: g.serial_number,
            estimated_year: g.estimated_year,
            model_name: g.models?.model_name || null,
          })),
        });
        return;
      }

      // Calculate results from matching patterns
      const matchedModels = patterns
        .filter((p) => p.models)
        .map((p) => ({
          id: p.models.id,
          name: p.models.model_name,
          series: p.models.series,
          country: p.models.country_of_manufacture,
        }));

      // Get year range
      const years = patterns.flatMap((p) => [p.year_range_start, p.year_range_end]);
      const minYear = Math.min(...years);
      const maxYear = Math.max(...years);
      const yearRange = minYear === maxYear ? `${minYear}` : `${minYear}-${maxYear}`;

      // Get country (most common)
      const countries = patterns
        .filter((p) => p.models?.country_of_manufacture)
        .map((p) => p.models.country_of_manufacture);
      const country = countries[0] || "Unknown";

      // Calculate confidence
      const exactMatches = similarGuitars?.filter(
        (g) => g.serial_number === serialNumber
      ).length || 0;
      
      let confidence: "high" | "medium" | "low";
      let confidencePercent: number;

      if (exactMatches > 0) {
        confidence = "high";
        confidencePercent = 95;
      } else if (patterns.length >= 2) {
        confidence = "high";
        confidencePercent = 85;
      } else if (patterns.length === 1) {
        confidence = "medium";
        confidencePercent = 65;
      } else {
        confidence = "low";
        confidencePercent = 35;
      }

      setResult({
        confidence,
        confidencePercent,
        yearRange,
        models: matchedModels,
        country,
        patterns: patterns.map((p) => ({
          id: p.id,
          serial_prefix: p.serial_prefix,
          year_range_start: p.year_range_start,
          year_range_end: p.year_range_end,
          confidence_notes: p.confidence_notes,
        })),
        similarGuitars: (similarGuitars || []).map((g) => ({
          id: g.id,
          serial_number: g.serial_number,
          estimated_year: g.estimated_year,
          model_name: g.models?.model_name || null,
        })),
      });
    } catch (err) {
      console.error("Serial lookup error:", err);
      setError("Failed to search database. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  return { lookup, loading, error, result, reset };
};
