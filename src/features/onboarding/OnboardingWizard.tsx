/**
 * OnboardingWizard Component
 * Multi-step onboarding flow for new users
 * Story 1.1: User Registration - AC2
 */

import React, { useState, useCallback, useMemo } from 'react';
import { InterestSelector, InterestArea } from '../onboarding/InterestSelector';
import { ProfileSetupWizard } from './ProfileSetupWizard'; // Assuming same directory or fix path
import { BiometricSettings } from '../auth/BiometricSettings';
import './OnboardingWizard.css';

interface OnboardingWizardProps {
    onComplete?: () => void;
}

interface Step {
    id: string;
    title: string;
    description: string;
    component: React.ReactNode;
    optional?: boolean;
    hideNavigation?: boolean;
}

const DEFAULT_INTEREST_AREAS: InterestArea[] = [
    { id: 'health', name: 'Health', icon: '🌿' },
    { id: 'wealth', name: 'Wealth', icon: '💎' },
    { id: 'wisdom', name: 'Wisdom', icon: '📚' },
    { id: 'career', name: 'Career', icon: '🚀' },
    { id: 'relationships', name: 'Relationships', icon: '💝' },
    { id: 'creativity', name: 'Creativity', icon: '✨' },
];

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [startTime] = useState(Date.now());

    const handleInterestSelect = useCallback((interests: string[]) => {
        setSelectedInterests(interests);
    }, []);

    const handleNext = useCallback(() => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            // Mark first session as complete
            localStorage.setItem('lifeos_first_session_complete', 'true');
            onComplete?.();
        }
    }, [currentStep, onComplete]);

    const handleSkip = useCallback(() => {
        handleNext();
    }, [handleNext]);

    const handleBack = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    }, [currentStep]);

    const canProceed = useMemo(() => {
        // Step 2 (interests) requires at least 1 selection
        if (currentStep === 1) {
            return selectedInterests.length >= 1;
        }
        return true;
    }, [currentStep, selectedInterests]);

    const steps: Step[] = useMemo(() => [
        {
            id: 'welcome',
            title: 'Welcome to LifeOS Coach',
            description: 'Your personal AI coaching companion that learns and grows with you.',
            component: (
                <div className="onboarding-wizard__welcome">
                    <div className="onboarding-wizard__welcome-icon">🌟</div>
                    <h2>Ready to transform your life?</h2>
                    <p>
                        LifeOS Coach uses advanced AI to provide personalized coaching,
                        while keeping your data private and secure on your device.
                    </p>
                    <ul className="onboarding-wizard__features">
                        <li>🔒 Privacy-first: Your data stays on your device</li>
                        <li>📱 Works offline: Coach with or without internet</li>
                        <li>🧠 Learns you: Remembers your goals and progress</li>
                    </ul>
                </div>
            ),
        },
        {
            id: 'interests',
            title: 'What would you like to focus on?',
            description: 'Select 1-2 areas to help us recommend the best coaches for you.',
            component: (
                <InterestSelector
                    areas={DEFAULT_INTEREST_AREAS}
                    selectedInterests={selectedInterests}
                    onSelect={handleInterestSelect}
                    maxSelections={2}
                />
            ),
        },
        {
            id: 'profile',
            title: 'Create Your Profile',
            description: 'Tell us a bit about yourself to personalize your experience.',
            component: (
                <ProfileSetupWizard onComplete={handleNext} />
            ),
            hideNavigation: true,
        },
        {
            id: 'security',
            title: 'Secure your account',
            description: 'Enable biometric authentication for quick and secure access.',
            component: (
                <BiometricSettings
                    showSetupPrompt={true}
                    autoEnableAfterFirstSession={true}
                />
            ),
            optional: true,
        },
        {
            id: 'complete',
            title: "You're all set!",
            description: 'Start your coaching journey today.',
            component: (
                <div className="onboarding-wizard__complete">
                    <div className="onboarding-wizard__complete-icon">🎉</div>
                    <h2>Welcome aboard!</h2>
                    <p>
                        Your selected coaches are ready to help you achieve your goals.
                        Let's get started!
                    </p>
                </div>
            ),
        },
    ], [selectedInterests, handleInterestSelect]);

    const currentStepData = steps[currentStep];
    const progress = ((currentStep + 1) / steps.length) * 100;
    const isLastStep = currentStep === steps.length - 1;

    return (
        <div className="onboarding-wizard">
            {/* Timer (hidden, for testing) */}
            <div data-testid="onboarding-timer" style={{ display: 'none' }}>
                {Date.now() - startTime}
            </div>

            {/* Progress Bar */}
            <div className="onboarding-wizard__progress-container">
                <div
                    className="onboarding-wizard__progress-bar"
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                >
                    <div
                        className="onboarding-wizard__progress-fill"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Step Indicators */}
            <div className="onboarding-wizard__steps">
                {steps.map((step, index) => (
                    <div
                        key={step.id}
                        data-testid={`onboarding-step-${index}`}
                        className={`onboarding-wizard__step-indicator ${index === currentStep ? 'onboarding-wizard__step-indicator--active' : ''
                            } ${index < currentStep ? 'onboarding-wizard__step-indicator--completed' : ''}`}
                    >
                        {index < currentStep ? '✓' : index + 1}
                    </div>
                ))}
            </div>

            {/* Content */}
            <div className="onboarding-wizard__content">
                <h1 className="onboarding-wizard__title">{currentStepData.title}</h1>
                <p className="onboarding-wizard__description">{currentStepData.description}</p>

                <div className="onboarding-wizard__step-content">
                    {currentStepData.component}
                </div>
            </div>

            {/* Navigation */}
            {!currentStepData.hideNavigation && (
                <div className="onboarding-wizard__navigation">
                    {currentStep > 0 && (
                        <button
                            type="button"
                            className="onboarding-wizard__button onboarding-wizard__button--secondary"
                            onClick={handleBack}
                        >
                            Back
                        </button>
                    )}

                    <div className="onboarding-wizard__navigation-right">
                        {currentStepData.optional && (
                            <button
                                type="button"
                                className="onboarding-wizard__button onboarding-wizard__button--ghost"
                                onClick={handleSkip}
                            >
                                Skip
                            </button>
                        )}

                        <button
                            type="button"
                            className="onboarding-wizard__button onboarding-wizard__button--primary"
                            onClick={handleNext}
                            disabled={!canProceed}
                        >
                            {isLastStep ? 'Complete' : 'Continue'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default OnboardingWizard;
