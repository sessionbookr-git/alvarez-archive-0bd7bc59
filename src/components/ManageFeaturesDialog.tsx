import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useIdentifyingFeatures, useFeatureCategories } from "@/hooks/useIdentifyingFeatures";
import { useModelFeatures, useSaveModelFeatures } from "@/hooks/useModelFeatures";
import { Loader2 } from "lucide-react";

interface ManageFeaturesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modelId: string;
  modelName: string;
}

interface FeatureSelection {
  feature_id: string;
  is_required: boolean;
}

const ManageFeaturesDialog = ({
  open,
  onOpenChange,
  modelId,
  modelName,
}: ManageFeaturesDialogProps) => {
  const { toast } = useToast();
  const [selections, setSelections] = useState<Map<string, FeatureSelection>>(new Map());

  const { data: categories, isLoading: categoriesLoading } = useFeatureCategories();
  const { data: allFeatures, isLoading: featuresLoading } = useIdentifyingFeatures();
  const { data: modelFeatures, isLoading: modelFeaturesLoading } = useModelFeatures(modelId);
  const saveMutation = useSaveModelFeatures();

  // Initialize selections from existing model features
  useEffect(() => {
    if (modelFeatures) {
      const newSelections = new Map<string, FeatureSelection>();
      modelFeatures.forEach((mf) => {
        newSelections.set(mf.feature_id, {
          feature_id: mf.feature_id,
          is_required: mf.is_required,
        });
      });
      setSelections(newSelections);
    }
  }, [modelFeatures]);

  const handleToggleFeature = (featureId: string) => {
    const newSelections = new Map(selections);
    if (newSelections.has(featureId)) {
      newSelections.delete(featureId);
    } else {
      newSelections.set(featureId, { feature_id: featureId, is_required: false });
    }
    setSelections(newSelections);
  };

  const handleToggleRequired = (featureId: string) => {
    const newSelections = new Map(selections);
    const existing = newSelections.get(featureId);
    if (existing) {
      newSelections.set(featureId, { ...existing, is_required: !existing.is_required });
      setSelections(newSelections);
    }
  };

  const handleSave = () => {
    saveMutation.mutate(
      {
        modelId,
        features: Array.from(selections.values()),
      },
      {
        onSuccess: () => {
          toast({ title: "Features saved successfully" });
          onOpenChange(false);
        },
        onError: (error) => {
          toast({ title: "Error saving features", description: error.message, variant: "destructive" });
        },
      }
    );
  };

  const isLoading = categoriesLoading || featuresLoading || modelFeaturesLoading;

  // Group features by category
  const featuresByCategory = categories?.reduce((acc, category) => {
    acc[category] = allFeatures?.filter((f) => f.feature_category === category) || [];
    return acc;
  }, {} as Record<string, typeof allFeatures>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Features for {modelName}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Select the identifying features that apply to this model. Mark features as "required" if they must match for identification.
            </p>

            {categories?.map((category) => (
              <div key={category} className="border border-border rounded-lg p-4">
                <h3 className="font-semibold capitalize mb-3">
                  {category.replace("_", " ")}
                </h3>
                <div className="space-y-3">
                  {featuresByCategory?.[category]?.map((feature) => {
                    const isSelected = selections.has(feature.id);
                    const isRequired = selections.get(feature.id)?.is_required || false;

                    return (
                      <div
                        key={feature.id}
                        className={`flex items-center justify-between p-3 rounded-md border transition-colors ${
                          isSelected ? "border-foreground/30 bg-secondary/30" : "border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            id={feature.id}
                            checked={isSelected}
                            onCheckedChange={() => handleToggleFeature(feature.id)}
                          />
                          <Label htmlFor={feature.id} className="cursor-pointer">
                            <span className="font-medium">{feature.feature_name}</span>
                            {feature.description && (
                              <span className="text-sm text-muted-foreground ml-2">
                                - {feature.description}
                              </span>
                            )}
                          </Label>
                        </div>
                        {isSelected && (
                          <button
                            type="button"
                            onClick={() => handleToggleRequired(feature.id)}
                            className="text-xs"
                          >
                            <Badge variant={isRequired ? "default" : "outline"}>
                              {isRequired ? "Required" : "Optional"}
                            </Badge>
                          </button>
                        )}
                      </div>
                    );
                  })}
                  {featuresByCategory?.[category]?.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">No features in this category</p>
                  )}
                </div>
              </div>
            ))}

            <div className="flex justify-between items-center pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                {selections.size} feature{selections.size !== 1 ? "s" : ""} selected
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Saving..." : "Save Features"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ManageFeaturesDialog;
