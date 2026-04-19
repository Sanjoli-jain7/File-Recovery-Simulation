import React from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Layout } from "./components/layout";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Pages
import Dashboard from "./pages/dashboard";
import Filesystem from "./pages/filesystem";
import Access from "./pages/access";
import Crash from "./pages/crash";
import Recovery from "./pages/recovery";
import Optimization from "./pages/optimization";
import Logs from "./pages/logs";
import NotFound from "./pages/not-found";

const queryClient = new QueryClient();

// In index.html we must make sure dark class is applied to html or body
// We'll just enforce it in the Layout component or via tailwind if we have control.

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/filesystem" component={Filesystem} />
        <Route path="/access" component={Access} />
        <Route path="/crash" component={Crash} />
        <Route path="/recovery" component={Recovery} />
        <Route path="/optimization" component={Optimization} />
        <Route path="/logs" component={Logs} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  // Force dark mode on body
  React.useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
