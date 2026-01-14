import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Star, Music, Calendar, MapPin } from "lucide-react";

const Community = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: stories, isLoading } = useQuery({
    queryKey: ["community-stories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("guitars")
        .select(`
          id,
          serial_number,
          estimated_year,
          story,
          display_name,
          is_featured,
          approved_at,
          model:models(model_name, series),
          photos:guitar_photos(photo_url, photo_type)
        `)
        .eq("status", "approved")
        .eq("is_story_public", true)
        .not("story", "is", null)
        .order("is_featured", { ascending: false })
        .order("approved_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const filteredStories = stories?.filter((story) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      story.model?.model_name?.toLowerCase().includes(query) ||
      story.display_name?.toLowerCase().includes(query) ||
      story.story?.toLowerCase().includes(query) ||
      story.serial_number?.toLowerCase().includes(query)
    );
  });

  const featuredStories = filteredStories?.filter((s) => s.is_featured);
  const regularStories = filteredStories?.filter((s) => !s.is_featured);

  const getPrimaryPhoto = (photos: { photo_url: string; photo_type: string | null }[] | null) => {
    if (!photos || photos.length === 0) return null;
    const bodyPhoto = photos.find((p) => p.photo_type === "body");
    return bodyPhoto?.photo_url || photos[0]?.photo_url;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-amber-50/50 to-background dark:from-amber-900/10">
          <div className="container-wide text-center">
            <Badge variant="outline" className="mb-4">
              <Music className="h-3 w-3 mr-1" />
              Community Stories
            </Badge>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
              The Stories Behind the Strings
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Discover the personal journeys of Alvarez guitars and the musicians who treasure them. 
              Every instrument has a story—here are some of ours.
            </p>
            
            {/* Search */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search stories by model, contributor, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </section>

        {/* Featured Stories */}
        {featuredStories && featuredStories.length > 0 && (
          <section className="py-12 border-b border-border">
            <div className="container-wide">
              <div className="flex items-center gap-2 mb-8">
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                <h2 className="text-2xl font-semibold">Featured Stories</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                {featuredStories.map((guitar) => (
                  <Card key={guitar.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                    <div className="grid md:grid-cols-2">
                      {getPrimaryPhoto(guitar.photos) && (
                        <div className="aspect-square md:aspect-auto overflow-hidden bg-muted">
                          <img
                            src={getPrimaryPhoto(guitar.photos)!}
                            alt={guitar.model?.model_name || "Guitar"}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <CardContent className="p-6 flex flex-col justify-center">
                        <Badge className="w-fit mb-3 bg-amber-500/10 text-amber-700 border-amber-200">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          Featured
                        </Badge>
                        <h3 className="text-xl font-semibold mb-1">
                          {guitar.model?.model_name || `Serial #${guitar.serial_number}`}
                        </h3>
                        {guitar.model?.series && (
                          <p className="text-sm text-muted-foreground mb-3">{guitar.model.series} Series</p>
                        )}
                        <p className="text-muted-foreground line-clamp-4 mb-4">{guitar.story}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-auto">
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
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* All Stories */}
        <section className="py-12">
          <div className="container-wide">
            <h2 className="text-2xl font-semibold mb-8">
              {featuredStories?.length ? "More Stories" : "Community Stories"}
              <span className="text-muted-foreground font-normal text-lg ml-2">
                ({regularStories?.length || 0})
              </span>
            </h2>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : regularStories?.length === 0 && !featuredStories?.length ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <Music className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium mb-2">No Stories Yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Be the first to share your guitar's story! When you submit a guitar, 
                    you can choose to share its history with the community.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularStories?.map((guitar) => (
                  <Card key={guitar.id} className="overflow-hidden group hover:shadow-md transition-shadow">
                    {getPrimaryPhoto(guitar.photos) && (
                      <div className="aspect-[4/3] overflow-hidden bg-muted">
                        <img
                          src={getPrimaryPhoto(guitar.photos)!}
                          alt={guitar.model?.model_name || "Guitar"}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <CardContent className="p-5">
                      <h3 className="font-semibold mb-1">
                        {guitar.model?.model_name || `Serial #${guitar.serial_number}`}
                      </h3>
                      {guitar.model?.series && (
                        <p className="text-sm text-muted-foreground mb-2">{guitar.model.series} Series</p>
                      )}
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{guitar.story}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Community;