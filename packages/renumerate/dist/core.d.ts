export declare interface EventData {
    [key: string]: string | number | boolean;
}

export declare class Renumerate {
    private config;
    private retentionDialog;
    private retentionIframe;
    private subscriptionIframe;
    private styleSheet;
    private windowListener;
    constructor(config: RenumerateConfig);
    /**
     * Get or create a Renumerate instance
     * @param config Configuration for the Renumerate instance
     * @returns Renumerate instance
     */
    static getInstance(config: RenumerateConfig): Renumerate;
    /**
     * Update the configuration of the Renumerate instance
     */
    updateConfig(config: RenumerateConfig): void;
    /**
     * Mount a cancel button for a subscriber
     * @param sessionId Mandatory customer session identifier
     */
    mountCancelButton(elementId: string, sessionId: string, classes?: string): void;
    /**
     * Show retention view for a customer
     * @param sessionId Mandatory customer session identifier
     */
    showRetentionView(sessionId: string): HTMLDialogElement | null;
    /**
     * Mount the SubscriptionHub for a customer
     * @param sessionId
     * @returns
     */
    mountSubscriptionHub(elementId: string, sessionId: string, wrapperClasses?: string, iframeClasses?: string): HTMLElement;
    /**
     * Get subscription hub url
     */
    getSubscriptionHubUrl(sessionId: string): string;
    /**
     * Set up the Renumerate instance
     */
    initialize(): void;
    /**
     * Unmount renumerate components and clean up resources
     */
    cleanup(): void;
    /**
     * Private: Check if the sessionId is of a specific type
     * @param sessionId The session ID to check
     * @param type The type to check against ("retention" or "subscription")
     * @returns True if the sessionId matches the type, false otherwise
     */
    private isSessionType;
    private getIsLocal;
    /**
     * Private: Inject the stylesheet into the document head
     */
    private injectStylesheet;
    /**
     * Private: Add a listener for messages from the iframe
     */
    private addListener;
    /**
     * Private: Get the target URL
     * @param type The type of session ("retention" or "subscription")
     */
    private buildUrl;
}

export declare interface RenumerateConfig {
    publicKey: string;
    debug?: boolean;
}

export { }
