import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { RoleBasedRedirect } from "@/components/auth/RoleBasedRedirect";
import { MainLayout } from "@/components/layout/MainLayout";
import Index from "./pages/Index";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import Team from "./pages/Team";
import Settings from "./pages/Settings";
import Meetings from "./pages/Meetings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Confluence from "./pages/Confluence";
import ClientManagement from "./pages/ClientManagement";
import ClientDashboard from "./pages/ClientDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected routes with MainLayout */}
            <Route element={
              <AuthGuard>
                <MainLayout />
              </AuthGuard>
            }>
              <Route path="/" element={
                <RoleBasedRedirect>
                  <Index />
                </RoleBasedRedirect>
              } />
              <Route path="/client-dashboard" element={<ClientDashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/team" element={<Team />} />
              <Route path="/clients" element={<ClientManagement />} />
              <Route path="/confluence" element={<Confluence />} />
              <Route path="/meetings" element={<Meetings />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
