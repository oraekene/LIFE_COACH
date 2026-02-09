/**
 * InterestSelector Component
 * Allows users to select 1-2 interest areas for coach recommendations
 * Story 1.1: User Registration - AC3
 */

import React, { useCallback, useState, useMemo } from 'react';
import './InterestSelector.css';

export interface InterestArea {
    id: string;
    name: string;
    icon: string;
}

interface InterestSelectorProps {
    areas: InterestArea[];
    selectedInterests?: string[];
    onSelect?: (interests: string[]) => void;
    onSave?: (data: { interests: string[] }) => Promise<{ success: boolean }>;
    getRecommendations?: (interests: string[]) => Promise<any[]>;
    maxSelections?: number;
}

export function InterestSelector({
    areas,
    selectedInterests: controlledInterests,
    onSelect,
    onSave,
    getRecommendations,
    maxSelections = 2,
}: InterestSelectorProps) {
    const [internalSelected, setInternalSelected] = useState<string[]>([]);
    const [showMaxWarning, setShowMaxWarning] = useState(false);

    // Support both controlled and uncontrolled modes
    const selected = controlledInterests ?? internalSelected;
    const setSelected = onSelect ?? setInternalSelected;

    const handleSelect = useCallback((areaId: string) => {
        setShowMaxWarning(false);

        // Always use internal state for tracking when controlledInterests is not provided
        const currentSelection = controlledInterests ?? internalSelected;

        if (currentSelection.includes(areaId)) {
            // Deselect
            const newSelection = currentSelection.filter(id => id !== areaId);
            setInternalSelected(newSelection);
            onSelect?.(newSelection);
        } else {
            // Select (if under max)
            if (currentSelection.length >= maxSelections) {
                setShowMaxWarning(true);
                return;
            }
            const newSelection = [...currentSelection, areaId];
            setInternalSelected(newSelection);
            onSelect?.(newSelection);

            // Fetch recommendations if provided
            if (getRecommendations) {
                getRecommendations(newSelection);
            }
        }
    }, [controlledInterests, internalSelected, onSelect, maxSelections, getRecommendations]);

    const handleSave = useCallback(async () => {
        if (onSave) {
            await onSave({ interests: selected });
        }
    }, [onSave, selected]);

    const canProceed = selected.length >= 1;

    return (
        <div className="interest-selector">
            {showMaxWarning && (
                <div className="interest-selector__warning" role="alert">
                    You can only select up to {maxSelections} interest areas
                </div>
            )}

            <div className="interest-selector__grid">
                {areas.map((area) => {
                    const isSelected = selected.includes(area.id);
                    return (
                        <button
                            key={area.id}
                            type="button"
                            className={`interest-selector__option ${isSelected ? 'interest-selector__option--selected' : ''}`}
                            onClick={() => handleSelect(area.id)}
                            data-testid="interest-option"
                            data-selected={isSelected}
                            aria-pressed={isSelected}
                        >
                            <span className="interest-selector__icon">{area.icon}</span>
                            <span className="interest-selector__name">{area.name}</span>
                            {isSelected && (
                                <span className="interest-selector__check" aria-hidden="true">✓</span>
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="interest-selector__footer">
                <p className="interest-selector__hint">
                    {selected.length === 0
                        ? 'Select at least 1 area to continue'
                        : `${selected.length} of ${maxSelections} selected`
                    }
                </p>

                {onSave && (
                    <button
                        type="button"
                        className="interest-selector__save-button"
                        onClick={handleSave}
                        disabled={!canProceed}
                        aria-label="Save"
                    >
                        Continue
                    </button>
                )}
            </div>
        </div>
    );
}

export default InterestSelector;
