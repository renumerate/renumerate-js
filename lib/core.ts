export interface RenumerateConfig {
  public_key: string;
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
  }

  /**
   * Private: Inject the stylesheet for the widget
   */
  private injectStylesheet() {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.setAttribute("data-renumerate-dialog-styles", "true");
    styleSheet.innerHTML = `
      .renumerate-dialog {
          min-width: 800px;
          min-height: 600px;
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
          
          /* Default light mode */
          background-color: white;
          color: black;
      }

      .renumerate-dialog::backdrop {
          background-color: rgba(0,0,0,0.5);
      }

      .renumerate-dialog-close {
          position: absolute;
          top: 0px;
          right: 5px;
          background: none;
          border: none;
          font-size: 24px;
          line-height: 1;
          cursor: pointer;
          color: #666;
      }

      .renumerate-dialog-close:hover {
          color: #000;
      }

      .renumerate-dialog-content {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          padding: 25px;
      }

      .renumerate-dialog-content iframe {
          flex-grow: 1;
          width: 100%;
          height: 100%;
          border: none;
          margin: 0;
          padding: 0;
      }

      /* Dark mode via media query */
      @media (prefers-color-scheme: dark) {
          .renumerate-dialog {
              background-color: #2c2c2c;
              color: #f0f0f0;
              border-color: #444;
          }

          .renumerate-dialog-close {
              color: #aaa;
          }

          .renumerate-dialog-close:hover {
              color: #fff;
          }

          .renumerate-dialog::backdrop {
              background-color: rgba(0,0,0,0.7);
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
    `;
    document.head.appendChild(styleSheet);
  }

  /**
   * Register an event with a name and optional data
   * @param event_name Name of the event to register
   * @param data Key-value pairs of event data
   */
  registerEvent(event_name: string, data: EventData = {}): void {
    if (this.config.debug)
      console.log(`Registering event: ${event_name}`, data);
  }

  /**
   * Mount a cancel button for a subscriber
   * @param subscriber_id Mandatory subscriber identifier
   * @param options Optional parameters for the cancel button
   */
  mountCancelButton(
    elementId: string,
    subscriber_id: string,
    classes: string = "",
    options: {
      subscription_id?: string;
      subscriber_data?: Record<string, any>;
      playbook_id?: string;
    } = {}
  ) {
    // Ensure styles are loaded
    if (!document.querySelector("style[data-renumerate-modal-styles]")) {
      this.injectStylesheet();
    }

    const button = document.createElement("button");
    button.textContent = "Cancel Subscription";
    button.setAttribute("data-subscriber-id", subscriber_id);

    button.addEventListener("click", () => {
      this.showRetentionView(subscriber_id, options);
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
   * Show retention view for a subscriber
   * @param subscriber_id Mandatory subscriber identifier
   * @param options Optional parameters for the retention view
   */
  showRetentionView(
    subscriber_id: string,
    options: {
      subscription_id?: string;
      subscriber_data?: Record<string, any>;
      playbook_id?: string;
    } = {}
  ): HTMLDialogElement {
    // Ensure styles are loaded
    if (!document.querySelector("style[data-renumerate-modal-styles]")) {
      this.injectStylesheet();
    }

    // Setup the iframe params
    const params = new URLSearchParams({
      public_key: this.config.public_key,
      subscriber_id: subscriber_id,
    });
    if (options.subscription_id) {
      params.append("subscription_id", options.subscription_id);
    }
    if (options.playbook_id) {
      params.append("playbook_id", options.playbook_id);
    }
    if (options.subscriber_data) {
      params.append("subscriber_data", JSON.stringify(options.subscriber_data));
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
      <iframe src="https://renumerate.com/cancellation?${params.toString()}" frameborder="0"></iframe>
    `;
    dialog.appendChild(content);

    document.body.appendChild(dialog);
    dialog.showModal();

    // Teardown
    dialog.addEventListener("close", () => {
      dialog.remove();
    });

    return dialog;
  }
}
