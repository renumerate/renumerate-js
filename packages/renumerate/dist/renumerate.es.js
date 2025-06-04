var d = Object.defineProperty;
var c = (s, e, t) => e in s ? d(s, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : s[e] = t;
var a = (s, e, t) => c(s, typeof e != "symbol" ? e + "" : e, t);
class u {
  constructor(e) {
    a(this, "config");
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
  mountCancelButton(e, t, i = "") {
    if (document.querySelector("style[data-renumerate-modal-styles]") || this.injectStylesheet(), !this.isSessionType(t, "retention"))
      throw new Error(
        `Invalid sessionId: ${t}. Expected a retention session ID.`
      );
    const n = document.createElement("button");
    n.textContent = "Cancel Subscription", n.addEventListener("click", () => {
      this.showRetentionView(t);
    }), i ? n.className = i : n.className = "renumerate-cancel-btn";
    const r = document.getElementById(e);
    if (!r)
      throw new Error(`Element with id ${e} not found`);
    r.appendChild(n);
  }
  /**
   * Show retention view for a customer
   * @param sessionId Mandatory customer session identifier
   */
  showRetentionView(e) {
    if (document.querySelector("style[data-renumerate-modal-styles]") || this.injectStylesheet(), !this.isSessionType(e, "retention") && !this.isSessionType(e, "subscription"))
      throw new Error(
        `Invalid sessionId: ${e}. Expected a retention or subscription session ID.`
      );
    const t = document.createElement("dialog");
    t.className = "renumerate-dialog";
    const i = document.createElement("button");
    i.className = "renumerate-dialog-close", i.innerHTML = "&times;", i.setAttribute("aria-label", "Close"), t.appendChild(i), i.addEventListener("click", () => {
      t.close();
    });
    const n = document.createElement("div");
    n.className = "renumerate-dialog-content";
    const r = document.createElement("iframe");
    return r.src = this.buildUrl({
      target: "retention",
      sessionId: e
    }), n.appendChild(r), t.appendChild(n), n.prepend(i), document.body.appendChild(t), t.showModal(), t.addEventListener("close", () => {
      t.remove();
    }), t;
  }
  /**
   * Mount the SubscriptionHub for a customer
   * @param sessionId
   * @returns
   */
  mountSubscriptionHub(e, t, i = "") {
    if (document.querySelector("style[data-renumerate-modal-styles]") || this.injectStylesheet(), !this.isSessionType(t, "subscription"))
      throw new Error(
        `Invalid sessionId: ${t}. Expected a subscription session ID.`
      );
    const n = document.createElement("div");
    n.className = i || "renumerate-subscription-hub";
    const r = document.getElementById(e);
    if (!r)
      throw new Error(`Element with id ${e} not found`);
    r.appendChild(n);
    const s = document.createElement("iframe");
    return s.src = this.getSubscriptionHubUrl(t), s.width = "100%", s.height = "300px", n.appendChild(s), n;
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
				box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
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
      if (!["https://renumerate.com"].includes(e.origin)) {
        console.warn(
          "Received message from unauthorized origin:",
          e.origin
        );
        return;
      }
      const { type: i, data: n } = e.data;
      if (i === "cancel-subscription")
        this.showRetentionView(n.sessionId);
      else if (i === "resize") {
        const r = document.querySelector(
          "dialog.renumerate-dialog"
        );
        if (r) {
          const o = r.querySelector("iframe");
          o && e.data.height && typeof e.data.height == "number" && e.data.height > 0 && (o.style.height = `${e.data.height}px`);
        }
      }
    });
  }
  /**
   * Private: Get the target URL
   * @param type The type of session ("retention" or "subscription")
   */
  buildUrl(e) {
    const t = typeof window < "u" && window.RENUMERATE_LOCAL === !0;
    switch (e.target) {
      case "retention":
        return `${t ? "http://localhost:3000/retention?session_id=" : "https://retention.renumerate.com/"}${e.sessionId}`;
      case "subscription":
        return `${t ? "http://localhost:3000/subs?session_id=" : "https://subs.renumerate.com/"}${e.sessionId}`;
      case "event":
        return t ? "http://localhost:3000/event/" : "https://renumerate.com/event/";
      default:
        throw new Error(`Unknown type: ${e}`);
    }
  }
}
export {
  u as Renumerate
};
