import { useEffect } from 'react';
import { useSubscriptionStore } from '../stores/useSubscriptionStore';
import { SubscriptionTier, SubscriptionPlan } from '../types/Subscription';
import { Check, Star, Zap } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { Button } from '../components/ui/Button';

export default function SubscriptionPage() {
    const {
        subscription,
        plans,
        isLoading,
        error,
        initialize,
        upgradeSubscription
    } = useSubscriptionStore();

    const { userId } = useAuth();

    useEffect(() => {
        if (userId) {
            initialize(userId);
        }
    }, [userId, initialize]);

    const handleUpgrade = async (tier: SubscriptionTier) => {
        await upgradeSubscription(tier);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-neutral-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-neutral-900 sm:text-4xl font-display">
                        Unlock Your Full Potential
                    </h2>
                    <p className="mt-4 text-xl text-neutral-600">
                        Choose the plan that fits your personal growth journey
                    </p>
                </div>

                {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-semantic-error/20 rounded-md max-w-2xl mx-auto">
                        <p className="text-semantic-error text-center">{error}</p>
                    </div>
                )}

                <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
                    {plans.map((plan: SubscriptionPlan) => {
                        const isCurrentPlan = subscription?.tier === plan.tier || (!subscription && plan.tier === 'free');
                        const isElite = plan.tier === 'elite';

                        return (
                            <div
                                key={plan.tier}
                                className={`
                                    rounded-lg shadow-lg divide-y divide-neutral-200 bg-white flex flex-col
                                    ${isElite ? 'border-2 border-brand-primary relative' : 'border border-neutral-200'}
                                `}
                            >
                                {isElite && (
                                    <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-brand-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                        Popular
                                    </div>
                                )}
                                <div className="p-6">
                                    <h3 className="text-2xl font-semibold text-neutral-900 flex items-center gap-2 font-display">
                                        {plan.tier === 'elite' && <Star className="h-6 w-6 text-warning fill-current" />}
                                        {plan.tier === 'pro' && <Zap className="h-6 w-6 text-brand-primary fill-current" />}
                                        {plan.name}
                                    </h3>
                                    <p className="mt-8">
                                        <span className="text-4xl font-extrabold text-neutral-900 font-display">${plan.price}</span>
                                        <span className="text-base font-medium text-neutral-500">/mo</span>
                                    </p>
                                    <Button
                                        onClick={() => handleUpgrade(plan.tier)}
                                        disabled={isCurrentPlan || isLoading}
                                        className="mt-8 w-full"
                                        variant={isCurrentPlan ? 'ghost' : isElite ? 'primary' : 'secondary'}
                                    >
                                        {isCurrentPlan ? 'Current Plan' : `Upgrade to ${plan.name}`}
                                    </Button>
                                </div>
                                <div className="pt-6 pb-8 px-6 flex-1">
                                    <h4 className="text-sm font-medium text-neutral-900 tracking-wide uppercase">
                                        What's included
                                    </h4>
                                    <ul className="mt-6 space-y-4">
                                        {plan.features.map((feature: string) => (
                                            <li key={feature} className="flex space-x-3">
                                                <Check className="flex-shrink-0 h-5 w-5 text-success" />
                                                <span className="text-sm text-neutral-500">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
