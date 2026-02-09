/**
 * SubscriptionStatus Component
 * Displays current subscription status and management options
 * Story 2.2: Premium Subscription
 */

import React, { useState } from 'react';
import { UserSubscription } from '../../types/Subscription';
import './SubscriptionStatus.css';

interface SubscriptionStatusProps {
    subscription?: UserSubscription | null;
    onManage?: () => void;
    onCancel?: () => void;
}

export const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({
    subscription,
    onManage,
    onCancel,
}) => {
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    const handleCancelClick = () => {
        setShowCancelConfirm(true);
    };

    const handleConfirmCancel = () => {
        onCancel?.();
        setShowCancelConfirm(false);
    };

    const handleCancelConfirmClose = () => {
        setShowCancelConfirm(false);
    };

    if (!subscription) {
        return (
            <div className="subscription-status no-subscription" data-testid="no-subscription">
                <p>No active subscription</p>
            </div>
        );
    }

    const isCancelled = subscription.status === 'cancelled';
    const tierLabel = subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1);

    return (
        <div className="subscription-status" data-testid="subscription-status">
            <div className="status-header">
                <h3>Your Subscription</h3>
                <span className={`status-badge ${subscription.status}`}>
                    {subscription.status === 'active' ? 'Active' : 'Cancelled'}
                </span>
            </div>

            <div className="status-details">
                <div className="status-tier">
                    <span className="label">Plan:</span>
                    <span className="value">{tierLabel}</span>
                </div>

                {subscription.renewalDate && subscription.status === 'active' && (
                    <div className="status-renewal">
                        <span className="label">Renews:</span>
                        <span className="value">
                            {new Date(subscription.renewalDate).toLocaleDateString()}
                        </span>
                    </div>
                )}

                {subscription.endDate && isCancelled && (
                    <div className="status-end">
                        <span className="label">Access until:</span>
                        <span className="value">
                            {new Date(subscription.endDate).toLocaleDateString()}
                        </span>
                    </div>
                )}
            </div>

            {isCancelled && (
                <div
                    className="offline-data-message"
                    data-testid="offline-data-retained-message"
                >
                    Your downloaded coaches remain available offline
                </div>
            )}

            <div className="status-actions">
                {!isCancelled ? (
                    <>
                        <button
                            className="manage-button"
                            onClick={onManage}
                            data-testid="manage-subscription-button"
                        >
                            Manage Subscription
                        </button>
                        <button
                            className="cancel-button"
                            onClick={handleCancelClick}
                            data-testid="cancel-subscription-button"
                        >
                            Cancel Subscription
                        </button>
                    </>
                ) : (
                    <button
                        className="resubscribe-button"
                        onClick={onManage}
                        data-testid="resubscribe-button"
                    >
                        Resubscribe
                    </button>
                )}
            </div>

            {showCancelConfirm && (
                <div className="cancel-confirm-modal" data-testid="cancel-confirm-modal">
                    <div className="modal-content">
                        <h4>Cancel Subscription?</h4>
                        <p>
                            Your subscription will remain active until the end of the current
                            billing period. Downloaded coaches will remain available offline.
                        </p>
                        <div className="modal-actions">
                            <button
                                className="confirm-cancel"
                                onClick={handleConfirmCancel}
                                data-testid="confirm-cancel-button"
                            >
                                Yes, Cancel
                            </button>
                            <button
                                className="keep-subscription"
                                onClick={handleCancelConfirmClose}
                                data-testid="keep-subscription-button"
                            >
                                Keep Subscription
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
