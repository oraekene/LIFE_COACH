/**
 * StorageProvider
 * React Context for managing secure storage session
 * Story 1.2: Privacy-First Data Storage
 */

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { DatabaseService } from '../services/storage/DatabaseService';
import { EncryptionService, EncryptedPayload } from '../services/storage/EncryptionService';
import { KeyManagementService } from '../services/storage/KeyManagementService';

interface StorageContextType {
    isReady: boolean;
    isLocked: boolean;
    unlock: (passphrase: string) => Promise<boolean>;
    lock: () => void;
    saveItem: (collection: string, id: string, data: any) => Promise<void>;
    getItem: <T>(collection: string, id: string) => Promise<T | null>;
    exportData: () => Promise<string>;
}

const StorageContext = createContext<StorageContextType | null>(null);

export function StorageProvider({ children }: { children: ReactNode }) {
    const [isReady, setIsReady] = useState(false);
    const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
    const db = DatabaseService.getInstance();

    const unlock = async (passphrase: string): Promise<boolean> => {
        try {
            // In a real app, we'd salt this properly, perhaps storing the salt in DB metadata
            // For now, using a deterministic salt for MVP (or ideally, fetch salt from DB)
            // 1a. Fetch or generate user salt
            const salt = await KeyManagementService.getOrGenerateSalt();

            // 1b. Derive user key from passphrase
            // using KeyManagementService to adhere to architecture
            const userKey = await KeyManagementService.deriveUserKey(passphrase, salt);

            // 2. Load DB (if not loaded)
            await db.initialize();

            // 3. Store key in memory for this session
            setEncryptionKey(userKey);
            setIsReady(true);
            return true;
        } catch (error) {
            console.error('Unlock failed:', error);
            return false;
        }
    };

    const lock = useCallback(() => {
        setEncryptionKey(null);
        setIsReady(false);
    }, []);

    const saveItem = useCallback(async (collection: string, id: string, data: any) => {
        if (!encryptionKey) throw new Error('Storage is locked');

        const json = JSON.stringify(data);
        // Encrypt the payload
        const encrypted = await EncryptionService.encrypt(json, encryptionKey);

        // Store encrypted payload
        // We assume DatabaseService stores the encrypted object (ciphertext + iv)
        await db.setItem(collection, id, encrypted);
    }, [encryptionKey]);

    const getItem = useCallback(async <T,>(collection: string, id: string): Promise<T | null> => {
        if (!encryptionKey) throw new Error('Storage is locked'); // Or return null?

        const encrypted = await db.getItem<EncryptedPayload>(collection, id);
        if (!encrypted) return null;

        // Decrypt
        try {
            const json = await EncryptionService.decrypt(encrypted.ciphertext, encrypted.iv, encryptionKey);
            return JSON.parse(json) as T;
        } catch (e) {
            console.error(`Failed to decrypt item ${collection}:${id}`, e);
            return null;
        }
    }, [encryptionKey]);

    const exportData = useCallback(async () => {
        // Exporting raw encrypted data is safe
        // But usually "Export Data" allows the user to download their DECRYPTED data (JSON)
        // So we need to decrypt everything.

        if (!encryptionKey) throw new Error('Storage is locked');

        // This is expensive: we fetch all and decrypt.
        // For DatabaseService MVP, exportAllData returns a JSON string of the *stored* (encrypted) data.
        const rawExport = await db.exportAllData();
        const rawObj = JSON.parse(rawExport);

        const decryptedObj: any = {};

        for (const key of Object.keys(rawObj)) {
            const encrypted = rawObj[key] as EncryptedPayload;
            try {
                const json = await EncryptionService.decrypt(encrypted.ciphertext, encrypted.iv, encryptionKey);
                decryptedObj[key] = JSON.parse(json);
            } catch {
                decryptedObj[key] = { error: 'Decryption User Failed' };
            }
        }

        return JSON.stringify(decryptedObj, null, 2);
    }, [encryptionKey]);

    return (
        <StorageContext.Provider value={{
            isReady,
            isLocked: !isReady,
            unlock,
            lock,
            saveItem,
            getItem,
            exportData
        }}>
            {children}
        </StorageContext.Provider>
    );
}

export function useStorage() {
    const context = useContext(StorageContext);
    if (!context) {
        throw new Error('useStorage must be used within a StorageProvider');
    }
    return context;
}
