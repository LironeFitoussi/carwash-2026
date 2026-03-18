import './i18n';
import i18n from 'i18next';

import { createBrowserRouter, RouterProvider } from "react-router";
import { Auth0Provider } from "@auth0/auth0-react";
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { createRoot } from "react-dom/client";

import "./index.css";
import { routes } from "./routes";
import { store } from "./redux/store";
import AppInitializer from "./components/AppInitializer";

// RTL support
i18n.on('languageChanged', (lng) => {
  document.documentElement.dir = lng === 'he' ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
});

const router = createBrowserRouter(routes);
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        scope: 'openid profile email',
      }}
    >
      <QueryClientProvider client={queryClient}>
        <AppInitializer>
          <RouterProvider router={router} />
        </AppInitializer>
        <ReactQueryDevtools initialIsOpen={false} />
        <Toaster position="top-right" richColors />
      </QueryClientProvider>
    </Auth0Provider>
  </Provider>
);
