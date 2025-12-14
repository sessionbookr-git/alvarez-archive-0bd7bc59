import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface IdentifyingFeature {
  id: string;
  feature_category: string;
  feature_name: string;
  feature_value: string | null;
  description: string | null;
  photo_url: string | null;
  era_start: number | null;
  era_end: number | null;
}

export const useIdentifyingFeatures = (category?: string) => {
  return useQuery({
    queryKey: ["identifying-features", category],
    queryFn: async () => {
      let query = supabase
        .from("identifying_features")
        .select("*")
        .order("feature_name");

      if (category) {
        query = query.eq("feature_category", category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as IdentifyingFeature[];
    },
  });
};

export const useFeatureCategories = () => {
  return useQuery({
    queryKey: ["feature-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("identifying_features")
        .select("feature_category");

      if (error) throw error;

      const categories = [...new Set(data.map((f) => f.feature_category))];
      return categories;
    },
  });
};
