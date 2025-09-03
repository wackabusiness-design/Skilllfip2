import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import BrowseSkills from "@/pages/browse-skills";
import CreatorProfile from "@/pages/creator-profile";
import ListSkill from "@/pages/list-skill";
import Booking from "@/pages/booking";
import FlipNights from "@/pages/flip-nights";
import About from "@/pages/about";
import Dashboard from "@/pages/dashboard";
import Admin from "@/pages/admin";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/browse" component={BrowseSkills} />
          <Route path="/creator/:id" component={CreatorProfile} />
          <Route path="/flip-nights" component={FlipNights} />
          <Route path="/about" component={About} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/browse" component={BrowseSkills} />
          <Route path="/creator/:id" component={CreatorProfile} />
          <Route path="/list-skill" component={ListSkill} />
          <Route path="/booking/:skillId" component={Booking} />
          <Route path="/flip-nights" component={FlipNights} />
          <Route path="/about" component={About} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/admin" component={Admin} />
        </>
      )}
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
