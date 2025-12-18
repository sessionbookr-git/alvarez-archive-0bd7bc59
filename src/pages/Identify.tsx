import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Plus, ArrowLeft, ArrowRight, Check, Loader2, Image } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useIdentifyingFeatures, useFeatureCategories } from "@/hooks/useIdentifyingFeatures";
import { useAllModelFeatures } from "@/hooks/useModelFeatures";
import { useModels } from "@/hooks/useModels";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const categoryLabels: Record<string, string> = {
  body_shape: "What body shape is your guitar?",
  construction: "What type of construction is your guitar?",
  bridge_material: "What material is the bridge made of?",
  fingerboard: "What is the fingerboard material?",
  electronics: "Does your guitar have electronics?",
  tuner: "What type of tuners does your guitar have?",
  label: "What does the interior label look like?",
  truss_rod: "Where is the truss rod adjustment?",
  bridge: "What type of bridge does your guitar have?",
};

const categoryDescriptions: Record<string, string> = {
  body_shape: "Select the closest match to your guitar's body",
  construction: "Is it all solid wood, laminate, or a combination?",
  bridge_material: "Look at the bridge where the strings attach",
  fingerboard: "The fingerboard is where you press the strings",
  electronics: "Check if your guitar has a pickup or preamp",
  tuner: "Look at the tuning machines on the headstock",
  label: "Check inside the soundhole for a paper label",
  truss_rod: "The truss rod allows neck adjustments",
  bridge: "Look at the bridge where the strings attach",
};

// Define optimal quiz flow order
const CATEGORY_ORDER = [
  'body_shape',
  'construction',
  'bridge_material',
  'fingerboard',
  'electronics',
  'tuner',
  'label',
  'truss_rod',
  'bridge',
];

interface ModelMatch {
  modelId: string;
  modelName: string;
  photoUrl: string | null;
  country: string | null;
  productionYears: string;
  matchedFeatures: number;
  totalFeatures: number;
  matchPercentage: number;
  requiredMissing: number;
  matchedRequired: number;
  totalRequired: number;
}

