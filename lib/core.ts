import { SessionManager, type SdkSession } from "./session";

// Private interface
interface Window {
	RENUMERATE_LOCAL?: boolean;
	RENUMERATE_INSTANCE?: Renumerate;
}

// Re-export for external use
export type { SdkSession };

type UrlBuildParams =
	| { target: "retention"; sessionId: string; subscriptionId?: string }
	| { target: "subscription"; sessionId: string };

export interface CallbackOptions {
	onComplete?: () => void;
	onRetained?: () => void;
	onCancelled?: () => void;
}

interface MountCancelButtonOptions {
	classes?: string;
	subscriptionId?: string;
	onComplete?: () => void;
	onRetained?: () => void;
	onCancelled?: () => void;
}

// Public interface
export interface RenumerateConfig {
	debug?: boolean;
	callbacks?: CallbackOptions;
	fallbackEmail?: string;
	// Returns a signed handshake token from your backend - called when session needed/expired
	getAuthToken: () => Promise<string>;
}

/**
 * Validate that a session ID is in the expected r10_ format
 */
function isValidSessionId(sessionId: string): boolean {
	return sessionId.startsWith("r10_");
}

export class Renumerate {
	private config: RenumerateConfig;
	private retentionDialog: HTMLDialogElement | null = null;
	private retentionIframe: HTMLIFrameElement | null = null;
	private subscriptionIframe: HTMLIFrameElement | null = null;
	private styleSheet: HTMLStyleElement | null = null;
	private windowListener: ((event: MessageEvent) => void) | null = null;
	private activeCallbacks: CallbackOptions = {};
	private sessionManager: SessionManager;

	constructor(config: RenumerateConfig) {
		this.config = config;
		this.sessionManager = new SessionManager(
			config.getAuthToken,
			config.debug ?? false,
		);

		// In contexts where `window` is not defined (e.g., server-side rendering),
		// we do not want to execute any code that relies on the DOM.
		if (typeof window === "undefined") {
			return;
		}

		this.initialize();
	}

	/**
	 * Set active callbacks for event handling
	 */
	setCallbacks(callbacks?: CallbackOptions) {
		this.activeCallbacks = {
			...this.config.callbacks,
			...callbacks,
		};
	}

	/**
	 * Force refresh the session (perform token exchange)
	 */
	async refreshSession(): Promise<SdkSession> {
		return this.sessionManager.refreshSession();
	}

	/**
	 * Get or create a Renumerate instance
	 */
	public static getInstance(config: RenumerateConfig): Renumerate {
		if (typeof window === "undefined") {
			return new Renumerate(config);
		}

		// If instance exists, update its config and return it
		if ((window as Window).RENUMERATE_INSTANCE) {
			const instance = (window as Window).RENUMERATE_INSTANCE as Renumerate;
			instance.updateConfig(config);
			return instance;
		}

		// Otherwise create and store a new instance
		const instance = new Renumerate(config);
		(window as Window).RENUMERATE_INSTANCE = instance;
		return instance;
	}

	/**
	 * Update the configuration of the Renumerate instance
	 */
	updateConfig(config: Partial<RenumerateConfig>) {
		this.config = {
			...this.config,
			...config,
		};

		if (config.getAuthToken) {
			this.sessionManager.updateGetAuthToken(config.getAuthToken);
		}

		if (this.config.debug) {
			console.info("Config updated:", this.config);
		}
	}

	/**
	 * Get current SDK session (establishes session if needed)
	 */
	async getSession(): Promise<SdkSession> {
		return this.sessionManager.getSession();
	}

	/**
	 * Get current session without fetching (returns null if not established)
	 */
	getCurrentSession(): SdkSession | null {
		return this.sessionManager.getCurrentSession();
	}

	/**
	 * Clear the current session
	 */
	clearSession(): void {
		this.sessionManager.clearSession();
	}

