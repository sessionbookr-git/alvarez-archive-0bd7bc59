import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ModelPhoto {
  id: string;
  model_id: string;
  photo_url: string;
  photo_order: number;
  caption: string | null;
  created_at: string;
}

export const useModelPhotos = (modelId: string) => {
  return useQuery({
    queryKey: ["model-photos", modelId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("model_photos")
        .select("*")
        .eq("model_id", modelId)
        .order("photo_order");

      if (error) throw error;
      return data as ModelPhoto[];
    },
    enabled: !!modelId,
  });
};

export const useSaveModelPhotos = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      modelId,
      photos,
    }: {
      modelId: string;
      photos: { photo_url: string; photo_order: number; caption?: string }[];
    }) => {
      // Delete existing photos for this model
      const { error: deleteError } = await supabase
        .from("model_photos")
        .delete()
        .eq("model_id", modelId);

      if (deleteError) throw deleteError;

      // Insert new photos if any
      if (photos.length > 0) {
        const { error: insertError } = await supabase
          .from("model_photos")
          .insert(
            photos.map((photo) => ({
              model_id: modelId,
              photo_url: photo.photo_url,
              photo_order: photo.photo_order,
              caption: photo.caption || null,
            }))
          );

        if (insertError) throw insertError;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["model-photos", variables.modelId] });
    },
  });
};
