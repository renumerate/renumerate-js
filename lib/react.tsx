import React from "react";
import { Renumerate, RenumerateConfig } from "./core";

interface RenumerateContextValue {
  instance: Renumerate;
}

interface UseRenumerateParams {
  customerId: string;
  subscriptionId?: string;
  subscriberData?: Record<string, unknown>;
  playbookId?: string;
}

interface RetentionViewParams {
  subscriptionId?: string;
  subscriberData?: Record<string, unknown>;
  playbookId?: string;
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
  customerId,
  subscriptionId,
  subscriberData = {},
  playbookId,
}: UseRenumerateParams): UseRenumerateReturn {
  const context = React.useContext(RenumerateContext);
  if (!context) {
    throw new Error("useRenumerate must be used within a RenumerateProvider");
  }

  const cachedOpen = React.useCallback(() => {
    const params: RetentionViewParams = {
      ...(subscriptionId && { subscriptionId }),
      ...(Object.keys(subscriberData).length > 0 && {
        subscriber_data: subscriberData,
      }),
      ...(playbookId && { playbookId }),
    };

    context.instance.showRetentionView(customerId, params);
  }, [
    context.instance,
    customerId,
    subscriptionId,
    subscriberData,
    playbookId,
  ]);

  return {
    open: cachedOpen,
  };
}

/**
 * Cancel Button Component
 */
export function CancelButton({
  customerId,
  subscriptionId,
  subscriberData = {},
  playbookId,
}: UseRenumerateParams) {
  const context = React.useContext(RenumerateContext);

  if (!context) {
    throw new Error("useRenumerate must be used within a RenumerateProvider");
  }

  const handleClick = () => {
    const params: RetentionViewParams = {
      ...(subscriptionId && { subscriptionId }),
      ...(Object.keys(subscriberData).length > 0 && {
        subscriberData,
      }),
      ...(playbookId && { playbookId }),
    };

    context.instance.showRetentionView(customerId, params);
  };

  return (
    <button className="renumerate-cancel-btn" onClick={handleClick}>
      Cancel Subscription
    </button>
  );
}
