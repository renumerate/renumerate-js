import { default as default_2 } from 'react';
import { JSX as JSX_2 } from 'react/jsx-runtime';

declare interface CallbackOptions {
    onComplete?: () => void;
    onRetained?: () => void;
    onCancelled?: () => void;
}

/**
 * Cancel Button Component
 */
export declare function CancelButton({ sessionId, callbacks, className, }: UseRenumerateParams & {
    className?: string;
}): JSX_2.Element;

declare interface RenumerateConfig {
    publicKey: string;
    debug?: boolean;
    callbacks?: CallbackOptions;
    fallbackEmail?: string;
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
export declare function SubscriptionHub({ sessionId, callbacks, wrapperClassName, iframeClassName, }: UseRenumerateParams & {
    wrapperClassName?: string;
    iframeClassName?: string;
}): JSX_2.Element;

/**
 * Hook to use Renumerate instance in React components
 */
export declare function useRenumerate({ sessionId, callbacks, }: UseRenumerateParams): UseRenumerateReturn;

declare interface UseRenumerateParams {
    sessionId: string;
    callbacks?: CallbackOptions;
}

declare interface UseRenumerateReturn {
    open: () => void;
}

export { }
