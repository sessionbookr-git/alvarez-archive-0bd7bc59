import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useModels } from "@/hooks/useModels";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Check, Loader2, Image, AlertCircle, CheckCircle2 } from "lucide-react";

// Define the quiz flow order - this is critical for UX
const CATEGORY_ORDER = [
  'body_shape',      // Biggest eliminator - dread vs concert vs jumbo
  'construction',    // All solid vs laminate - major identifier
  'bridge_material', // Ebony vs Rosewood - key Yairi indicator
  'fingerboard',     // Matches bridge usually
  'electronics',     // Has pickup or not
  'tuner',          // Open-back vs enclosed
  'label',          // Final confirmation - orange/gold vs blue/silver
];

// Human-readable category labels and descriptions
const CATEGORY_LABELS: Record<string, string> = {
  body_shape: "What body shape is your guitar?",
  construction: "What is the construction type?",
  bridge_material: "What material is the bridge?",
  fingerboard: "What material is the fingerboard?",
  electronics: "Does your guitar have electronics?",
  tuner: "What type of tuners does your guitar have?",
  label: "What does the interior label look like?",
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  body_shape: "Select the closest match to your guitar's body",
  construction: "All solid wood vs laminate construction",
  bridge_material: "Look at the bridge where the strings attach",
  fingerboard: "The fretboard material on the neck",
  electronics: "Check if there's a pickup or preamp system",
  tuner: "Look at the tuning machines on the headstock",
  label: "Check inside the soundhole for a paper label",
};

interface ModelMatch {
  modelId: string;
  modelName: string;
  photoUrl: string | null;
  country: string | null;
  productionYears: string;
  matchedFeatures: number;
  matchedRequired: number;
  totalRequired: number;
  totalFeatures: number;
  matchPercentage: number;
  requiredMissing: number;
}