	/**
	 * Mount a cancel button that opens retention view when clicked
	 */
	mountCancelButton(
		elementId: string,
		options?: MountCancelButtonOptions | string,
	) {
		let finalOptions: MountCancelButtonOptions = {};

		if (typeof options === "string") {
			finalOptions.classes = options;
		} else if (options) {
			finalOptions = options;
		}

		const button = document.createElement("button");
		button.textContent = "Cancel Subscription";
		button.addEventListener("click", () => {
			const callbacks = {
				onComplete: finalOptions.onComplete,
				onRetained: finalOptions.onRetained,
				onCancelled: finalOptions.onCancelled,
			};
			this.showRetentionView(finalOptions.subscriptionId, callbacks);
		});

		if (finalOptions.classes) {
			button.className = finalOptions.classes;
		} else {
			button.className = "renumerate-cancel-btn";
		}

		const parent = document.getElementById(elementId);
		if (!parent) {
			throw new Error(`Element with id ${elementId} not found`);
		}
		parent.appendChild(button);
	}

	/**
	 * Show retention view (cancellation flow)
	 * @param subscriptionId Optional - if undefined, uses first active subscription
	 * @param callbacks Optional callbacks for retention events
	 */
	async showRetentionView(subscriptionId?: string, callbacks?: CallbackOptions) {
		this.setCallbacks(callbacks);

		// Get session (establishes if needed)
		const session = await this.getSession();
		this.openRetentionDialog(session.sessionId, subscriptionId);
	}

	/**
	 * Mount the SubscriptionHub
	 */
	async mountSubscriptionHub(
		elementId: string,
		wrapperClasses = "",
		iframeClasses = "",
		callbacks?: CallbackOptions,
	): Promise<HTMLElement> {
		// Get session (establishes if needed)
		const session = await this.getSession();

		if (callbacks) {
			this.activeCallbacks = {
				...this.config.callbacks,
				...callbacks,
			};
		}

		const container = document.createElement("div");
		container.className = wrapperClasses || "renumerate-subscription-hub";

		const parent = document.getElementById(elementId);
		if (!parent) {
			throw new Error(`Element with id ${elementId} not found`);
		}
		parent.appendChild(container);

		this.subscriptionIframe = document.createElement("iframe");
		this.subscriptionIframe.src = this.buildUrl({
			target: "subscription",
			sessionId: session.sessionId,
		});
		this.subscriptionIframe.className =
			iframeClasses || "renumerate-subscription-hub-iframe";
		this.subscriptionIframe.title = "SubscriptionHub";
		this.subscriptionIframe.setAttribute(
			"allow",
			"publickey-credentials-get; payment",
		);
		this.subscriptionIframe.setAttribute("data-renumerate-subhub", "true");

		container.appendChild(this.subscriptionIframe);

		return container;
	}

	/**
	 * Get subscription hub URL
	 */
	async getSubscriptionHubUrl(): Promise<string> {
		const session = await this.getSession();
		return this.buildUrl({
			target: "subscription",
			sessionId: session.sessionId,
		});
	}

	/**
	 * Set up the Renumerate instance
	 */
	initialize() {
		if (this.config.debug) {
			console.info("Renumerate initialized with config:", this.config);
		}

		this.injectStylesheet();
		this.addListener();
	}

	/**
	 * Unmount renumerate components and clean up resources
	 */
	cleanup() {
		if (this.config.debug) {
			console.info("Renumerate cleaned up with config:", this.config);
		}

		if (this.retentionDialog) {
			this.retentionDialog.remove();
			this.retentionDialog = null;
		}

		if (this.retentionIframe) {
			this.retentionIframe.remove();
			this.retentionIframe = null;
		}

		if (this.subscriptionIframe) {
			this.subscriptionIframe.remove();
			this.subscriptionIframe = null;
		}

		if (this.styleSheet) {
			this.styleSheet.remove();
			this.styleSheet = null;
		}

		if (this.windowListener) {
			window.removeEventListener("message", this.windowListener);
			this.windowListener = null;
		}
	}

	/* Private functions */

