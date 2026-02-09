import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, BookOpen, Eye, EyeOff } from "lucide-react";

interface EditSubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guitar: {
    id: string;
    serial_number: string;
    neck_block_number: string | null;
    model_name_submitted: string | null;
    estimated_year: number | null;
    body_style: string | null;
    electronics: string | null;
    top_wood: string | null;
    back_sides_wood: string | null;
    finish_type: string | null;
    country_of_origin: string | null;
    tuner_type: string | null;
    bridge_style: string | null;
    label_type: string | null;
    label_color: string | null;
    submission_notes: string | null;
    story: string | null;
    display_name: string | null;
    is_story_public: boolean | null;
  };
}

export const EditSubmissionDialog = ({ open, onOpenChange, guitar }: EditSubmissionDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    serial_number: guitar.serial_number,
    neck_block_number: guitar.neck_block_number || "",
    model_name_submitted: guitar.model_name_submitted || "",
    estimated_year: guitar.estimated_year?.toString() || "",
    body_style: guitar.body_style || "",
    electronics: guitar.electronics || "",
    top_wood: guitar.top_wood || "",
    back_sides_wood: guitar.back_sides_wood || "",
    finish_type: guitar.finish_type || "",
    country_of_origin: guitar.country_of_origin || "",
    tuner_type: guitar.tuner_type || "",
    bridge_style: guitar.bridge_style || "",
    label_type: guitar.label_type || "",
    label_color: guitar.label_color || "",
    submission_notes: guitar.submission_notes || "",
    story: guitar.story || "",
    display_name: guitar.display_name || "",
    is_story_public: guitar.is_story_public || false,
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("guitars")
        .update({
          serial_number: formData.serial_number,
          neck_block_number: formData.neck_block_number || null,
          model_name_submitted: formData.model_name_submitted || null,
          estimated_year: formData.estimated_year ? parseInt(formData.estimated_year) : null,
          body_style: formData.body_style || null,
          electronics: formData.electronics || null,
          top_wood: formData.top_wood || null,
          back_sides_wood: formData.back_sides_wood || null,
          finish_type: formData.finish_type || null,
          country_of_origin: formData.country_of_origin || null,
          tuner_type: formData.tuner_type || null,
          bridge_style: formData.bridge_style || null,
          label_type: formData.label_type || null,
          label_color: formData.label_color || null,
          submission_notes: formData.submission_notes || null,
          story: formData.story || null,
          display_name: formData.display_name || null,
          is_story_public: formData.is_story_public,
        })
        .eq("id", guitar.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-submissions"] });
      toast({ title: "Submission updated", description: "Your changes have been saved." });
      onOpenChange(false);
    },
    onError: (err: Error) => {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    },
  });

  const set = (field: string, value: string | boolean) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Submission</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Identification */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Identification</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="edit-serial">Serial Number *</Label>
                <Input id="edit-serial" value={formData.serial_number} onChange={(e) => set("serial_number", e.target.value)} className="mt-1.5" required />
              </div>
              <div>
                <Label htmlFor="edit-neck">Neck Block Number</Label>
                <Input id="edit-neck" value={formData.neck_block_number} onChange={(e) => set("neck_block_number", e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="edit-model">Model Name/Number</Label>
                <Input id="edit-model" value={formData.model_name_submitted} onChange={(e) => set("model_name_submitted", e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="edit-year">Production Year</Label>
                <Input id="edit-year" value={formData.estimated_year} onChange={(e) => set("estimated_year", e.target.value)} className="mt-1.5" />
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Specifications</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="edit-body">Body Style</Label>
                <Input id="edit-body" value={formData.body_style} onChange={(e) => set("body_style", e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="edit-electronics">Electronics</Label>
                <Input id="edit-electronics" value={formData.electronics} onChange={(e) => set("electronics", e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="edit-top">Top Wood</Label>
                <Input id="edit-top" value={formData.top_wood} onChange={(e) => set("top_wood", e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="edit-back">Back & Sides Wood</Label>
                <Input id="edit-back" value={formData.back_sides_wood} onChange={(e) => set("back_sides_wood", e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="edit-finish">Finish Type</Label>
                <Input id="edit-finish" value={formData.finish_type} onChange={(e) => set("finish_type", e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="edit-country">Country of Origin</Label>
                <Input id="edit-country" value={formData.country_of_origin} onChange={(e) => set("country_of_origin", e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="edit-tuner">Tuner Type</Label>
                <Input id="edit-tuner" value={formData.tuner_type} onChange={(e) => set("tuner_type", e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="edit-bridge">Bridge Style</Label>
                <Input id="edit-bridge" value={formData.bridge_style} onChange={(e) => set("bridge_style", e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="edit-label-type">Label Type</Label>
                <Input id="edit-label-type" value={formData.label_type} onChange={(e) => set("label_type", e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="edit-label-color">Label Color</Label>
                <Input id="edit-label-color" value={formData.label_color} onChange={(e) => set("label_color", e.target.value)} className="mt-1.5" />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="edit-notes">Additional Notes</Label>
            <Textarea id="edit-notes" value={formData.submission_notes} onChange={(e) => set("submission_notes", e.target.value)} className="mt-1.5" rows={3} />
          </div>

          {/* Story */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Your Story</h3>
            </div>
            <div>
              <Label htmlFor="edit-story">Story</Label>
              <Textarea id="edit-story" value={formData.story} onChange={(e) => set("story", e.target.value)} className="mt-1.5" rows={4} placeholder="How did you acquire this guitar? What does it mean to you?" />
            </div>
            <div>
              <Label htmlFor="edit-display">Display Name</Label>
              <Input id="edit-display" value={formData.display_name} onChange={(e) => set("display_name", e.target.value)} className="mt-1.5" placeholder="How you'd like to be credited" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {formData.is_story_public ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                <Label>Make story public</Label>
              </div>
              <Switch checked={formData.is_story_public} onCheckedChange={(v) => set("is_story_public", v)} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending || !formData.serial_number.trim()}>
              {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
