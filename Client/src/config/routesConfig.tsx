import type { ComponentType, ReactNode } from "react";
import { Calendar, Users, UserCheck, LayoutDashboard } from "lucide-react";
import type { SVGProps } from "react";

import Auth from "../pages/Auth";
import Dashboard from "../pages/Dashboard";
import Appointments from "../pages/Appointments";
import AddAppointment from "../pages/AddAppointment";
import Clients from "../pages/Clients";
import NewClient from "../pages/NewClient";
import Workers from "../pages/Workers";
import AddWorker from "../pages/AddWorker";

// Type for Lucide icons
export type LucideIcon = ComponentType<SVGProps<SVGSVGElement>>;

// Define RouteObject type locally - compatible with react-router
export type RouteObject = {
  path?: string;
  index?: boolean;
  Component?: ComponentType;
  loader?: () => Promise<unknown> | unknown;
  children?: RouteObject[];
};

export interface RouteConfig {
  path: string;
  name: string;
  Component?: ComponentType;
  loader?: () => Promise<unknown> | unknown;
  icon?: LucideIcon;
  showInSidebar?: boolean;
  requireAuth?: boolean;
  requiredRole?: string;
  index?: boolean;
  children?: RouteConfig[];
}

// Define all routes in one place
export const routeConfig: RouteConfig[] = [
  {
    path: "/auth",
    name: "Auth",
    Component: Auth,
    showInSidebar: false,
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    Component: Dashboard,
    icon: LayoutDashboard,
    showInSidebar: true,
    requireAuth: true,
  },
  {
    path: "/appointments",
    name: "Appointments",
    icon: Calendar,
    showInSidebar: true,
    requireAuth: true,
    children: [
      {
        path: "/appointments",
        name: "All Appointments",
        Component: Appointments,
        showInSidebar: true,
        index: true,
      },
      {
        path: "new",
        name: "Add Appointment",
        Component: AddAppointment,
        showInSidebar: true,
      },
    ],
  },
  {
    path: "/clients",
    name: "Clients",
    icon: Users,
    showInSidebar: true,
    requireAuth: true,
    children: [
      {
        path: "/clients",
        name: "All Clients",
        Component: Clients,
        showInSidebar: true,
        index: true,
      },
      {
        path: "new",
        name: "New Client",
        Component: NewClient,
        showInSidebar: true,
      },
    ],
  },
  {
    path: "/workers",
    name: "Workers",
    icon: UserCheck,
    showInSidebar: true,
    requireAuth: true,
    children: [
      {
        path: "/workers",
        name: "All Workers",
        Component: Workers,
        showInSidebar: true,
        index: true,
      },
      {
        path: "new",
        name: "Add Worker",
        Component: AddWorker,
        showInSidebar: true,
      },
    ],
  },
];

// Convert route config to React Router format
export function convertToRouterRoutes(config: RouteConfig[]): RouteObject[] {
  return config.map((route) => {
    // Handle index routes - they shouldn't have a path
    if (route.index) {
      return {
        index: true as const,
        Component: route.Component,
        loader: route.loader,
        children: route.children && route.children.length > 0
          ? convertToRouterRoutes(route.children)
          : undefined,
      } as RouteObject;
    }

    return {
      path: route.path,
      Component: route.Component,
      loader: route.loader,
      children: route.children && route.children.length > 0
        ? convertToRouterRoutes(route.children)
        : undefined,
    } as RouteObject;
  });
}

// Get sidebar menu items from route config
export interface SidebarMenuItem {
  label: string;
  path?: string;
  icon?: ReactNode;
  subMenus?: SidebarSubMenuItem[];
  requireAuth?: boolean;
  requiredRole?: string;
}

export interface SidebarSubMenuItem {
  label: string;
  path: string;
  requireAuth?: boolean;
  requiredRole?: string;
}

// Helper function to resolve full path for nested routes
function resolvePath(childPath: string, parentPath: string): string {
  if (childPath.startsWith("/")) {
    return childPath;
  }
  const parentBase = parentPath.endsWith("/") ? parentPath.slice(0, -1) : parentPath;
  return `${parentBase}/${childPath}`;
}

export function getSidebarMenuItems(
  config: RouteConfig[],
  isAuthenticated: boolean = false,
  userRole?: string
): SidebarMenuItem[] {
  const menuItems: SidebarMenuItem[] = [];

  config.forEach((route) => {
    if (!route.showInSidebar) return;
    if (route.requireAuth && !isAuthenticated) return;
    if (route.requiredRole && userRole !== route.requiredRole) return;

    const sidebarChildren = route.children?.filter((child) => child.showInSidebar);

    if (sidebarChildren && sidebarChildren.length > 0) {
      const subMenus: SidebarSubMenuItem[] = sidebarChildren
        .filter((child) => {
          if (child.requireAuth && !isAuthenticated) return false;
          if (child.requiredRole && userRole !== child.requiredRole) return false;
          return true;
        })
        .map((child) => {
          let childPath = child.path;
          if (child.index) {
            childPath = route.path;
          } else {
            childPath = resolvePath(child.path, route.path);
          }
          return {
            label: child.name,
            path: childPath,
            requireAuth: child.requireAuth,
            requiredRole: child.requiredRole,
          };
        });

      menuItems.push({
        label: route.name,
        path: route.Component ? route.path : undefined,
        icon: route.icon ? <route.icon className="w-5 h-5" /> : undefined,
        subMenus: subMenus.length > 0 ? subMenus : undefined,
        requireAuth: route.requireAuth,
        requiredRole: route.requiredRole,
      });
    } else if (route.Component) {
      menuItems.push({
        label: route.name,
        path: route.path,
        icon: route.icon ? <route.icon className="w-5 h-5" /> : undefined,
        requireAuth: route.requireAuth,
        requiredRole: route.requiredRole,
      });
    }
  });

  return menuItems;
}
