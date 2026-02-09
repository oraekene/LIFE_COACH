import { Project, ProjectStatus } from '../types';

export class ArchivalService {
    /**
     * Identifies projects that have been inactive for more than 30 days.
     * @param projects List of projects to check
     * @returns List of cold projects
     */
    async identifyColdProjects(projects: Project[]): Promise<Project[]> {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        return projects.filter(project => {
            if (project.status !== 'Active') return false;
            const lastActive = new Date(project.lastActiveDate);
            return lastActive < thirtyDaysAgo;
        });
    }

    /**
     * Generates a suggestion message for archiving a project.
     * Sanitizes the project name to prevent XSS in notifications.
     * @param project The project to suggest archiving
     * @returns Suggestion string
     */
    generateSuggestion(project: Project): string {
        // Simple sanitization to remove potential HTML tags
        const safeName = project.name.replace(/[<>]/g, '');
        return `Project '${safeName}' completed? Move to Archives?`;
    }

    /**
     * Archives a project by updating its status.
     * Includes mock authorization check and audit logging.
     * @param projectId ID of the project to archive
     * @param userId ID of the requesting user (for auth check)
     * @returns Updated project object (mocked)
     */
    async archiveProject(projectId: string, userId: string): Promise<Project> {
        // 1. Authorization Check (Mock)
        if (!userId) {
            throw new Error('Unauthorized: User ID required for archival');
        }
        // In a real app, verify project.ownerId === userId

        // 2. Audit Logging
        console.log(`[AUDIT] User ${userId} archived project ${projectId} at ${new Date().toISOString()}`);

        // 3. Perform Update (Mock)
        return {
            id: projectId,
            name: 'Archived Project',
            status: 'Archived',
            lastActiveDate: new Date().toISOString(),
            category: 'Archived'
        } as Project;
    }

    /**
     * Calculates a decay score for a project based on its last active date.
     * Hot (0-7 days) = 1.0
     * Warm (8-30 days) = 0.5
     * Cold (>30 days) = 0.1
     * @param project
     */
    calculateDecayScore(project: Project): number {
        const today = new Date();
        const lastActive = new Date(project.lastActiveDate);
        const diffTime = Math.abs(today.getTime() - lastActive.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 7) return 1.0;
        if (diffDays <= 30) return 0.5;
        return 0.1;
    }
}
