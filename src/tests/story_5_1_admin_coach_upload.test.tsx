/**
 * Story 5.1: Upload Source Material
 * Test-Driven Development - Tests written BEFORE implementation
 *
 * User Story: As an admin, I want to upload my book PDFs.
 *
 * Acceptance Criteria:
 * AC1: Drag-drop interface for up to 50MB PDFs (max 10 files per coach)
 * AC2: Extraction preview shows text sample before processing
 * AC3: Chunk visualization with edit capability
 * AC4: Charts/diagrams flagged for Gemini Flash 3 processing
 * AC5: Content policy check for PII/copyright warnings
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import { AdminCoachUpload } from '../features/admin/AdminCoachUpload';

// Mock services
vi.mock('../services/admin/FileUploadService', () => {
    class MockFileUploadService {
        uploadFile = vi.fn().mockImplementation(async (file: File, coachId: string) => {
            // Mirror the hardened logic in the mock
            if (!coachId || coachId === 'invalid-coach') {
                return { success: false, error: 'Unauthorized: Admin does not have access to this coach' };
            }
            if (file.size > 50 * 1024 * 1024) {
                return { success: false, error: 'Server-side validation failed: File too large' };
            }
            return { success: true, fileId: 'file-123' };
        });
        validateFile = vi.fn((file: File) => {
            if (file.size > 50 * 1024 * 1024) return { valid: false, error: 'File too large' };
            if (file.type !== 'application/pdf') return { valid: false, error: 'Invalid file type' };
            return { valid: true };
        });
        validateFileCount = vi.fn((existing: number, adding: number) => {
            if (existing + adding > 10) return { valid: false, error: 'Max 10 files' };
            return { valid: true };
        });
    }
    return { FileUploadService: MockFileUploadService };
});

vi.mock('../services/admin/ContentExtractionService', () => {
    class MockContentExtractionService {
        extractContent = vi.fn().mockResolvedValue({
            chunks: [
                { id: 'c1', text: 'Sample text from PDF', editable: true },
                { id: 'c2', text: 'Another chunk with SSN 000-00-0000', editable: true }
            ],
            images: [
                { id: 'img1', type: 'chart', flagged: true, reason: 'Requires Gemini Flash 3' }
            ],
            warnings: []
        });
        checkPolicy = vi.fn().mockImplementation(async (content: string) => {
            const warnings: string[] = [];
            if (/\d{3}-\d{2}-\d{4}/.test(content)) {
                warnings.push('PII Detected: Social Security Number pattern matching');
            }
            return {
                safe: warnings.length === 0,
                warnings
            };
        });
    }
    return { ContentExtractionService: MockContentExtractionService };
});

describe('Story 5.1: Admin Coach Upload', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    // =========================================================================
    // AC1: Drag-drop interface for up to 50MB PDFs (max 10 files per coach)
    // =========================================================================
    describe('AC1: Drag-drop Interface & Constraints', () => {
        it('should render drag-drop zone', () => {
            render(<AdminCoachUpload coachId="coach-new" />);
            expect(screen.getByTestId('file-drop-zone')).toBeInTheDocument();
        });

        it('should accept typical PDF file', async () => {
            render(<AdminCoachUpload coachId="coach-new" />);

            const file = new File(['dummy'], 'book.pdf', { type: 'application/pdf' });
            const input = screen.getByTestId('file-input');

            fireEvent.change(input, { target: { files: [file] } });

            // Wait for filename to appear in the list
            await waitFor(() => {
                expect(screen.getByText('book.pdf')).toBeInTheDocument();
            }, { timeout: 15000 });
        });

        it('should reject file larger than 50MB', async () => {
            render(<AdminCoachUpload coachId="coach-new" />);

            const largeFile = new File([''], 'large.pdf', { type: 'application/pdf' });
            Object.defineProperty(largeFile, 'size', { value: 51 * 1024 * 1024 });

            const input = screen.getByTestId('file-input');
            fireEvent.change(input, { target: { files: [largeFile] } });

            await waitFor(() => {
                expect(screen.getByText(/File too large/i)).toBeInTheDocument();
            });
        });

        it('should enforce max 10 files limit', async () => {
            render(<AdminCoachUpload coachId="coach-new" />);

            const files = Array.from({ length: 11 }, (_, i) => new File([''], `doc${i}.pdf`, { type: 'application/pdf' }));
            const input = screen.getByTestId('file-input');

            fireEvent.change(input, { target: { files } });

            await waitFor(() => {
                expect(screen.getByText(/Max 10 files/i)).toBeInTheDocument();
            });
        });
    });

    // =========================================================================
    // AC2: Extraction preview shows text sample before processing
    // =========================================================================
    describe('AC2: Extraction Preview', () => {
        it('should show preview text after upload', async () => {
            render(<AdminCoachUpload coachId="coach-new" />);

            const file = new File(['dummy'], 'book.pdf', { type: 'application/pdf' });
            const input = screen.getByTestId('file-input');

            fireEvent.change(input, { target: { files: [file] } });

            await waitFor(() => {
                expect(screen.getByTestId('extraction-preview')).toBeInTheDocument();
                expect(screen.getByText('Sample text from PDF')).toBeInTheDocument();
            }, { timeout: 20000 });
        }, 30000);
    });

    // =========================================================================
    // AC2/AC3: Batch Extraction & Editing
    // =========================================================================
    describe('AC2/AC3: Batch Extraction', () => {
        it('should process all files in a batch', async () => {
            render(<AdminCoachUpload coachId="coach-new" />);

            const file1 = new File(['dummy1'], 'book1.pdf', { type: 'application/pdf' });
            const file2 = new File(['dummy2'], 'book2.pdf', { type: 'application/pdf' });

            const input = screen.getByTestId('file-input');
            fireEvent.change(input, { target: { files: [file1, file2] } });

            await waitFor(() => {
                // Check for filenames in the list
                expect(screen.getByText('book1.pdf')).toBeInTheDocument();
                expect(screen.getByText('book2.pdf')).toBeInTheDocument();

                // Check if chunks from both files are rendered (parallel processing)
                const chunks = screen.getAllByTestId('text-chunk');
                expect(chunks.length).toBeGreaterThanOrEqual(4);
            }, { timeout: 20000 });
        }, 30000);
    });

    // =========================================================================
    // AC5: Content policy check for PII/copyright warnings
    // =========================================================================
    describe('AC5: Content Policy Checks', () => {
        it('should display regex-based PII warning for SSN', async () => {
            render(<AdminCoachUpload coachId="coach-new" />);

            const input = screen.getByTestId('file-input');
            fireEvent.change(input, { target: { files: [new File([''], 'test.pdf', { type: 'application/pdf' })] } });

            await waitFor(() => {
                // The mock returns "Another chunk with SSN 000-00-0000" which triggers the warning
                expect(screen.getByText(/PII Detected: Social Security Number pattern matching/i)).toBeInTheDocument();
            }, { timeout: 15000 });
        }, 30000);

        it('should fail if unauthorized coachId is used', async () => {
            render(<AdminCoachUpload coachId="invalid-coach" />);

            const input = screen.getByTestId('file-input');
            fireEvent.change(input, { target: { files: [new File([''], 'test.pdf', { type: 'application/pdf' })] } });

            await waitFor(() => {
                expect(screen.getByText(/Unauthorized/i)).toBeInTheDocument();
            }, { timeout: 15000 });
        }, 30000);
    });
});
