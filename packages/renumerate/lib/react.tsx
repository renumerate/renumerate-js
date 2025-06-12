import React, { useEffect, useState } from "react";
import { Renumerate, type RenumerateConfig } from "./core";

interface RenumerateContextValue {
	instance: Renumerate;
}

interface UseRenumerateParams {
	sessionId: string;
	className?: string;
}

interface UseRenumerateReturn {
	open: () => void;
}

// Create a context for Renumerate
const RenumerateContext = React.createContext<RenumerateContextValue | null>(
	null,
);

/**
 * Renumerate Provider Component
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
	const [renumerate] = useState(() => new Renumerate(config));

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

	return (
		<RenumerateContext.Provider value={{ instance: renumerate }}>
			{children}
		</RenumerateContext.Provider>
	);
}

/**
 * Hook to use Renumerate instance in React components
 */
export function useRenumerate({
	sessionId,
}: UseRenumerateParams): UseRenumerateReturn {
	const context = React.useContext(RenumerateContext);
	if (!context) {
		throw new Error("useRenumerate must be used within a RenumerateProvider");
	}

	const cachedOpen = React.useCallback(() => {
		context.instance.showRetentionView(sessionId);
	}, [sessionId, context.instance]);

	return {
		open: cachedOpen,
	};
}

/**
 * Cancel Button Component
 */
export function CancelButton({ sessionId, className }: UseRenumerateParams) {
	const context = React.useContext(RenumerateContext);

	if (!context) {
		throw new Error("useRenumerate must be used within a RenumerateProvider");
	}

	const handleClick = () => {
		context.instance.showRetentionView(sessionId);
	};

	return (
		<button
			type="button"
			className={className || "renumerate-cancel-btn"}
			onClick={handleClick}
		>
			Cancel Subscription
		</button>
	);
}
/**
 * SubscriptionHub Component
 */
export function SubscriptionHub({ sessionId, className }: UseRenumerateParams) {
	const context = React.useContext(RenumerateContext);

	if (!context) {
		throw new Error("useRenumerate must be used within a RenumerateProvider");
	}

	return (
		<div
			className={className || "renumerate-subscription-hub"}
			style={{ height: "100%", width: "100%", minHeight: "220px" }}
		>
			<iframe
				title="SubscriptionHub"
				src={context.instance.getSubscriptionHubUrl(sessionId)}
				style={{ height: "100%", width: "100%", minHeight: "220px" }}
			/>
		</div>
	);
}
