import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ConfidenceMeter from "@/components/ConfidenceMeter";
import { useSerialLookup } from "@/hooks/useSerialLookup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, X, HelpCircle, ArrowRight, Loader2, Search, AlertCircle } from "lucide-react";

const SerialLookup = () => {
  const [searchParams] = useSearchParams();
  const initialSerial = searchParams.get("serial") || "";
  
  const [serial, setSerial] = useState(initialSerial);
  const [neckBlock, setNeckBlock] = useState("");
  
  const { lookup, loading, error, result, reset } = useSerialLookup();

  useEffect(() => {
    if (initialSerial) {
      lookup(initialSerial);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    lookup(serial, neckBlock);
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
                <div className="relative mt-1.5">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="serial"
                    type="text"
                    placeholder="e.g., 45123, 78456"
                    value={serial}
                    onChange={(e) => { setSerial(e.target.value); reset(); }}
                    className="pl-10"
                  />
                </div>
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
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching Database...
                  </>
                ) : (
                  "Look Up Guitar"
                )}
              </Button>
            </div>
          </form>

          {/* Error State */}
          {error && (
            <div className="max-w-3xl mx-auto mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

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
              {result.models.length > 0 ? (
                <div className="p-6 border border-border rounded-lg">
                  <h2 className="text-lg font-semibold mb-4">Likely Model(s)</h2>
                  <div className="space-y-3">
                    {result.models.map((model) => (
                      <div key={model.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-md">
                        <div>
                          <span className="font-medium">{model.name}</span>
                          {model.series && (
                            <span className="text-sm text-muted-foreground ml-2">({model.series})</span>
                          )}
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/encyclopedia/${model.id}`}>
                            View Details <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-6 border border-border rounded-lg bg-secondary/30">
                  <h2 className="text-lg font-semibold mb-2">No Model Match Found</h2>
                  <p className="text-muted-foreground">
                    We don't have verified data for this serial number pattern yet. 
                    Consider submitting your guitar to help us expand the database.
                  </p>
                </div>
              )}

              {/* Pattern Notes */}
              {result.patterns.length > 0 && result.patterns[0].confidence_notes && (
                <div className="p-6 border border-border rounded-lg">
                  <h2 className="text-lg font-semibold mb-4">Pattern Notes</h2>
                  <p className="text-muted-foreground">
                    {result.patterns[0].confidence_notes}
                  </p>
                </div>
              )}

              {/* Similar Guitars */}
              {result.similarGuitars.length > 0 && (
                <div className="p-6 border border-border rounded-lg">
                  <h2 className="text-lg font-semibold mb-4">Similar Guitars in Database</h2>
                  <div className="space-y-2">
                    {result.similarGuitars.map((guitar) => (
                      <div key={guitar.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-md">
                        <div>
                          <span className="font-mono text-sm">{guitar.serial_number}</span>
                          {guitar.model_name && (
                            <span className="text-muted-foreground ml-3">{guitar.model_name}</span>
                          )}
                        </div>
                        {guitar.estimated_year && (
                          <span className="text-sm text-muted-foreground">{guitar.estimated_year}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                <h3 className="font-semibold mb-2">Help improve our database</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Submit your guitar's details and photos to help other collectors
                </p>
                <Button variant="default" asChild>
                  <Link to="/submit">Submit Your Guitar</Link>
                </Button>
              </div>
            </div>
          )}

          {/* No result yet */}
          {!result && !loading && !error && (
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
