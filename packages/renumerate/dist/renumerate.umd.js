(function(r,s){typeof exports=="object"&&typeof module<"u"?s(exports):typeof define=="function"&&define.amd?define(["exports"],s):(r=typeof globalThis<"u"?globalThis:r||self,s(r.Renumerate={}))})(this,function(r){"use strict";var b=Object.defineProperty;var w=(r,s,f)=>s in r?b(r,s,{enumerable:!0,configurable:!0,writable:!0,value:f}):r[s]=f;var l=(r,s,f)=>w(r,typeof s!="symbol"?s+"":s,f);class s{constructor(e){l(this,"config");l(this,"retentionDialog",null);l(this,"retentionIframe",null);l(this,"subscriptionIframe",null);l(this,"styleSheet",null);l(this,"windowListener",null);l(this,"activeCallbacks",{});this.config=e,!(typeof window>"u")&&this.initialize()}setCallbacks(e){this.activeCallbacks={...this.config.callbacks,...e}}static getInstance(e){if(typeof window>"u")return new s(e);if(window.RENUMERATE_INSTANCE){const t=window.RENUMERATE_INSTANCE;return t.updateConfig(e),t}const o=new s(e);return window.RENUMERATE_INSTANCE=o,o}updateConfig(e){this.config=e}mountCancelButton(e,o,t){let i={};if(typeof t=="string"?i.classes=t:t&&(i=t),!this.isSessionType(o,"retention"))throw new Error(`Invalid sessionId: ${o}. Expected a retention session ID.`);const n=document.createElement("button");n.textContent="Cancel Subscription",n.addEventListener("click",()=>{const c={onComplete:i.onComplete,onRetained:i.onRetained,onCancelled:i.onCancelled};this.showRetentionView(o,c)}),i.classes?n.className=i.classes:n.className="renumerate-cancel-btn";const a=document.getElementById(e);if(!a)throw new Error(`Element with id ${e} not found`);a.appendChild(n)}showRetentionView(e,o){if(this.setCallbacks(o),!this.isSessionType(e,"retention")&&!this.isSessionType(e,"subscription"))throw new Error(`Invalid sessionId: ${e}. Expected a retention or subscription session ID.`);this.retentionDialog=document.createElement("dialog"),this.retentionDialog.className="renumerate-dialog";const t=document.createElement("button");t.className="renumerate-dialog-close",t.innerHTML="&times;",t.setAttribute("aria-label","Close"),this.retentionDialog.appendChild(t),t.addEventListener("click",()=>{var n;(n=this.retentionDialog)==null||n.close()});const i=document.createElement("div");return i.className="renumerate-dialog-content",this.retentionIframe=document.createElement("iframe"),this.retentionIframe.src=this.buildUrl({target:"retention",sessionId:e}),i.appendChild(this.retentionIframe),this.retentionDialog.appendChild(i),i.prepend(t),document.body.appendChild(this.retentionDialog),this.retentionDialog.showModal(),t.blur(),this.retentionDialog.addEventListener("close",()=>{var c,h,u,m;(h=(c=this.activeCallbacks).onComplete)==null||h.call(c),this.activeCallbacks={};const a=this.getIsLocal()?"https://localhost:4321":"https://subs.renumerate.com";try{Array.from(document.getElementsByTagName("iframe")).forEach(d=>{const g=d.getAttribute("src")||"";(g.includes("subs.renumerate.com")||g.includes("localhost:4321/subs"))&&d.contentWindow&&d.contentWindow.postMessage({type:"on-complete",data:{}},a)})}catch(p){(u=this.config)!=null&&u.debug&&console.warn("Error sending on-complete to iframes:",p)}finally{(m=this.retentionDialog)==null||m.remove()}}),this.retentionDialog}mountSubscriptionHub(e,o,t="",i="",n){if(!this.isSessionType(o,"subscription"))throw new Error(`Invalid sessionId: ${o}. Expected a subscription session ID.`);n&&(this.activeCallbacks={...this.config.callbacks,...n});const a=document.createElement("div");a.className=t||"renumerate-subscription-hub";const c=document.getElementById(e);if(!c)throw new Error(`Element with id ${e} not found`);return c.appendChild(a),this.subscriptionIframe=document.createElement("iframe"),this.subscriptionIframe.src=this.getSubscriptionHubUrl(o),this.subscriptionIframe.className=i||"renumerate-subscription-hub-iframe",this.subscriptionIframe.title="SubscriptionHub",this.subscriptionIframe.setAttribute("allow","publickey-credentials-get"),a.appendChild(this.subscriptionIframe),a}getSubscriptionHubUrl(e){if(!this.isSessionType(e,"subscription"))throw new Error(`Invalid sessionId: ${e}. Expected a subscription session ID.`);return this.buildUrl({target:"subscription",sessionId:e})}initialize(){this.config.debug&&console.info("Renumerate initialized with config:",this.config),this.injectStylesheet(),this.addListener()}cleanup(){this.config.debug&&console.info("Renumerate cleaned up with config:",this.config),this.retentionDialog&&(this.retentionDialog.remove(),this.retentionDialog=null),this.retentionIframe&&(this.retentionIframe.remove(),this.retentionIframe=null),this.subscriptionIframe&&(this.subscriptionIframe.remove(),this.subscriptionIframe=null),this.styleSheet&&(this.styleSheet.remove(),this.styleSheet=null),this.windowListener&&(window.removeEventListener("message",this.windowListener),this.windowListener=null)}isSessionType(e,o){switch(o){case"retention":return e.startsWith("ret_");case"subscription":return e.startsWith("sub_");default:throw new Error(`Unknown session type: ${o}`)}}getIsLocal(){return typeof window<"u"&&window.RENUMERATE_LOCAL===!0}injectStylesheet(){const e=document.querySelector("style[data-renumerate-dialog-styles]");if(e){this.styleSheet=e;return}this.styleSheet=document.createElement("style"),this.styleSheet.type="text/css",this.styleSheet.setAttribute("data-renumerate-dialog-styles","true"),this.styleSheet.innerHTML=`
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
    `,document.head.appendChild(this.styleSheet)}addListener(){this.config.debug&&console.info("Adding message listener for Renumerate"),this.windowListener=e=>{var a,c,h,u,m,p;if(this.config.debug&&console.info("Received message:",e.data),!(this.getIsLocal()?["https://localhost:4321"]:["https://retention.renumerate.com","https://subs.renumerate.com"]).includes(e.origin)){console.warn("Received message from unauthorized origin:",e.origin);return}const{type:i,data:n}=e.data;switch(i){case"cancel-subscription":{this.showRetentionView(n.sessionId,this.activeCallbacks);return}case"resize":{const d=n.iframe==="subhub"?document.querySelector(".renumerate-subscription-hub-iframe"):this.retentionIframe;d&&n.height&&typeof n.height=="number"&&n.height>0&&(d.style.height=`${n.height}px`);return}case"close-dialog":{this.retentionDialog&&this.retentionDialog.close();return}case"on-complete":{(c=(a=this.activeCallbacks).onComplete)==null||c.call(a);return}case"on-retained":{(u=(h=this.activeCallbacks).onRetained)==null||u.call(h);return}case"on-cancelled":{(p=(m=this.activeCallbacks).onCancelled)==null||p.call(m);return}default:console.warn(`Unknown message type: ${i}`)}},window.addEventListener("message",this.windowListener)}buildUrl(e){const o=this.getIsLocal(),t=(i,n)=>`${i}?session_id=${n}`;switch(e.target){case"retention":return t(o?"https://localhost:4321/retention":"https://retention.renumerate.com",e.sessionId);case"subscription":return t(o?"https://localhost:4321/subs":"https://subs.renumerate.com",e.sessionId);case"event":return o?"https://localhost:4321/event/":"https://api.renumerate.com/v1/events/";default:throw new Error(`Unknown type: ${e}`)}}}r.Renumerate=s,Object.defineProperty(r,Symbol.toStringTag,{value:"Module"})});
