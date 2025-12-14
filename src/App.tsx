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
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSubmissions from "./pages/admin/AdminSubmissions";
import AdminModels from "./pages/admin/AdminModels";
import AdminPatterns from "./pages/admin/AdminPatterns";
import AdminFeatures from "./pages/admin/AdminFeatures";
import AdminImport from "./pages/admin/AdminImport";
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
            <Route path="/auth" element={<Auth />} />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/submissions" element={<AdminRoute><AdminSubmissions /></AdminRoute>} />
            <Route path="/admin/models" element={<AdminRoute><AdminModels /></AdminRoute>} />
            <Route path="/admin/patterns" element={<AdminRoute><AdminPatterns /></AdminRoute>} />
            <Route path="/admin/features" element={<AdminRoute><AdminFeatures /></AdminRoute>} />
            <Route path="/admin/import" element={<AdminRoute><AdminImport /></AdminRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
