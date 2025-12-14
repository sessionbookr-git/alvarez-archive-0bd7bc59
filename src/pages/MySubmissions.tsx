import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Guitar, Plus } from "lucide-react";
import { Link } from "react-router-dom";

const MySubmissions = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?redirect=/my-submissions");
    }
  }, [user, authLoading, navigate]);

  const { data: submissions, isLoading } = useQuery({
    queryKey: ["my-submissions", user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const { data, error } = await supabase
        .from("guitars")
        .select(`
          *,
          models (model_name),
          guitar_photos (photo_url, photo_type)
        `)
        .eq("submitted_by_email", user.email)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.email,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending Review</Badge>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container-wide py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Submissions</h1>
            <p className="text-muted-foreground mt-1">Track the status of your guitar submissions</p>
          </div>
          <Button asChild>
            <Link to="/submit">
              <Plus className="h-4 w-4 mr-2" />
              Submit New Guitar
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : submissions?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Guitar className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-lg font-semibold mb-2">No submissions yet</h2>
              <p className="text-muted-foreground text-center mb-4">
                Help grow the archive by submitting your Alvarez guitar
              </p>
              <Button asChild>
                <Link to="/submit">Submit Your First Guitar</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {submissions?.map((guitar) => {
              const primaryPhoto = guitar.guitar_photos?.find((p: any) => p.photo_type === "body") || guitar.guitar_photos?.[0];
              return (
                <Card key={guitar.id} className="overflow-hidden">
                  {primaryPhoto && (
                    <div className="aspect-video bg-muted">
                      <img
                        src={primaryPhoto.photo_url}
                        alt={`Guitar ${guitar.serial_number}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-mono">{guitar.serial_number}</CardTitle>
                      {getStatusBadge(guitar.status)}
                    </div>
                    <CardDescription>
                      {guitar.models?.model_name || "Unknown Model"}
                      {guitar.estimated_year && ` • ${guitar.estimated_year}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Submitted {new Date(guitar.created_at).toLocaleDateString()}
                    </p>
                    {guitar.status === "approved" && guitar.approved_at && (
                      <p className="text-sm text-green-600">
                        Approved {new Date(guitar.approved_at).toLocaleDateString()}
                      </p>
                    )}
                    {guitar.admin_notes && guitar.status === "rejected" && (
                      <p className="text-sm text-destructive mt-2">{guitar.admin_notes}</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MySubmissions;