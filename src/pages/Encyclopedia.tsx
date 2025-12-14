import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";

// Sample model data
const allModels = [
  { id: "5014", name: "5014 Dreadnought", years: "1974-1982", country: "Japan", series: "5000 Series", decade: "1970s", examples: 47 },
  { id: "5024", name: "5024 Folk", years: "1975-1983", country: "Japan", series: "5000 Series", decade: "1970s", examples: 32 },
  { id: "5054", name: "5054 Jumbo", years: "1976-1984", country: "Japan", series: "5000 Series", decade: "1970s", examples: 28 },
  { id: "5068", name: "5068 12-String", years: "1977-1986", country: "Japan", series: "5000 Series", decade: "1970s", examples: 19 },
  { id: "dy-77", name: "DY-77 Artist", years: "1978-1985", country: "Japan", series: "Artist Series", decade: "1970s", examples: 41 },
  { id: "dy-91", name: "DY-91 Artist", years: "1980-1988", country: "Japan", series: "Artist Series", decade: "1980s", examples: 35 },
  { id: "rd-8", name: "RD-8 Regent", years: "1985-1995", country: "Korea", series: "Regent Series", decade: "1980s", examples: 56 },
  { id: "rd-10", name: "RD-10 Regent", years: "1985-1995", country: "Korea", series: "Regent Series", decade: "1980s", examples: 44 },
  { id: "ad-60", name: "AD-60 Artist", years: "1990-2000", country: "Korea", series: "Artist Series", decade: "1990s", examples: 38 },
  { id: "md-80", name: "MD-80 Masterworks", years: "1995-2005", country: "Japan", series: "Masterworks", decade: "1990s", examples: 22 },
  { id: "af-60", name: "AF-60 Folk", years: "1998-2008", country: "China", series: "AF Series", decade: "1990s", examples: 61 },
  { id: "ad-90", name: "AD-90 Artist", years: "2000-2010", country: "China", series: "Artist Series", decade: "2000s", examples: 73 },
];

const decades = ["All", "1970s", "1980s", "1990s", "2000s"];
const countries = ["All", "Japan", "Korea", "China"];

const Encyclopedia = () => {
  const [search, setSearch] = useState("");
  const [selectedDecade, setSelectedDecade] = useState("All");
  const [selectedCountry, setSelectedCountry] = useState("All");

  const filteredModels = allModels.filter((model) => {
    const matchesSearch = model.name.toLowerCase().includes(search.toLowerCase()) ||
      model.series.toLowerCase().includes(search.toLowerCase());
    const matchesDecade = selectedDecade === "All" || model.decade === selectedDecade;
    const matchesCountry = selectedCountry === "All" || model.country === selectedCountry;
    return matchesSearch && matchesDecade && matchesCountry;
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
              Browse our comprehensive database of Alvarez guitar models from the 1970s to present.
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

          {/* Results Count */}
          <p className="text-sm text-muted-foreground mb-6 text-center">
            Showing {filteredModels.length} of {allModels.length} models
          </p>

          {/* Model Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredModels.map((model, index) => (
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
                  {model.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {model.years}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{model.country}</span>
                  <span>{model.examples} documented</span>
                </div>
              </Link>
            ))}
          </div>

          {filteredModels.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No models found matching your criteria</p>
              <Button 
                variant="ghost" 
                className="mt-4"
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
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Encyclopedia;
