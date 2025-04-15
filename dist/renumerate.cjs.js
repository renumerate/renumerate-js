"use strict";var d=Object.defineProperty;var c=(o,e,t)=>e in o?d(o,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):o[e]=t;var s=(o,e,t)=>c(o,typeof e!="symbol"?e+"":e,t);Object.defineProperty(exports,Symbol.toStringTag,{value:"Module"});class l{constructor(e){s(this,"config");this.config=e,this.injectStylesheet(),this.addListener()}registerEvent(e,t={}){this.config.debug&&console.info(`Registering event: ${e}`,t)}mountCancelButton(e,t,r=""){if(document.querySelector("style[data-renumerate-modal-styles]")||this.injectStylesheet(),!this.isSessionType(t,"retention"))throw new Error(`Invalid sessionId: ${t}. Expected a retention session ID.`);const n=document.createElement("button");n.textContent="Cancel Subscription",n.addEventListener("click",()=>{this.showRetentionView(t)}),r?n.className=r:n.className="renumerate-cancel-btn";const i=document.getElementById(e);if(!i)throw new Error(`Element with id ${e} not found`);i.appendChild(n)}showRetentionView(e){if(document.querySelector("style[data-renumerate-modal-styles]")||this.injectStylesheet(),!this.isSessionType(e,"retention")&&!this.isSessionType(e,"subscription"))throw new Error(`Invalid sessionId: ${e}. Expected a retention or subscription session ID.`);const t=document.createElement("dialog");t.className="renumerate-dialog";const r=document.createElement("button");r.className="renumerate-dialog-close",r.innerHTML="&times;",r.setAttribute("aria-label","Close"),t.appendChild(r),r.addEventListener("click",()=>{t.close()});const n=document.createElement("div");return n.className="renumerate-dialog-content",n.innerHTML=`
      <iframe src="https://renumerate.com/cancellation/${e}" frameborder="0"></iframe>
    `,t.appendChild(n),document.body.appendChild(t),t.showModal(),t.addEventListener("close",()=>{t.remove()}),t}mountSubscriptionHub(e,t,r=""){if(document.querySelector("style[data-renumerate-modal-styles]")||this.injectStylesheet(),!this.isSessionType(t,"subscription"))throw new Error(`Invalid sessionId: ${t}. Expected a subscription session ID.`);const n=document.createElement("div");n.className=r||"renumerate-subscription-hub";const i=document.getElementById(e);if(!i)throw new Error(`Element with id ${e} not found`);i.appendChild(n);const a=document.createElement("iframe");return a.src=`https://renumerate.com/subscription/${t}`,a.width="100%",a.height="300px",n.appendChild(a),n}isSessionType(e,t){switch(t){case"retention":return e.startsWith("ret_");case"subscription":return e.startsWith("sub_");default:throw new Error(`Unknown session type: ${t}`)}}injectStylesheet(){if(typeof document>"u")return;const e=document.createElement("style");e.type="text/css",e.setAttribute("data-renumerate-dialog-styles","true"),e.innerHTML=`
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
    `,document.head.appendChild(e)}addListener(){window.addEventListener("message",e=>{if(!["https://renumerate.com"].includes(e.origin)){console.warn("Received message from unauthorized origin:",e.origin);return}const{type:r,data:n}=e.data;r==="cancel-subscription"&&this.showRetentionView(n.sessionId)})}}exports.Renumerate=l;
