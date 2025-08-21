(function(a,s){typeof exports=="object"&&typeof module<"u"?s(exports):typeof define=="function"&&define.amd?define(["exports"],s):(a=typeof globalThis<"u"?globalThis:a||self,s(a.Renumerate={}))})(this,function(a){"use strict";var f=Object.defineProperty;var g=(a,s,h)=>s in a?f(a,s,{enumerable:!0,configurable:!0,writable:!0,value:h}):a[s]=h;var c=(a,s,h)=>g(a,typeof s!="symbol"?s+"":s,h);class s{constructor(e){c(this,"config");c(this,"retentionDialog",null);c(this,"retentionIframe",null);c(this,"subscriptionIframe",null);c(this,"styleSheet",null);c(this,"windowListener",null);c(this,"activeCallbacks",{});this.config=e,!(typeof window>"u")&&this.initialize()}setCallbacks(e){this.activeCallbacks={...this.config.callbacks,...e}}static getInstance(e){if(typeof window>"u")return new s(e);if(window.RENUMERATE_INSTANCE){const i=window.RENUMERATE_INSTANCE;return i.updateConfig(e),i}const o=new s(e);return window.RENUMERATE_INSTANCE=o,o}updateConfig(e){this.config=e}mountCancelButton(e,o,i){let n={};if(typeof i=="string"?n.classes=i:i&&(n=i),!this.isSessionType(o,"retention"))throw new Error(`Invalid sessionId: ${o}. Expected a retention session ID.`);const t=document.createElement("button");t.textContent="Cancel Subscription",t.addEventListener("click",()=>{const l={onComplete:n.onComplete,onRetained:n.onRetained,onCancelled:n.onCancelled};this.showRetentionView(o,l)}),n.classes?t.className=n.classes:t.className="renumerate-cancel-btn";const r=document.getElementById(e);if(!r)throw new Error(`Element with id ${e} not found`);r.appendChild(t)}showRetentionView(e,o){if(this.setCallbacks(o),!this.isSessionType(e,"retention")&&!this.isSessionType(e,"subscription"))throw new Error(`Invalid sessionId: ${e}. Expected a retention or subscription session ID.`);this.retentionDialog=document.createElement("dialog"),this.retentionDialog.className="renumerate-dialog";const i=document.createElement("button");i.className="renumerate-dialog-close",i.innerHTML="&times;",i.setAttribute("aria-label","Close"),this.retentionDialog.appendChild(i),i.addEventListener("click",()=>{var t;(t=this.retentionDialog)==null||t.close()});const n=document.createElement("div");return n.className="renumerate-dialog-content",this.retentionIframe=document.createElement("iframe"),this.retentionIframe.src=this.buildUrl({target:"retention",sessionId:e}),n.appendChild(this.retentionIframe),this.retentionDialog.appendChild(n),n.prepend(i),document.body.appendChild(this.retentionDialog),this.retentionDialog.showModal(),i.blur(),this.retentionDialog.addEventListener("close",()=>{var t,r,l,d;if((r=(t=this.activeCallbacks).onComplete)==null||r.call(t),this.activeCallbacks={},this.subscriptionIframe){const u={type:"on-complete",data:{}};(l=this.subscriptionIframe.contentWindow)==null||l.postMessage(u,"*")}(d=this.retentionDialog)==null||d.remove()}),this.retentionDialog}mountSubscriptionHub(e,o,i="",n="",t){if(!this.isSessionType(o,"subscription"))throw new Error(`Invalid sessionId: ${o}. Expected a subscription session ID.`);t&&(this.activeCallbacks={...this.config.callbacks,...t});const r=document.createElement("div");r.className=i||"renumerate-subscription-hub";const l=document.getElementById(e);if(!l)throw new Error(`Element with id ${e} not found`);return l.appendChild(r),this.subscriptionIframe=document.createElement("iframe"),this.subscriptionIframe.src=this.getSubscriptionHubUrl(o),this.subscriptionIframe.className=n||"renumerate-subscription-hub-iframe",this.subscriptionIframe.title="SubscriptionHub",r.appendChild(this.subscriptionIframe),r}getSubscriptionHubUrl(e){if(!this.isSessionType(e,"subscription"))throw new Error(`Invalid sessionId: ${e}. Expected a subscription session ID.`);return this.buildUrl({target:"subscription",sessionId:e})}initialize(){this.config.debug&&console.info("Renumerate initialized with config:",this.config),this.injectStylesheet(),this.addListener()}cleanup(){this.config.debug&&console.info("Renumerate cleaned up with config:",this.config),this.retentionDialog&&(this.retentionDialog.remove(),this.retentionDialog=null),this.retentionIframe&&(this.retentionIframe.remove(),this.retentionIframe=null),this.subscriptionIframe&&(this.subscriptionIframe.remove(),this.subscriptionIframe=null),this.styleSheet&&(this.styleSheet.remove(),this.styleSheet=null),this.windowListener&&(window.removeEventListener("message",this.windowListener),this.windowListener=null)}isSessionType(e,o){switch(o){case"retention":return e.startsWith("ret_");case"subscription":return e.startsWith("sub_");default:throw new Error(`Unknown session type: ${o}`)}}getIsLocal(){return typeof window<"u"&&window.RENUMERATE_LOCAL===!0}injectStylesheet(){const e=document.querySelector("style[data-renumerate-dialog-styles]");if(e){this.styleSheet=e;return}this.styleSheet=document.createElement("style"),this.styleSheet.type="text/css",this.styleSheet.setAttribute("data-renumerate-dialog-styles","true"),this.styleSheet.innerHTML=`
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
    `,document.head.appendChild(this.styleSheet)}addListener(){this.config.debug&&console.info("Adding message listener for Renumerate"),this.windowListener=e=>{var r,l,d,u,m,p;if(this.config.debug&&console.info("Received message:",e.data),!(this.getIsLocal()?["http://localhost:3000","http://localhost:4321"]:["https://retention.renumerate.com","https://subs.renumerate.com"]).includes(e.origin)){console.warn("Received message from unauthorized origin:",e.origin);return}const{type:n,data:t}=e.data;switch(n){case"cancel-subscription":{this.showRetentionView(t.sessionId,this.activeCallbacks);return}case"resize":{this.retentionIframe&&t.height&&typeof t.height=="number"&&t.height>0&&(this.retentionIframe.style.height=`${t.height}px`);return}case"close-dialog":{this.retentionDialog&&this.retentionDialog.close();return}case"on-complete":{(l=(r=this.activeCallbacks).onComplete)==null||l.call(r);return}case"on-retained":{(u=(d=this.activeCallbacks).onRetained)==null||u.call(d);return}case"on-cancelled":{(p=(m=this.activeCallbacks).onCancelled)==null||p.call(m);return}default:console.warn(`Unknown message type: ${n}`)}},window.addEventListener("message",this.windowListener)}buildUrl(e){const o=this.getIsLocal(),i=(n,t)=>`${n}?session_id=${t}`;switch(e.target){case"retention":return i(o?"http://localhost:4321/retention":"https://retention.renumerate.com",e.sessionId);case"subscription":return i(o?"http://localhost:4321/subs":"https://subs.renumerate.com",e.sessionId);case"event":return o?"http://localhost:4321/event/":"https://renumerate.com/event/";default:throw new Error(`Unknown type: ${e}`)}}}a.Renumerate=s,Object.defineProperty(a,Symbol.toStringTag,{value:"Module"})});
