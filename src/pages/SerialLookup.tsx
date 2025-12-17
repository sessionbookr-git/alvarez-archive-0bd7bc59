import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ConfidenceMeter from "@/components/ConfidenceMeter";
import { useSerialLookup } from "@/hooks/useSerialLookup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, X, ArrowRight, Loader2, Search, AlertCircle, Info, Calendar } from "lucide-react";

// Emperor Code reference chart
const EMPEROR_CODES = [
  { code: "45-63", era: "Showa", years: "1970-1988" },
  { code: "1-12", era: "Heisei", years: "1989-2000" },
  { code: "00-25", era: "Post-2000", years: "2000-2025" },
];

const SerialLookup = () => {
  const [searchParams] = useSearchParams();
  const initialSerial = searchParams.get("serial") || "";
  
  const [serial, setSerial] = useState(initialSerial);
  const [neckBlock, setNeckBlock] = useState("");
  const [showEmperorChart, setShowEmperorChart] = useState(false);
  
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

          {/* Serial Format Help */}
          <div className="max-w-xl mx-auto mb-8 p-4 bg-secondary/30 rounded-lg">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <Info className="h-4 w-4" /> Serial Number Formats
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li><strong>Yairi Series:</strong> 4-5 digit number (e.g., 51708)</li>
              <li><strong>Modern (E-prefix):</strong> E + year + month + sequence (e.g., E24113487 = Nov 2024)</li>
              <li><strong>2010s (CS-prefix):</strong> CS + year + month + sequence (e.g., CS12071753 = Jul 2012)</li>
              <li><strong>2000s (F/CD-prefix):</strong> F or CD + year digits + sequence</li>
              <li><strong>1990s (S-prefix):</strong> S + year digits + sequence (e.g., S99 = 1999)</li>
              <li><strong>Vintage (1970s-80s):</strong> May require neck block number for dating</li>
            </ul>
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
                    placeholder="e.g., E24113487 or 51708"
                    value={serial}
                    onChange={(e) => { setSerial(e.target.value); reset(); }}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="neckBlock" className="flex items-center justify-between">
                  <span>
                    Neck Block Number <span className="text-muted-foreground font-normal">(for vintage guitars)</span>
                  </span>
                  <button 
                    type="button"
                    onClick={() => setShowEmperorChart(!showEmperorChart)}
                    className="text-xs text-primary hover:underline"
                  >
                    {showEmperorChart ? "Hide" : "View"} Emperor Code Chart
                  </button>
                </Label>
                <Input
                  id="neckBlock"
                  type="text"
                  placeholder="Found stamped inside the soundhole (e.g., 56)"
                  value={neckBlock}
                  onChange={(e) => setNeckBlock(e.target.value)}
                  className="mt-1.5"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Look inside the guitar near the neck joint for a stamped number
                </p>
              </div>

              {/* Emperor Code Chart */}
              {showEmperorChart && (
                <div className="p-4 bg-secondary/50 rounded-lg border border-border">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Emperor Date Code System
                  </h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    Japanese guitars use the Emperor calendar system for dating. The number stamped on the neck block indicates the year of manufacture.
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Showa Era</div>
                      <div className="text-muted-foreground text-xs">
                        45=1970, 50=1975, 55=1980, 60=1985, 63=1988
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Heisei Era</div>
                      <div className="text-muted-foreground text-xs">
                        1=1989, 5=1993, 9=1997, 12=2000
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Post-2000</div>
                      <div className="text-muted-foreground text-xs">
                        Last 2 digits = year (e.g., 05=2005, 15=2015)
                      </div>
                    </div>
                  </div>
                </div>
              )}

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
              
              {/* Serial Format Detected */}
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">
                      {result.serialFormat === "modern" && `Modern Alvarez Serial${result.prefix ? ` (${result.prefix}-prefix)` : ''}`}
                      {result.serialFormat === "yairi" && "Alvarez-Yairi Serial"}
                      {result.serialFormat === "legacy" && "Vintage Alvarez Serial"}
                      {result.serialFormat === "nine_digit" && "9-Digit Format Serial"}
                      {result.serialFormat === "unknown" && "Unknown Format"}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">{result.parsedNotes}</p>
                    {result.neckBlockNotes && (
                      <p className="text-sm text-primary mt-2 font-medium">
                        Neck Block: {result.neckBlockNotes}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Emperor Code Prompt (if needed and no neck block provided) */}
              {result.needsEmperorCode && !result.neckBlockYear && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <h3 className="font-medium text-amber-700 dark:text-amber-400 mb-2">
                    📅 Check Your Neck Block Number
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    For accurate dating of vintage Japanese guitars, look inside the soundhole near the neck joint for a stamped number. Enter it above to get the exact year.
                  </p>
                  <button 
                    onClick={() => setShowEmperorChart(true)}
                    className="text-sm text-primary hover:underline"
                  >
                    View Emperor Code Chart →
                  </button>
                </div>
              )}

              {/* Confidence */}
              <div className="p-6 border border-border rounded-lg">
                <h2 className="text-lg font-semibold mb-4">Match Confidence</h2>
                <ConfidenceMeter level={result.confidence} percentage={result.confidencePercent} />
                <p className="text-sm text-muted-foreground mt-3">
                  {result.neckBlockYear 
                    ? "Based on Emperor date code from neck block" 
                    : result.serialFormat === "modern"
                    ? "Based on modern serial number format"
                    : "Based on serial number patterns and database entries"}
                </p>
              </div>

              {/* Details */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="p-6 border border-border rounded-lg">
                  <h3 className="text-sm text-muted-foreground mb-2">Estimated Year</h3>
                  <p className="text-2xl font-semibold">{result.yearRange}</p>
                </div>
                {result.estimatedMonth && (
                  <div className="p-6 border border-border rounded-lg">
                    <h3 className="text-sm text-muted-foreground mb-2">Estimated Month</h3>
                    <p className="text-2xl font-semibold">
                      {new Date(2000, result.estimatedMonth - 1).toLocaleString('default', { month: 'long' })}
                    </p>
                  </div>
                )}
                <div className="p-6 border border-border rounded-lg">
                  <h3 className="text-sm text-muted-foreground mb-2">Country of Manufacture</h3>
                  <p className="text-2xl font-semibold">{result.country}</p>
                  {result.isYairi && (
                    <p className="text-xs text-primary mt-1">Handcrafted at K. Yairi factory</p>
                  )}
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
