import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ArchivalService } from '../services/ArchivalService';
import { Project, ProjectStatus } from '../types';

// Mock dependencies if needed
// For this story, we seem to be testing pure logic mostly, or interaction with a store/db.
// We'll treat ArchivalService as the unit under test.

describe('Story 4.2: Automated Archival', () => {
    let archivalService: ArchivalService;
    let mockProjects: Project[];

    beforeEach(() => {
        archivalService = new ArchivalService();
        // Setup mock projects
        const today = new Date();
        const fortyDaysAgo = new Date();
        fortyDaysAgo.setDate(today.getDate() - 40);

        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(today.getDate() - 10);

        mockProjects = [
            {
                id: 'p1',
                name: 'Old Project',
                status: 'Active',
                lastActiveDate: fortyDaysAgo.toISOString(),
                category: 'Work'
            } as Project,
            {
                id: 'p2',
                name: 'Recent Project',
                status: 'Active',
                lastActiveDate: tenDaysAgo.toISOString(),
                category: 'Personal'
            } as Project,
        ];
    });

    it('should identify projects inactive for more than 30 days', async () => {
        const coldProjects = await archivalService.identifyColdProjects(mockProjects);
        expect(coldProjects).toHaveLength(1);
        expect(coldProjects[0].id).toBe('p1');
        expect(coldProjects[0].name).toBe('Old Project');
    });

    it('should generate the correct archival suggestion message', () => {
        const project = mockProjects[0]; // Old Project
        const suggestion = archivalService.generateSuggestion(project);
        expect(suggestion).toBe("Project 'Old Project' completed? Move to Archives?");
    });

    it('should sanitize project names in suggestions to prevent XSS', () => {
        const maliciousProject = { ...mockProjects[0], name: '<script>alert(1)</script>pwned' };
        const suggestion = archivalService.generateSuggestion(maliciousProject);
        expect(suggestion).not.toContain('<script>');
        expect(suggestion).toBe("Project 'scriptalert(1)/scriptpwned' completed? Move to Archives?");
    });

    it('should not identify recent projects as cold', async () => {
        const coldProjects = await archivalService.identifyColdProjects([mockProjects[1]]);
        expect(coldProjects).toHaveLength(0);
    });

    it('should archive a project by updating its status', async () => {
        // Pass userId for auth check
        const updatedProject = await archivalService.archiveProject(mockProjects[0].id, 'test-user');
        expect(updatedProject.status).toBe('Archived');
    });

    it('should throw error if archiving without userId', async () => {
        // @ts-ignore - testing runtime check
        await expect(archivalService.archiveProject(mockProjects[0].id, '')).rejects.toThrow('Unauthorized');
    });

    it('should classify cold facts/projects as "hidden" or lower priority in search', () => {
        // This maps to "Graceful decay: Cold facts (>30 days) hidden but searchable"
        // We might test a 'calculateVisibility' or 'decayScore' method
        const score = archivalService.calculateDecayScore(mockProjects[0]);
        expect(score).toBeLessThan(0.5); // Assuming 1.0 is hot, 0.0 is invisible
    });
});