	/**
	 * Private: Open retention dialog with session ID
	 */
	private openRetentionDialog(sessionId: string, subscriptionId?: string) {
		if (!isValidSessionId(sessionId)) {
			throw new Error(
				`Invalid session ID format. Expected r10_ prefix, got: ${sessionId}`,
			);
		}

		this.retentionDialog = document.createElement("dialog");
		this.retentionDialog.className = "renumerate-dialog";

		const closeButton = document.createElement("button");
		closeButton.className = "renumerate-dialog-close";
		closeButton.innerHTML = "&times;";
		closeButton.setAttribute("aria-label", "Close");
		this.retentionDialog.appendChild(closeButton);

		closeButton.addEventListener("click", () => {
			this.retentionDialog?.close();
		});

		const content = document.createElement("div");
		content.className = "renumerate-dialog-content";

		this.retentionIframe = document.createElement("iframe");
		this.retentionIframe.src = this.buildUrl({
			target: "retention",
			sessionId,
			subscriptionId,
		});

		const timeoutId = setTimeout(() => {
			if (this.config.debug) {
				console.warn("Retention iframe timed out after 10 seconds");
			}
			if (this.retentionIframe) {
				this.showRetentionError(content, this.retentionIframe);
			}
		}, 10000);

		this.retentionIframe.addEventListener("load", () => {
			clearTimeout(timeoutId);
		});

		content.appendChild(this.retentionIframe);
		this.retentionDialog.appendChild(content);
		content.prepend(closeButton);

		document.body.appendChild(this.retentionDialog);
		this.retentionDialog.showModal();
		closeButton.blur();

		this.retentionDialog.addEventListener("close", () => {
			clearTimeout(timeoutId);
			this.activeCallbacks.onComplete?.();
			this.activeCallbacks = {};

			const isLocal = this.getIsLocal();
			const targetOrigin = isLocal
				? "https://localhost:4321"
				: "https://subs.renumerate.com";

			try {
				const allIframes = Array.from(document.getElementsByTagName("iframe"));
				for (const iframe of allIframes) {
					const srcAttr = iframe.getAttribute("src") || "";
					if (
						srcAttr.includes("subs.renumerate.com") ||
						srcAttr.includes("localhost:4321/subs")
					) {
						if (iframe.contentWindow) {
							iframe.contentWindow.postMessage(
								{ type: "on-complete", data: {} },
								targetOrigin,
							);
						}
					}
				}
			} catch (err) {
				if (this.config?.debug) {
					console.warn("Error sending on-complete to iframes:", err);
				}
			} finally {
				this.retentionDialog?.remove();
			}
		});

		return this.retentionDialog;
	}

	/**
	 * Private: Show error content when retention iframe fails to load
	 */
	private showRetentionError(
		content: HTMLDivElement,
		iframe: HTMLIFrameElement,
	) {
		if (this.config.debug) {
			console.warn("Retention iframe failed to load, showing fallback content");
		}

		if (content.querySelector(".renumerate-error-content")) {
			return;
		}

		iframe.style.display = "none";

		const errorDiv = document.createElement("div");
		errorDiv.className = "renumerate-error-content";

		const { fallbackEmail } = this.config;
		errorDiv.innerHTML = `
			<h2>We're sorry!</h2>
			<p>We're having trouble loading the cancellation form.</p>
			${
				fallbackEmail
					? `<p>Please email us at <a href="mailto:${fallbackEmail}">${fallbackEmail}</a> to cancel your subscription.</p>`
					: "<p>Please contact support to cancel your subscription.</p>"
			}
		`;

		content.appendChild(errorDiv);
	}

	/**
	 * Private: Show error content when subscription hub iframe fails to load
	 */
	private showSubscriptionHubError(
		container: HTMLElement,
		iframe: HTMLIFrameElement,
	) {
		if (this.config.debug) {
			console.warn(
				"Subscription hub iframe failed to load, showing fallback content",
			);
		}

		iframe.style.display = "none";

		const errorDiv = document.createElement("div");
		errorDiv.className = "renumerate-error-content";

		errorDiv.innerHTML = `
            <h2>We're sorry!</h2>
            <p>We're having trouble loading your subscription information.</p>
			<p>We've been notified and we'll have this right up again shortly! In the meantime contact support for any urgent issues</p>
        `;

		container.appendChild(errorDiv);
	}

