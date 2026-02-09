/**
 * PaymentSheet Component
 * Handles payment flow with Stripe/RevenueCat
 * Story 2.2: Premium Subscription
 */

import React, { useState, useEffect } from 'react';
import { SubscriptionPlan } from '../../types/Subscription';
import { PaymentService } from '../../services/subscription/PaymentService';
import './PaymentSheet.css';

export interface PaymentServiceInterface {
    initializePayment: (params: { tier: string; price: number; currency: string; provider?: string }) => Promise<{ paymentIntentId?: string; provider?: string }>;
    processPayment: (paymentIntentId: string) => Promise<{ success: boolean; subscriptionId?: string; error?: string }>;
    verifyPurchase: (subscriptionId: string) => Promise<{ verified: boolean }>;
    restorePurchases: () => Promise<{ restored: boolean; subscriptions: { id: string }[] }>;
}

interface PaymentSheetProps {
    plan: SubscriptionPlan;
    onSuccess?: (subscriptionId: string) => void;
    onCancel?: () => void;
    onError?: (error: Error) => void;
    paymentService?: PaymentServiceInterface;
    provider?: 'stripe' | 'revenuecat';
}

export const PaymentSheet: React.FC<PaymentSheetProps> = ({
    plan,
    onSuccess,
    onCancel,
    onError,
    paymentService: injectedPaymentService,
    provider = 'stripe',
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

    const getPaymentService = (): PaymentServiceInterface => {
        if (injectedPaymentService) return injectedPaymentService;
        return PaymentService.getInstance();
    };

    useEffect(() => {
        initializePayment();
    }, [plan]);

    const initializePayment = async () => {
        try {
            setIsLoading(true);
            const service = getPaymentService();
            const result = await service.initializePayment({
                tier: plan.tier,
                price: plan.price,
                currency: 'USD',
                provider,
            });
            setPaymentIntentId(result.paymentIntentId || 'pi-mock');
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            setPaymentError('Failed to initialize payment');
            onError?.(error instanceof Error ? error : new Error('Unknown error'));
        }
    };

    const handleConfirmPayment = async () => {
        if (!paymentIntentId) return;

        try {
            setIsProcessing(true);
            setPaymentError(null);

            const service = getPaymentService();
            const result = await service.processPayment(paymentIntentId);

            if (result.success && result.subscriptionId) {
                // Verify the purchase
                const verification = await service.verifyPurchase(result.subscriptionId);
                if (verification.verified) {
                    onSuccess?.(result.subscriptionId);
                } else {
                    throw new Error('Unable to verify purchase');
                }
            } else {
                throw new Error(result.error || 'Payment failed');
            }
        } catch (error) {
            setPaymentError(error instanceof Error ? error.message : 'Payment failed');
            onError?.(error instanceof Error ? error : new Error('Payment failed'));
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRestorePurchases = async () => {
        try {
            setIsProcessing(true);
            const service = getPaymentService();
            const result = await service.restorePurchases();

            if (result.restored && result.subscriptions.length > 0) {
                const latest = result.subscriptions[0];
                onSuccess?.(latest.id);
            }
        } catch (error) {
            setPaymentError('Could not restore purchases');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="payment-sheet" data-testid="payment-sheet-container">
            <div className="payment-sheet-content">
                <div className="payment-header">
                    <h3>Subscribe to {plan.name}</h3>
                    <button
                        className="close-button"
                        onClick={onCancel}
                        data-testid="close-payment-button"
                    >
                        ×
                    </button>
                </div>

                <div className="plan-summary">
                    <div className="plan-name">{plan.name} Plan</div>
                    <div className="plan-price">
                        ${plan.price}<span className="price-period">/month</span>
                    </div>
                </div>

                <div className="payment-features">
                    <h4>What's Included:</h4>
                    <ul>
                        {plan.features.map((feature, index) => (
                            <li key={index}>
                                <span className="check">✓</span> {feature}
                            </li>
                        ))}
                    </ul>
                </div>

                {isLoading ? (
                    <div className="loading-payment" data-testid="payment-loading">
                        Initializing payment...
                    </div>
                ) : (
                    <>
                        <div className="payment-form" data-testid="payment-form">
                            {/* Stripe Elements would be rendered here */}
                            <div className="card-element-placeholder">
                                <div className="mock-card-input">
                                    **** **** **** 4242
                                </div>
                            </div>
                        </div>

                        {paymentError && (
                            <div
                                className="payment-error"
                                data-testid="payment-error-message"
                            >
                                {paymentError}
                            </div>
                        )}

                        <button
                            className="confirm-payment-button"
                            onClick={handleConfirmPayment}
                            disabled={isProcessing}
                            data-testid="confirm-payment-button"
                        >
                            {isProcessing ? 'Processing...' : `Pay $${plan.price}/month`}
                        </button>

                        <button
                            className="restore-purchases-button"
                            onClick={handleRestorePurchases}
                            disabled={isProcessing}
                            data-testid="restore-purchases-button"
                        >
                            Restore Purchases
                        </button>
                    </>
                )}

                <p className="payment-terms">
                    By subscribing, you agree to our Terms of Service and Privacy Policy.
                    You can cancel anytime.
                </p>
            </div>
        </div>
    );
};
