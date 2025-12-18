import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useIdentifyingFeatures, useFeatureCategories } from "@/hooks/useIdentifyingFeatures";
import { useAllModelFeatures } from "@/hooks/useModelFeatures";
import { useModels } from "@/hooks/useModels";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check, Loader2, Image } from "lucide-react";

const categoryLabels: Record<string, string> = {
  tuner: "What type of tuners does your guitar have?",
  truss_rod: "Where is the truss rod adjustment?",
  body_shape: "What body shape is your guitar?",
  label: "What does the interior label look like?",
  bridge: "What type of bridge does your guitar have?",
};

const categoryDescriptions: Record<string, string> = {
  tuner: "Look at the tuning machines on the headstock",
  truss_rod: "The truss rod allows neck adjustments",
  body_shape: "Select the closest match to your guitar's body",
  label: "Check inside the soundhole for a paper label",
  bridge: "Look at the bridge where the strings attach",
};

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
}

const Identify = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const { data: categories, isLoading: categoriesLoading } = useFeatureCategories();
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

    // Get the feature IDs that match user's selections
    const selectedFeatureIds = new Set<string>();
    
    // For each answer, find the matching feature ID
    Object.entries(answers).forEach(([category, value]) => {
      const feature = allModelFeatures.find(
        (mf) => 
          mf.identifying_features.feature_category === category &&
          (mf.identifying_features.feature_value === value || mf.identifying_features.id === value)
      );
      if (feature) {
        selectedFeatureIds.add(feature.feature_id);
      }
    });

    // Group model_features by model
    const modelFeaturesMap = new Map<string, typeof allModelFeatures>();
    allModelFeatures.forEach((mf) => {
      const existing = modelFeaturesMap.get(mf.model_id) || [];
      existing.push(mf);
      modelFeaturesMap.set(mf.model_id, existing);
    });

    // Calculate match scores for each model
    const results: ModelMatch[] = [];

    modelFeaturesMap.forEach((modelFeatures, modelId) => {
      const model = models.find((m) => m.id === modelId);
      if (!model) return;

      const totalFeatures = modelFeatures.length;
      let matchedFeatures = 0;
      let requiredMissing = 0;

      modelFeatures.forEach((mf) => {
        const featureValue = mf.identifying_features.feature_value || mf.identifying_features.id;
        const featureCategory = mf.identifying_features.feature_category;
        
        // Check if user selected this feature (by value or ID)
        const userAnswer = answers[featureCategory];
        if (userAnswer === featureValue || userAnswer === mf.feature_id) {
          matchedFeatures++;
        } else if (mf.is_required) {
          requiredMissing++;
        }
      });

      if (totalFeatures > 0) {
        const matchPercentage = Math.round((matchedFeatures / totalFeatures) * 100);
        
        results.push({
          modelId,
          modelName: model.model_name,
          photoUrl: model.photo_url || null,
          country: model.country_of_manufacture,
          productionYears: model.production_start_year
            ? `${model.production_start_year}${model.production_end_year ? `-${model.production_end_year}` : "-present"}`
            : "Unknown",
          matchedFeatures,
          totalFeatures,
          matchPercentage,
          requiredMissing,
        });
      }
    });

    // Sort by match percentage (descending), then by required missing (ascending)
    return results
      .filter((r) => r.matchedFeatures > 0)
      .sort((a, b) => {
        if (a.requiredMissing !== b.requiredMissing) {
          return a.requiredMissing - b.requiredMissing;
        }
        return b.matchPercentage - a.matchPercentage;
      });
  }, [isComplete, allModelFeatures, models, answers]);

  const handleSelect = (featureValue: string) => {
    if (currentCategory) {
      setAnswers({ ...answers, [currentCategory]: featureValue });
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
                      onClick={() => handleSelect(feature.feature_value || feature.id)}
                      className={`w-full p-4 text-left border rounded-lg transition-all ${
                        answers[currentCategory || ""] === (feature.feature_value || feature.id)
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
                        {answers[currentCategory || ""] === (feature.feature_value || feature.id) && (
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
                    : "No matching models found based on your selections."}
                </p>
              </div>

              {/* Matching Models */}
              {matchingModels.length > 0 ? (
                <div className="space-y-4 mb-8">
                  {matchingModels.slice(0, 5).map((match) => (
                    <Link
                      key={match.modelId}
                      to={`/encyclopedia/${encodeURIComponent(match.modelName)}`}
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
                          {match.requiredMissing > 0 && (
                            <p className="text-xs text-destructive mt-2">
                              Missing {match.requiredMissing} required feature{match.requiredMissing > 1 ? "s" : ""}
                            </p>
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
                  {Object.entries(answers).map(([category, value]) => (
                    <div key={category} className="flex justify-between">
                      <dt className="text-muted-foreground capitalize">{category.replace("_", " ")}:</dt>
                      <dd className="font-medium">{value}</dd>
                    </div>
                  ))}
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
