export class ChatService {
    static async sendMessage(message: string, context?: { soulMd: string; examples: any[] }): Promise<{ text: string; timestamp: string }> {
        // Simulate AI response for preview
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    text: `This is a preview response from the coach based on your message: "${message}". I am currently using your defined personality.`,
                    timestamp: new Date().toISOString()
                });
            }, 800);
        });
    }
}
