import SerialSearch from "@/components/SerialSearch";
import yairiHero from "@/assets/yairi-hero.png";

const HeroSection = () => {
  return (
    <section className="relative min-h-[70vh] flex items-center overflow-hidden">
      {/* Guitar Image - rotated 90 degrees, full width background */}
      <div className="absolute inset-0">
        <img
          src={yairiHero}
          alt="Alvarez Yairi DYM70 Sunburst acoustic guitar"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90 h-auto w-[140%] max-w-none object-contain opacity-40"
        />
        {/* Fade overlay from left for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/70" />
        {/* Additional top/bottom fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background/50" />
      </div>

      {/* Content */}
      <div className="container-wide relative z-10 py-20">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 leading-tight opacity-0 animate-fade-in">
            Identify Your Alvarez Guitar
          </h1>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl opacity-0 animate-fade-in" style={{ animationDelay: "100ms" }}>
            The most comprehensive community-driven database for identifying and documenting 
            Alvarez guitars. Accurate serial decoding with honest confidence ratings.
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
