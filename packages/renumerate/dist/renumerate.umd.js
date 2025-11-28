(function(a,r){typeof exports=="object"&&typeof module<"u"?r(exports):typeof define=="function"&&define.amd?define(["exports"],r):(a=typeof globalThis<"u"?globalThis:a||self,r(a.Renumerate={}))})(this,function(a){"use strict";var w=Object.defineProperty;var y=(a,r,g)=>r in a?w(a,r,{enumerable:!0,configurable:!0,writable:!0,value:g}):a[r]=g;var d=(a,r,g)=>y(a,typeof r!="symbol"?r+"":r,g);class r{constructor(e){d(this,"config");d(this,"retentionDialog",null);d(this,"retentionIframe",null);d(this,"subscriptionIframe",null);d(this,"styleSheet",null);d(this,"windowListener",null);d(this,"activeCallbacks",{});this.config=e,!(typeof window>"u")&&this.initialize()}setCallbacks(e){this.activeCallbacks={...this.config.callbacks,...e}}static getInstance(e){if(typeof window>"u")return new r(e);if(window.RENUMERATE_INSTANCE){const t=window.RENUMERATE_INSTANCE;return t.updateConfig(e),t}const i=new r(e);return window.RENUMERATE_INSTANCE=i,i}updateConfig(e){this.config={...this.config,...e},this.config.debug&&console.info("Config updated:",this.config)}mountCancelButton(e,i,t){let n={};if(typeof t=="string"?n.classes=t:t&&(n=t),!this.isSessionType(i,"retention"))throw new Error(`Invalid sessionId: ${i}. Expected a retention session ID.`);const o=document.createElement("button");o.textContent="Cancel Subscription",o.addEventListener("click",()=>{const c={onComplete:n.onComplete,onRetained:n.onRetained,onCancelled:n.onCancelled};this.showRetentionView(i,c)}),n.classes?o.className=n.classes:o.className="renumerate-cancel-btn";const s=document.getElementById(e);if(!s)throw new Error(`Element with id ${e} not found`);s.appendChild(o)}showRetentionView(e,i){if(this.setCallbacks(i),!this.isSessionType(e,"retention")&&!this.isSessionType(e,"subscription"))throw new Error(`Invalid sessionId: ${e}. Expected a retention or subscription session ID.`);this.retentionDialog=document.createElement("dialog"),this.retentionDialog.className="renumerate-dialog";const t=document.createElement("button");t.className="renumerate-dialog-close",t.innerHTML="&times;",t.setAttribute("aria-label","Close"),this.retentionDialog.appendChild(t),t.addEventListener("click",()=>{var s;(s=this.retentionDialog)==null||s.close()});const n=document.createElement("div");n.className="renumerate-dialog-content",this.retentionIframe=document.createElement("iframe"),this.retentionIframe.src=this.buildUrl({target:"retention",sessionId:e});const o=setTimeout(()=>{this.config.debug&&console.warn("Retention iframe timed out after 10 seconds"),this.retentionIframe&&this.showRetentionError(n,this.retentionIframe)},1e4);return this.retentionIframe.addEventListener("load",()=>{clearTimeout(o)}),n.appendChild(this.retentionIframe),this.retentionDialog.appendChild(n),n.prepend(t),document.body.appendChild(this.retentionDialog),this.retentionDialog.showModal(),t.blur(),this.retentionDialog.addEventListener("close",()=>{var h,m,f,p;clearTimeout(o),(m=(h=this.activeCallbacks).onComplete)==null||m.call(h),this.activeCallbacks={};const c=this.getIsLocal()?"https://localhost:4321":"https://subs.renumerate.com";try{Array.from(document.getElementsByTagName("iframe")).forEach(u=>{const b=u.getAttribute("src")||"";(b.includes("subs.renumerate.com")||b.includes("localhost:4321/subs"))&&u.contentWindow&&u.contentWindow.postMessage({type:"on-complete",data:{}},c)})}catch(l){(f=this.config)!=null&&f.debug&&console.warn("Error sending on-complete to iframes:",l)}finally{(p=this.retentionDialog)==null||p.remove()}}),this.retentionDialog}showRetentionError(e,i){if(this.config.debug&&console.warn("Retention iframe failed to load, showing fallback content"),e.querySelector(".renumerate-error-content"))return;i.style.display="none";const t=document.createElement("div");t.className="renumerate-error-content";const{fallbackEmail:n}=this.config;t.innerHTML=`
			<h2>We're sorry!</h2>
			<p>We're having trouble loading the cancellation form.</p>
			${n?`<p>Please email us at <a href="mailto:${n}">${n}</a> to cancel your subscription.</p>`:"<p>Please contact support to cancel your subscription.</p>"}
		`,e.appendChild(t)}mountSubscriptionHub(e,i,t="",n="",o){if(!this.isSessionType(i,"subscription"))throw new Error(`Invalid sessionId: ${i}. Expected a subscription session ID.`);o&&(this.activeCallbacks={...this.config.callbacks,...o});const s=document.createElement("div");s.className=t||"renumerate-subscription-hub";const c=document.getElementById(e);if(!c)throw new Error(`Element with id ${e} not found`);return c.appendChild(s),this.subscriptionIframe=document.createElement("iframe"),this.subscriptionIframe.src=this.getSubscriptionHubUrl(i),this.subscriptionIframe.className=n||"renumerate-subscription-hub-iframe",this.subscriptionIframe.title="SubscriptionHub",this.subscriptionIframe.setAttribute("allow","publickey-credentials-get"),this.subscriptionIframe.setAttribute("data-renumerate-subhub","true"),s.appendChild(this.subscriptionIframe),s}getSubscriptionHubUrl(e){if(!this.isSessionType(e,"subscription"))throw new Error(`Invalid sessionId: ${e}. Expected a subscription session ID.`);return this.buildUrl({target:"subscription",sessionId:e})}initialize(){this.config.debug&&console.info("Renumerate initialized with config:",this.config),this.injectStylesheet(),this.addListener()}cleanup(){this.config.debug&&console.info("Renumerate cleaned up with config:",this.config),this.retentionDialog&&(this.retentionDialog.remove(),this.retentionDialog=null),this.retentionIframe&&(this.retentionIframe.remove(),this.retentionIframe=null),this.subscriptionIframe&&(this.subscriptionIframe.remove(),this.subscriptionIframe=null),this.styleSheet&&(this.styleSheet.remove(),this.styleSheet=null),this.windowListener&&(window.removeEventListener("message",this.windowListener),this.windowListener=null)}showSubscriptionHubError(e,i){this.config.debug&&console.warn("Subscription hub iframe failed to load, showing fallback content"),i.style.display="none";const t=document.createElement("div");t.className="renumerate-error-content",t.innerHTML=`
            <h2>We're sorry!</h2>
            <p>We're having trouble loading your subscription information.</p>
			<p>We've been notified and we'll have this right up again shortly! In the meantime contact support for any urgent issues</p>
        `,e.appendChild(t)}isSessionType(e,i){switch(i){case"retention":return e.startsWith("ret_");case"subscription":return e.startsWith("sub_");default:throw new Error(`Unknown session type: ${i}`)}}getIsLocal(){return typeof window<"u"&&window.RENUMERATE_LOCAL===!0}injectStylesheet(){const e=document.querySelector("style[data-renumerate-dialog-styles]");if(e){this.styleSheet=e;return}this.styleSheet=document.createElement("style"),this.styleSheet.setAttribute("data-renumerate-dialog-styles","true"),this.styleSheet.innerHTML=`
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
    `,document.head.appendChild(this.styleSheet)}addListener(){this.config.debug&&console.info("Adding message listener for Renumerate"),this.windowListener=e=>{var s,c,h,m,f,p;if(this.config.debug&&console.info("Received message:",e.data),!(this.getIsLocal()?["https://localhost:4321"]:["https://retention.renumerate.com","https://subs.renumerate.com"]).includes(e.origin)){this.config.debug&&console.warn("Received message from unauthorized origin:",e.origin);return}const{type:n,data:o}=e.data;switch(n){case"catastrophic-failure":{if(this.config.debug&&console.error("Received catastrophic-failure from iframe:",o.iframe),o.iframe==="retention"&&this.retentionDialog&&this.retentionIframe){const u=this.retentionDialog.querySelector(".renumerate-dialog-content");u&&this.showRetentionError(u,this.retentionIframe)}const l=document.querySelector('[data-renumerate-subhub="true"]');if(o.iframe==="subscription"&&l){const u=l.parentElement;u&&this.showSubscriptionHubError(u,l)}return}case"cancel-subscription":{this.showRetentionView(o.sessionId,this.activeCallbacks);return}case"resize":{const l=o.iframe==="subscription"?document.querySelector('[data-renumerate-subhub="true"]'):this.retentionIframe;l&&o.height&&typeof o.height=="number"&&o.height>0&&(l.style.height=`${o.height}px`);return}case"close-dialog":{this.retentionDialog&&this.retentionDialog.close();return}case"on-complete":{(c=(s=this.activeCallbacks).onComplete)==null||c.call(s);return}case"on-retained":{(m=(h=this.activeCallbacks).onRetained)==null||m.call(h);return}case"on-cancelled":{(p=(f=this.activeCallbacks).onCancelled)==null||p.call(f);return}default:this.config.debug&&console.warn(`Unknown message type: ${n}`)}},window.addEventListener("message",this.windowListener)}buildUrl(e){const i=this.getIsLocal(),t=(n,o)=>`${n}?session_id=${o}`;switch(e.target){case"retention":return t(i?"https://localhost:4321/retention":"https://retention.renumerate.com",e.sessionId);case"subscription":return t(i?"https://localhost:4321/subs":"https://subs.renumerate.com",e.sessionId);case"event":return i?"https://localhost:4321/event/":"https://api.renumerate.com/v1/events/";default:throw new Error(`Unknown type: ${e}`)}}}a.Renumerate=r,Object.defineProperty(a,Symbol.toStringTag,{value:"Module"})});
