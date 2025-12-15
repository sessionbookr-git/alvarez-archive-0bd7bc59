import SerialSearch from "@/components/SerialSearch";
import yairiHero from "@/assets/yairi-hero.png";
import alvarezBlackLogo from "@/assets/alvarez-black-logo.png";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Mobile/Tablet Layout */}
      <div className="lg:hidden container-wide py-10 md:py-14">
        <div className="text-center">
          <img 
            src={alvarezBlackLogo} 
            alt="Alvarez Guitars" 
            className="w-full max-w-xs md:max-w-md mx-auto h-auto mb-4 opacity-0 animate-fade-in"
          />
          <h1 className="text-2xl md:text-3xl font-semibold mb-4 leading-tight opacity-0 animate-fade-in" style={{ animationDelay: "50ms" }}>
            Identify Your Guitar
          </h1>
          <p
            className="text-base md:text-lg text-muted-foreground mb-6 max-w-md mx-auto opacity-0 animate-fade-in"
            style={{ animationDelay: "100ms" }}
          >
            The most comprehensive community-driven database for identifying and documenting
            Alvarez guitars.
          </p>
          
          <div className="opacity-0 animate-fade-in mb-8" style={{ animationDelay: "200ms" }}>
            <SerialSearch variant="hero" />
          </div>
          
          <div className="relative max-w-sm mx-auto">
            <div className="absolute inset-0 rounded-full bg-warm/40 blur-3xl" />
            <img
              src={yairiHero}
              alt="Alvarez Yairi DYM70 Sunburst acoustic guitar"
              className="relative z-10 w-full h-auto object-contain max-h-[50vh]"
            />
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex container-wide relative items-center justify-center min-h-[70vh] py-20">
        {/* Left: Text + search */}
        <div className="w-[45%] pr-16 flex flex-col justify-center">
          <img 
            src={alvarezBlackLogo} 
            alt="Alvarez Guitars" 
            className="w-full max-w-xl h-auto mb-1 opacity-0 animate-fade-in"
          />
          <h1 className="text-5xl font-semibold mb-6 leading-tight opacity-0 animate-fade-in" style={{ animationDelay: "50ms" }}>
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

        <div className="w-[55%] relative flex justify-end items-center">
          <div className="relative w-full max-w-2xl">
            {/* Soft circle glow behind guitar */}
            <div className="absolute inset-0 rounded-full bg-warm/60 blur-3xl translate-x-16 translate-y-6" />

            <img
              src={yairiHero}
              alt="Alvarez Yairi DYM70 Sunburst acoustic guitar"
              className="relative z-10 w-full h-auto object-contain -mr-10"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
