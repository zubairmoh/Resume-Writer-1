import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Check, CreditCard, Lock, ShieldCheck, Package, Loader2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCreateOrder, useAdminSettings } from "@/lib/hooks";
import { useAuth } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";

const DEFAULT_PACKAGE_PRICES: Record<string, { name: string; price: number; description: string }> = {
  basic: { name: "Entry", price: 99, description: "Perfect for recent graduates" },
  pro: { name: "Professional", price: 199, description: "For mid-level professionals" },
  exec: { name: "Executive", price: 299, description: "For C-suite executives" },
};

const ADDON_PRICES = {
  coverLetter: { name: "Cover Letter", price: 50 },
  linkedin: { name: "LinkedIn Optimization", price: 75 },
};

export function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const { data: settings, isLoading: settingsLoading } = useAdminSettings();
  const createOrder = useCreateOrder();
  const [isProcessing, setIsProcessing] = useState(false);

  const packageId = searchParams.get("package") || "pro";
  const hasCoverLetter = searchParams.get("coverLetter") === "true";
  const hasLinkedin = searchParams.get("linkedin") === "true";

  const [packagePrices, setPackagePrices] = useState(DEFAULT_PACKAGE_PRICES);

  useEffect(() => {
    if (settings?.packages && Array.isArray(settings.packages)) {
      const updatedPrices = { ...DEFAULT_PACKAGE_PRICES };
      settings.packages.forEach((pkg: any) => {
        if (updatedPrices[pkg.id]) {
          updatedPrices[pkg.id] = { ...updatedPrices[pkg.id], price: pkg.price };
        }
      });
      setPackagePrices(updatedPrices);
    }
  }, [settings]);

  const selectedPackage = packagePrices[packageId] || packagePrices.pro;
  
  const addonsTotal = (hasCoverLetter ? ADDON_PRICES.coverLetter.price : 0) + 
                      (hasLinkedin ? ADDON_PRICES.linkedin.price : 0);
  const total = selectedPackage.price + addonsTotal;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate(`/login?redirect=/checkout?package=${packageId}&coverLetter=${hasCoverLetter}&linkedin=${hasLinkedin}`);
    }
  }, [user, authLoading, navigate, packageId, hasCoverLetter, hasLinkedin]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Error", description: "Please log in to continue", variant: "destructive" });
      return;
    }
    
    setIsProcessing(true);

    try {
      const addons = [];
      if (hasCoverLetter) addons.push({ name: "Cover Letter", price: 50 });
      if (hasLinkedin) addons.push({ name: "LinkedIn Optimization", price: 75 });

      await createOrder.mutateAsync({
        clientId: user.id,
        packageType: selectedPackage.name,
        price: total,
        basePrice: selectedPackage.price,
        addons,
        addonsTotal,
        paymentMethod: "card",
        paymentStatus: "paid",
        status: "pending",
      });
      
      toast({ title: "Order Placed!", description: "Your order has been created successfully." });
      navigate("/dashboard");
    } catch (error) {
      toast({ title: "Error", description: "Failed to create order. Please try again.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading || settingsLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
        
        {/* Order Summary */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
             <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">P</div>
             <span className="font-bold text-lg">ProResumes.ca</span>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>Review your package details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="font-medium">{selectedPackage.name} Package</h3>
                    <p className="text-sm text-muted-foreground">{selectedPackage.description}</p>
                  </div>
                </div>
                <p className="font-bold">${selectedPackage.price}.00</p>
              </div>
              
              {hasCoverLetter && (
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <div>
                      <h3 className="font-medium">Cover Letter Add-on</h3>
                      <p className="text-sm text-muted-foreground">Targeted cover letter</p>
                    </div>
                  </div>
                  <p className="font-bold">$50.00</p>
                </div>
              )}
              
              {hasLinkedin && (
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <div>
                      <h3 className="font-medium">LinkedIn Optimization</h3>
                      <p className="text-sm text-muted-foreground">Profile optimization</p>
                    </div>
                  </div>
                  <p className="font-bold">$75.00</p>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total</span>
                <span>${total}.00</span>
              </div>
            </CardContent>
            <CardFooter className="bg-secondary/20 flex flex-col items-start gap-4">
               <div className="flex items-center gap-2 text-sm text-muted-foreground">
                 <ShieldCheck className="w-4 h-4 text-green-600" />
                 <span>60-Day Money Back Guarantee</span>
               </div>
               <div className="flex items-center gap-2 text-sm text-muted-foreground">
                 <ShieldCheck className="w-4 h-4 text-green-600" />
                 <span>Secure 256-bit SSL Encryption</span>
               </div>
            </CardFooter>
          </Card>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex gap-2">
                <span className="font-bold text-blue-600">1.</span>
                <span>You'll be assigned a dedicated writer immediately.</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-blue-600">2.</span>
                <span>Upload your current resume and target job descriptions.</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-blue-600">3.</span>
                <span>Chat with your writer to refine your strategy.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Form */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Secure Payment</CardTitle>
              <CardDescription>Enter your payment details to complete your order</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePayment} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Cardholder Name</Label>
                    <Input placeholder={user?.fullName || "Your name"} required data-testid="input-cardholder-name" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Card Number</Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="0000 0000 0000 0000" className="pl-10" required data-testid="input-card-number" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Expiry Date</Label>
                      <Input placeholder="MM/YY" required data-testid="input-expiry" />
                    </div>
                    <div className="space-y-2">
                      <Label>CVC</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="123" className="pl-10" required data-testid="input-cvc" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                   <div 
                     className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors bg-primary/5 border-primary`}
                   >
                      <div className="flex items-center gap-3">
                         <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                         </div>
                         <span className="font-medium">Credit Card</span>
                      </div>
                      <div className="flex gap-2">
                         <CreditCard className="w-5 h-5 text-slate-400" />
                      </div>
                   </div>

                   <div 
                     className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors hover:bg-slate-50 opacity-50`}
                   >
                      <div className="flex items-center gap-3">
                         <div className="w-4 h-4 rounded-full border border-muted-foreground flex items-center justify-center" />
                         <span className="font-medium">PayPal</span>
                      </div>
                      <div className="flex gap-2 font-bold text-blue-700 italic">
                         PayPal
                      </div>
                   </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg font-semibold"
                  disabled={isProcessing}
                  data-testid="button-pay-now"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Pay ${total}.00
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
