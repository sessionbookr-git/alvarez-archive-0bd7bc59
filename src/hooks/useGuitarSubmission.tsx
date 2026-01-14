import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SubmissionData {
  serialNumber: string;
  neckBlock?: string;
  model?: string;
  year?: string;
  purchaseLocation?: string;
  notes?: string;
  tunerType?: string;
  trussRodLocation?: string;
  bridgeStyle?: string;
  labelType?: string;
  labelColor?: string;
  email?: string;
  story?: string;
  displayName?: string;
  isStoryPublic?: boolean;
}

export const useGuitarSubmission = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadPhoto = async (file: File, guitarId: string, photoType: string) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${guitarId}/${photoType}-${Date.now()}.${fileExt}`;

    const { error: uploadError, data } = await supabase.storage
      .from("guitar-photos")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from("guitar-photos")
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  const submit = async (data: SubmissionData, photos: File[]) => {
    setLoading(true);
    setError(null);

    try {
      // Find model ID if model name provided
      let modelId = null;
      if (data.model) {
        const { data: modelData } = await supabase
          .from("models")
          .select("id")
          .eq("model_name", data.model)
          .maybeSingle();
        modelId = modelData?.id || null;
      }

      // Insert guitar record
      const { data: guitarData, error: insertError } = await supabase
        .from("guitars")
        .insert({
          serial_number: data.serialNumber,
          neck_block_number: data.neckBlock || null,
          model_id: modelId,
          estimated_year: data.year ? parseInt(data.year) : null,
          tuner_type: data.tunerType || null,
          truss_rod_location: data.trussRodLocation || null,
          bridge_style: data.bridgeStyle || null,
          label_type: data.labelType || null,
          label_color: data.labelColor || null,
          submitted_by_email: data.email || null,
          submission_notes: [data.purchaseLocation, data.notes].filter(Boolean).join("\n\n"),
          status: "pending",
          confidence_level: "medium",
          story: data.story || null,
          display_name: data.displayName || null,
          is_story_public: data.isStoryPublic || false,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Upload photos
      if (photos.length > 0) {
        const photoPromises = photos.map((photo, index) => {
          const photoType = index === 0 ? "headstock" : index === 1 ? "body" : "other";
          return uploadPhoto(photo, guitarData.id, photoType).then((url) => ({
            guitar_id: guitarData.id,
            photo_url: url,
            photo_type: photoType,
          }));
        });

        const photoRecords = await Promise.all(photoPromises);

        const { error: photosError } = await supabase
          .from("guitar_photos")
          .insert(photoRecords);

        if (photosError) {
          console.error("Photo insert error:", photosError);
        }
      }

      return { success: true, guitarId: guitarData.id };
    } catch (err) {
      console.error("Submission error:", err);
      setError("Failed to submit guitar. Please try again.");
      return { success: false, guitarId: null };
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading, error };
};
