import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Weather from "@/pages/Weather";
import Health from "@/pages/Health";
import Climate from "@/pages/Climate";
import Activities from "@/pages/Activities";
import Community from "@/pages/Community";
import { useState, useEffect } from "react";
import { UserProvider } from "./components/UserContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/weather" component={Weather} />
      <Route path="/health" component={Health} />
      <Route path="/climate" component={Climate} />
      <Route path="/activities" component={Activities} />
      <Route path="/community" component={Community} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <Router />
        <Toaster />
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;
