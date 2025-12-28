import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TIERS = [
  {
    name: "Entry",
    price: 99,
    description: "Perfect for recent graduates and early career professionals.",
    features: ["Professional Resume Rewrite", "ATS Optimization", "Word & PDF Formats", "30-Day Revision Period"]
  },
  {
    name: "Professional",
    price: 199,
    description: "Ideal for mid-level professionals looking to climb the ladder.",
    features: ["Everything in Entry", "LinkedIn Profile Audit", "Cover Letter Template", "60-Day Revision Period"],
    popular: true
  },
  {
    name: "Executive",
    price: 299,
    description: "For C-suite executives and senior leadership roles.",
    features: ["Everything in Professional", "Executive Bio", "Networking Strategy Guide", "Unlimited Revisions"]
  }
];

export function Pricing() {
  const [selectedTier, setSelectedTier] = useState("Professional");
  const [addOns, setAddOns] = useState({
    coverLetter: false,
    linkedin: false
  });

  const getPrice = (basePrice: number) => {
    let total = basePrice;
    if (addOns.coverLetter) total += 50;
    if (addOns.linkedin) total += 75;
    return total;
  };

  return (
    <section className="py-24" id="pricing">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 font-display">Invest in Your Career</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Choose the package that fits your career stage. Transparent pricing, no hidden fees.
          </p>
        </div>

        {/* Add-ons Control */}
        <div className="max-w-xl mx-auto mb-16 p-6 bg-secondary/50 rounded-2xl border border-border">
          <h3 className="font-semibold mb-4 text-center">Customize Your Package</h3>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <div className="flex items-center justify-between sm:justify-start gap-4">
              <Switch 
                id="cover-letter" 
                checked={addOns.coverLetter}
                onCheckedChange={(c) => setAddOns(prev => ({ ...prev, coverLetter: c }))}
              />
              <label htmlFor="cover-letter" className="cursor-pointer">
                <span className="block font-medium">Cover Letter Writing</span>
                <span className="text-sm text-muted-foreground">+$50 one-time</span>
              </label>
            </div>
            <div className="flex items-center justify-between sm:justify-start gap-4">
              <Switch 
                id="linkedin"
                checked={addOns.linkedin}
                onCheckedChange={(c) => setAddOns(prev => ({ ...prev, linkedin: c }))}
              />
              <label htmlFor="linkedin" className="cursor-pointer">
                <span className="block font-medium">LinkedIn Optimization</span>
                <span className="text-sm text-muted-foreground">+$75 one-time</span>
              </label>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {TIERS.map((tier) => {
            const isSelected = selectedTier === tier.name;
            const finalPrice = getPrice(tier.price);

            return (
              <Card 
                key={tier.name}
                className={`relative transition-all duration-300 ${
                  tier.popular ? "border-primary shadow-lg scale-105 z-10" : "border-border hover:border-primary/50"
                }`}
                onClick={() => setSelectedTier(tier.name)}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <Badge className="bg-primary hover:bg-primary px-4 py-1">Most Popular</Badge>
                  </div>
                )}
                
                <CardHeader>
                  <h3 className="text-2xl font-bold font-display">{tier.name}</h3>
                  <p className="text-sm text-muted-foreground min-h-[40px]">{tier.description}</p>
                </CardHeader>
                
                <CardContent>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">${finalPrice}</span>
                    <span className="text-muted-foreground">/one-time</span>
                  </div>
                  
                  <ul className="space-y-3">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary mt-1 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {addOns.coverLetter && (
                      <li className="flex items-start gap-2 text-sm font-medium text-primary">
                        <Check className="w-4 h-4 mt-1 shrink-0" />
                        <span>Professional Cover Letter</span>
                      </li>
                    )}
                    {addOns.linkedin && (
                      <li className="flex items-start gap-2 text-sm font-medium text-primary">
                        <Check className="w-4 h-4 mt-1 shrink-0" />
                        <span>LinkedIn Profile Optimization</span>
                      </li>
                    )}
                  </ul>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    className="w-full h-12 text-lg" 
                    variant={tier.popular ? "default" : "outline"}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle mock checkout
                      alert(`Proceeding to mock Stripe Checkout for ${tier.name} Package ($${finalPrice})`);
                    }}
                  >
                    Get Started
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
