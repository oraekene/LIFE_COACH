/**
 * NoteService
 * Story 4.1: Quick Capture
 * Handles persistence of captured notes with linked entities
 */

import { CapturedNote } from '../../types/Memory';

export class NoteService {
    private notes: CapturedNote[] = [];

    async createNote(note: Omit<CapturedNote, 'id' | 'createdAt'>): Promise<CapturedNote> {
        const newNote: CapturedNote = {
            id: `note-${Date.now()}`,
            content: note.content,
            createdAt: new Date().toISOString(),
            linkedEntities: note.linkedEntities || [],
            category: note.category,
            newEntities: note.newEntities || []
        };

        this.notes.push(newNote);
        return newNote;
    }

    async getNotes(filters?: { category?: string }): Promise<CapturedNote[]> {
        if (filters?.category) {
            return this.notes.filter(n => n.category?.type === filters.category);
        }
        return this.notes;
    }

    async updateNote(id: string, updates: Partial<CapturedNote>): Promise<boolean> {
        const index = this.notes.findIndex(n => n.id === id);
        if (index === -1) return false;

        this.notes[index] = { ...this.notes[index], ...updates };
        return true;
    }
}
