import { MemoryService } from '../memory/MemoryService';
import { NotificationService } from '../../services/notification/NotificationService';

export interface CheckInPreferences {
    frequency: 'daily' | 'weekly' | 'bi-weekly';
    preferredTime?: string; // HH:MM format (24h)
}

export interface ScheduledCheckIn extends CheckInPreferences {
    coachId: string;
    lastCheckIn?: string; // ISO String
}

export class ProactiveCheckinService {
    private static instance: ProactiveCheckinService;
    private scheduledCheckIns: Map<string, ScheduledCheckIn> = new Map();
    private memoryService: MemoryService;
    private notificationService: NotificationService;

    private constructor() {
        this.memoryService = new MemoryService(); // In real app, might be injected
        this.notificationService = NotificationService.getInstance();
    }

    static getInstance(): ProactiveCheckinService {
        if (!ProactiveCheckinService.instance) {
            ProactiveCheckinService.instance = new ProactiveCheckinService();
        }
        return ProactiveCheckinService.instance;
    }

    scheduleCheckIn(coachId: string, preferences: CheckInPreferences): void {
        if (!/^[a-zA-Z0-9-_]+$/.test(coachId)) {
            console.error(`Invalid coachId: ${coachId}`);
            return;
        }
        this.scheduledCheckIns.set(coachId, {
            coachId,
            ...preferences
        });
    }

    getScheduledCheckIns(): ScheduledCheckIn[] {
        return Array.from(this.scheduledCheckIns.values());
    }

    async triggerCheckIn(coachId: string): Promise<void> {
        const schedule = this.scheduledCheckIns.get(coachId);
        if (!schedule) return;

        // Smart Timing Check: Don't notify during quiet hours (e.g., 10 PM - 7 AM)
        if (this.isQuietHours()) {
            console.log(`Skipping check-in for coach ${coachId} due to quiet hours.`);
            return;
        }

        // Get context from Memory Service (active projects)
        const paraContext = await this.memoryService.getParaEntities();

        // Find active projects (hot) or upcoming deadlines
        // For MVP simplicity, just pick the first active project or generic message
        const activeProject = paraContext.projects.find(p => p.status === 'active' && this.isRecent(p.lastAccessed));

        let body = "Time for your daily reflection.";
        if (activeProject) {
            // PRIVACY FIX: Genericize notification content to avoid leaking project names
            body = "You have an active project that needs attention. How is your progress?";
        }

        await this.notificationService.sendNotification(
            "Coach Check-in",
            body
        );

        // Update last check-in time
        this.scheduledCheckIns.set(coachId, {
            ...schedule,
            lastCheckIn: new Date().toISOString()
        });
    }

    private isQuietHours(): boolean {
        const now = new Date();
        const hour = now.getHours();
        // Quiet hours: 10 PM (22) to 7 AM (7)
        return hour >= 22 || hour < 7;
    }

    private isRecent(dateString?: string): boolean {
        if (!dateString) return false;
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7; // "Hot" memory definition from PRD
    }
}
