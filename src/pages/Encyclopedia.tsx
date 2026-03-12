import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useModels, INSTRUMENT_TYPES, type InstrumentType } from "@/hooks/useModels";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Edit, Guitar } from "lucide-react";
import EditModelDialog from "@/components/EditModelDialog";

const decades = ["All", "1970s", "1980s", "1990s", "2000s", "2010s", "2020s"];
const countries = ["All", "Japan", "Korea", "China", "USA", "Indonesia"];

const instrumentIcons: Record<string, string> = {
  Acoustic: "🎸",
  Electric: "⚡",
  Classical: "🎵",
  Ukulele: "🪕",
  Mandolin: "🎻",
  Bass: "🎸",
};

const Encyclopedia = () => {
  const [search, setSearch] = useState("");
  const [selectedDecade, setSelectedDecade] = useState("All");
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [selectedType, setSelectedType] = useState("Acoustic");
  const [editingModel, setEditingModel] = useState<any>(null);
  const { isAdmin } = useAuth();

  const { data: models, isLoading, error } = useModels({
    decade: selectedDecade,
    country: selectedCountry,
    search: search,
    instrumentType: selectedType,
  });

  // Group models by instrument type for sectioned view
  const groupedModels = useMemo(() => {
    if (!models || selectedType !== "All") return null;
    const groups: Record<string, typeof models> = {};
    for (const model of models) {
      const type = (model as any).instrument_type || "Acoustic";
      if (!groups[type]) groups[type] = [];
      groups[type].push(model);
    }
    // Sort by INSTRUMENT_TYPES order
    const ordered: [string, typeof models][] = [];
    for (const t of INSTRUMENT_TYPES) {
      if (groups[t]?.length) ordered.push([t, groups[t]]);
    }
    return ordered;
  }, [models, selectedType]);

  const renderModelCard = (model: any, index: number) => (
    <div
      key={model.id}
      className="group relative p-5 border border-border rounded-lg hover:border-foreground/20 transition-all duration-300 opacity-0 animate-fade-in"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {isAdmin && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setEditingModel(model);
          }}
          className="absolute top-2 right-2 z-10 p-2 bg-background/90 border border-border rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent"
          title="Edit model"
        >
          <Edit className="h-4 w-4" />
        </button>
      )}

      <Link to={`/encyclopedia/${model.id}`}>
        <div className="aspect-[3/4] bg-secondary rounded-md mb-4 flex items-center justify-center overflow-hidden">
          {model.photo_url ? (
            <img
              src={model.photo_url}
              alt={model.model_name}
              className="w-full h-full object-contain"
            />
          ) : (
            <span className="text-xs text-muted-foreground">No Photo</span>
          )}
        </div>

        <h3 className="font-semibold mb-1 group-hover:text-accent transition-colors">
          {model.model_name}
        </h3>
        <p className="text-sm text-muted-foreground mb-2">
          {model.production_start_year && model.production_end_year
            ? `${model.production_start_year}-${model.production_end_year}`
            : model.production_start_year
              ? `${model.production_start_year}-present`
              : "Year unknown"}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{model.country_of_manufacture || "Unknown"}</span>
          <span>{model.series || ""}</span>
        </div>
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="container-wide">
          {/* Page Header */}
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-semibold mb-4">
              Model Encyclopedia
            </h1>
            <p className="text-muted-foreground">
              Browse our database of Alvarez instruments — acoustics, electrics, ukuleles, mandolins and more.
            </p>
            {isAdmin && (
              <p className="text-xs text-accent mt-2">Admin mode: Click edit icon on any model to modify</p>
            )}
          </div>

          {/* Filters */}
          <div className="mb-8 space-y-4">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search models..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6">
              {/* Instrument Type */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Type:</span>
                <div className="flex gap-1 flex-wrap">
                  <Button
                    variant={selectedType === "All" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType("All")}
                    className="text-xs"
                  >
                    All
                  </Button>
                  {INSTRUMENT_TYPES.map((type) => (
                    <Button
                      key={type}
                      variant={selectedType === type ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedType(type)}
                      className="text-xs"
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Decade */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Decade:</span>
                <div className="flex gap-1 flex-wrap">
                  {decades.map((decade) => (
                    <Button
                      key={decade}
                      variant={selectedDecade === decade ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedDecade(decade)}
                      className="text-xs"
                    >
                      {decade}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Country */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Country:</span>
                <div className="flex gap-1">
                  {countries.map((country) => (
                    <Button
                      key={country}
                      variant={selectedCountry === country ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCountry(country)}
                      className="text-xs"
                    >
                      {country}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Loading models...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-16">
              <p className="text-destructive">Failed to load models. Please try again.</p>
            </div>
          )}

          {/* Results */}
          {!isLoading && !error && (
            <>
              <p className="text-sm text-muted-foreground mb-6 text-center">
                Showing {models?.length || 0} models
              </p>

              {models && models.length > 0 ? (
                <>
                  {/* Grouped view when showing all types */}
                  {groupedModels ? (
                    <div className="space-y-12">
                      {groupedModels.map(([type, typeModels]) => (
                        <section key={type}>
                          <div className="flex items-center gap-3 mb-6 border-b border-border pb-3">
                            <span className="text-2xl">{instrumentIcons[type]}</span>
                            <h2 className="text-xl font-semibold">{type}</h2>
                            <span className="text-sm text-muted-foreground">({typeModels.length})</span>
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {typeModels.map((model, index) => renderModelCard(model, index))}
                          </div>
                        </section>
                      ))}
                    </div>
                  ) : (
                    /* Flat grid when filtering by specific type */
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {models.map((model, index) => renderModelCard(model, index))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16">
                  <p className="text-muted-foreground mb-4">No models found matching your criteria</p>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSearch("");
                      setSelectedDecade("All");
                      setSelectedCountry("All");
                      setSelectedType("All");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />

      {editingModel && (
        <EditModelDialog
          open={!!editingModel}
          onOpenChange={(open) => !open && setEditingModel(null)}
          model={editingModel}
        />
      )}
    </div>
  );
};

export default Encyclopedia;
