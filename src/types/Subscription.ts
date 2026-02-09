/**
 * Subscription Type Definitions
 * Story 2.2: Premium Subscription
 */

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

export interface OfflineCoach {
    coachId: string;
    downloadedAt: string;
    lastSyncAt?: string;
}

export interface PaymentResult {
    success: boolean;
    subscriptionId?: string;
    error?: string;
}

export interface PaymentInitResult {
    clientSecret?: string;
    paymentIntentId?: string;
    productId?: string;
    provider: 'stripe' | 'revenuecat';
}

export interface VerifyPurchaseResult {
    verified: boolean;
    subscription?: UserSubscription;
}

export interface RestorePurchasesResult {
    restored: boolean;
    subscriptions: UserSubscription[];
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
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
