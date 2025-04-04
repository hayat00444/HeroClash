import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Game from "@/pages/Game";
import { GameProvider } from "@/context/GameContext";

// Helper for GitHub Pages deployment - handles base path for repo-based hosting
const useHashLocation = () => {
  // Get the current hash location (excluding the '#' character)
  const getHashLocation = () => window.location.hash.replace("#", "") || "/";
  
  // State to store the current hash location
  const [location, setLocation] = useLocation();
  
  // Check if we need to use hash routing for GitHub Pages
  const isGitHubPages = import.meta.env.VITE_API_URL && !window.location.hostname.includes('localhost');
  
  if (!isGitHubPages) {
    return [location, setLocation];
  }
  
  const handleHashChange = () => {
    // Update location state with the new hash location
    setLocation(getHashLocation());
  };
  
  // Listen for hash changes
  window.addEventListener("hashchange", handleHashChange);
  
  // Return a cleanup function to remove the event listener
  return [getHashLocation(), (to: string) => {
    window.location.hash = to;
  }];
};

function Router() {
  // Use hash-based routing for GitHub Pages deployment
  const isGitHubPages = import.meta.env.VITE_API_URL && !window.location.hostname.includes('localhost');
  
  return (
    <Switch>
      <Route path="/" component={Game} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GameProvider>
        <Router />
        <Toaster />
      </GameProvider>
    </QueryClientProvider>
  );
}

export default App;
