import { Nav } from "@/components/home/Nav";
import { Hero } from "@/components/home/Hero";
import { Features } from "@/components/home/Features";
import { AiSection } from "@/components/home/AiSection";
import { Pricing } from "@/components/home/Pricing";
import { Cta } from "@/components/home/Cta";
import { Footer } from "@/components/home/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Features />
        <AiSection />
        <Pricing />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
