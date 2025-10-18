import { BrowserRouter as Router } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import { ConfirmProvider } from "material-ui-confirm";
import { SnackbarProvider } from "notistack";
import { StyledEngineProvider } from "@mui/material/styles";
import { Helmet, HelmetProvider } from "react-helmet-async";
import ThemeProvider from "../ThemeProvider/ThemeProvider";
import Navigation from "../Navigation/Navigation";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

function App() {
  const queryClient = new QueryClient();

  return (
    <HelmetProvider>
      <Helmet>
        <title>Cubuzzle 2025</title>
      </Helmet>
      <Router>
        <QueryClientProvider client={queryClient}>
          <StyledEngineProvider injectFirst>
            <ThemeProvider>
              <SnackbarProvider anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
                <ConfirmProvider>
                  <CssBaseline />
                  <Navigation />
                </ConfirmProvider>
              </SnackbarProvider>
              <ReactQueryDevtools initialIsOpen={false} />
            </ThemeProvider>
          </StyledEngineProvider>
          <Analytics />
          <SpeedInsights />
        </QueryClientProvider>
      </Router>
    </HelmetProvider>
  );
}

export default App;
