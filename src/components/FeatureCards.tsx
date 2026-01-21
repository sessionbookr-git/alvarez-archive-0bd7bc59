import { Link } from "react-router-dom";
import { BookOpen, Users, Upload } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Model Encyclopedia",
    description: "Browse our comprehensive database of Alvarez models from the 1970s to present.",
    href: "/encyclopedia",
    cta: "Browse Models",
  },
  {
    icon: Users,
    title: "Community Stories",
    description: "Discover the stories behind the guitars. See what fellow collectors have shared.",
    href: "/community",
    cta: "Explore Stories",
  },
  {
    icon: Upload,
    title: "Submit Your Guitar",
    description: "Help expand our database by contributing photos and the story of your Alvarez guitar.",
    href: "/submit",
    cta: "Share Yours",
  },
];

const FeatureCards = () => {
  return (
    <section className="py-20">
      <div className="container-wide">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-semibold mb-3">Explore the Archive</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            A community-driven resource for Alvarez guitar enthusiasts
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <Link
              key={feature.title}
              to={feature.href}
              className="group p-6 bg-background border border-border rounded-lg hover:border-foreground/20 transition-all duration-300 opacity-0 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <feature.icon className="h-8 w-8 mb-4 text-foreground/70 group-hover:text-foreground transition-colors" />
              <h3 className="font-semibold mb-2 group-hover:text-accent transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                {feature.description}
              </p>
              <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors">
                {feature.cta} →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;
