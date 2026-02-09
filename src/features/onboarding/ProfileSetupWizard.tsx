import React, { useState } from 'react';
import { useStorage } from '../../providers/StorageProvider';

interface Props {
    onComplete: () => void;
}

type Step = 'NAME' | 'GOAL' | 'AVATAR';

const GOALS = [
    { id: 'muscle', label: 'Build Muscle' },
    { id: 'stress_reduction', label: 'Reduce Stress' },
    { id: 'career', label: 'Advance Career' },
    { id: 'relationships', label: 'Improve Relationships' }
];

const AVATARS = [
    { id: 'avatar-1', label: 'Determined' },
    { id: 'avatar-2', label: 'Calm' },
    { id: 'avatar-3', label: 'Energetic' }
];

export const ProfileSetupWizard: React.FC<Props> = ({ onComplete }) => {
    const { saveItem } = useStorage();
    const [step, setStep] = useState<Step>('NAME');
    const [displayName, setDisplayName] = useState('');
    const [primaryGoal, setPrimaryGoal] = useState('');
    const [avatarId, setAvatarId] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const validateName = (name: string) => {
        if (name.length < 2) return false;
        if (name.length > 50) return false;
        // Allow letters, numbers, spaces, hyphens, apostrophes (basic name chars)
        return /^[a-zA-Z0-9\s'-]+$/.test(name);
    };

    const handleNext = () => {
        if (step === 'NAME') {
            if (!validateName(displayName.trim())) {
                setError('Name must be 2-50 characters and avoid special symbols.');
                return;
            }
            setError(null);
            setStep('GOAL');
        } else if (step === 'GOAL' && primaryGoal) {
            setStep('AVATAR');
        }
    };

    const handleFinish = async () => {
        if (!avatarId) return;

        setIsSaving(true);
        setError(null);
        try {
            await saveItem('user_profile', 'current', {
                displayName,
                primaryGoal,
                avatarId,
                createdAt: Date.now()
            });
            onComplete();
        } catch (error) {
            console.error('Failed to save profile:', error);
            setError('Failed to save profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
            {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm" role="alert">
                    {error}
                </div>
            )}
            {step === 'NAME' && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold">What should we call you?</h2>
                    <label className="block text-sm font-medium text-gray-700">
                        Display Name
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Enter your name"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                        />
                    </label>
                    <button
                        onClick={handleNext}
                        disabled={!displayName.trim()}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}

            {step === 'GOAL' && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold">What is your Primary Goal?</h2>
                    <div className="space-y-2">
                        {GOALS.map((goal) => (
                            <button
                                key={goal.id}
                                onClick={() => setPrimaryGoal(goal.id)}
                                className={`w-full text-left p-3 rounded border ${primaryGoal === goal.id
                                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                                    : 'border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                {goal.label}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={handleNext}
                        disabled={!primaryGoal}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}

            {step === 'AVATAR' && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold">Choose Avatar</h2>
                    <div className="grid grid-cols-3 gap-4">
                        {AVATARS.map((avatar) => (
                            <button
                                key={avatar.id}
                                data-testid={`avatar-option-${avatar.id.split('-')[1]}`} // Helper for test
                                onClick={() => setAvatarId(avatar.id)}
                                className={`p-2 rounded border aspect-square flex items-center justify-center ${avatarId === avatar.id
                                    ? 'border-blue-500 ring-2 ring-blue-500'
                                    : 'border-gray-200'
                                    }`}
                            >
                                {avatar.label}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={handleFinish}
                        disabled={!avatarId || isSaving}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
                    >
                        {isSaving ? 'Saving...' : 'Finish'}
                    </button>
                </div>
            )}
        </div>
    );
};
