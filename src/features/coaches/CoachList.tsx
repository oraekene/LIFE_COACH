/**
 * CoachList Component
 * Displays grid of coaches with filtering
 * Story 2.1: Browse Coaches
 */

import { useState, useEffect, useCallback } from 'react';
import { Coach, CoachFilter } from '../../types/Coach';
import { CoachService } from '../../services/coach/CoachService';
import { CoachCard } from './CoachCard';
import { CoachFilters } from './CoachFilters';
import './CoachList.css';

/**
 * Environment-aware logger utility
 * Only logs in development mode to prevent information disclosure in production
 */
const Logger = {
    log: (...args: unknown[]) => {
        // Using try-catch to handle environments where import.meta might not be available
        try {
            // @ts-expect-error - Vite provides import.meta.env
            if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
                console.log(...args);
            }
        } catch {
            // Fallback for non-Vite environments
        }
    },
    error: (...args: unknown[]) => {
        try {
            // @ts-expect-error - Vite provides import.meta.env
            if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
                console.error(...args);
            }
        } catch {
            // Fallback for non-Vite environments
            // In production, send to error tracking service
            // errorTrackingService.captureException(args[0]);
        }
    },
};

interface CoachListProps {
    onSelectCoach?: (coach: Coach) => void;
}

export function CoachList({ onSelectCoach }: CoachListProps) {
    const [coaches, setCoaches] = useState<Coach[]>([]);
    const [filter, setFilter] = useState<CoachFilter>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const coachService = CoachService.getInstance();

    useEffect(() => {
        const fetchCoaches = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const data = await coachService.getCoaches(filter);
                setCoaches(data);
            } catch (err) {
                Logger.error('Failed to fetch coaches:', err);
                setError('Failed to load coaches. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCoaches();
    }, [filter]);

    const handleConnect = useCallback((coach: Coach) => {
        onSelectCoach?.(coach);
        Logger.log('Connect to coach:', coach.name);
    }, [onSelectCoach]);

    const handleViewProfile = useCallback((coach: Coach) => {
        Logger.log('View profile:', coach.name);
    }, []);

    return (
        <div className="coach-list" data-testid="coach-list">
            <div className="coach-list__header">
                <h1 className="coach-list__title">Find Your Coach</h1>
                <p className="coach-list__subtitle">
                    Connect with expert coaches who understand your journey
                </p>
            </div>

            <CoachFilters filter={filter} onFilterChange={setFilter} />

            {isLoading && (
                <div className="coach-list__loading" data-testid="coach-list-loading">
                    <div className="loading-spinner"></div>
                    <p>Finding coaches...</p>
                </div>
            )}

            {error && (
                <div className="coach-list__error" role="alert">
                    <p>{error}</p>
                    <button onClick={() => setFilter({ ...filter })}>Retry</button>
                </div>
            )}

            {!isLoading && !error && coaches.length === 0 && (
                <div className="coach-list__empty" data-testid="coach-list-empty">
                    <p>No coaches found matching your criteria.</p>
                    <button onClick={() => setFilter({})}>Clear Filters</button>
                </div>
            )}

            {!isLoading && !error && coaches.length > 0 && (
                <>
                    <div className="coach-list__count">
                        Showing {coaches.length} coach{coaches.length !== 1 ? 'es' : ''}
                    </div>
                    <div className="coach-list__grid" data-testid="coach-grid">
                        {coaches.map(coach => (
                            <CoachCard
                                key={coach.id}
                                coach={coach}
                                onConnect={handleConnect}
                                onViewProfile={handleViewProfile}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
