export type ParaType = 'project' | 'area' | 'resource' | 'archive';

export interface ParaEntity {
    id: string;
    name: string;
    type: ParaType;
    status: 'active' | 'completed' | 'archived';
    lastAccessed: string;
    description?: string;
    deadline?: string;
}

export interface PersonEntity {
    id: string;
    name: string;
    type: 'person';
    relation: string;
    lastAccessed: string;
    notes?: string;
}

export type MemoryEntity = ParaEntity | PersonEntity;

export interface HotMemory {
    id: string;
    content: string;
    timestamp: string;
    relatedEntityId?: string;
}

export interface ParaContext {
    projects: ParaEntity[];
    people: PersonEntity[];
}

// Story 4.1: Quick Capture Types

export interface CategorySuggestion {
    type: ParaType | 'person';
    name: string;
    confidence: number;
    alternatives?: CategorySuggestion[];
}

export interface LinkedEntityRef {
    tag?: string;
    name?: string;
    type: 'project' | 'area' | 'resource' | 'person';
    entityId?: string;
}

export interface CapturedNote {
    id: string;
    content: string;
    createdAt: string;
    linkedEntities: LinkedEntityRef[];
    newEntities?: LinkedEntityRef[];
    category?: CategorySuggestion;
    voiceTranscription?: boolean;
    transcriptionConfidence?: number;
}

// Story 4.2: Automated Archival Types
export type ProjectStatus = 'Active' | 'Archived' | 'Completed';

export interface Project {
    id: string;
    name: string;
    status: ProjectStatus;
    lastActiveDate: string;
    category: string;
}