const Identify = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const { data: allCategories, isLoading: categoriesLoading } = useFeatureCategories();
  
  // Order categories according to CATEGORY_ORDER
  const categories = useMemo(() => {
    if (!allCategories) return [];
    return CATEGORY_ORDER.filter(cat => allCategories.includes(cat));
  }, [allCategories]);

  const currentCategory = categories?.[currentStep];
  const { data: features, isLoading: featuresLoading } = useIdentifyingFeatures(currentCategory);
  const { data: allModelFeatures } = useAllModelFeatures();
  const { data: models } = useModels();

  const totalSteps = categories?.length || 0;
  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;
  const isComplete = currentStep >= totalSteps;

  // Calculate matching models based on selected features
  const matchingModels = useMemo(() => {
    if (!isComplete || !allModelFeatures || !models) return [];

    // 1. Build set of selected feature IDs (answers now store IDs only)
    const selectedFeatureIds = new Set<string>(Object.values(answers));

    // 2. Group model_features by model
    const modelFeaturesMap = new Map<string, typeof allModelFeatures>();
    allModelFeatures.forEach((mf) => {
      const existing = modelFeaturesMap.get(mf.model_id) || [];
      existing.push(mf);
      modelFeaturesMap.set(mf.model_id, existing);
    });

    // 3. Calculate match scores
    const results: ModelMatch[] = [];

    modelFeaturesMap.forEach((modelFeatures, modelId) => {
      const model = models.find((m) => m.id === modelId);
      if (!model) return;

      const requiredFeatures = modelFeatures.filter(mf => mf.is_required);
      const optionalFeatures = modelFeatures.filter(mf => !mf.is_required);
      
      let matchedRequired = 0;
      let requiredMissing = 0;
      let matchedOptional = 0;

      // Check required features
      requiredFeatures.forEach((mf) => {
        if (selectedFeatureIds.has(mf.feature_id)) {
          matchedRequired++;
        } else {
          requiredMissing++;
        }
      });

      // Only consider models where ALL required features match
      if (requiredMissing > 0) return;

      // Check optional features for tiebreaking
      optionalFeatures.forEach((mf) => {
        if (selectedFeatureIds.has(mf.feature_id)) {
          matchedOptional++;
        }
      });

      const totalMatched = matchedRequired + matchedOptional;
      const totalFeatures = modelFeatures.length;
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
        totalFeatures,
        matchPercentage,
        requiredMissing: 0, // Always 0 since we filtered above
        matchedRequired,
        totalRequired: requiredFeatures.length,
      });
    });

    // 4. Sort by confidence
    return results.sort((a, b) => {
      // More required features matched = higher confidence
      if (a.matchedRequired !== b.matchedRequired) {
        return b.matchedRequired - a.matchedRequired;
      }
      // Then by total matches (includes optionals)
      if (a.matchedFeatures !== b.matchedFeatures) {
        return b.matchedFeatures - a.matchedFeatures;
      }
      // Finally by percentage
      return b.matchPercentage - a.matchPercentage;
    });
  }, [isComplete, allModelFeatures, models, answers]);

  // Fix 1: Always use feature.id for answer storage
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

  if (categoriesLoading) {
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
                  {currentCategory ? categoryLabels[currentCategory] || `Select ${currentCategory}` : "Loading..."}
                </h2>
                <p className="text-muted-foreground">
                  {currentCategory ? categoryDescriptions[currentCategory] || "" : ""}
                </p>
              </div>

              {/* Options */}
              {featuresLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-3 mb-8">
                  {features?.map((feature) => (
                    <button
                      key={feature.id}
                      onClick={() => handleSelect(feature.id)}
                      className={`w-full p-4 text-left border rounded-lg transition-all ${
                        answers[currentCategory || ""] === feature.id
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
                        {answers[currentCategory || ""] === feature.id && (
                          <Check className="h-5 w-5 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

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
                  disabled={!currentCategory || !answers[currentCategory]}
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
                    : "Your guitar isn't in our archive yet!"}
                </p>
              </div>

              {/* Matching Models */}
              {matchingModels.length > 0 ? (
                <div className="space-y-4 mb-8">
                  {matchingModels.slice(0, 5).map((match) => (
                    <Link
                      key={match.modelId}
                      to={`/encyclopedia/${match.modelId}`}
                      className="block p-4 border border-border rounded-lg hover:border-foreground/30 transition-all"
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
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <span>{match.matchedRequired}/{match.totalRequired} required features</span>
                                {match.matchedFeatures > match.matchedRequired && (
                                  <span>• +{match.matchedFeatures - match.matchedRequired} optional</span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-lg font-semibold ${
                                match.matchPercentage >= 80 ? "text-confidence-high" :
                                match.matchPercentage >= 50 ? "text-confidence-medium" :
                                "text-confidence-low"
                              }`}>
                                {match.matchPercentage}%
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {match.matchedFeatures}/{match.totalFeatures} features
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border border-border rounded-lg mb-8">
                  <p className="text-muted-foreground mb-4">
                    Help us build the most comprehensive Alvarez database by being the first to add this model.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Try the Serial Lookup instead, or submit your guitar to contribute.
                  </p>
                </div>
              )}

              {/* Selected Features Summary */}
              <div className="text-left mb-8 p-6 border border-border rounded-lg">
                <h3 className="font-semibold mb-4">Your Selections</h3>
                <dl className="space-y-2 text-sm">
                  {Object.entries(answers).map(([category, featureId]) => {
                    // Look up the feature name from the ID
                    const feature = allModelFeatures?.find(mf => mf.feature_id === featureId)?.identifying_features;
                    const displayValue = feature?.feature_name || featureId;
                    return (
                      <div key={category} className="flex justify-between">
                        <dt className="text-muted-foreground capitalize">{category.replace("_", " ")}:</dt>
                        <dd className="font-medium">{displayValue}</dd>
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
                {matchingModels.length === 0 ? (
                  <Button asChild>
                    <Link 
                      to="/submit" 
                      state={{ 
                        fromIdentify: true, 
                        features: answers 
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Be the First to Add This Model
                    </Link>
                  </Button>
                ) : (
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
                )}
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
