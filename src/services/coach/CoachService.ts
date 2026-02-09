/**
 * CoachService
 * Service for fetching and filtering coach data
 * Story 2.1: Browse Coaches
 */

import { Coach, CoachFilter, CoachSpecialization } from '../../types/Coach';

/**
 * Sanitize search query to prevent injection attacks
 * - Limits length to 100 characters
 * - Removes potentially dangerous characters
 * - Trims whitespace
 */
function sanitizeSearchQuery(query: string): string {
    return query
        .substring(0, 100)
        .replace(/[<>"'&;]/g, '')
        .trim();
}

// Mock coach data for MVP
const MOCK_COACHES: Coach[] = [
    {
        id: 'coach-1',
        name: 'Dr. Sarah Chen',
        title: 'Clinical Psychologist & Life Coach',
        specializations: ['stress_management', 'mindfulness', 'life_balance'],
        bio: 'With over 15 years of experience in clinical psychology, I help individuals navigate stress, anxiety, and life transitions with evidence-based techniques and compassionate guidance.',
        avatar: '🧘‍♀️',
        rating: 4.9,
        reviewCount: 247,
        yearsExperience: 15,
        isAvailable: true,
        hourlyRate: 150,
        language: 'english',
        downloadSize: 45
    },
    {
        id: 'coach-2',
        name: 'Marcus Johnson',
        title: 'Executive Career Coach',
        specializations: ['career_development', 'productivity', 'financial'],
        bio: 'Former Fortune 500 executive turned career coach. I specialize in helping professionals advance their careers, negotiate salaries, and achieve work-life harmony.',
        avatar: '💼',
        rating: 4.8,
        reviewCount: 189,
        yearsExperience: 12,
        isAvailable: true,
        hourlyRate: 200,
        language: 'english',
        downloadSize: 52
    },
    {
        id: 'coach-3',
        name: 'Emma Rodriguez',
        title: 'Relationship & Communication Expert',
        specializations: ['relationships', 'life_balance'],
        bio: 'Helping individuals and couples build stronger, healthier relationships through improved communication, emotional intelligence, and conflict resolution skills.',
        avatar: '💕',
        rating: 4.7,
        reviewCount: 156,
        yearsExperience: 8,
        isAvailable: true,
        hourlyRate: 120,
        language: 'spanish',
        downloadSize: 38
    },
    {
        id: 'coach-4',
        name: 'Alex Thompson',
        title: 'Fitness & Wellness Coach',
        specializations: ['fitness_wellness', 'stress_management', 'mindfulness'],
        bio: 'Certified personal trainer and wellness coach. I combine physical fitness with mental wellness strategies to help you achieve holistic health and vitality.',
        avatar: '💪',
        rating: 4.9,
        reviewCount: 312,
        yearsExperience: 10,
        isAvailable: false,
        hourlyRate: 100,
        language: 'english',
        downloadSize: 48
    },
    {
        id: 'coach-5',
        name: 'Dr. Lisa Park',
        title: 'Mindfulness & Meditation Teacher',
        specializations: ['mindfulness', 'stress_management', 'life_balance'],
        bio: 'PhD in Contemplative Sciences with training in MBSR. I guide individuals in developing sustainable meditation practices for lasting peace and clarity.',
        avatar: '🧠',
        rating: 4.8,
        reviewCount: 198,
        yearsExperience: 11,
        isAvailable: true,
        hourlyRate: 130,
        language: 'mandarin',
        downloadSize: 42
    },
    {
        id: 'coach-6',
        name: 'David Kim',
        title: 'Productivity & Time Management Expert',
        specializations: ['productivity', 'career_development'],
        bio: 'Author of "The Focused Mind" and productivity consultant. I help overwhelmed professionals reclaim their time and achieve more with less stress.',
        avatar: '⏰',
        rating: 4.6,
        reviewCount: 142,
        yearsExperience: 7,
        isAvailable: true,
        hourlyRate: 140,
        language: 'english',
        downloadSize: 35
    },
    {
        id: 'coach-7',
        name: 'Rachel Green',
        title: 'Financial Wellness Coach',
        specializations: ['financial', 'life_balance', 'career_development'],
        bio: 'CFP® with a passion for financial literacy. I help individuals build healthy money habits, reduce financial stress, and create pathways to financial freedom.',
        avatar: '💰',
        rating: 4.7,
        reviewCount: 167,
        yearsExperience: 9,
        isAvailable: true,
        hourlyRate: 160,
        language: 'french',
        downloadSize: 40
    },
    {
        id: 'coach-8',
        name: 'James Wilson',
        title: 'Life Transition Specialist',
        specializations: ['life_balance', 'relationships', 'stress_management'],
        bio: 'Specializing in major life transitions – divorce, retirement, career changes. I provide supportive guidance to help you navigate uncertainty with confidence.',
        avatar: '🌟',
        rating: 4.8,
        reviewCount: 203,
        yearsExperience: 14,
        isAvailable: true,
        hourlyRate: 145,
        language: 'german',
        downloadSize: 50
    }
];

export class CoachService {
    private static instance: CoachService;

    private constructor() { }

    static getInstance(): CoachService {
        if (!CoachService.instance) {
            CoachService.instance = new CoachService();
        }
        return CoachService.instance;
    }

    /**
     * Get all coaches, optionally filtered
     */
    async getCoaches(filter?: CoachFilter): Promise<Coach[]> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));

        let coaches = [...MOCK_COACHES];

        if (filter) {
            if (filter.specialization) {
                coaches = coaches.filter(coach =>
                    coach.specializations.includes(filter.specialization as CoachSpecialization)
                );
            }

            if (filter.minRating !== undefined) {
                coaches = coaches.filter(coach => coach.rating >= filter.minRating!);
            }

            if (filter.isAvailable !== undefined) {
                coaches = coaches.filter(coach => coach.isAvailable === filter.isAvailable);
            }

            if (filter.language) {
                coaches = coaches.filter(coach => coach.language === filter.language);
            }

            if (filter.searchQuery) {
                const sanitizedQuery = sanitizeSearchQuery(filter.searchQuery);
                if (!sanitizedQuery) return coaches;
                const query = sanitizedQuery.toLowerCase();
                coaches = coaches.filter(coach =>
                    coach.name.toLowerCase().includes(query) ||
                    coach.title.toLowerCase().includes(query) ||
                    coach.bio.toLowerCase().includes(query)
                );
            }
        }

        return coaches;
    }

    /**
     * Get a single coach by ID
     */
    async getCoachById(id: string): Promise<Coach | null> {
        await new Promise(resolve => setTimeout(resolve, 200));
        return MOCK_COACHES.find(coach => coach.id === id) || null;
    }

    /**
     * Get all available specializations
     */
    getSpecializations(): CoachSpecialization[] {
        return [
            'stress_management',
            'career_development',
            'relationships',
            'fitness_wellness',
            'mindfulness',
            'productivity',
            'financial',
            'life_balance'
        ];
    }
}
