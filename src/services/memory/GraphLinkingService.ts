/**
 * GraphLinkingService
 * Story 4.1: Quick Capture (AC4)
 * Handles #hashtag and @mention parsing and graph linking
 */

import { MemoryService } from './MemoryService';

export interface ParsedHashtag {
    tag: string;
    type: 'project' | 'area' | 'resource';
}

export interface ParsedMention {
    name: string;
    type: 'person';
}

export interface LinkResult {
    success: boolean;
    linkedEntities: string[];
}

export class GraphLinkingService {
    private memoryService: MemoryService;

    constructor(memoryService?: MemoryService) {
        this.memoryService = memoryService || new MemoryService();
    }

    parseHashtags(content: string): ParsedHashtag[] {
        const hashtagPattern = /#([\w-]+)/g;
        const matches = content.match(hashtagPattern) || [];

        return matches.map(tag => ({
            tag: tag.slice(1), // Remove the # prefix
            type: 'project' as const // Default to project, could be detected
        }));
    }

    parseMentions(content: string): ParsedMention[] {
        const mentionPattern = /@([\w-]+)/g;
        const matches = content.match(mentionPattern) || [];

        return matches.map(mention => ({
            name: mention.slice(1), // Remove the @ prefix
            type: 'person' as const
        }));
    }

    async linkToGraph(content: string): Promise<LinkResult> {
        const hashtags = this.parseHashtags(content);
        const mentions = this.parseMentions(content);

        const linkedEntityIds: string[] = [];

        // Link hashtags to existing entities
        const paraEntities = await this.memoryService.getParaEntities();

        for (const hashtag of hashtags) {
            const matchingProject = paraEntities.projects.find(
                p => p.name.toLowerCase().replace(/\s+/g, '-') === hashtag.tag.toLowerCase()
            );
            if (matchingProject) {
                linkedEntityIds.push(matchingProject.id);
            }
        }

        // Link mentions to existing people
        for (const mention of mentions) {
            const matchingPerson = paraEntities.people.find(
                p => p.name.toLowerCase() === mention.name.toLowerCase()
            );
            if (matchingPerson) {
                linkedEntityIds.push(matchingPerson.id);
            }
        }

        return {
            success: true,
            linkedEntities: linkedEntityIds
        };
    }

    async getAutocompleteSuggestions(prefix: string, type: 'hashtag' | 'mention'): Promise<string[]> {
        const paraEntities = await this.memoryService.getParaEntities();

        if (type === 'hashtag') {
            const projectNames = paraEntities.projects.map(p => p.name.toLowerCase().replace(/\s+/g, '-'));
            const searchTerm = prefix.replace('#', '').toLowerCase();
            return projectNames.filter(name => name.startsWith(searchTerm));
        } else {
            const personNames = paraEntities.people.map(p => p.name.toLowerCase());
            const searchTerm = prefix.replace('@', '').toLowerCase();
            return personNames.filter(name => name.startsWith(searchTerm));
        }
    }
}
