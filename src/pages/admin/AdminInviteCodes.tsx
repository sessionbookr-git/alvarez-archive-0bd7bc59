import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Copy, Plus, Trash2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const generateCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) code += "-";
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const AdminInviteCodes = () => {
  const [notes, setNotes] = useState("");
  const [bulkCount, setBulkCount] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: codes, isLoading } = useQuery({
    queryKey: ["invite-codes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invite_codes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async ({ count, notes }: { count: number; notes: string }) => {
      const newCodes = Array.from({ length: count }, () => ({
        code: generateCode(),
        notes: notes || null,
      }));
      const { error } = await supabase.from("invite_codes").insert(newCodes);
      if (error) throw error;
      return newCodes;
    },
    onSuccess: (newCodes) => {
      queryClient.invalidateQueries({ queryKey: ["invite-codes"] });
      toast({
        title: `${newCodes.length} code(s) created`,
        description: newCodes.length === 1 ? newCodes[0].code : `Created ${newCodes.length} new invite codes`,
      });
      setNotes("");
      setBulkCount(1);
    },
    onError: (error) => {
      toast({
        title: "Error creating code",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("invite_codes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invite-codes"] });
      toast({ title: "Code deleted" });
    },
  });

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied to clipboard", description: code });
  };

  const unusedCodes = codes?.filter((c) => !c.used_at) || [];
  const usedCodes = codes?.filter((c) => c.used_at) || [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container-wide py-8">
        <div className="mb-6">
          <Link to="/admin/dashboard" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Generate Invite Codes</CardTitle>
              <CardDescription>Create new single-use registration codes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="count">Number of codes</Label>
                <Input
                  id="count"
                  type="number"
                  min={1}
                  max={50}
                  value={bulkCount}
                  onChange={(e) => setBulkCount(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Input
                  id="notes"
                  placeholder="e.g., For forum members"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <Button
                onClick={() => createMutation.mutate({ count: bulkCount, notes })}
                disabled={createMutation.isPending}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Generate {bulkCount} Code{bulkCount > 1 ? "s" : ""}
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Unused Codes ({unusedCodes.length})</CardTitle>
              <CardDescription>Available for new registrations</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : unusedCodes.length === 0 ? (
                <p className="text-muted-foreground">No unused codes. Generate some above.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unusedCodes.map((code) => (
                      <TableRow key={code.id}>
                        <TableCell className="font-mono">{code.code}</TableCell>
                        <TableCell className="text-muted-foreground">{code.notes || "—"}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(code.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" onClick={() => copyToClipboard(code.code)}>
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => deleteMutation.mutate(code.id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Used Codes ({usedCodes.length})</CardTitle>
              <CardDescription>Already redeemed</CardDescription>
            </CardHeader>
            <CardContent>
              {usedCodes.length === 0 ? (
                <p className="text-muted-foreground">No codes have been used yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Used By</TableHead>
                      <TableHead>Used At</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usedCodes.map((code) => (
                      <TableRow key={code.id}>
                        <TableCell className="font-mono text-muted-foreground">{code.code}</TableCell>
                        <TableCell>{code.used_by_email}</TableCell>
                        <TableCell>{new Date(code.used_at!).toLocaleString()}</TableCell>
                        <TableCell className="text-muted-foreground">{code.notes || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminInviteCodes;