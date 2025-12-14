import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useModels } from "@/hooks/useModels";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";

const decades = ["All", "1970s", "1980s", "1990s", "2000s"];
const countries = ["All", "Japan", "Korea", "China"];

const Encyclopedia = () => {
  const [search, setSearch] = useState("");
  const [selectedDecade, setSelectedDecade] = useState("All");
  const [selectedCountry, setSelectedCountry] = useState("All");

  const { data: models, isLoading, error } = useModels({
    decade: selectedDecade,
    country: selectedCountry,
    search: search,
  });

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
              Browse our database of Alvarez guitar models from the 1970s to present.
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8 space-y-4">
            {/* Search */}
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

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Decade:</span>
                <div className="flex gap-1">
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
              {/* Results Count */}
              <p className="text-sm text-muted-foreground mb-6 text-center">
                Showing {models?.length || 0} models
              </p>

              {/* Model Grid */}
              {models && models.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {models.map((model, index) => (
                    <Link
                      key={model.id}
                      to={`/encyclopedia/${model.id}`}
                      className="group p-5 border border-border rounded-lg hover:border-foreground/20 transition-all duration-300 opacity-0 animate-fade-in"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      {/* Placeholder Image */}
                      <div className="aspect-square bg-secondary rounded-md mb-4 flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">Photo</span>
                      </div>

                      <h3 className="font-semibold mb-1 group-hover:text-accent transition-colors">
                        {model.model_name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {model.production_start_year && model.production_end_year
                          ? `${model.production_start_year}-${model.production_end_year}`
                          : model.production_start_year || "Year unknown"}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{model.country_of_manufacture || "Unknown"}</span>
                        <span>{model.series || ""}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-muted-foreground mb-4">No models found matching your criteria</p>
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      setSearch("");
                      setSelectedDecade("All");
                      setSelectedCountry("All");
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
    </div>
  );
};

export default Encyclopedia;
