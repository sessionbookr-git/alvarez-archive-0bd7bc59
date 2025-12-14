import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ArchiveStats {
  guitarCount: number;
  modelCount: number;
  yearsOfHistory: number;
  countriesCount: number;
}

export const useStats = () => {
  return useQuery({
    queryKey: ["archive-stats"],
    queryFn: async () => {
      // Get approved guitars count
      const { count: guitarCount } = await supabase
        .from("guitars")
        .select("*", { count: "exact", head: true })
        .eq("status", "approved");

      // Get models count
      const { count: modelCount } = await supabase
        .from("models")
        .select("*", { count: "exact", head: true });

      // Get year range from models
      const { data: models } = await supabase
        .from("models")
        .select("production_start_year, production_end_year");

      let yearsOfHistory = 50;
      if (models && models.length > 0) {
        const startYears = models
          .map((m) => m.production_start_year)
          .filter((y): y is number => y !== null);
        const endYears = models
          .map((m) => m.production_end_year)
          .filter((y): y is number => y !== null);
        
        if (startYears.length > 0 && endYears.length > 0) {
          const minYear = Math.min(...startYears);
          const maxYear = Math.max(...endYears);
          yearsOfHistory = maxYear - minYear + 1;
        }
      }

      // Get unique countries
      const { data: countriesData } = await supabase
        .from("models")
        .select("country_of_manufacture")
        .not("country_of_manufacture", "is", null);

      const uniqueCountries = new Set(
        countriesData?.map((m) => m.country_of_manufacture) || []
      );

      return {
        guitarCount: guitarCount || 0,
        modelCount: modelCount || 0,
        yearsOfHistory,
        countriesCount: uniqueCountries.size || 3,
      } as ArchiveStats;
    },
    staleTime: 60000, // Cache for 1 minute
  });
};
