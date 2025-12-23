(function(c,o){typeof exports=="object"&&typeof module<"u"?o(exports):typeof define=="function"&&define.amd?define(["exports"],o):(c=typeof globalThis<"u"?globalThis:c||self,o(c.Renumerate={}))})(this,function(c){"use strict";var x=Object.defineProperty;var E=(c,o,u)=>o in c?x(c,o,{enumerable:!0,configurable:!0,writable:!0,value:u}):c[o]=u;var a=(c,o,u)=>E(c,typeof o!="symbol"?o+"":o,u);const o="renumerate_sdk_session";class I{constructor(e,n=!1){a(this,"session",null);a(this,"getAuthToken");a(this,"debug");a(this,"refreshPromise",null);this.getAuthToken=e,this.debug=n,this.loadFromStorage()}updateGetAuthToken(e){this.getAuthToken=e}loadFromStorage(){if(!(typeof window>"u"))try{const e=sessionStorage.getItem(o);if(e){const n=JSON.parse(e),t=Math.floor(Date.now()/1e3);n.expiresAt>t+6e4/1e3?this.session=n:sessionStorage.removeItem(o)}}catch{}}saveToStorage(){if(!(typeof window>"u"||!this.session))try{sessionStorage.setItem(o,JSON.stringify(this.session))}catch{}}async getSession(){if(this.session){const e=Math.floor(Date.now()/1e3);if(this.session.expiresAt>e+6e4/1e3)return this.debug&&console.info("Using cached session:",this.session.sessionId),this.session;this.debug&&console.info("Cached session expired, refreshing...")}if(this.refreshPromise)return this.debug&&console.info("Session refresh already in progress, waiting..."),this.refreshPromise;this.refreshPromise=this.refreshSession();try{return await this.refreshPromise}finally{this.refreshPromise=null}}async refreshSession(){var i;const e=await this.getAuthToken(),n=await fetch(this.getApiUrl("/v1/session/exchange"),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({handshakeToken:e})});if(!n.ok){const r=((i=(await n.json().catch(()=>({}))).error)==null?void 0:i.message)||"Session exchange failed";throw new Error(r)}const t=await n.json();return this.session={sessionId:t.session.sessionId,expiresAt:t.session.expiresAt},this.saveToStorage(),this.debug&&console.info("SDK session established:",this.session.sessionId),this.session}getAuthHeader(){return this.session?`Bearer ${this.session.sessionId}`:null}getAuthHeaders(){const e=this.getAuthHeader();return e?{Authorization:e}:{}}isSessionValid(){if(!this.session)return!1;const e=Math.floor(Date.now()/1e3);return this.session.expiresAt>e+6e4/1e3}clearSession(){if(this.session=null,typeof window<"u")try{sessionStorage.removeItem(o)}catch{}}getCurrentSession(){return this.session}getApiUrl(e){return`${typeof window<"u"&&window.RENUMERATE_LOCAL===!0?"https://localhost:4321":"https://api.renumerate.com"}${e}`}}function w(S){return S.startsWith("r10_")}class b{constructor(e){a(this,"config");a(this,"retentionDialog",null);a(this,"retentionIframe",null);a(this,"subscriptionIframe",null);a(this,"styleSheet",null);a(this,"windowListener",null);a(this,"activeCallbacks",{});a(this,"sessionManager");this.config=e,this.sessionManager=new I(e.getAuthToken,e.debug??!1),!(typeof window>"u")&&this.initialize()}setCallbacks(e){this.activeCallbacks={...this.config.callbacks,...e}}async refreshSession(){return this.sessionManager.refreshSession()}static getInstance(e){if(typeof window>"u")return new b(e);if(window.RENUMERATE_INSTANCE){const t=window.RENUMERATE_INSTANCE;return t.updateConfig(e),t}const n=new b(e);return window.RENUMERATE_INSTANCE=n,n}updateConfig(e){this.config={...this.config,...e},e.getAuthToken&&this.sessionManager.updateGetAuthToken(e.getAuthToken),this.config.debug&&console.info("Config updated:",this.config)}async getSession(){return this.sessionManager.getSession()}getCurrentSession(){return this.sessionManager.getCurrentSession()}clearSession(){this.sessionManager.clearSession()}mountCancelButton(e,n){let t={};typeof n=="string"?t.classes=n:n&&(t=n);const i=document.createElement("button");i.textContent="Cancel Subscription",i.addEventListener("click",()=>{const r={onComplete:t.onComplete,onRetained:t.onRetained,onCancelled:t.onCancelled};this.showRetentionView(t.subscriptionId,r)}),t.classes?i.className=t.classes:i.className="renumerate-cancel-btn";const s=document.getElementById(e);if(!s)throw new Error(`Element with id ${e} not found`);s.appendChild(i)}async showRetentionView(e,n){this.setCallbacks(n);const t=await this.getSession();this.openRetentionDialog(t.sessionId,e)}async mountSubscriptionHub(e,n="",t="",i){const s=await this.getSession();i&&(this.activeCallbacks={...this.config.callbacks,...i});const r=document.createElement("div");r.className=n||"renumerate-subscription-hub";const d=document.getElementById(e);if(!d)throw new Error(`Element with id ${e} not found`);return d.appendChild(r),this.subscriptionIframe=document.createElement("iframe"),this.subscriptionIframe.src=this.buildUrl({target:"subscription",sessionId:s.sessionId}),this.subscriptionIframe.className=t||"renumerate-subscription-hub-iframe",this.subscriptionIframe.title="SubscriptionHub",this.subscriptionIframe.setAttribute("allow","publickey-credentials-get; payment"),this.subscriptionIframe.setAttribute("data-renumerate-subhub","true"),r.appendChild(this.subscriptionIframe),r}async getSubscriptionHubUrl(){const e=await this.getSession();return this.buildUrl({target:"subscription",sessionId:e.sessionId})}initialize(){this.config.debug&&console.info("Renumerate initialized with config:",this.config),this.injectStylesheet(),this.addListener()}cleanup(){this.config.debug&&console.info("Renumerate cleaned up with config:",this.config),this.retentionDialog&&(this.retentionDialog.remove(),this.retentionDialog=null),this.retentionIframe&&(this.retentionIframe.remove(),this.retentionIframe=null),this.subscriptionIframe&&(this.subscriptionIframe.remove(),this.subscriptionIframe=null),this.styleSheet&&(this.styleSheet.remove(),this.styleSheet=null),this.windowListener&&(window.removeEventListener("message",this.windowListener),this.windowListener=null)}openRetentionDialog(e,n){if(!w(e))throw new Error(`Invalid session ID format. Expected r10_ prefix, got: ${e}`);this.retentionDialog=document.createElement("dialog"),this.retentionDialog.className="renumerate-dialog";const t=document.createElement("button");t.className="renumerate-dialog-close",t.innerHTML="&times;",t.setAttribute("aria-label","Close"),this.retentionDialog.appendChild(t),t.addEventListener("click",()=>{var r;(r=this.retentionDialog)==null||r.close()});const i=document.createElement("div");i.className="renumerate-dialog-content",this.retentionIframe=document.createElement("iframe"),this.retentionIframe.src=this.buildUrl({target:"retention",sessionId:e,subscriptionId:n});const s=setTimeout(()=>{this.config.debug&&console.warn("Retention iframe timed out after 10 seconds"),this.retentionIframe&&this.showRetentionError(i,this.retentionIframe)},1e4);return this.retentionIframe.addEventListener("load",()=>{clearTimeout(s)}),i.appendChild(this.retentionIframe),this.retentionDialog.appendChild(i),i.prepend(t),document.body.appendChild(this.retentionDialog),this.retentionDialog.showModal(),t.blur(),this.retentionDialog.addEventListener("close",()=>{var f,m,g,p;clearTimeout(s),(m=(f=this.activeCallbacks).onComplete)==null||m.call(f),this.activeCallbacks={};const d=this.getIsLocal()?"https://localhost:4321":"https://subs.renumerate.com";try{const l=Array.from(document.getElementsByTagName("iframe"));for(const h of l){const y=h.getAttribute("src")||"";(y.includes("subs.renumerate.com")||y.includes("localhost:4321/subs"))&&h.contentWindow&&h.contentWindow.postMessage({type:"on-complete",data:{}},d)}}catch(l){(g=this.config)!=null&&g.debug&&console.warn("Error sending on-complete to iframes:",l)}finally{(p=this.retentionDialog)==null||p.remove()}}),this.retentionDialog}showRetentionError(e,n){if(this.config.debug&&console.warn("Retention iframe failed to load, showing fallback content"),e.querySelector(".renumerate-error-content"))return;n.style.display="none";const t=document.createElement("div");t.className="renumerate-error-content";const{fallbackEmail:i}=this.config;t.innerHTML=`
			<h2>We're sorry!</h2>
			<p>We're having trouble loading the cancellation form.</p>
			${i?`<p>Please email us at <a href="mailto:${i}">${i}</a> to cancel your subscription.</p>`:"<p>Please contact support to cancel your subscription.</p>"}
		`,e.appendChild(t)}showSubscriptionHubError(e,n){this.config.debug&&console.warn("Subscription hub iframe failed to load, showing fallback content"),n.style.display="none";const t=document.createElement("div");t.className="renumerate-error-content",t.innerHTML=`
            <h2>We're sorry!</h2>
            <p>We're having trouble loading your subscription information.</p>
			<p>We've been notified and we'll have this right up again shortly! In the meantime contact support for any urgent issues</p>
        `,e.appendChild(t)}getIsLocal(){return typeof window<"u"&&window.RENUMERATE_LOCAL===!0}injectStylesheet(){const e=document.querySelector("style[data-renumerate-dialog-styles]");if(e){this.styleSheet=e;return}this.styleSheet=document.createElement("style"),this.styleSheet.setAttribute("data-renumerate-dialog-styles","true"),this.styleSheet.innerHTML=`
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
    `,document.head.appendChild(this.styleSheet)}addListener(){this.config.debug&&console.info("Adding message listener for Renumerate"),this.windowListener=e=>{var r,d,f,m,g,p;if(this.config.debug&&console.info("Received message:",e.data),!(this.getIsLocal()?["https://localhost:4321"]:["https://retention.renumerate.com","https://subs.renumerate.com"]).includes(e.origin)){this.config.debug&&console.warn("Received message from unauthorized origin:",e.origin);return}const{type:i,data:s}=e.data;switch(i){case"catastrophic-failure":{if(this.config.debug&&console.error("Received catastrophic-failure from iframe:",s.iframe),s.iframe==="retention"&&this.retentionDialog&&this.retentionIframe){const h=this.retentionDialog.querySelector(".renumerate-dialog-content");h&&this.showRetentionError(h,this.retentionIframe)}const l=document.querySelector('[data-renumerate-subhub="true"]');if(s.iframe==="subscription"&&l){const h=l.parentElement;h&&this.showSubscriptionHubError(h,l)}return}case"cancel-subscription":{s.sessionId&&w(s.sessionId)?(this.setCallbacks(this.activeCallbacks),this.openRetentionDialog(s.sessionId,s.subscriptionId)):this.config.debug&&console.warn("Invalid session ID received from iframe:",s.sessionId);return}case"resize":{const l=s.iframe==="subscription"?document.querySelector('[data-renumerate-subhub="true"]'):this.retentionIframe;l&&s.height&&typeof s.height=="number"&&s.height>0&&(l.style.height=`${s.height}px`);return}case"close-dialog":{this.retentionDialog&&this.retentionDialog.close();return}case"on-complete":{(d=(r=this.activeCallbacks).onComplete)==null||d.call(r);return}case"on-retained":{(m=(f=this.activeCallbacks).onRetained)==null||m.call(f);return}case"on-cancelled":{(p=(g=this.activeCallbacks).onCancelled)==null||p.call(g);return}default:this.config.debug&&console.warn(`Unknown message type: ${i}`)}},window.addEventListener("message",this.windowListener)}buildUrl(e){const n=this.getIsLocal();switch(e.target){case"retention":{const t=n?"https://localhost:4321/retention":"https://retention.renumerate.com",i=new URL(t);return i.searchParams.set("session_id",e.sessionId),e.subscriptionId&&i.searchParams.set("subscription_id",e.subscriptionId),i.toString()}case"subscription":return`${n?"https://localhost:4321/subs":"https://subs.renumerate.com"}?session_id=${e.sessionId}`;case"event":return n?"https://localhost:4321/event/":"https://api.renumerate.com/v1/events/";default:throw new Error(`Unknown type: ${e}`)}}}c.Renumerate=b,Object.defineProperty(c,Symbol.toStringTag,{value:"Module"})});
