/**
 * EncryptionService
 * Handles cryptographic operations using WebCrypto API
 * Story 1.2: Privacy-First Data Storage - AC1 & AC2
 */

// Interface for encrypted payload
export interface EncryptedPayload {
    ciphertext: string; // Base64 encoded
    iv: string; // Base64 encoded initialization vector
    salt?: string; // Base64 encoded salt (optional if managed externally)
}

export class EncryptionService {
    private static algorithm = { name: 'AES-GCM', length: 256 };
    private static kdfAlgorithm = 'PBKDF2';
    private static hashAlgorithm = 'SHA-256';
    private static iterations = 100000;

    /**
     * Derive a key from a passphrase and salt using PBKDF2
     */
    static async deriveKey(passphrase: string, salt: string): Promise<CryptoKey> {
        const enc = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            enc.encode(passphrase),
            { name: 'PBKDF2' },
            false,
            ['deriveBits', 'deriveKey']
        );

        const saltBuffer = enc.encode(salt);

        return await crypto.subtle.deriveKey(
            {
                name: this.kdfAlgorithm,
                salt: saltBuffer,
                iterations: this.iterations,
                hash: this.hashAlgorithm,
            },
            keyMaterial,
            this.algorithm,
            false, // Key is non-extractable (Secure Enclave simulation)
            ['encrypt', 'decrypt']
        );
    }

    /**
     * Encrypt data string using AES-GCM
     */
    static async encrypt(data: string, key: CryptoKey): Promise<EncryptedPayload> {
        const enc = new TextEncoder();
        const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM
        const encodedData = enc.encode(data);

        const ciphertextBuffer = await crypto.subtle.encrypt(
            {
                name: this.algorithm.name,
                iv,
            },
            key,
            encodedData
        );

        return {
            ciphertext: this.arrayBufferToBase64(ciphertextBuffer),
            iv: this.arrayBufferToBase64(iv.buffer as ArrayBuffer),
        };
    }

    /**
     * Decrypt ciphertext using AES-GCM
     */
    static async decrypt(ciphertextItems: string | ArrayBuffer, ivItem: string | ArrayBuffer, key: CryptoKey): Promise<string> {
        const ciphertext = typeof ciphertextItems === 'string'
            ? this.base64ToArrayBuffer(ciphertextItems)
            : ciphertextItems;

        const iv = typeof ivItem === 'string'
            ? this.base64ToArrayBuffer(ivItem)
            : ivItem;

        try {
            const decryptedBuffer = await crypto.subtle.decrypt(
                {
                    name: this.algorithm.name,
                    iv: iv,
                },
                key,
                ciphertext
            );

            const dec = new TextDecoder();
            return dec.decode(decryptedBuffer);
        } catch (e) {
            console.error('Decryption failed:', e);
            throw new Error('Decryption failed. Invalid key or corrupted data.');
        }
    }

    // --- Helpers ---

    private static arrayBufferToBase64(buffer: ArrayBuffer): string {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    private static base64ToArrayBuffer(base64: string): ArrayBuffer {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }
}
