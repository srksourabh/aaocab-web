import HeroSection from "@/components/HeroSection";
import TrustStrip from "@/components/TrustStrip";
import HowItWorks from "@/components/HowItWorks";
import PopularRoutes from "@/components/PopularRoutes";
import VehicleCategories from "@/components/VehicleCategories";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustStrip />
      <HowItWorks />
      <PopularRoutes />
      <VehicleCategories />
    </>
  );
}
