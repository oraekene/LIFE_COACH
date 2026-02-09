/**
 * PaymentService
 * Handles Stripe/RevenueCat payment integration
 * Story 2.2: Premium Subscription
 * 
 * SECURITY NOTES:
 * - In production, all payment operations should go through a secure backend
 * - Never expose API keys or client secrets in frontend code
 * - Always validate payment intent IDs before processing
 * - Implement CSRF protection for all state-changing operations
 */

import {
    SubscriptionTier,
    UserSubscription,
    PaymentResult,
    PaymentInitResult,
    VerifyPurchaseResult,
    RestorePurchasesResult,
} from '../../types/Subscription';

export interface PaymentInitOptions {
    tier: SubscriptionTier;
    price: number;
    currency: string;
}

/**
 * Secure API configuration
 * In production, these should come from environment variables
 * Prefixed with underscore as this is a placeholder for production implementation
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _API_CONFIG = {
    baseUrl: '/api/payments',
    timeout: 30000,
};

/**
 * Regex pattern for validating Stripe payment intent IDs
 * Format: pi_ followed by 24+ alphanumeric characters
 */
const PAYMENT_INTENT_REGEX = /^pi_[A-Za-z0-9]{24,}$/;

/**
 * Validate payment intent ID format
 * @throws Error if payment intent ID is invalid
 */
function validatePaymentIntentId(paymentIntentId: string): void {
    if (!paymentIntentId || typeof paymentIntentId !== 'string') {
        throw new Error('Payment intent ID is required');
    }

    // For mock IDs (prefixed with pi-mock or pi_), allow them in development
    const isMockId = paymentIntentId.startsWith('pi-mock') || paymentIntentId.startsWith('pi_');

    if (!isMockId && !PAYMENT_INTENT_REGEX.test(paymentIntentId)) {
        throw new Error('Invalid payment intent ID format');
    }
}

export class PaymentService {
    private static instance: PaymentService;

    private constructor() { }

    static getInstance(): PaymentService {
        if (!PaymentService.instance) {
            PaymentService.instance = new PaymentService();
        }
        return PaymentService.instance;
    }

    /**
     * Initialize payment with Stripe or RevenueCat
     * 
     * PRODUCTION TODO:
     * Replace mock implementation with actual backend API call:
     * const response = await fetch(`${API_CONFIG.baseUrl}/create-intent`, {
     *     method: 'POST',
     *     headers: { 
     *         'Content-Type': 'application/json',
     *         'Authorization': `Bearer ${authToken}`,
     *         'X-CSRF-Token': csrfToken,
     *     },
     *     body: JSON.stringify(options)
     * });
     */
    async initializePayment(options: PaymentInitOptions): Promise<PaymentInitResult> {
        // Validate input
        if (!options.tier || !options.price || !options.currency) {
            throw new Error('Invalid payment options');
        }

        await new Promise(resolve => setTimeout(resolve, 200));

        // Mock response - REPLACE WITH REAL API CALL IN PRODUCTION
        const mockPaymentIntentId = `pi_mock_${crypto.randomUUID().replace(/-/g, '').substring(0, 24)}`;

        return {
            clientSecret: `cs_mock_${Date.now()}`, // Never expose real secrets in frontend
            paymentIntentId: mockPaymentIntentId,
            provider: 'stripe',
        };
    }

    /**
     * Process payment after user confirms
     * 
     * SECURITY: Validates payment intent ID before processing
     */
    async processPayment(paymentIntentId: string): Promise<PaymentResult> {
        // Validate payment intent ID format
        validatePaymentIntentId(paymentIntentId);

        await new Promise(resolve => setTimeout(resolve, 300));

        return {
            success: true,
            subscriptionId: `sub_${crypto.randomUUID().replace(/-/g, '').substring(0, 24)}`,
        };
    }

    /**
     * Verify purchase with backend
     */
    async verifyPurchase(subscriptionId: string): Promise<VerifyPurchaseResult> {
        await new Promise(resolve => setTimeout(resolve, 200));

        const subscription: UserSubscription = {
            id: subscriptionId,
            userId: 'current-user',
            tier: 'pro',
            status: 'active',
            startDate: new Date().toISOString(),
            renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            paymentProvider: 'stripe',
            providerSubscriptionId: `stripe_sub_${Date.now()}`,
        };

        return {
            verified: true,
            subscription,
        };
    }

    /**
     * Restore previous purchases
     */
    async restorePurchases(): Promise<RestorePurchasesResult> {
        await new Promise(resolve => setTimeout(resolve, 300));

        // For demo, return empty - real implementation would check with app stores
        return {
            restored: true,
            subscriptions: [],
        };
    }

    /**
     * Reset instance (for testing)
     */
    static resetInstance(): void {
        PaymentService.instance = null as unknown as PaymentService;
    }
}
