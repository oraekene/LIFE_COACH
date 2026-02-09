import { ParaContext, MemoryEntity, HotMemory } from '../../types/Memory';

export class MemoryService {
    // In a real implementation, this would connect to the SQLite database
    // For now, we use in-memory mock data to satisfy the test requirements

    // SECURITY TODO: 
    // 1. Ensure Multi-Tenant Isolation (ROW LEVEL SECURITY) when replacing this with SQLite.
    // 2. Validate all inputs to getParaEntities/searchEntities to prevent SQL Injection.
    // 3. Sanitize 'lastAccessed' timestamps to prevent cache poisoning.

    async getParaEntities(): Promise<ParaContext> {
        return {
            projects: [
                {
                    id: 'proj-1',
                    name: 'Marathon Training',
                    type: 'project',
                    status: 'active',
                    lastAccessed: new Date().toISOString()
                },
                {
                    id: 'proj-2',
                    name: 'Learn Spanish',
                    type: 'project',
                    status: 'active',
                    lastAccessed: new Date(Date.now() - 86400000).toISOString()
                }
            ],
            people: [
                {
                    id: 'person-1',
                    name: 'Sarah',
                    type: 'person',
                    relation: 'Partner',
                    lastAccessed: new Date().toISOString()
                }
            ]
        };
    }

    async searchEntities(query: string): Promise<MemoryEntity[]> {
        const context = await this.getParaEntities();
        const allEntities = [...context.projects, ...context.people];

        if (query === '@' || query === '') {
            return allEntities; // Return all for empty search/trigger
        }

        const lowerQuery = query.toLowerCase().replace('@', '');
        return allEntities.filter(e => e.name.toLowerCase().includes(lowerQuery));
    }

    async getHotMemories(): Promise<HotMemory[]> {
        return [
            {
                id: 'mem-1',
                content: 'Knee pain during long runs',
                timestamp: new Date().toISOString(),
                relatedEntityId: 'proj-1'
            }
        ];
    }
}
