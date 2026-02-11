import { CapturedNote, ParaType, CategorySuggestion } from '../types/Memory';
import DOMPurify from 'dompurify';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export interface ImportResult {
    totalFiles: number;
    processedFiles: number;
    errors: string[];
    notes: CapturedNote[];
}

export interface ObsidianVaultValidation {
    isValid: boolean;
    folders: string[];
}

export class ImportService {
    static async validateObsidianVault(files: FileList): Promise<ObsidianVaultValidation> {
        const folders = new Set<string>();
        let hasMarkdown = false;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            // webkitRelativePath is available when importing directories
            const path = file.webkitRelativePath || file.name;
            const parts = path.split('/');

            if (parts.length > 1) {
                // Add parent folder
                folders.add(parts.slice(0, parts.length - 1).join('/'));
            }

            if (file.name.endsWith('.md')) {
                hasMarkdown = true;
            }
        }

        return {
            isValid: hasMarkdown,
            folders: Array.from(folders)
        };
    }

    static async importFromObsidian(files: FileList): Promise<ImportResult> {
        const result: ImportResult = {
            totalFiles: files.length,
            processedFiles: 0,
            errors: [],
            notes: []
        };

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!file.name.endsWith('.md')) continue;

            if (file.size > MAX_FILE_SIZE) {
                result.errors.push(`Skipped ${file.name}: File too large (>${MAX_FILE_SIZE / 1024 / 1024}MB)`);
                continue;
            }

            try {
                const text = await file.text();
                // Store raw Markdown. Sanitization happens at RENDER time to prevent XSS.
                // DOMPurify here might strip valid Markdown or be bypassed by Markdown features.
                const sanitizedText = text;

                // Simple frontmatter parsing (just separating if --- exists)
                // In real app we might use a library, but for now simple split is fine or just take content
                // Assuming content is the whole file for now as per MVP requirements or simplified logic

                const note: CapturedNote = {
                    id: `obsidian-${Date.now()}-${i}`,
                    content: sanitizedText,
                    createdAt: new Date().toISOString(), // In real app, read file.lastModified
                    linkedEntities: [], // Todo: parse hashtags/links
                    category: this.mapFolderToCategory(file.webkitRelativePath)
                };

                result.notes.push(note);
                result.processedFiles++;
            } catch (error) {
                result.errors.push(`Failed to read ${file.name}: ${(error as Error).message}`);
            }
        }

        return result;
    }

    static async importFromGoogleKeep(authTokens: any): Promise<ImportResult> {
        // Placeholder
        return {
            totalFiles: 0,
            processedFiles: 0,
            errors: ['Not implemented'],
            notes: []
        };
    }

    static async importFromAppleNotes(credentials: any): Promise<ImportResult> {
        // Placeholder
        return {
            totalFiles: 0,
            processedFiles: 0,
            errors: ['Not implemented'],
            notes: []
        };
    }

    static async deduplicateNotes(notes: CapturedNote[]): Promise<{ original: CapturedNote, new: CapturedNote, similarity: number }[]> {
        // Placeholder for vector similarity check
        // In a real implementation this would call an embedding service and compare against existing vector DB
        return [];
    }

    private static mapFolderToCategory(path: string): CategorySuggestion | undefined {
        if (!path) return undefined;

        const lowerPath = path.toLowerCase();
        let type: ParaType | undefined;

        if (lowerPath.includes('projects')) type = 'project';
        else if (lowerPath.includes('areas')) type = 'area';
        else if (lowerPath.includes('resources')) type = 'resource';
        else if (lowerPath.includes('archives')) type = 'archive';

        if (type) {
            // Extract folder name as category name
            const parts = path.split('/');
            const name = parts.length > 1 ? parts[parts.length - 2] : 'Unknown';
            return {
                type,
                name,
                confidence: 0.8
            };
        }
        return undefined;
    }
}
