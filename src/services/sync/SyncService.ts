/**
 * SyncService
 * Manages message queuing and synchronization
 * Story 3.1: Offline Chat
 */

import { Message, SyncResult } from '../../types/Chat';

export class SyncService {
    private queue: Message[] = [];
    private isSyncing: boolean = false;
    private status: 'idle' | 'syncing' | 'complete' | 'error' = 'idle';

    /**
     * Queue a message for synchronization
     */
    queueMessage(message: Message): void {
        // Only queue if not already synced
        if (message.syncStatus !== 'synced') {
            const existingIndex = this.queue.findIndex(m => m.id === message.id);
            if (existingIndex >= 0) {
                this.queue[existingIndex] = message;
            } else {
                this.queue.push(message);
            }
            message.syncStatus = 'pending';
        }
    }

    /**
     * Get number of pending messages
     */
    getPendingCount(): number {
        return this.queue.length;
    }

    /**
     * Sync all queued messages
     */
    async syncAll(): Promise<SyncResult> {
        if (this.queue.length === 0) {
            return { synced: 0, failed: 0 };
        }

        this.isSyncing = true;
        this.status = 'syncing';

        const result: SyncResult = {
            synced: 0,
            failed: 0,
            errors: [],
        };

        // Process queue copy to avoid modification issues during iteration
        const messagesToSync = [...this.queue];
        const remainingMessages: Message[] = [];

        for (const message of messagesToSync) {
            try {
                await this.syncMessage(message);
                result.synced++;
                message.syncStatus = 'synced';
            } catch (error) {
                result.failed++;
                message.syncStatus = 'failed';
                remainingMessages.push(message);
                if (error instanceof Error) {
                    result.errors?.push(error.message);
                }
            }
        }

        // Update queue with failed messages only
        this.queue = remainingMessages;
        this.isSyncing = false;
        this.status = result.failed > 0 ? 'error' : 'complete';

        return result;
    }

    /**
     * Simulate syncing a single message to backend
     */
    private async syncMessage(message: Message): Promise<void> {
        // Simulate network latency
        await new Promise(resolve => setTimeout(resolve, 50));

        // Random failure simulation (1% chance)
        if (Math.random() < 0.01) {
            throw new Error(`Failed to sync message ${message.id}`);
        }

        // Success
        return;
    }

    /**
     * Get current sync status
     */
    getStatus(): string {
        return this.status;
    }
}
