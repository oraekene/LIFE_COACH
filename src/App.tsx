/**
 * App.tsx
 * Main Application Component with Routing
 * Story 2.1: Browse Coaches
 */

import { useState, useEffect } from 'react';
import { StorageProvider, useStorage } from './providers/StorageProvider';
import { RegistrationContainer } from './features/auth';
import { Dashboard } from './features/dashboard/Dashboard';

type AppView = 'loading' | 'onboarding' | 'dashboard';

function AppContent() {
    const { isReady, getItem, unlock } = useStorage();
    const [view, setView] = useState<AppView>('loading');
    const [isCheckingProfile, setIsCheckingProfile] = useState(true);

    // Auto-unlock storage for development (TODO: implement proper passphrase UI)
    useEffect(() => {
        if (!isReady) {
            unlock('dev-passphrase');
        }
    }, [isReady, unlock]);

    useEffect(() => {
        const checkUserProfile = async () => {
            if (!isReady) return;

            try {
                const profile = await getItem<any>('user_profile', 'current');
                if (profile && profile.displayName) {
                    setView('dashboard');
                } else {
                    setView('onboarding');
                }
            } catch (error) {
                console.error('Failed to check profile:', error);
                setView('onboarding');
            } finally {
                setIsCheckingProfile(false);
            }
        };

        checkUserProfile();
    }, [isReady, getItem]);

    const handleOnboardingComplete = () => {
        setView('dashboard');
    };

    if (view === 'loading' || isCheckingProfile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-neutral-600">Loading LifeOS Coach...</p>
                </div>
            </div>
        );
    }

    if (view === 'onboarding') {
        return <RegistrationContainer onComplete={handleOnboardingComplete} />;
    }

    return <Dashboard />;
}

export default function App() {
    return (
        <StorageProvider>
            <AppContent />
        </StorageProvider>
    );
}
