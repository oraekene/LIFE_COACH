/**
 * NetworkMonitor Service
 * Monitors network connectivity status
 * Story 3.1: Offline Chat
 */

import { NetworkStatus } from '../../types/Chat';

type ConnectivityListener = (isOnline: boolean) => void;

export class NetworkMonitor {
    private static instance: NetworkMonitor;
    private listeners: Set<ConnectivityListener> = new Set();
    private isOnline: boolean = navigator.onLine;

    private constructor() {
        window.addEventListener('online', this.handleOnline);
        window.addEventListener('offline', this.handleOffline);
    }

    static getInstance(): NetworkMonitor {
        if (!NetworkMonitor.instance) {
            NetworkMonitor.instance = new NetworkMonitor();
        }
        return NetworkMonitor.instance;
    }

    private handleOnline = () => {
        this.isOnline = true;
        this.notifyListeners();
    };

    private handleOffline = () => {
        this.isOnline = false;
        this.notifyListeners();
    };

    private notifyListeners() {
        this.listeners.forEach(listener => listener(this.isOnline));
    }

    /**
     * Get current network status
     */
    getStatus(): NetworkStatus {
        return {
            isOnline: this.isOnline,
            // Connection details not available in all browsers, mocking for now
            connectionType: (navigator as any).connection?.type || 'unknown',
            effectiveType: (navigator as any).connection?.effectiveType || 'unknown',
        };
    }

    /**
     * Check if currently online
     */
    checkConnectivity(): boolean {
        return this.isOnline;
    }

    /**
     * Subscribe to connectivity changes
     */
    subscribe(listener: ConnectivityListener): () => void {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }

    /**
     * Clean up listeners (mainly for testing)
     */
    cleanup() {
        window.removeEventListener('online', this.handleOnline);
        window.removeEventListener('offline', this.handleOffline);
        this.listeners.clear();
    }
}
