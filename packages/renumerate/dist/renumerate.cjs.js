"use strict";var d=Object.defineProperty;var c=(o,e,t)=>e in o?d(o,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):o[e]=t;var a=(o,e,t)=>c(o,typeof e!="symbol"?e+"":e,t);Object.defineProperty(exports,Symbol.toStringTag,{value:"Module"});class l{constructor(e){a(this,"config");this.config=e,this.injectStylesheet(),this.addListener()}registerEvent(e,t={}){this.config.debug&&console.info(`Registering event: ${e}`,t)}mountCancelButton(e,t,i=""){if(document.querySelector("style[data-renumerate-modal-styles]")||this.injectStylesheet(),!this.isSessionType(t,"retention"))throw new Error(`Invalid sessionId: ${t}. Expected a retention session ID.`);const n=document.createElement("button");n.textContent="Cancel Subscription",n.addEventListener("click",()=>{this.showRetentionView(t)}),i?n.className=i:n.className="renumerate-cancel-btn";const r=document.getElementById(e);if(!r)throw new Error(`Element with id ${e} not found`);r.appendChild(n)}showRetentionView(e){if(document.querySelector("style[data-renumerate-modal-styles]")||this.injectStylesheet(),!this.isSessionType(e,"retention")&&!this.isSessionType(e,"subscription"))throw new Error(`Invalid sessionId: ${e}. Expected a retention or subscription session ID.`);const t=document.createElement("dialog");t.className="renumerate-dialog";const i=document.createElement("button");i.className="renumerate-dialog-close",i.innerHTML="&times;",i.setAttribute("aria-label","Close"),t.appendChild(i),i.addEventListener("click",()=>{t.close()});const n=document.createElement("div");n.className="renumerate-dialog-content";const r=document.createElement("iframe");return r.src=this.buildUrl({target:"retention",sessionId:e}),n.appendChild(r),t.appendChild(n),n.prepend(i),document.body.appendChild(t),t.showModal(),t.addEventListener("close",()=>{t.remove()}),t}mountSubscriptionHub(e,t,i=""){if(document.querySelector("style[data-renumerate-modal-styles]")||this.injectStylesheet(),!this.isSessionType(t,"subscription"))throw new Error(`Invalid sessionId: ${t}. Expected a subscription session ID.`);const n=document.createElement("div");n.className=i||"renumerate-subscription-hub";const r=document.getElementById(e);if(!r)throw new Error(`Element with id ${e} not found`);r.appendChild(n);const s=document.createElement("iframe");return s.src=this.getSubscriptionHubUrl(t),s.width="100%",s.height="300px",n.appendChild(s),n}getSubscriptionHubUrl(e){if(!this.isSessionType(e,"subscription"))throw new Error(`Invalid sessionId: ${e}. Expected a subscription session ID.`);return this.buildUrl({target:"subscription",sessionId:e})}isSessionType(e,t){switch(t){case"retention":return e.startsWith("ret_");case"subscription":return e.startsWith("sub_");default:throw new Error(`Unknown session type: ${t}`)}}injectStylesheet(){if(typeof document>"u")return;const e=document.createElement("style");e.type="text/css",e.setAttribute("data-renumerate-dialog-styles","true"),e.innerHTML=`
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
    `,document.head.appendChild(e)}addListener(){window.addEventListener("message",e=>{if(!["https://renumerate.com"].includes(e.origin)){console.warn("Received message from unauthorized origin:",e.origin);return}const{type:i,data:n}=e.data;i==="cancel-subscription"&&this.showRetentionView(n.sessionId)})}buildUrl(e){const t=typeof window<"u"&&window.RENUMERATE_LOCAL===!0;switch(e.target){case"retention":return`${t?"http://localhost:3000/retention?session_id=":"https://retention.renumerate.com/"}${e.sessionId}`;case"subscription":return`${t?"http://localhost:3000/subs?session_id=":"https://subs.renumerate.com/"}${e.sessionId}`;case"event":return t?"http://localhost:3000/event/":"https://renumerate.com/event/";default:throw new Error(`Unknown type: ${e}`)}}}exports.Renumerate=l;
