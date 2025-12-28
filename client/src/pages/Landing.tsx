import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/home/Hero";
import { ATSScanner } from "@/components/home/ATSScanner";
import { Pricing } from "@/components/home/Pricing";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Hero />
        <ATSScanner />
        <Pricing />
      </main>
      <footer className="bg-secondary py-12 border-t">
        <div className="container px-4 text-center text-muted-foreground text-sm">
          <p>© 2024 ResumePro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
