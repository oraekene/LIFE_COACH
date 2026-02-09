/**
 * SubscriptionService
 * Manages user subscriptions and plan access
 * Story 2.2: Premium Subscription
 * 
 * SECURITY NOTES:
 * - Client-side subscription checks are for UX only
 * - All premium feature access must be verified server-side
 * - Subscription state should be refreshed from backend periodically
 */

import {
    SubscriptionPlan,
    UserSubscription,
    SubscriptionTier,
    SUBSCRIPTION_PLANS,
} from '../../types/Subscription';

export class SubscriptionService {
    private static instance: SubscriptionService;
    private currentSubscription: UserSubscription | null = null;
    private accessedCoaches: string[] = [];

    private constructor() { }

    static getInstance(): SubscriptionService {
        if (!SubscriptionService.instance) {
            SubscriptionService.instance = new SubscriptionService();
        }
        return SubscriptionService.instance;
    }

    /**
     * Get all available subscription plans
     */
    async getPlans(): Promise<SubscriptionPlan[]> {
        await new Promise(resolve => setTimeout(resolve, 100));
        return SUBSCRIPTION_PLANS;
    }

    /**
     * Get current user subscription
     */
    async getCurrentSubscription(): Promise<UserSubscription | null> {
        await new Promise(resolve => setTimeout(resolve, 100));
        return this.currentSubscription;
    }

    /**
     * Set current subscription (used after successful payment)
     * 
     * NOTE: In production, always verify subscription status with backend
     * before granting access to premium features.
     */
    setCurrentSubscription(subscription: UserSubscription | null): void {
        this.currentSubscription = subscription;
    }

    /**
     * Verify subscription with backend server
     * 
     * PRODUCTION TODO: Implement this to validate subscription server-side
     * This is critical for preventing client-side subscription spoofing.
     * 
     * @example
     * const isValid = await subscriptionService.verifySubscriptionWithServer();
     * if (!isValid) {
     *     // Handle invalid/expired subscription
     * }
     */
    async verifySubscriptionWithServer(): Promise<boolean> {
        // MOCK: In production, call your backend API
        // const response = await fetch('/api/subscriptions/verify', {
        //     headers: { 'Authorization': `Bearer ${authToken}` }
        // });
        // return response.ok;
        return this.currentSubscription?.status === 'active' || false;
    }

    /**
     * Subscribe to a plan
     */
    async subscribe(tier: SubscriptionTier): Promise<UserSubscription> {
        await new Promise(resolve => setTimeout(resolve, 200));

        const subscription: UserSubscription = {
            id: `sub-${Date.now()}`,
            userId: 'current-user',
            tier,
            status: 'active',
            startDate: new Date().toISOString(),
            renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            paymentProvider: 'stripe',
            providerSubscriptionId: `stripe_sub_${Date.now()}`,
        };

        this.currentSubscription = subscription;
        return subscription;
    }

    /**
     * Cancel subscription
     */
    async cancelSubscription(): Promise<{
        cancelled: boolean;
        effectiveDate: string;
        offlineDataRetained: boolean;
    }> {
        await new Promise(resolve => setTimeout(resolve, 200));

        if (this.currentSubscription) {
            this.currentSubscription = {
                ...this.currentSubscription,
                status: 'cancelled',
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            };
        }

        return {
            cancelled: true,
            effectiveDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            offlineDataRetained: true,
        };
    }

    /**
     * Update subscription tier
     */
    async updateSubscription(tier: SubscriptionTier): Promise<UserSubscription> {
        await new Promise(resolve => setTimeout(resolve, 200));

        if (this.currentSubscription) {
            this.currentSubscription = {
                ...this.currentSubscription,
                tier,
            };
            return this.currentSubscription;
        }

        return this.subscribe(tier);
    }

    /**
     * Check if user can access a coach based on subscription tier
     */
    canAccessCoach(coachId: string, accessedCoaches: string[]): boolean {
        if (!this.currentSubscription) {
            // Free tier default
            return accessedCoaches.length < 3 || accessedCoaches.includes(coachId);
        }

        if (this.currentSubscription.tier === 'free') {
            return accessedCoaches.length < 3 || accessedCoaches.includes(coachId);
        }

        // Pro and Elite have unlimited access
        return true;
    }

    /**
     * Get coach limit for current subscription
     */
    getCoachLimit(): number {
        if (!this.currentSubscription || this.currentSubscription.tier === 'free') {
            return 3;
        }
        return Infinity;
    }

    /**
     * Get list of coaches user has accessed
     */
    getAccessedCoaches(): string[] {
        return [...this.accessedCoaches];
    }

    /**
     * Add coach to accessed list
     */
    addAccessedCoach(coachId: string): void {
        if (!this.accessedCoaches.includes(coachId)) {
            this.accessedCoaches.push(coachId);
        }
    }

    /**
     * Reset instance (for testing)
     */
    static resetInstance(): void {
        SubscriptionService.instance = null as unknown as SubscriptionService;
    }
}
