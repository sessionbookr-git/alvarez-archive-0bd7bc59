import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import FeatureCards from "@/components/FeatureCards";
import StatsSection from "@/components/StatsSection";
import ModelGrid from "@/components/ModelGrid";
import Timeline from "@/components/Timeline";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeatureCards />
        <StatsSection />
        <Timeline />
        <ModelGrid />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
