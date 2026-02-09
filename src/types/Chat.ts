/**
 * Chat Types
 * Story 3.1: Offline Chat
 */

export type Role = 'user' | 'assistant' | 'system';

export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'failed';

export interface Message {
    id: string;
    role: Role;
    content: string;
    timestamp: string;
    status?: 'sent' | 'delivered' | 'read' | 'error';
    syncStatus?: SyncStatus;
    metadata?: Record<string, unknown>;
}

export interface ChatSession {
    id: string;
    coachId: string;
    userId: string;
    messages: Message[];
    lastUpdated: string;
    createdAt: string;
}

export interface ChatResponse {
    id: string;
    role: Role;
    content: string;
    timestamp: string;
    latencyMs?: number;
    tokens?: number;
    runtime?: 'onnx' | 'cloud' | 'mock';
}

export interface NetworkStatus {
    isOnline: boolean;
    connectionType?: string;
    effectiveType?: string;
}

export interface SyncResult {
    synced: number;
    failed: number;
    errors?: string[];
}
