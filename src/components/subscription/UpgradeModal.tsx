
import { useSubscriptionStore } from '../../stores/useSubscriptionStore';
import { SubscriptionTier } from '../../types/Subscription';
import { X, Lock, Check } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    requiredTier?: SubscriptionTier;
    featureName?: string;
}

export default function UpgradeModal({
    isOpen,
    onClose,
    requiredTier = 'pro',
    featureName = 'this feature'
}: UpgradeModalProps) {
    const { upgradeSubscription, isLoading, error } = useSubscriptionStore();

    if (!isOpen) return null;

    const handleUpgrade = async () => {
        await upgradeSubscription(requiredTier);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                    aria-hidden="true"
                    onClick={onClose}
                ></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-brand-primary/10 sm:mx-0 sm:h-10 sm:w-10">
                                <Lock className="h-6 w-6 text-brand-primary" aria-hidden="true" />
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                <h3 className="text-lg leading-6 font-medium text-neutral-900 font-display" id="modal-title">
                                    Upgrade to {requiredTier === 'elite' ? 'Elite' : 'Pro'}
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm text-neutral-500">
                                        Unlock {featureName} and much more by upgrading your subscription.
                                    </p>

                                    <ul className="mt-4 space-y-2">
                                        <li className="flex items-center text-sm text-neutral-600">
                                            <Check className="h-4 w-4 text-success mr-2" />
                                            Unlimited Coaches
                                        </li>
                                        <li className="flex items-center text-sm text-neutral-600">
                                            <Check className="h-4 w-4 text-success mr-2" />
                                            Advanced AI Models
                                        </li>
                                        {requiredTier === 'elite' && (
                                            <li className="flex items-center text-sm text-neutral-600">
                                                <Check className="h-4 w-4 text-success mr-2" />
                                                Priority Support
                                            </li>
                                        )}
                                    </ul>

                                    {error && (
                                        <p className="mt-2 text-sm text-semantic-error">{error}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-neutral-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <Button
                            type="button"
                            onClick={handleUpgrade}
                            disabled={isLoading}
                            variant="primary"
                            className="w-full sm:ml-3 sm:w-auto"
                        >
                            {isLoading ? 'Processing...' : 'Upgrade Now'}
                        </Button>
                        <Button
                            type="button"
                            onClick={onClose}
                            variant="secondary"
                            className="mt-3 w-full sm:mt-0 sm:ml-3 sm:w-auto bg-white text-neutral-700 hover:bg-neutral-50 border border-neutral-300"
                        >
                            Cancel
                        </Button>
                    </div>
                    <div className="absolute top-0 right-0 pt-4 pr-4">
                        <button
                            type="button"
                            className="bg-white rounded-md text-neutral-400 hover:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
                            onClick={onClose}
                        >
                            <span className="sr-only">Close</span>
                            <X className="h-6 w-6" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
