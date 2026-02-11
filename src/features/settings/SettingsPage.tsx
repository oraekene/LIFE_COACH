import React, { useState, useEffect } from 'react';
import { useStorage } from '../../providers/StorageProvider';
import { SubscriptionPlans } from '../subscription/SubscriptionPlans';
import { SubscriptionService } from '../../services/subscription/SubscriptionService';
import { SubscriptionPlan, UserSubscription } from '../../types/Subscription';
import { ImportWizard } from '../import/ImportWizard';

export const SettingsPage: React.FC = () => {
    const { isReady, exportData, isLocked } = useStorage();
    const [isExporting, setIsExporting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [subscription, setSubscription] = useState<UserSubscription | null>(null);
    const [showImportWizard, setShowImportWizard] = useState(false);

    useEffect(() => {
        const loadSubscriptionData = async () => {
            const service = SubscriptionService.getInstance();
            const [fetchedPlans, currentSub] = await Promise.all([
                service.getPlans(),
                service.getCurrentSubscription()
            ]);
            setPlans(fetchedPlans);
            setSubscription(currentSub);
        };
        loadSubscriptionData();
    }, []);

    const handleSelectPlan = async (plan: SubscriptionPlan) => {
        try {
            const service = SubscriptionService.getInstance();
            // detailed mocking of payment flow would go here or in the service
            const newSub = await service.subscribe(plan.tier);
            setSubscription(newSub);
            alert(`Successfully subscribed to ${plan.name} plan!`);
        } catch (err) {
            console.error('Subscription failed', err);
            alert('Failed to subscribe');
        }
    };

    const handleExport = async () => {
        if (!isReady) {
            setError('Please unlock your storage first.');
            return;
        }

        try {
            setIsExporting(true);
            setError(null);

            // 1. Get decrypted JSON
            const jsonString = await exportData();

            // 2. Create blob and download
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `lifeos-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err: any) {
            console.error('Export failed:', err);
            setError(err.message || 'Failed to export data');
        } finally {
            setIsExporting(false);
        }
    };

    if (isLocked) {
        return (
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-4">Settings</h1>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <p className="text-yellow-700">Storage is locked. Please unlock via the main menu to access settings.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Settings</h1>

            <section className="mb-12">
                <h2 className="text-xl font-semibold mb-4">Subscription</h2>
                <SubscriptionPlans
                    plans={plans}
                    currentTier={subscription?.tier || 'free'}
                    onSelectPlan={handleSelectPlan}
                />
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Data Privacy & Export</h2>
                <div className="bg-white shadow rounded-lg p-6">
                    <p className="text-gray-600 mb-4">
                        Your data is encrypted on this device. You can download a full copy of your decrypted data at any time.
                    </p>

                    {error && (
                        <div className="bg-red-50 text-red-700 p-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className={`px-4 py-2 rounded font-medium text-white 
                            ${isExporting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {isExporting ? 'Preparing Export...' : 'Download My Data (JSON)'}
                    </button>

                    <p className="text-xs text-gray-500 mt-2">
                        Includes all chats, notes, and profile data from Story 1.1+.
                    </p>
                </div>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">External Integrations</h2>
                <div className="bg-white shadow rounded-lg p-6">
                    <p className="text-gray-600 mb-4">
                        Import your existing notes and PARA structure from Obsidian, Google Keep, or Apple Notes.
                    </p>
                    <button
                        onClick={() => setShowImportWizard(true)}
                        className="px-4 py-2 rounded font-medium text-white bg-green-600 hover:bg-green-700"
                    >
                        Start Import Wizard
                    </button>
                </div>
            </section>

            {showImportWizard && (
                <ImportWizard
                    isOpen={showImportWizard}
                    onClose={() => setShowImportWizard(false)}
                />
            )}
        </div>
    );
};
