import SerialSearch from "@/components/SerialSearch";
import yairiHero from "@/assets/yairi-hero.png";

const HeroSection = () => {
  return (
    <section className="relative min-h-[75vh] flex items-center overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-background" />
      
      {/* Guitar Image - positioned on right side with fade */}
      <div className="absolute right-0 top-0 bottom-0 w-1/2 lg:w-2/5 hidden md:block">
        <div className="relative h-full w-full">
          <img
            src={yairiHero}
            alt="Alvarez Yairi DYM70 Sunburst acoustic guitar"
            className="absolute right-0 top-1/2 -translate-y-1/2 h-[90%] w-auto object-contain opacity-90"
          />
          {/* Fade overlay from left */}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        </div>
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

      {/* Mobile: Show guitar below content */}
      <div className="absolute bottom-0 right-0 w-48 h-64 md:hidden opacity-20">
        <img
          src={yairiHero}
          alt=""
          className="w-full h-full object-contain object-bottom"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>
    </section>
  );
};

export default HeroSection;
