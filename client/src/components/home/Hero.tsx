import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import heroBg from "@assets/generated_images/minimalist_abstract_tech_office_background.png";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Hero() {
  const navigate = useNavigate();

  const handleScrollToScanner = () => {
    document.getElementById("ats-scanner")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleScrollToPricing = () => {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[700px] flex items-center justify-center overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroBg} 
          alt="Office Background" 
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/80 to-background" />
      </div>

      <div className="container relative z-10 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center py-1 px-3 rounded-full bg-red-50 text-red-700 text-sm font-medium border border-red-100">
              <span className="mr-2 text-lg">🇨🇦</span> Canada's #1 Rated Resume Service
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold font-display tracking-tight mb-6 text-foreground max-w-4xl mx-auto">
            Get Hired Faster with <br />
            <span className="text-primary">ProResumes.ca</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            Expert Canadian writers. ATS-optimized formats. 
            Join thousands of professionals in Toronto, Vancouver, and Montreal who landed their dream jobs.
          </p>

          <div className="flex flex-wrap justify-center gap-6 mb-10 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>100% Satisfaction Guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>ATS-Compliant Formats</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Industry-Specific Writers</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="h-14 px-8 text-lg shadow-lg hover:shadow-primary/20 transition-all" 
              onClick={handleScrollToScanner}
              data-testid="button-check-resume"
            >
              Check My Resume Score
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="h-14 px-8 text-lg bg-background/50 backdrop-blur-sm"
              onClick={() => navigate("/signup")}
              data-testid="button-view-pricing"
            >
              Get Started
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
