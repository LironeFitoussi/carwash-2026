import { Navigate } from 'react-router';
import { useAppSelector } from '@/redux/hooks';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
    children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user } = useAppSelector((state) => state.user);

    if (!user) {
        return <Navigate to="/auth" replace />;
    }

    return <>{children}</>;
}
