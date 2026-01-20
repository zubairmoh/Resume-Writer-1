import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Check, CreditCard, Lock, ShieldCheck, Package, Loader2, AlertCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCreateOrder, useAdminSettings } from "@/lib/hooks";
import { useAuth } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";

const DEFAULT_PACKAGE_PRICES: Record<string, { name: string; price: number; description: string }> = {
  basic: { name: "Entry", price: 99, description: "Perfect for recent graduates" },
  pro: { name: "Professional", price: 199, description: "For mid-level professionals" },
  exec: { name: "Executive", price: 349, description: "For C-suite executives" },
};

const ADDON_PRICES = {
  coverLetter: { name: "Cover Letter", price: 50 },
  linkedin: { name: "LinkedIn Optimization", price: 75 },
};

// Test card numbers for development
const TEST_CARDS = {
  visa: "4242424242424242",
  mastercard: "5555555555554444",
  amex: "378282246310005",
  decline: "4000000000000002",
};

// Simple card validation
function validateCard(cardNumber: string): { valid: boolean; type: string } {
  const cleaned = cardNumber.replace(/\s/g, "");
  
  if (cleaned.length < 13 || cleaned.length > 19) {
    return { valid: false, type: "unknown" };
  }
  
  // Check for test cards (always valid in test mode)
  if (Object.values(TEST_CARDS).includes(cleaned)) {
    if (cleaned === TEST_CARDS.decline) {
      return { valid: false, type: "decline" };
    }
    if (cleaned.startsWith("4")) return { valid: true, type: "visa" };
    if (cleaned.startsWith("5")) return { valid: true, type: "mastercard" };
    if (cleaned.startsWith("3")) return { valid: true, type: "amex" };
  }
  
  // Basic Luhn algorithm check for real cards
  let sum = 0;
  let isEven = false;
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }
  
  const valid = sum % 10 === 0;
  let type = "unknown";
  if (cleaned.startsWith("4")) type = "visa";
  else if (cleaned.startsWith("5")) type = "mastercard";
  else if (cleaned.startsWith("3")) type = "amex";
  
  return { valid, type };
}

