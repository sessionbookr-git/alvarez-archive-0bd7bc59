import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import SerialLookup from "./pages/SerialLookup";
import Encyclopedia from "./pages/Encyclopedia";
import ModelDetail from "./pages/ModelDetail";
import Identify from "./pages/Identify";
import SubmitGuitar from "./pages/SubmitGuitar";
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
