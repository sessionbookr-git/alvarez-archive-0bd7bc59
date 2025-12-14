import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, ArrowLeft, TestTube, Upload } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface PatternForm {
  model_id: string;
  serial_prefix: string;
  serial_range_start: string;
  serial_range_end: string;
  year_range_start: string;
  year_range_end: string;
  confidence_notes: string;
}

const emptyForm: PatternForm = {
  model_id: "",
  serial_prefix: "",
  serial_range_start: "",
  serial_range_end: "",
  year_range_start: "",
  year_range_end: "",
  confidence_notes: "",
};

const AdminPatterns = () => {
  const [searchParams] = useSearchParams();
  const modelFilter = searchParams.get("model");
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PatternForm>(emptyForm);
  const [testSerial, setTestSerial] = useState("");
  const [testResult, setTestResult] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: models } = useQuery({
    queryKey: ["models-list"],
    queryFn: async () => {
      const { data } = await supabase.from("models").select("id, model_name").order("model_name");
      return data ?? [];
    },
  });

  const { data: patterns, isLoading } = useQuery({
    queryKey: ["admin-patterns", modelFilter],
    queryFn: async () => {
      let query = supabase
        .from("serial_patterns")
        .select("*, model:models(model_name)")
        .order("year_range_start");
      
      if (modelFilter) {
        query = query.eq("model_id", modelFilter);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: PatternForm) => {
      const payload = {
        model_id: data.model_id || null,
        serial_prefix: data.serial_prefix || null,
        serial_range_start: data.serial_range_start || null,
        serial_range_end: data.serial_range_end || null,
        year_range_start: parseInt(data.year_range_start),
        year_range_end: parseInt(data.year_range_end),
        confidence_notes: data.confidence_notes || null,
      };

      if (editingId) {
        const { error } = await supabase.from("serial_patterns").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("serial_patterns").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-patterns"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast({ title: editingId ? "Pattern updated!" : "Pattern created!" });
      handleClose();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("serial_patterns").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-patterns"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast({ title: "Pattern deleted" });
    },
  });

  const handleClose = () => {
    setIsOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleEdit = (pattern: NonNullable<typeof patterns>[number]) => {
    setEditingId(pattern.id);
    setForm({
      model_id: pattern.model_id || "",
      serial_prefix: pattern.serial_prefix || "",
      serial_range_start: pattern.serial_range_start || "",
      serial_range_end: pattern.serial_range_end || "",
      year_range_start: pattern.year_range_start.toString(),
      year_range_end: pattern.year_range_end.toString(),
      confidence_notes: pattern.confidence_notes || "",
    });
    setIsOpen(true);
  };

  const handleTest = () => {
    if (!testSerial.trim() || !patterns) {
      setTestResult(null);
      return;
    }

    const matches = patterns.filter((p) => {
      if (p.serial_prefix && !testSerial.startsWith(p.serial_prefix)) {
        return false;
      }
      if (p.serial_range_start && testSerial < p.serial_range_start) {
        return false;
      }
      if (p.serial_range_end && testSerial > p.serial_range_end) {
        return false;
      }
      return true;
    });

    if (matches.length === 0) {
      setTestResult("No matching patterns found");
    } else {
      setTestResult(
        matches
          .map((m) => `${m.model?.model_name || "Unknown"}: ${m.year_range_start}-${m.year_range_end}`)
          .join(", ")
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(form);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container-wide py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/admin/dashboard"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Serial Patterns</h1>
              <p className="text-muted-foreground">Define serial number patterns for dating guitars</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/admin/import?type=patterns">
                <Upload className="h-4 w-4 mr-2" /> Bulk Import
              </Link>
            </Button>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingId(null); setForm(emptyForm); }}>
                  <Plus className="h-4 w-4 mr-2" /> Add Pattern
                </Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Pattern" : "Add New Pattern"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="model">Model (optional)</Label>
                  <Select value={form.model_id} onValueChange={(v) => setForm({ ...form, model_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="All models" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All models</SelectItem>
                      {models?.map((m) => (
                        <SelectItem key={m.id} value={m.id}>{m.model_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prefix">Serial Prefix</Label>
                    <Input
                      id="prefix"
                      value={form.serial_prefix}
                      onChange={(e) => setForm({ ...form, serial_prefix: e.target.value })}
                      placeholder="e.g. 8"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="range_start">Range Start</Label>
                    <Input
                      id="range_start"
                      value={form.serial_range_start}
                      onChange={(e) => setForm({ ...form, serial_range_start: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="range_end">Range End</Label>
                    <Input
                      id="range_end"
                      value={form.serial_range_end}
                      onChange={(e) => setForm({ ...form, serial_range_end: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="year_start">Year Start *</Label>
                    <Input
                      id="year_start"
                      type="number"
                      min="1960"
                      max="2030"
                      value={form.year_range_start}
                      onChange={(e) => setForm({ ...form, year_range_start: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year_end">Year End *</Label>
                    <Input
                      id="year_end"
                      type="number"
                      min="1960"
                      max="2030"
                      value={form.year_range_end}
                      onChange={(e) => setForm({ ...form, year_range_end: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Confidence Notes</Label>
                  <Textarea
                    id="notes"
                    value={form.confidence_notes}
                    onChange={(e) => setForm({ ...form, confidence_notes: e.target.value })}
                    placeholder="Notes about reliability of this pattern..."
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
                  <Button type="submit" disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? "Saving..." : "Save Pattern"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        </div>

        {/* Pattern Tester */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TestTube className="h-5 w-5" /> Test Pattern Matching
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder="Enter a serial number to test..."
                value={testSerial}
                onChange={(e) => setTestSerial(e.target.value)}
                className="max-w-xs"
              />
              <Button onClick={handleTest}>Test</Button>
              {testResult && (
                <p className="text-sm text-muted-foreground self-center">{testResult}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <div className="grid gap-4">
            {patterns?.map((pattern) => (
              <Card key={pattern.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-mono">
                        {pattern.serial_prefix && `${pattern.serial_prefix}* `}
                        {pattern.serial_range_start && pattern.serial_range_end && 
                          `(${pattern.serial_range_start} - ${pattern.serial_range_end})`}
                        {!pattern.serial_prefix && !pattern.serial_range_start && "Any serial"}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {pattern.model?.model_name || "All models"} • {pattern.year_range_start}-{pattern.year_range_end}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(pattern)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => {
                          if (confirm("Delete this pattern?")) deleteMutation.mutate(pattern.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {pattern.confidence_notes && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{pattern.confidence_notes}</p>
                  </CardContent>
                )}
              </Card>
            ))}
            {patterns?.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No patterns yet. Add your first pattern above.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AdminPatterns;
