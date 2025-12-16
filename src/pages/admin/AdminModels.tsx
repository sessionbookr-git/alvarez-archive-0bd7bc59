import { useState, useRef } from "react";
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
import { Plus, Edit, Trash2, ArrowLeft, Layers, Upload, Image, X, Loader2, Settings2 } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ManageFeaturesDialog from "@/components/ManageFeaturesDialog";

interface ModelForm {
  model_name: string;
  series: string;
  body_shape: string;
  country_of_manufacture: string;
  production_start_year: string;
  production_end_year: string;
  description: string;
  photo_url: string;
}

const emptyForm: ModelForm = {
  model_name: "",
  series: "",
  body_shape: "",
  country_of_manufacture: "",
  production_start_year: "",
  production_end_year: "",
  description: "",
  photo_url: "",
};

const AdminModels = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ModelForm>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [featuresDialogModel, setFeaturesDialogModel] = useState<{ id: string; name: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const uploadPhoto = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('model-photos')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('model-photos')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setUploading(true);
    try {
      const url = await uploadPhoto(file);
      setForm({ ...form, photo_url: url });
      toast({ title: "Photo uploaded successfully" });
    } catch (error) {
      console.error("Upload error:", error);
      toast({ title: "Upload failed", description: "Please try again", variant: "destructive" });
      setPhotoPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = () => {
    setForm({ ...form, photo_url: "" });
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
        photo_url: data.photo_url || null,
      };

      if (editingId) {
        const { error } = await supabase.from("models").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("models").insert([payload]);
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
    setPhotoPreview(null);
  };

  const handleEdit = (model: NonNullable<typeof models>[number]) => {
    setEditingId(model.id);
    setForm({
      model_name: model.model_name,
      series: model.series || "",
      body_shape: model.body_shape || "",
      country_of_manufacture: model.country_of_manufacture || "",
      production_start_year: model.production_start_year?.toString() || "",
      production_end_year: model.production_end_year?.toString() || "",
      description: model.description || "",
      photo_url: (model as { photo_url?: string }).photo_url || "",
    });
    setPhotoPreview((model as { photo_url?: string }).photo_url || null);
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
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/admin/import?type=models">
                <Upload className="h-4 w-4 mr-2" /> Bulk Import
              </Link>
            </Button>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingId(null); setForm(emptyForm); setPhotoPreview(null); }}>
                  <Plus className="h-4 w-4 mr-2" /> Add Model
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Model" : "Add New Model"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Photo Upload */}
                <div className="space-y-2">
                  <Label>Model Photo</Label>
                  <div className="flex items-start gap-4">
                    {(photoPreview || form.photo_url) ? (
                      <div className="relative w-32 h-32">
                        <img 
                          src={photoPreview || form.photo_url} 
                          alt="Model preview" 
                          className="w-full h-full object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="w-32 h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoSelect}
                          className="hidden"
                          disabled={uploading}
                        />
                        {uploading ? (
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        ) : (
                          <>
                            <Image className="h-6 w-6 text-muted-foreground mb-1" />
                            <span className="text-xs text-muted-foreground">Upload</span>
                          </>
                        )}
                      </label>
                    )}
                    <div className="text-sm text-muted-foreground">
                      <p>Upload a photo of this model.</p>
                      <p>JPG, PNG up to 5MB</p>
                    </div>
                  </div>
                </div>

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
                  <Button type="submit" disabled={saveMutation.isPending || uploading}>
                    {saveMutation.isPending ? "Saving..." : "Save Model"}
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
        ) : (
          <div className="grid gap-4">
            {models?.map((model) => {
              const photoUrl = (model as { photo_url?: string }).photo_url;
              return (
                <Card key={model.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        {photoUrl ? (
                          <img 
                            src={photoUrl} 
                            alt={model.model_name}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-secondary rounded-md flex items-center justify-center">
                            <Image className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
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
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => setFeaturesDialogModel({ id: model.id, name: model.model_name })}
                          title="Manage Features"
                        >
                          <Settings2 className="h-4 w-4" />
                        </Button>
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
              );
            })}
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

      {/* Manage Features Dialog */}
      {featuresDialogModel && (
        <ManageFeaturesDialog
          open={!!featuresDialogModel}
          onOpenChange={(open) => !open && setFeaturesDialogModel(null)}
          modelId={featuresDialogModel.id}
          modelName={featuresDialogModel.name}
        />
      )}
    </div>
  );
};

export default AdminModels;
