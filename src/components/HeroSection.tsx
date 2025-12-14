import SerialSearch from "@/components/SerialSearch";
import heroGuitar from "@/assets/hero-guitar.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[70vh] flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroGuitar}
          alt="Vintage Alvarez acoustic guitar"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/50" />
      </div>

      {/* Content */}
      <div className="container-wide relative z-10 py-20">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 leading-tight opacity-0 animate-fade-in">
            Identify Your Vintage Alvarez Guitar
          </h1>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl opacity-0 animate-fade-in" style={{ animationDelay: "100ms" }}>
            The most comprehensive community-driven database for identifying and documenting 
            vintage Alvarez guitars. Accurate serial decoding with honest confidence ratings.
          </p>
          
          <div className="opacity-0 animate-fade-in" style={{ animationDelay: "200ms" }}>
            <SerialSearch variant="hero" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
