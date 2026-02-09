/**
 * VoiceToTextService
 * Story 4.1: Quick Capture (AC3)
 * Handles voice recording and speech-to-text transcription
 * using Web Speech API
 */

export interface TranscriptionResult {
    transcription: string;
    confidence: number;
}

export class VoiceToTextService {
    private recognition: any = null;
    private _isRecording: boolean = false;
    private transcriptionResolve: ((result: TranscriptionResult) => void) | null = null;
    private transcriptionBuffer: string = '';
    private confidenceSum: number = 0;
    private resultCount: number = 0;

    constructor() {
        if (this.isSupported()) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';

            this.recognition.onresult = (event: any) => {
                let interim = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const result = event.results[i];
                    if (result.isFinal) {
                        this.transcriptionBuffer += result[0].transcript + ' ';
                        this.confidenceSum += result[0].confidence;
                        this.resultCount++;
                    } else {
                        interim += result[0].transcript;
                    }
                }
            };

            this.recognition.onend = () => {
                if (this._isRecording && this.transcriptionResolve) {
                    const avgConfidence = this.resultCount > 0 ? this.confidenceSum / this.resultCount : 0;
                    this.transcriptionResolve({
                        transcription: this.transcriptionBuffer.trim(),
                        confidence: avgConfidence
                    });
                    this.transcriptionResolve = null;
                }
                this._isRecording = false;
            };

            this.recognition.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                this._isRecording = false;
            };
        }
    }

    isSupported(): boolean {
        return !!(
            typeof window !== 'undefined' &&
            ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
        );
    }

    async startRecording(): Promise<boolean> {
        if (!this.isSupported() || !this.recognition) {
            return false;
        }

        this.transcriptionBuffer = '';
        this.confidenceSum = 0;
        this.resultCount = 0;
        this._isRecording = true;

        try {
            this.recognition.start();
            return true;
        } catch (error) {
            console.error('Failed to start recording:', error);
            this._isRecording = false;
            return false;
        }
    }

    async stopRecording(): Promise<TranscriptionResult> {
        return new Promise((resolve) => {
            if (!this._isRecording || !this.recognition) {
                resolve({ transcription: '', confidence: 0 });
                return;
            }

            this.transcriptionResolve = resolve;
            this.recognition.stop();
        });
    }

    isRecording(): boolean {
        return this._isRecording;
    }
}
