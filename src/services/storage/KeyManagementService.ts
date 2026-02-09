/**
 * KeyManagementService
 * Manages cryptographic keys, simulating Secure Enclave behavior
 * Story 1.2: Privacy-First Data Storage - AC2
 */

import { EncryptionService } from './EncryptionService';

export class KeyManagementService {
    private static readonly KEY_STORAGE_NAME = 'lifeos-keys';
    private static readonly DEVICE_KEY_ID = 'device-key';
    private static readonly SALT_ID = 'user-salt';

    /**
     * Initialize or retrieve the device-bound key
     */
    static async getOrCreateDeviceKey(): Promise<CryptoKey> {
        const existingKey = await this.retrieveKey(this.DEVICE_KEY_ID);
        if (existingKey) return existingKey;

        const key = await crypto.subtle.generateKey(
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );

        await this.storeKey(this.DEVICE_KEY_ID, key);
        return key;
    }

    /**
     * Retrieve or generate a persistent random salt for the user.
     * Replaces the hardcoded salt from MVP.
     */
    static async getOrGenerateSalt(): Promise<string> {
        const existingSalt = await this.retrieveMetadata(this.SALT_ID);
        if (existingSalt) return existingSalt;

        // Generate 16 bytes of random salt
        const randomValues = new Uint8Array(16);
        crypto.getRandomValues(randomValues);

        // Convert to Base64 for storage
        let binary = '';
        for (let i = 0; i < randomValues.length; i++) {
            binary += String.fromCharCode(randomValues[i]);
        }
        const salt = btoa(binary);

        await this.storeMetadata(this.SALT_ID, salt);
        return salt;
    }

    /**
     * Derive a Data Encryption Key (DEK) from User Passphrase + Salt
     */
    static async deriveUserKey(passphrase: string, salt: string): Promise<CryptoKey> {
        return await EncryptionService.deriveKey(passphrase, salt);
    }

    // --- Internal Storage (Simulating Keystore) ---

    private static async openKeyDB(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            // Bump version to 2 to add metadata store
            const request = indexedDB.open(this.KEY_STORAGE_NAME, 2);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains('keys')) {
                    db.createObjectStore('keys');
                }
                if (!db.objectStoreNames.contains('metadata')) {
                    db.createObjectStore('metadata');
                }
            };
        });
    }

    private static async storeKey(id: string, key: CryptoKey): Promise<void> {
        const db = await this.openKeyDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('keys', 'readwrite');
            const store = tx.objectStore('keys');
            const request = store.put(key, id);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }

    private static async retrieveKey(id: string): Promise<CryptoKey | null> {
        const db = await this.openKeyDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('keys', 'readonly');
            const store = tx.objectStore('keys');
            const request = store.get(id);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result || null);
        });
    }

    private static async storeMetadata(id: string, value: string): Promise<void> {
        const db = await this.openKeyDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('metadata', 'readwrite');
            const store = tx.objectStore('metadata');
            const request = store.put(value, id);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }

    private static async retrieveMetadata(id: string): Promise<string | null> {
        const db = await this.openKeyDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('metadata', 'readonly');
            const store = tx.objectStore('metadata');
            const request = store.get(id);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result || null);
        });
    }
}
