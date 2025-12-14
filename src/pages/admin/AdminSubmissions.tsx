import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Edit, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const AdminSubmissions = () => {
  const [selectedGuitar, setSelectedGuitar] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: submissions, isLoading } = useQuery({
    queryKey: ["pending-submissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("guitars")
        .select(`
          *,
          model:models(model_name, series),
          photos:guitar_photos(id, photo_url, photo_type)
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const updates: Record<string, unknown> = { 
        status,
        admin_notes: notes || null,
      };
      
      if (status === "approved") {
        updates.approved_at = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from("guitars")
        .update(updates)
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["pending-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast({
        title: status === "approved" ? "Guitar approved!" : "Guitar rejected",
        description: `The submission has been ${status}.`,
      });
      setSelectedGuitar(null);
      setAdminNotes("");
    },
  });

  const handleApprove = (id: string) => {
    updateStatus.mutate({ id, status: "approved", notes: adminNotes });
  };

  const handleReject = (id: string) => {
    updateStatus.mutate({ id, status: "rejected", notes: adminNotes });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container-wide py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin/dashboard"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Pending Submissions</h1>
            <p className="text-muted-foreground">Review and approve guitar submissions</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : submissions?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No pending submissions</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {submissions?.map((guitar) => (
              <Card key={guitar.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="font-mono text-xl">{guitar.serial_number}</CardTitle>
                      <CardDescription>
                        Submitted {new Date(guitar.created_at).toLocaleDateString()}
                        {guitar.submitted_by_email && ` by ${guitar.submitted_by_email}`}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-600 hover:bg-green-50"
                        onClick={() => handleApprove(guitar.id)}
                      >
                        <Check className="h-4 w-4 mr-1" /> Approve
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() => setSelectedGuitar(guitar.id)}
                          >
                            <X className="h-4 w-4 mr-1" /> Reject
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Reject Submission</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Textarea
                              placeholder="Add notes explaining the rejection..."
                              value={adminNotes}
                              onChange={(e) => setAdminNotes(e.target.value)}
                            />
                            <Button
                              variant="destructive"
                              onClick={() => handleReject(guitar.id)}
                              className="w-full"
                            >
                              Confirm Rejection
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Details */}
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Model:</span>
                          <p className="font-medium">{guitar.model?.model_name || "Unknown"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Estimated Year:</span>
                          <p className="font-medium">{guitar.estimated_year || "Unknown"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Neck Block:</span>
                          <p className="font-medium">{guitar.neck_block_number || "N/A"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Confidence:</span>
                          <p className="font-medium capitalize">{guitar.confidence_level}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Tuners:</span>
                          <p className="font-medium">{guitar.tuner_type || "N/A"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Bridge:</span>
                          <p className="font-medium">{guitar.bridge_style || "N/A"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Label Type:</span>
                          <p className="font-medium">{guitar.label_type || "N/A"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Label Color:</span>
                          <p className="font-medium">{guitar.label_color || "N/A"}</p>
                        </div>
                      </div>
                      {guitar.submission_notes && (
                        <div className="mt-4 p-3 bg-muted rounded-lg">
                          <span className="text-sm text-muted-foreground">Submission Notes:</span>
                          <p className="text-sm mt-1">{guitar.submission_notes}</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Photos */}
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Photos ({guitar.photos?.length || 0})</p>
                      <div className="grid grid-cols-3 gap-2">
                        {guitar.photos?.map((photo) => (
                          <a
                            key={photo.id}
                            href={photo.photo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="aspect-square rounded-lg overflow-hidden bg-muted hover:opacity-80 transition-opacity"
                          >
                            <img
                              src={photo.photo_url}
                              alt={photo.photo_type || "Guitar photo"}
                              className="w-full h-full object-cover"
                            />
                          </a>
                        ))}
                        {(!guitar.photos || guitar.photos.length === 0) && (
                          <p className="text-sm text-muted-foreground col-span-3">No photos submitted</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AdminSubmissions;
