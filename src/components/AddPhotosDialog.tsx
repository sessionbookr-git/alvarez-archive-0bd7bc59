import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Camera, X, Loader2, Upload, ImagePlus } from "lucide-react";

interface AddPhotosDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guitarId: string;
  guitarName: string;
}

export const AddPhotosDialog = ({
  open,
  onOpenChange,
  guitarId,
  guitarName,
}: AddPhotosDialogProps) => {
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const uploadPromises = files.map(async (file, index) => {
        const fileExt = file.name.split(".").pop();
        const fileName = `${guitarId}/additional-${Date.now()}-${index}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("guitar-photos")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("guitar-photos")
          .getPublicUrl(fileName);

        return {
          guitar_id: guitarId,
          photo_url: urlData.publicUrl,
          photo_type: "other",
        };
      });

      const photoRecords = await Promise.all(uploadPromises);

      const { error: insertError } = await supabase
        .from("guitar_photos")
        .insert(photoRecords);

      if (insertError) throw insertError;

      return photoRecords;
    },
    onSuccess: () => {
      toast.success("Photos added successfully!");
      queryClient.invalidateQueries({ queryKey: ["my-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["community-stories"] });
      handleClose();
    },
    onError: (error) => {
      console.error("Upload error:", error);
      toast.error("Failed to upload photos. Please try again.");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + photos.length > 8) {
      toast.error("Maximum 8 photos allowed per submission");
      return;
    }

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPhotos((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClose = () => {
    previews.forEach((url) => URL.revokeObjectURL(url));
    setPhotos([]);
    setPreviews([]);
    onOpenChange(false);
  };

  const handleSubmit = () => {
    if (photos.length === 0) {
      toast.error("Please select at least one photo");
      return;
    }
    uploadMutation.mutate(photos);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImagePlus className="h-5 w-5 text-primary" />
            Add Photos
          </DialogTitle>
          <DialogDescription>
            Add more photos to your {guitarName} submission.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Photo Upload Area */}
          <div>
            <Label>Select Photos</Label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
            >
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Click to select photos or drag and drop
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG up to 10MB each (max 8 total)
              </p>
            </div>
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Photo Previews */}
          {previews.length > 0 && (
            <div>
              <Label>Selected Photos ({previews.length})</Label>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {previews.map((preview, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleClose} disabled={uploadMutation.isPending}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={photos.length === 0 || uploadMutation.isPending}
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-2" />
                  Upload {photos.length} Photo{photos.length !== 1 ? "s" : ""}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
