/**
 * RegistrationFlow Component
 * Main registration screen with OAuth and magic link options
 * Story 1.1: User Registration - AC1
 */

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import './RegistrationFlow.css';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface RegistrationFlowProps {
    /** Called when authentication succeeds (before onComplete) */
    onAuthSuccess?: () => void;
    /** Called when entire registration/auth process completes */
    onComplete?: () => void;
}

export function RegistrationFlow({ onAuthSuccess, onComplete }: RegistrationFlowProps) {
    const { signInWithOAuth, sendMagicLink, isLoading, error } = useAuth();
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState<string | null>(null);
    const [magicLinkSent, setMagicLinkSent] = useState(false);
    const [magicLinkCooldown, setMagicLinkCooldown] = useState(false);

    const handleGoogleSignIn = async () => {
        try {
            await signInWithOAuth('google');
            onAuthSuccess?.();
            onComplete?.();
        } catch {
            // Error is handled by useAuth
        }
    };

    const handleAppleSignIn = async () => {
        try {
            await signInWithOAuth('apple');
            onAuthSuccess?.();
            onComplete?.();
        } catch {
            // Error is handled by useAuth
        }
    };

    const validateEmail = (emailToValidate: string): boolean => {
        if (!EMAIL_REGEX.test(emailToValidate)) {
            setEmailError('Please enter a valid email address');
            return false;
        }
        setEmailError(null);
        return true;
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        setEmailError(null);
        setMagicLinkSent(false);
    };

    // Check for existing cooldown on mount
    React.useEffect(() => {
        const cooldownEnd = localStorage.getItem('magicLinkCooldownEnd');
        if (cooldownEnd) {
            const remaining = parseInt(cooldownEnd, 10) - Date.now();
            if (remaining > 0) {
                setMagicLinkCooldown(true);
                setTimeout(() => {
                    setMagicLinkCooldown(false);
                    localStorage.removeItem('magicLinkCooldownEnd');
                }, remaining);
            } else {
                localStorage.removeItem('magicLinkCooldownEnd');
            }
        }
    }, []);

    const handleSendMagicLink = async () => {
        if (!validateEmail(email)) {
            return;
        }

        // Rate limiting: prevent spam requests
        if (magicLinkCooldown) {
            setEmailError('Please wait before requesting another magic link');
            return;
        }

        const result = await sendMagicLink(email);
        if (result.success) {
            setMagicLinkSent(true);

            // Start 30-second cooldown and persist it
            setMagicLinkCooldown(true);
            const cooldownDuration = 30000;
            const cooldownEnd = Date.now() + cooldownDuration;
            localStorage.setItem('magicLinkCooldownEnd', cooldownEnd.toString());

            setTimeout(() => {
                setMagicLinkCooldown(false);
                localStorage.removeItem('magicLinkCooldownEnd');
            }, cooldownDuration);
        }
    };

    return (
        <div className="registration-flow">
            <div className="registration-flow__header">
                <h1 className="registration-flow__title">Welcome to LifeOS</h1>
                <p className="registration-flow__subtitle">
                    Your personal AI coaching companion
                </p>
            </div>

            {isLoading && (
                <div
                    className="registration-flow__loading"
                    data-testid="auth-loading-indicator"
                >
                    <div className="registration-flow__spinner" />
                    <span>Authenticating...</span>
                </div>
            )}

            {error && (
                <div className="registration-flow__error" role="alert">
                    {error.message}
                </div>
            )}

            {magicLinkSent && (
                <div className="registration-flow__success" role="status">
                    Check your email! We've sent a magic link to <strong>{email}</strong>
                </div>
            )}

            <div className="registration-flow__oauth-buttons">
                <button
                    type="button"
                    className="registration-flow__oauth-button registration-flow__oauth-button--google"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    aria-label="Continue with Google"
                >
                    <svg className="registration-flow__oauth-icon" viewBox="0 0 24 24" aria-hidden="true">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span>Continue with Google</span>
                </button>

                <button
                    type="button"
                    className="registration-flow__oauth-button registration-flow__oauth-button--apple"
                    onClick={handleAppleSignIn}
                    disabled={isLoading}
                    aria-label="Continue with Apple"
                >
                    <svg className="registration-flow__oauth-icon" viewBox="0 0 24 24" aria-hidden="true">
                        <path fill="currentColor" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                    </svg>
                    <span>Continue with Apple</span>
                </button>
            </div>

            <div className="registration-flow__divider">
                <span>or</span>
            </div>

            <div className="registration-flow__email-form">
                <div className="registration-flow__input-group">
                    <label htmlFor="email" className="registration-flow__label">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        className={`registration-flow__input ${emailError ? 'registration-flow__input--error' : ''}`}
                        placeholder="you@example.com"
                        value={email}
                        onChange={handleEmailChange}
                        disabled={isLoading}
                        aria-label="Email"
                        aria-invalid={!!emailError}
                        aria-describedby={emailError ? 'email-error' : undefined}
                    />
                    {emailError && (
                        <p id="email-error" className="registration-flow__input-error" role="alert">
                            {emailError}
                        </p>
                    )}
                </div>

                <button
                    type="button"
                    className="registration-flow__magic-link-button"
                    onClick={handleSendMagicLink}
                    disabled={isLoading || !email}
                    aria-label="Send magic link"
                >
                    Send magic link
                </button>
            </div>

            <p className="registration-flow__terms">
                By continuing, you agree to our{' '}
                <a href="/terms">Terms of Service</a> and{' '}
                <a href="/privacy">Privacy Policy</a>
            </p>
        </div>
    );
}

export default RegistrationFlow;
