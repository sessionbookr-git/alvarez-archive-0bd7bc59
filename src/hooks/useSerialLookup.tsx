import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAnalytics } from "./useAnalytics";
import { parseSerial, parseNeckBlock, SerialFormat } from "@/lib/serialParser";

export interface SerialLookupResult {
  confidence: "high" | "medium" | "low";
  confidencePercent: number;
  yearRange: string;
  estimatedYear: number | null;
  estimatedMonth: number | null;
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
  // New fields for enhanced serial parsing
  serialFormat: SerialFormat;
  parsedNotes: string;
  isYairi: boolean;
  needsEmperorCode: boolean;
  neckBlockYear: number | null;
  neckBlockNotes: string | null;
  prefix: string | null;
}

export const useSerialLookup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SerialLookupResult | null>(null);
  const { track } = useAnalytics();

  const lookup = async (serialNumber: string, neckBlock?: string) => {
    if (!serialNumber.trim()) {
      setError("Please enter a serial number");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Parse the serial number format first
      const parsed = parseSerial(serialNumber);
      
      // Parse neck block if provided
      let neckBlockYear: number | null = null;
      let neckBlockNotes: string | null = null;
      if (neckBlock?.trim()) {
        const nbResult = parseNeckBlock(neckBlock);
        neckBlockYear = nbResult.year;
        neckBlockNotes = nbResult.notes;
      }

      // Get the first 2 characters as prefix for database lookup (for non-Yairi serials)
      const prefix = parsed.prefix || serialNumber.substring(0, 2);

      // For Yairi serials, skip pattern matching - the serial is just a sequence number
      // Only do pattern lookup for non-Yairi formats
      let patterns: any[] = [];
      let similarGuitars: any[] = [];
      
      if (!parsed.isYairi) {
        // Query serial patterns that match the prefix
        const { data: patternsData, error: patternsError } = await supabase
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
        patterns = patternsData || [];

        // Query similar approved guitars
        const { data: guitarsData, error: guitarsError } = await supabase
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
        similarGuitars = guitarsData || [];
      }

      // Determine year and country - combine parsed info with database patterns
      let yearRange = parsed.yearRange;
      let estimatedYear = parsed.estimatedYear;
      let country = parsed.country;
      let confidence = parsed.confidence;
      // If we have a definitive parsed year AND month, this is essentially certain
      let confidencePercent = confidence === "high" 
        ? (parsed.estimatedYear && parsed.estimatedMonth ? 95 : 85) 
        : confidence === "medium" ? 60 : 30;

      // If we have database patterns (non-Yairi), use those for better accuracy
      // BUT: don't overwrite specific parsed dates with generic ranges
      if (!parsed.isYairi && patterns && patterns.length > 0) {
        // Only use pattern year range if we don't already have a specific year from parsing
        if (!parsed.estimatedYear) {
          const years = patterns.flatMap((p: any) => [p.year_range_start, p.year_range_end]);
          const minYear = Math.min(...years);
          const maxYear = Math.max(...years);
          yearRange = minYear === maxYear ? `${minYear}` : `${minYear}-${maxYear}`;
        }

        const countries = patterns
          .filter((p: any) => p.models?.country_of_manufacture)
          .map((p: any) => p.models.country_of_manufacture);
        if (countries.length > 0) {
          country = countries[0] || country;
        }

        // Only adjust confidence based on patterns if we DON'T already have definitive parsed data
        if (!parsed.estimatedYear || !parsed.estimatedMonth) {
          if (patterns.length >= 2) {
            confidence = "high";
            confidencePercent = 85;
          } else if (patterns.length === 1) {
            confidence = "medium";
            confidencePercent = 65;
          }
        }
      }

      // If neck block provided a year, use that as authoritative
      if (neckBlockYear) {
        yearRange = `${neckBlockYear}`;
        estimatedYear = neckBlockYear;
        confidence = "high";
        confidencePercent = 95;
        country = "Japan"; // Emperor code = Japanese manufacture
      }

      // Calculate results from matching patterns (skip for Yairi)
      const matchedModels = parsed.isYairi ? [] : (patterns || [])
        .filter((p: any) => p.models)
        .map((p: any) => ({
          id: p.models.id,
          name: p.models.model_name,
          series: p.models.series,
          country: p.models.country_of_manufacture,
        }));

      // Check for exact serial matches in similar guitars (skip for Yairi)
      if (!parsed.isYairi) {
        const exactMatches = similarGuitars?.filter(
          (g: any) => g.serial_number === serialNumber
        ).length || 0;
        
        if (exactMatches > 0) {
          confidence = "high";
          confidencePercent = 95;
        }
      }

      track('serial_lookup', { 
        serial: serialNumber, 
        confidence,
        format: parsed.format,
        hasNeckBlock: !!neckBlock 
      });

      setResult({
        confidence,
        confidencePercent,
        yearRange,
        estimatedYear,
        estimatedMonth: parsed.estimatedMonth,
        models: matchedModels,
        country,
        patterns: (patterns || []).map((p: any) => ({
          id: p.id,
          serial_prefix: p.serial_prefix,
          year_range_start: p.year_range_start,
          year_range_end: p.year_range_end,
          confidence_notes: p.confidence_notes,
        })),
        similarGuitars: (similarGuitars || []).map((g: any) => ({
          id: g.id,
          serial_number: g.serial_number,
          estimated_year: g.estimated_year,
          model_name: g.models?.model_name || null,
        })),
        serialFormat: parsed.format,
        parsedNotes: parsed.notes,
        isYairi: parsed.isYairi,
        needsEmperorCode: parsed.needsEmperorCode,
        neckBlockYear,
        neckBlockNotes,
        prefix: parsed.prefix,
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
