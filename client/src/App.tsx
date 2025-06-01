import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import PortfolioDetail from "@/pages/PortfolioDetail";
import CaseStudyDetail from "@/pages/CaseStudyDetail";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import ManagePortfolio from "@/pages/admin/ManagePortfolio";
import ManageCaseStudies from "@/pages/admin/ManageCaseStudies";
import ViewMessages from "@/pages/admin/ViewMessages";
import AdminSettings from "@/pages/admin/AdminSettings";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={isAuthenticated ? Home : Landing} />
      <Route path="/portfolio/:id" component={PortfolioDetail} />
      <Route path="/case-studies/:id" component={CaseStudyDetail} />
      
      {/* Admin routes - protected */}
      {isAuthenticated && (
        <>
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin/portfolio" component={ManagePortfolio} />
          <Route path="/admin/case-studies" component={ManageCaseStudies} />
          <Route path="/admin/messages" component={ViewMessages} />
          <Route path="/admin/settings" component={AdminSettings} />
        </>
      )}
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