	private getIsLocal(): boolean {
		return (
			typeof window !== "undefined" &&
			(window as Window).RENUMERATE_LOCAL === true
		);
	}

	/**
	 * Private: Inject the stylesheet into the document head
	 */
	private injectStylesheet() {
		const existingStyleSheet = document.querySelector(
			"style[data-renumerate-dialog-styles]",
		);
		if (existingStyleSheet) {
			this.styleSheet = existingStyleSheet as HTMLStyleElement;
			return;
		}

		this.styleSheet = document.createElement("style");
		this.styleSheet.setAttribute("data-renumerate-dialog-styles", "true");

		this.styleSheet.innerHTML = `
			.renumerate-subscription-hub {
				height: max-content;
				min-height: 400px;
				width: 100%;
			}

			.renumerate-subscription-hub-iframe {
				height: max-content;
				min-height: 400px;
				width: 100%;
			}

            .renumerate-dialog {
                position: fixed;
                margin: 0 auto;
                width: 412px;
                max-width: 90%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background-color: transparent;
                color: #f0f0f0;
                border: none;
                border-radius: 8px;
                padding: 0;
            }

            .renumerate-dialog::backdrop {
                background-color: rgba(0, 0, 0, 0.40);
            }

            .renumerate-dialog-close {
                position: absolute;
                top: 16px;
                right: 25px;
                background: none;
                border: none;
                font-size: 32px;
                font-weight: 30;
                line-height: 1;
                color: #666;
                cursor: pointer;
                z-index: 1000;
            }

            .renumerate-dialog-close:hover {
                color: #000;
            }

            .renumerate-dialog-content {
                position: relative;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                justify-content: center;
                align-items: center;
                border-radius: 8px;
                background-color: #fcfbf9;
                box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
                min-width: 412px;
            }

            .renumerate-dialog-content iframe {
                width: 100%;
                height: 100%;
                min-height: 304px;
                min-width: 412x;
                border: none;
                margin: 0;
                padding: 0;
                flex-grow: 1;
                transition: all 0.3s ease-in-out;
            }

            .renumerate-error-content {
                padding: 40px;
                text-align: center;
                color: #18181b;
            }

            .renumerate-error-content h2 {
                margin: 0 0 16px 0;
                font-size: 24px;
                font-weight: 600;
                color: #18181b;
            }

            .renumerate-error-content p {
                margin: 12px 0;
                font-size: 16px;
                line-height: 1.5;
                color: #52525b;
            }

            .renumerate-error-content a {
                color: #2563eb;
                text-decoration: none;
            }

            .renumerate-error-content a:hover {
                text-decoration: underline;
            }

            @media screen and (max-width: 1024px) {
                .renumerate-dialog {
                    width: 90vw;
                    min-width: 600px;
                }

                .renumerate-dialog-content {
                    min-width: 400px;
                }
            }

            @media screen and (max-width: 768px) {
                .renumerate-dialog-content {
                    padding: 5px;
                    width: 90vw;
                    max-height: 90vh;
                }
            }

            @media screen and (max-width: 480px) {
                    .renumerate-dialog {
                        min-width: 100vw;
                        min-height: 100vh;
                        padding: 12px;
                    }

                    .renumerate-dialog-content {
                        min-width: 100%;
                        min-height: 100%;
                    }

                    .renumerate-dialog-close {
                        font-size: 40px;
                        top: 20px;
                        right: 20px;
                        font-weight: 200;
                    }

                    .renumerate-error-content {
                        padding: 20px;
                    }

                    .renumerate-error-content h2 {
                        font-size: 20px;
                    }

                    .renumerate-error-content p {
                        font-size: 14px;
                    }
            }

      .renumerate-cancel-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;

        padding: 8px 16px;
        border-radius: 6px;

        font-size: 14px;
        font-weight: 500;

        background-color: #f4f4f5;
        color: #18181b;
        border: 1px solid #e4e4e7;

        cursor: pointer;
        user-select: none;

        transition:
            background-color 0.2s ease,
            border-color 0.2s ease,
            color 0.2s ease;
      }

      .renumerate-cancel-btn:hover {
          background-color: #e4e4e7;
          border-color: #d4d4d8;
      }
    `;
		document.head.appendChild(this.styleSheet);
	}

