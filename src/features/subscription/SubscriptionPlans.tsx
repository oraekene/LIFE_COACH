/**
 * SubscriptionPlans Component
 * Displays available subscription tiers with pricing
 * Story 2.2: Premium Subscription
 */

import React from 'react';
import { SubscriptionPlan, SubscriptionTier } from '../../types/Subscription';
import './SubscriptionPlans.css';

interface SubscriptionPlansProps {
    plans?: SubscriptionPlan[];
    currentTier?: SubscriptionTier;
    onSelectPlan?: (plan: SubscriptionPlan) => void;
}

export const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({
    plans = [],
    currentTier,
    onSelectPlan,
}) => {
    const handleSelectPlan = (plan: SubscriptionPlan) => {
        onSelectPlan?.(plan);
    };

    return (
        <div className="subscription-plans" data-testid="subscription-plans">
            <h2 className="plans-title">Choose Your Plan</h2>
            <div className="plans-grid">
                {plans.map((plan) => {
                    const isCurrent = currentTier === plan.tier;
                    const isUpgrade = currentTier === 'free' && plan.tier !== 'free';

                    return (
                        <div
                            key={plan.tier}
                            className={`plan-card ${isCurrent ? 'current-plan' : ''} ${plan.tier === 'pro' ? 'popular' : ''
                                }`}
                            data-testid={`plan-${plan.tier}`}
                        >
                            {plan.tier === 'pro' && (
                                <div className="popular-badge">Most Popular</div>
                            )}

                            <h3 className="plan-name">{plan.name}</h3>

                            <div className="plan-price">
                                <span className="price-amount">${plan.price}</span>
                                {plan.price > 0 && <span className="price-period">/mo</span>}
                            </div>

                            <div className="plan-coach-limit">
                                {plan.coachLimit === 'unlimited' ? (
                                    <span>Unlimited coaches</span>
                                ) : (
                                    <span>{plan.coachLimit} coaches</span>
                                )}
                            </div>

                            {plan.hasCustomCoaches && (
                                <div className="plan-custom-badge">Custom coach support</div>
                            )}

                            <ul className="plan-features">
                                {plan.features.map((feature, index) => (
                                    <li key={index}>
                                        <span className="feature-check">✓</span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            {isCurrent ? (
                                <button
                                    className="plan-button current"
                                    disabled
                                    data-testid={`current-plan-${plan.tier}`}
                                >
                                    Current Plan
                                </button>
                            ) : isUpgrade ? (
                                <button
                                    className="plan-button upgrade"
                                    onClick={() => handleSelectPlan(plan)}
                                    data-testid={`upgrade-to-${plan.tier}`}
                                >
                                    Upgrade to {plan.name}
                                </button>
                            ) : (
                                <button
                                    className="plan-button select"
                                    onClick={() => handleSelectPlan(plan)}
                                    data-testid={`select-plan-${plan.tier}`}
                                >
                                    Select {plan.name}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
