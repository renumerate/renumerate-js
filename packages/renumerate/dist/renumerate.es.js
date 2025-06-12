var a = Object.defineProperty;
var c = (o, e, t) => e in o ? a(o, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : o[e] = t;
var s = (o, e, t) => c(o, typeof e != "symbol" ? e + "" : e, t);
class l {
  constructor(e) {
    s(this, "config");
    s(this, "dialog", null);
    s(this, "retentionIframe", null);
    s(this, "subscriptionIframe", null);
    this.config = e, this.injectStylesheet(), this.addListener();
  }
  /**
   * Register an event with a name and optional data
   * @param eventName Name of the event to register
   * @param data Key-value pairs of event data
   */
  registerEvent(e, t = {}) {
    this.config.debug && console.info(`Registering event: ${e}`, t);
  }
  /**
   * Mount a cancel button for a subscriber
   * @param sessionId Mandatory customer session identifier
   */
  mountCancelButton(e, t, r = "") {
    if (document.querySelector("style[data-renumerate-modal-styles]") || this.injectStylesheet(), !this.isSessionType(t, "retention"))
      throw new Error(
        `Invalid sessionId: ${t}. Expected a retention session ID.`
      );
    const n = document.createElement("button");
    n.textContent = "Cancel Subscription", n.addEventListener("click", () => {
      this.showRetentionView(t);
    }), r ? n.className = r : n.className = "renumerate-cancel-btn";
    const i = document.getElementById(e);
    if (!i)
      throw new Error(`Element with id ${e} not found`);
    i.appendChild(n);
  }
  /**
   * Show retention view for a customer
   * @param sessionId Mandatory customer session identifier
   */
  showRetentionView(e) {
    const t = document.querySelector(".renumerate-dialog");
    if (t)
      return t instanceof HTMLDialogElement ? t : null;
    if (document.querySelector("style[data-renumerate-modal-styles]") || this.injectStylesheet(), !this.isSessionType(e, "retention") && !this.isSessionType(e, "subscription"))
      throw new Error(
        `Invalid sessionId: ${e}. Expected a retention or subscription session ID.`
      );
    this.dialog = document.createElement("dialog"), this.dialog.className = "renumerate-dialog";
    const r = document.createElement("button");
    r.className = "renumerate-dialog-close", r.innerHTML = "&times;", r.setAttribute("aria-label", "Close"), this.dialog.appendChild(r), r.addEventListener("click", () => {
      var i;
      (i = this.dialog) == null || i.close();
    });
    const n = document.createElement("div");
    return n.className = "renumerate-dialog-content", this.retentionIframe = document.createElement("iframe"), this.retentionIframe.src = this.buildUrl({
      target: "retention",
      sessionId: e
    }), n.appendChild(this.retentionIframe), this.dialog.appendChild(n), n.prepend(r), document.body.appendChild(this.dialog), this.dialog.showModal(), this.dialog.addEventListener("close", () => {
      var i;
      (i = this.dialog) == null || i.remove();
    }), this.dialog;
  }
  /**
   * Mount the SubscriptionHub for a customer
   * @param sessionId
   * @returns
   */
  mountSubscriptionHub(e, t, r = "") {
    if (document.querySelector("style[data-renumerate-modal-styles]") || this.injectStylesheet(), !this.isSessionType(t, "subscription"))
      throw new Error(
        `Invalid sessionId: ${t}. Expected a subscription session ID.`
      );
    const n = document.createElement("div");
    n.className = r || "renumerate-subscription-hub";
    const i = document.getElementById(e);
    if (!i)
      throw new Error(`Element with id ${e} not found`);
    return i.appendChild(n), this.subscriptionIframe = document.createElement("iframe"), this.subscriptionIframe.src = this.getSubscriptionHubUrl(t), this.subscriptionIframe.width = "100%", this.subscriptionIframe.height = "300px", n.appendChild(this.subscriptionIframe), n;
  }
  /**
   * Get subscription hub url
   */
  getSubscriptionHubUrl(e) {
    if (!this.isSessionType(e, "subscription"))
      throw new Error(
        `Invalid sessionId: ${e}. Expected a subscription session ID.`
      );
    return this.buildUrl({
      target: "subscription",
      sessionId: e
    });
  }
  /* Private functions */
  /**
   * Private: Check if the sessionId is of a specific type
   * @param sessionId The session ID to check
   * @param type The type to check against ("retention" or "subscription")
   * @returns True if the sessionId matches the type, false otherwise
   */
  isSessionType(e, t) {
    switch (t) {
      case "retention":
        return e.startsWith("ret_");
      case "subscription":
        return e.startsWith("sub_");
      default:
        throw new Error(`Unknown session type: ${t}`);
    }
  }
  getIsLocal() {
    return typeof window < "u" && window.RENUMERATE_LOCAL === !0;
  }
  /**
   * Private: Inject the stylesheet into the document head
   */
  injectStylesheet() {
    if (typeof document > "u")
      return;
    const e = document.createElement("style");
    e.type = "text/css", e.setAttribute("data-renumerate-dialog-styles", "true"), e.innerHTML = `
			.renumerate-dialog {
				position: fixed;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
				width: 800px;
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
				min-width: 653px;
			}

			.renumerate-dialog-content iframe {
				width: 100%;
				height: 100%;
				min-height: 160px;
				min-width: 600px;
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
    `, document.head.appendChild(e);
  }
  /**
   * Private: Add a listener for messages from the iframe
   */
  addListener() {
    window.addEventListener("message", (e) => {
      if (!(this.getIsLocal() ? ["http://localhost:3000", "http://localhost:4321"] : ["https://retention.renumerate.com", "https://subs.renumerate.com"]).includes(e.origin)) {
        console.warn(
          "Received message from unauthorized origin:",
          e.origin
        );
        return;
      }
      const { type: n, data: i } = e.data;
      switch (n) {
        case "cancel-subscription": {
          this.showRetentionView(i.sessionId);
          return;
        }
        case "resize": {
          this.retentionIframe && i.height && typeof i.height == "number" && i.height > 0 && (this.retentionIframe.style.height = `${i.height}px`);
          return;
        }
        default:
          console.warn(`Unknown message type: ${n}`);
      }
    });
  }
  /**
   * Private: Get the target URL
   * @param type The type of session ("retention" or "subscription")
   */
  buildUrl(e) {
    const t = this.getIsLocal(), r = (n, i) => `${n}?session_id=${i}`;
    switch (e.target) {
      case "retention":
        return r(t ? "http://localhost:4321/retention" : "https://retention.renumerate.com", e.sessionId);
      case "subscription":
        return r(t ? "http://localhost:4321/subs" : "https://subs.renumerate.com", e.sessionId);
      case "event":
        return t ? "http://localhost:4321/event/" : "https://renumerate.com/event/";
      default:
        throw new Error(`Unknown type: ${e}`);
    }
  }
}
export {
  l as Renumerate
};
