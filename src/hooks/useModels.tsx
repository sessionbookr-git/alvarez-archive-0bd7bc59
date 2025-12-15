import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Model {
  id: string;
  model_name: string;
  production_start_year: number | null;
  production_end_year: number | null;
  country_of_manufacture: string | null;
  series: string | null;
  body_shape: string | null;
  description: string | null;
  key_features: string[] | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
  guitar_count?: number;
}

export const useModels = (filters?: {
  decade?: string;
  country?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ["models", filters],
    queryFn: async () => {
      let query = supabase
        .from("models")
        .select("*")
        .order("model_name");

      if (filters?.country && filters.country !== "All") {
        query = query.eq("country_of_manufacture", filters.country);
      }

      if (filters?.search) {
        query = query.or(`model_name.ilike.%${filters.search}%,series.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Filter by decade client-side (more flexible)
      let filteredData = data as Model[];
      if (filters?.decade && filters.decade !== "All") {
        const decadeStart = parseInt(filters.decade.replace("s", ""));
        const decadeEnd = decadeStart + 9;
        filteredData = filteredData.filter((model) => {
          const startYear = model.production_start_year || 0;
          const endYear = model.production_end_year || 9999;
          return (startYear <= decadeEnd && endYear >= decadeStart);
        });
      }

      return filteredData;
    },
  });
};

export const useModel = (modelId: string) => {
  return useQuery({
    queryKey: ["model", modelId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("models")
        .select("*")
        .eq("id", modelId)
        .maybeSingle();

      if (error) throw error;
      return data as Model | null;
    },
    enabled: !!modelId,
  });
};

export const useModelByName = (modelName: string) => {
  return useQuery({
    queryKey: ["model-by-name", modelName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("models")
        .select("*")
        .eq("model_name", modelName)
        .maybeSingle();

      if (error) throw error;
      return data as Model | null;
    },
    enabled: !!modelName,
  });
};
