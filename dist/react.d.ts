import { default as default_2 } from 'react';
import { JSX as JSX_2 } from 'react/jsx-runtime';

declare interface CallbackOptions {
    onComplete?: () => void;
    onRetained?: () => void;
    onCancelled?: () => void;
}

/**
 * Cancel Button Component
 *
 * Renders a button that opens the retention view when clicked.
 * Button is disabled while session is loading.
 */
export declare function CancelButton({ subscriptionId, callbacks, className, children, }: UseRenumerateParams & {
    className?: string;
    children?: default_2.ReactNode;
}): JSX_2.Element;

declare interface MountCancelButtonOptions {
    classes?: string;
    subscriptionId?: string;
    onComplete?: () => void;
    onRetained?: () => void;
    onCancelled?: () => void;
}

declare class Renumerate {
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

declare interface RenumerateConfig {
    publicKey: string;
    debug?: boolean;
    callbacks?: CallbackOptions;
    fallbackEmail?: string;
    getAuthToken: () => Promise<string>;
}

declare interface RenumerateContextValue {
    instance: Renumerate;
    session: SdkSession_2 | null;
    isSessionLoading: boolean;
    sessionError: Error | null;
    refreshSession: () => Promise<void>;
}

/**
 * Renumerate Provider Component
 *
 * Automatically initializes a session on mount using the configured getAuthToken callback.
 */
export declare function RenumerateProvider({ config, children, }: {
    config: RenumerateConfig;
    children: default_2.ReactNode;
}): JSX_2.Element;

/**
 * SDK Session management for unified authentication.
 *
 * Handles auth token exchange and session storage.
 * Session IDs are prefixed with 'r10_' and stored in sessionStorage.
 */
declare interface SdkSession {
    sessionId: string;
    expiresAt: number;
}

/**
 * SDK Session management for unified authentication.
 *
 * Handles auth token exchange and session storage.
 * Session IDs are prefixed with 'r10_' and stored in sessionStorage.
 */
declare interface SdkSession_2 {
    sessionId: string;
    expiresAt: number;
}

/**
 * SubscriptionHub Component
 *
 * Renders the subscription management hub in an iframe.
 * Shows loading state while session is being fetched.
 */
export declare function SubscriptionHub({ callbacks, wrapperClassName, iframeClassName, loadingComponent, errorComponent, }: {
    callbacks?: CallbackOptions;
    wrapperClassName?: string;
    iframeClassName?: string;
    loadingComponent?: default_2.ReactNode;
    errorComponent?: default_2.ReactNode;
}): JSX_2.Element;

/**
 * Hook to use Renumerate retention view in React components
 */
export declare function useRenumerate({ subscriptionId, callbacks, }?: UseRenumerateParams): UseRenumerateReturn;

/**
 * Hook to access the Renumerate context
 */
export declare function useRenumerateContext(): RenumerateContextValue;

declare interface UseRenumerateParams {
    subscriptionId?: string;
    callbacks?: CallbackOptions;
}

declare interface UseRenumerateReturn {
    open: () => void;
    isReady: boolean;
}

export { }
