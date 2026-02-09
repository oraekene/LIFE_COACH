// Hooks barrel export
export { useAuth } from './useAuth';
export { useBiometricLock } from './useBiometricLock';

// Re-export types
export type { UseAuthReturn, AuthError, OAuthProvider } from './useAuth';
export type { UseBiometricLockReturn, BiometricType, BiometricSupportResult } from './useBiometricLock';
