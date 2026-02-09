/**
 * Coach Type Definitions
 * Story 2.1: Browse Coaches
 */

export type CoachSpecialization =
    | 'stress_management'
    | 'career_development'
    | 'relationships'
    | 'fitness_wellness'
    | 'mindfulness'
    | 'productivity'
    | 'financial'
    | 'life_balance';

export type CoachLanguage = 'english' | 'spanish' | 'mandarin' | 'french' | 'german' | 'portuguese';

export interface Coach {
    id: string;
    name: string;
    title: string;
    specializations: CoachSpecialization[];
    bio: string;
    avatar: string;
    rating: number;
    reviewCount: number;
    yearsExperience: number;
    isAvailable: boolean;
    hourlyRate?: number;
    language: CoachLanguage;
    downloadSize?: number; // Size in MB
}

export interface CoachFilter {
    specialization?: CoachSpecialization;
    minRating?: number;
    isAvailable?: boolean;
    searchQuery?: string;
    language?: CoachLanguage;
}

export const SPECIALIZATION_LABELS: Record<CoachSpecialization, string> = {
    stress_management: 'Stress Management',
    career_development: 'Career Development',
    relationships: 'Relationships',
    fitness_wellness: 'Fitness & Wellness',
    mindfulness: 'Mindfulness',
    productivity: 'Productivity',
    financial: 'Financial',
    life_balance: 'Life Balance'
};

export const LANGUAGE_LABELS: Record<CoachLanguage, string> = {
    english: 'English',
    spanish: 'Spanish',
    mandarin: 'Mandarin',
    french: 'French',
    german: 'German',
    portuguese: 'Portuguese'
};
