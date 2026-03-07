import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Ticket, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

const generateCode = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const segments = 3;
  const segLen = 4;
  const parts: string[] = [];
  for (let s = 0; s < segments; s++) {
    let seg = "";
    for (let i = 0; i < segLen; i++) {
      seg += chars[Math.floor(Math.random() * chars.length)];
    }
    parts.push(seg);
  }
  return parts.join("-");
};

const AdminInviteCodes = () => {
  const { user } = useAuth();
  const [quantity, setQuantity] = useState<number>(50);
  const [generating, setGenerating] = useState(false);
  const [lastBatchCodes, setLastBatchCodes] = useState<string[]>([]);

  const { data: stats, refetch } = useQuery({
    queryKey: ["invite-code-stats"],
    queryFn: async () => {
      const [totalRes, usedRes, unusedRes] = await Promise.all([
        supabase.from("invite_codes").select("id", { count: "exact" }),
        supabase.from("invite_codes").select("id", { count: "exact" }).not("used_at", "is", null),
        supabase.from("invite_codes").select("id", { count: "exact" }).is("used_at", null),
      ]);
      return {
        total: totalRes.count ?? 0,
        used: usedRes.count ?? 0,
        unused: unusedRes.count ?? 0,
      };
    },
  });

  const downloadCSV = (codes: string[]) => {
    const csvContent = ["code", ...codes].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `invite-codes-${codes.length}-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleGenerate = async () => {
    if (quantity < 1) {
      toast.error("Enter at least 1");
      return;
    }

    setGenerating(true);
    try {
      const batchSize = 500;
      const allCodes: string[] = [];
      let remaining = quantity;

      while (remaining > 0) {
        const chunk = Math.min(remaining, batchSize);
        const codes = Array.from({ length: chunk }, () => generateCode());

        const rows = codes.map((code) => ({
          code,
          created_by: user?.id ?? null,
        }));

        const { error } = await supabase.from("invite_codes").insert(rows);
        if (error) throw error;

        allCodes.push(...codes);
        remaining -= chunk;
      }

      setLastBatchCodes(allCodes);
      downloadCSV(allCodes);
      toast.success(`Generated ${allCodes.length} invite codes`);
      refetch();
    } catch (err) {
      console.error("Generation error:", err);
      toast.error("Failed to generate codes");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container-wide py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Invite Codes</h1>
          <p className="text-muted-foreground">Generate bulk invite codes for testers</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Generated</CardDescription>
              <CardTitle className="text-4xl">{stats?.total ?? 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-green-500/50 bg-green-500/10">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Used</CardDescription>
              <CardTitle className="text-4xl text-green-700">{stats?.used ?? 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-amber-500/50 bg-amber-500/10">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1"><XCircle className="h-3 w-3" /> Unused</CardDescription>
              <CardTitle className="text-4xl text-amber-700">{stats?.unused ?? 0}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Generator */}
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" /> Generate Codes
            </CardTitle>
            <CardDescription>
              Codes are 12 characters (e.g. ABCD-EF23-GHKL). Enter how many you need and they'll be saved &amp; downloaded as CSV.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Number of codes</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                placeholder="e.g. 500"
              />
            </div>
            <Button onClick={handleGenerate} disabled={generating} className="w-full gap-2">
              {generating ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</>
              ) : (
                <><Download className="h-4 w-4" /> Generate &amp; Download CSV</>
              )}
            </Button>

            {lastBatchCodes.length > 0 && !generating && (
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => downloadCSV(lastBatchCodes)}
              >
                <Download className="h-4 w-4" /> Re-download last batch ({lastBatchCodes.length} codes)
              </Button>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default AdminInviteCodes;
