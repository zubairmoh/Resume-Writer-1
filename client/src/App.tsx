import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/lib/store";
import { AuthProvider } from "@/lib/auth";

// Page Imports - Matching your file list exactly
import { LandingPage } from "./pages/Landing";
import { DashboardPage } from "./pages/Dashboard";
import { AdminPage } from "./pages/Admin";
import { WriterPage } from "./pages/Writer";
import { LoginPage } from "./pages/Login";
import { SignupPage } from "./pages/Signup";
import { CheckoutPage } from "./pages/Checkout";
import { LegalPage } from "./pages/Legal";
import NotFound from "./pages/not-found"; // Note: lowercase per your logs
import { ProtectedRoute } from "./pages/ProtectedRoute";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppProvider>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                
                {/* Legal pages often use the same component with different content */}
                <Route path="/privacy" element={<LegalPage />} />
                <Route path="/terms" element={<LegalPage />} />
                <Route path="/cookie-policy" element={<LegalPage />} />

                {/* Protected User Routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  } 
                />
                 <Route 
                  path="/my-dashboard" 
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/checkout" 
                  element={
                    <ProtectedRoute>
                      <CheckoutPage />
                    </ProtectedRoute>
                  } 
                />

                {/* Role-Specific Protected Routes */}
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminPage />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/writer" 
                  element={
                    <ProtectedRoute allowedRoles={["writer"]}>
                      <WriterPage />
                    </ProtectedRoute>
                  } 
                />

                {/* Fallback */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AppProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

// CRITICAL: This default export fixes the "MISSING_EXPORT" error in main.tsx
export default App;
