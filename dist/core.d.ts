export declare interface EventData {
    [key: string]: string | number | boolean;
}

export declare class Renumerate {
    private config;
    constructor(config: RenumerateConfig);
    /**
     * Register an event with a name and optional data
     * @param eventName Name of the event to register
     * @param data Key-value pairs of event data
     */
    registerEvent(eventName: string, data?: EventData): void;
    /**
     * Mount a cancel button for a subscriber
     * @param sessionId Mandatory customer session identifier
     */
    mountCancelButton(elementId: string, sessionId: string, classes?: string): void;
    /**
     * Show retention view for a customer
     * @param sessionId Mandatory customer session identifier
     */
    showRetentionView(sessionId: string): HTMLDialogElement;
    /**
     * Mount the SubscriptionHub for a customer
     * @param sessionId
     * @returns
     */
    mountSubscriptionHub(elementId: string, sessionId: string, classes?: string): HTMLElement;
    /**
     * Private: Check if the sessionId is of a specific type
     * @param sessionId The session ID to check
     * @param type The type to check against ("retention" or "subscription")
     * @returns True if the sessionId matches the type, false otherwise
     */
    private isSessionType;
    /**
     * Private: Inject the stylesheet into the document head
     */
    private injectStylesheet;
    /**
     * Private: Add a listener for messages from the iframe
     */
    private addListener;
}

export declare interface RenumerateConfig {
    publicKey: string;
    debug?: boolean;
}

export { }
