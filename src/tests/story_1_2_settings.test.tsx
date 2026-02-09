/**
 * Story 1.2: Settings & Export Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React, { useEffect } from 'react';
import { SettingsPage } from '../features/settings/SettingsPage';
import { StorageProvider, useStorage } from '../providers/StorageProvider';
import { DatabaseService } from '../services/storage/DatabaseService';
import { webcrypto } from 'node:crypto';

// Mocks
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();

describe('Story 1.2: Settings & Export', () => {
    beforeEach(() => {
        vi.stubGlobal('crypto', webcrypto);
        (DatabaseService.getInstance() as any)._storage = new Map();
    });

    it('should show locked state initially', () => {
        render(
            <StorageProvider>
                <SettingsPage />
            </StorageProvider>
        );
        expect(screen.getByText(/Storage is locked/i)).toBeInTheDocument();
    });

    const UnlockHelper = ({ children }: { children: React.ReactNode }) => {
        const { unlock, isReady } = useStorage();
        useEffect(() => {
            if (!isReady) unlock('pass');
        }, [isReady, unlock]);

        if (!isReady) return null;
        return <>{children}</>;
    };

    it('should show export button when unlocked', async () => {
        render(
            <StorageProvider>
                <UnlockHelper>
                    <SettingsPage />
                </UnlockHelper>
            </StorageProvider>
        );

        await waitFor(() => {
            expect(screen.getByText('Download My Data (JSON)')).toBeInTheDocument();
        });
    });

    it('should handle export flow', async () => {
        render(
            <StorageProvider>
                <UnlockHelper>
                    <SettingsPage />
                </UnlockHelper>
            </StorageProvider>
        );

        await waitFor(() => {
            expect(screen.getByText('Download My Data (JSON)')).toBeInTheDocument();
        });

        const exportBtn = screen.getByText('Download My Data (JSON)');
        fireEvent.click(exportBtn);

        // Verification: URL.createObjectURL called, meaning blob created
        await waitFor(() => {
            expect(global.URL.createObjectURL).toHaveBeenCalled();
        });
    });
});
