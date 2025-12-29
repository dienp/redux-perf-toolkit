type Listener = (event: any) => void;

class EventBus {
    private listeners: Record<string, Listener[]> = {};

    emit(event: string, data: any) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(fn => fn(data));
        }
    }

    on(event: string, fn: Listener) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(fn);

        // Return unsubscribe function
        return () => {
            this.listeners[event] = this.listeners[event].filter(l => l !== fn);
        };
    }
}

export const perfEventBus = new EventBus();
