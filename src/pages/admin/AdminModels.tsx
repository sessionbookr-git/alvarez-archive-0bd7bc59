import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, ArrowLeft, Layers } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface ModelForm {
  model_name: string;
  series: string;
  body_shape: string;
  country_of_manufacture: string;
  production_start_year: string;
  production_end_year: string;
  description: string;
}

const emptyForm: ModelForm = {
  model_name: "",
  series: "",
  body_shape: "",
  country_of_manufacture: "",
  production_start_year: "",
  production_end_year: "",
  description: "",
};

const AdminModels = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ModelForm>(emptyForm);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: models, isLoading } = useQuery({
    queryKey: ["admin-models"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("models")
        .select("*")
        .order("model_name");
      
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: ModelForm) => {
      const payload = {
        model_name: data.model_name,
        series: data.series || null,
        body_shape: data.body_shape || null,
        country_of_manufacture: data.country_of_manufacture || null,
        production_start_year: data.production_start_year ? parseInt(data.production_start_year) : null,
        production_end_year: data.production_end_year ? parseInt(data.production_end_year) : null,
        description: data.description || null,
      };

      if (editingId) {
        const { error } = await supabase.from("models").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("models").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-models"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast({ title: editingId ? "Model updated!" : "Model created!" });
      handleClose();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("models").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-models"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast({ title: "Model deleted" });
    },
  });

  const handleClose = () => {
    setIsOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleEdit = (model: typeof models extends (infer T)[] ? T : never) => {
    setEditingId(model.id);
    setForm({
      model_name: model.model_name,
      series: model.series || "",
      body_shape: model.body_shape || "",
      country_of_manufacture: model.country_of_manufacture || "",
      production_start_year: model.production_start_year?.toString() || "",
      production_end_year: model.production_end_year?.toString() || "",
      description: model.description || "",
    });
    setIsOpen(true);
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
              <h1 className="text-3xl font-bold">Model Management</h1>
              <p className="text-muted-foreground">Add and manage guitar models</p>
            </div>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingId(null); setForm(emptyForm); }}>
                <Plus className="h-4 w-4 mr-2" /> Add Model
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Model" : "Add New Model"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="model_name">Model Name *</Label>
                    <Input
                      id="model_name"
                      value={form.model_name}
                      onChange={(e) => setForm({ ...form, model_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="series">Series</Label>
                    <Input
                      id="series"
                      value={form.series}
                      onChange={(e) => setForm({ ...form, series: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="body_shape">Body Shape</Label>
                    <Select value={form.body_shape} onValueChange={(v) => setForm({ ...form, body_shape: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select shape" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Dreadnought">Dreadnought</SelectItem>
                        <SelectItem value="Concert">Concert</SelectItem>
                        <SelectItem value="Grand Auditorium">Grand Auditorium</SelectItem>
                        <SelectItem value="Parlor">Parlor</SelectItem>
                        <SelectItem value="Jumbo">Jumbo</SelectItem>
                        <SelectItem value="Classical">Classical</SelectItem>
                        <SelectItem value="Folk">Folk</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country of Manufacture</Label>
                    <Select value={form.country_of_manufacture} onValueChange={(v) => setForm({ ...form, country_of_manufacture: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Japan">Japan</SelectItem>
                        <SelectItem value="USA">USA</SelectItem>
                        <SelectItem value="Korea">Korea</SelectItem>
                        <SelectItem value="China">China</SelectItem>
                        <SelectItem value="Indonesia">Indonesia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="start_year">Production Start Year</Label>
                    <Input
                      id="start_year"
                      type="number"
                      min="1960"
                      max="2030"
                      value={form.production_start_year}
                      onChange={(e) => setForm({ ...form, production_start_year: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_year">Production End Year</Label>
                    <Input
                      id="end_year"
                      type="number"
                      min="1960"
                      max="2030"
                      value={form.production_end_year}
                      onChange={(e) => setForm({ ...form, production_end_year: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
                  <Button type="submit" disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? "Saving..." : "Save Model"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <div className="grid gap-4">
            {models?.map((model) => (
              <Card key={model.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{model.model_name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {model.series && `${model.series} • `}
                        {model.body_shape && `${model.body_shape} • `}
                        {model.country_of_manufacture}
                        {model.production_start_year && ` • ${model.production_start_year}`}
                        {model.production_end_year && `-${model.production_end_year}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" asChild>
                        <Link to={`/admin/patterns?model=${model.id}`}>
                          <Layers className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(model)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => {
                          if (confirm("Delete this model?")) deleteMutation.mutate(model.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {model.description && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{model.description}</p>
                  </CardContent>
                )}
              </Card>
            ))}
            {models?.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No models yet. Add your first model above.</p>
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

export default AdminModels;
