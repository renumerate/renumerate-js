import { default as default_2 } from 'react';
import { JSX as JSX_2 } from 'react/jsx-runtime';

/**
 * Cancel Button Component
 */
export declare function CancelButton({ sessionId, className }: UseRenumerateParams): JSX_2.Element;

declare interface RenumerateConfig {
    publicKey: string;
    debug?: boolean;
}

/**
 * Renumerate Provider Component
 */
export declare function RenumerateProvider({ config, children, }: {
    config: RenumerateConfig;
    children: default_2.ReactNode;
}): JSX_2.Element;

/**
 * SubscriptionHub Component
 */
export declare function SubscriptionHub({ sessionId, className }: UseRenumerateParams): JSX_2.Element;

/**
 * Hook to use Renumerate instance in React components
 */
export declare function useRenumerate({ sessionId, }: UseRenumerateParams): UseRenumerateReturn;

declare interface UseRenumerateParams {
    sessionId: string;
    className?: string;
}

declare interface UseRenumerateReturn {
    open: () => void;
}

export { }
