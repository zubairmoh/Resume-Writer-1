import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Check, CreditCard, Lock, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/lib/store";

export function CheckoutPage() {
  const navigate = useNavigate();
  const { addOrder } = useApp();
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate payment processing
    setTimeout(() => {
      // Create a mock order
      addOrder({
        id: `ORD-${Math.floor(Math.random() * 10000)}`,
        tier: "Professional",
        addOns: { coverLetter: true, linkedin: false },
        total: 249,
        status: "Drafting",
        date: new Date().toISOString().split('T')[0],
        daysRemaining: 7,
        escrowStatus: "held"
      });
      
      setIsLoading(false);
      navigate("/dashboard");
    }, 2000);
  };

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
                <div>
                  <h3 className="font-medium">Professional Package</h3>
                  <p className="text-sm text-muted-foreground">For mid-level professionals</p>
                </div>
                <p className="font-bold">$199.00</p>
              </div>
              
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">Cover Letter Add-on</h3>
                  <p className="text-sm text-muted-foreground">Targeted cover letter</p>
                </div>
                <p className="font-bold">$50.00</p>
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total</span>
                <span>$249.00</span>
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
                    <Input placeholder="John Doe" required />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Card Number</Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="0000 0000 0000 0000" className="pl-10" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Expiry Date</Label>
                      <Input placeholder="MM/YY" required />
                    </div>
                    <div className="space-y-2">
                      <Label>CVC</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="123" className="pl-10" required />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                   <div className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                         <div className="w-4 h-4 rounded-full border border-primary flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                         </div>
                         <span className="font-medium">Credit Card</span>
                      </div>
                      <div className="flex gap-2">
                         {/* Mock Icons */}
                         <div className="w-8 h-5 bg-slate-200 rounded" />
                         <div className="w-8 h-5 bg-slate-200 rounded" />
                      </div>
                   </div>
                </div>

                <Button className="w-full text-lg h-12" type="submit" disabled={isLoading}>
                  {isLoading ? "Processing..." : "Pay $249.00"}
                </Button>
                
                <p className="text-center text-xs text-muted-foreground">
                  By confirming your payment, you allow ProResumes.ca to charge your card for this payment and future payments in accordance with our terms.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
