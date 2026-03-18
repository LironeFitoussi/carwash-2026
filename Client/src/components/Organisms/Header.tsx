import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuth0 } from '@auth0/auth0-react';
import { Menu, X, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LanguageToggle from '@/components/molecules/LanguageToggle';

const navLinks = [
    { key: 'navigation.dashboard', path: '/dashboard' },
    { key: 'navigation.appointments', path: '/appointments' },
    { key: 'navigation.clients', path: '/clients' },
    { key: 'navigation.workers', path: '/workers' },
];

export default function Header() {
    const { t } = useTranslation();
    const { logout } = useAuth0();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout({ logoutParams: { returnTo: window.location.origin + '/auth' } });
        navigate('/auth');
    };

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 font-bold text-lg text-blue-600">
                        <Car className="w-6 h-6" />
                        {t('app.title')}
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                            >
                                {t(link.key)}
                            </Link>
                        ))}
                    </nav>

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        <LanguageToggle />
                        <Button variant="outline" size="sm" onClick={handleLogout} className="hidden md:inline-flex">
                            {t('auth.logout')}
                        </Button>
                        {/* Mobile hamburger */}
                        <button
                            className="md:hidden p-2 rounded-md text-gray-600 hover:text-blue-600"
                            onClick={() => setMobileOpen(!mobileOpen)}
                        >
                            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-4 space-y-2">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className="block py-2 text-sm font-medium text-gray-600 hover:text-blue-600"
                            onClick={() => setMobileOpen(false)}
                        >
                            {t(link.key)}
                        </Link>
                    ))}
                    <Button variant="outline" size="sm" onClick={handleLogout} className="w-full mt-2">
                        {t('auth.logout')}
                    </Button>
                </div>
            )}
        </header>
    );
}
