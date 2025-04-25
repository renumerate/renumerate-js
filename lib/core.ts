export interface RenumerateConfig {
	publicKey: string;
	debug?: boolean;
}

export interface EventData {
	[key: string]: string | number | boolean;
}

export class Renumerate {
	private config: RenumerateConfig;

	constructor(config: RenumerateConfig) {
		this.config = config;
		this.injectStylesheet();
		this.addListener();
	}

	/**
	 * Register an event with a name and optional data
	 * @param eventName Name of the event to register
	 * @param data Key-value pairs of event data
	 */
	registerEvent(eventName: string, data: EventData = {}): void {
		if (this.config.debug)
			console.info(`Registering event: ${eventName}`, data);
	}

	/**
	 * Mount a cancel button for a subscriber
	 * @param sessionId Mandatory customer session identifier
	 */
	mountCancelButton(
		elementId: string,
		sessionId: string,
		classes: string = "",
	) {
		// Ensure styles are loaded
		if (!document.querySelector("style[data-renumerate-modal-styles]")) {
			this.injectStylesheet();
		}
		// Validate sessionId
		if (!this.isSessionType(sessionId, "retention")) {
			throw new Error(
				`Invalid sessionId: ${sessionId}. Expected a retention session ID.`,
			);
		}

		const button = document.createElement("button");
		button.textContent = "Cancel Subscription";
		button.addEventListener("click", () => {
			this.showRetentionView(sessionId);
		});

		if (classes) {
			button.className = classes;
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
	showRetentionView(sessionId: string): HTMLDialogElement {
		// Ensure styles are loaded
		if (!document.querySelector("style[data-renumerate-modal-styles]")) {
			this.injectStylesheet();
		}

		// Validate sessionId
		if (
			!this.isSessionType(sessionId, "retention") &&
			!this.isSessionType(sessionId, "subscription")
		) {
			throw new Error(
				`Invalid sessionId: ${sessionId}. Expected a retention or subscription session ID.`,
			);
		}

		const dialog = document.createElement("dialog");
		dialog.className = "renumerate-dialog";

		// Create close button
		const closeButton = document.createElement("button");
		closeButton.className = "renumerate-dialog-close";
		closeButton.innerHTML = "&times;";
		closeButton.setAttribute("aria-label", "Close");
		dialog.appendChild(closeButton);

		closeButton.addEventListener("click", () => {
			dialog.close();
		});

		// Create the content
		const content = document.createElement("div");
		content.className = "renumerate-dialog-content";

		content.innerHTML = `
			<iframe src="https://renumerate.com/cancellation/${sessionId}" frameborder="0"></iframe>
			<iframe src="https://renumerate.com/cancellation/${sessionId}" frameborder="0"></iframe>
			
				`;
		dialog.appendChild(content);

		// Move the close button to inside the content
		content.prepend(closeButton);

		document.body.appendChild(dialog);
		dialog.showModal();

		// Teardown
		dialog.addEventListener("close", () => {
			dialog.remove();
		});

		return dialog;
	}

	/**
	 * Mount the SubscriptionHub for a customer
	 * @param sessionId
	 * @returns
	 */
	mountSubscriptionHub(
		elementId: string,
		sessionId: string,
		classes: string = "",
	): HTMLElement {
		// Ensure styles are loaded
		if (!document.querySelector("style[data-renumerate-modal-styles]")) {
			this.injectStylesheet();
		}

		// Validate sessionId
		if (!this.isSessionType(sessionId, "subscription")) {
			throw new Error(
				`Invalid sessionId: ${sessionId}. Expected a subscription session ID.`,
			);
		}

		const container = document.createElement("div");
		container.className = classes || "renumerate-subscription-hub";

		const parent = document.getElementById(elementId);
		if (!parent) {
			throw new Error(`Element with id ${elementId} not found`);
		}
		parent.appendChild(container);

		const iframe = document.createElement("iframe");
		iframe.src = `https://renumerate.com/subscription/${sessionId}`;
		iframe.width = "100%";
		iframe.height = "300px";

		container.appendChild(iframe);

		return container;
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

	/**
	 * Private: Inject the stylesheet into the document head
	 */
	private injectStylesheet() {
		if (typeof document === "undefined") {
			// Exit early if `document` is not available (e.g., during SSR)
			return;
		}

		const styleSheet = document.createElement("style");
		styleSheet.type = "text/css";
		styleSheet.setAttribute("data-renumerate-dialog-styles", "true");

		styleSheet.innerHTML = `
			.renumerate-dialog {
				position: fixed;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
				width: 800px;
				max-width: 90%;
				max-height: 90%;
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
				background-color: rgba(0, 0, 0, 0.04);
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
				box-shadow: rgba(17, 12, 46, 0.15) 0px 48px 100px 0px;
				padding-top: 50px;
			}

			.renumerate-dialog-content iframe {
				width: 100%;
				height: 100%;
				min-height: 400px;
				min-width: 600px;
				border: none;
				margin: 0;
				padding: 0;
				flex-grow: 1;
			}

			@media screen and (max-width: 1024px) {
				.renumerate-dialog {
					width: 90vw;
					min-width: 600px;
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
						width: 100vw;
						max-width: 100vw;
						height: 100vh;
						max-height: 100vh;
						border-radius: 0;
						top: 0;
						left: 0;
						transform: none;
					}

					.renumerate-dialog-content {
						padding: 5px;
						min-width: 100vw;
						width: 100vw;
						max-width: 100vw;
						min-height: 100vh;
						height: 100vh;
						max-height: 100vh;
					}

					.renumerate-dialog-close {
						font-size: 32px;
						top: 20px;
						right: 20px;
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
		document.head.appendChild(styleSheet);
	}

	/**
	 * Private: Add a listener for messages from the iframe
	 */
	private addListener() {
		window.addEventListener("message", (event) => {
			const allowedOrigins = ["https://renumerate.com"];

			if (!allowedOrigins.includes(event.origin)) {
				console.warn(
					"Received message from unauthorized origin:",
					event.origin,
				);
				return;
			}

			const { type, data } = event.data;
			if (type === "cancel-subscription") {
				this.showRetentionView(data.sessionId);
			}
		});
	}
}
