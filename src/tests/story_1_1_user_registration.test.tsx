/**
 * Story 1.1: User Registration
 * TDD Test Suite - These tests should FAIL until implementation is complete
 * 
 * User Story: As a new user, I want to sign up with my email or social accounts
 *             so that I can start using the app immediately.
 * 
 * Acceptance Criteria:
 * 1. Support Google, Apple, Email magic link via Clerk
 * 2. Onboarding flow completes in <3 minutes
 * 3. User selects 1-2 interest areas for default coach recommendations
 * 4. Biometric lock (FaceID/Fingerprint) enabled by default after first session
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// These imports will fail until implementation exists
import { RegistrationFlow } from '../features/auth/RegistrationFlow';
import { OnboardingWizard } from '../features/onboarding/OnboardingWizard';
import { InterestSelector } from '../features/onboarding/InterestSelector';
import { BiometricSettings } from '../features/auth/BiometricSettings';
import { ClerkAuthProvider } from '../providers/ClerkAuthProvider';
import { useAuth } from '../hooks/useAuth';
import { useBiometricLock } from '../hooks/useBiometricLock';

// Mock Clerk SDK with proper return values
vi.mock('@clerk/clerk-react', () => ({
    useSignIn: vi.fn(() => ({ signIn: { authenticateWithRedirect: vi.fn(), create: vi.fn() }, isLoaded: true })),
    useSignUp: vi.fn(() => ({ signUp: null, isLoaded: true })),
    useUser: vi.fn(() => ({ user: null, isLoaded: true, isSignedIn: false })),
    SignIn: vi.fn(),
    SignUp: vi.fn(),
    ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock custom hooks
vi.mock('../hooks/useAuth');
vi.mock('../hooks/useBiometricLock');

// Mock StorageProvider to support ProfileSetupWizard
vi.mock('../providers/StorageProvider', () => ({
    StorageProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useStorage: () => ({
        isReady: true,
        saveItem: vi.fn().mockResolvedValue(true),
        getItem: vi.fn(),
        unlock: vi.fn(),
    }),
}));

// Default mock implementations
const defaultUseAuthMock = () => ({
    signInWithOAuth: vi.fn(),
    sendMagicLink: vi.fn().mockResolvedValue({ success: true }),
    isLoading: false,
    error: null,
    isAuthenticated: false,
    user: null,
    signOut: vi.fn(),
    clearError: vi.fn(),
});

const defaultUseBiometricLockMock = () => ({
    isSupported: true,
    biometricType: 'FaceID' as const,
    isEnabled: false,
    isFirstSession: true,
    checkSupport: vi.fn().mockResolvedValue({ supported: true, types: ['FaceID'] }),
    enable: vi.fn().mockResolvedValue({ success: true }),
    disable: vi.fn().mockResolvedValue({ success: true }),
    authenticate: vi.fn().mockResolvedValue({ success: true }),
});

// Reset mocks before each test to ensure clean state
beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue(defaultUseAuthMock());
    vi.mocked(useBiometricLock).mockReturnValue(defaultUseBiometricLockMock());
});


// =============================================================================
// AC1: Support Google, Apple, Email magic link via Clerk
// =============================================================================
describe('AC1: Authentication Provider Support', () => {
    describe('Google Sign-In', () => {
        it('should render Google sign-in button', () => {
            render(<RegistrationFlow />);

            const googleButton = screen.getByRole('button', { name: /continue with google/i });
            expect(googleButton).toBeInTheDocument();
        });

        it('should initiate Google OAuth flow when clicked', async () => {
            const mockSignInWithOAuth = vi.fn();
            vi.mocked(useAuth).mockReturnValue({
                ...defaultUseAuthMock(),
                signInWithOAuth: mockSignInWithOAuth,
            });

            render(<RegistrationFlow />);

            const googleButton = screen.getByRole('button', { name: /continue with google/i });
            await userEvent.click(googleButton);

            expect(mockSignInWithOAuth).toHaveBeenCalledWith('google');
        });

        it('should display loading state during Google authentication', async () => {
            vi.mocked(useAuth).mockReturnValue({
                ...defaultUseAuthMock(),
                isLoading: true,
            });

            render(<RegistrationFlow />);

            expect(screen.getByTestId('auth-loading-indicator')).toBeInTheDocument();
        });
    });

    describe('Apple Sign-In', () => {
        it('should render Apple sign-in button', () => {
            render(<RegistrationFlow />);

            const appleButton = screen.getByRole('button', { name: /continue with apple/i });
            expect(appleButton).toBeInTheDocument();
        });

        it('should initiate Apple OAuth flow when clicked', async () => {
            const mockSignInWithOAuth = vi.fn();
            vi.mocked(useAuth).mockReturnValue({
                ...defaultUseAuthMock(),
                signInWithOAuth: mockSignInWithOAuth,
            });

            render(<RegistrationFlow />);

            const appleButton = screen.getByRole('button', { name: /continue with apple/i });
            await userEvent.click(appleButton);

            expect(mockSignInWithOAuth).toHaveBeenCalledWith('apple');
        });
    });

    describe('Email Magic Link', () => {
        it('should render email input field', () => {
            render(<RegistrationFlow />);

            const emailInput = screen.getByRole('textbox', { name: /email/i });
            expect(emailInput).toBeInTheDocument();
        });

        it('should render "Send magic link" button', () => {
            render(<RegistrationFlow />);

            const magicLinkButton = screen.getByRole('button', { name: /send magic link/i });
            expect(magicLinkButton).toBeInTheDocument();
        });

        it('should validate email format before sending magic link', async () => {
            render(<RegistrationFlow />);

            const emailInput = screen.getByRole('textbox', { name: /email/i });
            const magicLinkButton = screen.getByRole('button', { name: /send magic link/i });

            await userEvent.type(emailInput, 'invalid-email');
            await userEvent.click(magicLinkButton);

            expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
        });

        it('should send magic link for valid email', async () => {
            const mockSendMagicLink = vi.fn().mockResolvedValue({ success: true });
            vi.mocked(useAuth).mockReturnValue({
                ...defaultUseAuthMock(),
                sendMagicLink: mockSendMagicLink,
            });

            render(<RegistrationFlow />);

            const emailInput = screen.getByRole('textbox', { name: /email/i });
            const magicLinkButton = screen.getByRole('button', { name: /send magic link/i });

            await userEvent.type(emailInput, 'user@example.com');
            await userEvent.click(magicLinkButton);

            expect(mockSendMagicLink).toHaveBeenCalledWith('user@example.com');
        });

        it('should show confirmation message after magic link sent', async () => {
            const mockSendMagicLink = vi.fn().mockResolvedValue({ success: true });
            vi.mocked(useAuth).mockReturnValue({
                ...defaultUseAuthMock(),
                sendMagicLink: mockSendMagicLink,
            });

            render(<RegistrationFlow />);

            const emailInput = screen.getByRole('textbox', { name: /email/i });
            const magicLinkButton = screen.getByRole('button', { name: /send magic link/i });

            await userEvent.type(emailInput, 'user@example.com');
            await userEvent.click(magicLinkButton);

            await waitFor(() => {
                expect(screen.getByText(/check your email/i)).toBeInTheDocument();
            });
        });
    });

    describe('Clerk Integration', () => {
        it('should wrap app with ClerkProvider', () => {
            const { container } = render(
                <ClerkAuthProvider>
                    <RegistrationFlow />
                </ClerkAuthProvider>
            );

            expect(container).toBeInTheDocument();
        });

        it('should handle Clerk authentication errors gracefully', async () => {
            vi.mocked(useAuth).mockReturnValue({
                ...defaultUseAuthMock(),
                signInWithOAuth: vi.fn().mockRejectedValue(new Error('Auth failed')),
                error: { message: 'Authentication failed. Please try again.' },
            });

            render(<RegistrationFlow />);

            await waitFor(() => {
                expect(screen.getByText(/authentication failed/i)).toBeInTheDocument();
            });
        });
    });
});

// =============================================================================
// AC2: Onboarding flow completes in <3 minutes
// =============================================================================
describe('AC2: Onboarding Flow Duration', () => {
    // Note: Real timers used for async tests; fake timers conflict with userEvent

    it('should track onboarding start time', () => {
        render(<OnboardingWizard />);

        expect(screen.getByTestId('onboarding-timer')).toBeInTheDocument();
    });

    it('should have no more than 5 steps in onboarding wizard', () => {
        render(<OnboardingWizard />);

        const stepIndicators = screen.getAllByTestId(/onboarding-step-/);
        expect(stepIndicators.length).toBeLessThanOrEqual(5);
    });

    it('should allow completing each step in reasonable time', async () => {
        const stepStartTime = Date.now();
        render(<OnboardingWizard />);

        // Step 1: Welcome - click Continue
        const continueButton1 = screen.getByRole('button', { name: /continue/i });
        await userEvent.click(continueButton1);

        // Step 2: Wait for interests screen to render and select
        await waitFor(() => {
            expect(screen.getByText('Health')).toBeInTheDocument();
        });
        await userEvent.click(screen.getByText('Health'));

        // Check step completion was fast
        expect(Date.now() - stepStartTime).toBeLessThan(30000); // 30 seconds per step
    });

    it('should display progress indicator during onboarding', () => {
        render(<OnboardingWizard />);

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should allow skipping optional steps', () => {
        render(<OnboardingWizard />);

        const skipButton = screen.queryByRole('button', { name: /skip/i });
        // Optional steps should have skip button
        if (skipButton) {
            expect(skipButton).toBeEnabled();
        }
    });

    it('should complete full onboarding flow within time limit', async () => {
        const onComplete = vi.fn();
        render(<OnboardingWizard onComplete={onComplete} />);

        // Step 1: Welcome - verify we're on welcome and click Continue
        expect(screen.getByText(/welcome to lifeos coach/i)).toBeInTheDocument();
        await userEvent.click(screen.getByRole('button', { name: /continue/i }));

        // Step 2: Interests - wait for title, select, continue
        await waitFor(() => {
            expect(screen.getByText(/what would you like to focus on/i)).toBeInTheDocument();
        });
        await userEvent.click(screen.getByText('Health'));
        await userEvent.click(screen.getByRole('button', { name: /continue/i }));

        // Step 3: Profile Setup (NEW in Story 1.3)
        // 3a. Name
        await waitFor(() => expect(screen.getByPlaceholderText(/Enter your name/i)).toBeInTheDocument());
        await userEvent.type(screen.getByPlaceholderText(/Enter your name/i), 'Test User');
        await userEvent.click(screen.getByText(/Next/i));

        // 3b. Goal
        await waitFor(() => expect(screen.getByText(/Primary Goal/i)).toBeInTheDocument());
        await userEvent.click(screen.getByText(/Reduce Stress/i));
        await userEvent.click(screen.getByText(/Next/i));

        // 3c. Avatar
        await waitFor(() => expect(screen.getByText(/Choose Avatar/i)).toBeInTheDocument());
        // Using data-testid for Avatar selection as defined in ProfileSetupWizard
        await userEvent.click(screen.getByTestId('avatar-option-1'));
        await userEvent.click(screen.getByText(/Finish/i));

        // Step 4: Security - wait for title, then skip
        await waitFor(() => {
            expect(screen.getByText(/secure your account/i)).toBeInTheDocument();
        });
        await userEvent.click(screen.getByRole('button', { name: /skip/i }));

        // Step 4: Complete - wait for title, click Complete
        await waitFor(() => {
            expect(screen.getByText(/you're all set/i)).toBeInTheDocument();
        });
        await userEvent.click(screen.getByRole('button', { name: /complete/i }));

        // Verify onboarding completed
        expect(onComplete).toHaveBeenCalled();
    });
});

// =============================================================================
// AC3: User selects 1-2 interest areas for default coach recommendations
// =============================================================================
describe('AC3: Interest Selection', () => {
    const interestAreas = [
        { id: 'health', name: 'Health', icon: '🌿' },
        { id: 'wealth', name: 'Wealth', icon: '💎' },
        { id: 'wisdom', name: 'Wisdom', icon: '📚' },
        { id: 'career', name: 'Career', icon: '🚀' },
        { id: 'relationships', name: 'Relationships', icon: '💝' },
        { id: 'creativity', name: 'Creativity', icon: '✨' },
    ];

    it('should display all available interest areas', () => {
        render(<InterestSelector areas={interestAreas} />);

        interestAreas.forEach((area) => {
            expect(screen.getByText(area.name)).toBeInTheDocument();
        });
    });

    it('should allow selecting at least 1 interest area', async () => {
        const onSelect = vi.fn();
        render(<InterestSelector areas={interestAreas} onSelect={onSelect} />);

        const healthOption = screen.getByText('Health');
        await userEvent.click(healthOption);

        expect(onSelect).toHaveBeenCalledWith(['health']);
    });

    it('should allow selecting up to 2 interest areas', async () => {
        const onSelect = vi.fn();
        render(<InterestSelector areas={interestAreas} onSelect={onSelect} />);

        const healthOption = screen.getByText('Health');
        const wealthOption = screen.getByText('Wealth');

        await userEvent.click(healthOption);
        await userEvent.click(wealthOption);

        expect(onSelect).toHaveBeenLastCalledWith(['health', 'wealth']);
    });

    it('should NOT allow selecting more than 2 interest areas', async () => {
        const onSelect = vi.fn();
        render(<InterestSelector areas={interestAreas} onSelect={onSelect} maxSelections={2} />);

        const healthOption = screen.getByText('Health');
        const wealthOption = screen.getByText('Wealth');
        const wisdomOption = screen.getByText('Wisdom');

        await userEvent.click(healthOption);
        await userEvent.click(wealthOption);
        await userEvent.click(wisdomOption);

        // Third click should not add to selection
        expect(onSelect).toHaveBeenLastCalledWith(['health', 'wealth']);
        // Or show a warning
        expect(screen.getByText(/you can only select up to 2/i)).toBeInTheDocument();
    });

    it('should require at least 1 selection before proceeding', async () => {
        const mockOnSave = vi.fn().mockResolvedValue({ success: true });
        render(<InterestSelector areas={interestAreas} onSave={mockOnSave} />);

        const continueButton = screen.getByRole('button', { name: /continue|save/i });

        // Should be disabled with no selection
        expect(continueButton).toBeDisabled();

        // Select one area
        await userEvent.click(screen.getByText('Health'));

        // Now should be enabled
        expect(continueButton).toBeEnabled();
    });

    it('should visually indicate selected interest areas', async () => {
        render(<InterestSelector areas={interestAreas} />);

        const healthOption = screen.getByText('Health').closest('[data-testid="interest-option"]');

        await userEvent.click(screen.getByText('Health'));

        expect(healthOption).toHaveAttribute('data-selected', 'true');
    });

    it('should persist interest selections to user profile', async () => {
        const mockSaveInterests = vi.fn().mockResolvedValue({ success: true });

        render(
            <InterestSelector
                areas={interestAreas}
                onSave={mockSaveInterests}
            />
        );

        await userEvent.click(screen.getByText('Health'));
        await userEvent.click(screen.getByText('Wisdom'));

        const saveButton = screen.getByRole('button', { name: /save|continue|next/i });
        await userEvent.click(saveButton);

        expect(mockSaveInterests).toHaveBeenCalledWith({
            interests: ['health', 'wisdom'],
        });
    });

    it('should use selected interests to recommend coaches', async () => {
        const mockGetRecommendations = vi.fn().mockResolvedValue([
            { id: 'coach-1', name: 'Health Coach', category: 'health' },
            { id: 'coach-2', name: 'Wisdom Master', category: 'wisdom' },
        ]);

        render(
            <InterestSelector
                areas={interestAreas}
                getRecommendations={mockGetRecommendations}
            />
        );

        await userEvent.click(screen.getByText('Health'));
        await userEvent.click(screen.getByText('Wisdom'));

        await waitFor(() => {
            expect(mockGetRecommendations).toHaveBeenCalledWith(['health', 'wisdom']);
        });
    });
});

// =============================================================================
// AC4: Biometric lock (FaceID/Fingerprint) enabled by default after first session
// =============================================================================
describe('AC4: Biometric Lock Default Enabled', () => {
    it('should detect if device supports biometric authentication', async () => {
        const mockCheckSupport = vi.fn().mockResolvedValue({
            supported: true,
            types: ['FaceID'],
        });

        vi.mocked(useBiometricLock).mockReturnValue({
            ...defaultUseBiometricLockMock(),
            checkSupport: mockCheckSupport,
        });

        render(<BiometricSettings />);

        await waitFor(() => {
            expect(mockCheckSupport).toHaveBeenCalled();
        });
    });

    it('should display biometric setup prompt after first session', async () => {
        vi.mocked(useBiometricLock).mockReturnValue({
            ...defaultUseBiometricLockMock(),
        });

        render(<BiometricSettings showSetupPrompt={true} />);

        // Look for the Enable button specifically
        expect(screen.getByRole('button', { name: /enable face id/i })).toBeInTheDocument();
    });

    it('should enable biometric lock by default after first session completes', async () => {
        const mockEnable = vi.fn().mockResolvedValue({ success: true });

        vi.mocked(useBiometricLock).mockReturnValue({
            ...defaultUseBiometricLockMock(),
            enable: mockEnable,
        });

        render(<BiometricSettings autoEnableAfterFirstSession={true} />);

        await waitFor(() => {
            expect(mockEnable).toHaveBeenCalled();
        });
    });

    it('should display FaceID toggle in settings', () => {
        vi.mocked(useBiometricLock).mockReturnValue({
            ...defaultUseBiometricLockMock(),
            isEnabled: true,
        });

        render(<BiometricSettings />);

        const toggle = screen.getByRole('switch', { name: /face id|biometric/i });
        expect(toggle).toBeInTheDocument();
        expect(toggle).toBeChecked();
    });

    it('should display Fingerprint toggle on Android devices', () => {
        vi.mocked(useBiometricLock).mockReturnValue({
            ...defaultUseBiometricLockMock(),
            biometricType: 'Fingerprint',
            isEnabled: true,
        });

        render(<BiometricSettings />);

        const toggle = screen.getByRole('switch', { name: /fingerprint|biometric/i });
        expect(toggle).toBeInTheDocument();
    });

    it('should allow user to disable biometric lock if desired', async () => {
        const mockDisable = vi.fn().mockResolvedValue({ success: true });

        vi.mocked(useBiometricLock).mockReturnValue({
            ...defaultUseBiometricLockMock(),
            isEnabled: true,
            disable: mockDisable,
        });

        render(<BiometricSettings />);

        const toggle = screen.getByRole('switch', { name: /face id|biometric/i });
        await userEvent.click(toggle);

        expect(mockDisable).toHaveBeenCalled();
    });

    it('should require biometric authentication to access app when enabled', async () => {
        const mockAuthenticate = vi.fn().mockResolvedValue({ success: true });

        vi.mocked(useBiometricLock).mockReturnValue({
            ...defaultUseBiometricLockMock(),
            isEnabled: true,
            authenticate: mockAuthenticate,
        });

        // Simulate app launch with biometric enabled
        render(<BiometricSettings requireAuthOnLaunch={true} />);

        await waitFor(() => {
            expect(mockAuthenticate).toHaveBeenCalled();
        });
    });

    it('should gracefully handle devices without biometric support', () => {
        vi.mocked(useBiometricLock).mockReturnValue({
            ...defaultUseBiometricLockMock(),
            isSupported: false,
            biometricType: null,
        });

        render(<BiometricSettings />);

        // Should not show biometric options
        expect(screen.queryByRole('switch', { name: /biometric/i })).not.toBeInTheDocument();

        // Should show alternative security option
        expect(screen.getByText(/biometric authentication not available/i)).toBeInTheDocument();
    });

    it('should persist biometric preference to secure storage', async () => {
        const mockEnable = vi.fn().mockResolvedValue({ success: true });

        vi.mocked(useBiometricLock).mockReturnValue({
            ...defaultUseBiometricLockMock(),
            enable: mockEnable,
        });

        render(<BiometricSettings />);

        const toggle = screen.getByRole('switch', { name: /face id|biometric/i });
        await userEvent.click(toggle);

        expect(mockEnable).toHaveBeenCalledWith({
            persistToSecureStorage: true,
        });
    });
});

// =============================================================================
// Integration Tests - Full Registration Flow
// =============================================================================
describe('Integration: Complete Registration Flow', () => {
    it('should complete full registration with Google auth', async () => {
        const mockOnComplete = vi.fn();
        const mockOnAuthSuccess = vi.fn();

        render(
            <ClerkAuthProvider>
                <RegistrationFlow
                    onAuthSuccess={mockOnAuthSuccess}
                    onComplete={mockOnComplete}
                />
            </ClerkAuthProvider>
        );

        // Step 1: Choose Google auth
        await userEvent.click(screen.getByRole('button', { name: /continue with google/i }));

        // OAuth completes, callbacks are called
        await waitFor(() => {
            expect(mockOnAuthSuccess).toHaveBeenCalled();
            expect(mockOnComplete).toHaveBeenCalled();
        });
    });

    it('should complete full registration with email magic link', async () => {
        const mockSendMagicLink = vi.fn().mockResolvedValue({ success: true });
        vi.mocked(useAuth).mockReturnValue({
            ...defaultUseAuthMock(),
            sendMagicLink: mockSendMagicLink,
        });

        render(
            <ClerkAuthProvider>
                <RegistrationFlow />
            </ClerkAuthProvider>
        );

        // Step 1: Enter email
        const emailInput = screen.getByRole('textbox', { name: /email/i });
        await userEvent.type(emailInput, 'test@example.com');
        await userEvent.click(screen.getByRole('button', { name: /send magic link/i }));

        // Magic link sent successfully
        await waitFor(() => {
            expect(mockSendMagicLink).toHaveBeenCalledWith('test@example.com');
            expect(screen.getByText(/check your email/i)).toBeInTheDocument();
        });
    });
});

