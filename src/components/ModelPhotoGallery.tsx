import { useState } from "react";
import { ChevronLeft, ChevronRight, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ModelPhotoGalleryProps {
  photos: { photo_url: string; caption?: string | null }[];
  fallbackUrl?: string | null;
  modelName: string;
  modelId?: string;
  isAdmin?: boolean;
}

const ModelPhotoGallery = ({ photos, fallbackUrl, modelName, modelId, isAdmin }: ModelPhotoGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const queryClient = useQueryClient();

  // Combine main photo with additional photos
  const allPhotos = fallbackUrl 
    ? [{ photo_url: fallbackUrl, caption: null }, ...photos]
    : photos;

  const setCoverMutation = useMutation({
    mutationFn: async (photoUrl: string) => {
      if (!modelId) throw new Error("No model ID");
      const { error } = await supabase
        .from("models")
        .update({ photo_url: photoUrl })
        .eq("id", modelId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["models"] });
      queryClient.invalidateQueries({ queryKey: ["model", modelId] });
      queryClient.invalidateQueries({ queryKey: ["admin-models"] });
      toast.success("Cover photo updated");
    },
    onError: (err: Error) => {
      toast.error("Failed to update cover: " + err.message);
    },
  });

  if (allPhotos.length === 0) {
    return (
      <div className="aspect-square bg-secondary rounded-lg flex items-center justify-center">
        <span className="text-muted-foreground">Photo Coming Soon</span>
      </div>
    );
  }

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? allPhotos.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === allPhotos.length - 1 ? 0 : prev + 1));
  };

  const currentPhoto = allPhotos[activeIndex];
  const isCover = currentPhoto.photo_url === fallbackUrl;

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative group">
        <img
          src={currentPhoto.photo_url}
          alt={`${modelName} - Photo ${activeIndex + 1}`}
          className="w-full aspect-square object-cover rounded-lg"
        />
        
        {/* Navigation Arrows */}
        {allPhotos.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-10 w-10"
              onClick={handlePrev}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-10 w-10"
              onClick={handleNext}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}

        {/* Image Counter */}
        {allPhotos.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium">
            {activeIndex + 1} / {allPhotos.length}
          </div>
        )}

        {/* Cover badge */}
        {isCover && (
          <div className="absolute top-3 left-3 bg-primary/90 backdrop-blur-sm text-primary-foreground px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
            <Star className="h-3 w-3 fill-current" /> Cover
          </div>
        )}

        {/* Admin: Set as Cover button */}
        {isAdmin && modelId && !isCover && allPhotos.length > 1 && (
          <Button
            size="sm"
            variant="secondary"
            className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => setCoverMutation.mutate(currentPhoto.photo_url)}
            disabled={setCoverMutation.isPending}
          >
            {setCoverMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
            ) : (
              <Star className="h-3.5 w-3.5 mr-1" />
            )}
            Set as Cover
          </Button>
        )}
      </div>

      {/* Caption */}
      {currentPhoto.caption && (
        <p className="text-sm text-muted-foreground text-center italic">
          {currentPhoto.caption}
        </p>
      )}

      {/* Thumbnails */}
      {allPhotos.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {allPhotos.slice(0, 8).map((photo, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "aspect-square rounded-md overflow-hidden border-2 transition-all relative",
                activeIndex === index 
                  ? "border-primary ring-2 ring-primary/20" 
                  : "border-transparent hover:border-muted-foreground/30"
              )}
            >
              <img
                src={photo.photo_url}
                alt={`${modelName} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {photo.photo_url === fallbackUrl && (
                <div className="absolute top-0.5 left-0.5">
                  <Star className="h-3 w-3 text-primary fill-primary" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModelPhotoGallery;
