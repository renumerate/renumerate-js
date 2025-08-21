export declare interface CallbackOptions {
    onComplete?: () => void;
    onRetained?: () => void;
    onCancelled?: () => void;
}

export declare interface EventData {
    [key: string]: string | number | boolean;
}

declare interface MountCancelButtonOptions {
    classes?: string;
    onComplete?: () => void;
    onRetained?: () => void;
    onCancelled?: () => void;
}

export declare class Renumerate {
    private config;
    private retentionDialog;
    private retentionIframe;
    private subscriptionIframe;
    private styleSheet;
    private windowListener;
    private activeCallbacks;
    constructor(config: RenumerateConfig);
    setCallbacks(callbacks?: CallbackOptions): void;
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
     * @param elementId Element ID to mount the button
     * @param sessionId Mandatory customer session identifier
     * @param options Options object or classes string
     */
    mountCancelButton(elementId: string, sessionId: string, options?: MountCancelButtonOptions | string): void;
    /**
     * Show retention view for a customer
     * @param sessionId Mandatory customer session identifier
     */
    showRetentionView(sessionId: string, callbacks?: CallbackOptions): HTMLDialogElement;
    /**
     * Mount the SubscriptionHub for a customer
     * @param elementId
     * @param sessionId
     * @param wrapperClasses
     * @param iframeClasses
     * @param callbacks Optional callbacks for subscription events
     * @returns
     */
    mountSubscriptionHub(elementId: string, sessionId: string, wrapperClasses?: string, iframeClasses?: string, callbacks?: {
        onComplete?: () => void;
        onRetained?: () => void;
        onCancelled?: () => void;
    }): HTMLElement;
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
    callbacks?: CallbackOptions;
}

export { }
