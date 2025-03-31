import React from "react";
import { Renumerate, RenumerateConfig } from "./core";

interface RenumerateContextValue {
  instance: Renumerate;
}

interface UseRenumerateParams {
  sessionId: string;
}

interface RetentionViewParams {
  sessionId: string;
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
  const renumerate = new Renumerate(config);

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
export function CancelButton({ sessionId }: UseRenumerateParams) {
  const context = React.useContext(RenumerateContext);

  if (!context) {
    throw new Error("useRenumerate must be used within a RenumerateProvider");
  }

  const handleClick = () => {
    context.instance.showRetentionView(sessionId);
  };

  return (
    <button className="renumerate-cancel-btn" onClick={handleClick}>
      Cancel Subscription
    </button>
  );
}
