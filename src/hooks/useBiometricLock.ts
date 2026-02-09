/**
 * useBiometricLock Hook
 * Provides biometric authentication functionality (FaceID/Fingerprint)
 * Story 1.1: User Registration - AC4
 */

import { useState, useCallback, useEffect } from 'react';

export type BiometricType = 'FaceID' | 'Fingerprint' | null;

export interface BiometricSupportResult {
    supported: boolean;
    types: BiometricType[];
}

export interface UseBiometricLockReturn {
    isSupported: boolean;
    biometricType: BiometricType;
    isEnabled: boolean;
    isFirstSession: boolean;
    checkSupport: () => Promise<BiometricSupportResult>;
    enable: (options?: { persistToSecureStorage?: boolean }) => Promise<{ success: boolean }>;
    disable: () => Promise<{ success: boolean }>;
    authenticate: () => Promise<{ success: boolean }>;
}

// Storage key for biometric preferences
// SECURITY NOTE: localStorage is not secure against XSS attacks.
// TODO (Story 1.2): Migrate to encrypted IndexedDB or native SecureStorage
// when implementing Privacy-First Data Storage.
const BIOMETRIC_ENABLED_KEY = 'lifeos_biometric_enabled';
const FIRST_SESSION_KEY = 'lifeos_first_session_complete';

export function useBiometricLock(): UseBiometricLockReturn {
    const [isSupported, setIsSupported] = useState(false);
    const [biometricType, setBiometricType] = useState<BiometricType>(null);
    const [isEnabled, setIsEnabled] = useState(false);
    const [isFirstSession, setIsFirstSession] = useState(true);

    // Check if biometric is supported on this device
    const checkSupport = useCallback(async (): Promise<BiometricSupportResult> => {
        try {
            // Check for Web Authentication API support
            if (window.PublicKeyCredential) {
                const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();

                if (available) {
                    // Detect platform for biometric type
                    const userAgent = navigator.userAgent.toLowerCase();
                    let type: BiometricType = null;

                    if (/iphone|ipad|ipod/.test(userAgent) || /mac/.test(userAgent)) {
                        type = 'FaceID';
                    } else if (/android/.test(userAgent) || /windows/.test(userAgent)) {
                        type = 'Fingerprint';
                    }

                    setIsSupported(true);
                    setBiometricType(type);

                    return {
                        supported: true,
                        types: type ? [type] : [],
                    };
                }
            }

            setIsSupported(false);
            setBiometricType(null);
            return { supported: false, types: [] };
        } catch {
            setIsSupported(false);
            setBiometricType(null);
            return { supported: false, types: [] };
        }
    }, []);

    // Enable biometric lock
    const enable = useCallback(async (options?: { persistToSecureStorage?: boolean }): Promise<{ success: boolean }> => {
        try {
            if (!isSupported) {
                return { success: false };
            }

            // In a real implementation, this would register biometric credentials
            // For now, we store the preference
            if (options?.persistToSecureStorage ?? true) {
                localStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
            }

            setIsEnabled(true);
            return { success: true };
        } catch {
            return { success: false };
        }
    }, [isSupported]);

    // Disable biometric lock
    const disable = useCallback(async (): Promise<{ success: boolean }> => {
        try {
            localStorage.removeItem(BIOMETRIC_ENABLED_KEY);
            setIsEnabled(false);
            return { success: true };
        } catch {
            return { success: false };
        }
    }, []);

    // Authenticate using biometrics
    const authenticate = useCallback(async (): Promise<{ success: boolean }> => {
        try {
            if (!isSupported || !isEnabled) {
                return { success: false };
            }

            // In a real implementation, this would trigger biometric authentication
            // Using WebAuthn API
            const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
                challenge: crypto.getRandomValues(new Uint8Array(32)),
                timeout: 60000,
                userVerification: 'required',
                rpId: window.location.hostname,
            };

            const credential = await navigator.credentials.get({
                publicKey: publicKeyCredentialRequestOptions,
            });

            return { success: credential !== null };
        } catch (error) {
            // SECURITY: Never bypass authentication on error
            console.error('Biometric authentication failed:', error);
            return { success: false };
        }
    }, [isSupported, isEnabled]);

    // Initialize on mount
    useEffect(() => {
        // Check support on mount
        checkSupport();

        // Check if biometric is already enabled
        const storedEnabled = localStorage.getItem(BIOMETRIC_ENABLED_KEY);
        setIsEnabled(storedEnabled === 'true');

        // Check if this is the first session
        const firstSessionComplete = localStorage.getItem(FIRST_SESSION_KEY);
        setIsFirstSession(firstSessionComplete !== 'true');
    }, [checkSupport]);

    return {
        isSupported,
        biometricType,
        isEnabled,
        isFirstSession,
        checkSupport,
        enable,
        disable,
        authenticate,
    };
}

export default useBiometricLock;
