import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Image, X } from "lucide-react";

interface ModelForm {
  model_name: string;
  series: string;
  body_shape: string;
  country_of_manufacture: string;
  production_start_year: string;
  production_end_year: string;
  description: string;
  photo_url: string;
  key_features: string;
}

interface EditModelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  model: {
    id: string;
    model_name: string;
    series?: string | null;
    body_shape?: string | null;
    country_of_manufacture?: string | null;
    production_start_year?: number | null;
    production_end_year?: number | null;
    description?: string | null;
    photo_url?: string | null;
    key_features?: string[] | null;
  };
}

const EditModelDialog = ({ open, onOpenChange, model }: EditModelDialogProps) => {
  const [form, setForm] = useState<ModelForm>({
    model_name: "",
    series: "",
    body_shape: "",
    country_of_manufacture: "",
    production_start_year: "",
    production_end_year: "",
    description: "",
    photo_url: "",
    key_features: "",
  });
  const [uploading, setUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (model && open) {
      const keyFeaturesStr = Array.isArray(model.key_features) 
        ? model.key_features.join('\n') 
        : "";
      setForm({
        model_name: model.model_name,
        series: model.series || "",
        body_shape: model.body_shape || "",
        country_of_manufacture: model.country_of_manufacture || "",
        production_start_year: model.production_start_year?.toString() || "",
        production_end_year: model.production_end_year?.toString() || "",
        description: model.description || "",
        photo_url: model.photo_url || "",
        key_features: keyFeaturesStr,
      });
      setPhotoPreview(model.photo_url || null);
    }
  }, [model, open]);

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

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

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
      let keyFeaturesArray: string[] = [];
      if (data.key_features.trim()) {
        keyFeaturesArray = data.key_features.split('\n').map(f => f.trim()).filter(f => f.length > 0);
      }

      const payload = {
        model_name: data.model_name,
        series: data.series || null,
        body_shape: data.body_shape || null,
        country_of_manufacture: data.country_of_manufacture || null,
        production_start_year: data.production_start_year ? parseInt(data.production_start_year) : null,
        production_end_year: data.production_end_year ? parseInt(data.production_end_year) : null,
        description: data.description || null,
        photo_url: data.photo_url || null,
        key_features: keyFeaturesArray,
      };

      const { error } = await supabase.from("models").update(payload).eq("id", model.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["models"] });
      queryClient.invalidateQueries({ queryKey: ["model", model.id] });
      queryClient.invalidateQueries({ queryKey: ["admin-models"] });
      toast({ title: "Model updated!" });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Model: {model.model_name}</DialogTitle>
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
                  <SelectItem value="OM">OM</SelectItem>
                  <SelectItem value="Mini">Mini</SelectItem>
                  <SelectItem value="Baritone">Baritone</SelectItem>
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
          <div className="space-y-2">
            <Label htmlFor="key_features">Key Features / Specs (one per line)</Label>
            <Textarea
              id="key_features"
              value={form.key_features}
              onChange={(e) => setForm({ ...form, key_features: e.target.value })}
              rows={5}
              placeholder="Solid Sitka Spruce Top&#10;Mahogany Back & Sides&#10;Ebony Fingerboard&#10;Fishman Electronics&#10;Gloss Finish"
            />
            <p className="text-xs text-muted-foreground">Enter each feature on a new line.</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saveMutation.isPending || uploading}>
              {saveMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditModelDialog;