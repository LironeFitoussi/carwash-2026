import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchUser } from '../redux/slices/userSlice';
import { useAuth0 } from '@auth0/auth0-react';
import type { Auth0User } from '@/types';
import { setTokenProvider } from '@/services/api';
import { LoadingSpinner } from '@/components/atoms';

interface AppInitializerProps {
  children: React.ReactNode;
}

const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.user);
  const { isAuthenticated, user, getAccessTokenSilently, isLoading: auth0Loading } = useAuth0();

  useEffect(() => {
    if (!auth0Loading && isAuthenticated && user) {
      // Register a token provider so every API request gets a fresh token.
      // getAccessTokenSilently caches the token and refreshes it automatically.
      setTokenProvider(() =>
        getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
            scope: 'openid profile email',
          },
        })
      );

      // Fetch (or create) the user record in MongoDB
      dispatch(fetchUser({ userData: user as Auth0User }));
    }
  }, [dispatch, isAuthenticated, user, getAccessTokenSilently, auth0Loading]);

  if (auth0Loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Initializing authentication..." />
      </div>
    );
  }

  if (isAuthenticated && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Loading user data..." />
      </div>
    );
  }

  if (error && isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Failed to load user</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              if (user) dispatch(fetchUser({ userData: user as Auth0User }));
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AppInitializer;
