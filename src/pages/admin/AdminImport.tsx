import { useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import Papa from "papaparse";
import { supabase } from "@/integrations/supabase/client";
import { useModels } from "@/hooks/useModels";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { 
  Guitar, Layers, FileText, Upload, Download, ChevronDown, ChevronUp,
  CheckCircle, AlertTriangle, XCircle, HelpCircle, ArrowLeft, Loader2
} from "lucide-react";

type ImportType = "models" | "patterns" | "features";

interface ValidationResult {
  row: number;
  data: Record<string, string>;
  status: "valid" | "warning" | "error";
  messages: string[];
}

const VALID_COUNTRIES = ["Japan", "Korea", "China", "USA"];
const VALID_CATEGORIES = ["tuner", "truss_rod", "bridge", "label", "body_shape"];

const AdminImport = () => {
  const [searchParams] = useSearchParams();
  const initialType = (searchParams.get("type") as ImportType) || "models";
  
  const [importType, setImportType] = useState<ImportType>(initialType);
  const [helpOpen, setHelpOpen] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importComplete, setImportComplete] = useState(false);
  const [importSummary, setImportSummary] = useState<{ success: number; skipped: number; total: number } | null>(null);

  const { data: existingModels } = useModels();

  const importTypes = [
    { id: "models" as ImportType, label: "Models", icon: Guitar, description: "Import guitar model reference data" },
    { id: "patterns" as ImportType, label: "Serial Patterns", icon: Layers, description: "Import serial number decoding rules" },
    { id: "features" as ImportType, label: "Identifying Features", icon: FileText, description: "Import feature reference library" },
  ];

  const resetState = () => {
    setFile(null);
    setValidationResults([]);
    setImportComplete(false);
    setImportSummary(null);
    setImportProgress(0);
  };

  const handleTypeChange = (type: ImportType) => {
    setImportType(type);
    resetState();
  };

  // Template generation
  const generateTemplate = () => {
    let headers: string[] = [];
    let exampleRows: string[][] = [];

    if (importType === "models") {
      headers = ["model_name", "production_start_year", "production_end_year", "country_of_manufacture", "series", "body_shape", "description", "key_features"];
      exampleRows = [
        ["5021", "1970", "1985", "Japan", "5000 Series", "Dreadnought", "Classic dreadnought from the Japan era", "Solid spruce top|Rosewood back/sides|Dovetail neck joint|Herringbone binding"],
        ["5045", "1993", "1999", "Korea", "5000 Series", "Dreadnought", "Korean-made dreadnought from mid-90s", "Solid top|Die-cast tuners|Rosewood bridge"],
        ["DY-77", "1972", "1978", "Japan", "Yairi Series", "Dreadnought", "Alvarez-Yairi collaboration model", "Hand-built|Yairi craftsmanship|Abalone inlays"],
      ];
    } else if (importType === "patterns") {
      headers = ["model_name", "serial_prefix", "year_range_start", "year_range_end", "serial_range_start", "serial_range_end", "confidence_notes"];
      exampleRows = [
        ["5021", "45", "1978", "1982", "45000", "45999", "Serial numbers in 45xxx range typically indicate late 1970s to early 1980s Japan production"],
        ["5045", "78", "1993", "1996", "78000", "78999", "78xxx serials correlate with mid-1990s Korean production based on verified examples"],
        ["AD90SCK", "12", "2004", "2008", "120000", "129999", "Six-digit serials starting 12xxxx indicate mid-2000s production"],
      ];
    } else {
      headers = ["feature_category", "feature_name", "feature_value", "description", "era_start", "era_end", "photo_url"];
      exampleRows = [
        ["tuner", "Open-back tuners", "open_back", "Three-on-a-plate open-back tuners common on 1970s Japanese models", "1970", "1982", ""],
        ["tuner", "Closed-back tuners", "closed_back", "Individual closed-back die-cast tuners became standard in early 1980s", "1980", "", ""],
        ["truss_rod", "Soundhole truss rod access", "soundhole", "Truss rod adjustment through soundhole typical of 1970s-early 80s construction", "1970", "1985", ""],
        ["label", "Orange/gold label", "orange_gold", "Orange and gold colored label characteristic of 1970s Japan production", "1970", "1985", ""],
      ];
    }

    const csv = [headers.join(","), ...exampleRows.map(row => row.map(cell => 
      cell.includes(",") || cell.includes('"') ? `"${cell.replace(/"/g, '""')}"` : cell
    ).join(","))].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${importType}_import_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Validation logic
  const validateModelsRow = async (row: Record<string, string>, rowNum: number, existingNames: Set<string>): Promise<ValidationResult> => {
    const messages: string[] = [];
    let status: "valid" | "warning" | "error" = "valid";

    // Required: model_name
    if (!row.model_name?.trim()) {
      messages.push(`"model_name" is required`);
      status = "error";
    } else if (row.model_name.length > 50) {
      messages.push(`"model_name" must be 50 characters or less (got ${row.model_name.length})`);
      status = "error";
    } else if (existingNames.has(row.model_name.trim())) {
      messages.push(`Model "${row.model_name}" already exists in database`);
      status = "error";
    }

    // Country validation
    if (row.country_of_manufacture && !VALID_COUNTRIES.includes(row.country_of_manufacture.trim())) {
      messages.push(`"country_of_manufacture" must be Japan, Korea, China, or USA. You entered: "${row.country_of_manufacture}"`);
      status = "error";
    }

    // Year validations
    const startYear = row.production_start_year ? parseInt(row.production_start_year) : null;
    const endYear = row.production_end_year ? parseInt(row.production_end_year) : null;

    if (startYear !== null && (isNaN(startYear) || startYear < 1960 || startYear > 2030)) {
      messages.push(`"production_start_year" must be a year between 1960-2030. You entered: "${row.production_start_year}"`);
      status = "error";
    }

    if (endYear !== null && (isNaN(endYear) || endYear < 1960 || endYear > 2030)) {
      messages.push(`"production_end_year" must be a year between 1960-2030. You entered: "${row.production_end_year}"`);
      status = "error";
    }

    if (startYear && endYear && endYear < startYear) {
      messages.push(`"production_end_year" (${endYear}) must be after "production_start_year" (${startYear})`);
      status = "error";
    }

    // Warnings
    if (status !== "error") {
      if (!row.description?.trim()) {
        messages.push(`No description provided (recommended)`);
        status = "warning";
      }
      if (!row.key_features?.trim()) {
        messages.push(`No key_features provided (recommended)`);
        if (status !== "warning") status = "warning";
      }
    }

    return { row: rowNum, data: row, status, messages };
  };

  const validatePatternsRow = async (row: Record<string, string>, rowNum: number, modelNames: Set<string>): Promise<ValidationResult> => {
    const messages: string[] = [];
    let status: "valid" | "warning" | "error" = "valid";

    // Required: model_name must exist
    if (!row.model_name?.trim()) {
      messages.push(`"model_name" is required`);
      status = "error";
    } else if (!modelNames.has(row.model_name.trim())) {
      messages.push(`Model "${row.model_name}" not found. Add this model first or check spelling.`);
      status = "error";
    }

    // Required year ranges
    const startYear = parseInt(row.year_range_start);
    const endYear = parseInt(row.year_range_end);

    if (!row.year_range_start || isNaN(startYear) || startYear < 1960 || startYear > 2030) {
      messages.push(`"year_range_start" is required and must be 1960-2030. You entered: "${row.year_range_start}"`);
      status = "error";
    }

    if (!row.year_range_end || isNaN(endYear) || endYear < 1960 || endYear > 2030) {
      messages.push(`"year_range_end" is required and must be 1960-2030. You entered: "${row.year_range_end}"`);
      status = "error";
    }

    if (!isNaN(startYear) && !isNaN(endYear) && endYear < startYear) {
      messages.push(`"year_range_end" (${endYear}) must be >= "year_range_start" (${startYear})`);
      status = "error";
    }

    return { row: rowNum, data: row, status, messages };
  };

  const validateFeaturesRow = async (row: Record<string, string>, rowNum: number): Promise<ValidationResult> => {
    const messages: string[] = [];
    let status: "valid" | "warning" | "error" = "valid";

    // Required: feature_category
    if (!row.feature_category?.trim()) {
      messages.push(`"feature_category" is required`);
      status = "error";
    } else if (!VALID_CATEGORIES.includes(row.feature_category.trim())) {
      messages.push(`"feature_category" must be: tuner, truss_rod, bridge, label, or body_shape. You entered: "${row.feature_category}"`);
      status = "error";
    }

    // Required: feature_name
    if (!row.feature_name?.trim()) {
      messages.push(`"feature_name" is required`);
      status = "error";
    } else if (row.feature_name.length > 100) {
      messages.push(`"feature_name" must be 100 characters or less`);
      status = "error";
    }

    // Required: feature_value
    if (!row.feature_value?.trim()) {
      messages.push(`"feature_value" is required`);
      status = "error";
    } else if (!/^[a-z0-9_]+$/.test(row.feature_value.trim())) {
      messages.push(`"feature_value" must be lowercase with underscores only. You entered: "${row.feature_value}"`);
      status = "error";
    }

    // Required: description
    if (!row.description?.trim()) {
      messages.push(`"description" is required`);
      status = "error";
    }

    // Era validation warnings
    const eraStart = row.era_start ? parseInt(row.era_start) : null;
    const eraEnd = row.era_end ? parseInt(row.era_end) : null;

    if (eraStart !== null && eraEnd !== null && eraEnd < eraStart) {
      messages.push(`"era_end" (${eraEnd}) should be after "era_start" (${eraStart})`);
      if (status !== "error") status = "warning";
    }

    if ((eraStart && (eraStart < 1960 || eraStart > 2030)) || (eraEnd && (eraEnd < 1960 || eraEnd > 2030))) {
      messages.push(`Era dates outside 1960-2030 seem unusual`);
      if (status !== "error") status = "warning";
    }

    return { row: rowNum, data: row, status, messages };
  };

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    setIsValidating(true);
    setValidationResults([]);

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: async (results) => {
        const existingModelNames = new Set((existingModels || []).map(m => m.model_name));
        const validationPromises = results.data.map(async (row, index) => {
          const rowData = row as Record<string, string>;
          if (importType === "models") {
            return validateModelsRow(rowData, index + 2, existingModelNames);
          } else if (importType === "patterns") {
            return validatePatternsRow(rowData, index + 2, existingModelNames);
          } else {
            return validateFeaturesRow(rowData, index + 2);
          }
        });

        const results2 = await Promise.all(validationPromises);
        setValidationResults(results2);
        setIsValidating(false);
      },
      error: (error) => {
        toast({ title: "Parse Error", description: error.message, variant: "destructive" });
        setIsValidating(false);
      }
    });
  }, [importType, existingModels]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === "text/csv" || droppedFile?.name.endsWith(".csv")) {
      handleFileSelect(droppedFile);
    } else {
      toast({ title: "Invalid File", description: "Please upload a CSV file", variant: "destructive" });
    }
  }, [handleFileSelect]);

  const handleImport = async () => {
    const validRows = validationResults.filter(r => r.status === "valid" || r.status === "warning");
    if (validRows.length === 0) return;

    setIsImporting(true);
    setImportProgress(0);

    let successCount = 0;
    let errorCount = 0;
    const batchSize = 50;

    for (let i = 0; i < validRows.length; i += batchSize) {
      const batch = validRows.slice(i, i + batchSize);
      
      try {
        if (importType === "models") {
          const insertData = batch.map(r => ({
            model_name: r.data.model_name.trim(),
            production_start_year: r.data.production_start_year ? parseInt(r.data.production_start_year) : null,
            production_end_year: r.data.production_end_year ? parseInt(r.data.production_end_year) : null,
            country_of_manufacture: r.data.country_of_manufacture?.trim() || null,
            series: r.data.series?.trim() || null,
            body_shape: r.data.body_shape?.trim() || null,
            description: r.data.description?.trim() || null,
            key_features: r.data.key_features ? r.data.key_features.split("|").map(f => f.trim()) : [],
          }));

          const { error } = await supabase.from("models").insert(insertData);
          if (error) throw error;
          successCount += batch.length;
        } else if (importType === "patterns") {
          // Look up model IDs
          const modelNames = [...new Set(batch.map(r => r.data.model_name.trim()))];
          const { data: models } = await supabase
            .from("models")
            .select("id, model_name")
            .in("model_name", modelNames);
          
          const modelIdMap = new Map(models?.map(m => [m.model_name, m.id]) || []);

          const insertData = batch.map(r => ({
            model_id: modelIdMap.get(r.data.model_name.trim()) || null,
            serial_prefix: r.data.serial_prefix?.trim() || null,
            year_range_start: parseInt(r.data.year_range_start),
            year_range_end: parseInt(r.data.year_range_end),
            serial_range_start: r.data.serial_range_start?.trim() || null,
            serial_range_end: r.data.serial_range_end?.trim() || null,
            confidence_notes: r.data.confidence_notes?.trim() || null,
          }));

          const { error } = await supabase.from("serial_patterns").insert(insertData);
          if (error) throw error;
          successCount += batch.length;
        } else {
          const insertData = batch.map(r => ({
            feature_category: r.data.feature_category.trim(),
            feature_name: r.data.feature_name.trim(),
            feature_value: r.data.feature_value.trim(),
            description: r.data.description.trim(),
            era_start: r.data.era_start ? parseInt(r.data.era_start) : null,
            era_end: r.data.era_end ? parseInt(r.data.era_end) : null,
            photo_url: r.data.photo_url?.trim() || null,
          }));

          const { error } = await supabase.from("identifying_features").insert(insertData);
          if (error) throw error;
          successCount += batch.length;
        }
      } catch (err) {
        console.error("Batch import error:", err);
        errorCount += batch.length;
      }

      setImportProgress(Math.round(((i + batch.length) / validRows.length) * 100));
    }

    const skippedCount = validationResults.filter(r => r.status === "error").length;
    setImportSummary({ success: successCount, skipped: skippedCount + errorCount, total: validationResults.length });
    setImportComplete(true);
    setIsImporting(false);

    toast({
      title: "Import Complete",
      description: `Successfully imported ${successCount} rows`,
    });
  };

  const validCount = validationResults.filter(r => r.status === "valid").length;
  const warningCount = validationResults.filter(r => r.status === "warning").length;
  const errorCount = validationResults.filter(r => r.status === "error").length;

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
          <h1 className="text-3xl font-bold">Bulk Data Import</h1>
          <p className="text-muted-foreground">Import models, serial patterns, or identifying features from CSV files</p>
        </div>

        {/* Section A: Import Type Selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {importTypes.map((type) => (
            <Card 
              key={type.id}
              className={`cursor-pointer transition-all ${importType === type.id ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/50"}`}
              onClick={() => handleTypeChange(type.id)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <type.icon className={`h-8 w-8 ${importType === type.id ? "text-primary" : "text-muted-foreground"}`} />
                  <div>
                    <CardTitle className="text-lg">{type.label}</CardTitle>
                    <CardDescription>{type.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Section B: Help & Documentation */}
        <Collapsible open={helpOpen} onOpenChange={setHelpOpen} className="mb-8">
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    <CardTitle>Help & Documentation</CardTitle>
                  </div>
                  {helpOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                {importType === "models" && <ModelsHelpContent />}
                {importType === "patterns" && <PatternsHelpContent />}
                {importType === "features" && <FeaturesHelpContent />}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Section C: Upload Interface */}
        {!importComplete && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Upload CSV File</CardTitle>
              <CardDescription>
                Download the template, fill in your data, then upload to preview and import
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button onClick={generateTemplate} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download {importType.charAt(0).toUpperCase() + importType.slice(1)} Template
              </Button>

              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors"
              >
                <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-2">Drag and drop your CSV file here, or</p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                  id="csv-upload"
                />
                <Button variant="secondary" onClick={() => document.getElementById("csv-upload")?.click()}>
                  Browse Files
                </Button>
                {file && <p className="mt-4 text-sm">Selected: <strong>{file.name}</strong></p>}
              </div>

              {isValidating && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Validating file...
                </div>
              )}

              {validationResults.length > 0 && !isValidating && (
                <>
                  {/* Validation Summary */}
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span>{validCount} valid rows</span>
                    </div>
                    {warningCount > 0 && (
                      <div className="flex items-center gap-2 text-amber-600">
                        <AlertTriangle className="h-5 w-5" />
                        <span>{warningCount} warnings (will import)</span>
                      </div>
                    )}
                    {errorCount > 0 && (
                      <div className="flex items-center gap-2 text-red-600">
                        <XCircle className="h-5 w-5" />
                        <span>{errorCount} errors (will skip)</span>
                      </div>
                    )}
                  </div>

                  {/* Preview Table */}
                  <div className="border rounded-lg overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">Row</TableHead>
                          <TableHead className="w-12">Status</TableHead>
                          <TableHead>Data Preview</TableHead>
                          <TableHead>Messages</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {validationResults.slice(0, 10).map((result) => (
                          <TableRow key={result.row} className={
                            result.status === "error" ? "bg-red-50 dark:bg-red-950/20" :
                            result.status === "warning" ? "bg-amber-50 dark:bg-amber-950/20" : ""
                          }>
                            <TableCell>{result.row}</TableCell>
                            <TableCell>
                              {result.status === "valid" && <CheckCircle className="h-4 w-4 text-green-600" />}
                              {result.status === "warning" && <AlertTriangle className="h-4 w-4 text-amber-600" />}
                              {result.status === "error" && <XCircle className="h-4 w-4 text-red-600" />}
                            </TableCell>
                            <TableCell className="font-mono text-xs max-w-md truncate">
                              {Object.entries(result.data).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(" | ")}
                            </TableCell>
                            <TableCell className="text-sm">
                              {result.messages.map((msg, i) => (
                                <div key={i} className={
                                  result.status === "error" ? "text-red-600" : 
                                  result.status === "warning" ? "text-amber-600" : ""
                                }>{msg}</div>
                              ))}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {validationResults.length > 10 && (
                      <div className="p-3 text-center text-sm text-muted-foreground border-t">
                        Showing first 10 of {validationResults.length} rows
                      </div>
                    )}
                  </div>

                  {/* Error Details (if any) */}
                  {errorCount > 0 && (
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button variant="outline" size="sm">
                          View All {errorCount} Errors <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-4 space-y-2">
                        {validationResults.filter(r => r.status === "error").map((result) => (
                          <div key={result.row} className="p-3 bg-red-50 dark:bg-red-950/20 rounded text-sm">
                            <strong>Row {result.row}:</strong>
                            {result.messages.map((msg, i) => (
                              <div key={i} className="text-red-600 ml-4">❌ {msg}</div>
                            ))}
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  )}

                  {/* Import Button */}
                  <Button 
                    onClick={handleImport} 
                    disabled={validCount + warningCount === 0 || isImporting}
                    className="w-full"
                  >
                    {isImporting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      `Import ${validCount + warningCount} Valid Rows`
                    )}
                  </Button>
                </>
              )}

              {/* Import Progress */}
              {isImporting && (
                <div className="space-y-2">
                  <Progress value={importProgress} />
                  <p className="text-sm text-muted-foreground text-center">
                    Importing... {importProgress}%
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Section D: Import Results */}
        {importComplete && importSummary && (
          <Card className="border-green-500/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <CardTitle className="text-green-600">Import Complete</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">{importSummary.success}</div>
                  <div className="text-sm text-muted-foreground">Successfully Imported</div>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <div className="text-3xl font-bold text-red-600">{importSummary.skipped}</div>
                  <div className="text-sm text-muted-foreground">Skipped with Errors</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold">{importSummary.total}</div>
                  <div className="text-sm text-muted-foreground">Total Processed</div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={resetState}>Import Another File</Button>
                <Button variant="outline" asChild>
                  <a href="/admin/dashboard">Back to Dashboard</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
};

// Help Content Components
const ModelsHelpContent = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold flex items-center gap-2">
      📋 IMPORTING GUITAR MODELS
    </h3>
    
    <div>
      <h4 className="font-semibold">What This Does:</h4>
      <p>Bulk add guitar models to the database. Each model represents a specific Alvarez guitar (e.g., 5021, 5045, DY-77) with production details.</p>
    </div>

    <div>
      <h4 className="font-semibold">Before You Start:</h4>
      <ul className="list-none space-y-1">
        <li>✓ Gather model information (names, years, countries)</li>
        <li>✓ Prepare descriptions and key features</li>
        <li>✓ Download the template below to see the exact format needed</li>
      </ul>
    </div>

    <div>
      <h4 className="font-semibold">CSV Format Required:</h4>
      <ul className="list-disc ml-4 space-y-1">
        <li>Column headers must match exactly (case-sensitive)</li>
        <li>Dates should be 4-digit years (e.g., 1978, not '78)</li>
        <li>key_features should be separated by the pipe symbol |</li>
        <li>Empty cells are allowed for optional fields</li>
      </ul>
    </div>

    <div className="grid md:grid-cols-2 gap-4">
      <div>
        <h4 className="font-semibold text-green-600">Required Columns:</h4>
        <ul className="list-disc ml-4 space-y-1">
          <li><code>model_name</code> - The model identifier (e.g., "5021", "DY-77")</li>
          <li><code>country_of_manufacture</code> - Must be: Japan, Korea, China, or USA</li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold text-blue-600">Optional Columns:</h4>
        <ul className="list-disc ml-4 space-y-1">
          <li><code>production_start_year</code> - When production began</li>
          <li><code>production_end_year</code> - When production ended</li>
          <li><code>series</code> - Model series name</li>
          <li><code>body_shape</code> - Guitar body type</li>
          <li><code>description</code> - Detailed description</li>
          <li><code>key_features</code> - Pipe-separated list</li>
        </ul>
      </div>
    </div>

    <div>
      <h4 className="font-semibold">Example Row:</h4>
      <code className="block p-2 bg-muted rounded text-xs">
        5021,1970,1985,Japan,5000 Series,Dreadnought,"Classic Japan-era dreadnought","Solid spruce top|Rosewood back/sides|Dovetail neck joint"
      </code>
    </div>

    <div>
      <h4 className="font-semibold text-red-600">Common Mistakes:</h4>
      <ul className="list-none space-y-1">
        <li>❌ Using commas in descriptions without quotes</li>
        <li>❌ Mixing date formats (use 1978, not 78 or 1978-01-01)</li>
        <li>❌ Typos in country names (must match exactly: Japan, Korea, China, USA)</li>
        <li>❌ Duplicate model names (each must be unique)</li>
      </ul>
    </div>
  </div>
);

const PatternsHelpContent = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold flex items-center gap-2">
      🔢 IMPORTING SERIAL NUMBER PATTERNS
    </h3>
    
    <div>
      <h4 className="font-semibold">What This Does:</h4>
      <p>Add serial number decoding rules that help identify guitar age and origin based on serial number patterns.</p>
    </div>

    <div>
      <h4 className="font-semibold">Before You Start:</h4>
      <ul className="list-none space-y-1">
        <li>✓ Have models already imported (patterns reference existing models)</li>
        <li>✓ Know the serial prefixes or ranges for different production periods</li>
        <li>✓ Understand the confidence level of each pattern</li>
      </ul>
    </div>

    <div className="grid md:grid-cols-2 gap-4">
      <div>
        <h4 className="font-semibold text-green-600">Required Columns:</h4>
        <ul className="list-disc ml-4 space-y-1">
          <li><code>model_name</code> - Must match an existing model exactly</li>
          <li><code>serial_prefix</code> - First digits (e.g., "45", "78")</li>
          <li><code>year_range_start</code> - First year used</li>
          <li><code>year_range_end</code> - Last year used</li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold text-blue-600">Optional Columns:</h4>
        <ul className="list-disc ml-4 space-y-1">
          <li><code>serial_range_start</code> - Lowest serial</li>
          <li><code>serial_range_end</code> - Highest serial</li>
          <li><code>confidence_notes</code> - Certainty explanation</li>
        </ul>
      </div>
    </div>

    <div>
      <h4 className="font-semibold">Important Notes:</h4>
      <ul className="list-none space-y-1">
        <li>⚠️ The model_name must already exist in the Models table</li>
        <li>⚠️ Serial patterns can overlap (same prefix for different year ranges)</li>
        <li>⚠️ Be conservative with year ranges if uncertain</li>
      </ul>
    </div>

    <div>
      <h4 className="font-semibold">How Pattern Matching Works:</h4>
      <p>When a user enters serial "45678", the system:</p>
      <ol className="list-decimal ml-4">
        <li>Checks if it starts with "45" (prefix match)</li>
        <li>Checks if 45678 is between serial_range_start and serial_range_end</li>
        <li>Returns the year range and confidence notes</li>
      </ol>
    </div>
  </div>
);

const FeaturesHelpContent = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold flex items-center gap-2">
      🔍 IMPORTING IDENTIFYING FEATURES
    </h3>
    
    <div>
      <h4 className="font-semibold">What This Does:</h4>
      <p>Build a reference library of guitar features (tuner types, truss rod locations, label colors, etc.) that help identify guitar age and origin when serial numbers are unknown.</p>
    </div>

    <div>
      <h4 className="font-semibold">Before You Start:</h4>
      <ul className="list-none space-y-1">
        <li>✓ Know which features were used in which time periods</li>
        <li>✓ Have clear descriptions for each feature</li>
        <li>✓ Understand feature categories</li>
      </ul>
    </div>

    <div className="grid md:grid-cols-2 gap-4">
      <div>
        <h4 className="font-semibold text-green-600">Required Columns:</h4>
        <ul className="list-disc ml-4 space-y-1">
          <li><code>feature_category</code> - tuner, truss_rod, bridge, label, or body_shape</li>
          <li><code>feature_name</code> - Descriptive name</li>
          <li><code>feature_value</code> - Short code for filtering</li>
          <li><code>description</code> - Detailed explanation</li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold text-blue-600">Optional Columns:</h4>
        <ul className="list-disc ml-4 space-y-1">
          <li><code>era_start</code> - First year used</li>
          <li><code>era_end</code> - Last year used</li>
          <li><code>photo_url</code> - Reference photo URL</li>
        </ul>
      </div>
    </div>

    <div>
      <h4 className="font-semibold">Feature Categories Explained:</h4>
      <ul className="list-disc ml-4 space-y-1">
        <li><strong>tuner</strong> - Types of tuning machines (open-back, closed-back, vintage)</li>
        <li><strong>truss_rod</strong> - Truss rod access location (soundhole, headstock)</li>
        <li><strong>bridge</strong> - Bridge styles and materials</li>
        <li><strong>label</strong> - Internal label colors and designs</li>
        <li><strong>body_shape</strong> - Physical guitar shapes (dreadnought, concert, jumbo)</li>
      </ul>
    </div>

    <div>
      <h4 className="font-semibold">How Features Are Used:</h4>
      <p>Users answer questions like "What type of tuners?" and select "Closed-back tuners". The system then shows models that used closed-back tuners during their production.</p>
    </div>
  </div>
);

export default AdminImport;
