/**
 * Story 1.2: Privacy-First Data Storage
 * TDD Test Suite - These tests should FAIL until implementation is complete
 *
 * Acceptance Criteria:
 * 1. SQLCipher encryption enabled (simulated via WebCrypto for browser)
 * 2. Keys derived from device secure enclave + user passphrase
 * 3. Export all data (JSON) from settings menu
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import React, { useEffect } from 'react';
import { StorageProvider, useStorage } from '../providers/StorageProvider';
import { EncryptionService } from '../services/storage/EncryptionService';
import { DatabaseService } from '../services/storage/DatabaseService';
import { webcrypto } from 'node:crypto';

// Mock WebCrypto if running in environment without it (Node 18+ has it, but JSDOM might need help)
// Vitest with JSDOM usually supports crypto.subtle, but we verify it.

describe('Story 1.2: Privacy-First Data Storage', () => {

    beforeEach(() => {
        // Polyfill WebCrypto for JSDOM environment
        vi.stubGlobal('crypto', webcrypto);
        // Reset DB mock
        (DatabaseService.getInstance() as any)._storage = new Map();
    });

    // =========================================================================
    // AC1 & AC2: Encryption & Key Derivation
    // =========================================================================
    describe('EncryptionService', () => {
        it('should derive a strong key from passphrase and salt', async () => {
            const passphrase = 'user-secret-passphrase';
            const salt = 'random-salt-string';

            const key = await EncryptionService.deriveKey(passphrase, salt);
            expect(key).toBeDefined();
            // Verify it's a CryptoKey (or suitable key object)
            expect((key as any).algorithm).toBeDefined();
        });

        it('should encrypt and decrypt data correctly', async () => {
            const passphrase = 'test-passphrase';
            const salt = 'test-salt';
            const key = await EncryptionService.deriveKey(passphrase, salt);

            const secretData = JSON.stringify({ note: 'My secret diary' });

            // Encrypt
            const encrypted = await EncryptionService.encrypt(secretData, key);
            expect(encrypted.ciphertext).toBeDefined();
            expect(encrypted.iv).toBeDefined();
            expect(encrypted.ciphertext).not.toBe(secretData); // Should be encrypted

            // Decrypt
            const decrypted = await EncryptionService.decrypt(encrypted.ciphertext, encrypted.iv, key);
            expect(decrypted).toBe(secretData);
        });

        it('should fail to decrypt with wrong key', async () => {
            const salt = 'test-salt';
            const key1 = await EncryptionService.deriveKey('password-1', salt);
            const key2 = await EncryptionService.deriveKey('password-2', salt);

            const data = 'sensitive data';
            const encrypted = await EncryptionService.encrypt(data, key1);

            await expect(EncryptionService.decrypt(encrypted.ciphertext, encrypted.iv, key2))
                .rejects.toThrow();
        });
    });

    // =========================================================================
    // AC1: Local SQLite Storage
    // =========================================================================
    describe('DatabaseService', () => {
        beforeEach(() => {
            // Reset DB state if needed (mocked or real)
        });

        it('should initialize the database', async () => {
            const db = DatabaseService.getInstance();
            await expect(db.initialize()).resolves.not.toThrow();
        });

        it('should save and retrieve encrypted items', async () => {
            const db = DatabaseService.getInstance();
            await db.initialize();

            const collection = 'notes';
            const item = { id: 'note-1', content: 'Secret meeting' };

            // Should auto-encrypt sensitive fields if configured, or we encrypt before save
            // For Story 1.2, we assume DatabaseService handles storage, EncryptionService handles crypto

            // Let's assume we encrypt manually for now, or DB service does it
            // Testing the storage capability:
            await db.setItem(collection, item.id, item);

            const retrieved = await db.getItem(collection, item.id);
            expect(retrieved).toEqual(item);
        });
    });

    // =========================================================================
    describe('Data Export', () => {
        it('should export all data as JSON', async () => {
            const db = DatabaseService.getInstance();
            await db.initialize();

            // Note: DB state might be dirty from previous tests if singleton isn't fully reset
            await db.setItem('logs', '1', { msg: 'log entry' });

            const exportData = await db.exportAllData();
            const parsed = JSON.parse(exportData);

            const values = Object.values(parsed);
            const foundLog = values.find((v: any) => v.msg === 'log entry');
            expect(foundLog).toBeDefined();
            // Should be a JSON string
            expect(() => JSON.parse(exportData)).not.toThrow();
        });
    });

    // =========================================================================
    describe('StorageProvider Integration', () => {
        const TestComponent = () => {
            const { isReady, unlock, saveItem, getItem } = useStorage();
            const [data, setData] = React.useState<any>(null);
            const [hasRun, setHasRun] = React.useState(false);

            useEffect(() => {
                if (!isReady) {
                    unlock('my-passphrase');
                } else if (!hasRun) {
                    const run = async () => {
                        await saveItem('secrets', 'id-1', { msg: 'top secret' });
                        const loaded = await getItem('secrets', 'id-1');
                        setData(loaded);
                        setHasRun(true);
                    };
                    run();
                }
            }, [isReady, hasRun, unlock, saveItem, getItem]);

            if (!isReady) return <div>Locked</div>;
            return <div data-testid="loaded-data">{JSON.stringify(data)}</div>;
        };

        it('should encrypt on save and decrypt on load', async () => {
            const dbSpy = vi.spyOn(DatabaseService.getInstance(), 'setItem');

            render(
                <StorageProvider>
                    <TestComponent />
                </StorageProvider>
            );

            // Wait for unlock and load
            await waitFor(() => {
                expect(screen.getByTestId('loaded-data')).toHaveTextContent('top secret');
            });

            // Verify DB stored encrypted data
            const saveCall = dbSpy.mock.calls[0];
            const savedPayload = saveCall[2]; // 3rd arg is data
            expect(savedPayload).toHaveProperty('ciphertext');
            expect(savedPayload).toHaveProperty('iv');
            expect(savedPayload.ciphertext).not.toContain('top secret');
        });
    });
});
