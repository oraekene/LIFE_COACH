import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ProactiveCheckinService } from '../services/coach/ProactiveCheckinService'; // Does not exist yet
import { NotificationService } from '../services/notification/NotificationService'; // Does not exist yet
import { MemoryService } from '../services/memory/MemoryService';

// Mock dependencies
vi.mock('../services/notification/NotificationService', () => ({
    NotificationService: {
        getInstance: vi.fn().mockReturnValue({
            sendNotification: vi.fn().mockResolvedValue(true),
            requestPermission: vi.fn().mockResolvedValue('granted')
        })
    }
}));

vi.mock('../services/memory/MemoryService', () => {
    return {
        MemoryService: vi.fn().mockImplementation(() => {
            return {
                getParaEntities: vi.fn().mockResolvedValue({
                    projects: [
                        { id: 'p1', name: 'Launch App', deadline: '2026-03-01', lastAccessed: new Date().toISOString(), status: 'active' },
                        { id: 'p2', name: 'Learn Spanish', deadline: null, lastAccessed: '2025-01-01', status: 'active' } // Cold
                    ],
                    people: []
                })
            };
        })
    };
});

// Mock timer for testing intervals/scheduling
vi.useFakeTimers();

describe('Story 3.3: Proactive Check-ins', () => {
    let checkinService: ProactiveCheckinService;
    let notificationService: any;

    beforeEach(() => {
        vi.clearAllMocks();
        // Setup services
        checkinService = ProactiveCheckinService.getInstance();
        notificationService = NotificationService.getInstance();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should schedule check-ins based on frequency settings', async () => {
        const coachId = 'coach-1';
        const preferences = { frequency: 'daily', preferredTime: '09:00' };

        // 1. Schedule the check-in
        checkinService.scheduleCheckIn(coachId, preferences);

        // 2. Verify it's tracked
        const scheduled = checkinService.getScheduledCheckIns();
        expect(scheduled).toHaveLength(1);
        expect(scheduled[0]).toEqual(expect.objectContaining({
            coachId,
            frequency: 'daily'
        }));
    });

    it('should trigger a notification when check-in is due', async () => {
        const coachId = 'coach-1';
        checkinService.scheduleCheckIn(coachId, { frequency: 'daily' });

        // Fast-forward time to trigger point (abstracted for test simplicity)
        // In reality, implementation might use setInterval or cron. 
        // For this test, we might manually trigger or advance timers.

        // Simulating the trigger directly for unit testing the logic
        await checkinService.triggerCheckIn(coachId);

        expect(notificationService.sendNotification).toHaveBeenCalledWith(
            expect.stringContaining('Check-in'),
            expect.any(String)
        );
    });

    it('should include context from active PARA projects in the check-in', async () => {
        const coachId = 'coach-1';

        // Trigger check-in
        await checkinService.triggerCheckIn(coachId);

        // The notification body or the generated prompt should reference the active project
        // PRIVACY FIX: Verify we are NOT leaking the name but sending a generic prompt
        expect(notificationService.sendNotification).toHaveBeenCalledWith(
            expect.any(String),
            expect.stringMatching(/active project/i) // Checked for generic text
        );

        // Should NOT mention the specific project name "Launch App"
        expect(notificationService.sendNotification).not.toHaveBeenCalledWith(
            expect.any(String),
            expect.stringMatching(/Launch App/i)
        );
    });

    it('should respect "smart timing" by not notifying during quiet hours', async () => {
        const coachId = 'coach-1';
        // Mock current time to be 3 AM (quiet hour)
        vi.setSystemTime(new Date('2026-02-09T03:00:00'));

        await checkinService.triggerCheckIn(coachId);

        // Should NOT send notification if strictly following smart timing logic in trigger
        expect(notificationService.sendNotification).not.toHaveBeenCalled();
    });
});
