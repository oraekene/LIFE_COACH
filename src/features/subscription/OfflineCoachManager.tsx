/**
 * OfflineCoachManager Component
 * Manages offline coach downloads and access
 * Story 2.2: Premium Subscription
 */

import React, { useState } from 'react';
import './OfflineCoachManager.css';

export interface DownloadOptions {
    coachId: string;
    includeTextChunks: boolean;
    includeLoraAdapter: boolean;
    includeGraphIndex: boolean;
    compression: string;
}

interface OfflineCoachManagerProps {
    coachId: string;
    isSubscribed: boolean;
    onDownload?: (options: DownloadOptions) => Promise<void>;
    onDelete?: () => void;
    isOffline?: boolean;
    lastSyncDate?: string | null;
}

export const OfflineCoachManager: React.FC<OfflineCoachManagerProps> = ({
    coachId,
    isSubscribed,
    onDownload,
    onDelete,
    isOffline = false,
    lastSyncDate = null,
}) => {
    const [downloadError, setDownloadError] = useState<string | null>(null);
    const [storageError, setStorageError] = useState<string | null>(null);

    const handleDownload = async () => {
        setDownloadError(null);
        setStorageError(null);

        try {
            await onDownload?.({
                coachId,
                includeTextChunks: true,
                includeLoraAdapter: true,
                includeGraphIndex: true,
                compression: 'zstd',
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('storage') || error.message.includes('Storage')) {
                    setStorageError(error.message);
                } else {
                    setDownloadError(error.message);
                }
            }
        }
    };

    const handleDelete = () => {
        onDelete?.();
    };

    return (
        <div className="offline-coach-manager" data-testid="offline-coach-manager">
            {/* Subscription status */}
            {!isSubscribed && (
                <>
                    <div
                        className="updates-blocked-badge"
                        data-testid="updates-blocked-badge"
                    >
                        Updates Blocked
                    </div>
                    <p
                        className="subscription-required"
                        data-testid="subscription-required-message"
                    >
                        An active subscription is required for new downloads
                    </p>
                </>
            )}

            {/* Last sync date (for offline coaches after unsubscribe) */}
            {isOffline && lastSyncDate && (
                <div className="last-sync" data-testid="last-sync-date">
                    Last synced: {new Date(lastSyncDate).toLocaleDateString()}
                </div>
            )}

            {/* Download button */}
            <button
                className="download-coach-button"
                onClick={handleDownload}
                disabled={!isSubscribed}
                data-testid="download-coach-button"
            >
                {isOffline ? 'Update Offline Data' : 'Download for Offline'}
            </button>

            {/* Delete button (only for offline coaches) */}
            {isOffline && (
                <button
                    className="delete-offline-button"
                    onClick={handleDelete}
                    data-testid="delete-offline-button"
                >
                    Remove Offline Data
                </button>
            )}

            {/* Error messages */}
            {downloadError && (
                <div className="error-message" data-testid="download-error-message">
                    {downloadError}
                </div>
            )}

            {storageError && (
                <div className="error-message" data-testid="storage-error-message">
                    {storageError}
                </div>
            )}
        </div>
    );
};
