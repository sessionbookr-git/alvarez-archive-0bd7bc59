import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Loader2, AlertTriangle, CheckCircle } from "lucide-react";

interface GuitarSubmission {
  id: string;
  model_name_submitted: string | null;
  estimated_year: number | null;
  body_style: string | null;
  country_of_origin: string | null;
  electronics: string | null;
  top_wood: string | null;
  back_sides_wood: string | null;
  finish_type: string | null;
  photos?: { id: string; photo_url: string; photo_type: string | null }[];
  model?: { model_name: string; series: string | null } | null;
  model_id: string | null;
}

interface Props {
  guitar: GuitarSubmission;
}

export const PromoteToEncyclopediaButton = ({ guitar }: Props) => {
  const [open, setOpen] = useState(false);
  const [existingModel, setExistingModel] = useState<{ id: string; model_name: string; photo_url: string | null } | null>(null);
  const [checked, setChecked] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const modelName = guitar.model?.model_name || guitar.model_name_submitted;

  const checkExisting = async () => {
    setOpen(true);
    setChecked(false);
    setExistingModel(null);

    if (modelName) {
      const { data } = await supabase
        .from("models")
        .select("id, model_name, photo_url")
        .eq("model_name", modelName)
        .maybeSingle();
      setExistingModel(data || null);
    }
    setChecked(true);
  };

  const promoteMutation = useMutation({
    mutationFn: async () => {
      if (!modelName) throw new Error("No model name available");

      let modelId: string;

      if (existingModel) {
        // Update existing model with submission data, set published
        const updates: Record<string, unknown> = { is_published: true };
        if (guitar.body_style) updates.body_shape = guitar.body_style;
        if (guitar.country_of_origin) updates.country_of_manufacture = guitar.country_of_origin;
        if (guitar.estimated_year) {
          updates.production_start_year = guitar.estimated_year;
          updates.production_end_year = guitar.estimated_year;
        }

        const { error } = await supabase.from("models").update(updates).eq("id", existingModel.id);
        if (error) throw error;
        modelId = existingModel.id;
      } else {
        // Create new model
        const { data: newModel, error } = await supabase
          .from("models")
          .insert({
            model_name: modelName,
            body_shape: guitar.body_style || null,
            country_of_manufacture: guitar.country_of_origin || null,
            production_start_year: guitar.estimated_year || null,
            is_published: true,
          })
          .select("id")
          .single();
        if (error) throw error;
        modelId = newModel.id;
      }

      // Link guitar to model if not already linked
      if (!guitar.model_id || guitar.model_id !== modelId) {
        await supabase.from("guitars").update({ model_id: modelId }).eq("id", guitar.id);
      }

      // Copy submission photos as model photos (replace existing)
      if (guitar.photos && guitar.photos.length > 0) {
        // Remove old model photos first
        await supabase.from("model_photos").delete().eq("model_id", modelId);

        // Set first photo as the model primary photo
        const primaryPhoto = guitar.photos[0]?.photo_url;
        if (primaryPhoto) {
          await supabase.from("models").update({ photo_url: primaryPhoto }).eq("id", modelId);
        }

        // Insert all as model_photos
        const modelPhotos = guitar.photos.map((p, i) => ({
          model_id: modelId,
          photo_url: p.photo_url,
          photo_order: i,
          caption: p.photo_type || null,
        }));

        const { error: photoError } = await supabase.from("model_photos").insert(modelPhotos);
        if (photoError) throw photoError;
      }

      return { modelId, isNew: !existingModel };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["admin-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["models"] });
      queryClient.invalidateQueries({ queryKey: ["admin-models"] });
      toast({
        title: result.isNew ? "Model created in Encyclopedia!" : "Encyclopedia entry updated!",
        description: `${modelName} is now published with photos from this submission.`,
      });
      setOpen(false);
    },
    onError: (err: Error) => {
      toast({ title: "Failed to publish", description: err.message, variant: "destructive" });
    },
  });

  if (!modelName) return null;

  return (
    <>
      <Button size="sm" variant="outline" onClick={checkExisting} className="text-emerald-600 border-emerald-600/30 hover:bg-emerald-50">
        <BookOpen className="h-4 w-4 mr-1" /> Publish to Encyclopedia
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish to Encyclopedia</DialogTitle>
            <DialogDescription>
              Use this submission's data and photos as the encyclopedia entry for <strong>{modelName}</strong>.
            </DialogDescription>
          </DialogHeader>

          {!checked ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4">
              {existingModel ? (
                <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-amber-900 dark:text-amber-100">Model already exists</p>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      A <strong>{existingModel.model_name}</strong> entry already exists in the encyclopedia.
                      This will <strong>replace its photos</strong> with photos from this submission and re-publish it.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-emerald-900 dark:text-emerald-100">New encyclopedia entry</p>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                      This will create a new <strong>{modelName}</strong> entry in the encyclopedia using this submission's photos and details.
                    </p>
                  </div>
                </div>
              )}

              {guitar.photos && guitar.photos.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {guitar.photos.length} photo{guitar.photos.length !== 1 ? "s" : ""} will be used:
                  </p>
                  <div className="flex gap-2 overflow-x-auto">
                    {guitar.photos.map((p) => (
                      <img
                        key={p.id}
                        src={p.photo_url}
                        alt={p.photo_type || "Guitar"}
                        className="h-20 w-20 object-cover rounded-md border"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              onClick={() => promoteMutation.mutate()}
              disabled={!checked || promoteMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {promoteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {existingModel ? "Update & Publish" : "Create & Publish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
