// Private interface
interface Window {
	RENUMERATE_LOCAL?: boolean;
	RENUMERATE_INSTANCE?: Renumerate;
}

type UrlBuildParams =
	| { target: "retention"; sessionId: string }
	| { target: "subscription"; sessionId: string }
	| { target: "event" };

export interface CallbackOptions {
	onComplete?: () => void;
	onRetained?: () => void;
	onCancelled?: () => void;
}

interface MountCancelButtonOptions {
	classes?: string;
	onComplete?: () => void;
	onRetained?: () => void;
	onCancelled?: () => void;
}

// Public interface
export interface RenumerateConfig {
	publicKey: string;
	debug?: boolean;
	callbacks?: CallbackOptions;
}

export interface EventData {
	[key: string]: string | number | boolean;
}

export class Renumerate {
	private config: RenumerateConfig;
	private retentionDialog: HTMLDialogElement | null = null;
	private retentionIframe: HTMLIFrameElement | null = null;
	private subscriptionIframe: HTMLIFrameElement | null = null;
	private styleSheet: HTMLStyleElement | null = null;
	private windowListener: ((event: MessageEvent) => void) | null = null;
	private activeCallbacks: CallbackOptions = {};

	constructor(config: RenumerateConfig) {
		this.config = config;

		// In contexts where `window` is not defined (e.g., server-side rendering),
		// we do not want to execute any code that relies on the DOM.
		// This is a safeguard to prevent errors in environments like Next.js or Gatsby.
		if (typeof window === "undefined") {
			return;
		}

		this.initialize();
	}

	setCallbacks(callbacks?: CallbackOptions) {
		this.activeCallbacks = {
			...this.config.callbacks,
			...callbacks,
		};
	}

