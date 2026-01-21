import { Link } from "react-router-dom";
import { Users, BookOpen } from "lucide-react";
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
          <h1
            className="text-2xl md:text-3xl font-semibold mb-4 leading-tight opacity-0 animate-fade-in"
            style={{ animationDelay: "50ms" }}
          >
            The Legacy Archive
          </h1>
          <p
            className="text-base md:text-lg text-muted-foreground mb-8 max-w-md mx-auto opacity-0 animate-fade-in"
            style={{ animationDelay: "100ms" }}
          >
            A community-driven encyclopedia celebrating the rich history of Alvarez guitars. 
            Discover, share, and connect with fellow enthusiasts.
          </p>

          {/* Dual CTAs - Mobile */}
          <div
            className="flex flex-col gap-4 max-w-md mx-auto opacity-0 animate-fade-in"
            style={{ animationDelay: "200ms" }}
          >
            <Link
              to="/encyclopedia"
              className="inline-flex items-center justify-center gap-3 w-full px-6 py-4 bg-foreground text-background hover:bg-foreground/90 rounded-xl font-medium transition-all"
            >
              <BookOpen className="h-5 w-5" />
              <span>Explore the Encyclopedia</span>
            </Link>
            <Link
              to="/community"
              className="inline-flex items-center justify-center gap-3 w-full px-6 py-4 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-xl text-primary font-medium transition-all"
            >
              <Users className="h-5 w-5" />
              <span>Community Stories</span>
            </Link>
          </div>

          <div className="relative max-w-sm mx-auto mt-8">
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
        {/* Left: Text + CTAs */}
        <div className="w-[45%] pr-16 flex flex-col justify-center items-start">
          <img
            src={alvarezBlackLogo}
            alt="Alvarez Guitars"
            className="w-full max-w-[520px] h-auto mb-8 opacity-0 animate-fade-in -ml-2 shadow-none"
          />
          <h1
            className="text-5xl font-semibold mb-6 leading-tight opacity-0 animate-fade-in"
            style={{ animationDelay: "50ms" }}
          >
            The Legacy Archive
          </h1>
          <p
            className="text-lg text-muted-foreground mb-10 max-w-xl opacity-0 animate-fade-in"
            style={{ animationDelay: "100ms" }}
          >
            A community-driven encyclopedia celebrating the rich history of Alvarez guitars. 
            Discover models, share your story, and connect with fellow enthusiasts.
          </p>

          {/* Dual CTAs - Desktop */}
          <div
            className="flex gap-4 opacity-0 animate-fade-in"
            style={{ animationDelay: "200ms" }}
          >
            <Link
              to="/encyclopedia"
              className="inline-flex items-center gap-3 px-8 py-4 bg-foreground text-background hover:bg-foreground/90 rounded-xl font-medium transition-all"
            >
              <BookOpen className="h-5 w-5" />
              <span>Explore Encyclopedia</span>
            </Link>
            <Link
              to="/community"
              className="inline-flex items-center gap-3 px-8 py-4 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-xl text-primary font-medium transition-all"
            >
              <Users className="h-5 w-5" />
              <span>Community Stories</span>
            </Link>
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
