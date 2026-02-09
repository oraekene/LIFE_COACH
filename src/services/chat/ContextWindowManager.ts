/**
 * ContextWindowManager Service
 * Manages chat context window (last 20 turns)
 * Story 3.1: Offline Chat
 */

import { Message } from '../../types/Chat';

export class ContextWindowManager {
    private messages: Message[] = [];
    private maxContextSize: number;
    private storageKeyPrefix = 'chat_context_';

    constructor(maxContextSize: number = 20) {
        this.maxContextSize = maxContextSize;
    }

    /**
     * Add a message to the context
     */
    addMessage(message: Message): void {
        this.messages.push(message);
        this.trimToLimit();
    }

    /**
     * Get recent messages for context
     */
    getRecentMessages(limit?: number): Message[] {
        const count = limit || this.maxContextSize;
        return this.messages.slice(-count);
    }

    /**
     * Get current context size
     */
    getContextWindow(): number {
        return this.maxContextSize;
    }

    /**
     * Ensure messages don't exceed the limit
     */
    trimToLimit(limit?: number): void {
        const max = limit || this.maxContextSize;
        if (this.messages.length > max) {
            this.messages = this.messages.slice(-max);
        }
    }

    /**
     * Save context to local storage
     */
    async saveToStorage(sessionId: string): Promise<void> {
        try {
            localStorage.setItem(
                `${this.storageKeyPrefix}${sessionId}`,
                JSON.stringify(this.messages)
            );
        } catch (error) {
            console.error('Failed to save context:', error);
        }
    }

    /**
     * Load context from local storage
     */
    async loadFromStorage(sessionId: string): Promise<void> {
        try {
            const stored = localStorage.getItem(`${this.storageKeyPrefix}${sessionId}`);
            if (stored) {
                this.messages = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load context:', error);
            this.messages = [];
        }
    }

    /**
     * Clear current context
     */
    clearContext(): void {
        this.messages = [];
    }
}
