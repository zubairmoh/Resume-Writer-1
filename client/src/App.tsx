// ... keep existing imports and add:
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
                <Route path="/privacy" element={<LegalPage />} />
                <Route path="/terms" element={<LegalPage />} />
                <Route path="/cookie-policy" element={<LegalPage />} />

                {/* Protected User Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute><DashboardPage /></ProtectedRoute>
                } />
                <Route path="/checkout" element={
                  <ProtectedRoute><CheckoutPage /></ProtectedRoute>
                } />

                {/* Role-Specific Protected Routes */}
                <Route path="/admin" element={
                  <ProtectedRoute allowedRoles={["admin"]}><AdminPage /></ProtectedRoute>
                } />
                <Route path="/writer" element={
                  <ProtectedRoute allowedRoles={["writer"]}><WriterPage /></ProtectedRoute>
                } />

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
