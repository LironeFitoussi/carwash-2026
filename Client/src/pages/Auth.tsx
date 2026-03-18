import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth0 } from '@auth0/auth0-react';
import { useTranslation } from 'react-i18next';
import { Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/redux/hooks';

export default function Auth() {
    const { t } = useTranslation();
    const { loginWithRedirect, isLoading: auth0Loading } = useAuth0();
    const { user, loading: userLoading } = useAppSelector((state) => state.user);
    const navigate = useNavigate();

    // Only redirect when we're sure the user is fully loaded
    useEffect(() => {
        if (user && !userLoading) {
            navigate('/dashboard', { replace: true });
        }
    }, [user, userLoading, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white rounded-2xl border shadow-sm p-10 w-full max-w-sm text-center space-y-6">
                <div className="flex flex-col items-center gap-3">
                    <div className="bg-blue-100 rounded-full p-4">
                        <Car className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('app.title')}</h1>
                    <p className="text-sm text-gray-500">{t('auth.subtitle')}</p>
                </div>

                <Button
                    className="w-full"
                    onClick={() => loginWithRedirect()}
                    disabled={auth0Loading}
                >
                    {auth0Loading ? t('common.loading') : t('auth.login')}
                </Button>
            </div>
        </div>
    );
}
