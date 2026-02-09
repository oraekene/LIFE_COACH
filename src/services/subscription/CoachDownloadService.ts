/**
 * CoachDownloadService
 * Manages coach downloads and offline access
 * Story 2.2: Premium Subscription
 * 
 * SECURITY NOTES:
 * - Validates coachId format before processing
 * - Uses cryptographically secure random IDs
 * - All downloads should be verified server-side in production
 */

import { CoachDownload, OfflineCoach } from '../../types/Subscription';

/**
 * Validate coach ID format
 * @throws Error if coach ID is invalid
 */
function validateCoachId(coachId: string): void {
    if (!coachId || typeof coachId !== 'string') {
        throw new Error('Coach ID is required');
    }
    if (coachId.length > 100) {
        throw new Error('Invalid coach ID');
    }
    // Basic alphanumeric and dash validation
    if (!/^[a-zA-Z0-9-_]+$/.test(coachId)) {
        throw new Error('Invalid coach ID format');
    }
}

export interface DownloadOptions {
    includeTextChunks: boolean;
    includeLoraAdapter: boolean;
    includeGraphIndex: boolean;
    compression?: 'zstd' | 'gzip' | 'none';
}

export interface StartDownloadResult {
    downloadId: string;
    components: string[];
    compression?: string;
    originalSize?: number;
    compressedSize?: number;
    status: 'pending' | 'downloading';
}

export class CoachDownloadService {
    private static instance: CoachDownloadService;
    private downloads: Map<string, CoachDownload> = new Map();
    private offlineCoaches: Map<string, OfflineCoach> = new Map();
    private subscriptionActive: boolean = true;

    private constructor() { }

    static getInstance(): CoachDownloadService {
        if (!CoachDownloadService.instance) {
            CoachDownloadService.instance = new CoachDownloadService();
        }
        return CoachDownloadService.instance;
    }

    /**
     * Start downloading a coach for offline access
     */
    async startDownload(
        coachId: string,
        options: DownloadOptions
    ): Promise<StartDownloadResult> {
        // Validate coach ID
        validateCoachId(coachId);

        await new Promise(resolve => setTimeout(resolve, 100));

        const download: CoachDownload = {
            coachId,
            status: 'downloading',
            progress: 0,
            totalSizeMB: 65,
            downloadedMB: 0,
            components: {
                textChunks: { downloaded: false, sizeMB: 25 },
                loraAdapter: { downloaded: false, sizeMB: 20 },
                graphIndex: { downloaded: false, sizeMB: 20 },
            },
            localIndexingProgress: 0,
        };

        this.downloads.set(coachId, download);

        // Use cryptographically secure random IDs
        return {
            downloadId: `dl_${crypto.randomUUID()}`,
            components: ['textChunks', 'loraAdapter', 'graphIndex'],
            compression: options.compression || 'zstd',
            originalSize: 50,
            compressedSize: 25,
            status: 'pending',
        };
    }

    /**
     * Cancel an in-progress download
     */
    async cancelDownload(coachId: string): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 50));
        this.downloads.delete(coachId);
    }

    /**
     * Get current download progress
     */
    async getDownloadProgress(coachId: string): Promise<CoachDownload | null> {
        await new Promise(resolve => setTimeout(resolve, 50));
        return this.downloads.get(coachId) || null;
    }

    /**
     * Delete offline data for a coach
     */
    async deleteOfflineData(coachId: string): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 100));
        this.downloads.delete(coachId);
        this.offlineCoaches.delete(coachId);
    }

    /**
     * Get all offline coaches
     */
    async getOfflineCoaches(): Promise<OfflineCoach[]> {
        await new Promise(resolve => setTimeout(resolve, 50));
        return Array.from(this.offlineCoaches.values());
    }

    /**
     * Check if a coach is available offline
     */
    isCoachAvailableOffline(coachId: string): boolean {
        return this.offlineCoaches.has(coachId);
    }

    /**
     * Check if coach can receive updates (subscription must be active)
     */
    canReceiveUpdates(coachId: string): boolean {
        return this.subscriptionActive && this.offlineCoaches.has(coachId);
    }

    /**
     * Set subscription status (affects update availability)
     */
    setSubscriptionActive(active: boolean): void {
        this.subscriptionActive = active;
    }

    /**
     * Mark a download as complete
     */
    markDownloadComplete(coachId: string): void {
        const download = this.downloads.get(coachId);
        if (download) {
            download.status = 'complete';
            download.progress = 100;
            download.localIndexingProgress = 100;
            download.components = {
                textChunks: { downloaded: true, sizeMB: 25 },
                loraAdapter: { downloaded: true, sizeMB: 20 },
                graphIndex: { downloaded: true, sizeMB: 20 },
            };
            download.downloadedMB = download.totalSizeMB;

            this.offlineCoaches.set(coachId, {
                coachId,
                downloadedAt: new Date().toISOString(),
                lastSyncAt: new Date().toISOString(),
            });
        }
    }

    /**
     * Reset instance (for testing)
     */
    static resetInstance(): void {
        CoachDownloadService.instance = null as unknown as CoachDownloadService;
    }
}
