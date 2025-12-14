import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useModel } from "@/hooks/useModels";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Globe, Music, Loader2 } from "lucide-react";

const ModelDetail = () => {
  const { modelId } = useParams<{ modelId: string }>();
  const { data: model, isLoading, error } = useModel(modelId || "");

  if (isLoading) {
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

  if (error || !model) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-12">
          <div className="container-wide text-center">
            <h1 className="text-2xl font-semibold mb-4">Model Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The model you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/encyclopedia">Back to Encyclopedia</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const features = model.key_features as string[] | null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="container-wide">
          {/* Back Link */}
          <Link 
            to="/encyclopedia" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Encyclopedia
          </Link>

          <div className="grid gap-12 lg:grid-cols-2">
            {/* Image Section */}
            <div>
              <div className="aspect-square bg-secondary rounded-lg flex items-center justify-center">
                <span className="text-muted-foreground">Photo Coming Soon</span>
              </div>
            </div>

            {/* Details Section */}
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold mb-2">
                {model.model_name}
              </h1>
              {model.series && (
                <p className="text-lg text-muted-foreground mb-6">{model.series}</p>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="p-4 bg-secondary/50 rounded-lg text-center">
                  <Calendar className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    {model.production_start_year && model.production_end_year
                      ? `${model.production_start_year}-${model.production_end_year}`
                      : model.production_start_year || "Unknown"}
                  </p>
                  <p className="text-xs text-muted-foreground">Production</p>
                </div>
                <div className="p-4 bg-secondary/50 rounded-lg text-center">
                  <Globe className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">{model.country_of_manufacture || "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">Country</p>
                </div>
                <div className="p-4 bg-secondary/50 rounded-lg text-center">
                  <Music className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">{model.body_shape || "Standard"}</p>
                  <p className="text-xs text-muted-foreground">Body Shape</p>
                </div>
              </div>

              {/* Description */}
              {model.description && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold mb-3">About This Model</h2>
                  <p className="text-muted-foreground leading-relaxed">{model.description}</p>
                </div>
              )}

              {/* Key Features */}
              {features && features.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold mb-3">Key Features</h2>
                  <ul className="space-y-2">
                    {features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-muted-foreground">
                        <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* CTA */}
              <div className="p-6 bg-secondary/30 rounded-lg">
                <h3 className="font-semibold mb-2">Have this guitar?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Submit your guitar's details and photos to help expand our database.
                </p>
                <Button asChild>
                  <Link to="/submit">Submit Your Guitar</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ModelDetail;
