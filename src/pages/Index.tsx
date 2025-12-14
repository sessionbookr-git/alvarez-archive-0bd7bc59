import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import FeatureCards from "@/components/FeatureCards";
import StatsSection from "@/components/StatsSection";
import ModelGrid from "@/components/ModelGrid";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeatureCards />
        <StatsSection />
        <ModelGrid />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
