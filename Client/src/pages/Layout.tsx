import { useEffect, useState } from "react";
import { Outlet } from "react-router";
import { useAuth0 } from "@auth0/auth0-react";
import { Link, useLocation } from "react-router";
import { Menu, X, Car, LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { useAppSelector } from "@/redux/hooks";
import { getSidebarMenuItems, routeConfig } from "@/config/routesConfig";
import LanguageToggle from "@/components/molecules/LanguageToggle";
import { Button } from "@/components/ui/button";

export default function Layout() {
    const { user } = useAppSelector((state) => state.user);
    const { logout } = useAuth0();
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const isRtl = i18n.language === "he";

    // Lock body scroll when mobile sidebar is open
    useEffect(() => {
        if (sidebarOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [sidebarOpen]);

    // If we have a user in Redux, they are authenticated — use that as truth
    const menuItems = getSidebarMenuItems(routeConfig, !!user, user?.role);

    const isActive = (path?: string) => path && location.pathname === path;
    const isParentActive = (subMenus?: { path: string }[]) =>
        subMenus?.some((s) => location.pathname.startsWith(s.path)) ?? false;

    const handleLogout = () =>
        logout({ logoutParams: { returnTo: window.location.origin + "/auth" } });

    const NavLinks = ({ onClick }: { onClick?: () => void }) => (
        <>
            {menuItems.map((item) => {
                const active = isActive(item.path) || isParentActive(item.subMenus?.map((s) => ({ path: s.path })));
                return (
                    <div key={item.label}>
                        {item.path ? (
                            <Link
                                to={item.path}
                                onClick={onClick}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    active
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                }`}
                            >
                                {item.icon}
                                {t(`navigation.${item.label.toLowerCase()}`)}
                            </Link>
                        ) : (
                            <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-2">
                                {t(`navigation.${item.label.toLowerCase()}`)}
                            </p>
                        )}
                        {item.subMenus && (
                            <div className="ms-4 mt-1 space-y-1">
                                {item.subMenus.map((sub) => (
                                    <Link
                                        key={sub.path}
                                        to={sub.path}
                                        onClick={onClick}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                            location.pathname === sub.path
                                                ? "bg-blue-50 text-blue-700 font-medium"
                                                : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                                        }`}
                                    >
                                        {t(`sidebar.${sub.label}`)}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </>
    );

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Outlet />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex" dir={isRtl ? "rtl" : "ltr"}>
            {/* ── Sidebar (desktop) ── */}
            <aside className="hidden md:flex flex-col w-64 shrink-0 bg-white border-e border-gray-200 sticky top-0 h-screen z-30 overflow-y-auto">
                {/* Logo */}
                <Link to="/dashboard" className="h-16 flex items-center gap-2 px-5 border-b border-gray-200 font-bold text-lg text-blue-600">
                    <Car className="w-5 h-5" />
                    {t("app.title")}
                </Link>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                    <NavLinks />
                </nav>

                {/* User footer */}
                <div className="border-t border-gray-200 p-4 space-y-3">
                    <div className="flex items-center gap-3">
                        {user.profilePicture ? (
                            <img src={user.profilePicture} alt={user.firstName} className="w-9 h-9 rounded-full border border-gray-200" />
                        ) : (
                            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                                {user.firstName?.[0]}{user.lastName?.[0]}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{user.firstName} {user.lastName}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <LanguageToggle />
                        <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={handleLogout}>
                            <LogOut className="w-3.5 h-3.5" />
                            {t("auth.logout")}
                        </Button>
                    </div>
                </div>
            </aside>

            {/* ── Mobile sidebar overlay ── */}
            <AnimatePresence>
                {sidebarOpen && (
                    <div className="fixed inset-0 z-40 md:hidden overscroll-contain">
                        <motion.div
                            className="absolute inset-0 bg-black/40 touch-none"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setSidebarOpen(false)}
                        />
                        <motion.aside
                            className="absolute inset-y-0 w-72 bg-white flex flex-col shadow-xl overscroll-contain"
                            style={{ [isRtl ? "right" : "left"]: 0 }}
                            initial={{ x: isRtl ? "100%" : "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: isRtl ? "100%" : "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        >
                            <div className="h-14 flex items-center justify-between px-5 border-b border-gray-200">
                                <Link to="/dashboard" className="flex items-center gap-2 font-bold text-blue-600" onClick={() => setSidebarOpen(false)}>
                                    <Car className="w-5 h-5" />
                                    {t("app.title")}
                                </Link>
                                <button type="button" title={t("common.close")} onClick={() => setSidebarOpen(false)}>
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                                <NavLinks onClick={() => setSidebarOpen(false)} />
                            </nav>
                            <div className="border-t border-gray-200 p-4 space-y-3">
                                <div className="flex items-center gap-2">
                                    <LanguageToggle />
                                    <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={handleLogout}>
                                        <LogOut className="w-3.5 h-3.5" />
                                        {t("auth.logout")}
                                    </Button>
                                </div>
                            </div>
                        </motion.aside>
                    </div>
                )}
            </AnimatePresence>

            {/* ── Main area ── */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Mobile top bar */}
                <header className="md:hidden sticky top-0 z-20 bg-white border-b border-gray-200 h-14 flex items-center justify-between px-4">
                    <button type="button" title="Open menu" onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100">
                        <Menu className="w-5 h-5" />
                    </button>
                    <Link to="/dashboard" className="flex items-center gap-1.5 font-bold text-blue-600 text-sm">
                        <Car className="w-4 h-4" />
                        {t("app.title")}
                    </Link>
                    <LanguageToggle />
                </header>

                <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
