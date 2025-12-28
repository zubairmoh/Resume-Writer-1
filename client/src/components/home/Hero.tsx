import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import heroBg from "@assets/generated_images/minimalist_abstract_tech_office_background.png";

export function Hero() {
  const handleScrollToScanner = () => {
    document.getElementById("ats-scanner")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleScrollToPricing = () => {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroBg} 
          alt="Office Background" 
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/50 to-background" />
      </div>

      <div className="container relative z-10 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            AI-Powered Resume Optimization
          </span>
          <h1 className="text-5xl md:text-7xl font-bold font-display tracking-tight mb-6 text-foreground">
            Beat the Bots. <br />
            <span className="text-primary">Get Hired.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop getting rejected by ATS algorithms. We scan your resume, score it, 
            and rewrite it to help you land your dream interview.
          </p>
          
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
              onClick={handleScrollToPricing}
              data-testid="button-view-pricing"
            >
              View Pricing
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
