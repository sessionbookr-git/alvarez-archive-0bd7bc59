import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ArrowRight, Music, Calendar, Quote } from "lucide-react";

const FeaturedStories = () => {
  const { data: stories, isLoading } = useQuery({
    queryKey: ["featured-stories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("guitars")
        .select(`
          id,
          serial_number,
          estimated_year,
          story,
          display_name,
          approved_at,
          model_name_submitted,
          body_style,
          top_wood,
          model:models(model_name, series),
          photos:guitar_photos(photo_url, photo_type)
        `)
        .eq("status", "approved")
        .eq("is_story_public", true)
        .eq("is_featured", true)
        .not("story", "is", null)
        .order("approved_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      return data;
    },
  });

  // Don't render if no featured stories
  if (!stories || stories.length === 0) return null;

  const getPrimaryPhoto = (photos: { photo_url: string; photo_type: string | null }[] | null) => {
    if (!photos || photos.length === 0) return null;
    const bodyPhoto = photos.find((p) => p.photo_type === "body");
    return bodyPhoto?.photo_url || photos[0]?.photo_url;
  };

  const truncateStory = (story: string, maxLength: number = 150) => {
    if (story.length <= maxLength) return story;
    return story.slice(0, maxLength).trim() + "...";
  };

  // Helper to get display name for guitar
  const getGuitarDisplayName = (guitar: NonNullable<typeof stories>[number]) => {
    if (guitar.model?.model_name) return guitar.model.model_name;
    if (guitar.model_name_submitted) return guitar.model_name_submitted;
    return null;
  };

  // Helper to build specs string
  const getSpecsLine = (guitar: NonNullable<typeof stories>[number]) => {
    const parts: string[] = [];
    if (guitar.body_style) parts.push(guitar.body_style);
    if (guitar.top_wood) parts.push(guitar.top_wood);
    return parts.join(" • ");
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background to-amber-50/30 dark:to-amber-900/5">
      <div className="container-wide">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
              <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50">
                Community Spotlight
              </Badge>
            </div>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Stories from the Community
            </h2>
            <p className="text-muted-foreground mt-2 max-w-lg">
              Real stories from real collectors sharing the history and memories behind their Alvarez guitars.
            </p>
          </div>
          <Button variant="outline" asChild className="gap-2 w-fit">
            <Link to="/community">
              View All Stories
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Stories Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {stories.map((guitar, index) => {
            const displayName = getGuitarDisplayName(guitar);
            const specsLine = getSpecsLine(guitar);
            return (
              <Card 
                key={guitar.id} 
                className={`overflow-hidden group hover:shadow-lg transition-all duration-300 ${
                  index === 0 ? "md:col-span-2 md:row-span-1" : ""
                }`}
              >
                <div className={`${index === 0 ? "md:grid md:grid-cols-2" : ""}`}>
                  {getPrimaryPhoto(guitar.photos) && (
                    <div className={`${index === 0 ? "aspect-[4/3] md:aspect-auto" : "aspect-[4/3]"} overflow-hidden bg-muted relative`}>
                      <img
                        src={getPrimaryPhoto(guitar.photos)!}
                        alt={displayName || "Guitar"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-amber-500/90 text-white border-0">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          Featured
                        </Badge>
                      </div>
                    </div>
                  )}
                  <CardContent className={`p-6 ${index === 0 ? "flex flex-col justify-center" : ""}`}>
                    <h3 className="font-semibold text-lg mb-1">
                      {displayName || "Alvarez Guitar"}
                    </h3>
                    {guitar.model?.series && (
                      <p className="text-sm text-amber-700 mb-1">{guitar.model.series} Series</p>
                    )}
                    {specsLine && (
                      <p className="text-xs text-muted-foreground mb-3">{specsLine}</p>
                    )}
                    <div className="flex items-start gap-2 mb-3">
                      <Quote className="h-6 w-6 text-amber-500/30 flex-shrink-0 -mt-0.5" />
                      <p className={`text-muted-foreground italic ${index === 0 ? "line-clamp-4" : "line-clamp-3"}`}>
                        {truncateStory(guitar.story || "", index === 0 ? 200 : 120)}
                      </p>
                    </div>
                    <div className="mt-auto pt-3 border-t border-border/50">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        {guitar.display_name && (
                          <span className="flex items-center gap-1">
                            <Music className="h-3 w-3" />
                            {guitar.display_name}
                          </span>
                        )}
                        {guitar.estimated_year && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {guitar.estimated_year}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            Have a story to share about your Alvarez guitar?
          </p>
          <Button asChild className="gap-2">
            <Link to="/submit">
              <Music className="h-4 w-4" />
              Submit Your Guitar & Story
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedStories;