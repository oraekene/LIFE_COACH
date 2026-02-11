import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ImportService } from '../services/ImportService';

describe('ImportService Unit Tests', () => {

    describe('importFromObsidian', () => {
        it('should NOT sanitize markdown content during import (Security Requirement)', async () => {
            // We want to store RAW markdown to preserve formatting and prevent 
            // premature/incorrect sanitization. Sanitization must happen at RENDER time.

            const rawContent = '# Heading\n\n<script>alert("xss")</script>\n**Bold**';
            const file = new File([rawContent], 'note.md', { type: 'text/markdown' });

            // Mock FileList with array-like behavior + item() method
            const fileList = [file] as unknown as FileList;
            (fileList as any).item = (index: number) => fileList[index];

            const result = await ImportService.importFromObsidian(fileList);

            expect(result.processedFiles).toBe(1);
            expect(result.notes[0].content).toBe(rawContent); // Exact match required
            expect(result.notes[0].content).toContain('<script>'); // Should STILL contain script tags
        });

        it('should skip files larger than 5MB', async () => {
            const largeContent = new Array(5 * 1024 * 1024 + 10).fill('a').join('');
            const file = new File([largeContent], 'large.md', { type: 'text/markdown' });

            // Mock FileList with array-like behavior + item() method
            const fileList = [file] as unknown as FileList;
            (fileList as any).item = (index: number) => fileList[index];

            const result = await ImportService.importFromObsidian(fileList);

            expect(result.processedFiles).toBe(0);
            expect(result.errors.length).toBe(1);
            expect(result.errors[0]).toContain('File too large');
        });
    });
});