function formatCardNumber(value: string): string {
  const cleaned = value.replace(/\D/g, "");
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join(" ") : cleaned;
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const { data: settings, isLoading: settingsLoading } = useAdminSettings();
  const createOrder = useCreateOrder();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal">("card");
  const [cardError, setCardError] = useState<string | null>(null);

  // Form state
  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

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

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, "").length <= 16) {
      setCardNumber(formatted);
      setCardError(null);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length >= 2) {
      value = value.slice(0, 2) + "/" + value.slice(2, 4);
    }
    setExpiry(value);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Error", description: "Please log in to continue", variant: "destructive" });
      return;
    }

    // Validate card
    if (paymentMethod === "card") {
      const validation = validateCard(cardNumber);
      
      if (!validation.valid) {
        if (validation.type === "decline") {
          setCardError("This card has been declined. Please use a different card.");
          toast({ title: "Payment Declined", description: "Your card was declined. Please try another card.", variant: "destructive" });
          return;
        }
        setCardError("Invalid card number. Please check and try again.");
        toast({ title: "Invalid Card", description: "Please enter a valid card number.", variant: "destructive" });
        return;
      }

      // Validate expiry
      const [month, year] = expiry.split("/");
      const expMonth = parseInt(month, 10);
      const expYear = parseInt("20" + year, 10);
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      if (expMonth < 1 || expMonth > 12 || expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
        setCardError("Card has expired or invalid expiry date.");
        toast({ title: "Invalid Expiry", description: "Please enter a valid expiry date.", variant: "destructive" });
        return;
      }

      // Validate CVC
      if (cvc.length < 3) {
        setCardError("Invalid CVC.");
        toast({ title: "Invalid CVC", description: "Please enter a valid CVC.", variant: "destructive" });
        return;
      }
    }
    
    setIsProcessing(true);
    setCardError(null);

    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

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
        paymentMethod: paymentMethod,
        paymentStatus: "paid",
        status: "pending",
      });
      
      toast({ title: "Payment Successful!", description: "Your order has been created. A writer will be assigned shortly." });
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Order creation error:", error);
      toast({ title: "Error", description: error.message || "Failed to create order. Please try again.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayPalPayment = async () => {
    if (!user) {
      toast({ title: "Error", description: "Please log in to continue", variant: "destructive" });
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate PayPal redirect and payment
      await new Promise(resolve => setTimeout(resolve, 2000));

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
        paymentMethod: "paypal",
        paymentStatus: "paid",
        status: "pending",
      });
      
      toast({ title: "PayPal Payment Successful!", description: "Your order has been created. A writer will be assigned shortly." });
      navigate("/dashboard");
    } catch (error: any) {
      console.error("PayPal order creation error:", error);
      toast({ title: "Error", description: error.message || "Failed to process PayPal payment. Please try again.", variant: "destructive" });
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

          {/* Test Card Info */}
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h4 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Test Mode - Use These Cards
            </h4>
            <ul className="space-y-1 text-sm text-amber-800 font-mono">
              <li><strong>Visa:</strong> 4242 4242 4242 4242</li>
              <li><strong>Mastercard:</strong> 5555 5555 5555 4444</li>
              <li><strong>Amex:</strong> 3782 8224 6310 005</li>
              <li><strong>Decline:</strong> 4000 0000 0000 0002</li>
            </ul>
            <p className="text-xs text-amber-700 mt-2">Use any future expiry date and any 3-digit CVC.</p>
          </div>

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
              <CardDescription>Choose your payment method</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Payment Method Selection */}
              <div className="space-y-3 mb-6">
                <div 
                  onClick={() => setPaymentMethod("card")}
                  className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === "card" ? "bg-primary/5 border-primary" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === "card" ? "border-primary" : "border-muted-foreground"
                    }`}>
                      {paymentMethod === "card" && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                    <span className="font-medium">Credit / Debit Card</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-8 h-5 bg-blue-600 rounded text-white text-[8px] flex items-center justify-center font-bold">VISA</div>
                    <div className="w-8 h-5 bg-red-500 rounded text-white text-[8px] flex items-center justify-center font-bold">MC</div>
                    <div className="w-8 h-5 bg-blue-400 rounded text-white text-[8px] flex items-center justify-center font-bold">AMEX</div>
                  </div>
                </div>

                <div 
                  onClick={() => setPaymentMethod("paypal")}
                  className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === "paypal" ? "bg-primary/5 border-primary" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === "paypal" ? "border-primary" : "border-muted-foreground"
                    }`}>
                      {paymentMethod === "paypal" && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                    <span className="font-medium">PayPal</span>
                  </div>
                  <div className="font-bold text-blue-700 italic text-sm">PayPal</div>
                </div>
              </div>

              {paymentMethod === "card" ? (
                <form onSubmit={handlePayment} className="space-y-4">
                  {cardError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {cardError}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Cardholder Name</Label>
                    <Input 
                      placeholder={user?.fullName || "Your name"} 
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                      required 
                      data-testid="input-cardholder-name" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Card Number</Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="4242 4242 4242 4242" 
                        className="pl-10" 
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        required 
                        data-testid="input-card-number" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Expiry Date</Label>
                      <Input 
                        placeholder="MM/YY" 
                        value={expiry}
                        onChange={handleExpiryChange}
                        maxLength={5}
                        required 
                        data-testid="input-expiry" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>CVC</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="123" 
                          className="pl-10" 
                          value={cvc}
                          onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                          maxLength={4}
                          required 
                          data-testid="input-cvc" 
                        />
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-lg font-semibold mt-4"
                    disabled={isProcessing}
                    data-testid="button-pay-now"
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing Payment...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Pay ${total}.00
                      </span>
                    )}
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-6 rounded-lg text-center">
                    <div className="font-bold text-2xl text-blue-700 italic mb-2">PayPal</div>
                    <p className="text-sm text-blue-600 mb-4">
                      You will be redirected to PayPal to complete your payment securely.
                    </p>
                    <Button 
                      onClick={handlePayPalPayment}
                      className="w-full h-12 text-lg font-semibold bg-[#0070ba] hover:bg-[#005ea6]"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Connecting to PayPal...
                        </span>
                      ) : (
                        <span>Pay ${total}.00 with PayPal</span>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-center text-muted-foreground">
                    By clicking "Pay with PayPal", you agree to our Terms of Service.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
