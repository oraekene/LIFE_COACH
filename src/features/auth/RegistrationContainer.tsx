/**
 * RegistrationContainer
 * 
 * Orchestrates the full registration flow:
 * 1. RegistrationFlow (auth) → 2. OnboardingWizard → 3. Complete
 */

import React, { useState, useCallback } from 'react';
import { RegistrationFlow } from './RegistrationFlow';
import { OnboardingWizard } from '../onboarding/OnboardingWizard';
import { useAuth } from '../../hooks/useAuth';
import './RegistrationContainer.css';

type FlowStep = 'auth' | 'onboarding' | 'complete';

interface RegistrationContainerProps {
    /** Called when entire registration flow completes */
    onComplete?: () => void;
    /** Initial step for testing purposes */
    initialStep?: FlowStep;
}

export const RegistrationContainer: React.FC<RegistrationContainerProps> = ({
    onComplete,
    initialStep = 'auth',
}) => {
    const [currentStep, setCurrentStep] = useState<FlowStep>(initialStep);
    const { isAuthenticated } = useAuth();

    // Handle successful authentication
    const handleAuthSuccess = useCallback(() => {
        setCurrentStep('onboarding');
    }, []);

    // Handle onboarding completion
    const handleOnboardingComplete = useCallback(() => {
        setCurrentStep('complete');
        onComplete?.();
    }, [onComplete]);

    // If already authenticated, skip to onboarding
    React.useEffect(() => {
        if (isAuthenticated && currentStep === 'auth') {
            setCurrentStep('onboarding');
        }
    }, [isAuthenticated, currentStep]);

    return (
        <div className="registration-container">
            {currentStep === 'auth' && (
                <RegistrationFlow
                    onAuthSuccess={handleAuthSuccess}
                    onComplete={handleAuthSuccess}
                />
            )}

            {currentStep === 'onboarding' && (
                <OnboardingWizard
                    onComplete={handleOnboardingComplete}
                />
            )}

            {currentStep === 'complete' && (
                <div className="registration-container__complete">
                    <div className="registration-container__success-icon">✓</div>
                    <h2>Welcome to LifeOS Coach!</h2>
                    <p>Your account is all set up.</p>
                </div>
            )}
        </div>
    );
};
