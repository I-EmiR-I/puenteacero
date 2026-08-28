import { AboutCTA } from './about-cta';
import { AboutFeaturesGrid } from './about-features-grid';
import { AboutHero } from './about-hero';

export default function About() {
  return (
    <div className="container mx-auto max-w-6xl space-y-16 px-4 py-12">
      <AboutHero />
      <AboutFeaturesGrid />
      <AboutCTA />
    </div>
  );
}
