/**
 * CoachCard Component
 * Visual representation of a single coach
 * Story 2.1: Browse Coaches
 */

import { Coach, SPECIALIZATION_LABELS } from '../../types/Coach';
import './CoachCard.css';

interface CoachCardProps {
    coach: Coach;
    onConnect?: (coach: Coach) => void;
    onViewProfile?: (coach: Coach) => void;
}

export function CoachCard({ coach, onConnect, onViewProfile }: CoachCardProps) {
    return (
        <article className="coach-card" data-testid={`coach-card-${coach.id}`}>
            <div className="coach-card__header">
                <div className="coach-card__avatar" aria-hidden="true">
                    {coach.avatar}
                </div>
                <div className="coach-card__status">
                    {coach.isAvailable ? (
                        <span className="status-badge status-badge--available">Available</span>
                    ) : (
                        <span className="status-badge status-badge--busy">Busy</span>
                    )}
                </div>
            </div>

            <div className="coach-card__body">
                <h3 className="coach-card__name">{coach.name}</h3>
                <p className="coach-card__title">{coach.title}</p>

                <div className="coach-card__rating">
                    <span className="rating-star" aria-hidden="true">⭐</span>
                    <span className="rating-value">{coach.rating.toFixed(1)}</span>
                    <span className="rating-count">({coach.reviewCount} reviews)</span>
                </div>

                <div className="coach-card__specializations">
                    {coach.specializations.slice(0, 3).map(spec => (
                        <span key={spec} className="specialization-tag">
                            {SPECIALIZATION_LABELS[spec]}
                        </span>
                    ))}
                </div>

                <p className="coach-card__bio">{coach.bio}</p>

                <div className="coach-card__meta">
                    <span className="meta-item">
                        <strong>{coach.yearsExperience}</strong> years exp.
                    </span>
                    {coach.hourlyRate && (
                        <span className="meta-item">
                            <strong>${coach.hourlyRate}</strong>/hour
                        </span>
                    )}
                    {coach.downloadSize && (
                        <span className="meta-item meta-item--download" data-testid="download-size">
                            <span className="download-icon">📥</span>
                            <strong>{coach.downloadSize}MB</strong> download
                        </span>
                    )}
                </div>
            </div>

            <div className="coach-card__actions">
                <button
                    className="btn btn--secondary"
                    onClick={() => onViewProfile?.(coach)}
                    data-testid={`view-profile-${coach.id}`}
                >
                    View Profile
                </button>
                <button
                    className="btn btn--primary"
                    onClick={() => onConnect?.(coach)}
                    disabled={!coach.isAvailable}
                    data-testid={`connect-${coach.id}`}
                >
                    {coach.isAvailable ? 'Connect' : 'Not Available'}
                </button>
            </div>
        </article>
    );
}
