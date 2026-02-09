/**
 * ClerkAuthProvider
 * Wraps the app with Clerk authentication context
 * Story 1.1: User Registration - AC1
 */

import React, { ReactNode } from 'react';
import { ClerkProvider } from '@clerk/clerk-react';

interface ClerkAuthProviderProps {
    children: ReactNode;
}

// Clerk publishable key from environment
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';

export function ClerkAuthProvider({ children }: ClerkAuthProviderProps) {
    if (!CLERK_PUBLISHABLE_KEY) {
        // Dev mode: skip Clerk if key not configured
        console.warn(
            '[ClerkAuthProvider] VITE_CLERK_PUBLISHABLE_KEY not set. ' +
            'Running in dev mode without authentication.'
        );
        return <>{children}</>;
    }

    return (
        <ClerkProvider
            publishableKey={CLERK_PUBLISHABLE_KEY}
            appearance={{
                variables: {
                    colorPrimary: '#2D5A4A',
                    colorText: '#2A2722',
                    colorBackground: '#FAF9F7',
                    colorInputBackground: '#FFFFFF',
                    colorInputText: '#2A2722',
                    borderRadius: '0.5rem',
                    fontFamily: 'Inter, system-ui, sans-serif',
                },
            }}
        >
            {children}
        </ClerkProvider>
    );
}

export default ClerkAuthProvider;
