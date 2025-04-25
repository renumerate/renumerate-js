var d = Object.defineProperty;
var c = (o, e, t) => e in o ? d(o, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : o[e] = t;
var s = (o, e, t) => c(o, typeof e != "symbol" ? e + "" : e, t);
class m {
  constructor(e) {
    s(this, "config");
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
    if (document.querySelector("style[data-renumerate-modal-styles]") || this.injectStylesheet(), !this.isSessionType(e, "retention") && !this.isSessionType(e, "subscription"))
      throw new Error(
        `Invalid sessionId: ${e}. Expected a retention or subscription session ID.`
      );
    const t = document.createElement("dialog");
    t.className = "renumerate-dialog";
    const r = document.createElement("button");
    r.className = "renumerate-dialog-close", r.innerHTML = "&times;", r.setAttribute("aria-label", "Close"), t.appendChild(r), r.addEventListener("click", () => {
      t.close();
    });
    const n = document.createElement("div");
    return n.className = "renumerate-dialog-content", n.innerHTML = `
			<iframe src="https://renumerate.com/cancellation/${e}" frameborder="0"></iframe>
				`, t.appendChild(n), n.prepend(r), document.body.appendChild(t), t.showModal(), t.addEventListener("close", () => {
      t.remove();
    }), t;
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
    i.appendChild(n);
    const a = document.createElement("iframe");
    return a.src = `https://renumerate.com/subscription/${t}`, a.width = "100%", a.height = "300px", n.appendChild(a), n;
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
          min-width: 100vw;
          min-height: 100vh;
          width: 800px;
          max-width: 90%;
          max-height: 90%;
          border: none;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          padding: 0px;
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex; /* Use flexbox for full height */
          flex-direction: column;
		  align-items: center;
		  justify-content: center;
		  
          /* Default light mode */
          background-color: white;
          color: black;
      }

      .renumerate-dialog::backdrop {
          background-color: rgba(0,0,0,0.5);
      }

      .renumerate-dialog-close {
		  padding-top: 20px;
		  padding-right: 20px;
          background: none;
          border: none;
		  font-weight: 30;
          font-size: 32px;
          line-height: 1;
          cursor: pointer;
          color: #666;
		  align-self: flex-end;
      }

      .renumerate-dialog-close:hover {
          color: #000;
      }

      .renumerate-dialog-content {
          display: flex;
          flex-direction: column;
          overflow: hidden;
		  justify-content: center;
		  border-radius: 8px;
		  items-align: center;
		  align-items: center;
		  background-color: #fcfbf9;
		  box-shadow: rgba(17, 12, 46, 0.15) 0px 48px 100px 0px;
      }

      .renumerate-dialog-content iframe {
          flex-grow: 1;
          width: 100%;
          height: 100%;
		  min-height: 400px;
		  min-width: 600px;
          border: none;
          margin: 0;
          padding: 0;
      }

      /* Dark mode via media query */
      @media (prefers-color-scheme: dark) {
          .renumerate-dialog {
              background-color:rgba(0, 0, 0, 0);
              color: #f0f0f0;
              border-color: #444;
          }

          .renumerate-dialog-close {
              color: #000000;
          }

          .renumerate-dialog-close:hover {
              color: #;
          }

          .renumerate-dialog::backdrop {
              background-color: rgba(0, 0, 0, 0.04);
          }
      }

      /* Responsive Media Queries */
      @media screen and (max-width: 1024px) {
          .renumerate-dialog {
              min-width: 600px;
              width: 90vw;
          }
      }

      @media screen and (max-width: 768px) {
          .renumerate-dialog {
              min-width: 95vw;
              width: 95vw;
              max-width: 95vw;
          }

          .renumerate-dialog-close {
              font-size: 20px;
              top: 5px;
              right: 5px;
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
          }

          .renumerate-dialog-close {
              font-size: 18px;
              top: 3px;
              right: 3px;
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
      const { type: r, data: n } = e.data;
      r === "cancel-subscription" && this.showRetentionView(n.sessionId);
    });
  }
}
export {
  m as Renumerate
};
