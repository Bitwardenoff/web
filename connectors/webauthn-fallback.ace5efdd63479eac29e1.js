(()=>{"use strict";var e={32728:(e,t)=>{function n(e){if(Array.isArray(e)&&(e=Uint8Array.from(e)),e instanceof ArrayBuffer&&(e=new Uint8Array(e)),e instanceof Uint8Array){let t="";const n=e.byteLength;for(let r=0;r<n;r++)t+=String.fromCharCode(e[r]);e=window.btoa(t)}if("string"!=typeof e)throw new Error("could not coerce to string");return e=e.replace(/\+/g,"-").replace(/\//g,"_").replace(/=*$/g,"")}Object.defineProperty(t,"__esModule",{value:!0}),t.parseWebauthnJson=t.buildDataString=void 0,t.buildDataString=function(e){const t=e.response,r=new Uint8Array(t.authenticatorData),o=new Uint8Array(t.clientDataJSON),a=new Uint8Array(e.rawId),i=new Uint8Array(t.signature),c={id:e.id,rawId:n(a),type:e.type,extensions:e.getClientExtensionResults(),response:{authenticatorData:n(r),clientDataJson:n(o),signature:n(i)}};return JSON.stringify(c)},t.parseWebauthnJson=function(e){const t=JSON.parse(e),n=t.challenge.replace(/-/g,"+").replace(/_/g,"/");return t.challenge=Uint8Array.from(atob(n),(e=>e.charCodeAt(0))),t.allowCredentials.forEach((e=>{const t=e.id.replace(/\_/g,"/").replace(/\-/g,"+");e.id=Uint8Array.from(atob(t),(e=>e.charCodeAt(0)))})),t}},53204:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.b64Decode=t.getQsParam=void 0,t.getQsParam=function(e){const t=window.location.href;e=e.replace(/[\[\]]/g,"\\$&");const n=new RegExp("[?&]"+e+"(=([^&#]*)|&|#|$)").exec(t);return n?n[2]?decodeURIComponent(n[2].replace(/\+/g," ")):"":null},t.b64Decode=function(e,t=!1){return t&&(e=e.replace(/ /g,"+")),decodeURIComponent(Array.prototype.map.call(atob(e),(e=>"%"+("00"+e.charCodeAt(0).toString(16)).slice(-2))).join(""))}},45649:function(e,t,n){var r=this&&this.__awaiter||function(e,t,n,r){return new(n||(n=Promise))((function(o,a){function i(e){try{s(r.next(e))}catch(t){a(t)}}function c(e){try{s(r.throw(e))}catch(t){a(t)}}function s(e){var t;e.done?o(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(i,c)}s((r=r.apply(e,t||[])).next())}))};Object.defineProperty(t,"__esModule",{value:!0});const o=n(53204),a=n(32728);n(48672);let i,c=!1,s=null,d=!1,l="en",u={};function f(){if(c)return;if(s=o.getQsParam("parent"),!s)return void p("No parent.");s=decodeURIComponent(s),l=o.getQsParam("locale").replace("-","_");"1"===o.getQsParam("v")?function(){const e=o.getQsParam("data");if(!e)return void p("No data.");i=o.b64Decode(e)}():function(){let e=null;try{e=JSON.parse(o.b64Decode(o.getQsParam("data")))}catch(t){return void p("Cannot parse data.")}i=e.data}(),c=!0}function g(e){return r(this,void 0,void 0,(function*(){const t=`locales/${e}/messages.json?cache=y4t72`,n=yield fetch(t);return yield n.json()}))}function m(e){var t;return(null===(t=u[e])||void 0===t?void 0:t.message)||""}function y(){if(d)return;if(!("credentials"in navigator))return void p(m("webAuthnNotSupported"));if(f(),!i)return void p("No data.");let e;try{e=a.parseWebauthnJson(i)}catch(t){return void p("Cannot parse data.")}!function(e){r(this,void 0,void 0,(function*(){try{const t=yield navigator.credentials.get({publicKey:e});if(d)return;const n=a.buildDataString(t),r=document.getElementById("remember").checked;window.postMessage({command:"webAuthnResult",data:n,remember:r},"*"),d=!0,function(e){document.getElementById("webauthn-button").disabled=!0;const t=document.getElementById("msg");b(t),t.textContent=e,t.classList.add("alert"),t.classList.add("alert-success")}(m("webAuthnSuccess"))}catch(t){p(t)}}))}(e)}function p(e){const t=document.getElementById("msg");b(t),t.textContent=e,t.classList.add("alert"),t.classList.add("alert-danger")}function b(e){e.classList.remove("alert"),e.classList.remove("alert-danger"),e.classList.remove("alert-success")}document.addEventListener("DOMContentLoaded",(()=>r(void 0,void 0,void 0,(function*(){f();try{u=yield g(l)}catch(n){console.error("Failed to load the locale",l),u=yield g("en")}document.getElementById("msg").innerText=m("webAuthnFallbackMsg"),document.getElementById("remember-label").innerText=m("rememberMe");const e=document.getElementById("webauthn-button");e.innerText=m("webAuthnAuthenticate"),e.onclick=y,document.getElementById("spinner").classList.add("d-none");const t=document.getElementById("content");t.classList.add("d-block"),t.classList.remove("d-none")}))))},48672:(e,t,n)=>{n.r(t)}},t={};function n(r){var o=t[r];if(void 0!==o)return o.exports;var a=t[r]={exports:{}};return e[r].call(a.exports,a,a.exports,n),a.exports}n.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};n(45649)})();
//# sourceMappingURL=webauthn-fallback.ace5efdd63479eac29e1.js.map