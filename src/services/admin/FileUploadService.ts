/**
 * Service for handling file uploads in the admin dashboard.
 * Validates file constraints (size, type, count) and simulates upload.
 */

export interface FileValidationResult {
    valid: boolean;
    error?: string;
}

export interface UploadResult {
    success: boolean;
    fileId?: string;
    error?: string;
}

export class FileUploadService {
    private static MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    private static ALLOWED_TYPES = ['application/pdf'];
    private static MAX_FILES = 10;

    /**
     * Validates a single file against size and type constraints.
     */
    validateFile(file: File): FileValidationResult {
        if (file.size > FileUploadService.MAX_FILE_SIZE) {
            return { valid: false, error: 'File too large' };
        }
        if (!FileUploadService.ALLOWED_TYPES.includes(file.type)) {
            return { valid: false, error: 'Invalid file type' };
        }
        return { valid: true };
    }

    /**
     * Checks if the total number of files exceeds the limit.
     */
    validateFileCount(existingCount: number, addingCount: number): FileValidationResult {
        if (existingCount + addingCount > FileUploadService.MAX_FILES) {
            return { valid: false, error: 'Max 10 files' };
        }
        return { valid: true };
    }

    /**
     * Simulates a file upload to R2/S3 with server-side safety checks.
     */
    async uploadFile(file: File, coachId: string): Promise<UploadResult> {
        // [SECURITY] Simulated Server-Side Authorization Check
        if (!coachId || coachId === 'invalid-coach') {
            return { success: false, error: 'Unauthorized: Admin does not have access to this coach' };
        }

        // [SECURITY] Simulated Server-Side Re-Validation (Never trust client data)
        const reValidation = this.validateFile(file);
        if (!reValidation.valid) {
            return { success: false, error: `Server-side validation failed: ${reValidation.error}` };
        }

        // In a real implementation, this would use fetch or an SDK with a signed URL
        return {
            success: true,
            fileId: `file-${Math.random().toString(36).substr(2, 9)}`
        };
    }
}
