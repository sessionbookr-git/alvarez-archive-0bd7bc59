import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SerialSearch from "@/components/SerialSearch";
import ConfidenceMeter from "@/components/ConfidenceMeter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, X, HelpCircle, ArrowRight } from "lucide-react";

// Mock lookup data
const mockLookup = (serial: string) => {
  if (!serial) return null;
  
  // Simulate a match for demo purposes
  return {
    confidence: "high" as const,
    confidencePercent: 87,
    yearRange: "1978-1982",
    models: ["5014 Dreadnought", "5024 Folk"],
    country: "Japan",
    features: [
      { name: "Open-back tuners", matched: true },
      { name: "Truss rod at headstock", matched: true },
      { name: "Three-piece back", matched: false },
      { name: "Solid spruce top", matched: true },
    ],
  };
};

const SerialLookup = () => {
  const [searchParams] = useSearchParams();
  const initialSerial = searchParams.get("serial") || "";
  
  const [serial, setSerial] = useState(initialSerial);
  const [neckBlock, setNeckBlock] = useState("");
  const [result, setResult] = useState(initialSerial ? mockLookup(initialSerial) : null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(mockLookup(serial));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="container-wide">
          {/* Page Header */}
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-semibold mb-4">
              Serial Number Lookup
            </h1>
            <p className="text-muted-foreground">
              Enter your guitar's serial number to identify its year, model, and manufacturing details.
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-16">
            <div className="space-y-4">
              <div>
                <Label htmlFor="serial">Serial Number</Label>
                <Input
                  id="serial"
                  type="text"
                  placeholder="e.g., 70523"
                  value={serial}
                  onChange={(e) => setSerial(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="neckBlock">
                  Neck Block Number <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Input
                  id="neckBlock"
                  type="text"
                  placeholder="Found inside the soundhole"
                  value={neckBlock}
                  onChange={(e) => setNeckBlock(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <Button type="submit" className="w-full" size="lg">
                Look Up Guitar
              </Button>
            </div>
          </form>

          {/* Results */}
          {result && (
            <div className="max-w-3xl mx-auto space-y-8 opacity-0 animate-fade-in">
              {/* Confidence */}
              <div className="p-6 border border-border rounded-lg">
                <h2 className="text-lg font-semibold mb-4">Match Confidence</h2>
                <ConfidenceMeter level={result.confidence} percentage={result.confidencePercent} />
                <p className="text-sm text-muted-foreground mt-3">
                  Based on serial number patterns and verified database entries
                </p>
              </div>

              {/* Details */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="p-6 border border-border rounded-lg">
                  <h3 className="text-sm text-muted-foreground mb-2">Estimated Year</h3>
                  <p className="text-2xl font-semibold">{result.yearRange}</p>
                </div>
                <div className="p-6 border border-border rounded-lg">
                  <h3 className="text-sm text-muted-foreground mb-2">Country of Manufacture</h3>
                  <p className="text-2xl font-semibold">{result.country}</p>
                </div>
              </div>

              {/* Likely Models */}
              <div className="p-6 border border-border rounded-lg">
                <h2 className="text-lg font-semibold mb-4">Likely Model(s)</h2>
                <div className="space-y-3">
                  {result.models.map((model) => (
                    <div key={model} className="flex items-center justify-between p-3 bg-secondary/50 rounded-md">
                      <span className="font-medium">{model}</span>
                      <Button variant="ghost" size="sm">
                        View Details <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feature Checklist */}
              <div className="p-6 border border-border rounded-lg">
                <h2 className="text-lg font-semibold mb-4">Identifying Features</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Check these features against your guitar to confirm the match
                </p>
                <div className="space-y-2">
                  {result.features.map((feature) => (
                    <div 
                      key={feature.name} 
                      className="flex items-center gap-3 p-3 bg-secondary/30 rounded-md"
                    >
                      {feature.matched ? (
                        <Check className="h-5 w-5 text-confidence-high flex-shrink-0" />
                      ) : (
                        <HelpCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className={feature.matched ? "" : "text-muted-foreground"}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feedback */}
              <div className="p-6 bg-secondary/30 rounded-lg text-center">
                <h3 className="font-semibold mb-2">Does this match your guitar?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your feedback helps improve our database accuracy
                </p>
                <div className="flex justify-center gap-3">
                  <Button variant="outline" className="gap-2">
                    <Check className="h-4 w-4" /> Yes, it matches
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <X className="h-4 w-4" /> Not quite right
                  </Button>
                </div>
              </div>

              {/* CTA */}
              <div className="text-center p-8 border border-dashed border-border rounded-lg">
                <h3 className="font-semibold mb-2">Can't find your guitar?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Help us expand our database by submitting your guitar's details
                </p>
                <Button variant="default">
                  Submit Your Guitar
                </Button>
              </div>
            </div>
          )}

          {/* No result yet */}
          {!result && !initialSerial && (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-medium mb-2">Enter a serial number above</h3>
                <p className="text-muted-foreground text-sm">
                  The serial number is typically found on the back of the headstock or on a label inside the soundhole
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SerialLookup;
