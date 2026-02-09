/**
 * Vitest Test Setup
 * Configures testing environment with React Testing Library matchers
 */

import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock window.matchMedia for components using media queries
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock crypto for WebAuthn
Object.defineProperty(window, 'crypto', {
    value: {
        getRandomValues: (arr: Uint8Array) => {
            for (let i = 0; i < arr.length; i++) {
                arr[i] = Math.floor(Math.random() * 256);
            }
            return arr;
        },
    },
});

// Mock PublicKeyCredential for biometric tests
Object.defineProperty(window, 'PublicKeyCredential', {
    value: {
        isUserVerifyingPlatformAuthenticatorAvailable: vi.fn().mockResolvedValue(true),
    },
});

// Mock navigator.credentials
Object.defineProperty(navigator, 'credentials', {
    value: {
        get: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue(null),
    },
});

// Mock import.meta.env
vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', 'pk_test_mock-key');
