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
import { Plus, Edit, Trash2, ArrowLeft, Image } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface FeatureForm {
  feature_category: string;
  feature_name: string;
  feature_value: string;
  description: string;
  era_start: string;
  era_end: string;
  photo_url: string;
}

const emptyForm: FeatureForm = {
  feature_category: "",
  feature_name: "",
  feature_value: "",
  description: "",
  era_start: "",
  era_end: "",
  photo_url: "",
};

const categories = [
  "Tuners",
  "Bridge",
  "Label",
  "Truss Rod",
  "Headstock",
  "Binding",
  "Inlay",
  "Rosette",
  "Bracing",
  "Other",
];

const AdminFeatures = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FeatureForm>(emptyForm);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: features, isLoading } = useQuery({
    queryKey: ["admin-features", categoryFilter],
    queryFn: async () => {
      let query = supabase
        .from("identifying_features")
        .select("*")
        .order("feature_category")
        .order("feature_name");
      
      if (categoryFilter !== "all") {
        query = query.eq("feature_category", categoryFilter);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: FeatureForm) => {
      const payload = {
        feature_category: data.feature_category,
        feature_name: data.feature_name,
        feature_value: data.feature_value || null,
        description: data.description || null,
        era_start: data.era_start ? parseInt(data.era_start) : null,
        era_end: data.era_end ? parseInt(data.era_end) : null,
        photo_url: data.photo_url || null,
      };

      if (editingId) {
        const { error } = await supabase.from("identifying_features").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("identifying_features").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-features"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast({ title: editingId ? "Feature updated!" : "Feature created!" });
      handleClose();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("identifying_features").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-features"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast({ title: "Feature deleted" });
    },
  });

  const handleClose = () => {
    setIsOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleEdit = (feature: NonNullable<typeof features>[number]) => {
    setEditingId(feature.id);
    setForm({
      feature_category: feature.feature_category,
      feature_name: feature.feature_name,
      feature_value: feature.feature_value || "",
      description: feature.description || "",
      era_start: feature.era_start?.toString() || "",
      era_end: feature.era_end?.toString() || "",
      photo_url: feature.photo_url || "",
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(form);
  };

  // Group features by category
  const groupedFeatures = features?.reduce((acc, feature) => {
    const cat = feature.feature_category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(feature);
    return acc;
  }, {} as Record<string, typeof features>);

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
              <h1 className="text-3xl font-bold">Feature Library</h1>
              <p className="text-muted-foreground">Manage identifying features for dating guitars</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingId(null); setForm(emptyForm); }}>
                  <Plus className="h-4 w-4 mr-2" /> Add Feature
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingId ? "Edit Feature" : "Add New Feature"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select 
                        value={form.feature_category} 
                        onValueChange={(v) => setForm({ ...form, feature_category: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Feature Name *</Label>
                      <Input
                        id="name"
                        value={form.feature_name}
                        onChange={(e) => setForm({ ...form, feature_name: e.target.value })}
                        required
                        placeholder="e.g. Open-Gear Tuners"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="value">Feature Value</Label>
                    <Input
                      id="value"
                      value={form.feature_value}
                      onChange={(e) => setForm({ ...form, feature_value: e.target.value })}
                      placeholder="e.g. Gotoh"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="era_start">Era Start Year</Label>
                      <Input
                        id="era_start"
                        type="number"
                        min="1960"
                        max="2030"
                        value={form.era_start}
                        onChange={(e) => setForm({ ...form, era_start: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="era_end">Era End Year</Label>
                      <Input
                        id="era_end"
                        type="number"
                        min="1960"
                        max="2030"
                        value={form.era_end}
                        onChange={(e) => setForm({ ...form, era_end: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="photo">Reference Photo URL</Label>
                    <Input
                      id="photo"
                      type="url"
                      value={form.photo_url}
                      onChange={(e) => setForm({ ...form, photo_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Describe this feature and how to identify it..."
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
                    <Button type="submit" disabled={saveMutation.isPending}>
                      {saveMutation.isPending ? "Saving..." : "Save Feature"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : categoryFilter === "all" ? (
          <div className="space-y-8">
            {groupedFeatures && Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
              <div key={category}>
                <h2 className="text-xl font-semibold mb-4">{category}</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {categoryFeatures?.map((feature) => (
                    <FeatureCard
                      key={feature.id}
                      feature={feature}
                      onEdit={handleEdit}
                      onDelete={(id) => {
                        if (confirm("Delete this feature?")) deleteMutation.mutate(id);
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
            {(!groupedFeatures || Object.keys(groupedFeatures).length === 0) && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No features yet. Add your first feature above.</p>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features?.map((feature) => (
              <FeatureCard
                key={feature.id}
                feature={feature}
                onEdit={handleEdit}
                onDelete={(id) => {
                  if (confirm("Delete this feature?")) deleteMutation.mutate(id);
                }}
              />
            ))}
            {features?.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No features in this category.</p>
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

interface FeatureCardProps {
  feature: {
    id: string;
    feature_category: string;
    feature_name: string;
    feature_value: string | null;
    description: string | null;
    era_start: number | null;
    era_end: number | null;
    photo_url: string | null;
  };
  onEdit: (feature: FeatureCardProps["feature"]) => void;
  onDelete: (id: string) => void;
}

const FeatureCard = ({ feature, onEdit, onDelete }: FeatureCardProps) => (
  <Card>
    <CardHeader className="pb-2">
      <div className="flex items-start justify-between">
        <div>
          <CardTitle className="text-base">{feature.feature_name}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {feature.feature_value && `${feature.feature_value} • `}
            {feature.era_start && feature.era_end && `${feature.era_start}-${feature.era_end}`}
          </p>
        </div>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => onEdit(feature)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => onDelete(feature.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      {feature.photo_url && (
        <div className="mb-2 aspect-video rounded-lg overflow-hidden bg-muted">
          <img src={feature.photo_url} alt={feature.feature_name} className="w-full h-full object-cover" />
        </div>
      )}
      {feature.description && (
        <p className="text-sm text-muted-foreground line-clamp-2">{feature.description}</p>
      )}
      {!feature.photo_url && !feature.description && (
        <p className="text-sm text-muted-foreground italic">No description or photo</p>
      )}
    </CardContent>
  </Card>
);

export default AdminFeatures;
