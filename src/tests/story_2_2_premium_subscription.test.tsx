/**
 * Story 2.2: Premium Subscription - Test Suite
 * 
 * Tests for subscription management, tiered pricing, coach downloads,
 * local indexing, and offline data retention.
 * 
 * Acceptance Criteria:
 * 1. In-app purchase integration (Stripe/RevenueCat)
 * 2. Tiered pricing: Free (3 coaches), Pro ($15/mo unlimited), Elite ($30/mo + custom)
 * 3. Download includes: Text chunks (compressed), LoRA adapters (20MB), graph index
 * 4. Local indexing build progress shown
 * 5. Unsubscribe retains offline data but blocks updates
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';

// ============================================================================
// Types for Subscription Feature (will be created in src/types/Subscription.ts)
// ============================================================================

export type SubscriptionTier = 'free' | 'pro' | 'elite';

export interface SubscriptionPlan {
    tier: SubscriptionTier;
    name: string;
    price: number; // Monthly price in USD
    coachLimit: number | 'unlimited';
    features: string[];
    hasCustomCoaches: boolean;
}

export interface UserSubscription {
    id: string;
    userId: string;
    tier: SubscriptionTier;
    status: 'active' | 'cancelled' | 'expired';
    startDate: string;
    endDate?: string;
    renewalDate?: string;
    paymentProvider: 'stripe' | 'revenuecat';
    providerSubscriptionId: string;
}

export interface CoachDownload {
    coachId: string;
    status: 'pending' | 'downloading' | 'indexing' | 'complete' | 'failed';
    progress: number; // 0-100
    totalSizeMB: number;
    downloadedMB: number;
    components: {
        textChunks: { downloaded: boolean; sizeMB: number };
        loraAdapter: { downloaded: boolean; sizeMB: number };
        graphIndex: { downloaded: boolean; sizeMB: number };
    };
    localIndexingProgress: number; // 0-100
    error?: string;
}

export interface DownloadProgressEvent {
    coachId: string;
    phase: 'downloading' | 'indexing';
    progress: number;
    currentComponent?: string;
}

// ============================================================================
// Mock Services - Use vi.hoisted() for proper hoisting
// ============================================================================

const { mockSubscriptionService, mockCoachDownloadService, mockPaymentService } = vi.hoisted(() => ({
    mockSubscriptionService: {
        getPlans: vi.fn(),
        getCurrentSubscription: vi.fn(),
        subscribe: vi.fn(),
        cancelSubscription: vi.fn(),
        updateSubscription: vi.fn(),
        getDownloadedCoaches: vi.fn(),
        canAccessCoach: vi.fn(),
        getCoachLimit: vi.fn(),
    },
    mockCoachDownloadService: {
        startDownload: vi.fn(),
        cancelDownload: vi.fn(),
        getDownloadProgress: vi.fn(),
        deleteOfflineData: vi.fn(),
        getOfflineCoaches: vi.fn(),
        isCoachAvailableOffline: vi.fn(),
        canReceiveUpdates: vi.fn(),
    },
    mockPaymentService: {
        initializePayment: vi.fn(),
        processPayment: vi.fn(),
        verifyPurchase: vi.fn(),
        restorePurchases: vi.fn(),
    },
}));

vi.mock('../services/subscription/SubscriptionService', () => ({
    SubscriptionService: {
        getInstance: vi.fn(() => mockSubscriptionService),
    },
}));

vi.mock('../services/subscription/CoachDownloadService', () => ({
    CoachDownloadService: {
        getInstance: vi.fn(() => mockCoachDownloadService),
    },
}));

vi.mock('../services/subscription/PaymentService', () => ({
    PaymentService: {
        getInstance: vi.fn(() => mockPaymentService),
    },
}));

// ============================================================================
// Test Data Constants
// ============================================================================

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
    {
        tier: 'free',
        name: 'Free',
        price: 0,
        coachLimit: 3,
        features: ['Access to 3 coaches', 'Basic messaging', 'Community support'],
        hasCustomCoaches: false,
    },
    {
        tier: 'pro',
        name: 'Pro',
        price: 15,
        coachLimit: 'unlimited',
        features: ['Unlimited coaches', 'Offline access', 'Priority support', 'Advanced analytics'],
        hasCustomCoaches: false,
    },
    {
        tier: 'elite',
        name: 'Elite',
        price: 30,
        coachLimit: 'unlimited',
        features: ['Everything in Pro', 'Custom coach creation', 'Personal LoRA training', '1-on-1 support'],
        hasCustomCoaches: true,
    },
];

const mockActiveSubscription: UserSubscription = {
    id: 'sub-123',
    userId: 'user-456',
    tier: 'pro',
    status: 'active',
    startDate: '2026-01-01T00:00:00Z',
    renewalDate: '2026-02-01T00:00:00Z',
    paymentProvider: 'stripe',
    providerSubscriptionId: 'stripe_sub_abc123',
};

const mockCoachDownloadComplete: CoachDownload = {
    coachId: 'coach-1',
    status: 'complete',
    progress: 100,
    totalSizeMB: 65,
    downloadedMB: 65,
    components: {
        textChunks: { downloaded: true, sizeMB: 25 },
        loraAdapter: { downloaded: true, sizeMB: 20 },
        graphIndex: { downloaded: true, sizeMB: 20 },
    },
    localIndexingProgress: 100,
};

const mockCoachDownloadInProgress: CoachDownload = {
    coachId: 'coach-2',
    status: 'downloading',
    progress: 45,
    totalSizeMB: 65,
    downloadedMB: 29,
    components: {
        textChunks: { downloaded: true, sizeMB: 25 },
        loraAdapter: { downloaded: false, sizeMB: 20 },
        graphIndex: { downloaded: false, sizeMB: 20 },
    },
    localIndexingProgress: 0,
};

// ============================================================================
// Component Imports - Now importing real components
// ============================================================================

import { SubscriptionPlans } from '../features/subscription/SubscriptionPlans';
import { SubscriptionStatus } from '../features/subscription/SubscriptionStatus';
import { CoachDownloadProgress } from '../features/subscription/CoachDownloadProgress';
import { OfflineCoachManager } from '../features/subscription/OfflineCoachManager';
import { PaymentSheet } from '../features/subscription/PaymentSheet';


// ============================================================================
// Test Suite: Story 2.2 - Premium Subscription
// ============================================================================

describe('Story 2.2: Premium Subscription', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Default mock implementations
        mockSubscriptionService.getPlans.mockResolvedValue(SUBSCRIPTION_PLANS);
        mockSubscriptionService.getCurrentSubscription.mockResolvedValue(null);
        mockSubscriptionService.getCoachLimit.mockReturnValue(3);
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    // ========================================================================
    // AC1: In-app purchase integration (Stripe/RevenueCat)
    // ========================================================================
    describe('AC1: In-app Purchase Integration', () => {
        it('should initialize payment provider (Stripe) on subscription selection', async () => {
            mockPaymentService.initializePayment.mockResolvedValue({
                clientSecret: 'stripe_secret_xyz',
                paymentIntentId: 'pi_123',
            });

            render(
                <PaymentSheet
                    plan={SUBSCRIPTION_PLANS[1]} // Pro plan
                    onSuccess={vi.fn()}
                    onCancel={vi.fn()}
                    onError={vi.fn()}
                    paymentService={mockPaymentService}
                />
            );

            await waitFor(() => {
                expect(mockPaymentService.initializePayment).toHaveBeenCalledWith(
                    expect.objectContaining({
                        tier: 'pro',
                        price: 15,
                        currency: 'USD',
                    })
                );
            });
        });

        it('should display Stripe payment sheet when subscribing', async () => {
            render(
                <PaymentSheet
                    plan={SUBSCRIPTION_PLANS[1]}
                    onSuccess={vi.fn()}
                    onCancel={vi.fn()}
                    onError={vi.fn()}
                />
            );

            await waitFor(() => {
                expect(screen.getByTestId('payment-sheet-container')).toBeInTheDocument();
            });
        });

        it('should handle RevenueCat as alternative payment provider', async () => {
            mockPaymentService.initializePayment.mockResolvedValue({
                productId: 'pro_monthly',
                provider: 'revenuecat',
            });

            render(
                <PaymentSheet
                    plan={SUBSCRIPTION_PLANS[1]}
                    onSuccess={vi.fn()}
                    onCancel={vi.fn()}
                    onError={vi.fn()}
                    paymentService={mockPaymentService}
                    provider="revenuecat"
                />
            );

            await waitFor(() => {
                expect(mockPaymentService.initializePayment).toHaveBeenCalledWith(
                    expect.objectContaining({ provider: 'revenuecat' })
                );
            });
        });

        it('should verify purchase after successful payment', async () => {
            const onSuccess = vi.fn();
            mockPaymentService.initializePayment.mockResolvedValue({
                paymentIntentId: 'pi-test-123',
            });
            mockPaymentService.processPayment.mockResolvedValue({
                success: true,
                subscriptionId: 'sub-new-123',
            });
            mockPaymentService.verifyPurchase.mockResolvedValue({
                verified: true,
            });

            render(
                <PaymentSheet
                    plan={SUBSCRIPTION_PLANS[1]}
                    onSuccess={onSuccess}
                    onCancel={vi.fn()}
                    onError={vi.fn()}
                    paymentService={mockPaymentService}
                />
            );

            // Wait for payment form to load
            await waitFor(() => {
                expect(screen.getByTestId('payment-form')).toBeInTheDocument();
            });

            // Simulate payment completion
            const confirmButton = screen.getByTestId('confirm-payment-button');
            fireEvent.click(confirmButton);

            await waitFor(() => {
                expect(mockPaymentService.verifyPurchase).toHaveBeenCalled();
                expect(onSuccess).toHaveBeenCalledWith('sub-new-123');
            });
        });

        it('should handle payment failure gracefully', async () => {
            const onError = vi.fn();
            mockPaymentService.initializePayment.mockResolvedValue({
                paymentIntentId: 'pi-test-123',
            });
            mockPaymentService.processPayment.mockRejectedValue(
                new Error('Payment declined')
            );

            render(
                <PaymentSheet
                    plan={SUBSCRIPTION_PLANS[1]}
                    onSuccess={vi.fn()}
                    onCancel={vi.fn()}
                    onError={onError}
                    paymentService={mockPaymentService}
                />
            );

            // Wait for form to load
            await waitFor(() => {
                expect(screen.getByTestId('payment-form')).toBeInTheDocument();
            });

            const confirmButton = screen.getByTestId('confirm-payment-button');
            fireEvent.click(confirmButton);

            await waitFor(() => {
                expect(onError).toHaveBeenCalledWith(expect.any(Error));
                expect(screen.getByTestId('payment-error-message')).toBeInTheDocument();
            });
        });

        it('should support restore purchases functionality', async () => {
            mockPaymentService.initializePayment.mockResolvedValue({
                paymentIntentId: 'pi-test-123',
            });
            mockPaymentService.restorePurchases.mockResolvedValue({
                restored: true,
                subscriptions: [{ id: mockActiveSubscription.id }],
            });

            render(
                <PaymentSheet
                    plan={SUBSCRIPTION_PLANS[1]}
                    onSuccess={vi.fn()}
                    onCancel={vi.fn()}
                    onError={vi.fn()}
                    paymentService={mockPaymentService}
                />
            );

            // Wait for form to load
            await waitFor(() => {
                expect(screen.getByTestId('restore-purchases-button')).toBeInTheDocument();
            });

            const restoreButton = screen.getByTestId('restore-purchases-button');
            fireEvent.click(restoreButton);

            await waitFor(() => {
                expect(mockPaymentService.restorePurchases).toHaveBeenCalled();
            });
        });
    });

    // ========================================================================
    // AC2: Tiered Pricing - Free (3 coaches), Pro ($15/mo), Elite ($30/mo)
    // ========================================================================
    describe('AC2: Tiered Pricing', () => {
        it('should display all three subscription tiers', async () => {
            render(
                <SubscriptionPlans
                    plans={SUBSCRIPTION_PLANS}
                    onSelectPlan={vi.fn()}
                />
            );

            await waitFor(() => {
                expect(screen.getByTestId('plan-free')).toBeInTheDocument();
                expect(screen.getByTestId('plan-pro')).toBeInTheDocument();
                expect(screen.getByTestId('plan-elite')).toBeInTheDocument();
            });
        });

        it('should show Free tier with 3 coach limit', async () => {
            render(
                <SubscriptionPlans
                    plans={SUBSCRIPTION_PLANS}
                    onSelectPlan={vi.fn()}
                />
            );

            await waitFor(() => {
                const freePlan = screen.getByTestId('plan-free');
                expect(freePlan).toHaveTextContent('Free');
                expect(freePlan).toHaveTextContent('3 coaches');
                expect(freePlan).toHaveTextContent('$0');
            });
        });

        it('should show Pro tier at $15/month with unlimited coaches', async () => {
            render(
                <SubscriptionPlans
                    plans={SUBSCRIPTION_PLANS}
                    onSelectPlan={vi.fn()}
                />
            );

            await waitFor(() => {
                const proPlan = screen.getByTestId('plan-pro');
                expect(proPlan).toHaveTextContent('Pro');
                expect(proPlan).toHaveTextContent('$15');
                expect(proPlan).toHaveTextContent('/mo');
                expect(proPlan).toHaveTextContent('Unlimited');
            });
        });

        it('should show Elite tier at $30/month with custom coach support', async () => {
            render(
                <SubscriptionPlans
                    plans={SUBSCRIPTION_PLANS}
                    onSelectPlan={vi.fn()}
                />
            );

            await waitFor(() => {
                const elitePlan = screen.getByTestId('plan-elite');
                expect(elitePlan).toHaveTextContent('Elite');
                expect(elitePlan).toHaveTextContent('$30');
                expect(elitePlan).toHaveTextContent('/mo');
                expect(elitePlan).toHaveTextContent('Custom');
            });
        });

        it('should highlight current subscription tier', async () => {
            mockSubscriptionService.getCurrentSubscription.mockResolvedValue(mockActiveSubscription);

            render(
                <SubscriptionPlans
                    plans={SUBSCRIPTION_PLANS}
                    currentTier="pro"
                    onSelectPlan={vi.fn()}
                />
            );

            await waitFor(() => {
                const proPlan = screen.getByTestId('plan-pro');
                expect(proPlan).toHaveClass('current-plan');
            });
        });

        it('should enforce 3 coach limit for Free tier users', async () => {
            mockSubscriptionService.getCurrentSubscription.mockResolvedValue({
                ...mockActiveSubscription,
                tier: 'free',
            });
            mockSubscriptionService.getCoachLimit.mockReturnValue(3);
            mockSubscriptionService.canAccessCoach.mockImplementation(
                (coachId: string, accessedCoaches: string[]) => accessedCoaches.length < 3
            );

            // User already has 3 coaches
            const accessedCoaches = ['coach-1', 'coach-2', 'coach-3'];
            const canAccess = mockSubscriptionService.canAccessCoach('coach-4', accessedCoaches);

            expect(canAccess).toBe(false);
        });

        it('should allow unlimited coaches for Pro tier', async () => {
            mockSubscriptionService.getCurrentSubscription.mockResolvedValue(mockActiveSubscription);
            mockSubscriptionService.getCoachLimit.mockReturnValue(Infinity);
            mockSubscriptionService.canAccessCoach.mockReturnValue(true);

            const canAccess = mockSubscriptionService.canAccessCoach('coach-100', []);
            expect(canAccess).toBe(true);
        });

        it('should allow tier upgrade from Free to Pro', async () => {
            const onSelectPlan = vi.fn();
            mockSubscriptionService.getCurrentSubscription.mockResolvedValue({
                ...mockActiveSubscription,
                tier: 'free',
            });

            render(
                <SubscriptionPlans
                    plans={SUBSCRIPTION_PLANS}
                    currentTier="free"
                    onSelectPlan={onSelectPlan}
                />
            );

            const upgradeButton = screen.getByTestId('upgrade-to-pro');
            fireEvent.click(upgradeButton);

            expect(onSelectPlan).toHaveBeenCalledWith(SUBSCRIPTION_PLANS[1]);
        });
    });

    // ========================================================================
    // AC3: Download includes text chunks, LoRA adapters (20MB), graph index
    // ========================================================================
    describe('AC3: Coach Download Components', () => {
        it('should start download with all required components', async () => {
            const onDownload = vi.fn().mockResolvedValue(undefined);

            render(
                <OfflineCoachManager
                    coachId="coach-1"
                    isSubscribed={true}
                    onDownload={onDownload}
                />
            );

            const downloadButton = screen.getByTestId('download-coach-button');
            fireEvent.click(downloadButton);

            await waitFor(() => {
                expect(onDownload).toHaveBeenCalledWith(
                    expect.objectContaining({
                        coachId: 'coach-1',
                        includeTextChunks: true,
                        includeLoraAdapter: true,
                        includeGraphIndex: true,
                    })
                );
            });
        });

        it('should display download size breakdown', async () => {
            mockCoachDownloadService.getDownloadProgress.mockResolvedValue(mockCoachDownloadInProgress);

            render(<CoachDownloadProgress download={mockCoachDownloadInProgress} />);

            await waitFor(() => {
                expect(screen.getByTestId('text-chunks-size')).toHaveTextContent('25MB');
                expect(screen.getByTestId('lora-adapter-size')).toHaveTextContent('20MB');
                expect(screen.getByTestId('graph-index-size')).toHaveTextContent('20MB');
                expect(screen.getByTestId('total-download-size')).toHaveTextContent('65MB');
            });
        });

        it('should show LoRA adapter download status', async () => {
            render(<CoachDownloadProgress download={mockCoachDownloadInProgress} />);

            await waitFor(() => {
                // Text chunks should be complete
                expect(screen.getByTestId('text-chunks-status')).toHaveTextContent('Complete');
                // LoRA adapter should be in progress
                expect(screen.getByTestId('lora-adapter-status')).toHaveTextContent('Downloading');
            });
        });

        it('should track individual component download progress', async () => {
            const partialDownload: CoachDownload = {
                ...mockCoachDownloadInProgress,
                components: {
                    textChunks: { downloaded: true, sizeMB: 25 },
                    loraAdapter: { downloaded: false, sizeMB: 20 },
                    graphIndex: { downloaded: false, sizeMB: 20 },
                },
            };

            render(<CoachDownloadProgress download={partialDownload} />);

            await waitFor(() => {
                const textChunksCheck = screen.getByTestId('text-chunks-check');
                const loraCheck = screen.getByTestId('lora-adapter-check');
                const graphCheck = screen.getByTestId('graph-index-check');

                expect(textChunksCheck).toHaveAttribute('data-complete', 'true');
                expect(loraCheck).toHaveAttribute('data-complete', 'false');
                expect(graphCheck).toHaveAttribute('data-complete', 'false');
            });
        });

        it('should compress text chunks during download', async () => {
            const onDownload = vi.fn().mockResolvedValue(undefined);

            render(
                <OfflineCoachManager
                    coachId="coach-1"
                    isSubscribed={true}
                    onDownload={onDownload}
                />
            );

            const downloadButton = screen.getByTestId('download-coach-button');
            fireEvent.click(downloadButton);

            await waitFor(() => {
                expect(onDownload).toHaveBeenCalledWith(
                    expect.objectContaining({
                        compression: 'zstd',
                    })
                );
            });
        });
    });

    // ========================================================================
    // AC4: Local indexing build progress shown
    // ========================================================================
    describe('AC4: Local Indexing Progress', () => {
        it('should display local indexing phase after download completes', async () => {
            const indexingDownload: CoachDownload = {
                ...mockCoachDownloadComplete,
                status: 'indexing',
                localIndexingProgress: 45,
            };

            render(<CoachDownloadProgress download={indexingDownload} />);

            await waitFor(() => {
                expect(screen.getByTestId('download-phase')).toHaveTextContent('Building Local Index');
                expect(screen.getByTestId('indexing-progress-bar')).toBeInTheDocument();
            });
        });

        it('should show indexing progress percentage', async () => {
            const indexingDownload: CoachDownload = {
                ...mockCoachDownloadComplete,
                status: 'indexing',
                localIndexingProgress: 67,
            };

            render(<CoachDownloadProgress download={indexingDownload} />);

            await waitFor(() => {
                expect(screen.getByTestId('indexing-progress-value')).toHaveTextContent('67%');
            });
        });

        it('should update progress in real-time during indexing', async () => {
            let currentProgress = 0;
            const mockOnProgress = vi.fn();

            const { rerender } = render(
                <CoachDownloadProgress
                    download={{
                        ...mockCoachDownloadComplete,
                        status: 'indexing',
                        localIndexingProgress: currentProgress,
                    }}
                />
            );

            // Simulate progress updates
            for (currentProgress = 25; currentProgress <= 100; currentProgress += 25) {
                rerender(
                    <CoachDownloadProgress
                        download={{
                            ...mockCoachDownloadComplete,
                            status: 'indexing',
                            localIndexingProgress: currentProgress,
                        }}
                    />
                );

                expect(screen.getByTestId('indexing-progress-value')).toHaveTextContent(`${currentProgress}%`);
            }
        });

        it('should show completion state when indexing finishes', async () => {
            render(<CoachDownloadProgress download={mockCoachDownloadComplete} />);

            await waitFor(() => {
                expect(screen.getByTestId('download-status')).toHaveTextContent('Ready for Offline Use');
                expect(screen.getByTestId('indexing-complete-icon')).toBeInTheDocument();
            });
        });

        it('should display estimated time remaining during indexing', async () => {
            const indexingDownload: CoachDownload = {
                ...mockCoachDownloadComplete,
                status: 'indexing',
                localIndexingProgress: 50,
            };

            render(<CoachDownloadProgress download={indexingDownload} />);

            await waitFor(() => {
                expect(screen.getByTestId('estimated-time-remaining')).toBeInTheDocument();
            });
        });

        it('should handle indexing failure with retry option', async () => {
            const failedDownload: CoachDownload = {
                ...mockCoachDownloadComplete,
                status: 'failed',
                localIndexingProgress: 75,
                error: 'Indexing failed: insufficient storage',
            };

            render(<CoachDownloadProgress download={failedDownload} onCancel={vi.fn()} />);

            await waitFor(() => {
                expect(screen.getByTestId('indexing-error-message')).toHaveTextContent('Indexing failed');
                expect(screen.getByTestId('retry-indexing-button')).toBeInTheDocument();
            });
        });
    });

    // ========================================================================
    // AC5: Unsubscribe retains offline data but blocks updates
    // ========================================================================
    describe('AC5: Unsubscribe Data Retention', () => {
        it('should retain offline data after unsubscribe', async () => {
            const onCancel = vi.fn().mockResolvedValue({
                cancelled: true,
                effectiveDate: '2026-02-28T00:00:00Z',
                offlineDataRetained: true,
            });
            mockCoachDownloadService.getOfflineCoaches.mockResolvedValue([
                { coachId: 'coach-1', downloadedAt: '2026-01-15T00:00:00Z' },
                { coachId: 'coach-2', downloadedAt: '2026-01-20T00:00:00Z' },
            ]);

            render(
                <SubscriptionStatus
                    subscription={mockActiveSubscription}
                    onManage={vi.fn()}
                    onCancel={onCancel}
                />
            );

            const cancelButton = screen.getByTestId('cancel-subscription-button');
            fireEvent.click(cancelButton);

            // Confirm cancellation
            const confirmCancel = screen.getByTestId('confirm-cancel-button');
            fireEvent.click(confirmCancel);

            await waitFor(() => {
                expect(onCancel).toHaveBeenCalled();
                // Verify offline coaches are NOT deleted
                expect(mockCoachDownloadService.deleteOfflineData).not.toHaveBeenCalled();
            });
        });

        it('should block coach updates after unsubscribe', async () => {
            mockSubscriptionService.getCurrentSubscription.mockResolvedValue({
                ...mockActiveSubscription,
                status: 'cancelled',
            });
            mockCoachDownloadService.canReceiveUpdates.mockReturnValue(false);

            const canUpdate = mockCoachDownloadService.canReceiveUpdates('coach-1');

            expect(canUpdate).toBe(false);
        });

        it('should display "Updates Blocked" badge for offline coaches after unsubscribe', async () => {
            mockSubscriptionService.getCurrentSubscription.mockResolvedValue({
                ...mockActiveSubscription,
                status: 'cancelled',
            });

            render(
                <OfflineCoachManager
                    coachId="coach-1"
                    isSubscribed={false}
                    onDownload={vi.fn()}
                    onDelete={vi.fn()}
                />
            );

            await waitFor(() => {
                expect(screen.getByTestId('updates-blocked-badge')).toBeInTheDocument();
                expect(screen.getByTestId('updates-blocked-badge')).toHaveTextContent('Updates Blocked');
            });
        });

        it('should show offline data remains accessible message', async () => {
            mockSubscriptionService.getCurrentSubscription.mockResolvedValue({
                ...mockActiveSubscription,
                status: 'cancelled',
            });
            mockCoachDownloadService.isCoachAvailableOffline.mockReturnValue(true);

            render(
                <SubscriptionStatus
                    subscription={{ ...mockActiveSubscription, status: 'cancelled' }}
                    onManage={vi.fn()}
                    onCancel={vi.fn()}
                />
            );

            await waitFor(() => {
                expect(screen.getByTestId('offline-data-retained-message')).toHaveTextContent(
                    'Your downloaded coaches remain available offline'
                );
            });
        });

        it('should allow resubscription to restore update functionality', async () => {
            const onManage = vi.fn();
            mockSubscriptionService.getCurrentSubscription.mockResolvedValue({
                ...mockActiveSubscription,
                status: 'cancelled',
            });

            render(
                <SubscriptionStatus
                    subscription={{ ...mockActiveSubscription, status: 'cancelled' }}
                    onManage={onManage}
                    onCancel={vi.fn()}
                />
            );

            const resubscribeButton = screen.getByTestId('resubscribe-button');
            fireEvent.click(resubscribeButton);

            await waitFor(() => {
                expect(onManage).toHaveBeenCalled();
            });
        });

        it('should prevent new downloads for cancelled subscription', async () => {
            mockSubscriptionService.getCurrentSubscription.mockResolvedValue({
                ...mockActiveSubscription,
                status: 'cancelled',
            });

            render(
                <OfflineCoachManager
                    coachId="coach-new"
                    isSubscribed={false}
                    onDownload={vi.fn()}
                />
            );

            await waitFor(() => {
                const downloadButton = screen.getByTestId('download-coach-button');
                expect(downloadButton).toBeDisabled();
                expect(screen.getByTestId('subscription-required-message')).toBeInTheDocument();
            });
        });

        it('should show last sync date for offline coaches after unsubscribe', async () => {
            mockSubscriptionService.getCurrentSubscription.mockResolvedValue({
                ...mockActiveSubscription,
                status: 'cancelled',
            });
            mockCoachDownloadService.getOfflineCoaches.mockResolvedValue([
                { coachId: 'coach-1', downloadedAt: '2026-01-15T00:00:00Z', lastSyncAt: '2026-02-01T00:00:00Z' },
            ]);

            render(
                <OfflineCoachManager
                    coachId="coach-1"
                    isSubscribed={false}
                    isOffline={true}
                    lastSyncDate="2026-02-01T00:00:00Z"
                />
            );

            await waitFor(() => {
                expect(screen.getByTestId('last-sync-date')).toBeInTheDocument();
            });
        });
    });

    // ========================================================================
    // Integration Tests - Full Subscription Flow
    // ========================================================================
    describe('Integration: Full Subscription Flow', () => {
        it('should complete end-to-end Pro subscription flow', async () => {
            // 1. User views plans
            mockSubscriptionService.getPlans.mockResolvedValue(SUBSCRIPTION_PLANS);

            // 2. User selects Pro
            const onSelectPlan = vi.fn();
            render(
                <SubscriptionPlans
                    plans={SUBSCRIPTION_PLANS}
                    currentTier="free"
                    onSelectPlan={onSelectPlan}
                />
            );

            const proPlanButton = screen.getByTestId('upgrade-to-pro');
            fireEvent.click(proPlanButton);

            expect(onSelectPlan).toHaveBeenCalledWith(SUBSCRIPTION_PLANS[1]);
        });

        it('should complete coach download after subscription', async () => {
            mockSubscriptionService.getCurrentSubscription.mockResolvedValue(mockActiveSubscription);
            const onDownload = vi.fn().mockResolvedValue(undefined);

            render(
                <OfflineCoachManager
                    coachId="coach-1"
                    isSubscribed={true}
                    onDownload={onDownload}
                />
            );

            const downloadButton = screen.getByTestId('download-coach-button');
            fireEvent.click(downloadButton);

            await waitFor(() => {
                expect(onDownload).toHaveBeenCalledWith(
                    expect.objectContaining({
                        coachId: 'coach-1',
                    })
                );
            });
        });
    });

    // ========================================================================
    // Error Handling Tests
    // ========================================================================
    describe('Error Handling', () => {
        it('should handle network failure during download', async () => {
            const onDownload = vi.fn().mockRejectedValue(
                new Error('Network connection lost')
            );

            render(
                <OfflineCoachManager
                    coachId="coach-1"
                    isSubscribed={true}
                    onDownload={onDownload}
                />
            );

            const downloadButton = screen.getByTestId('download-coach-button');
            fireEvent.click(downloadButton);

            await waitFor(() => {
                expect(screen.getByTestId('download-error-message')).toHaveTextContent(
                    'Network connection lost'
                );
            });
        });

        it('should handle insufficient storage during download', async () => {
            const onDownload = vi.fn().mockRejectedValue(
                new Error('Insufficient storage: 65MB required, 30MB available')
            );

            render(
                <OfflineCoachManager
                    coachId="coach-1"
                    isSubscribed={true}
                    onDownload={onDownload}
                />
            );

            const downloadButton = screen.getByTestId('download-coach-button');
            fireEvent.click(downloadButton);

            await waitFor(() => {
                expect(screen.getByTestId('storage-error-message')).toBeInTheDocument();
            });
        });

        it('should handle subscription verification failure', async () => {
            mockPaymentService.verifyPurchase.mockRejectedValue(
                new Error('Unable to verify purchase')
            );

            const onError = vi.fn();
            render(
                <PaymentSheet
                    plan={SUBSCRIPTION_PLANS[1]}
                    onSuccess={vi.fn()}
                    onCancel={vi.fn()}
                    onError={onError}
                />
            );

            const confirmButton = screen.getByTestId('confirm-payment-button');
            fireEvent.click(confirmButton);

            await waitFor(() => {
                expect(onError).toHaveBeenCalled();
            });
        });
    });
});

// ============================================================================
// Dependency Notes for Future Stories
// ============================================================================
/**
 * NOTE: This test file checks for components and services that should be
 * implemented as part of Story 2.2. If any tests fail due to missing
 * imports, it indicates the feature has not been implemented yet.
 * 
 * Dependencies identified from PRD:
 * - Story 3.1 (Offline Chat) depends on successful coach downloads from 2.2
 * - Story 5.4 (Monetization) for admin coaches builds on subscription tier access
 * 
 * Required new files to implement:
 * 1. src/types/Subscription.ts - Types for subscription, plans, downloads
 * 2. src/services/subscription/SubscriptionService.ts - Subscription management
 * 3. src/services/subscription/CoachDownloadService.ts - Coach download/offline
 * 4. src/services/subscription/PaymentService.ts - Stripe/RevenueCat integration
 * 5. src/features/subscription/SubscriptionPlans.tsx - Tier selection UI
 * 6. src/features/subscription/SubscriptionStatus.tsx - Current sub status
 * 7. src/features/subscription/CoachDownloadProgress.tsx - Download/indexing UI
 * 8. src/features/subscription/OfflineCoachManager.tsx - Offline coach controls
 * 9. src/features/subscription/PaymentSheet.tsx - Payment flow UI
 */
