/**
 * Story 5.3: LoRA Training
 * Test-Driven Development - Tests written BEFORE implementation
 * 
 * User Story: As an admin, I want to generate LoRA adapters for improved retrieval.
 * 
 * Acceptance Criteria:
 * AC1: One-click 'Train Specialized Model' button
 * AC2: Cost calculator shows $23.60 estimate before execution
 * AC3: Model tier selection: Fast ($13)/Balanced ($26)/Deep ($51)
 * AC4: Progress dashboard with quality metrics
 * AC5: Downloadable LoRA file for backup
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// We expect these components to be created in Story 5.3
import { LoraTrainingComponent } from '../features/admin/LoraTrainingComponent';

// Mock useAuth
const { mockUseAuth } = vi.hoisted(() => ({
    mockUseAuth: vi.fn(() => ({
        isAuthenticated: true,
        user: {
            publicMetadata: { role: 'admin' },
            emailAddresses: [{ emailAddress: 'admin@example.com' }]
        }
    }))
}));

vi.mock('../hooks/useAuth', () => ({
    useAuth: mockUseAuth
}));

// Mock LoraTrainingService
vi.mock('../services/admin/LoraTrainingService', () => {
    return {
        LoraTrainingService: {
            calculateCost: vi.fn((tier: 'fast' | 'balanced' | 'deep') => {
                const costs = {
                    fast: 13,
                    balanced: 23.60,
                    deep: 51
                };
                return costs[tier] || 0;
            }),
            startTraining: vi.fn().mockResolvedValue('job-123'),
            getTrainingStatus: vi.fn().mockResolvedValue({
                status: 'training',
                progress: 45
            }),
        }
    };
});

describe('Story 5.3: LoRA Training', () => {
    const coachId = 'test-coach-123';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    // =========================================================================
    // AC1: One-click 'Train Specialized Model' button
    // =========================================================================
    describe('AC1: Train Button', () => {
        it('should render the train button', () => {
            render(<LoraTrainingComponent coachId={coachId} />);
            expect(screen.getByRole('button', { name: /Train Specialized Model/i })).toBeInTheDocument();
        });

        it('should trigger training when clicked', async () => {
            render(<LoraTrainingComponent coachId={coachId} />);
            const trainButton = screen.getByText(/Train Specialized Model/i);
            fireEvent.click(trainButton);

            await waitFor(() => {
                expect(screen.getByText(/Training in Progress/i)).toBeInTheDocument();
            });
        });
    });

    // =========================================================================
    // AC2: Cost calculator
    // =========================================================================
    describe('AC2: Cost Calculator', () => {
        it('should show default cost estimate of $23.60', () => {
            render(<LoraTrainingComponent coachId={coachId} />);
            expect(screen.getByTestId('estimated-cost')).toHaveTextContent(/\$23\.60/i);
        });
    });

    // =========================================================================
    // AC3: Model tier selection
    // =========================================================================
    describe('AC3: Tier Selection', () => {
        it('should allow selecting Fast tier and update cost to $13', async () => {
            render(<LoraTrainingComponent coachId={coachId} />);

            const fastOption = screen.getByLabelText(/Fast/i);
            fireEvent.click(fastOption);

            await waitFor(() => {
                expect(screen.getByTestId('estimated-cost')).toHaveTextContent(/\$13\.00/i);
            });
        });

        it('should allow selecting Deep tier and update cost to $51', async () => {
            render(<LoraTrainingComponent coachId={coachId} />);

            const deepOption = screen.getByLabelText(/Deep/i);
            fireEvent.click(deepOption);

            await waitFor(() => {
                expect(screen.getByTestId('estimated-cost')).toHaveTextContent(/\$51\.00/i);
            });
        });
    });

    // =========================================================================
    // AC4: Progress dashboard
    // =========================================================================
    describe('AC4: Progress Dashboard', () => {
        it('should show progress bar during training', async () => {
            render(<LoraTrainingComponent coachId={coachId} />);
            const trainButton = screen.getByText(/Train Specialized Model/i);
            fireEvent.click(trainButton);

            expect(await screen.findByRole('progressbar')).toBeInTheDocument();
        });

        it('should display quality metrics', async () => {
            render(<LoraTrainingComponent coachId={coachId} initialStatus="completed" />);
            expect(await screen.findByText(/Validation Loss/i)).toBeInTheDocument();
        });
    });

    // =========================================================================
    // AC5: Downloadable LoRA file
    // =========================================================================
    describe('AC5: Download', () => {
        it('should provide a download link when training is complete', async () => {
            render(<LoraTrainingComponent coachId={coachId} initialStatus="completed" />);
            // Use findByText to allow for slow renders/emojis
            expect(await screen.findByText(/Download LoRA Adapter/i)).toBeInTheDocument();
        });
        // =========================================================================
        // Security Hardened ACs
        // =========================================================================
        describe('Security Hardening', () => {
            it('should show access denied for non-admins', () => {
                mockUseAuth.mockReturnValueOnce({
                    isAuthenticated: true,
                    user: {
                        publicMetadata: { role: 'user' },
                        emailAddresses: [{ emailAddress: 'user@example.com' }]
                    }
                } as any);

                render(<LoraTrainingComponent coachId={coachId} />);
                expect(screen.getByText(/Access Denied/i)).toBeInTheDocument();
                expect(screen.queryByText(/LoRA Training Dashboard/i)).not.toBeInTheDocument();
            });

            it('should show access denied when not authenticated', () => {
                mockUseAuth.mockReturnValueOnce({
                    isAuthenticated: false,
                    user: null
                } as any);

                render(<LoraTrainingComponent coachId={coachId} />);
                expect(screen.getByText(/Access Denied/i)).toBeInTheDocument();
            });
        });
    });
});
