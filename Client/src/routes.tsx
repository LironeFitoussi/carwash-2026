import type { RouteObject as ReactRouterRouteObject } from "react-router";
import { Navigate } from "react-router";
import { routeConfig, convertToRouterRoutes } from "./config/routesConfig";
import Layout from "./pages/Layout";

const childRoutes = convertToRouterRoutes(routeConfig) as ReactRouterRouteObject[];

export const routes: ReactRouterRouteObject[] = [
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      ...childRoutes,
    ],
  },
];
