/**
 * ParaCategorizationService
 * Story 4.1: Quick Capture (AC2)
 * AI-powered categorization of notes into PARA categories
 */

import { ParaType, CategorySuggestion } from '../../types/Memory';

export interface ExtractedEntity {
    type: 'project' | 'area' | 'resource' | 'person';
    name: string;
    detected: boolean;
}

export class ParaCategorizationService {
    // In a real implementation, this would use NER (GLiNER) and ML models
    // For now, we use keyword-based heuristics

    private projectKeywords = ['training', 'project', 'goal', 'build', 'create', 'launch', 'deadline', 'milestone'];
    private areaKeywords = ['health', 'fitness', 'career', 'relationship', 'finance', 'wellness', 'growth'];
    private resourceKeywords = ['tips', 'reference', 'guide', 'notes', 'resource', 'book', 'article', 'template'];

    async suggestCategory(content: string): Promise<CategorySuggestion> {
        const lowerContent = content.toLowerCase();

        // Simple keyword matching for demo - real impl would use ML
        const projectScore = this.countKeywords(lowerContent, this.projectKeywords);
        const areaScore = this.countKeywords(lowerContent, this.areaKeywords);
        const resourceScore = this.countKeywords(lowerContent, this.resourceKeywords);

        const scores: { type: ParaType; score: number; name: string }[] = [
            { type: 'project', score: projectScore, name: this.extractProjectName(content) },
            { type: 'area', score: areaScore, name: this.extractAreaName(content) },
            { type: 'resource', score: resourceScore, name: this.extractResourceName(content) }
        ];

        scores.sort((a, b) => b.score - a.score);

        const maxScore = Math.max(projectScore, areaScore, resourceScore, 1);
        const confidence = Math.min(0.95, (scores[0].score / maxScore) * 0.85 + 0.1);

        return {
            type: scores[0].type,
            name: scores[0].name || 'Untitled',
            confidence,
            alternatives: scores.slice(1).map((s, i) => ({
                type: s.type,
                name: s.name || 'Untitled',
                confidence: Math.max(0.1, confidence - 0.2 - (i * 0.1))
            }))
        };
    }

    async extractEntities(content: string): Promise<ExtractedEntity[]> {
        const entities: ExtractedEntity[] = [];

        // Check for existing project names (mocked for demo)
        if (content.toLowerCase().includes('marathon')) {
            entities.push({ type: 'project', name: 'Marathon Training', detected: true });
        }

        // Check for person mentions (mocked for demo)
        if (content.toLowerCase().includes('sarah')) {
            entities.push({ type: 'person', name: 'Sarah', detected: true });
        }

        return entities;
    }

    private countKeywords(content: string, keywords: string[]): number {
        return keywords.reduce((count, kw) => count + (content.includes(kw) ? 1 : 0), 0);
    }

    private extractProjectName(content: string): string {
        // Simple extraction - real impl would use NER
        if (content.toLowerCase().includes('marathon')) return 'Marathon Training';
        if (content.toLowerCase().includes('spanish')) return 'Learn Spanish';
        return 'New Project';
    }

    private extractAreaName(content: string): string {
        if (content.toLowerCase().includes('health') || content.toLowerCase().includes('fitness')) return 'Health';
        if (content.toLowerCase().includes('career')) return 'Career';
        return 'Personal';
    }

    private extractResourceName(content: string): string {
        if (content.toLowerCase().includes('tips')) return 'Running Tips';
        if (content.toLowerCase().includes('guide')) return 'Quick Guide';
        return 'Reference Notes';
    }
}
