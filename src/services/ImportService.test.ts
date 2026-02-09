import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ImportService } from './ImportService';

// Mock File API for Node environment
class MockFile {
    name: string;
    size: number;
    type: string;
    content: string;
    webkitRelativePath: string;

    constructor(content: string[], name: string, options: any = {}) {
        this.name = name;
        this.size = content.join('').length;
        this.type = options.type || '';
        this.content = content.join('');
        this.webkitRelativePath = options.webkitRelativePath || '';
    }

    text() {
        return Promise.resolve(this.content);
    }
}

describe('ImportService', () => {
    beforeEach(() => {
        vi.stubGlobal('File', MockFile);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    describe('importFromObsidian', () => {
        it('should sanitize content to prevent XSS', async () => {
            const maliciousContent = '# Title\n<script>alert("xss")</script>\n[link](javascript:void(0))';
            const file = new File([maliciousContent], 'malicious.md', { type: 'text/markdown' });

            // @ts-ignore
            const files = [file] as unknown as FileList;
            // @ts-ignore
            files.item = (i) => files[i];
            // @ts-ignore
            files.length = 1;

            const result = await ImportService.importFromObsidian(files);

            expect(result.notes).toHaveLength(1);
            expect(result.notes[0].content).not.toContain('<script>');
            expect(result.notes[0].content).toContain('# Title');
        });

        it('should skip files larger than 5MB', async () => {
            const bigContent = 'a'.repeat(5 * 1024 * 1024 + 1); // 5MB + 1 byte
            const file = new File([bigContent], 'large_file.md', { type: 'text/markdown' });

            // @ts-ignore
            const files = [file] as unknown as FileList;
            // @ts-ignore
            files.item = (i) => files[i];
            // @ts-ignore
            files.length = 1;

            const result = await ImportService.importFromObsidian(files);

            expect(result.notes).toHaveLength(0);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]).toContain('File too large');
        });

        it('should allow valid markdown files', async () => {
            const validContent = '# Valid Note\nThis is safe.';
            const file = new File([validContent], 'valid.md', { type: 'text/markdown' });

            // @ts-ignore
            const files = [file] as unknown as FileList;
            // @ts-ignore
            files.length = 1;

            const result = await ImportService.importFromObsidian(files);
            expect(result.notes).toHaveLength(1);
            expect(result.notes[0].content).toBe(validContent);
        });
    });
});
