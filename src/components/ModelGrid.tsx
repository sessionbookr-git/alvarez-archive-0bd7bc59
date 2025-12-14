import { Link } from "react-router-dom";

// Sample model data - in production this would come from a database
const sampleModels = [
  {
    id: "5014",
    name: "5014 Dreadnought",
    years: "1974-1982",
    country: "Japan",
    series: "5000 Series",
  },
  {
    id: "5024",
    name: "5024 Folk",
    years: "1975-1983",
    country: "Japan",
    series: "5000 Series",
  },
  {
    id: "dy-77",
    name: "DY-77 Artist",
    years: "1978-1985",
    country: "Japan",
    series: "Artist Series",
  },
  {
    id: "5054",
    name: "5054 Jumbo",
    years: "1976-1984",
    country: "Japan",
    series: "5000 Series",
  },
  {
    id: "5068",
    name: "5068 12-String",
    years: "1977-1986",
    country: "Japan",
    series: "5000 Series",
  },
  {
    id: "rd-8",
    name: "RD-8 Regent",
    years: "1985-1995",
    country: "Korea",
    series: "Regent Series",
  },
];

const ModelGrid = () => {
  return (
    <section className="py-20">
      <div className="container-wide">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-2xl font-semibold mb-3">Popular Models</h2>
            <p className="text-muted-foreground">
              Explore some of the most documented guitars in our archive
            </p>
          </div>
          <Link 
            to="/encyclopedia" 
            className="text-sm font-medium hover:text-accent transition-colors hidden sm:block"
          >
            View All Models →
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sampleModels.map((model, index) => (
            <Link
              key={model.id}
              to={`/encyclopedia/${model.id}`}
              className="group flex items-center gap-4 p-4 border border-border rounded-lg hover:border-foreground/20 transition-all duration-300 opacity-0 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="w-16 h-16 bg-secondary rounded-md flex items-center justify-center flex-shrink-0">
                <span className="text-xs text-muted-foreground">Photo</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate group-hover:text-accent transition-colors">
                  {model.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {model.years} · {model.country}
                </p>
                <span className="text-xs text-muted-foreground/70">
                  {model.series}
                </span>
              </div>
            </Link>
          ))}
        </div>

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
