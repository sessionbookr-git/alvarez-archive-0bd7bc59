import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useIdentifyingFeatures, useFeatureCategories } from "@/hooks/useIdentifyingFeatures";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";

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

const Identify = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const { data: categories, isLoading: categoriesLoading } = useFeatureCategories();
  const currentCategory = categories?.[currentStep];
  const { data: features, isLoading: featuresLoading } = useIdentifyingFeatures(currentCategory);

  const totalSteps = categories?.length || 0;
  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;
  const isComplete = currentStep >= totalSteps;

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
            <div className="text-center py-8 opacity-0 animate-fade-in">
              <div className="w-16 h-16 bg-confidence-high/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="h-8 w-8 text-confidence-high" />
              </div>
              <h2 className="text-2xl font-semibold mb-4">Analysis Complete</h2>
              <p className="text-muted-foreground mb-8">
                Based on your selections, here's what we found:
              </p>

              {/* Selected Features Summary */}
              <div className="text-left mb-8 p-6 border border-border rounded-lg">
                <h3 className="font-semibold mb-4">Your Guitar's Features</h3>
                <dl className="space-y-2 text-sm">
                  {Object.entries(answers).map(([category, value]) => (
                    <div key={category} className="flex justify-between">
                      <dt className="text-muted-foreground capitalize">{category.replace("_", " ")}:</dt>
                      <dd className="font-medium">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <p className="text-sm text-muted-foreground mb-6">
                This feature is being enhanced. For now, use the Serial Lookup for more accurate results, 
                or submit your guitar to help us build a better matching system.
              </p>

              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={handleReset}>
                  Start Over
                </Button>
                <Button asChild>
                  <Link to="/lookup">Try Serial Lookup</Link>
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
