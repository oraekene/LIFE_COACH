import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { StorageProvider, useStorage } from '../providers/StorageProvider';
import { DatabaseService } from '../services/storage/DatabaseService';
import { StorageProvider, useStorage } from '../providers/StorageProvider';
import { DatabaseService } from '../services/storage/DatabaseService';
import { ProfileSetupWizard } from '../features/onboarding/ProfileSetupWizard';
import { webcrypto } from 'node:crypto';
import { TextEncoder, TextDecoder } from 'util';

// Polyfills
vi.stubGlobal('crypto', webcrypto);
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Mock EncryptionService to avoid WebCrypto complexity in UI tests
vi.mock('../services/storage/EncryptionService', () => ({
    EncryptionService: {
        encrypt: vi.fn().mockResolvedValue({ ciphertext: 'mock-encrypted-data', iv: 'mock-iv' }),
        decrypt: vi.fn().mockResolvedValue(JSON.stringify({
            displayName: 'Test User',
            primaryGoal: 'stress_reduction',
            avatarId: 'avatar-1',
            createdAt: 12345
        }))
    }
}));

// Mock DatabaseService
vi.mock('../services/storage/DatabaseService', () => ({
    DatabaseService: {
        getInstance: vi.fn().mockReturnValue({
            get: vi.fn(),
            initialize: vi.fn().mockResolvedValue(undefined),
            put: vi.fn().mockResolvedValue(true),
            setItem: vi.fn().mockResolvedValue(undefined), // Add setItem!
            getItem: vi.fn().mockResolvedValue(null),
            exportAllData: vi.fn().mockResolvedValue('{}')
        })
    }
}));

// Update KeyManagementService mock to return a simple truthy value
vi.mock('../services/storage/KeyManagementService', () => ({
    KeyManagementService: {
        getOrGenerateSalt: vi.fn().mockResolvedValue('test-salt-mock'),
        deriveUserKey: vi.fn().mockResolvedValue('mock-valid-key') // Simple truthy value
    }
}));


describe('Story 1.3: User Profile', () => {
    beforeEach(async () => {
        // Reset mocks
        vi.clearAllMocks();
    });

    it('should save encrypted profile and call onComplete', async () => {
        const onCompleteMock = vi.fn();
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        // Wrapper to unlock storage
        const TestWrapper = ({ children }: { children: React.ReactNode }) => {
            const { unlock, isReady } = useStorage();

            React.useEffect(() => {
                unlock('password');
            }, []); // No need to depend on [unlock] if we invoke once

            if (!isReady) return <div>Loading Storage...</div>;
            return <>{children}</>;
        };

        render(
            <StorageProvider>
                <TestWrapper>
                    <ProfileSetupWizard onComplete={onCompleteMock} />
                </TestWrapper>
            </StorageProvider>
        );

        // 1. Name
        // Ensure we moved past loading state
        await waitFor(() => {
            expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
            expect(screen.getByPlaceholderText(/Enter your name/i)).toBeInTheDocument();
        });
        fireEvent.change(screen.getByPlaceholderText(/Enter your name/i), { target: { value: 'Test User' } });
        fireEvent.click(screen.getByText(/Next/i));

        // 2. Goal
        await waitFor(() => expect(screen.getByText(/Primary Goal/i)).toBeInTheDocument());
        fireEvent.click(screen.getByText(/Reduce Stress/i));
        fireEvent.click(screen.getByText(/Next/i));

        // 3. Avatar
        await waitFor(() => expect(screen.getByText(/Choose Avatar/i)).toBeInTheDocument());
        fireEvent.click(screen.getByTestId('avatar-option-1'));

        // FINISH
        const finishBtn = screen.getByText(/Finish/i);
        expect(finishBtn).not.toBeDisabled();
        fireEvent.click(finishBtn);

        // Verify onComplete called
        await waitFor(() => {
            if (consoleSpy.mock.calls.length > 0) {
                console.log('Console Errors found:', consoleSpy.mock.calls);
            }
            expect(onCompleteMock).toHaveBeenCalled();
        });

        // Verify DB storage
        const db = DatabaseService.getInstance();

        // Instead of relying on getItem (which mocks null), verify setItem was called with encrypted data
        expect(db.setItem).toHaveBeenCalledWith(
            'user_profile',
            'current',
            expect.objectContaining({
                ciphertext: expect.any(String),
                iv: expect.any(String)
            })
        );
    });
});
