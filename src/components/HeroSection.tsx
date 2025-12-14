import SerialSearch from "@/components/SerialSearch";
import yairiHero from "@/assets/yairi-hero.png";
import alvarezGoldLogo from "@/assets/alvarez-gold-logo.png";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="container-wide relative flex flex-col md:flex-row items-center min-h-[70vh] py-14 md:py-20">
        {/* Left: Text + search */}
        <div className="w-full md:w-1/2 lg:w-[45%] md:pr-10 lg:pr-16 py-6">
          <img 
            src={alvarezGoldLogo} 
            alt="Alvarez Guitars" 
            className="w-full max-w-xl h-auto mb-1 opacity-0 animate-fade-in"
          />
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-6 leading-tight opacity-0 animate-fade-in" style={{ animationDelay: "50ms" }}>
            Identify Your Guitar
          </h1>
          <p
            className="text-lg text-muted-foreground mb-10 max-w-xl opacity-0 animate-fade-in"
            style={{ animationDelay: "100ms" }}
          >
            The most comprehensive community-driven database for identifying and documenting
            Alvarez guitars. Accurate serial decoding with honest confidence ratings.
          </p>

          <div className="opacity-0 animate-fade-in" style={{ animationDelay: "200ms" }}>
            <SerialSearch variant="hero" />
          </div>
        </div>

        <div className="w-full md:w-1/2 lg:w-[55%] mt-10 md:-mt-16 lg:-mt-24 relative flex justify-center md:justify-end">
          <div className="relative w-full max-w-xl md:max-w-2xl">
            {/* Soft circle glow behind guitar */}
            <div className="absolute inset-0 rounded-full bg-warm/60 blur-3xl translate-x-10 md:translate-x-16 translate-y-6" />

            <img
              src={yairiHero}
              alt="Alvarez Yairi DYM70 Sunburst acoustic guitar"
              className="relative z-10 w-full h-auto object-contain md:-mr-6 lg:-mr-10"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
