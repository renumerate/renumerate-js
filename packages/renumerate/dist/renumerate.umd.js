(function(r,s){typeof exports=="object"&&typeof module<"u"?s(exports):typeof define=="function"&&define.amd?define(["exports"],s):(r=typeof globalThis<"u"?globalThis:r||self,s(r.Renumerate={}))})(this,function(r){"use strict";var b=Object.defineProperty;var w=(r,s,p)=>s in r?b(r,s,{enumerable:!0,configurable:!0,writable:!0,value:p}):r[s]=p;var c=(r,s,p)=>w(r,typeof s!="symbol"?s+"":s,p);class s{constructor(e){c(this,"config");c(this,"retentionDialog",null);c(this,"retentionIframe",null);c(this,"subscriptionIframe",null);c(this,"styleSheet",null);c(this,"windowListener",null);c(this,"activeCallbacks",{});this.config=e,!(typeof window>"u")&&this.initialize()}setCallbacks(e){this.activeCallbacks={...this.config.callbacks,...e}}static getInstance(e){if(typeof window>"u")return new s(e);if(window.RENUMERATE_INSTANCE){const t=window.RENUMERATE_INSTANCE;return t.updateConfig(e),t}const n=new s(e);return window.RENUMERATE_INSTANCE=n,n}updateConfig(e){this.config=e}mountCancelButton(e,n,t){let i={};if(typeof t=="string"?i.classes=t:t&&(i=t),!this.isSessionType(n,"retention"))throw new Error(`Invalid sessionId: ${n}. Expected a retention session ID.`);const o=document.createElement("button");o.textContent="Cancel Subscription",o.addEventListener("click",()=>{const l={onComplete:i.onComplete,onRetained:i.onRetained,onCancelled:i.onCancelled};this.showRetentionView(n,l)}),i.classes?o.className=i.classes:o.className="renumerate-cancel-btn";const a=document.getElementById(e);if(!a)throw new Error(`Element with id ${e} not found`);a.appendChild(o)}showRetentionView(e,n){if(this.setCallbacks(n),!this.isSessionType(e,"retention")&&!this.isSessionType(e,"subscription"))throw new Error(`Invalid sessionId: ${e}. Expected a retention or subscription session ID.`);this.retentionDialog=document.createElement("dialog"),this.retentionDialog.className="renumerate-dialog";const t=document.createElement("button");t.className="renumerate-dialog-close",t.innerHTML="&times;",t.setAttribute("aria-label","Close"),this.retentionDialog.appendChild(t),t.addEventListener("click",()=>{var o;(o=this.retentionDialog)==null||o.close()});const i=document.createElement("div");return i.className="renumerate-dialog-content",this.retentionIframe=document.createElement("iframe"),this.retentionIframe.src=this.buildUrl({target:"retention",sessionId:e}),i.appendChild(this.retentionIframe),this.retentionDialog.appendChild(i),i.prepend(t),document.body.appendChild(this.retentionDialog),this.retentionDialog.showModal(),t.blur(),this.retentionDialog.addEventListener("close",()=>{var l,d,h,u;(d=(l=this.activeCallbacks).onComplete)==null||d.call(l),this.activeCallbacks={};const a=this.getIsLocal()?"https://localhost:4321":"https://subs.renumerate.com";try{Array.from(document.getElementsByTagName("iframe")).forEach(f=>{const g=f.getAttribute("src")||"";(g.includes("subs.renumerate.com")||g.includes("localhost:4321/subs"))&&f.contentWindow&&f.contentWindow.postMessage({type:"on-complete",data:{}},a)})}catch(m){(h=this.config)!=null&&h.debug&&console.warn("Error sending on-complete to iframes:",m)}finally{(u=this.retentionDialog)==null||u.remove()}}),this.retentionDialog}mountSubscriptionHub(e,n,t="",i="",o){if(!this.isSessionType(n,"subscription"))throw new Error(`Invalid sessionId: ${n}. Expected a subscription session ID.`);o&&(this.activeCallbacks={...this.config.callbacks,...o});const a=document.createElement("div");a.className=t||"renumerate-subscription-hub";const l=document.getElementById(e);if(!l)throw new Error(`Element with id ${e} not found`);return l.appendChild(a),this.subscriptionIframe=document.createElement("iframe"),this.subscriptionIframe.src=this.getSubscriptionHubUrl(n),this.subscriptionIframe.className=i||"renumerate-subscription-hub-iframe",this.subscriptionIframe.title="SubscriptionHub",this.subscriptionIframe.setAttribute("allow","publickey-credentials-get"),a.appendChild(this.subscriptionIframe),a}getSubscriptionHubUrl(e){if(!this.isSessionType(e,"subscription"))throw new Error(`Invalid sessionId: ${e}. Expected a subscription session ID.`);return this.buildUrl({target:"subscription",sessionId:e})}initialize(){this.config.debug&&console.info("Renumerate initialized with config:",this.config),this.injectStylesheet(),this.addListener()}cleanup(){this.config.debug&&console.info("Renumerate cleaned up with config:",this.config),this.retentionDialog&&(this.retentionDialog.remove(),this.retentionDialog=null),this.retentionIframe&&(this.retentionIframe.remove(),this.retentionIframe=null),this.subscriptionIframe&&(this.subscriptionIframe.remove(),this.subscriptionIframe=null),this.styleSheet&&(this.styleSheet.remove(),this.styleSheet=null),this.windowListener&&(window.removeEventListener("message",this.windowListener),this.windowListener=null)}isSessionType(e,n){switch(n){case"retention":return e.startsWith("ret_");case"subscription":return e.startsWith("sub_");default:throw new Error(`Unknown session type: ${n}`)}}getIsLocal(){return typeof window<"u"&&window.RENUMERATE_LOCAL===!0}injectStylesheet(){const e=document.querySelector("style[data-renumerate-dialog-styles]");if(e){this.styleSheet=e;return}this.styleSheet=document.createElement("style"),this.styleSheet.type="text/css",this.styleSheet.setAttribute("data-renumerate-dialog-styles","true"),this.styleSheet.innerHTML=`
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
    `,document.head.appendChild(this.styleSheet)}addListener(){this.config.debug&&console.info("Adding message listener for Renumerate"),this.windowListener=e=>{var a,l,d,h,u,m;if(this.config.debug&&console.info("Received message:",e.data),!(this.getIsLocal()?["https://localhost:4321"]:["https://retention.renumerate.com","https://subs.renumerate.com"]).includes(e.origin)){console.warn("Received message from unauthorized origin:",e.origin);return}const{type:i,data:o}=e.data;switch(i){case"cancel-subscription":{this.showRetentionView(o.sessionId,this.activeCallbacks);return}case"resize":{this.retentionIframe&&o.height&&typeof o.height=="number"&&o.height>0&&(this.retentionIframe.style.height=`${o.height}px`);return}case"close-dialog":{this.retentionDialog&&this.retentionDialog.close();return}case"on-complete":{(l=(a=this.activeCallbacks).onComplete)==null||l.call(a);return}case"on-retained":{(h=(d=this.activeCallbacks).onRetained)==null||h.call(d);return}case"on-cancelled":{(m=(u=this.activeCallbacks).onCancelled)==null||m.call(u);return}default:console.warn(`Unknown message type: ${i}`)}},window.addEventListener("message",this.windowListener)}buildUrl(e){const n=this.getIsLocal(),t=(i,o)=>`${i}?session_id=${o}`;switch(e.target){case"retention":return t(n?"https://localhost:4321/retention":"https://retention.renumerate.com",e.sessionId);case"subscription":return t(n?"https://localhost:4321/subs":"https://subs.renumerate.com",e.sessionId);case"event":return n?"https://localhost:4321/event/":"https://api.renumerate.com/v1/events/";default:throw new Error(`Unknown type: ${e}`)}}}r.Renumerate=s,Object.defineProperty(r,Symbol.toStringTag,{value:"Module"})});
