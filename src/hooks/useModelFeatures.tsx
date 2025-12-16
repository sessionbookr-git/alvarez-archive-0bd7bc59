import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ModelFeature {
  id: string;
  model_id: string;
  feature_id: string;
  is_required: boolean;
  created_at: string;
}

export interface ModelFeatureWithDetails extends ModelFeature {
  identifying_features: {
    id: string;
    feature_category: string;
    feature_name: string;
    feature_value: string | null;
  };
}

// Fetch features linked to a specific model
export const useModelFeatures = (modelId: string) => {
  return useQuery({
    queryKey: ["model-features", modelId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("model_features")
        .select(`
          *,
          identifying_features (
            id,
            feature_category,
            feature_name,
            feature_value
          )
        `)
        .eq("model_id", modelId);

      if (error) throw error;
      return data as ModelFeatureWithDetails[];
    },
    enabled: !!modelId,
  });
};

// Fetch all model_features for matching
export const useAllModelFeatures = () => {
  return useQuery({
    queryKey: ["all-model-features"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("model_features")
        .select(`
          *,
          identifying_features (
            id,
            feature_category,
            feature_name,
            feature_value
          )
        `);

      if (error) throw error;
      return data as ModelFeatureWithDetails[];
    },
  });
};

// Save model features (replace all for a model)
export const useSaveModelFeatures = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      modelId,
      features,
    }: {
      modelId: string;
      features: { feature_id: string; is_required: boolean }[];
    }) => {
      // Delete existing features for this model
      const { error: deleteError } = await supabase
        .from("model_features")
        .delete()
        .eq("model_id", modelId);

      if (deleteError) throw deleteError;

      // Insert new features
      if (features.length > 0) {
        const payload = features.map((f) => ({
          model_id: modelId,
          feature_id: f.feature_id,
          is_required: f.is_required,
        }));

        const { error: insertError } = await supabase
          .from("model_features")
          .insert(payload);

        if (insertError) throw insertError;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["model-features", variables.modelId] });
      queryClient.invalidateQueries({ queryKey: ["all-model-features"] });
    },
  });
};
