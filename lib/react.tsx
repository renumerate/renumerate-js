import React, { useEffect, useState, useCallback } from "react";
import {
	type CallbackOptions,
	Renumerate,
	type RenumerateConfig,
} from "./core";
import type { SdkSession } from "./session";

interface RenumerateContextValue {
	instance: Renumerate;
	session: SdkSession | null;
	isSessionLoading: boolean;
	sessionError: Error | null;
	refreshSession: () => Promise<void>;
}

interface UseRenumerateParams {
	subscriptionId?: string;
	callbacks?: CallbackOptions;
}

interface UseRenumerateReturn {
	open: () => void;
	isReady: boolean;
}

// Create a context for Renumerate
const RenumerateContext = React.createContext<RenumerateContextValue | null>(
	null,
);

/**
 * Renumerate Provider Component
 *
 * Automatically initializes a session on mount using the configured getAuthToken callback.
 */
export function RenumerateProvider({
	config,
	children,
}: {
	config: RenumerateConfig;
	children: React.ReactNode;
}) {
	// Wrap in useState for highest semantic guarantee of a single instance
	// This ensures that the Renumerate instance is created only once!
	const [renumerate] = useState(() => Renumerate.getInstance(config));

	// Session state
	const [session, setSession] = useState<SdkSession | null>(null);
	const [isSessionLoading, setIsSessionLoading] = useState(true);
	const [sessionError, setSessionError] = useState<Error | null>(null);

	useEffect(() => {
		renumerate.updateConfig(config);
	}, [config, renumerate]);

	// Initialize the Renumerate instance when the component mounts
	// and clean up when it unmounts
	useEffect(() => {
		renumerate.cleanup(); // Cleanup previous instance if any
		renumerate.initialize(); // Re-initialize the Renumerate instance

		return () => {
			// Cleanup on unmount
			renumerate.cleanup();
		};
	}, [renumerate]);

	// Fetch session on mount
	const fetchSession = useCallback(async () => {
		console.info("RenumerateProvider: Fetching session...");
		setIsSessionLoading(true);
		setSessionError(null);
		try {
			const sess = await renumerate.getSession();
			console.info("RenumerateProvider: Session fetched:", sess);
			setSession(sess);
		} catch (err) {
			console.error("RenumerateProvider: Session fetch failed:", err);
			setSessionError(err instanceof Error ? err : new Error(String(err)));
			setSession(null);
		} finally {
			setIsSessionLoading(false);
		}
	}, [renumerate]);

	useEffect(() => {
		fetchSession();
	}, [fetchSession]);

	const refreshSession = useCallback(async () => {
		setIsSessionLoading(true);
		setSessionError(null);
		try {
			const sess = await renumerate.refreshSession();
			setSession(sess);
		} catch (err) {
			setSessionError(err instanceof Error ? err : new Error(String(err)));
			setSession(null);
		} finally {
			setIsSessionLoading(false);
		}
	}, [renumerate]);

	return (
		<RenumerateContext.Provider
			value={{
				instance: renumerate,
				session,
				isSessionLoading,
				sessionError,
				refreshSession,
			}}
		>
			{children}
		</RenumerateContext.Provider>
	);
}

/**
 * Hook to access the Renumerate context
 */
export function useRenumerateContext(): RenumerateContextValue {
	const context = React.useContext(RenumerateContext);
	if (!context) {
		throw new Error(
			"useRenumerateContext must be used within a RenumerateProvider",
		);
	}
	return context;
}

/**
 * Hook to use Renumerate retention view in React components
 */
export function useRenumerate({
	subscriptionId,
	callbacks,
}: UseRenumerateParams = {}): UseRenumerateReturn {
	const context = React.useContext(RenumerateContext);
	if (!context) {
		throw new Error("useRenumerate must be used within a RenumerateProvider");
	}

	const { instance, session, isSessionLoading } = context;

	const cachedOpen = useCallback(() => {
		instance.showRetentionView(subscriptionId, callbacks);
	}, [subscriptionId, callbacks, instance]);

	return {
		open: cachedOpen,
		isReady: !isSessionLoading && session !== null,
	};
}

/**
 * Cancel Button Component
 *
 * Renders a button that opens the retention view when clicked.
 * Button is disabled while session is loading.
 */
export function CancelButton({
	subscriptionId,
	callbacks,
	className,
	children,
}: UseRenumerateParams & {
	className?: string;
	children?: React.ReactNode;
}) {
	const context = React.useContext(RenumerateContext);

	if (!context) {
		throw new Error("CancelButton must be used within a RenumerateProvider");
	}

	const { instance, isSessionLoading, session } = context;

	const handleClick = () => {
		instance.showRetentionView(subscriptionId, callbacks);
	};

	const isDisabled = isSessionLoading || session === null;

	return (
		<button
			type="button"
			className={className || "renumerate-cancel-btn"}
			onClick={handleClick}
			disabled={isDisabled}
		>
			{children || "Cancel Subscription"}
		</button>
	);
}

/**
 * SubscriptionHub Component
 *
 * Renders the subscription management hub in an iframe.
 * Shows loading state while session is being fetched.
 */
export function SubscriptionHub({
	callbacks,
	wrapperClassName,
	iframeClassName,
	loadingComponent,
	errorComponent,
}: {
	callbacks?: CallbackOptions;
	wrapperClassName?: string;
	iframeClassName?: string;
	loadingComponent?: React.ReactNode;
	errorComponent?: React.ReactNode;
}) {
	const context = React.useContext(RenumerateContext);

	if (!context) {
		throw new Error("SubscriptionHub must be used within a RenumerateProvider");
	}

	const { instance, session, isSessionLoading, sessionError } = context;
	const [hubUrl, setHubUrl] = useState<string | null>(null);

	useEffect(() => {
		instance.setCallbacks(callbacks);

		return () => {
			instance.setCallbacks();
		};
	}, [callbacks, instance]);

	// Fetch hub URL when session is ready
	useEffect(() => {
		if (session) {
			instance
				.getSubscriptionHubUrl()
				.then((url) => {
					console.info("SubscriptionHub URL:", url);
					setHubUrl(url);
				})
				.catch((err) => {
					console.error("Failed to get SubscriptionHub URL:", err);
				});
		}
	}, [session, instance]);

	// Show loading while session is loading OR while hubUrl is being fetched
	if (isSessionLoading || (session && !hubUrl && !sessionError)) {
		return (
			<div className={wrapperClassName || "renumerate-subscription-hub"}>
				{loadingComponent || <div>Loading...</div>}
			</div>
		);
	}

	if (sessionError || !hubUrl) {
		return (
			<div className={wrapperClassName || "renumerate-subscription-hub"}>
				{errorComponent || <div>Failed to load subscription hub</div>}
			</div>
		);
	}

	return (
		<div className={wrapperClassName || "renumerate-subscription-hub"}>
			<iframe
				className={iframeClassName || "renumerate-subscription-hub-iframe"}
				title="SubscriptionHub"
				src={hubUrl}
				allow="publickey-credentials-get; payment"
				data-renumerate-subhub="true"
			/>
		</div>
	);
}
