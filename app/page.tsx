import { HeroSection } from "@/components/landing/hero-section";
import { FeaturedTournaments } from "@/components/landing/featured-tournaments";
import { HowItWorks } from "@/components/landing/how-it-works";
import { StatsStrip } from "@/components/landing/stats-strip";
import { CtaBanner } from "@/components/landing/cta-banner";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsStrip />
      <FeaturedTournaments />
      <HowItWorks />
      <CtaBanner />
    </>
  );
}
