var p = Object.defineProperty;
var g = (l, e, t) => e in l ? p(l, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : l[e] = t;
var a = (l, e, t) => g(l, typeof e != "symbol" ? e + "" : e, t);
class c {
  constructor(e) {
    a(this, "config");
    a(this, "retentionDialog", null);
    a(this, "retentionIframe", null);
    a(this, "subscriptionIframe", null);
    a(this, "styleSheet", null);
    a(this, "windowListener", null);
    a(this, "activeCallbacks", {});
    this.config = e, !(typeof window > "u") && this.initialize();
  }
  setCallbacks(e) {
    this.activeCallbacks = {
      ...this.config.callbacks,
      ...e
    };
  }
  /**
   * Get or create a Renumerate instance
   * @param config Configuration for the Renumerate instance
   * @returns Renumerate instance
   */
  static getInstance(e) {
    if (typeof window > "u")
      return new c(e);
    if (window.RENUMERATE_INSTANCE) {
      const n = window.RENUMERATE_INSTANCE;
      return n.updateConfig(e), n;
    }
    const t = new c(e);
    return window.RENUMERATE_INSTANCE = t, t;
  }
  /**
   * Update the configuration of the Renumerate instance
   */
  updateConfig(e) {
    this.config = e;
  }
  /**
   * Mount a cancel button for a subscriber
   * @param elementId Element ID to mount the button
   * @param sessionId Mandatory customer session identifier
   * @param options Options object or classes string
   */
  mountCancelButton(e, t, n) {
    let o = {};
    if (typeof n == "string" ? o.classes = n : n && (o = n), !this.isSessionType(t, "retention"))
      throw new Error(
        `Invalid sessionId: ${t}. Expected a retention session ID.`
      );
    const i = document.createElement("button");
    i.textContent = "Cancel Subscription", i.addEventListener("click", () => {
      const r = {
        onComplete: o.onComplete,
        onRetained: o.onRetained,
        onCancelled: o.onCancelled
      };
      this.showRetentionView(t, r);
    }), o.classes ? i.className = o.classes : i.className = "renumerate-cancel-btn";
    const s = document.getElementById(e);
    if (!s)
      throw new Error(`Element with id ${e} not found`);
    s.appendChild(i);
  }
  /**
   * Show retention view for a customer
   * @param sessionId Mandatory customer session identifier
   */
  showRetentionView(e, t) {
    if (this.setCallbacks(t), !this.isSessionType(e, "retention") && !this.isSessionType(e, "subscription"))
      throw new Error(
        `Invalid sessionId: ${e}. Expected a retention or subscription session ID.`
      );
    this.retentionDialog = document.createElement("dialog"), this.retentionDialog.className = "renumerate-dialog";
    const n = document.createElement("button");
    n.className = "renumerate-dialog-close", n.innerHTML = "&times;", n.setAttribute("aria-label", "Close"), this.retentionDialog.appendChild(n), n.addEventListener("click", () => {
      var i;
      (i = this.retentionDialog) == null || i.close();
    });
    const o = document.createElement("div");
    return o.className = "renumerate-dialog-content", this.retentionIframe = document.createElement("iframe"), this.retentionIframe.src = this.buildUrl({
      target: "retention",
      sessionId: e
    }), o.appendChild(this.retentionIframe), this.retentionDialog.appendChild(o), o.prepend(n), document.body.appendChild(this.retentionDialog), this.retentionDialog.showModal(), n.blur(), this.retentionDialog.addEventListener("close", () => {
      var i, s, r;
      (s = (i = this.activeCallbacks).onComplete) == null || s.call(i), this.activeCallbacks = {}, (r = this.retentionDialog) == null || r.remove();
    }), this.retentionDialog;
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
  mountSubscriptionHub(e, t, n = "", o = "", i) {
    if (!this.isSessionType(t, "subscription"))
      throw new Error(
        `Invalid sessionId: ${t}. Expected a subscription session ID.`
      );
    i && (this.activeCallbacks = {
      ...this.config.callbacks,
      ...i
    });
    const s = document.createElement("div");
    s.className = n || "renumerate-subscription-hub";
    const r = document.getElementById(e);
    if (!r)
      throw new Error(`Element with id ${e} not found`);
    return r.appendChild(s), this.subscriptionIframe = document.createElement("iframe"), this.subscriptionIframe.src = this.getSubscriptionHubUrl(t), this.subscriptionIframe.className = o || "renumerate-subscription-hub-iframe", this.subscriptionIframe.title = "SubscriptionHub", s.appendChild(this.subscriptionIframe), s;
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
  /**
   * Set up the Renumerate instance
   */
  initialize() {
    this.config.debug && console.info("Renumerate initialized with config:", this.config), this.injectStylesheet(), this.addListener();
  }
  /**
   * Unmount renumerate components and clean up resources
   */
  cleanup() {
    this.config.debug && console.info("Renumerate cleaned up with config:", this.config), this.retentionDialog && (this.retentionDialog.remove(), this.retentionDialog = null), this.retentionIframe && (this.retentionIframe.remove(), this.retentionIframe = null), this.subscriptionIframe && (this.subscriptionIframe.remove(), this.subscriptionIframe = null), this.styleSheet && (this.styleSheet.remove(), this.styleSheet = null), this.windowListener && (window.removeEventListener("message", this.windowListener), this.windowListener = null);
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
    const e = document.querySelector(
      "style[data-renumerate-dialog-styles]"
    );
    if (e) {
      this.styleSheet = e;
      return;
    }
    this.styleSheet = document.createElement("style"), this.styleSheet.type = "text/css", this.styleSheet.setAttribute("data-renumerate-dialog-styles", "true"), this.styleSheet.innerHTML = `
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
    `, document.head.appendChild(this.styleSheet);
  }
  /**
   * Private: Add a listener for messages from the iframe
   */
  addListener() {
    this.config.debug && console.info("Adding message listener for Renumerate"), this.windowListener = (e) => {
      var s, r, d, h, u, m;
      if (this.config.debug && console.info("Received message:", e.data), !(this.getIsLocal() ? ["http://localhost:3000", "http://localhost:4321"] : ["https://retention.renumerate.com", "https://subs.renumerate.com"]).includes(e.origin)) {
        console.warn(
          "Received message from unauthorized origin:",
          e.origin
        );
        return;
      }
      const { type: o, data: i } = e.data;
      switch (o) {
        case "cancel-subscription": {
          this.showRetentionView(i.sessionId, this.activeCallbacks);
          return;
        }
        case "resize": {
          this.retentionIframe && i.height && typeof i.height == "number" && i.height > 0 && (this.retentionIframe.style.height = `${i.height}px`);
          return;
        }
        case "close-dialog": {
          this.retentionDialog && this.retentionDialog.close();
          return;
        }
        case "on-complete": {
          (r = (s = this.activeCallbacks).onComplete) == null || r.call(s);
          return;
        }
        case "on-retained": {
          (h = (d = this.activeCallbacks).onRetained) == null || h.call(d);
          return;
        }
        case "on-cancelled": {
          (m = (u = this.activeCallbacks).onCancelled) == null || m.call(u);
          return;
        }
        default:
          console.warn(`Unknown message type: ${o}`);
      }
    }, window.addEventListener("message", this.windowListener);
  }
  /**
   * Private: Get the target URL
   * @param type The type of session ("retention" or "subscription")
   */
  buildUrl(e) {
    const t = this.getIsLocal(), n = (o, i) => `${o}?session_id=${i}`;
    switch (e.target) {
      case "retention":
        return n(t ? "http://localhost:4321/retention" : "https://retention.renumerate.com", e.sessionId);
      case "subscription":
        return n(t ? "http://localhost:4321/subs" : "https://subs.renumerate.com", e.sessionId);
      case "event":
        return t ? "http://localhost:4321/event/" : "https://renumerate.com/event/";
      default:
        throw new Error(`Unknown type: ${e}`);
    }
  }
}
export {
  c as Renumerate
};
