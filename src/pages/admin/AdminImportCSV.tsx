import { useState, useCallback } from "react";
import Papa from "papaparse";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, Loader2, CheckCircle, XCircle, ImageIcon, FileText } from "lucide-react";

// Spec columns that map to key_features
const SPEC_FEATURE_COLUMNS: Record<string, string> = {
  top_wood: "Top Wood",
  back_sides_wood: "Back & Sides Wood",
  neck: "Neck",
  pickup_eq: "Pickup/EQ",
  bracing: "Bracing",
  bridge: "Bridge",
  fingerboard: "Fingerboard",
  nut_saddle: "Nut & Saddle",
  tuner: "Tuner",
  strings: "Strings",
  inlays: "Inlays",
  top_color: "Top Color",
  back_sides_color: "Back & Sides Color",
  headstock_facia: "Headstock Facia",
  bridge_pins: "Bridge Pins",
  neck_meets_body: "Neck Meets Body",
  num_frets: "Number of Frets",
  overall_length_mm: "Overall Length (mm)",
  body_width_mm: "Body Width (mm)",
  body_depth_heel_mm: "Body Depth at Heel (mm)",
  body_depth_base_mm: "Body Depth at Base (mm)",
  scale_mm: "Scale Length (mm)",
  scale_inches: "Scale Length (inches)",
  nut_width_mm: "Nut Width (mm)",
  nut_width_inches: "Nut Width (inches)",
  binding: "Binding",
  purfling: "Purfling",
  armrest: "Armrest",
  body_finish: "Body Finish",
  headstock_plate: "Headstock Plate",
  neck_joint: "Neck Joint",
  case_bag: "Case/Bag",
};

interface SpecRow {
  model_name: string;
  series?: string;
  shape?: string;
  product_status?: string;
  year_model?: string;
  primary_image_url?: string;
  source_url?: string;
  [key: string]: string | undefined;
}

interface ImageRow {
  model_name: string;
  image_index: string;
  image_url: string;
}

