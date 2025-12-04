var b = Object.defineProperty;
var w = (u, e, t) => e in u ? b(u, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : u[e] = t;
var l = (u, e, t) => w(u, typeof e != "symbol" ? e + "" : e, t);
class f {
  constructor(e) {
    l(this, "config");
    l(this, "retentionDialog", null);
    l(this, "retentionIframe", null);
    l(this, "subscriptionIframe", null);
    l(this, "styleSheet", null);
    l(this, "windowListener", null);
    l(this, "activeCallbacks", {});
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
      return new f(e);
    if (window.RENUMERATE_INSTANCE) {
      const n = window.RENUMERATE_INSTANCE;
      return n.updateConfig(e), n;
    }
    const t = new f(e);
    return window.RENUMERATE_INSTANCE = t, t;
  }
  /**
   * Update the configuration of the Renumerate instance
   */
  updateConfig(e) {
    this.config = {
      ...this.config,
      ...e
    }, this.config.debug && console.info("Config updated:", this.config);
  }
  /**
   * Mount a cancel button for a subscriber
   * @param elementId Element ID to mount the button
   * @param sessionId Mandatory customer session identifier
   * @param options Options object or classes string
   */
  mountCancelButton(e, t, n) {
    let i = {};
    if (typeof n == "string" ? i.classes = n : n && (i = n), !this.isSessionType(t, "retention"))
      throw new Error(
        `Invalid sessionId: ${t}. Expected a retention session ID.`
      );
    const r = document.createElement("button");
    r.textContent = "Cancel Subscription", r.addEventListener("click", () => {
      const s = {
        onComplete: i.onComplete,
        onRetained: i.onRetained,
        onCancelled: i.onCancelled
      };
      this.showRetentionView(t, s);
    }), i.classes ? r.className = i.classes : r.className = "renumerate-cancel-btn";
    const o = document.getElementById(e);
    if (!o)
      throw new Error(`Element with id ${e} not found`);
    o.appendChild(r);
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
      var o;
      (o = this.retentionDialog) == null || o.close();
    });
    const i = document.createElement("div");
    i.className = "renumerate-dialog-content", this.retentionIframe = document.createElement("iframe"), this.retentionIframe.src = this.buildUrl({
      target: "retention",
      sessionId: e
    });
    const r = setTimeout(() => {
      this.config.debug && console.warn("Retention iframe timed out after 10 seconds"), this.retentionIframe && this.showRetentionError(i, this.retentionIframe);
    }, 1e4);
    return this.retentionIframe.addEventListener("load", () => {
      clearTimeout(r);
    }), i.appendChild(this.retentionIframe), this.retentionDialog.appendChild(i), i.prepend(n), document.body.appendChild(this.retentionDialog), this.retentionDialog.showModal(), n.blur(), this.retentionDialog.addEventListener("close", () => {
      var h, d, m, p;
      clearTimeout(r), (d = (h = this.activeCallbacks).onComplete) == null || d.call(h), this.activeCallbacks = {};
      const s = this.getIsLocal() ? "https://localhost:4321" : "https://subs.renumerate.com";
      try {
        Array.from(document.getElementsByTagName("iframe")).forEach((c) => {
          const g = c.getAttribute("src") || "";
          (g.includes("subs.renumerate.com") || g.includes("localhost:4321/subs")) && c.contentWindow && c.contentWindow.postMessage(
            { type: "on-complete", data: {} },
            s
          );
        });
      } catch (a) {
        (m = this.config) != null && m.debug && console.warn("Error sending on-complete to iframes:", a);
      } finally {
        (p = this.retentionDialog) == null || p.remove();
      }
    }), this.retentionDialog;
  }
  /**
   * Private: Show error content when retention iframe fails to load
   */
  showRetentionError(e, t) {
    if (this.config.debug && console.warn("Retention iframe failed to load, showing fallback content"), e.querySelector(".renumerate-error-content"))
      return;
    t.style.display = "none";
    const n = document.createElement("div");
    n.className = "renumerate-error-content";
    const { fallbackEmail: i } = this.config;
    n.innerHTML = `
			<h2>We're sorry!</h2>
			<p>We're having trouble loading the cancellation form.</p>
			${i ? `<p>Please email us at <a href="mailto:${i}">${i}</a> to cancel your subscription.</p>` : "<p>Please contact support to cancel your subscription.</p>"}
		`, e.appendChild(n);
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
  mountSubscriptionHub(e, t, n = "", i = "", r) {
    if (!this.isSessionType(t, "subscription"))
      throw new Error(
        `Invalid sessionId: ${t}. Expected a subscription session ID.`
      );
    r && (this.activeCallbacks = {
      ...this.config.callbacks,
      ...r
    });
    const o = document.createElement("div");
    o.className = n || "renumerate-subscription-hub";
    const s = document.getElementById(e);
    if (!s)
      throw new Error(`Element with id ${e} not found`);
    return s.appendChild(o), this.subscriptionIframe = document.createElement("iframe"), this.subscriptionIframe.src = this.getSubscriptionHubUrl(t), this.subscriptionIframe.className = i || "renumerate-subscription-hub-iframe", this.subscriptionIframe.title = "SubscriptionHub", this.subscriptionIframe.setAttribute("allow", "publickey-credentials-get"), this.subscriptionIframe.setAttribute("data-renumerate-subhub", "true"), o.appendChild(this.subscriptionIframe), o;
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
  /**
   * Private: Show error content when subscription hub iframe fails to load
   */
  showSubscriptionHubError(e, t) {
    this.config.debug && console.warn(
      "Subscription hub iframe failed to load, showing fallback content"
    ), t.style.display = "none";
    const n = document.createElement("div");
    n.className = "renumerate-error-content", n.innerHTML = `
            <h2>We're sorry!</h2>
            <p>We're having trouble loading your subscription information.</p>
			<p>We've been notified and we'll have this right up again shortly! In the meantime contact support for any urgent issues</p>
        `, e.appendChild(n);
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
    this.styleSheet = document.createElement("style"), this.styleSheet.setAttribute("data-renumerate-dialog-styles", "true"), this.styleSheet.innerHTML = `
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
    `, document.head.appendChild(this.styleSheet);
  }
  /**
   * Private: Add a listener for messages from the iframe
   */
  addListener() {
    this.config.debug && console.info("Adding message listener for Renumerate"), this.windowListener = (e) => {
      var o, s, h, d, m, p;
      if (this.config.debug && console.info("Received message:", e.data), !(this.getIsLocal() ? ["https://localhost:4321"] : ["https://retention.renumerate.com", "https://subs.renumerate.com"]).includes(e.origin)) {
        this.config.debug && console.warn(
          "Received message from unauthorized origin:",
          e.origin
        );
        return;
      }
      const { type: i, data: r } = e.data;
      switch (i) {
        case "catastrophic-failure": {
          if (this.config.debug && console.error(
            "Received catastrophic-failure from iframe:",
            r.iframe
          ), r.iframe === "retention" && this.retentionDialog && this.retentionIframe) {
            const c = this.retentionDialog.querySelector(
              ".renumerate-dialog-content"
            );
            c && this.showRetentionError(c, this.retentionIframe);
          }
          const a = document.querySelector(
            '[data-renumerate-subhub="true"]'
          );
          if (r.iframe === "subscription" && a) {
            const c = a.parentElement;
            c && this.showSubscriptionHubError(c, a);
          }
          return;
        }
        case "cancel-subscription": {
          this.showRetentionView(r.sessionId, this.activeCallbacks);
          return;
        }
        case "resize": {
          const a = r.iframe === "subscription" ? document.querySelector(
            '[data-renumerate-subhub="true"]'
          ) : this.retentionIframe;
          a && r.height && typeof r.height == "number" && r.height > 0 && (a.style.height = `${r.height}px`);
          return;
        }
        case "close-dialog": {
          this.retentionDialog && this.retentionDialog.close();
          return;
        }
        case "on-complete": {
          (s = (o = this.activeCallbacks).onComplete) == null || s.call(o);
          return;
        }
        case "on-retained": {
          (d = (h = this.activeCallbacks).onRetained) == null || d.call(h);
          return;
        }
        case "on-cancelled": {
          (p = (m = this.activeCallbacks).onCancelled) == null || p.call(m);
          return;
        }
        default:
          this.config.debug && console.warn(`Unknown message type: ${i}`);
      }
    }, window.addEventListener("message", this.windowListener);
  }
  /**
   * Private: Get the target URL
   * @param type The type of session ("retention" or "subscription")
   */
  buildUrl(e) {
    const t = this.getIsLocal(), n = (i, r) => `${i}?session_id=${r}`;
    switch (e.target) {
      case "retention":
        return n(t ? "https://localhost:4321/retention" : "https://retention.renumerate.com", e.sessionId);
      case "subscription":
        return n(t ? "https://localhost:4321/subs" : "https://subs.renumerate.com", e.sessionId);
      case "event":
        return t ? "https://localhost:4321/event/" : "https://api.renumerate.com/v1/events/";
      default:
        throw new Error(`Unknown type: ${e}`);
    }
  }
}
export {
  f as Renumerate
};
