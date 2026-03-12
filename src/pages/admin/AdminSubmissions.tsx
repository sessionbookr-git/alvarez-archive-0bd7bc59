import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Check, X, ArrowLeft, Star, BookOpen, Eye, Pencil, Trash2, Loader2 } from "lucide-react";
import { PromoteToEncyclopediaButton } from "@/components/PromoteToEncyclopediaButton";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { EditSubmissionDialog } from "@/components/EditSubmissionDialog";
import { AdminPhotoManager } from "@/components/AdminPhotoManager";

type StatusFilter = "all" | "pending" | "approved" | "rejected";

const AdminSubmissions = () => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [selectedGuitar, setSelectedGuitar] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [editGuitar, setEditGuitar] = useState<any | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: submissions, isLoading } = useQuery({
    queryKey: ["admin-submissions", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("guitars")
        .select(`
          *,
          model:models(model_name, series),
          photos:guitar_photos(id, photo_url, photo_type),
          submitter:profiles!submitted_by_user_id(display_name, email)
        `)
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
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
      const { error } = await supabase.from("guitars").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast({
        title: status === "approved" ? "Guitar approved!" : "Guitar rejected",
        description: `The submission has been ${status}.`,
      });
      setSelectedGuitar(null);
      setAdminNotes("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Delete photos first, then the guitar record
      const { error: photoErr } = await supabase.from("guitar_photos").delete().eq("guitar_id", id);
      if (photoErr) throw photoErr;
      const { error } = await supabase.from("guitars").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast({ title: "Submission deleted", description: "The submission and its photos have been removed." });
    },
    onError: (err: Error) => {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    },
  });

  const toggleFeatured = useMutation({
    mutationFn: async ({ id, isFeatured }: { id: string; isFeatured: boolean }) => {
      const { error } = await supabase.from("guitars").update({ is_featured: isFeatured }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { isFeatured }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-submissions"] });
      toast({
        title: isFeatured ? "Story featured!" : "Story unfeatured",
        description: isFeatured ? "This story will appear on the homepage." : "Story removed from featured.",
      });
    },
  });

  const handleApprove = (id: string) => {
    updateStatus.mutate({ id, status: "approved", notes: adminNotes });
  };

  const handleReject = (id: string) => {
    updateStatus.mutate({ id, status: "rejected", notes: adminNotes });
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container-wide py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin/dashboard"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Submissions</h1>
            <p className="text-muted-foreground">Review, edit, and manage all guitar submissions</p>
          </div>
        </div>

        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)} className="mb-6">
          <TabsList>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : submissions?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No {statusFilter === "all" ? "" : statusFilter} submissions</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {submissions?.map((guitar) => (
              <Card key={guitar.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <CardTitle className="font-mono text-xl">{guitar.serial_number}</CardTitle>
                        <CardDescription>
                          Submitted {new Date(guitar.created_at).toLocaleDateString()}
                          {(guitar as any).submitter?.email && ` by ${(guitar as any).submitter.display_name || (guitar as any).submitter.email}`}
                        </CardDescription>
                      </div>
                      {getStatusBadge(guitar.status)}
                    </div>
                    <div className="flex gap-2">
                      {/* Edit */}
                      <Button size="sm" variant="outline" onClick={() => setEditGuitar(guitar)}>
                        <Pencil className="h-4 w-4 mr-1" /> Edit
                      </Button>

                      {/* Delete */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4 mr-1" /> Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete submission?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the submission for <strong>{guitar.serial_number}</strong> and all its photos. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMutation.mutate(guitar.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      {/* Publish to Encyclopedia for approved */}
                      {guitar.status === "approved" && (
                        <PromoteToEncyclopediaButton guitar={guitar} />
                      )}

                      {/* Approve/Reject for pending */}
                      {guitar.status === "pending" && (
                        <>
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
                        </>
                      )}
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
                          <p className="font-medium">{guitar.model?.model_name || guitar.model_name_submitted || "Unknown"}</p>
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
                      {guitar.admin_notes && (
                        <div className="mt-4 p-3 bg-muted rounded-lg">
                          <span className="text-sm text-muted-foreground">Admin Notes:</span>
                          <p className="text-sm mt-1">{guitar.admin_notes}</p>
                        </div>
                      )}

                      {/* Story Section */}
                      {guitar.story && (
                        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4 text-amber-600" />
                              <span className="text-sm font-medium text-amber-900 dark:text-amber-100">Contributor Story</span>
                            </div>
                            {guitar.is_story_public && (
                              <Badge variant="outline" className="text-xs border-amber-300 text-amber-700">
                                <Eye className="h-3 w-3 mr-1" />
                                Public
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-amber-800 dark:text-amber-200">{guitar.story}</p>
                          {guitar.display_name && (
                            <p className="text-xs text-amber-600 mt-2">— {guitar.display_name}</p>
                          )}

                          {guitar.is_story_public && (
                            <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-800 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Star className={`h-4 w-4 ${guitar.is_featured ? "text-amber-500 fill-amber-500" : "text-muted-foreground"}`} />
                                <Label className="text-xs">Feature on homepage</Label>
                              </div>
                              <Switch
                                checked={guitar.is_featured || false}
                                onCheckedChange={(checked) => toggleFeatured.mutate({ id: guitar.id, isFeatured: checked })}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Photos */}
                    <div>
                      <AdminPhotoManager
                        guitarId={guitar.id}
                        photos={guitar.photos || []}
                        serialNumber={guitar.serial_number}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {editGuitar && (
          <EditSubmissionDialog
            open={!!editGuitar}
            onOpenChange={(open) => {
              if (!open) setEditGuitar(null);
              queryClient.invalidateQueries({ queryKey: ["admin-submissions"] });
            }}
            guitar={editGuitar}
          />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AdminSubmissions;