const Identify = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const { data: models } = useModels();

  // Fetch all model features with their identifying features
  const { data: allModelFeatures, isLoading: featuresLoading } = useQuery({
    queryKey: ["model-features-with-details"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("model_features")
        .select(`
          *,
          identifying_features (*)
        `);
      if (error) throw error;
      return data;
    },
  });

  // Get unique categories from features, ordered by our defined flow
  const orderedCategories = useMemo(() => {
    if (!allModelFeatures) return [];
    
    const categoriesInData = new Set(
      allModelFeatures.map((mf: any) => mf.identifying_features.feature_category)
    );
    
    // Return categories in our defined order, only including ones that exist in data
    return CATEGORY_ORDER.filter(cat => categoriesInData.has(cat));
  }, [allModelFeatures]);

  // Get features for current category
  const currentCategoryFeatures = useMemo(() => {
    if (!allModelFeatures || currentStep >= orderedCategories.length) return [];
    
    const currentCategory = orderedCategories[currentStep];
    const features = allModelFeatures
      .filter((mf: any) => mf.identifying_features.feature_category === currentCategory)
      .map((mf: any) => mf.identifying_features)
      // Remove duplicates by ID
      .filter((feature: any, index: number, self: any[]) => 
        index === self.findIndex((f) => f.id === feature.id)
      );
    
    return features;
  }, [allModelFeatures, currentStep, orderedCategories]);

  const totalSteps = orderedCategories.length;
  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;
  const isComplete = currentStep >= totalSteps;
  const currentCategory = orderedCategories[currentStep];
  const currentAnswer = currentCategory ? answers[currentCategory] : undefined;

  // THE FIXED MATCHING LOGIC
  const matchingModels = useMemo(() => {
    if (!isComplete || !allModelFeatures || !models) return [];

    // 1. Build set of selected feature IDs (now ONLY using IDs)
    const selectedFeatureIds = new Set<string>();
    
    Object.entries(answers).forEach(([category, answerId]) => {
      // answerId is now ALWAYS the feature.id
      selectedFeatureIds.add(answerId);
    });

    // 2. Group model_features by model
    const modelFeaturesMap = new Map<string, any[]>();
    allModelFeatures.forEach((mf: any) => {
      const existing = modelFeaturesMap.get(mf.model_id) || [];
      existing.push(mf);
      modelFeaturesMap.set(mf.model_id, existing);
    });

    // 3. Calculate match scores for each model
    const results: ModelMatch[] = [];

    modelFeaturesMap.forEach((modelFeatures, modelId) => {
      const model = models.find((m) => m.id === modelId);
      if (!model) return;

      // Separate required vs optional features
      const requiredFeatures = modelFeatures.filter((mf: any) => mf.is_required);
      const optionalFeatures = modelFeatures.filter((mf: any) => !mf.is_required);
      
      let matchedRequired = 0;
      let matchedOptional = 0;
      let requiredMissing = 0;

      // Check required features
      requiredFeatures.forEach((mf: any) => {
        if (selectedFeatureIds.has(mf.feature_id)) {
          matchedRequired++;
        } else {
          requiredMissing++;
        }
      });

      // Check optional features
      optionalFeatures.forEach((mf: any) => {
        if (selectedFeatureIds.has(mf.feature_id)) {
          matchedOptional++;
        }
      });

      const totalMatched = matchedRequired + matchedOptional;
      const totalFeatures = modelFeatures.length;

      // Only include models with at least one matching feature
      if (totalMatched > 0) {
        const matchPercentage = Math.round((totalMatched / totalFeatures) * 100);
        
        results.push({
          modelId,
          modelName: model.model_name,
          photoUrl: model.photo_url || null,
          country: model.country_of_manufacture,
          productionYears: model.production_start_year
            ? `${model.production_start_year}${model.production_end_year ? `-${model.production_end_year}` : "-present"}`
            : "Unknown",
          matchedFeatures: totalMatched,
          matchedRequired,
          totalRequired: requiredFeatures.length,
          totalFeatures,
          matchPercentage,
          requiredMissing,
        });
      }
    });

    // 4. PROPER SORTING: Required features first, then total matches
    return results.sort((a, b) => {
      // Perfect required matches first (0 missing required)
      if (a.requiredMissing !== b.requiredMissing) {
        return a.requiredMissing - b.requiredMissing;
      }
      // Then by number of matched required features (higher is better)
      if (a.matchedRequired !== b.matchedRequired) {
        return b.matchedRequired - a.matchedRequired;
      }
      // Then by total number of matches (higher is better)
      if (a.matchedFeatures !== b.matchedFeatures) {
        return b.matchedFeatures - a.matchedFeatures;
      }
      // Finally by percentage (higher is better)
      return b.matchPercentage - a.matchPercentage;
    });
  }, [isComplete, allModelFeatures, models, answers]);

  // CRITICAL: Always store the feature.id, never the feature_value
  const handleSelect = (featureId: string) => {
    if (currentCategory) {
      setAnswers({ ...answers, [currentCategory]: featureId });
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCurrentStep(totalSteps);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setAnswers({});
  };

  if (featuresLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="container-wide max-w-2xl">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-semibold mb-4">
              Identify by Features
            </h1>
            <p className="text-muted-foreground">
              Answer a few questions about your guitar's features to help narrow down the model.
            </p>
          </div>

          {!isComplete ? (
            <>
              {/* Progress */}
              <div className="mb-8">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Step {currentStep + 1} of {totalSteps}</span>
                  <span>{Math.round(progress)}% complete</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Question */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2">
                  {currentCategory ? CATEGORY_LABELS[currentCategory] || `Select ${currentCategory}` : "Loading..."}
                </h2>
                <p className="text-muted-foreground">
                  {currentCategory ? CATEGORY_DESCRIPTIONS[currentCategory] || "" : ""}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-3 mb-8">
                {currentCategoryFeatures.map((feature: any) => (
                  <button
                    key={feature.id}
                    onClick={() => handleSelect(feature.id)}
                    className={`w-full p-4 text-left border rounded-lg transition-all ${
                      currentAnswer === feature.id
                        ? "border-foreground bg-secondary/50"
                        : "border-border hover:border-foreground/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{feature.feature_name}</div>
                        {feature.description && (
                          <div className="text-sm text-muted-foreground mt-0.5">
                            {feature.description}
                          </div>
                        )}
                        {(feature.era_start || feature.era_end) && (
                          <div className="text-xs text-muted-foreground/70 mt-1">
                            Era: {feature.era_start || "?"} - {feature.era_end || "present"}
                          </div>
                        )}
                      </div>
                      {currentAnswer === feature.id && (
                        <Check className="h-5 w-5 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!currentAnswer}
                >
                  {currentStep === totalSteps - 1 ? "See Results" : "Next"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            /* Results */
            <div className="opacity-0 animate-fade-in">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-confidence-high/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="h-8 w-8 text-confidence-high" />
                </div>
                <h2 className="text-2xl font-semibold mb-2">Analysis Complete</h2>
                <p className="text-muted-foreground">
                  {matchingModels.length > 0
                    ? `Found ${matchingModels.length} potential match${matchingModels.length === 1 ? "" : "es"} based on your selections.`
                    : "No matching models found based on your selections."}
                </p>
              </div>

              {/* Matching Models */}
              {matchingModels.length > 0 ? (
                <div className="space-y-4 mb-8">
                  {matchingModels.slice(0, 5).map((match, index) => (
                    <Link
                      key={match.modelId}
                      to={`/encyclopedia/${match.modelId}`}
                      className={`block p-4 border rounded-lg hover:border-foreground/30 transition-all ${
                        index === 0 && match.requiredMissing === 0 ? "border-confidence-high border-2" : "border-border"
                      }`}
                    >
                      <div className="flex gap-4">
                        {match.photoUrl ? (
                          <img
                            src={match.photoUrl}
                            alt={match.modelName}
                            className="w-20 h-20 object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-secondary rounded-md flex items-center justify-center">
                            <Image className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{match.modelName}</h3>
                              <p className="text-sm text-muted-foreground">
                                {match.country} • {match.productionYears}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {match.matchedRequired}/{match.totalRequired} required • {match.matchedFeatures} total matches
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              {match.requiredMissing === 0 ? (
                                <Badge className="bg-confidence-high text-white">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  High Confidence
                                </Badge>
                              ) : (
                                <Badge variant="secondary">
                                  Possible Match
                                </Badge>
                              )}
                              <Badge variant="outline">
                                {match.matchPercentage}%
                              </Badge>
                            </div>
                          </div>
                          {match.requiredMissing > 0 && (
                            <div className="flex items-center gap-1 text-xs text-destructive mt-2">
                              <AlertCircle className="h-3 w-3" />
                              Missing {match.requiredMissing} required feature{match.requiredMissing > 1 ? "s" : ""}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border border-border rounded-lg mb-8">
                  <p className="text-muted-foreground mb-4">
                    No models in our database match your selected features yet.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Try the Serial Lookup instead, or submit your guitar to help us build our database.
                  </p>
                </div>
              )}

              {/* Selected Features Summary */}
              <div className="text-left mb-8 p-6 border border-border rounded-lg">
                <h3 className="font-semibold mb-4">Your Selections</h3>
                <dl className="space-y-2 text-sm">
                  {orderedCategories.map((category) => {
                    const featureId = answers[category];
                    const feature = allModelFeatures?.find(
                      (mf: any) => mf.feature_id === featureId
                    )?.identifying_features;
                    
                    return (
                      <div key={category} className="flex justify-between">
                        <dt className="text-muted-foreground">{CATEGORY_LABELS[category]?.replace("?", "") || category}:</dt>
                        <dd className="font-medium">{feature?.feature_name || "Not answered"}</dd>
                      </div>
                    );
                  })}
                </dl>
              </div>

              <div className="flex flex-wrap gap-4 justify-center">
                <Button variant="outline" onClick={handleReset}>
                  Start Over
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/serial-lookup">Try Serial Lookup</Link>
                </Button>
                <Button asChild>
                  <Link 
                    to="/submit" 
                    state={{ 
                      fromIdentify: true, 
                      features: answers 
                    }}
                  >
                    Submit This Guitar
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Identify;
