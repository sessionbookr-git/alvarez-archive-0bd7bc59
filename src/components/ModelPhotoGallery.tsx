import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ModelPhotoGalleryProps {
  photos: { photo_url: string; caption?: string | null }[];
  fallbackUrl?: string | null;
  modelName: string;
}

const ModelPhotoGallery = ({ photos, fallbackUrl, modelName }: ModelPhotoGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Combine main photo with additional photos
  const allPhotos = fallbackUrl 
    ? [{ photo_url: fallbackUrl, caption: null }, ...photos]
    : photos;

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

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative group">
        <img
          src={allPhotos[activeIndex].photo_url}
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
      </div>

      {/* Caption */}
      {allPhotos[activeIndex].caption && (
        <p className="text-sm text-muted-foreground text-center italic">
          {allPhotos[activeIndex].caption}
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
                "aspect-square rounded-md overflow-hidden border-2 transition-all",
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
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModelPhotoGallery;
