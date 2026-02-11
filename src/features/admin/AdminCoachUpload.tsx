import React, { useState, useRef, useMemo } from 'react';
import { FileUploadService } from '../../services/admin/FileUploadService';
import { ContentExtractionService, TextChunk, FlaggedImage } from '../../services/admin/ContentExtractionService';

interface AdminCoachUploadProps {
    coachId: string;
}

export const AdminCoachUpload: React.FC<AdminCoachUploadProps> = ({ coachId }) => {
    const fileUploadService = useMemo(() => new FileUploadService(), []);

    const contentExtractionService = useMemo(() => new ContentExtractionService(), []);

    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [chunks, setChunks] = useState<TextChunk[]>([]);
    const [flaggedImages, setFlaggedImages] = useState<FlaggedImage[]>([]);
    const [policyWarnings, setPolicyWarnings] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files;
        if (!selectedFiles || selectedFiles.length === 0) {
            return;
        }

        const incoming = Array.from(selectedFiles);
        setError(null);

        // Validate count
        const countCheck = fileUploadService.validateFileCount(files.length, incoming.length);
        if (!countCheck?.valid) {
            setError(countCheck?.error || 'Max 10 files');
            return;
        }

        // Validate each file
        for (const file of incoming) {
            const check = fileUploadService.validateFile(file);
            if (!check?.valid) {
                setError(check?.error || 'Invalid file');
                return;
            }
        }

        // Set state for immediate feedback
        setFiles(prev => [...prev, ...incoming]);
        setUploading(true);

        try {
            // Process uploads
            const uploadPromises = incoming.map(async (file) => {
                const result = await fileUploadService.uploadFile(file, coachId);

                if (result?.success && result.fileId) {
                    const extraction = await contentExtractionService.extractContent(result.fileId);

                    if (extraction) {
                        if (extraction.chunks) {
                            setChunks(prev => [...prev, ...extraction.chunks]);

                            if (extraction.chunks.length > 0) {
                                const policy = await contentExtractionService.checkPolicy(extraction.chunks[0].text);
                                if (policy?.warnings) {
                                    setPolicyWarnings(prev => [...prev, ...policy.warnings]);
                                }
                            }
                        }
                        if (extraction.images) {
                            setFlaggedImages(prev => [...prev, ...extraction.images]);
                        }
                    }
                } else if (result?.error) {
                    setError(`Upload failed for ${file.name}: ${result.error}`);
                }
            });

            await Promise.all(uploadPromises);
        } catch (err) {
            setError('An unexpected error occurred during processing');
        } finally {
            setUploading(false);
        }
    };

    const handleEditChunk = (chunk: TextChunk) => {
        setChunks(prev => prev.map(c => c.id === chunk.id ? { ...c, text: chunk.text } : c));
    };

    return (
        <div className="admin-coach-upload">
            <h2>Upload Source Material</h2>

            {error && <div className="error-alert" role="alert">{error}</div>}

            <div
                className="file-drop-zone"
                onClick={() => fileInputRef.current?.click()}
                data-testid="file-drop-zone"
            >
                <p>Drag and drop PDFs here or click to browse</p>
                <input
                    type="file"
                    multiple
                    accept=".pdf"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    data-testid="file-input"
                />
            </div>

            <div className="file-list">
                {files.map((f, i) => (
                    <div key={`${f.name}-${i}`} className="file-item" data-testid="file-item">
                        <span>{f.name}</span>
                        {uploading && <span className="upload-spinner" data-testid="upload-spinner">Uploading...</span>}
                    </div>
                ))}
            </div>

            {chunks.length > 0 && (
                <div className="extraction-preview" data-testid="extraction-preview">
                    <h3>Extraction Preview</h3>
                    {policyWarnings.length > 0 && (
                        <div className="policy-warnings">
                            {policyWarnings.map((w, i) => (
                                <div key={i} className="policy-warning-bubble" data-testid="policy-warning">{w}</div>
                            ))}
                        </div>
                    )}
                    <div className="chunk-list">
                        {chunks.map((chunk, idx) => (
                            <div key={`${chunk.id}-${idx}`} className="chunk-item" data-testid="text-chunk">
                                <textarea
                                    value={chunk.text}
                                    onChange={(e) => handleEditChunk({ ...chunk, text: e.target.value })}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {flaggedImages.length > 0 && (
                <div className="flagged-images" data-testid="flagged-images">
                    <h3>Complex Content (Flagged)</h3>
                    <div className="image-grid">
                        {flaggedImages.map((img, idx) => (
                            <div key={`${img.id}-${idx}`} className="image-item flagged">
                                <span>{img.type} - Flagged: {img.reason}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
