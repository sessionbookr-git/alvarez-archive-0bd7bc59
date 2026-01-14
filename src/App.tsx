import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import AdminRoute from "@/components/AdminRoute";
import Index from "./pages/Index";
import SerialLookup from "./pages/SerialLookup";
import Encyclopedia from "./pages/Encyclopedia";
import ModelDetail from "./pages/ModelDetail";
import Identify from "./pages/Identify";
import SubmitGuitar from "./pages/SubmitGuitar";
import Community from "./pages/Community";
import StoryDetail from "./pages/StoryDetail";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import MySubmissions from "./pages/MySubmissions";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSubmissions from "./pages/admin/AdminSubmissions";
import AdminModels from "./pages/admin/AdminModels";
import AdminPatterns from "./pages/admin/AdminPatterns";
import AdminFeatures from "./pages/admin/AdminFeatures";
import AdminImport from "./pages/admin/AdminImport";
import AdminInviteCodes from "./pages/admin/AdminInviteCodes";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import SubmitGuidelines from "./pages/SubmitGuidelines";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/lookup" element={<SerialLookup />} />
            <Route path="/encyclopedia" element={<Encyclopedia />} />
            <Route path="/encyclopedia/:modelId" element={<ModelDetail />} />
            <Route path="/identify" element={<Identify />} />
            <Route path="/submit" element={<SubmitGuitar />} />
            <Route path="/community" element={<Community />} />
            <Route path="/community/:id" element={<StoryDetail />} />
            <Route path="/submit-guidelines" element={<SubmitGuidelines />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/my-submissions" element={<MySubmissions />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/submissions" element={<AdminRoute><AdminSubmissions /></AdminRoute>} />
            <Route path="/admin/models" element={<AdminRoute><AdminModels /></AdminRoute>} />
            <Route path="/admin/patterns" element={<AdminRoute><AdminPatterns /></AdminRoute>} />
            <Route path="/admin/features" element={<AdminRoute><AdminFeatures /></AdminRoute>} />
            <Route path="/admin/import" element={<AdminRoute><AdminImport /></AdminRoute>} />
            <Route path="/admin/invite-codes" element={<AdminRoute><AdminInviteCodes /></AdminRoute>} />
            <Route path="/admin/analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
