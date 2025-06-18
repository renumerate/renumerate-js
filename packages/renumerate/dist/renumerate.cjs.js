"use strict";var c=Object.defineProperty;var d=(s,e,t)=>e in s?c(s,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):s[e]=t;var o=(s,e,t)=>d(s,typeof e!="symbol"?e+"":e,t);Object.defineProperty(exports,Symbol.toStringTag,{value:"Module"});class a{constructor(e){o(this,"config");o(this,"retentionDialog",null);o(this,"retentionIframe",null);o(this,"subscriptionIframe",null);o(this,"styleSheet",null);o(this,"windowListener",null);this.config=e,!(typeof window>"u")&&this.initialize()}static getInstance(e){if(typeof window>"u")return new a(e);if(window.RENUMERATE_INSTANCE){const n=window.RENUMERATE_INSTANCE;return n.updateConfig(e),n}const t=new a(e);return window.RENUMERATE_INSTANCE=t,t}updateConfig(e){this.config=e}mountCancelButton(e,t,n=""){if(!this.isSessionType(t,"retention"))throw new Error(`Invalid sessionId: ${t}. Expected a retention session ID.`);const i=document.createElement("button");i.textContent="Cancel Subscription",i.addEventListener("click",()=>{this.showRetentionView(t)}),n?i.className=n:i.className="renumerate-cancel-btn";const r=document.getElementById(e);if(!r)throw new Error(`Element with id ${e} not found`);r.appendChild(i)}showRetentionView(e){if(!this.isSessionType(e,"retention")&&!this.isSessionType(e,"subscription"))throw new Error(`Invalid sessionId: ${e}. Expected a retention or subscription session ID.`);this.retentionDialog=document.createElement("dialog"),this.retentionDialog.className="renumerate-dialog";const t=document.createElement("button");t.className="renumerate-dialog-close",t.innerHTML="&times;",t.setAttribute("aria-label","Close"),this.retentionDialog.appendChild(t),t.addEventListener("click",()=>{var i;(i=this.retentionDialog)==null||i.close()});const n=document.createElement("div");return n.className="renumerate-dialog-content",this.retentionIframe=document.createElement("iframe"),this.retentionIframe.src=this.buildUrl({target:"retention",sessionId:e}),n.appendChild(this.retentionIframe),this.retentionDialog.appendChild(n),n.prepend(t),document.body.appendChild(this.retentionDialog),this.retentionDialog.showModal(),t.blur(),this.retentionDialog.addEventListener("close",()=>{var i;(i=this.retentionDialog)==null||i.remove()}),this.retentionDialog}mountSubscriptionHub(e,t,n="",i=""){if(!this.isSessionType(t,"subscription"))throw new Error(`Invalid sessionId: ${t}. Expected a subscription session ID.`);const r=document.createElement("div");r.className=n||"renumerate-subscription-hub";const l=document.getElementById(e);if(!l)throw new Error(`Element with id ${e} not found`);return l.appendChild(r),this.subscriptionIframe=document.createElement("iframe"),this.subscriptionIframe.src=this.getSubscriptionHubUrl(t),this.subscriptionIframe.className=i||"renumerate-subscription-hub-iframe",this.subscriptionIframe.title="SubscriptionHub",r.appendChild(this.subscriptionIframe),r}getSubscriptionHubUrl(e){if(!this.isSessionType(e,"subscription"))throw new Error(`Invalid sessionId: ${e}. Expected a subscription session ID.`);return this.buildUrl({target:"subscription",sessionId:e})}initialize(){this.config.debug&&console.info("Renumerate initialized with config:",this.config),this.injectStylesheet(),this.addListener()}cleanup(){this.config.debug&&console.info("Renumerate cleaned up with config:",this.config),this.retentionDialog&&(this.retentionDialog.remove(),this.retentionDialog=null),this.retentionIframe&&(this.retentionIframe.remove(),this.retentionIframe=null),this.subscriptionIframe&&(this.subscriptionIframe.remove(),this.subscriptionIframe=null),this.styleSheet&&(this.styleSheet.remove(),this.styleSheet=null),this.windowListener&&(window.removeEventListener("message",this.windowListener),this.windowListener=null)}isSessionType(e,t){switch(t){case"retention":return e.startsWith("ret_");case"subscription":return e.startsWith("sub_");default:throw new Error(`Unknown session type: ${t}`)}}getIsLocal(){return typeof window<"u"&&window.RENUMERATE_LOCAL===!0}injectStylesheet(){const e=document.querySelector("style[data-renumerate-dialog-styles]");if(e){this.styleSheet=e;return}this.styleSheet=document.createElement("style"),this.styleSheet.type="text/css",this.styleSheet.setAttribute("data-renumerate-dialog-styles","true"),this.styleSheet.innerHTML=`
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
    `,document.head.appendChild(this.styleSheet)}addListener(){this.config.debug&&console.info("Adding message listener for Renumerate"),this.windowListener=e=>{if(this.config.debug&&console.info("Received message:",e.data),!(this.getIsLocal()?["http://localhost:3000","http://localhost:4321"]:["https://retention.renumerate.com","https://subs.renumerate.com"]).includes(e.origin)){console.warn("Received message from unauthorized origin:",e.origin);return}const{type:i,data:r}=e.data;switch(i){case"cancel-subscription":{this.showRetentionView(r.sessionId);return}case"resize":{this.retentionIframe&&r.height&&typeof r.height=="number"&&r.height>0&&(this.retentionIframe.style.height=`${r.height}px`);return}default:console.warn(`Unknown message type: ${i}`)}},window.addEventListener("message",this.windowListener)}buildUrl(e){const t=this.getIsLocal(),n=(i,r)=>`${i}?session_id=${r}`;switch(e.target){case"retention":return n(t?"http://localhost:4321/retention":"https://retention.renumerate.com",e.sessionId);case"subscription":return n(t?"http://localhost:4321/subs":"https://subs.renumerate.com",e.sessionId);case"event":return t?"http://localhost:4321/event/":"https://renumerate.com/event/";default:throw new Error(`Unknown type: ${e}`)}}}exports.Renumerate=a;
