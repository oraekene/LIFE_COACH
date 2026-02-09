/**
 * CoachFilters Component
 * UI for filtering coaches by specialization, availability, etc.
 * Story 2.1: Browse Coaches
 */

import { CoachSpecialization, CoachFilter, SPECIALIZATION_LABELS, CoachLanguage, LANGUAGE_LABELS } from '../../types/Coach';
import './CoachFilters.css';

interface CoachFiltersProps {
    filter: CoachFilter;
    onFilterChange: (filter: CoachFilter) => void;
}

export function CoachFilters({ filter, onFilterChange }: CoachFiltersProps) {
    const specializations: CoachSpecialization[] = [
        'stress_management',
        'career_development',
        'relationships',
        'fitness_wellness',
        'mindfulness',
        'productivity',
        'financial',
        'life_balance'
    ];

    const handleSpecializationChange = (spec: CoachSpecialization | undefined) => {
        onFilterChange({ ...filter, specialization: spec });
    };

    const handleAvailabilityChange = (available: boolean | undefined) => {
        onFilterChange({ ...filter, isAvailable: available });
    };

    const languages: CoachLanguage[] = ['english', 'spanish', 'mandarin', 'french', 'german', 'portuguese'];

    const handleLanguageChange = (lang: CoachLanguage | undefined) => {
        onFilterChange({ ...filter, language: lang });
    };

    const handleSearchChange = (query: string) => {
        onFilterChange({ ...filter, searchQuery: query || undefined });
    };

    const clearFilters = () => {
        onFilterChange({});
    };

    const hasActiveFilters = filter.specialization || filter.isAvailable !== undefined || filter.searchQuery || filter.language;

    return (
        <div className="coach-filters" data-testid="coach-filters">
            <div className="coach-filters__search">
                <input
                    type="text"
                    placeholder="Search coaches..."
                    value={filter.searchQuery || ''}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="search-input"
                    data-testid="coach-search-input"
                />
            </div>

            <div className="coach-filters__group">
                <label className="filter-label">Specialization</label>
                <div className="filter-pills">
                    <button
                        className={`filter-pill ${!filter.specialization ? 'filter-pill--active' : ''}`}
                        onClick={() => handleSpecializationChange(undefined)}
                        data-testid="filter-all"
                        aria-label="Show all specializations"
                        aria-pressed={!filter.specialization}
                    >
                        All
                    </button>
                    {specializations.map(spec => (
                        <button
                            key={spec}
                            className={`filter-pill ${filter.specialization === spec ? 'filter-pill--active' : ''}`}
                            onClick={() => handleSpecializationChange(spec)}
                            data-testid={`filter-${spec}`}
                            aria-label={`Filter by ${SPECIALIZATION_LABELS[spec]}`}
                            aria-pressed={filter.specialization === spec}
                        >
                            {SPECIALIZATION_LABELS[spec]}
                        </button>
                    ))}
                </div>
            </div>

            <div className="coach-filters__group">
                <label className="filter-label">Availability</label>
                <div className="filter-pills">
                    <button
                        className={`filter-pill ${filter.isAvailable === undefined ? 'filter-pill--active' : ''}`}
                        onClick={() => handleAvailabilityChange(undefined)}
                        data-testid="availability-all"
                        aria-label="Show all availability statuses"
                        aria-pressed={filter.isAvailable === undefined}
                    >
                        All
                    </button>
                    <button
                        className={`filter-pill ${filter.isAvailable === true ? 'filter-pill--active' : ''}`}
                        onClick={() => handleAvailabilityChange(true)}
                        data-testid="availability-available"
                        aria-label="Show only available coaches"
                        aria-pressed={filter.isAvailable === true}
                    >
                        Available Now
                    </button>
                </div>
            </div>

            <div className="coach-filters__group">
                <label className="filter-label">Language</label>
                <div className="filter-pills">
                    <button
                        className={`filter-pill ${!filter.language ? 'filter-pill--active' : ''}`}
                        onClick={() => handleLanguageChange(undefined)}
                        data-testid="language-all"
                        aria-label="Show all languages"
                        aria-pressed={!filter.language}
                    >
                        All
                    </button>
                    {languages.map(lang => (
                        <button
                            key={lang}
                            className={`filter-pill ${filter.language === lang ? 'filter-pill--active' : ''}`}
                            onClick={() => handleLanguageChange(lang)}
                            data-testid={`language-${lang}`}
                            aria-label={`Filter by ${LANGUAGE_LABELS[lang]}`}
                            aria-pressed={filter.language === lang}
                        >
                            {LANGUAGE_LABELS[lang]}
                        </button>
                    ))}
                </div>
            </div>

            {hasActiveFilters && (
                <button
                    className="clear-filters-btn"
                    onClick={clearFilters}
                    data-testid="clear-filters"
                >
                    Clear Filters
                </button>
            )}
        </div>
    );
}
