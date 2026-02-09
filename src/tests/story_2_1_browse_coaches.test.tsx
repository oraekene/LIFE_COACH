/**
 * Story 2.1: Browse Coaches - Test Suite
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';

// Mock Coach Service
vi.mock('../services/coach/CoachService', () => ({
    CoachService: {
        getInstance: vi.fn().mockReturnValue({
            getCoaches: vi.fn().mockResolvedValue([
                {
                    id: 'coach-1',
                    name: 'Dr. Sarah Chen',
                    title: 'Life Coach',
                    specializations: ['stress_management', 'mindfulness'],
                    bio: 'Expert in stress management',
                    avatar: '🧘‍♀️',
                    rating: 4.9,
                    reviewCount: 100,
                    yearsExperience: 10,
                    isAvailable: true,
                    hourlyRate: 100
                },
                {
                    id: 'coach-2',
                    name: 'Marcus Johnson',
                    title: 'Career Coach',
                    specializations: ['career_development'],
                    bio: 'Career expert',
                    avatar: '💼',
                    rating: 4.8,
                    reviewCount: 80,
                    yearsExperience: 8,
                    isAvailable: false,
                    hourlyRate: 120
                }
            ]),
            getCoachById: vi.fn(),
            getSpecializations: vi.fn().mockReturnValue(['stress_management', 'career_development'])
        })
    }
}));

// Import after mocks
import { CoachList } from '../features/coaches/CoachList';
import { CoachCard } from '../features/coaches/CoachCard';
import { CoachFilters } from '../features/coaches/CoachFilters';
import { Coach, CoachFilter } from '../types/Coach';

describe('Story 2.1: Browse Coaches', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('CoachCard', () => {
        const mockCoach: Coach = {
            id: 'test-coach',
            name: 'Test Coach',
            title: 'Life Coach',
            specializations: ['stress_management'],
            bio: 'Test bio',
            avatar: '🧘',
            rating: 4.5,
            reviewCount: 50,
            yearsExperience: 5,
            isAvailable: true,
            hourlyRate: 100
        };

        it('renders coach information correctly', () => {
            render(<CoachCard coach={mockCoach} />);

            expect(screen.getByText('Test Coach')).toBeInTheDocument();
            expect(screen.getByText('Life Coach')).toBeInTheDocument();
            expect(screen.getByText('4.5')).toBeInTheDocument();
            expect(screen.getByText('(50 reviews)')).toBeInTheDocument();
            expect(screen.getByText('Available')).toBeInTheDocument();
        });

        it('shows Connect button for available coach', () => {
            render(<CoachCard coach={mockCoach} />);

            const connectBtn = screen.getByTestId('connect-test-coach');
            expect(connectBtn).not.toBeDisabled();
            expect(connectBtn).toHaveTextContent('Connect');
        });

        it('shows disabled button for unavailable coach', () => {
            const unavailableCoach = { ...mockCoach, isAvailable: false };
            render(<CoachCard coach={unavailableCoach} />);

            const connectBtn = screen.getByTestId('connect-test-coach');
            expect(connectBtn).toBeDisabled();
        });

        it('calls onConnect when Connect is clicked', () => {
            const onConnect = vi.fn();
            render(<CoachCard coach={mockCoach} onConnect={onConnect} />);

            fireEvent.click(screen.getByTestId('connect-test-coach'));
            expect(onConnect).toHaveBeenCalledWith(mockCoach);
        });
    });

    describe('CoachFilters', () => {
        it('renders filter options', () => {
            const filter: CoachFilter = {};
            const onChange = vi.fn();

            render(<CoachFilters filter={filter} onFilterChange={onChange} />);

            expect(screen.getByTestId('coach-search-input')).toBeInTheDocument();
            expect(screen.getByTestId('filter-all')).toBeInTheDocument();
            expect(screen.getByTestId('filter-stress_management')).toBeInTheDocument();
        });

        it('calls onFilterChange when specialization is selected', () => {
            const filter: CoachFilter = {};
            const onChange = vi.fn();

            render(<CoachFilters filter={filter} onFilterChange={onChange} />);

            fireEvent.click(screen.getByTestId('filter-career_development'));
            expect(onChange).toHaveBeenCalledWith({ specialization: 'career_development' });
        });

        it('calls onFilterChange when search query changes', () => {
            const filter: CoachFilter = {};
            const onChange = vi.fn();

            render(<CoachFilters filter={filter} onFilterChange={onChange} />);

            fireEvent.change(screen.getByTestId('coach-search-input'), {
                target: { value: 'Sarah' }
            });
            expect(onChange).toHaveBeenCalledWith({ searchQuery: 'Sarah' });
        });
    });

    describe('CoachList', () => {
        it('displays loading state initially', () => {
            render(<CoachList />);
            expect(screen.getByTestId('coach-list-loading')).toBeInTheDocument();
        });

        it('renders coaches after loading', async () => {
            render(<CoachList />);

            await waitFor(() => {
                expect(screen.queryByTestId('coach-list-loading')).not.toBeInTheDocument();
            });

            expect(screen.getByText('Dr. Sarah Chen')).toBeInTheDocument();
            expect(screen.getByText('Marcus Johnson')).toBeInTheDocument();
        });

        it('shows coach count', async () => {
            render(<CoachList />);

            await waitFor(() => {
                expect(screen.getByText('Showing 2 coaches')).toBeInTheDocument();
            });
        });
    });
});