	/**
	 * Private: Add a listener for messages from the iframe
	 */
	private addListener() {
		if (this.config.debug) {
			console.info("Adding message listener for Renumerate");
		}

		this.windowListener = (event) => {
			if (this.config.debug) {
				console.info("Received message:", event.data);
			}

			const isLocal = this.getIsLocal();
			const allowedOrigins = isLocal
				? ["https://localhost:4321"]
				: ["https://retention.renumerate.com", "https://subs.renumerate.com"];

			if (!allowedOrigins.includes(event.origin)) {
				if (this.config.debug) {
					console.warn(
						"Received message from unauthorized origin:",
						event.origin,
					);
				}
				return;
			}

			const { type, data } = event.data;
			switch (type) {
				case "catastrophic-failure": {
					if (this.config.debug) {
						console.error(
							"Received catastrophic-failure from iframe:",
							data.iframe,
						);
					}

					if (
						data.iframe === "retention" &&
						this.retentionDialog &&
						this.retentionIframe
					) {
						const content = this.retentionDialog.querySelector(
							".renumerate-dialog-content",
						) as HTMLDivElement;
						if (content) {
							this.showRetentionError(content, this.retentionIframe);
						}
					}

					const subIframe = document.querySelector(
						'[data-renumerate-subhub="true"]',
					) as HTMLIFrameElement | null;

					if (data.iframe === "subscription" && subIframe) {
						const container = subIframe.parentElement;
						if (container) {
							this.showSubscriptionHubError(container, subIframe);
						}
					}
					return;
				}

				case "cancel-subscription": {
					// Iframe sends session ID and optional subscription ID for retention flow
					if (data.sessionId && isValidSessionId(data.sessionId)) {
						this.setCallbacks(this.activeCallbacks);
						this.openRetentionDialog(data.sessionId, data.subscriptionId);
					} else if (this.config.debug) {
						console.warn("Invalid session ID received from iframe:", data.sessionId);
					}
					return;
				}

				case "resize": {
					const targetIframe =
						data.iframe === "subscription"
							? (document.querySelector(
									'[data-renumerate-subhub="true"]',
								) as HTMLIFrameElement)
							: this.retentionIframe;

					if (
						targetIframe &&
						data.height &&
						typeof data.height === "number" &&
						data.height > 0
					) {
						targetIframe.style.height = `${data.height}px`;
					}
					return;
				}

				case "close-dialog": {
					if (this.retentionDialog) {
						this.retentionDialog.close();
					}
					return;
				}

				case "on-complete": {
					this.activeCallbacks.onComplete?.();
					return;
				}

				case "on-retained": {
					this.activeCallbacks.onRetained?.();
					return;
				}

				case "on-cancelled": {
					this.activeCallbacks.onCancelled?.();
					return;
				}

				default: {
					if (this.config.debug) {
						console.warn(`Unknown message type: ${type}`);
					}
				}
			}
		};

		window.addEventListener("message", this.windowListener);
	}

	/**
	 * Private: Get the target URL
	 */
	private buildUrl(params: UrlBuildParams): string {
		const isLocal = this.getIsLocal();

		switch (params.target) {
			case "retention": {
				const baseUrl = isLocal
					? "https://localhost:4321/retention"
					: "https://retention.renumerate.com";
				const url = new URL(baseUrl);
				url.searchParams.set("session_id", params.sessionId);
				if (params.subscriptionId) {
					url.searchParams.set("subscription_id", params.subscriptionId);
				}
				return url.toString();
			}

			case "subscription": {
				const baseUrl = isLocal
					? "https://localhost:4321/subs"
					: "https://subs.renumerate.com";
				return `${baseUrl}?session_id=${params.sessionId}`;
			}
		}
	}
}
