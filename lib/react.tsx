import React from "react";
import { Renumerate, RenumerateConfig } from "./core";

interface RenumerateContextValue {
  instance: Renumerate;
}

interface UseRenumerateParams {
  subscriberId: string;
  subscriptionId?: string;
  subscriberData?: Record<string, unknown>;
  playbookId?: string;
}

interface RetentionViewParams {
  subscription_id?: string;
  subscriber_data?: Record<string, unknown>;
  playbook_id?: string;
}

interface UseRenumerateReturn {
  open: () => void;
}

// Create a context for Renumerate
const RenumerateContext = React.createContext<RenumerateContextValue | null>(
  null
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
  subscriberId,
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
      ...(subscriptionId && { subscription_id: subscriptionId }),
      ...(Object.keys(subscriberData).length > 0 && {
        subscriber_data: subscriberData,
      }),
      ...(playbookId && { playbook_id: playbookId }),
    };

    context.instance.showRetentionView(subscriberId, params);
  }, [subscriberId, subscriptionId, subscriberData, playbookId]);

  return {
    open: cachedOpen,
  };
}

/**
 * Cancel Button Component
 */
export function CancelButton({
  subscriberId,
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
      ...(subscriptionId && { subscription_id: subscriptionId }),
      ...(Object.keys(subscriberData).length > 0 && {
        subscriber_data: subscriberData,
      }),
      ...(playbookId && { playbook_id: playbookId }),
    };

    context.instance.showRetentionView(subscriberId, params);
  };

  return (
    <button className="renumerate-cancel-btn" onClick={handleClick}>
      Cancel Subscription
    </button>
  );
}
