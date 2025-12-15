import { Link } from "react-router-dom";
import { useModels } from "@/hooks/useModels";
import { Loader2 } from "lucide-react";

const ModelGrid = () => {
  const { data: models, isLoading, error } = useModels();

  // Take first 6 models for homepage display
  const displayModels = models?.slice(0, 6) || [];

  return (
    <section className="py-20">
      <div className="container-wide">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-2xl font-semibold mb-3">Models in Archive</h2>
            <p className="text-muted-foreground">
              Explore documented guitars in our database
            </p>
          </div>
          <Link 
            to="/encyclopedia" 
            className="text-sm font-medium hover:text-accent transition-colors hidden sm:block"
          >
            View All Models →
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-muted-foreground">
            Unable to load models. Please try again later.
          </div>
        ) : displayModels.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No models in the database yet.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayModels.map((model, index) => (
              <Link
                key={model.id}
                to={`/encyclopedia/${model.id}`}
                className="group flex items-center gap-4 p-4 border border-border rounded-lg hover:border-foreground/20 transition-all duration-300 opacity-0 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="w-16 h-16 bg-secondary rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {model.photo_url ? (
                    <img 
                      src={model.photo_url} 
                      alt={model.model_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">Photo</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate group-hover:text-accent transition-colors">
                    {model.model_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {model.production_start_year && model.production_end_year
                      ? `${model.production_start_year}-${model.production_end_year}`
                      : model.production_start_year || "Year unknown"} · {model.country_of_manufacture || "Unknown"}
                  </p>
                  <span className="text-xs text-muted-foreground/70">
                    {model.series || "Uncategorized"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <Link 
          to="/encyclopedia" 
          className="mt-6 text-sm font-medium hover:text-accent transition-colors block text-center sm:hidden"
        >
          View All Models →
        </Link>
      </div>
    </section>
  );
};

export default ModelGrid;
