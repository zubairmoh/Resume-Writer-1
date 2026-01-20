import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/lib/store";
import { AuthProvider, useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

// Page Imports
import { LandingPage } from "./pages/Landing";
import { DashboardPage } from "./pages/Dashboard";
import { AdminPage } from "./pages/Admin";
import { WriterPage } from "./pages/Writer";
import { LoginPage } from "./pages/Login";
import { SignupPage } from "./pages/Signup";
import { CheckoutPage } from "./pages/Checkout";
import { LegalPage } from "./pages/Legal";
import NotFound from "./pages/not-found";
import { ProtectedRoute } from "./pages/ProtectedRoute";
import { Navigate } from "react-router-dom";

// Role-based dashboard router - redirects to the correct dashboard based on user role
function RoleBasedDashboard() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect based on role
  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'writer':
      return <Navigate to="/writer" replace />;
    case 'client':
    default:
      return <Navigate to="/dashboard" replace />;
  }
}

function ImpersonationBanner() {
  const { user, stopImpersonating } = useAuth();
  
  // We check if the session has an originalAdminId by calling stopImpersonating's logic
  // But a simpler way is to check if the user object has a flag or just let the admin know.
  // For now, we'll show it if the user is logged in and we're in a "God Mode" session.
  // In a real app, you'd return this from the /me endpoint.
  if (!user || !(user as any).isImpersonated) return null;

  return (
    <div className="bg-amber-500 text-white py-2 px-4 flex items-center justify-between sticky top-0 z-[100] shadow-md">
      <div className="flex items-center gap-2 text-sm font-medium">
        <AlertCircle className="w-4 h-4" />
        You are currently impersonating <strong>{user.fullName}</strong> ({user.role})
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        className="bg-white/20 border-white/40 hover:bg-white/30 text-white h-8"
        onClick={() => {
          stopImpersonating().then(() => {
            window.location.href = "/admin";
          });
        }}
      >
        Stop Impersonating
      </Button>
    </div>
  );
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <ImpersonationBanner />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
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
              <RoleBasedDashboard />
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
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppProvider>
          <TooltipProvider>
            <Toaster />
            <AppRoutes />
          </TooltipProvider>
        </AppProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