	/**
	 * Get or create a Renumerate instance
	 * @param config Configuration for the Renumerate instance
	 * @returns Renumerate instance
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
	updateConfig(config: RenumerateConfig) {
		this.config = config;
	}

	/**
	 * Mount a cancel button for a subscriber
	 * @param elementId Element ID to mount the button
	 * @param sessionId Mandatory customer session identifier
	 * @param options Options object or classes string
	 */
	mountCancelButton(
		elementId: string,
		sessionId: string,
		options?: MountCancelButtonOptions | string,
	) {
		let finalOptions: MountCancelButtonOptions = {};

		if (typeof options === "string") {
			finalOptions.classes = options;
		} else if (options) {
			finalOptions = options;
		}

		if (!this.isSessionType(sessionId, "retention")) {
			throw new Error(
				`Invalid sessionId: ${sessionId}. Expected a retention session ID.`,
			);
		}

		const button = document.createElement("button");
		button.textContent = "Cancel Subscription";
		button.addEventListener("click", () => {
			const callbacks = {
				onComplete: finalOptions.onComplete,
				onRetained: finalOptions.onRetained,
				onCancelled: finalOptions.onCancelled,
			};
			this.showRetentionView(sessionId, callbacks);
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
	 * Show retention view for a customer
	 * @param sessionId Mandatory customer session identifier
	 */
	showRetentionView(sessionId: string, callbacks?: CallbackOptions) {
		this.setCallbacks(callbacks);

		// Validate sessionId
		if (
			!this.isSessionType(sessionId, "retention") &&
			!this.isSessionType(sessionId, "subscription")
		) {
			throw new Error(
				`Invalid sessionId: ${sessionId}. Expected a retention or subscription session ID.`,
			);
		}

		this.retentionDialog = document.createElement("dialog");
		this.retentionDialog.className = "renumerate-dialog";

		// Create close button
		const closeButton = document.createElement("button");
		closeButton.className = "renumerate-dialog-close";
		closeButton.innerHTML = "&times;";
		closeButton.setAttribute("aria-label", "Close");
		this.retentionDialog.appendChild(closeButton);

		closeButton.addEventListener("click", () => {
			// We can be reasonably sure that the dialog is not null here
			this.retentionDialog?.close();
		});

		// Create the content
		const content = document.createElement("div");
		content.className = "renumerate-dialog-content";

		this.retentionIframe = document.createElement("iframe");
		this.retentionIframe.src = this.buildUrl({
			target: "retention",
			sessionId: sessionId,
		});

		content.appendChild(this.retentionIframe);
		this.retentionDialog.appendChild(content);

		// Move the close button to inside the content
		content.prepend(closeButton);

		document.body.appendChild(this.retentionDialog);
		this.retentionDialog.showModal();

		// Blur the close button so it is not focused by default
		closeButton.blur();

		// Teardown
		this.retentionDialog.addEventListener("close", () => {
			this.activeCallbacks.onComplete?.();
			this.activeCallbacks = {};
			this.retentionDialog?.remove();
		});

		return this.retentionDialog;
	}

	/**
	 * Mount the SubscriptionHub for a customer
	 * @param elementId
	 * @param sessionId
	 * @param wrapperClasses
	 * @param iframeClasses
	 * @param callbacks Optional callbacks for subscription events
	 * @returns
	 */
	mountSubscriptionHub(
		elementId: string,
		sessionId: string,
		wrapperClasses: string = "",
		iframeClasses: string = "",
		callbacks?: {
			onComplete?: () => void;
			onRetained?: () => void;
			onCancelled?: () => void;
		},
	): HTMLElement {
		// Validate sessionId
		if (!this.isSessionType(sessionId, "subscription")) {
			throw new Error(
				`Invalid sessionId: ${sessionId}. Expected a subscription session ID.`,
			);
		}

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
		this.subscriptionIframe.src = this.getSubscriptionHubUrl(sessionId);
		this.subscriptionIframe.className =
			iframeClasses || "renumerate-subscription-hub-iframe";
		this.subscriptionIframe.title = "SubscriptionHub";

		container.appendChild(this.subscriptionIframe);

		return container;
	}

	/**
	 * Get subscription hub url
	 */
	getSubscriptionHubUrl(sessionId: string): string {
		if (!this.isSessionType(sessionId, "subscription")) {
			throw new Error(
				`Invalid sessionId: ${sessionId}. Expected a subscription session ID.`,
			);
		}
		return this.buildUrl({
			target: "subscription",
			sessionId: sessionId,
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

		// Clean up dialog and iframes
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

		// Clean up styles
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
	 * Private: Check if the sessionId is of a specific type
	 * @param sessionId The session ID to check
	 * @param type The type to check against ("retention" or "subscription")
	 * @returns True if the sessionId matches the type, false otherwise
	 */
	private isSessionType(sessionId: string, type: "retention" | "subscription") {
		switch (type) {
			case "retention":
				return sessionId.startsWith("ret_");
			case "subscription":
				return sessionId.startsWith("sub_");
			default:
				throw new Error(`Unknown session type: ${type}`);
		}
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
		this.styleSheet.type = "text/css";
		this.styleSheet.setAttribute("data-renumerate-dialog-styles", "true");

		this.styleSheet.innerHTML = `
			.renumerate-subscription-hub {
				height: 400px;
				width: 100%;
			}

			.renumerate-subscription-hub-iframe {
				height: 400px;
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
				? ["http://localhost:3000", "http://localhost:4321"]
				: ["https://retention.renumerate.com", "https://subs.renumerate.com"];

			if (!allowedOrigins.includes(event.origin)) {
				console.warn(
					"Received message from unauthorized origin:",
					event.origin,
				);
				return;
			}

			const { type, data } = event.data;
			switch (type) {
				case "cancel-subscription": {
					this.showRetentionView(data.sessionId, this.activeCallbacks);
					return;
				}

				case "resize": {
					if (
						this.retentionIframe &&
						data.height &&
						typeof data.height === "number" &&
						data.height > 0
					) {
						this.retentionIframe.style.height = `${data.height}px`;
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
					console.warn(`Unknown message type: ${type}`);
				}
			}
		};

		window.addEventListener("message", this.windowListener);
	}

	/**
	 * Private: Get the target URL
	 * @param type The type of session ("retention" or "subscription")
	 */
	private buildUrl(params: UrlBuildParams): string {
		const isLocal = this.getIsLocal();

		const withSessionId = (url: string, sessionId: string) => {
			return `${url}?session_id=${sessionId}`;
		};

		switch (params.target) {
			case "retention": {
				const url = isLocal
					? "http://localhost:4321/retention"
					: "https://retention.renumerate.com";
				return withSessionId(url, params.sessionId);
			}

			case "subscription": {
				const url = isLocal
					? "http://localhost:4321/subs"
					: "https://subs.renumerate.com";
				return withSessionId(url, params.sessionId);
			}

			case "event":
				return isLocal
					? "http://localhost:4321/event/"
					: "https://renumerate.com/event/";
			default:
				throw new Error(`Unknown type: ${params}`);
		}
	}
}
