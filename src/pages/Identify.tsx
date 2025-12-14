import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

const steps = [
  {
    id: "tuners",
    title: "What type of tuners does your guitar have?",
    description: "Look at the tuning machines on the headstock",
    options: [
      { id: "open", label: "Open-back tuners", description: "You can see the gears from behind" },
      { id: "closed", label: "Closed/sealed tuners", description: "Enclosed metal housings" },
      { id: "unsure", label: "I'm not sure", description: "" },
    ],
  },
  {
    id: "trussrod",
    title: "Where is the truss rod adjustment?",
    description: "The truss rod allows neck adjustments",
    options: [
      { id: "headstock", label: "At the headstock", description: "Covered by a small plate or visible at the nut" },
      { id: "soundhole", label: "Inside the soundhole", description: "Accessed through the guitar body" },
      { id: "unsure", label: "I can't find it", description: "" },
    ],
  },
  {
    id: "body",
    title: "What body shape is your guitar?",
    description: "Select the closest match",
    options: [
      { id: "dreadnought", label: "Dreadnought", description: "Large, square shoulders" },
      { id: "folk", label: "Folk/Concert", description: "Smaller, rounded shoulders" },
      { id: "jumbo", label: "Jumbo", description: "Extra large, rounded" },
      { id: "classical", label: "Classical", description: "Nylon strings, wide neck" },
    ],
  },
  {
    id: "label",
    title: "What does the interior label look like?",
    description: "Check inside the soundhole for a paper label",
    options: [
      { id: "gold", label: "Gold/tan label", description: "Typically seen on Japanese-made guitars" },
      { id: "white", label: "White label", description: "Often seen on Korean production" },
      { id: "none", label: "No label visible", description: "May have worn off or never had one" },
      { id: "unsure", label: "I'm not sure", description: "" },
    ],
  },
];

const Identify = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
  const isComplete = currentStep >= steps.length;

  const handleSelect = (optionId: string) => {
    setAnswers({ ...answers, [step.id]: optionId });
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCurrentStep(steps.length); // Mark as complete
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
                  <span>Step {currentStep + 1} of {steps.length}</span>
                  <span>{Math.round(progress)}% complete</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Question */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2">{step.title}</h2>
                <p className="text-muted-foreground">{step.description}</p>
              </div>

              {/* Options */}
              <div className="space-y-3 mb-8">
                {step.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleSelect(option.id)}
                    className={`w-full p-4 text-left border rounded-lg transition-all ${
                      answers[step.id] === option.id
                        ? "border-foreground bg-secondary/50"
                        : "border-border hover:border-foreground/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{option.label}</div>
                        {option.description && (
                          <div className="text-sm text-muted-foreground mt-0.5">
                            {option.description}
                          </div>
                        )}
                      </div>
                      {answers[step.id] === option.id && (
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
                  disabled={!answers[step.id]}
                >
                  {currentStep === steps.length - 1 ? "See Results" : "Next"}
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
                Based on your answers, here are the most likely matches:
              </p>

              {/* Mock Results */}
              <div className="space-y-4 text-left mb-8">
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">5014 Dreadnought</h3>
                      <p className="text-sm text-muted-foreground">1974-1982 • Japan</p>
                    </div>
                    <span className="text-sm font-medium text-confidence-high">85% match</span>
                  </div>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">5024 Folk</h3>
                      <p className="text-sm text-muted-foreground">1975-1983 • Japan</p>
                    </div>
                    <span className="text-sm font-medium text-confidence-medium">62% match</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={handleReset}>
                  Start Over
                </Button>
                <Button>
                  View Model Details
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
