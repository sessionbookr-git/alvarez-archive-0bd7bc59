import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import AdminRoute from "@/components/AdminRoute";
import BetaRoute from "@/components/BetaRoute";
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

import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminInviteCodes from "./pages/admin/AdminInviteCodes";
import AdminAccessRequests from "./pages/admin/AdminAccessRequests";
import SubmitGuidelines from "./pages/SubmitGuidelines";
import InviteLanding from "./pages/InviteLanding";
import InviteEntry from "./pages/InviteEntry";
import RequestAccess from "./pages/RequestAccess";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/lookup" element={<BetaRoute><SerialLookup /></BetaRoute>} />
            <Route path="/encyclopedia" element={<BetaRoute><Encyclopedia /></BetaRoute>} />
            <Route path="/encyclopedia/:modelId" element={<BetaRoute><ModelDetail /></BetaRoute>} />
            <Route path="/identify" element={<BetaRoute><Identify /></BetaRoute>} />
            <Route path="/submit" element={<BetaRoute><SubmitGuitar /></BetaRoute>} />
            <Route path="/community" element={<BetaRoute><Community /></BetaRoute>} />
            <Route path="/community/:id" element={<BetaRoute><StoryDetail /></BetaRoute>} />
            <Route path="/submit-guidelines" element={<BetaRoute><SubmitGuidelines /></BetaRoute>} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/my-submissions" element={<BetaRoute><MySubmissions /></BetaRoute>} />
            <Route path="/invite" element={<InviteEntry />} />
            <Route path="/invite/:code" element={<InviteLanding />} />
            <Route path="/request-access" element={<RequestAccess />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/submissions" element={<AdminRoute><AdminSubmissions /></AdminRoute>} />
            <Route path="/admin/models" element={<AdminRoute><AdminModels /></AdminRoute>} />
            <Route path="/admin/patterns" element={<AdminRoute><AdminPatterns /></AdminRoute>} />
            <Route path="/admin/features" element={<AdminRoute><AdminFeatures /></AdminRoute>} />
            <Route path="/admin/import" element={<AdminRoute><AdminImport /></AdminRoute>} />
            
            <Route path="/admin/analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
            <Route path="/admin/invite-codes" element={<AdminRoute><AdminInviteCodes /></AdminRoute>} />
            <Route path="/admin/access-requests" element={<AdminRoute><AdminAccessRequests /></AdminRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
