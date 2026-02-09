import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ImagePlus,
  Trash2,
  Star,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  Upload,
} from "lucide-react";
import { validateImageFiles, compressImage } from "@/lib/fileValidation";

interface Photo {
  id: string;
  photo_url: string;
  photo_type: string | null;
}

interface AdminPhotoManagerProps {
  guitarId: string;
  photos: Photo[];
  serialNumber: string;
}

export const AdminPhotoManager = ({
  guitarId,
  photos,
  serialNumber,
}: AdminPhotoManagerProps) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [deletePhoto, setDeletePhoto] = useState<Photo | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (photo: Photo) => {
      // Delete from storage first
      try {
        const url = new URL(photo.photo_url);
        const pathMatch = url.pathname.match(/\/guitar-photos\/(.+)$/);
        if (pathMatch) {
          await supabase.storage.from("guitar-photos").remove([pathMatch[1]]);
        }
      } catch {
        // Storage deletion is best-effort; continue with DB deletion
      }

      const { error } = await supabase
        .from("guitar_photos")
        .delete()
        .eq("id", photo.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-submissions"] });
      toast.success("Photo deleted");
      setDeletePhoto(null);
    },
    onError: (err: Error) => {
      toast.error("Failed to delete photo: " + err.message);
    },
  });

  const setPrimaryMutation = useMutation({
    mutationFn: async (photo: Photo) => {
      // Set the selected photo's type to "headstock" (primary) and demote the current primary
      const currentPrimary = photos.find(
        (p) => p.photo_type === "headstock" && p.id !== photo.id
      );

      const updates = [
        supabase
          .from("guitar_photos")
          .update({ photo_type: "headstock" })
          .eq("id", photo.id),
      ];

      if (currentPrimary) {
        updates.push(
          supabase
            .from("guitar_photos")
            .update({ photo_type: "other" })
            .eq("id", currentPrimary.id)
        );
      }

      const results = await Promise.all(updates);
      for (const { error } of results) {
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-submissions"] });
      toast.success("Primary photo updated");
    },
    onError: (err: Error) => {
      toast.error("Failed to set primary: " + err.message);
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (files.length + photos.length > 8) {
      toast.error("Maximum 8 photos allowed per submission");
      e.target.value = "";
      return;
    }

    const validation = validateImageFiles(files);
    if (!validation.valid) {
      toast.error(validation.error);
      e.target.value = "";
      return;
    }

    setUploading(true);
    try {
      const uploadPromises = files.map(async (file, index) => {
        const compressedFile = await compressImage(file);
        const fileExt = compressedFile.name.split(".").pop() || "jpg";
        const fileName = `${guitarId}/admin-${Date.now()}-${index}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("guitar-photos")
          .upload(fileName, compressedFile);
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

      queryClient.invalidateQueries({ queryKey: ["admin-submissions"] });
      toast.success(`${files.length} photo${files.length > 1 ? "s" : ""} added`);
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Failed to upload photos");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const isPrimary = (photo: Photo) => photo.photo_type === "headstock";

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-muted-foreground">
          Photos ({photos.length}/8)
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || photos.length >= 8}
        >
          {uploading ? (
            <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
          ) : (
            <ImagePlus className="h-3.5 w-3.5 mr-1" />
          )}
          Add Photos
        </Button>
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {photos.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
        >
          <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
          <p className="text-sm text-muted-foreground">Click to add photos</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="relative group aspect-square rounded-lg overflow-hidden bg-muted"
            >
              <img
                src={photo.photo_url}
                alt={photo.photo_type || "Guitar photo"}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setLightboxIndex(index)}
              />
              {isPrimary(photo) && (
                <Badge className="absolute top-1 left-1 bg-amber-500/90 text-white text-[10px] px-1.5 py-0.5">
                  <Star className="h-2.5 w-2.5 mr-0.5 fill-white" />
                  Primary
                </Badge>
              )}
              {/* Hover overlay with actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                {!isPrimary(photo) && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-7 text-xs"
                    onClick={() => setPrimaryMutation.mutate(photo)}
                    disabled={setPrimaryMutation.isPending}
                  >
                    <Star className="h-3 w-3 mr-0.5" />
                    Primary
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-7 text-xs"
                  onClick={() => setDeletePhoto(photo)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox / Carousel */}
      <Dialog
        open={lightboxIndex !== null}
        onOpenChange={(open) => !open && setLightboxIndex(null)}
      >
        <DialogContent className="max-w-4xl p-0 bg-black/95 border-none">
          {lightboxIndex !== null && photos[lightboxIndex] && (
            <div className="relative flex items-center justify-center min-h-[60vh]">
              <img
                src={photos[lightboxIndex].photo_url}
                alt={`Photo ${lightboxIndex + 1}`}
                className="max-h-[80vh] max-w-full object-contain"
              />

              {/* Close */}
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 text-white hover:bg-white/20"
                onClick={() => setLightboxIndex(null)}
              >
                <X className="h-5 w-5" />
              </Button>

              {/* Nav */}
              {photos.length > 1 && (
                <>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                    onClick={() =>
                      setLightboxIndex(
                        (lightboxIndex - 1 + photos.length) % photos.length
                      )
                    }
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                    onClick={() =>
                      setLightboxIndex((lightboxIndex + 1) % photos.length)
                    }
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}

              {/* Counter & type badge */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
                <span className="text-white/70 text-sm">
                  {lightboxIndex + 1} / {photos.length}
                </span>
                {isPrimary(photos[lightboxIndex]) && (
                  <Badge className="bg-amber-500/90 text-white text-xs">
                    <Star className="h-3 w-3 mr-0.5 fill-white" />
                    Primary
                  </Badge>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deletePhoto}
        onOpenChange={(open) => !open && setDeletePhoto(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this photo?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the photo from the submission for{" "}
              <strong>{serialNumber}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletePhoto && deleteMutation.mutate(deletePhoto)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Photo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