const AdminImportCSV = () => {
  const [specsFile, setSpecsFile] = useState<File | null>(null);
  const [imagesFile, setImagesFile] = useState<File | null>(null);
  const [specRows, setSpecRows] = useState<SpecRow[]>([]);
  const [imageRows, setImageRows] = useState<ImageRow[]>([]);
  const [isValidated, setIsValidated] = useState(false);
  const [isImportingSpecs, setIsImportingSpecs] = useState(false);
  const [isImportingImages, setIsImportingImages] = useState(false);
  const [specsProgress, setSpecsProgress] = useState(0);
  const [imagesProgress, setImagesProgress] = useState(0);
  const [specsSummary, setSpecsSummary] = useState<{ created: number; updated: number; errors: number } | null>(null);
  const [imagesSummary, setImagesSummary] = useState<{ imported: number; errors: number } | null>(null);
  const [existingModelNames, setExistingModelNames] = useState<Set<string>>(new Set());

  const parseCSV = <T,>(file: File): Promise<T[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h) => h.trim(),
        complete: (results) => resolve(results.data as T[]),
        error: (err) => reject(err),
      });
    });
  };

  const handleValidate = async () => {
    if (!specsFile) {
      toast({ title: "Missing file", description: "Please upload the specs CSV", variant: "destructive" });
      return;
    }

    try {
      const specs = await parseCSV<SpecRow>(specsFile);
      setSpecRows(specs.filter(r => r.model_name?.trim()));

      if (imagesFile) {
        const images = await parseCSV<ImageRow>(imagesFile);
        setImageRows(images.filter(r => r.model_name?.trim() && r.image_url?.trim()));
      }

      // Check existing models
      const { data: existing } = await supabase.from("models").select("model_name");
      setExistingModelNames(new Set((existing || []).map(m => m.model_name)));

      setIsValidated(true);
      toast({ title: "Validation complete", description: `${specs.length} spec rows, ${imagesFile ? imageRows.length || 'pending' : 0} image rows parsed` });
    } catch (err) {
      toast({ title: "Parse error", description: String(err), variant: "destructive" });
    }
  };

  const buildKeyFeatures = (row: SpecRow): string[] => {
    const features: string[] = [];
    for (const [col, label] of Object.entries(SPEC_FEATURE_COLUMNS)) {
      const val = row[col]?.trim();
      if (val) features.push(`${label}: ${val}`);
    }
    return features;
  };

  const buildDescription = (row: SpecRow): string | null => {
    const parts: string[] = [];
    const top = row.top_wood?.trim();
    const shape = row.shape?.trim();
    if (!top && !shape) return null;

    parts.push([top, shape].filter(Boolean).join(" "));

    const notable: string[] = [];
    const pickup = row.pickup_eq?.trim();
    if (pickup) notable.push(`with ${pickup} pickup`);
    const armrest = row.armrest?.trim();
    if (armrest && armrest.toLowerCase() !== "no" && armrest.toLowerCase() !== "n/a") notable.push("with armrest");
    const backs = row.back_sides_wood?.trim();
    if (backs) notable.push(`${backs.toLowerCase()} back and sides`);
    const nut = row.nut_saddle?.trim();
    if (nut && nut.toLowerCase().includes("bone")) notable.push("bone nut and saddle");

    if (notable.length > 0) {
      // first item already has "with" if needed, join rest with commas
      parts.push(notable.join(", "));
    }

    return parts.join(" ");
  };

  const getCountry = (series?: string, modelName?: string): string => {
    const name = (modelName || "").toLowerCase();
    if (series?.trim() === "Yairi Series" || name.startsWith("yairi-") || /^[a-z]y\d/i.test(name)) return "Japan";
    return "China";
  };

  /** Override series from website using model name prefix rules */
  const fixSeries = (csvSeries: string, modelName: string): string => {
    const upper = modelName.toUpperCase();
    const lower = modelName.toLowerCase();
    // Yairi prefixed models
    if (lower.startsWith("yairi-") || /^[A-Z]Y\d/.test(upper)) return "Yairi Series";
    // AE prefix = Artist Elite
    if (upper.startsWith("AE")) return "Artist Elite Series";
    // M prefix = Masterworks
    if (upper.startsWith("M")) return "Masterworks Series";
    // L prefix = Laureate
    if (upper.startsWith("L")) return "Laureate Series";
    // R prefix = Regent
    if (upper.startsWith("R")) return "Regent Series";
    // A prefix (not AE) = Artist
    if (upper.startsWith("A")) return "Artist Guitars Series";
    // Fallback to CSV value
    return csvSeries;
  };

  const handleImportSpecs = async () => {
    if (specRows.length === 0) return;
    setIsImportingSpecs(true);
    setSpecsProgress(0);

    let created = 0, updated = 0, errors = 0;

    for (let i = 0; i < specRows.length; i++) {
      const row = specRows[i];
      const modelName = row.model_name.trim();
      const keyFeatures = buildKeyFeatures(row);
      const isExisting = existingModelNames.has(modelName);

      const record: Record<string, unknown> = {
        model_name: modelName,
        series: row.series?.trim() || null,
        body_shape: row.shape?.trim() || null,
        product_status: row.product_status?.trim() || "current",
        production_start_year: row.year_model ? parseInt(row.year_model) || null : null,
        photo_url: row.primary_image_url?.trim() || null,
        source_url: row.source_url?.trim() || null,
        instrument_type: "Acoustic",
        is_published: true,
        country_of_manufacture: getCountry(row.series),
        key_features: keyFeatures,
        description: buildDescription(row),
      };

      try {
        if (isExisting) {
          // Update: merge key_features, only update photo_url if not set
          const { data: existingModel } = await supabase
            .from("models")
            .select("id, photo_url, key_features")
            .eq("model_name", modelName)
            .maybeSingle();

          if (existingModel) {
            const updateData = { ...record };
            if (existingModel.photo_url) {
              delete updateData.photo_url; // keep existing photo
            }
            // Merge key_features
            const existingFeatures = Array.isArray(existingModel.key_features) ? existingModel.key_features as string[] : [];
            const mergedFeatures = [...new Set([...existingFeatures, ...keyFeatures])];
            updateData.key_features = mergedFeatures;

            const { error } = await supabase
              .from("models")
              .update(updateData)
              .eq("id", existingModel.id);
            if (error) throw error;
            updated++;
          }
        } else {
          const { error } = await supabase.from("models").insert(record as any);
          if (error) throw error;
          created++;
          existingModelNames.add(modelName);
        }
      } catch (err) {
        console.error(`Error importing ${modelName}:`, err);
        errors++;
      }

      setSpecsProgress(Math.round(((i + 1) / specRows.length) * 100));
    }

    setSpecsSummary({ created, updated, errors });
    setIsImportingSpecs(false);
    toast({ title: "Specs import complete", description: `Created: ${created}, Updated: ${updated}, Errors: ${errors}` });
  };

  const handleImportImages = async () => {
    if (imageRows.length === 0) return;
    setIsImportingImages(true);
    setImagesProgress(0);

    // Look up all model IDs
    const uniqueNames = [...new Set(imageRows.map(r => r.model_name.trim()))];
    const modelIdMap = new Map<string, string>();

    // Fetch in batches of 50
    for (let i = 0; i < uniqueNames.length; i += 50) {
      const batch = uniqueNames.slice(i, i + 50);
      const { data } = await supabase
        .from("models")
        .select("id, model_name")
        .in("model_name", batch);
      data?.forEach(m => modelIdMap.set(m.model_name, m.id));
    }

    // Group images by model
    const imagesByModel = new Map<string, ImageRow[]>();
    for (const row of imageRows) {
      const name = row.model_name.trim();
      if (!imagesByModel.has(name)) imagesByModel.set(name, []);
      imagesByModel.get(name)!.push(row);
    }

    let imported = 0, errors = 0;
    const modelNames = [...imagesByModel.keys()];

    for (let i = 0; i < modelNames.length; i++) {
      const name = modelNames[i];
      const modelId = modelIdMap.get(name);
      if (!modelId) {
        errors += imagesByModel.get(name)!.length;
        continue;
      }

      try {
        // Delete existing photos for this model
        await supabase.from("model_photos").delete().eq("model_id", modelId);

        const photos = imagesByModel.get(name)!.map(img => ({
          model_id: modelId,
          photo_url: img.image_url.trim(),
          photo_order: parseInt(img.image_index) || 0,
          caption: null,
        }));

        const { error } = await supabase.from("model_photos").insert(photos);
        if (error) throw error;
        imported += photos.length;
      } catch (err) {
        console.error(`Error importing images for ${name}:`, err);
        errors += imagesByModel.get(name)!.length;
      }

      setImagesProgress(Math.round(((i + 1) / modelNames.length) * 100));
    }

    setImagesSummary({ imported, errors });
    setIsImportingImages(false);
    toast({ title: "Images import complete", description: `Imported: ${imported}, Errors: ${errors}` });
  };

  const handleFileDrop = useCallback((e: React.DragEvent, type: "specs" | "images") => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith(".csv")) {
      if (type === "specs") setSpecsFile(file);
      else setImagesFile(file);
    }
  }, []);

  const newCount = specRows.filter(r => !existingModelNames.has(r.model_name?.trim())).length;
  const updateCount = specRows.filter(r => existingModelNames.has(r.model_name?.trim())).length;
  const uniqueImageModels = new Set(imageRows.map(r => r.model_name?.trim())).size;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container-wide py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" asChild>
            <a href="/admin/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</a>
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold">Alvarez CSV Import</h1>
          <p className="text-muted-foreground">Import scraped guitar data from alvarezguitars.com</p>
        </div>

        {/* File Upload Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Specs CSV */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Specs CSV</CardTitle>
              <CardDescription>Guitar model specifications (model_name, series, shape, specs...)</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleFileDrop(e, "specs")}
                onClick={() => document.getElementById("specs-input")?.click()}
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                {specsFile ? (
                  <p className="text-sm font-medium">{specsFile.name}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Drop specs CSV here or click to browse</p>
                )}
                <input
                  id="specs-input"
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && setSpecsFile(e.target.files[0])}
                />
              </div>
            </CardContent>
          </Card>

          {/* Images CSV */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ImageIcon className="h-5 w-5" /> Images CSV</CardTitle>
              <CardDescription>Product images (model_name, image_index, image_url)</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleFileDrop(e, "images")}
                onClick={() => document.getElementById("images-input")?.click()}
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                {imagesFile ? (
                  <p className="text-sm font-medium">{imagesFile.name}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Drop images CSV here or click to browse</p>
                )}
                <input
                  id="images-input"
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && setImagesFile(e.target.files[0])}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Validate Button */}
        {(specsFile || imagesFile) && !isValidated && (
          <div className="mb-8">
            <Button onClick={handleValidate} size="lg">Validate & Preview</Button>
          </div>
        )}

        {/* Preview Section */}
        {isValidated && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-2xl font-bold">{specRows.length}</div>
                  <div className="text-sm text-muted-foreground">Total Specs Rows</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-2xl font-bold text-green-600">{newCount}</div>
                  <div className="text-sm text-muted-foreground">New Models</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-2xl font-bold text-amber-600">{updateCount}</div>
                  <div className="text-sm text-muted-foreground">To Update</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-2xl font-bold">{imageRows.length}</div>
                  <div className="text-sm text-muted-foreground">Image Rows</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-2xl font-bold">{uniqueImageModels}</div>
                  <div className="text-sm text-muted-foreground">Models w/ Images</div>
                </CardContent>
              </Card>
            </div>

            {/* Specs Preview */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Specs Preview (first 10 rows)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Model</TableHead>
                        <TableHead>Series</TableHead>
                        <TableHead>Shape</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead># Features</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {specRows.slice(0, 10).map((row, i) => {
                        const isExisting = existingModelNames.has(row.model_name?.trim());
                        return (
                          <TableRow key={i}>
                            <TableCell className="font-mono font-medium">{row.model_name}</TableCell>
                            <TableCell>{row.series || "—"}</TableCell>
                            <TableCell>{row.shape || "—"}</TableCell>
                            <TableCell>{row.product_status || "current"}</TableCell>
                            <TableCell>{row.year_model || "—"}</TableCell>
                            <TableCell>
                              {isExisting ? (
                                <span className="text-amber-600 text-sm">Update</span>
                              ) : (
                                <span className="text-green-600 text-sm">Create</span>
                              )}
                            </TableCell>
                            <TableCell>{buildKeyFeatures(row).length}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Import Specs */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Step 1: Import Specs</CardTitle>
                <CardDescription>Import/update {specRows.length} models into the database</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isImportingSpecs && (
                  <div className="space-y-2">
                    <Progress value={specsProgress} />
                    <p className="text-sm text-muted-foreground">{specsProgress}% complete</p>
                  </div>
                )}
                {specsSummary ? (
                  <div className="flex items-center gap-4">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Created: {specsSummary.created} | Updated: {specsSummary.updated} | Errors: {specsSummary.errors}</span>
                  </div>
                ) : (
                  <Button onClick={handleImportSpecs} disabled={isImportingSpecs || specRows.length === 0}>
                    {isImportingSpecs && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Import Specs ({specRows.length} rows)
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Import Images */}
            {imageRows.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Step 2: Import Images</CardTitle>
                  <CardDescription>Import {imageRows.length} images for {uniqueImageModels} models</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isImportingImages && (
                    <div className="space-y-2">
                      <Progress value={imagesProgress} />
                      <p className="text-sm text-muted-foreground">{imagesProgress}% complete</p>
                    </div>
                  )}
                  {imagesSummary ? (
                    <div className="flex items-center gap-4">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span>Imported: {imagesSummary.imported} | Errors: {imagesSummary.errors}</span>
                    </div>
                  ) : (
                    <Button
                      onClick={handleImportImages}
                      disabled={isImportingImages || !specsSummary}
                      variant={specsSummary ? "default" : "secondary"}
                    >
                      {isImportingImages && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      {!specsSummary ? "Import specs first" : `Import Images (${imageRows.length} rows)`}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Done Summary */}
            {specsSummary && (imagesSummary || imageRows.length === 0) && (
              <Card>
                <CardContent className="pt-6 text-center space-y-4">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                  <h2 className="text-xl font-bold">Import Complete!</h2>
                  <Button asChild>
                    <a href="/admin/models">View Models →</a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AdminImportCSV;
