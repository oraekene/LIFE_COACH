/**
 * OfflineChatService
 * Handles offline inference using ONNX Runtime (mocked for MVP)
 * Story 3.1: Offline Chat
 */

import { Message, ChatResponse } from '../../types/Chat';

export interface GenerateOptions {
    coachId: string;
    message: string;
    context: Message[];
}

export class OfflineChatService {
    private loadedModels: Set<string> = new Set();
    private downloadedCoaches: Set<string> = new Set(['coach-1']); // Mock: default coach downloaded

    /**
     * Check if coach model is downloaded and available offline
     */
    async isCoachDownloaded(coachId: string): Promise<boolean> {
        return this.downloadedCoaches.has(coachId);
    }

    /**
     * Load ONNX model for a coach
     */
    async loadModel(coachId: string): Promise<void> {
        if (!this.downloadedCoaches.has(coachId)) {
            throw new Error(`Coach ${coachId} is not downloaded`);
        }

        // Simulate model loading delay
        await new Promise(resolve => setTimeout(resolve, 500));
        this.loadedModels.add(coachId);
    }

    /**
     * Check if model is loaded into memory
     */
    isModelLoaded(coachId: string): boolean {
        return this.loadedModels.has(coachId);
    }

    /**
     * Generate response using offline model
     * AC2: Response time <3 seconds
     */
    async generateResponse(options: GenerateOptions): Promise<ChatResponse> {
        const startTime = performance.now();

        // Security: Parse context to ensure data isolation
        // In a real implementation, this would structure the system prompt to treat 'para_context' strictly as data
        const systemPrompt = "You are a helpful Life Coach.";
        let additionalContext = "";

        // Mocking the prompt construction to demonstrate separation
        if (options.context) {
            options.context.forEach((msg: any) => {
                if (msg.type === 'para_context') {
                    // This is where we ensure the LLM treats this array as a JSON data block, not instructions
                    additionalContext += `\n<ContextData>\n${JSON.stringify(msg.data)}\n</ContextData>\n`;
                }
            });
        }

        // Simulate inference time (500-1500ms)
        const inferenceTime = 500 + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, inferenceTime));

        const endTime = performance.now();
        const latencyKeys = endTime - startTime;

        // If context was provided, mock a response that references it
        let content = `I am your offline coach. I received: "${options.message}". (Generated in ${Math.round(latencyKeys)}ms)`;

        if (additionalContext) {
            content += " (Context aware)";
        }

        return {
            id: `msg-${Date.now()}`,
            role: 'assistant',
            content: content,
            timestamp: new Date().toISOString(),
            latencyMs: latencyKeys,
            tokens: 50,
            runtime: 'onnx',
        };
    }

    /**
     * Get runtime type (onnx/cloud)
     */
    getRuntime(): string {
        return 'onnx';
    }
}
