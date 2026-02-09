/**
 * QuickCaptureWidget Component
 * Story 4.1: Quick Capture
 * Enables quick note capture with AI categorization, voice input, and tag linking
 */

import { useState, useRef, useCallback } from 'react';
import { VoiceToTextService } from '../../services/voice/VoiceToTextService';
import { ParaCategorizationService } from '../../services/memory/ParaCategorizationService';
import { GraphLinkingService, ParsedHashtag, ParsedMention } from '../../services/memory/GraphLinkingService';
import { MemoryService } from '../../services/memory/MemoryService';
import { CapturedNote, LinkedEntityRef, CategorySuggestion } from '../../types/Memory';
import './QuickCaptureWidget.css';

interface QuickCaptureWidgetProps {
    onCapture: (note: Partial<CapturedNote>) => Promise<void> | void;
    onClose?: () => void;
}

export function QuickCaptureWidget({ onCapture, onClose }: QuickCaptureWidgetProps) {
    // Services
    const voiceService = useRef(new VoiceToTextService());
    const categorizationService = useRef(new ParaCategorizationService());
    const graphService = useRef(new GraphLinkingService());
    const memoryService = useRef(new MemoryService());

    // State
    const [content, setContent] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [transcriptionConfidence, setTranscriptionConfidence] = useState<number | null>(null);
    const [categorySuggestion, setCategorySuggestion] = useState<CategorySuggestion | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<CategorySuggestion | null>(null);
    const [showManualSelector, setShowManualSelector] = useState(false);
    const [detectedHashtags, setDetectedHashtags] = useState<ParsedHashtag[]>([]);
    const [detectedMentions, setDetectedMentions] = useState<ParsedMention[]>([]);
    const [hashtagSuggestions, setHashtagSuggestions] = useState<string[]>([]);
    const [mentionSuggestions, setMentionSuggestions] = useState<string[]>([]);
    const [newEntities, setNewEntities] = useState<LinkedEntityRef[]>([]);
    const [voiceNotSupported, setVoiceNotSupported] = useState(false);

    // Debounce timer for AI suggestions
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Handle content change with AI categorization
    const handleContentChange = useCallback(async (newContent: string) => {
        setContent(newContent);

        // Parse tags immediately
        const hashtags = graphService.current.parseHashtags(newContent);
        const mentions = graphService.current.parseMentions(newContent);
        setDetectedHashtags(hashtags);
        setDetectedMentions(mentions);

        // Check for new entities (tags that don't exist yet)
        const paraEntities = await memoryService.current.getParaEntities();
        const existingProjectTags = paraEntities.projects.map(p => p.name.toLowerCase().replace(/\s+/g, '-'));
        const existingPeopleTags = paraEntities.people.map(p => p.name.toLowerCase());

        const newEnts: LinkedEntityRef[] = [];
        hashtags.forEach(h => {
            if (!existingProjectTags.includes(h.tag.toLowerCase())) {
                newEnts.push({ tag: h.tag, type: 'project' });
            }
        });
        mentions.forEach(m => {
            if (!existingPeopleTags.includes(m.name.toLowerCase())) {
                newEnts.push({ name: m.name, type: 'person' });
            }
        });
        setNewEntities(newEnts);

        // Check for autocomplete
        const lastHashtagMatch = newContent.match(/#([\w-]*)$/);
        const lastMentionMatch = newContent.match(/@([\w-]*)$/);

        if (lastHashtagMatch) {
            const suggestions = await graphService.current.getAutocompleteSuggestions(lastHashtagMatch[0], 'hashtag');
            setHashtagSuggestions(suggestions);
            setMentionSuggestions([]);
        } else if (lastMentionMatch) {
            const suggestions = await graphService.current.getAutocompleteSuggestions(lastMentionMatch[0], 'mention');
            setMentionSuggestions(suggestions);
            setHashtagSuggestions([]);
        } else {
            setHashtagSuggestions([]);
            setMentionSuggestions([]);
        }

        // Debounce AI categorization
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        if (newContent.length > 10) {
            debounceTimer.current = setTimeout(async () => {
                const suggestion = await categorizationService.current.suggestCategory(newContent);
                setCategorySuggestion(suggestion);
                if (!selectedCategory) {
                    setSelectedCategory(suggestion);
                }
            }, 300);
        }
    }, [selectedCategory]);

    // Voice recording handlers
    const handleVoiceClick = async () => {
        if (!voiceService.current.isSupported()) {
            setVoiceNotSupported(true);
            return;
        }

        if (isRecording) {
            // Stop recording
            const result = await voiceService.current.stopRecording();
            setIsRecording(false);
            setContent(result.transcription);
            setTranscriptionConfidence(result.confidence);

            // Trigger categorization for transcribed content
            handleContentChange(result.transcription);
        } else {
            // Start recording
            const started = await voiceService.current.startRecording();
            if (started) {
                setIsRecording(true);
                setTranscriptionConfidence(null);
            }
        }
    };

    // Handle suggestion selection
    const handleSelectSuggestion = (suggestion: string, type: 'hashtag' | 'mention') => {
        const pattern = type === 'hashtag' ? /#[\w-]*$/ : /@[\w-]*$/;
        const prefix = type === 'hashtag' ? '#' : '@';
        const newContent = content.replace(pattern, `${prefix}${suggestion} `);
        setContent(newContent);
        setHashtagSuggestions([]);
        setMentionSuggestions([]);
        handleContentChange(newContent);
    };

    // Handle save
    const handleSave = async () => {
        const linkedEntities: LinkedEntityRef[] = [
            ...detectedHashtags.map(h => ({ tag: h.tag, type: h.type })),
            ...detectedMentions.map(m => ({ name: m.name, type: m.type }))
        ];

        await onCapture({
            content,
            linkedEntities,
            newEntities: newEntities.length > 0 ? newEntities : undefined,
            category: selectedCategory || undefined,
            voiceTranscription: transcriptionConfidence !== null,
            transcriptionConfidence: transcriptionConfidence || undefined
        });

        // Clear state
        setContent('');
        setCategorySuggestion(null);
        setSelectedCategory(null);
        setDetectedHashtags([]);
        setDetectedMentions([]);
        setNewEntities([]);

        if (onClose) {
            onClose();
        }
    };

    // Handle alternative category selection
    const handleSelectAlternative = (alt: CategorySuggestion, _altType: string) => {
        setSelectedCategory(alt);
        setShowManualSelector(false);
    };

    // Calculate total linked entities count
    const totalLinkedCount = detectedHashtags.length + detectedMentions.length;

    return (
        <div className="quick-capture-widget" data-testid="quick-capture-widget">
            <div className="quick-capture-widget__header">
                <h3>Quick Capture</h3>
                {onClose && (
                    <button className="close-button" onClick={onClose} aria-label="Close">×</button>
                )}
            </div>

            <div className="quick-capture-widget__input-area">
                <textarea
                    data-testid="quick-capture-input"
                    value={content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    placeholder="Capture your thought... Use #project-name or @person to link"
                    rows={4}
                />

                {/* Tag highlights overlay */}
                <div className="tag-highlights">
                    {detectedHashtags.map(h => (
                        <span
                            key={h.tag}
                            className="tag-highlight hashtag"
                            data-testid={`tag-highlight-${h.tag}`}
                        >
                            #{h.tag}
                        </span>
                    ))}
                    {detectedMentions.map(m => (
                        <span
                            key={m.name}
                            className="tag-highlight mention"
                            data-testid={`tag-highlight-${m.name}`}
                        >
                            @{m.name}
                        </span>
                    ))}
                </div>

                {/* Detected tags display */}
                {detectedHashtags.map(h => (
                    <span key={h.tag} data-testid={`detected-hashtag-${h.tag}`} className="detected-tag" />
                ))}
                {detectedMentions.map(m => (
                    <span key={m.name} data-testid={`detected-mention-${m.name}`} className="detected-tag" />
                ))}

                {/* Autocomplete suggestions */}
                {hashtagSuggestions.length > 0 && (
                    <div className="autocomplete-suggestions" data-testid="hashtag-suggestions">
                        {hashtagSuggestions.map(s => (
                            <button
                                key={s}
                                onClick={() => handleSelectSuggestion(s, 'hashtag')}
                                className="suggestion-item"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}

                {mentionSuggestions.length > 0 && (
                    <div className="autocomplete-suggestions" data-testid="mention-suggestions">
                        {mentionSuggestions.map(s => (
                            <button
                                key={s}
                                onClick={() => handleSelectSuggestion(s, 'mention')}
                                className="suggestion-item"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Voice input */}
            <div className="quick-capture-widget__voice">
                <button
                    data-testid="voice-input-button"
                    className={`voice-button ${isRecording ? 'recording' : ''}`}
                    onClick={handleVoiceClick}
                    aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
                >
                    🎤
                </button>

                {isRecording && (
                    <div
                        data-testid="recording-indicator"
                        className="recording-indicator recording-active"
                    >
                        Recording...
                    </div>
                )}

                {voiceNotSupported && (
                    <div className="voice-error">
                        Voice input is not supported in this browser
                    </div>
                )}

                {transcriptionConfidence !== null && (
                    <div
                        data-testid="transcription-confidence"
                        className="transcription-confidence"
                    >
                        Confidence: {Math.round(transcriptionConfidence * 100)}%
                    </div>
                )}
            </div>

            {/* Category suggestion */}
            {categorySuggestion && (
                <div className="quick-capture-widget__category" data-testid="category-suggestion">
                    <div className="category-main">
                        <span className="category-type">{selectedCategory?.type || categorySuggestion.type}</span>
                        <span className="category-name">{selectedCategory?.name || categorySuggestion.name}</span>
                        <span
                            className="category-confidence"
                            data-testid="suggestion-confidence"
                        >
                            {Math.round((selectedCategory?.confidence || categorySuggestion.confidence) * 100)}%
                        </span>
                    </div>

                    {categorySuggestion.alternatives && categorySuggestion.alternatives.length > 0 && (
                        <div className="category-alternatives" data-testid="alternative-suggestions">
                            {categorySuggestion.alternatives.map((alt, i) => (
                                <button
                                    key={i}
                                    className="alternative-button"
                                    data-testid={`alternative-${alt.type}`}
                                    onClick={() => handleSelectAlternative(alt, alt.type)}
                                >
                                    {alt.type}: {alt.name}
                                </button>
                            ))}
                        </div>
                    )}

                    <button
                        className="override-button"
                        data-testid="override-category-button"
                        onClick={() => setShowManualSelector(true)}
                    >
                        Change category
                    </button>

                    {showManualSelector && (
                        <div className="manual-selector" data-testid="manual-category-selector">
                            <select onChange={(e) => {
                                setSelectedCategory({
                                    type: e.target.value as any,
                                    name: 'Manual Selection',
                                    confidence: 1
                                });
                                setShowManualSelector(false);
                            }}>
                                <option value="project">Project</option>
                                <option value="area">Area</option>
                                <option value="resource">Resource</option>
                            </select>
                        </div>
                    )}
                </div>
            )}

            {/* New entity indicator */}
            {newEntities.length > 0 && (
                <div className="new-entities" data-testid="new-entity-indicator">
                    {newEntities.length} new {newEntities.length === 1 ? 'entity' : 'entities'} will be created
                </div>
            )}

            {/* Linked entities preview */}
            {totalLinkedCount > 0 && (
                <div className="linked-entities-preview" data-testid="linked-entities-preview">
                    {totalLinkedCount} {totalLinkedCount === 1 ? 'entity' : 'entities'} will be linked
                </div>
            )}

            {/* Actions */}
            <div className="quick-capture-widget__actions">
                <button
                    data-testid="save-capture-button"
                    className="save-button"
                    onClick={handleSave}
                    disabled={!content.trim()}
                >
                    Save
                </button>
                {onClose && (
                    <button className="cancel-button" onClick={onClose}>
                        Cancel
                    </button>
                )}
            </div>
        </div>
    );
}
