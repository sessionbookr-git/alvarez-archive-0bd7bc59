import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, XCircle, Clock, Users } from "lucide-react";
import { toast } from "sonner";

const AdminAccessRequests = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>("pending");

  const { data: requests, isLoading } = useQuery({
    queryKey: ["access-requests", filter],
    queryFn: async () => {
      let query = supabase
        .from("access_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("status", filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["access-request-stats"],
    queryFn: async () => {
      const [totalRes, pendingRes, approvedRes, rejectedRes] = await Promise.all([
        supabase.from("access_requests").select("id", { count: "exact" }),
        supabase.from("access_requests").select("id", { count: "exact" }).eq("status", "pending"),
        supabase.from("access_requests").select("id", { count: "exact" }).eq("status", "approved"),
        supabase.from("access_requests").select("id", { count: "exact" }).eq("status", "rejected"),
      ]);
      return {
        total: totalRes.count ?? 0,
        pending: pendingRes.count ?? 0,
        approved: approvedRes.count ?? 0,
        rejected: rejectedRes.count ?? 0,
      };
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("access_requests")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["access-requests"] });
      queryClient.invalidateQueries({ queryKey: ["access-request-stats"] });
      toast.success("Status updated");
    },
    onError: () => {
      toast.error("Failed to update status");
    },
  });

  const statusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/50"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/50"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-500/50"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container-wide py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Access Requests</h1>
          <p className="text-muted-foreground">Manage beta access waitlist</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1"><Users className="h-3 w-3" /> Total</CardDescription>
              <CardTitle className="text-3xl">{stats?.total ?? 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-amber-500/50 bg-amber-500/10">
            <CardHeader className="pb-2">
              <CardDescription>Pending</CardDescription>
              <CardTitle className="text-3xl text-amber-700">{stats?.pending ?? 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-green-500/50 bg-green-500/10">
            <CardHeader className="pb-2">
              <CardDescription>Approved</CardDescription>
              <CardTitle className="text-3xl text-green-700">{stats?.approved ?? 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-red-500/50 bg-red-500/10">
            <CardHeader className="pb-2">
              <CardDescription>Rejected</CardDescription>
              <CardTitle className="text-3xl text-red-700">{stats?.rejected ?? 0}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {["pending", "approved", "rejected", "all"].map((s) => (
            <Button
              key={s}
              variant={filter === s ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(s)}
              className="capitalize"
            >
              {s}
            </Button>
          ))}
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading…</TableCell>
                  </TableRow>
                ) : requests?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No requests found</TableCell>
                  </TableRow>
                ) : (
                  requests?.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">{req.name}</TableCell>
                      <TableCell className="font-mono text-sm">{req.email}</TableCell>
                      <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                        {req.message || "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(req.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{statusBadge(req.status)}</TableCell>
                      <TableCell className="text-right">
                        {req.status === "pending" && (
                          <div className="flex gap-1 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-700 border-green-500/50 hover:bg-green-500/10"
                              onClick={() => updateStatus.mutate({ id: req.id, status: "approved" })}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-700 border-red-500/50 hover:bg-red-500/10"
                              onClick={() => updateStatus.mutate({ id: req.id, status: "rejected" })}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default AdminAccessRequests;
