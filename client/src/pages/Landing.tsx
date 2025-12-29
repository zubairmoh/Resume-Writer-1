import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/home/Hero";
import { ATSScanner } from "@/components/home/ATSScanner";
import { Pricing } from "@/components/home/Pricing";
import { ResumeComparison } from "@/components/home/ResumeComparison";
import { TemplateGallery } from "@/components/home/TemplateGallery";
import { HowItWorks, WhyChooseUs, ContactSection } from "@/components/home/ContentSections";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import { FOMOPopup } from "@/components/FOMOPopup";

function TrustSection() {
  return (
    <section className="py-12 bg-secondary/20 border-y" id="testimonials">
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
      <FOMOPopup />
      <Navbar />
      <main>
        <Hero />
        <TrustSection />
        <WhyChooseUs />
        <HowItWorks />
        <ResumeComparison />
        <TemplateGallery />
        <ATSScanner />
        <Pricing />
        <ContactSection />
      </main>
      <footer className="bg-secondary py-16 border-t">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-xl font-bold font-display text-primary mb-4">ResumePro</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Canada's leading resume writing service. We combine expert writers with ATS technology to help you land your dream job in Toronto, Vancouver, Montreal, and beyond.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-primary">Terms & Conditions</Link></li>
                <li><Link to="/cookie-policy" className="hover:text-primary">Cookie Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#contact" className="hover:text-primary">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary">FAQ</a></li>
                <li><Link to="/login" className="hover:text-primary">Client Login</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
            <p>© 2024 ProResumes.ca. All rights reserved.</p>
            <div className="flex gap-4">
              <span>Made with ❤️ in Canada</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
