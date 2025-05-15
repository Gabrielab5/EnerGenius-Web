
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { DeviceProvider } from "./contexts/DeviceContext";
import { ConsumptionProvider } from "./contexts/ConsumptionContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AppLayout } from "./components/layout/AppLayout";
import { RequireAuth } from "./components/auth/RequireAuth";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import LoadingPage from "./pages/LoadingPage";
import OnboardingPage from "./pages/OnboardingPage";
import UploadPage from "./pages/UploadPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <AuthProvider>
          <DeviceProvider>
            <ConsumptionProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/loading" element={<LoadingPage />} />
                <Route path="/terms-of-service" element={<TermsOfServicePage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                
                <Route element={<AppLayout />}>
                  <Route 
                    path="/" 
                    element={
                      <RequireAuth>
                        <HomePage />
                      </RequireAuth>
                    } 
                  />
                  <Route 
                    path="/onboarding" 
                    element={
                      <RequireAuth>
                        <OnboardingPage />
                      </RequireAuth>
                    } 
                  />
                  <Route 
                    path="/upload" 
                    element={
                      <RequireAuth>
                        <UploadPage />
                      </RequireAuth>
                    } 
                  />
                  <Route 
                    path="/settings" 
                    element={
                      <RequireAuth>
                        <SettingsPage />
                      </RequireAuth>
                    } 
                  />
                </Route>
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ConsumptionProvider>
          </DeviceProvider>
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
