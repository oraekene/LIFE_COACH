export class NotificationService {
    private static instance: NotificationService;

    private constructor() { }

    static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    private hasRequestedPermission = false;

    async requestPermission(): Promise<NotificationPermission> {
        if (!('Notification' in window)) {
            console.warn('This browser does not support desktop notification');
            return 'denied';
        }
        this.hasRequestedPermission = true;
        return await Notification.requestPermission();
    }

    async sendNotification(title: string, body: string): Promise<boolean> {
        if (!('Notification' in window)) {
            return false;
        }

        if (Notification.permission === 'granted') {
            new Notification(title, { body });
            return true;
        } else if (Notification.permission !== 'denied' && !this.hasRequestedPermission) {
            const permission = await this.requestPermission();
            if (permission === 'granted') {
                new Notification(title, { body });
                return true;
            }
        }
        return false;
    }
}
