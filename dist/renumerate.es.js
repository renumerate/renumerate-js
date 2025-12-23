var S = Object.defineProperty;
var y = (l, e, n) => e in l ? S(l, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : l[e] = n;
var r = (l, e, n) => y(l, typeof e != "symbol" ? e + "" : e, n);
const g = "renumerate_sdk_session";
class I {
  constructor(e, n = !1) {
    r(this, "session", null);
    r(this, "getAuthToken");
    r(this, "debug");
    r(this, "refreshPromise", null);
    this.getAuthToken = e, this.debug = n, this.loadFromStorage();
  }
  /**
   * Update the getAuthToken function (called when config changes)
   */
  updateGetAuthToken(e) {
    this.getAuthToken = e;
  }
  /**
   * Load session from sessionStorage if valid
   */
  loadFromStorage() {
    if (!(typeof window > "u"))
      try {
        const e = sessionStorage.getItem(g);
        if (e) {
          const n = JSON.parse(e), t = Math.floor(Date.now() / 1e3);
          n.expiresAt > t + 6e4 / 1e3 ? this.session = n : sessionStorage.removeItem(g);
        }
      } catch {
      }
  }
  /**
   * Save session to sessionStorage
   */
  saveToStorage() {
    if (!(typeof window > "u" || !this.session))
      try {
        sessionStorage.setItem(g, JSON.stringify(this.session));
      } catch {
      }
  }
  /**
   * Get current session, performing token exchange if needed
   */
  async getSession() {
    if (this.session) {
      const e = Math.floor(Date.now() / 1e3);
      if (this.session.expiresAt > e + 6e4 / 1e3)
        return this.debug && console.info("Using cached session:", this.session.sessionId), this.session;
      this.debug && console.info("Cached session expired, refreshing...");
    }
    if (this.refreshPromise)
      return this.debug && console.info("Session refresh already in progress, waiting..."), this.refreshPromise;
    this.refreshPromise = this.refreshSession();
    try {
      return await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }
  /**
   * Force refresh the session (perform token exchange)
   */
  async refreshSession() {
    var i;
    const e = await this.getAuthToken(), n = await fetch(this.getApiUrl("/v1/session/exchange"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handshakeToken: e })
    });
    if (!n.ok) {
      const o = ((i = (await n.json().catch(() => ({}))).error) == null ? void 0 : i.message) || "Session exchange failed";
      throw new Error(o);
    }
    const t = await n.json();
    return this.session = {
      sessionId: t.session.sessionId,
      expiresAt: t.session.expiresAt
    }, this.saveToStorage(), this.debug && console.info("SDK session established:", this.session.sessionId), this.session;
  }
  /**
   * Get Authorization header value for API requests
   */
  getAuthHeader() {
    return this.session ? `Bearer ${this.session.sessionId}` : null;
  }
  /**
   * Get headers object for fetch requests
   */
  getAuthHeaders() {
    const e = this.getAuthHeader();
    return e ? { Authorization: e } : {};
  }
  /**
   * Check if session is currently valid
   */
  isSessionValid() {
    if (!this.session) return !1;
    const e = Math.floor(Date.now() / 1e3);
    return this.session.expiresAt > e + 6e4 / 1e3;
  }
  /**
   * Clear session from memory and storage
   */
  clearSession() {
    if (this.session = null, typeof window < "u")
      try {
        sessionStorage.removeItem(g);
      } catch {
      }
  }
  /**
   * Get current session without fetching (returns null if not loaded)
   */
  getCurrentSession() {
    return this.session;
  }
  /**
   * Get API base URL based on environment
   */
  getApiUrl(e) {
    return `${typeof window < "u" && window.RENUMERATE_LOCAL === !0 ? "https://localhost:4321" : "https://api.renumerate.com"}${e}`;
  }
}
function w(l) {
  return l.startsWith("r10_");
}
class p {
  constructor(e) {
    r(this, "config");
    r(this, "retentionDialog", null);
    r(this, "retentionIframe", null);
    r(this, "subscriptionIframe", null);
    r(this, "styleSheet", null);
    r(this, "windowListener", null);
    r(this, "activeCallbacks", {});
    r(this, "sessionManager");
    this.config = e, this.sessionManager = new I(
      e.getAuthToken,
      e.debug ?? !1
    ), !(typeof window > "u") && this.initialize();
  }
  /**
   * Set active callbacks for event handling
   */
  setCallbacks(e) {
    this.activeCallbacks = {
      ...this.config.callbacks,
      ...e
    };
  }
  /**
   * Force refresh the session (perform token exchange)
   */
  async refreshSession() {
    return this.sessionManager.refreshSession();
  }
  /**
   * Get or create a Renumerate instance
   */
  static getInstance(e) {
    if (typeof window > "u")
      return new p(e);
    if (window.RENUMERATE_INSTANCE) {
      const t = window.RENUMERATE_INSTANCE;
      return t.updateConfig(e), t;
    }
    const n = new p(e);
    return window.RENUMERATE_INSTANCE = n, n;
  }
  /**
   * Update the configuration of the Renumerate instance
   */
  updateConfig(e) {
    this.config = {
      ...this.config,
      ...e
    }, e.getAuthToken && this.sessionManager.updateGetAuthToken(e.getAuthToken), this.config.debug && console.info("Config updated:", this.config);
  }
  /**
   * Get current SDK session (establishes session if needed)
   */
  async getSession() {
    return this.sessionManager.getSession();
  }
  /**
   * Get current session without fetching (returns null if not established)
   */
  getCurrentSession() {
    return this.sessionManager.getCurrentSession();
  }
  /**
   * Clear the current session
   */
  clearSession() {
    this.sessionManager.clearSession();
  }
  /**
   * Mount a cancel button that opens retention view when clicked
   */
  mountCancelButton(e, n) {
    let t = {};
    typeof n == "string" ? t.classes = n : n && (t = n);
    const i = document.createElement("button");
    i.textContent = "Cancel Subscription", i.addEventListener("click", () => {
      const o = {
        onComplete: t.onComplete,
        onRetained: t.onRetained,
        onCancelled: t.onCancelled
      };
      this.showRetentionView(t.subscriptionId, o);
    }), t.classes ? i.className = t.classes : i.className = "renumerate-cancel-btn";
    const s = document.getElementById(e);
    if (!s)
      throw new Error(`Element with id ${e} not found`);
    s.appendChild(i);
  }
  /**
   * Show retention view (cancellation flow)
   * @param subscriptionId Optional - if undefined, uses first active subscription
   * @param callbacks Optional callbacks for retention events
   */
  async showRetentionView(e, n) {
    this.setCallbacks(n);
    const t = await this.getSession();
    this.openRetentionDialog(t.sessionId, e);
  }
  /**
   * Mount the SubscriptionHub
   */
  async mountSubscriptionHub(e, n = "", t = "", i) {
    const s = await this.getSession();
    i && (this.activeCallbacks = {
      ...this.config.callbacks,
      ...i
    });
    const o = document.createElement("div");
    o.className = n || "renumerate-subscription-hub";
    const h = document.getElementById(e);
    if (!h)
      throw new Error(`Element with id ${e} not found`);
    return h.appendChild(o), this.subscriptionIframe = document.createElement("iframe"), this.subscriptionIframe.src = this.buildUrl({
      target: "subscription",
      sessionId: s.sessionId
    }), this.subscriptionIframe.className = t || "renumerate-subscription-hub-iframe", this.subscriptionIframe.title = "SubscriptionHub", this.subscriptionIframe.setAttribute(
      "allow",
      "publickey-credentials-get; payment"
    ), this.subscriptionIframe.setAttribute("data-renumerate-subhub", "true"), o.appendChild(this.subscriptionIframe), o;
  }
  /**
   * Get subscription hub URL
   */
  async getSubscriptionHubUrl() {
    const e = await this.getSession();
    return this.buildUrl({
      target: "subscription",
      sessionId: e.sessionId
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
   * Private: Open retention dialog with session ID
   */
  openRetentionDialog(e, n) {
    if (!w(e))
      throw new Error(
        `Invalid session ID format. Expected r10_ prefix, got: ${e}`
      );
    this.retentionDialog = document.createElement("dialog"), this.retentionDialog.className = "renumerate-dialog";
    const t = document.createElement("button");
    t.className = "renumerate-dialog-close", t.innerHTML = "&times;", t.setAttribute("aria-label", "Close"), this.retentionDialog.appendChild(t), t.addEventListener("click", () => {
      var o;
      (o = this.retentionDialog) == null || o.close();
    });
    const i = document.createElement("div");
    i.className = "renumerate-dialog-content", this.retentionIframe = document.createElement("iframe"), this.retentionIframe.src = this.buildUrl({
      target: "retention",
      sessionId: e,
      subscriptionId: n
    });
    const s = setTimeout(() => {
      this.config.debug && console.warn("Retention iframe timed out after 10 seconds"), this.retentionIframe && this.showRetentionError(i, this.retentionIframe);
    }, 1e4);
    return this.retentionIframe.addEventListener("load", () => {
      clearTimeout(s);
    }), i.appendChild(this.retentionIframe), this.retentionDialog.appendChild(i), i.prepend(t), document.body.appendChild(this.retentionDialog), this.retentionDialog.showModal(), t.blur(), this.retentionDialog.addEventListener("close", () => {
      var d, u, f, m;
      clearTimeout(s), (u = (d = this.activeCallbacks).onComplete) == null || u.call(d), this.activeCallbacks = {};
      const h = this.getIsLocal() ? "https://localhost:4321" : "https://subs.renumerate.com";
      try {
        const a = Array.from(document.getElementsByTagName("iframe"));
        for (const c of a) {
          const b = c.getAttribute("src") || "";
          (b.includes("subs.renumerate.com") || b.includes("localhost:4321/subs")) && c.contentWindow && c.contentWindow.postMessage(
            { type: "on-complete", data: {} },
            h
          );
        }
      } catch (a) {
        (f = this.config) != null && f.debug && console.warn("Error sending on-complete to iframes:", a);
      } finally {
        (m = this.retentionDialog) == null || m.remove();
      }
    }), this.retentionDialog;
  }
  /**
   * Private: Show error content when retention iframe fails to load
   */
  showRetentionError(e, n) {
    if (this.config.debug && console.warn("Retention iframe failed to load, showing fallback content"), e.querySelector(".renumerate-error-content"))
      return;
    n.style.display = "none";
    const t = document.createElement("div");
    t.className = "renumerate-error-content";
    const { fallbackEmail: i } = this.config;
    t.innerHTML = `
			<h2>We're sorry!</h2>
			<p>We're having trouble loading the cancellation form.</p>
			${i ? `<p>Please email us at <a href="mailto:${i}">${i}</a> to cancel your subscription.</p>` : "<p>Please contact support to cancel your subscription.</p>"}
		`, e.appendChild(t);
  }
  /**
   * Private: Show error content when subscription hub iframe fails to load
   */
  showSubscriptionHubError(e, n) {
    this.config.debug && console.warn(
      "Subscription hub iframe failed to load, showing fallback content"
    ), n.style.display = "none";
    const t = document.createElement("div");
    t.className = "renumerate-error-content", t.innerHTML = `
            <h2>We're sorry!</h2>
            <p>We're having trouble loading your subscription information.</p>
			<p>We've been notified and we'll have this right up again shortly! In the meantime contact support for any urgent issues</p>
        `, e.appendChild(t);
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
      var o, h, d, u, f, m;
      if (this.config.debug && console.info("Received message:", e.data), !(this.getIsLocal() ? ["https://localhost:4321"] : ["https://retention.renumerate.com", "https://subs.renumerate.com"]).includes(e.origin)) {
        this.config.debug && console.warn(
          "Received message from unauthorized origin:",
          e.origin
        );
        return;
      }
      const { type: i, data: s } = e.data;
      switch (i) {
        case "catastrophic-failure": {
          if (this.config.debug && console.error(
            "Received catastrophic-failure from iframe:",
            s.iframe
          ), s.iframe === "retention" && this.retentionDialog && this.retentionIframe) {
            const c = this.retentionDialog.querySelector(
              ".renumerate-dialog-content"
            );
            c && this.showRetentionError(c, this.retentionIframe);
          }
          const a = document.querySelector(
            '[data-renumerate-subhub="true"]'
          );
          if (s.iframe === "subscription" && a) {
            const c = a.parentElement;
            c && this.showSubscriptionHubError(c, a);
          }
          return;
        }
        case "cancel-subscription": {
          s.sessionId && w(s.sessionId) ? (this.setCallbacks(this.activeCallbacks), this.openRetentionDialog(s.sessionId, s.subscriptionId)) : this.config.debug && console.warn("Invalid session ID received from iframe:", s.sessionId);
          return;
        }
        case "resize": {
          const a = s.iframe === "subscription" ? document.querySelector(
            '[data-renumerate-subhub="true"]'
          ) : this.retentionIframe;
          a && s.height && typeof s.height == "number" && s.height > 0 && (a.style.height = `${s.height}px`);
          return;
        }
        case "close-dialog": {
          this.retentionDialog && this.retentionDialog.close();
          return;
        }
        case "on-complete": {
          (h = (o = this.activeCallbacks).onComplete) == null || h.call(o);
          return;
        }
        case "on-retained": {
          (u = (d = this.activeCallbacks).onRetained) == null || u.call(d);
          return;
        }
        case "on-cancelled": {
          (m = (f = this.activeCallbacks).onCancelled) == null || m.call(f);
          return;
        }
        default:
          this.config.debug && console.warn(`Unknown message type: ${i}`);
      }
    }, window.addEventListener("message", this.windowListener);
  }
  /**
   * Private: Get the target URL
   */
  buildUrl(e) {
    const n = this.getIsLocal();
    switch (e.target) {
      case "retention": {
        const t = n ? "https://localhost:4321/retention" : "https://retention.renumerate.com", i = new URL(t);
        return i.searchParams.set("session_id", e.sessionId), e.subscriptionId && i.searchParams.set("subscription_id", e.subscriptionId), i.toString();
      }
      case "subscription":
        return `${n ? "https://localhost:4321/subs" : "https://subs.renumerate.com"}?session_id=${e.sessionId}`;
    }
  }
}
export {
  p as Renumerate
};
