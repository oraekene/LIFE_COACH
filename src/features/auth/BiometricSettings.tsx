/**
 * BiometricSettings Component
 * Biometric authentication setup and toggle
 * Story 1.1: User Registration - AC4
 */

import React, { useEffect, useCallback } from 'react';
import { useBiometricLock } from '../../hooks/useBiometricLock';
import './BiometricSettings.css';

interface BiometricSettingsProps {
    showSetupPrompt?: boolean;
    autoEnableAfterFirstSession?: boolean;
    requireAuthOnLaunch?: boolean;
}

export function BiometricSettings({
    showSetupPrompt = false,
    autoEnableAfterFirstSession = false,
    requireAuthOnLaunch = false,
}: BiometricSettingsProps) {
    const {
        isSupported,
        biometricType,
        isEnabled,
        isFirstSession,
        checkSupport,
        enable,
        disable,
        authenticate,
    } = useBiometricLock();

    // Check biometric support on mount
    useEffect(() => {
        checkSupport();
    }, [checkSupport]);

    // Auto-enable after first session if requested
    useEffect(() => {
        if (autoEnableAfterFirstSession && isFirstSession && isSupported && !isEnabled) {
            enable({ persistToSecureStorage: true });
        }
    }, [autoEnableAfterFirstSession, isFirstSession, isSupported, isEnabled, enable]);

    // Require authentication on launch if enabled
    useEffect(() => {
        if (requireAuthOnLaunch && isEnabled) {
            authenticate();
        }
    }, [requireAuthOnLaunch, isEnabled, authenticate]);

    const handleToggle = useCallback(async () => {
        if (isEnabled) {
            await disable();
        } else {
            await enable({ persistToSecureStorage: true });
        }
    }, [isEnabled, enable, disable]);

    const getBiometricLabel = (): string => {
        switch (biometricType) {
            case 'FaceID':
                return 'Face ID';
            case 'Fingerprint':
                return 'Fingerprint';
            default:
                return 'Biometric';
        }
    };

    const getBiometricIcon = (): string => {
        switch (biometricType) {
            case 'FaceID':
                return '👤';
            case 'Fingerprint':
                return '👆';
            default:
                return '🔒';
        }
    };

    // Device doesn't support biometrics
    if (!isSupported) {
        return (
            <div className="biometric-settings biometric-settings--unsupported">
                <div className="biometric-settings__icon">🔐</div>
                <p className="biometric-settings__notice">
                    Biometric authentication not available on this device
                </p>
                <p className="biometric-settings__hint">
                    Your account is still secured with your login credentials.
                </p>
            </div>
        );
    }

    return (
        <div className="biometric-settings">
            {showSetupPrompt && !isEnabled && (
                <div className="biometric-settings__prompt">
                    <div className="biometric-settings__prompt-icon">{getBiometricIcon()}</div>
                    <h3 className="biometric-settings__prompt-title">
                        Enable {getBiometricLabel()}
                    </h3>
                    <p className="biometric-settings__prompt-description">
                        Use {getBiometricLabel()} for quick and secure access to your coaching sessions.
                    </p>
                    <button
                        type="button"
                        className="biometric-settings__enable-button"
                        onClick={() => enable({ persistToSecureStorage: true })}
                    >
                        Enable {getBiometricLabel()}
                    </button>
                </div>
            )}

            <div className="biometric-settings__toggle-container">
                <div className="biometric-settings__toggle-info">
                    <span className="biometric-settings__toggle-icon">{getBiometricIcon()}</span>
                    <div>
                        <span className="biometric-settings__toggle-label">
                            {getBiometricLabel()}
                        </span>
                        <span className="biometric-settings__toggle-description">
                            {isEnabled
                                ? `Your app is protected with ${getBiometricLabel()}`
                                : 'Off — Enable for quick, secure access'
                            }
                        </span>
                    </div>
                </div>

                <label className="biometric-settings__switch">
                    <input
                        type="checkbox"
                        role="switch"
                        checked={isEnabled}
                        onChange={handleToggle}
                        aria-label={`${getBiometricLabel()} authentication`}
                    />
                    <span className="biometric-settings__slider" />
                </label>
            </div>

            {isEnabled && (
                <div className="biometric-settings__status">
                    <span className="biometric-settings__status-icon">✓</span>
                    <span>{getBiometricLabel()} is active</span>
                </div>
            )}
        </div>
    );
}

export default BiometricSettings;
