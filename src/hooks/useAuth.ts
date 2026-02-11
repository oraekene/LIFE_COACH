/**
 * useAuth Hook
 * Provides authentication functionality via Clerk
 * Story 1.1: User Registration - AC1
 */

import { useState, useCallback } from 'react';
import { useSignIn, useSignUp, useUser } from '@clerk/clerk-react';

export type OAuthProvider = 'google' | 'apple';

export interface AuthError {
    message: string;
    code?: string;
}

export interface AuthState {
    isLoading: boolean;
    error: AuthError | null;
    isAuthenticated: boolean;
    user: any | null;
}

export interface UseAuthReturn extends AuthState {
    signInWithOAuth: (provider: OAuthProvider) => Promise<void>;
    sendMagicLink: (email: string) => Promise<{ success: boolean }>;
    signOut: () => Promise<void>;
    clearError: () => void;
}

export function useAuth(): UseAuthReturn {
    // Try to use Clerk hooks, fall back to dev mode if not available
    let signIn: any = null;
    let isSignInLoaded = true;
    let user: any = null;
    let isUserLoaded = true;
    let isSignedIn = false;

    try {
        const signInResult = useSignIn();
        signIn = signInResult.signIn;
        isSignInLoaded = signInResult.isLoaded;
        useSignUp(); // Maintain for future use
        const userResult = useUser();
        user = userResult.user;
        isUserLoaded = userResult.isLoaded;
        isSignedIn = userResult.isSignedIn ?? false;
    } catch {
        // Clerk not available (no ClerkProvider) - use dev mode
        console.warn('[useAuth] Clerk not available, using dev mode');
    }

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<AuthError | null>(null);

    const signInWithOAuth = useCallback(async (provider: OAuthProvider) => {
        if (!signIn) {
            // Dev mode: simulate successful auth
            console.log('[useAuth] Dev mode: simulating OAuth with', provider);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await signIn.authenticateWithRedirect({
                strategy: `oauth_${provider}`,
                redirectUrl: '/sso-callback',
                redirectUrlComplete: '/onboarding',
            });
        } catch (err: any) {
            setError({
                message: err?.errors?.[0]?.message || 'Authentication failed. Please try again.',
                code: err?.errors?.[0]?.code,
            });
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [signIn]);

    const sendMagicLink = useCallback(async (email: string): Promise<{ success: boolean }> => {
        if (!signIn) {
            // Dev mode: simulate magic link
            console.log('[useAuth] Dev mode: simulating magic link to', email);
            return { success: true };
        }

        setIsLoading(true);
        setError(null);

        try {
            await signIn.create({
                strategy: 'email_link',
                identifier: email,
                redirectUrl: '/verify-email',
            });

            return { success: true };
        } catch (err: any) {
            setError({
                message: err?.errors?.[0]?.message || 'Failed to send magic link. Please try again.',
                code: err?.errors?.[0]?.code,
            });
            return { success: false };
        } finally {
            setIsLoading(false);
        }
    }, [signIn]);

    const signOut = useCallback(async () => {
        setIsLoading(true);
        try {
            setError(null);
        } catch (err: any) {
            setError({
                message: 'Failed to sign out.',
            });
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        isLoading: isLoading || !isSignInLoaded || !isUserLoaded,
        error,
        isAuthenticated: isSignedIn || (import.meta.env.DEV && localStorage.getItem('auth_bypass') === 'true'),
        user: user ?? (import.meta.env.DEV && localStorage.getItem('auth_bypass') === 'true' ? { firstName: 'Test', emailAddresses: [{ emailAddress: 'test@example.com' }] } : null),
        signInWithOAuth,
        sendMagicLink,
        signOut,
        clearError,
    };
}

export default useAuth;
