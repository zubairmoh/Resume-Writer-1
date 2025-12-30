import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/lib/store";
import { AuthProvider } from "@/lib/auth";

import { LandingPage } from "@/pages/Landing";
import { DashboardPage } from "@/pages/Dashboard";
import { AdminPage } from "@/pages/Admin";
import { WriterPage } from "@/pages/Writer";
import { LoginPage } from "@/pages/Login";
import { SignupPage } from "@/pages/Signup";
import { CheckoutPage } from "@/pages/Checkout";
import { LegalPage } from "@/pages/Legal";
import CustomizableDashboard from "@/pages/CustomizableDashboard";
import NotFound from "@/pages/not-found";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppProvider>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/my-dashboard" element={<CustomizableDashboard />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/writer" element={<WriterPage />} />
                <Route path="/privacy" element={<LegalPage />} />
                <Route path="/terms" element={<LegalPage />} />
                <Route path="/cookie-policy" element={<LegalPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AppProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
