import { Switch, Route, Redirect } from "wouter";
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

function App() {
  // Redirect to /register when app loads directly at root path
  useEffect(() => {
    if (window.location.pathname === "/") {
      window.location.href = "/register";
    }
  }, []);

  return (
    <Switch>
      <Route path="/">
        <Redirect to="/register" />
      </Route>
      <Route path="/register" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;
