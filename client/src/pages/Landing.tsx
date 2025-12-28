import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/home/Hero";
import { ATSScanner } from "@/components/home/ATSScanner";
import { Pricing } from "@/components/home/Pricing";
import { ResumeComparison } from "@/components/home/ResumeComparison";
import { TemplateGallery } from "@/components/home/TemplateGallery";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

function TrustSection() {
  return (
    <section className="py-12 bg-secondary/20 border-y">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center items-center opacity-70 grayscale hover:grayscale-0 transition-all">
          {/* Mock Logos - In real app use SVG/Images */}
          <div className="font-bold text-xl font-display">Forbes</div>
          <div className="font-bold text-xl font-display">FastCompany</div>
          <div className="font-bold text-xl font-display">Business Insider</div>
          <div className="font-bold text-xl font-display">CBC News</div>
        </div>
        
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {[
            { name: "Emily R.", role: "Marketing Director", text: "Landed 3 interviews in one week after the rewrite. Worth every penny." },
            { name: "David K.", role: "Software Engineer", text: "The ATS scanner was an eye opener. The writer really understood the tech industry." },
            { name: "Sarah M.", role: "Nurse Practitioner", text: "Professional, fast, and Canadian-specific advice. Highly recommend." }
          ].map((review, i) => (
            <Card key={i} className="border-none shadow-none bg-transparent">
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-2 text-yellow-500">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-muted-foreground italic mb-4">"{review.text}"</p>
                <div>
                  <p className="font-semibold text-sm">{review.name}</p>
                  <p className="text-xs text-muted-foreground">{review.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Hero />
        <TrustSection />
        <ResumeComparison />
        <TemplateGallery />
        <ATSScanner />
        <Pricing />
      </main>
      <footer className="bg-secondary py-12 border-t">
        <div className="container px-4 text-center text-muted-foreground text-sm">
          <p>© 2024 ProResumes.ca. All rights reserved.</p>
          <div className="mt-4 flex justify-center gap-4 text-xs">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
            <a href="#" className="hover:underline">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
