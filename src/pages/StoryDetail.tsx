import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import {
  ArrowLeft,
  Heart,
  Share2,
  Music,
  Calendar,
  MapPin,
  Guitar,
  Users,
  MessageSquare,
  Check,
  Star,
  Send,
  Twitter,
  Facebook,
  Link as LinkIcon,
  Copy,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

const StoryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");

  // Fetch guitar story
  const { data: guitar, isLoading } = useQuery({
    queryKey: ["story-detail", id],
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
          model_name_submitted,
          body_style,
          electronics,
          top_wood,
          back_sides_wood,
          finish_type,
          country_of_origin,
          model:models(model_name, series),
          photos:guitar_photos(id, photo_url, photo_type)
        `)
        .eq("id", id)
        .eq("status", "approved")
        .eq("is_story_public", true)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch likes count and user's like status
  const { data: likesData } = useQuery({
    queryKey: ["guitar-likes", id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("guitar_likes")
        .select("*", { count: "exact", head: true })
        .eq("guitar_id", id);

      if (error) throw error;

      let userLiked = false;
      if (user) {
        const { data: userLike } = await supabase
          .from("guitar_likes")
          .select("id")
          .eq("guitar_id", id)
          .eq("user_id", user.id)
          .maybeSingle();
        userLiked = !!userLike;
      }

      return { count: count || 0, userLiked };
    },
    enabled: !!id,
  });

  // Fetch ownership count and user's ownership status
  const { data: ownershipData } = useQuery({
    queryKey: ["guitar-ownership", id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("guitar_ownership")
        .select("*", { count: "exact", head: true })
        .eq("guitar_id", id);

      if (error) throw error;

      let userOwns = false;
      if (user) {
        const { data: userOwnership } = await supabase
          .from("guitar_ownership")
          .select("id")
          .eq("guitar_id", id)
          .eq("user_id", user.id)
          .maybeSingle();
        userOwns = !!userOwnership;
      }

      return { count: count || 0, userOwns };
    },
    enabled: !!id,
  });

  // Fetch comments
  const { data: comments } = useQuery({
    queryKey: ["guitar-comments", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("guitar_comments")
        .select("*")
        .eq("guitar_id", id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in");
      
      if (likesData?.userLiked) {
        const { error } = await supabase
          .from("guitar_likes")
          .delete()
          .eq("guitar_id", id)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("guitar_likes")
          .insert({ guitar_id: id, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guitar-likes", id] });
    },
  });

  // Ownership mutation
  const ownershipMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in");
      
      if (ownershipData?.userOwns) {
        const { error } = await supabase
          .from("guitar_ownership")
          .delete()
          .eq("guitar_id", id)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("guitar_ownership")
          .insert({ guitar_id: id, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guitar-ownership", id] });
      toast({
        title: ownershipData?.userOwns ? "Removed" : "Added!",
        description: ownershipData?.userOwns 
          ? "You've removed this guitar from your collection"
          : "You've added this guitar to your collection",
      });
    },
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error("Must be logged in");
      
      const { error } = await supabase
        .from("guitar_comments")
        .insert({ guitar_id: id, user_id: user.id, content });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guitar-comments", id] });
      setNewComment("");
      toast({ title: "Comment added!" });
    },
  });

  const handleLike = () => {
    if (!user) {
      navigate("/auth?redirect=/community/" + id);
      return;
    }
    likeMutation.mutate();
  };

  const handleOwnership = () => {
    if (!user) {
      navigate("/auth?redirect=/community/" + id);
      return;
    }
    ownershipMutation.mutate();
  };

  const handleComment = () => {
    if (!user) {
      navigate("/auth?redirect=/community/" + id);
      return;
    }
    if (newComment.trim()) {
      commentMutation.mutate(newComment.trim());
    }
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = `Check out this ${getDisplayName()} on Alvarez Archive`;
    
    switch (platform) {
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, "_blank");
        break;
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
        break;
      case "copy":
        navigator.clipboard.writeText(url);
        toast({ title: "Link copied to clipboard!" });
        break;
    }
  };

  const getDisplayName = () => {
    if (guitar?.model?.model_name) return guitar.model.model_name;
    if (guitar?.model_name_submitted) return guitar.model_name_submitted;
    return "Alvarez Guitar";
  };

  const getSpecs = () => {
    const specs: { label: string; value: string }[] = [];
    if (guitar?.body_style) specs.push({ label: "Body Style", value: guitar.body_style });
    if (guitar?.top_wood) specs.push({ label: "Top Wood", value: guitar.top_wood });
    if (guitar?.back_sides_wood) specs.push({ label: "Back/Sides", value: guitar.back_sides_wood });
    if (guitar?.electronics) specs.push({ label: "Electronics", value: guitar.electronics });
    if (guitar?.finish_type) specs.push({ label: "Finish", value: guitar.finish_type });
    if (guitar?.country_of_origin) specs.push({ label: "Made In", value: guitar.country_of_origin });
    if (guitar?.estimated_year) specs.push({ label: "Year", value: String(guitar.estimated_year) });
    if (guitar?.serial_number) specs.push({ label: "Serial", value: guitar.serial_number });
    return specs;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!guitar) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-semibold mb-2">Story Not Found</h2>
              <p className="text-muted-foreground mb-4">This story may have been removed or made private.</p>
              <Link to="/community">
                <Button>Back to Community</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const photos = guitar.photos || [];
  const specs = getSpecs();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container-wide py-8">
          {/* Back button */}
          <Link to="/community" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Community
          </Link>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Photo Gallery */}
            <div>
              {photos.length > 1 ? (
                <div className="relative px-12">
                  <Carousel>
                    <CarouselContent>
                      {photos.map((photo) => (
                        <CarouselItem key={photo.id}>
                          <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                            <img
                              src={photo.photo_url}
                              alt={photo.photo_type || "Guitar photo"}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {photo.photo_type && (
                            <p className="text-center text-sm text-muted-foreground mt-2 capitalize">
                              {photo.photo_type}
                            </p>
                          )}
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                  </Carousel>
                </div>
              ) : photos.length === 1 ? (
                <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={photos[0].photo_url}
                    alt={getDisplayName()}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
                  <Guitar className="h-24 w-24 text-muted-foreground/30" />
                </div>
              )}

              {/* Engagement buttons */}
              <div className="flex items-center gap-4 mt-6">
                <Button
                  variant={likesData?.userLiked ? "default" : "outline"}
                  className="gap-2"
                  onClick={handleLike}
                  disabled={likeMutation.isPending}
                >
                  <Heart className={`h-4 w-4 ${likesData?.userLiked ? "fill-current" : ""}`} />
                  {likesData?.count || 0}
                </Button>

                <Button
                  variant={ownershipData?.userOwns ? "default" : "outline"}
                  className="gap-2"
                  onClick={handleOwnership}
                  disabled={ownershipMutation.isPending}
                >
                  {ownershipData?.userOwns ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Guitar className="h-4 w-4" />
                  )}
                  I Have This ({ownershipData?.count || 0})
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleShare("twitter")}>
                      <Twitter className="h-4 w-4 mr-2" />
                      Share on X
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShare("facebook")}>
                      <Facebook className="h-4 w-4 mr-2" />
                      Share on Facebook
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShare("copy")}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Story Content */}
            <div>
              <div className="flex items-start gap-3 mb-4">
                {guitar.is_featured && (
                  <Badge className="bg-amber-500/10 text-amber-700 border-amber-200">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    Featured
                  </Badge>
                )}
                {guitar.model?.series && (
                  <Badge variant="secondary">{guitar.model.series} Series</Badge>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-semibold mb-4">{getDisplayName()}</h1>

              <div className="flex items-center gap-4 text-muted-foreground mb-6">
                {guitar.display_name && (
                  <span className="flex items-center gap-1.5">
                    <Music className="h-4 w-4" />
                    {guitar.display_name}
                  </span>
                )}
                {guitar.estimated_year && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {guitar.estimated_year}
                  </span>
                )}
              </div>

              {/* Story */}
              {guitar.story && (
                <div className="mb-8">
                  <h2 className="text-lg font-medium mb-3">The Story</h2>
                  <blockquote className="text-lg text-muted-foreground italic border-l-4 border-amber-500/50 pl-4 py-2">
                    "{guitar.story}"
                  </blockquote>
                </div>
              )}

              {/* Specifications */}
              {specs.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-medium mb-3">Specifications</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {specs.map((spec, i) => (
                      <div key={i} className="bg-muted/50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">{spec.label}</p>
                        <p className="font-medium">{spec.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator className="my-8" />

              {/* Comments Section */}
              <div>
                <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Comments ({comments?.length || 0})
                </h2>

                {/* Comment input */}
                <div className="mb-6">
                  <Textarea
                    placeholder={user ? "Share your thoughts..." : "Sign in to comment"}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={!user}
                    className="mb-2"
                  />
                  <Button
                    onClick={handleComment}
                    disabled={!user || !newComment.trim() || commentMutation.isPending}
                    size="sm"
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Post Comment
                  </Button>
                  {!user && (
                    <p className="text-sm text-muted-foreground mt-2">
                      <Link to={`/auth?redirect=/community/${id}`} className="text-primary hover:underline">
                        Sign in
                      </Link>{" "}
                      to join the conversation.
                    </p>
                  )}
                </div>

                {/* Comments list */}
                {comments && comments.length > 0 ? (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="bg-muted/30 rounded-lg p-4">
                        <p className="text-sm mb-2">{comment.content}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(comment.created_at), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No comments yet. Be the first to share your thoughts!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StoryDetail;