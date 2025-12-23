export declare interface CallbackOptions {
    onComplete?: () => void;
    onRetained?: () => void;
    onCancelled?: () => void;
}

declare interface MountCancelButtonOptions {
    classes?: string;
    subscriptionId?: string;
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
    private sessionManager;
    constructor(config: RenumerateConfig);
    /**
     * Set active callbacks for event handling
     */
    setCallbacks(callbacks?: CallbackOptions): void;
    /**
     * Force refresh the session (perform token exchange)
     */
    refreshSession(): Promise<SdkSession>;
    /**
     * Get or create a Renumerate instance
     */
    static getInstance(config: RenumerateConfig): Renumerate;
    /**
     * Update the configuration of the Renumerate instance
     */
    updateConfig(config: Partial<RenumerateConfig>): void;
    /**
     * Get current SDK session (establishes session if needed)
     */
    getSession(): Promise<SdkSession>;
    /**
     * Get current session without fetching (returns null if not established)
     */
    getCurrentSession(): SdkSession | null;
    /**
     * Clear the current session
     */
    clearSession(): void;
    /**
     * Mount a cancel button that opens retention view when clicked
     */
    mountCancelButton(elementId: string, options?: MountCancelButtonOptions | string): void;
    /**
     * Show retention view (cancellation flow)
     * @param subscriptionId Optional - if undefined, uses first active subscription
     * @param callbacks Optional callbacks for retention events
     */
    showRetentionView(subscriptionId?: string, callbacks?: CallbackOptions): Promise<void>;
    /**
     * Mount the SubscriptionHub
     */
    mountSubscriptionHub(elementId: string, wrapperClasses?: string, iframeClasses?: string, callbacks?: CallbackOptions): Promise<HTMLElement>;
    /**
     * Get subscription hub URL
     */
    getSubscriptionHubUrl(): Promise<string>;
    /**
     * Set up the Renumerate instance
     */
    initialize(): void;
    /**
     * Unmount renumerate components and clean up resources
     */
    cleanup(): void;
    /**
     * Private: Open retention dialog with session ID
     */
    private openRetentionDialog;
    /**
     * Private: Show error content when retention iframe fails to load
     */
    private showRetentionError;
    /**
     * Private: Show error content when subscription hub iframe fails to load
     */
    private showSubscriptionHubError;
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
     */
    private buildUrl;
}

export declare interface RenumerateConfig {
    debug?: boolean;
    callbacks?: CallbackOptions;
    fallbackEmail?: string;
    getAuthToken: () => Promise<string>;
}

/**
 * SDK Session management for unified authentication.
 *
 * Handles auth token exchange and session storage.
 * Session IDs are prefixed with 'r10_' and stored in sessionStorage.
 */
export declare interface SdkSession {
    sessionId: string;
    expiresAt: number;
}

export { }
