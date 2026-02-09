/**
 * DownloadProgress Component
 * Shows download progress when connecting to a coach
 * Story 2.1: Browse Coaches - AC5: Background download progress indicator
 */

import './DownloadProgress.css';

interface DownloadProgressProps {
    coachId: string;
    coachName: string;
    progress: number; // 0-100
    onComplete?: () => void;
    onCancel?: () => void;
}

export function DownloadProgress({ coachName, progress, onCancel }: DownloadProgressProps) {
    return (
        <div className="download-progress" data-testid="download-progress">
            <div className="download-progress__header">
                <span className="download-progress__title">
                    Downloading {coachName}...
                </span>
                {onCancel && (
                    <button
                        className="download-progress__cancel"
                        onClick={onCancel}
                        data-testid="download-cancel"
                    >
                        Cancel
                    </button>
                )}
            </div>
            <div className="download-progress__bar">
                <div
                    className="download-progress__fill"
                    style={{ width: `${progress}%` }}
                    data-testid="download-progress-bar"
                />
            </div>
            <span className="download-progress__percent">{progress}%</span>
        </div>
    );
}
