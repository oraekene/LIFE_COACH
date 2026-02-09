/**
 * CoachDownloadProgress Component
 * Shows download and local indexing progress
 * Story 2.2: Premium Subscription
 */

import React from 'react';
import { CoachDownload } from '../../types/Subscription';
import './CoachDownloadProgress.css';

interface CoachDownloadProgressProps {
    download: CoachDownload;
    onCancel?: () => void;
}

export const CoachDownloadProgress: React.FC<CoachDownloadProgressProps> = ({
    download,
    onCancel,
}) => {
    const isIndexing = download.status === 'indexing';
    const isComplete = download.status === 'complete';
    const isFailed = download.status === 'failed';

    const getComponentStatus = (downloaded: boolean): string => {
        if (downloaded) return 'Complete';
        if (isIndexing || isComplete) return 'Complete';
        return 'Downloading';
    };

    const getEstimatedTimeRemaining = (): string => {
        if (isComplete || isFailed) return '';
        const remaining = 100 - (isIndexing ? download.localIndexingProgress : download.progress);
        const seconds = Math.ceil(remaining * 0.5); // Rough estimate
        if (seconds < 60) return `${seconds}s remaining`;
        return `${Math.ceil(seconds / 60)}m remaining`;
    };

    return (
        <div className="coach-download-progress" data-testid="coach-download-progress">
            {/* Phase indicator */}
            <div className="download-phase" data-testid="download-phase">
                {isIndexing
                    ? 'Building Local Index'
                    : isComplete
                        ? 'Ready for Offline Use'
                        : 'Downloading Coach Data'}
            </div>

            {/* Status indicator */}
            <div className="download-status" data-testid="download-status">
                {isComplete
                    ? 'Ready for Offline Use'
                    : isFailed
                        ? 'Download Failed'
                        : isIndexing
                            ? 'Indexing...'
                            : 'Downloading...'}
            </div>

            {isComplete && (
                <div className="indexing-complete-icon" data-testid="indexing-complete-icon">
                    ✓
                </div>
            )}

            {/* Progress section */}
            {!isComplete && !isFailed && (
                <>
                    {/* Main progress bar */}
                    {isIndexing ? (
                        <div className="indexing-progress">
                            <div
                                className="progress-bar"
                                data-testid="indexing-progress-bar"
                            >
                                <div
                                    className="progress-fill indexing"
                                    style={{ width: `${download.localIndexingProgress}%` }}
                                />
                            </div>
                            <span
                                className="progress-value"
                                data-testid="indexing-progress-value"
                            >
                                {download.localIndexingProgress}%
                            </span>
                        </div>
                    ) : (
                        <div className="download-progress">
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${download.progress}%` }}
                                />
                            </div>
                            <span className="progress-value">{download.progress}%</span>
                        </div>
                    )}

                    {/* Estimated time */}
                    <div
                        className="estimated-time"
                        data-testid="estimated-time-remaining"
                    >
                        {getEstimatedTimeRemaining()}
                    </div>
                </>
            )}

            {/* Component breakdown */}
            <div className="components-section">
                <h4>Download Components</h4>

                {/* Text Chunks */}
                <div className="component-row">
                    <span
                        className="component-check"
                        data-testid="text-chunks-check"
                        data-complete={download.components.textChunks.downloaded.toString()}
                    >
                        {download.components.textChunks.downloaded ? '✓' : '○'}
                    </span>
                    <span className="component-name">Text Chunks (compressed)</span>
                    <span
                        className="component-status"
                        data-testid="text-chunks-status"
                    >
                        {getComponentStatus(download.components.textChunks.downloaded)}
                    </span>
                    <span className="component-size" data-testid="text-chunks-size">
                        {download.components.textChunks.sizeMB}MB
                    </span>
                </div>

                {/* LoRA Adapter */}
                <div className="component-row">
                    <span
                        className="component-check"
                        data-testid="lora-adapter-check"
                        data-complete={download.components.loraAdapter.downloaded.toString()}
                    >
                        {download.components.loraAdapter.downloaded ? '✓' : '○'}
                    </span>
                    <span className="component-name">LoRA Adapter</span>
                    <span
                        className="component-status"
                        data-testid="lora-adapter-status"
                    >
                        {getComponentStatus(download.components.loraAdapter.downloaded)}
                    </span>
                    <span className="component-size" data-testid="lora-adapter-size">
                        {download.components.loraAdapter.sizeMB}MB
                    </span>
                </div>

                {/* Graph Index */}
                <div className="component-row">
                    <span
                        className="component-check"
                        data-testid="graph-index-check"
                        data-complete={download.components.graphIndex.downloaded.toString()}
                    >
                        {download.components.graphIndex.downloaded ? '✓' : '○'}
                    </span>
                    <span className="component-name">Graph Index</span>
                    <span
                        className="component-status"
                        data-testid="graph-index-status"
                    >
                        {getComponentStatus(download.components.graphIndex.downloaded)}
                    </span>
                    <span className="component-size" data-testid="graph-index-size">
                        {download.components.graphIndex.sizeMB}MB
                    </span>
                </div>

                {/* Total size */}
                <div className="total-row">
                    <span className="total-label">Total</span>
                    <span className="total-size" data-testid="total-download-size">
                        {download.totalSizeMB}MB
                    </span>
                </div>
            </div>

            {/* Error state */}
            {isFailed && download.error && (
                <div className="error-section">
                    <p
                        className="error-message"
                        data-testid="indexing-error-message"
                    >
                        {download.error}
                    </p>
                    <button
                        className="retry-button"
                        data-testid="retry-indexing-button"
                        onClick={() => {/* Retry logic */ }}
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Cancel button */}
            {!isComplete && !isFailed && onCancel && (
                <button
                    className="cancel-download-button"
                    onClick={onCancel}
                    data-testid="cancel-download-button"
                >
                    Cancel Download
                </button>
            )}
        </div>
    );
};
