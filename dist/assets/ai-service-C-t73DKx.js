var te=Object.defineProperty;var re=(r,e,t)=>e in r?te(r,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[e]=t;var E=(r,e,t)=>re(r,typeof e!="symbol"?e+"":e,t);import{r as I}from"./globals-DzwM7_cI.js";const C={general:{extensionName:"AI Group Poster",theme:"dark",notificationsEnabled:!0,defaultLanguage:"Bangla"},queue:{autoOpenNextGroup:!0,requireConfirmation:!0,delayBetweenItemsSec:0,maxItemsPerSession:50},ai:{provider:"openai",endpoint:"https://api.openai.com/v1",apiKey:"",model:"gpt-4o-mini",temperature:.7,defaultLanguage:"Bangla",defaultStyle:"Marketplace"},facebook:{supportedDomains:["facebook.com","web.facebook.com","m.facebook.com"],pageDetectionIntervalMs:1500,helperDockEnabled:!0,helperDockCollapsedDefault:!1},webhook:{enabled:!1,endpoint:"",secret:""},hasCompletedOnboarding:!1},j=[{id:"tpl_marketplace_sale",name:"Standard Marketplace Sale",content:`🔥 {product_name} 🔥

💰 Price: {price} {old_price_tag}

📝 Details:
{description}

✨ Key Features:
{features}

📍 Location: {location}
🚚 Delivery: {delivery_info}
📞 Contact: {contact_info}

👉 {call_to_action}`,variables:["product_name","price","old_price","description","features","location","delivery_info","contact_info","call_to_action"],isDefault:!0,createdAt:Date.now(),updatedAt:Date.now()},{id:"tpl_bike_vehicle",name:"Bike & Vehicle Sale",content:`🏍️ {product_name} For Sale

💵 Asking Price: {price}
📍 Location: {location}

📋 Condition & Description:
{description}

⚙️ Specifications:
{features}

📦 Delivery / Hand-to-Hand: {delivery_info}
📱 Call/WhatsApp: {contact_info}

{call_to_action}`,variables:["product_name","price","description","features","location","delivery_info","contact_info","call_to_action"],isDefault:!1,createdAt:Date.now(),updatedAt:Date.now()},{id:"tpl_minimal_quick",name:"Minimalist Quick Post",content:`{product_name}

Price: {price}
Location: {location}

{description}

Inbox for direct order!`,variables:["product_name","price","location","description"],isDefault:!1,createdAt:Date.now(),updatedAt:Date.now()}],p={GROUPS:"agp_groups",ACCOUNT_GROUPS:"agp_facebook_groups_by_account",POSTS:"agp_posts",TEMPLATES:"agp_templates",QUEUE:"agp_queue",QUEUE_STATE:"agp_queue_state",HISTORY:"agp_history",LOGS:"agp_logs",SETTINGS:"agp_settings",FACEBOOK_ACCOUNT:"agp_facebook_account"},K=()=>{var r;return typeof chrome<"u"&&!!((r=chrome.storage)!=null&&r.local)},_={};async function h(r,e){if(K())return new Promise(t=>{chrome.storage.local.get([r],n=>{if(chrome.runtime.lastError){console.warn(`Storage get error for ${r}:`,chrome.runtime.lastError),t(_[r]!==void 0?_[r]:e);return}n&&n[r]!==void 0?t(n[r]):t(e)})});try{if(typeof window<"u"&&window.localStorage){const t=window.localStorage.getItem(r);if(t!==null)return JSON.parse(t)}}catch(t){console.warn("LocalStorage access failed:",t)}return _[r]!==void 0?_[r]:e}async function b(r,e){if(_[r]=e,K())return new Promise((t,n)=>{chrome.storage.local.set({[r]:e},()=>{chrome.runtime.lastError?n(chrome.runtime.lastError):t()})});try{typeof window<"u"&&window.localStorage&&window.localStorage.setItem(r,JSON.stringify(e))}catch(t){console.warn("LocalStorage set failed:",t)}}function H(r){return r&&r.trim().toLowerCase().replace(/[^a-z0-9_\u0980-\u09FF]/gi,"_")||"default_account"}async function Y(){return h(p.ACCOUNT_GROUPS,{})}async function L(r){const e=await V(),t=H((e==null?void 0:e.userId)||(e==null?void 0:e.name)),n=await Y();if(n[t]&&Array.isArray(n[t].groups)&&n[t].groups.length>0){const s=n[t].groups.filter(c=>!A(c));if(s.length>0)return s}const a=(await h(p.GROUPS,[])).filter(i=>!A(i));if(a.length>0)return a;for(const i of Object.keys(n))if(n[i]&&Array.isArray(n[i].groups)&&n[i].groups.length>0){const s=n[i].groups.filter(c=>!A(c));if(s.length>0)return s}return[]}async function T(r,e){const t=(r||[]).filter(s=>!A(s)),n=await V(),o=H((n==null?void 0:n.userId)||(n==null?void 0:n.name)),a=await Y(),i=a[o]||{accountContext:o,accountInfo:n||{isLoggedIn:!0,name:"Facebook User",lastSyncedAt:Date.now()},groups:[],lastSyncedAt:Date.now()};a[o]={...i,groups:t,lastSyncedAt:Date.now()},await b(p.ACCOUNT_GROUPS,a),await b(p.GROUPS,t)}function A(r){if(!r)return!0;const e=(r.name||"").trim().toLowerCase(),t=(r.url||"").trim().toLowerCase();if(e.startsWith("unread")||e.includes("commented on")||e.includes("also commented")||e.includes("likes your")||e.includes("liked your")||e.includes("reacted to")||e.includes("shared a post")||e.includes("shared your post")||e.includes("invited you")||e.includes("mentioned you")||e.includes("requested to join")||e.includes("মন্তব্য করেছেন")||e.includes("মতামত দিয়েছেন")||e.includes("লাইক দিয়েছেন")||e.includes("শেয়ার করেছেন")||t.includes("/permalink/")||t.includes("/posts/")||t.includes("/user/")||t.includes("/profile.php")||t.includes("/friends/")||t.includes("/people/")||t.includes("/photos/")||t.includes("/videos/")||t.includes("/events/")||t.includes("/files/")||t.includes("comment_id=")||t.includes("notif_id=")||t.includes("notif_t=")||t.includes("reply_comment_id="))return!0;const n=new Set(["about","about group","feed","discover","create","notifications","search","categories","joins","settings","help","privacy","terms","policies","support","messages","marketplace"]),o=e.replace(/\s*group\s*$/i,"").trim();return!!(n.has(e)||n.has(o)||r.groupId&&n.has(r.groupId.toLowerCase()))}async function Ye(r){if(A(r)){console.warn(`[AGP:Storage] Blocked invalid notification group from being saved: ${r.name}`);return}const e=await L(),t=e.findIndex(n=>n.id===r.id);t>=0?e[t]=r:e.unshift(r),await T(e)}async function Qe(r){const t=(await L()).filter(n=>n.id!==r);await T(t)}async function D(){return h(p.POSTS,[])}async function O(r){await b(p.POSTS,r)}async function We(r){const e=await D(),t=e.findIndex(n=>n.id===r.id);t>=0?e[t]=r:e.unshift(r),await O(e)}async function ze(r){const t=(await D()).filter(n=>n.id!==r);await O(t)}async function Q(){return h(p.TEMPLATES,j)}async function x(r){await b(p.TEMPLATES,r)}async function Ve(r){const e=await Q(),t=e.findIndex(n=>n.id===r.id);t>=0?e[t]=r:e.push(r),await x(e)}async function Je(r){const t=(await Q()).filter(n=>n.id!==r);await x(t)}async function $(){return h(p.QUEUE,[])}async function v(r){await b(p.QUEUE,r)}async function Xe(){const e=(await $()).filter(t=>t.status!=="POSTED"&&t.status!=="SKIPPED");await v(e)}const W={isRunning:!1,isPaused:!1,currentItemId:null,activeTabId:null,sessionStartedAt:null,pacingDelayRemaining:0};async function Ze(){return h(p.QUEUE_STATE,W)}async function ne(r){await b(p.QUEUE_STATE,r)}async function oe(){return h(p.HISTORY,[])}async function U(r){await b(p.HISTORY,r)}async function z(r){const e=await oe();e.unshift(r),e.length>500&&(e.length=500),await U(e)}async function et(){await U([])}async function ae(){return h(p.LOGS,[])}async function M(r){await b(p.LOGS,r)}async function ie(r){const e=await ae();e.unshift(r),e.length>300&&(e.length=300),await M(e)}async function tt(){await M([])}async function R(){const r=await h(p.SETTINGS,C);return{...C,...r,general:{...C.general,...(r==null?void 0:r.general)||{}},queue:{...C.queue,...(r==null?void 0:r.queue)||{}},ai:{...C.ai,...(r==null?void 0:r.ai)||{}},facebook:{...C.facebook,...(r==null?void 0:r.facebook)||{}},webhook:{...C.webhook,...(r==null?void 0:r.webhook)||{}}}}async function se(r){const e=await R(),t={...e,...r,general:{...e.general,...r.general||{}},queue:{...e.queue,...r.queue||{}},ai:{...e.ai,...r.ai||{}},facebook:{...e.facebook,...r.facebook||{}},webhook:{...e.webhook,...r.webhook||{}}};return await b(p.SETTINGS,t),t}async function V(){return h(p.FACEBOOK_ACCOUNT,null)}async function rt(){await T([]),await O([]),await x(j),await v([]),await ne(W),await U([]),await M([]),await se(C)}function N(r="id"){const e=Math.random().toString(36).substring(2,9),t=Date.now().toString(36);return`${r}_${t}_${e}`}function nt(r){return r?new Date(r).toLocaleDateString(void 0,{year:"numeric",month:"short",day:"numeric"}):"—"}function ot(r){return r?new Date(r).toLocaleTimeString(void 0,{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!1}):"—"}async function at(r){if(!r)return!1;try{if(navigator.clipboard&&window.isSecureContext)return await navigator.clipboard.writeText(r),!0}catch(e){console.warn("Navigator clipboard failed, attempting execCommand fallback",e)}try{const e=document.createElement("textarea");e.value=r,e.style.position="fixed",e.style.left="-999999px",e.style.top="-999999px",document.body.appendChild(e),e.focus(),e.select();const t=document.execCommand("copy");return document.body.removeChild(e),t}catch(e){return console.error("Copy to clipboard failed completely:",e),!1}}function it(r,e,t="application/json"){const n=new Blob([e],{type:t}),o=URL.createObjectURL(n),a=document.createElement("a");a.href=o,a.download=r,document.body.appendChild(a),a.click(),document.body.removeChild(a),URL.revokeObjectURL(o)}function st(r){if(!r)return"";if(!r.includes("{")||!r.includes("|"))return r;let e=r,t=0;const n=/\{([^{}]+)\}/g;for(;t<10&&n.test(e);)t++,e=e.replace(n,(o,a)=>{if(a.includes("|")){const i=a.split("|").map(s=>s.trim()).filter(Boolean);if(i.length>0)return i[Math.floor(Math.random()*i.length)]}return o});return e=e.replace(/\{([^{}\r\n]+?)(?=[.,!?\r\n]|$)/g,(o,a)=>a.includes("|")?a.split("|").map(s=>s.trim()).filter(Boolean)[0]||"":o),e}class ce extends Error{constructor(e,t,n){super(n||`Invalid queue transition from ${e} to ${t}`),this.from=e,this.to=t,this.name="QueueTransitionError"}}const ue={PENDING:["READY","IN_PROGRESS","SKIPPED","FAILED","POSTED"],READY:["IN_PROGRESS","SKIPPED","PENDING","FAILED","POSTED"],IN_PROGRESS:["WAITING_FOR_USER","FAILED","SKIPPED","READY","POSTED"],WAITING_FOR_USER:["POSTED","SKIPPED","FAILED","READY","IN_PROGRESS"],POSTED:["READY"],SKIPPED:["READY","PENDING"],FAILED:["READY","PENDING","SKIPPED"]};function le(r,e){if(r===e)return!0;const t=ue[r];return!!(t&&t.includes(e))}function de(r,e,t){if(!le(r.status,e))throw new ce(r.status,e);const n=Date.now(),o={...r,status:e};return e==="IN_PROGRESS"&&!r.startedAt&&(o.startedAt=n),(e==="POSTED"||e==="SKIPPED"||e==="FAILED")&&(o.completedAt=n),e==="FAILED"?(o.errorMessage="Operation failed",o.retryCount=(r.retryCount||0)+1):e==="READY"&&r.status==="FAILED"&&(o.errorMessage=void 0),o}class pe{async writeLog(e,t,n,o){const a={id:N("log"),timestamp:Date.now(),level:e,source:t,message:n,details:o},i=`[AGP:${t.toUpperCase()}][${e}]`;e==="ERROR"?console.error(i,n,o||""):e==="WARNING"?console.warn(i,n,o||""):console.log(i,n,o||"");try{await ie(a)}catch(s){console.warn("Failed to persist log entry:",s)}return a}info(e,t,n){return this.writeLog("INFO",e,t,n)}success(e,t,n){return this.writeLog("SUCCESS",e,t,n)}warning(e,t,n){return this.writeLog("WARNING",e,t,n)}error(e,t,n){return this.writeLog("ERROR",e,t,n)}}const S=new pe;function ct(r){const e={total:r.length,pending:0,ready:0,inProgress:0,waitingForUser:0,posted:0,skipped:0,failed:0};return r.forEach(t=>{switch(t.status){case"PENDING":e.pending++;break;case"READY":e.ready++;break;case"IN_PROGRESS":e.inProgress++;break;case"WAITING_FOR_USER":e.waitingForUser++;break;case"POSTED":e.posted++;break;case"SKIPPED":e.skipped++;break;case"FAILED":e.failed++;break}}),e}async function ut(r,e,t="READY"){const[n,o]=await Promise.all([L(),D()]),a=o.find(c=>c.id===e);let i=0;const s=r.map(c=>{i++;const u=n.find(d=>d.id===c||d.groupId===c||d.url&&d.url.includes(c)),l=(u==null?void 0:u.url)||(c.startsWith("http")?c:`https://www.facebook.com/groups/${c}/`);return{id:N("queue"),groupId:c,groupName:u?u.name:"Facebook Group",groupUrl:l,postId:e,caption:(a==null?void 0:a.caption)||(a==null?void 0:a.description)||void 0,media:void 0,status:t,order:i,createdAt:Date.now()}});return await v(s),await S.info("queue",`Created clean posting queue for ${s.length} groups`),s}async function lt(r,e){const t=await $(),n=t.findIndex(i=>i.id===r);if(n===-1)return t;const o=e==="UP"?n-1:n+1;if(o<0||o>=t.length)return t;const a=t[n];return t[n]=t[o],t[o]=a,t.forEach((i,s)=>{i.order=s+1}),await v(t),t}function dt(r){const e=r.find(t=>t.status==="READY");return e||r.find(t=>t.status==="PENDING")||null}async function J(r,e,t){const n=await $(),o=n.findIndex(i=>i.id===r);if(o===-1)throw new Error(`Queue item ${r} not found`);const a=de(n[o],e);return n[o]=a,await v(n),{queue:n,updatedItem:a}}async function pt(r,e){const{queue:t,updatedItem:n}=await J(r,"POSTED"),[o,a]=await Promise.all([L(),D()]),i=o.find(l=>l.id===n.groupId),s=a.find(l=>l.id===n.postId),c=n.startedAt?Math.max(1,Math.round((Date.now()-n.startedAt)/1e3)):void 0,u={id:N("hist"),queueItemId:n.id,groupId:n.groupId,groupName:i?i.name:"Unknown Group",groupUrl:i?i.url:"",postId:n.postId,postTitle:s?s.title:"Untitled Post",productName:s?s.productName:"",status:"POSTED",postedAt:Date.now(),notes:"User confirmed posting on Facebook",durationSeconds:c};return await z(u),i&&(i.postCount=(i.postCount||0)+1,i.lastPostedAt=Date.now(),i.status="POSTED",await T(o)),await S.success("queue",`Post marked as POSTED for group: ${i?i.name:n.groupId}`),n}async function ft(r,e="User skipped"){const{updatedItem:t}=await J(r,"SKIPPED"),[n,o]=await Promise.all([L(),D()]),a=n.find(c=>c.id===t.groupId),i=o.find(c=>c.id===t.postId),s={id:N("hist"),queueItemId:t.id,groupId:t.groupId,groupName:a?a.name:"Unknown Group",groupUrl:a?a.url:"",postId:t.postId,postTitle:i?i.title:"Untitled Post",productName:i?i.productName:"",status:"SKIPPED",postedAt:Date.now(),notes:e};return await z(s),await S.info("queue",`Post marked as SKIPPED for group: ${a?a.name:t.groupId}`),t}/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const fe=r=>r.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),X=(...r)=>r.filter((e,t,n)=>!!e&&e.trim()!==""&&n.indexOf(e)===t).join(" ").trim();/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var me={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ge=I.forwardRef(({color:r="currentColor",size:e=24,strokeWidth:t=2,absoluteStrokeWidth:n,className:o="",children:a,iconNode:i,...s},c)=>I.createElement("svg",{ref:c,...me,width:e,height:e,stroke:r,strokeWidth:n?Number(t)*24/Number(e):t,className:X("lucide",o),...s},[...i.map(([u,l])=>I.createElement(u,l)),...Array.isArray(a)?a:[a]]));/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f=(r,e)=>{const t=I.forwardRef(({className:n,...o},a)=>I.createElement(ge,{ref:a,iconNode:e,className:X(`lucide-${fe(r)}`,n),...o}));return t.displayName=`${r}`,t};/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const he=[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]],mt=f("Check",he);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ye=[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]],gt=f("ChevronDown",ye);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const we=[["path",{d:"m18 15-6-6-6 6",key:"153udz"}]],ht=f("ChevronUp",we);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Se=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]],yt=f("CircleCheck",Se);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const be=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]],wt=f("Clock",be);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ce=[["path",{d:"M12 13v8",key:"1l5pq0"}],["path",{d:"M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242",key:"1pljnt"}],["path",{d:"m8 17 4-4 4 4",key:"1quai1"}]],St=f("CloudUpload",Ce);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ke=[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]],bt=f("ExternalLink",ke);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Pe=[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",ry:"2",key:"1m3agn"}],["circle",{cx:"9",cy:"9",r:"2",key:"af1f0g"}],["path",{d:"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21",key:"1xmnt7"}]],Ct=f("Image",Pe);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ee=[["rect",{width:"7",height:"9",x:"3",y:"3",rx:"1",key:"10lvy0"}],["rect",{width:"7",height:"5",x:"14",y:"3",rx:"1",key:"16une8"}],["rect",{width:"7",height:"9",x:"14",y:"12",rx:"1",key:"1hutg5"}],["rect",{width:"7",height:"5",x:"3",y:"16",rx:"1",key:"ldoo1y"}]],kt=f("LayoutDashboard",Ee);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _e=[["path",{d:"M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71",key:"1cjeqo"}],["path",{d:"M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",key:"19qd67"}]],Pt=f("Link",_e);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ie=[["rect",{x:"14",y:"4",width:"4",height:"16",rx:"1",key:"zuxfzm"}],["rect",{x:"6",y:"4",width:"4",height:"16",rx:"1",key:"1okwgv"}]],Et=f("Pause",Ie);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ae=[["polygon",{points:"6 3 20 12 6 21 6 3",key:"1oa8hb"}]],_t=f("Play",Ae);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Le=[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",key:"v9h5vc"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",key:"3uifl3"}],["path",{d:"M8 16H3v5",key:"1cv678"}]],It=f("RefreshCw",Le);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const De=[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["path",{d:"m21 21-4.3-4.3",key:"1qie3q"}]],At=f("Search",De);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ve=[["polygon",{points:"5 4 15 12 5 20 5 4",key:"16p6eg"}],["line",{x1:"19",x2:"19",y1:"5",y2:"19",key:"futhcm"}]],Lt=f("SkipForward",ve);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Te=[["path",{d:"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",key:"4pj2yx"}],["path",{d:"M20 3v4",key:"1olli1"}],["path",{d:"M22 5h-4",key:"1gvqau"}],["path",{d:"M4 17v2",key:"vumght"}],["path",{d:"M5 18H3",key:"zchphs"}]],Dt=f("Sparkles",Te);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ne=[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]],vt=f("Trash2",Ne);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Re=[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["path",{d:"M16 3.13a4 4 0 0 1 0 7.75",key:"1da9ce"}]],Tt=f("Users",Re);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Oe=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],Nt=f("X",Oe);function G(r){const e=[];if(!r||typeof r!="string")return{valid:!1,errors:["URL is required"]};const t=r.trim();if(!t)return{valid:!1,errors:["URL cannot be empty"]};let n=t;/^https?:\/\//i.test(n)||(n="https://"+n);let o;try{o=new URL(n)}catch{return{valid:!1,errors:["Invalid URL format"]}}const a=["facebook.com","www.facebook.com","web.facebook.com","m.facebook.com"],i=o.hostname.toLowerCase();a.some(w=>i===w||i.endsWith("."+w))||e.push("URL must be a Facebook domain (e.g. facebook.com, web.facebook.com)");const c=o.pathname.split("/").filter(Boolean),u=c.indexOf("groups");if(u===-1||u>=c.length-1)return e.push("URL must point directly to a Facebook group (e.g. /groups/group_name)"),{valid:!1,errors:e};const l=decodeURIComponent(c[u+1]);if(!l||["feed","discover","joins","about","settings","notifications","search","categories","create","help","privacy","support"].includes(l.toLowerCase()))return e.push("URL must point to a specific group, not a feed or discovery page"),{valid:!1,errors:e};const y=c.slice(u+2).map(w=>w.toLowerCase()),P=["permalink","posts","user","photos","videos","events","files","stories"];if(y.some(w=>P.includes(w)))return e.push("URL points to an individual post or permalink inside a group, not the group itself"),{valid:!1,errors:e};if(o.searchParams.has("comment_id")||o.searchParams.has("notif_id")||o.searchParams.has("notif_t"))return e.push("URL is a notification or comment permalink, not a group page"),{valid:!1,errors:e};const m=`https://www.facebook.com/groups/${l}/`;return{valid:e.length===0,errors:e,cleanUrl:m,groupId:l}}function Rt(r,e,t){var i,s;if(!r)return!1;const n=G(r),o=n.valid?(i=n.groupId)==null?void 0:i.toLowerCase():null,a=n.valid?(s=n.cleanUrl)==null?void 0:s.toLowerCase():r.trim().toLowerCase();return e.some(c=>{var l,d;if(t&&c.id===t)return!1;if(c.url.trim().toLowerCase()===a)return!0;const u=G(c.url);return!!(u.valid&&(a&&((l=u.cleanUrl)==null?void 0:l.toLowerCase())===a||o&&((d=u.groupId)==null?void 0:d.toLowerCase())===o)||c.groupId&&o&&c.groupId.toLowerCase()===o)})}function Ot(r){const e=[];if(!r||typeof r!="object")return{valid:!1,errors:["Backup data must be a valid JSON object"]};const t=r;return Array.isArray(t.groups)||e.push('Missing or invalid "groups" array'),Array.isArray(t.posts)||e.push('Missing or invalid "posts" array'),t.settings&&typeof t.settings!="object"&&e.push('Invalid "settings" object format'),e.length>0?{valid:!1,errors:e}:{valid:!0,errors:[],parsed:r}}const q="agp_discovery_progress";function xe(){return{candidateCount:0,verifiedCount:0,duplicatesRemoved:0,rejectedCount:0,scrollIterations:0,mutationEvents:0,targetCount:null,targetCountStatus:"UNAVAILABLE",completionReason:null,scanDurationMs:0,lastNewGroupTimestamp:null}}const F={state:"NOT_CONNECTED",foundCount:0,importedCount:0,duplicateCount:0,errorCount:0,message:'Click "Sync Facebook Groups" to discover all joined groups.',debugMetrics:xe()};async function xt(){var r;return typeof chrome<"u"&&((r=chrome.storage)!=null&&r.local)?new Promise(e=>{chrome.storage.local.get([q],t=>{e(t[q]||F)})}):F}const $e={a:"ᴀ",b:"ʙ",c:"ᴄ",d:"ᴅ",e:"ᴇ",f:"ғ",g:"ɢ",h:"ʜ",i:"ɪ",j:"ᴊ",k:"ᴋ",l:"ʟ",m:"ᴍ",n:"ɴ",o:"ᴏ",p:"ᴘ",q:"ǫ",r:"ʀ",s:"s",t:"ᴛ",u:"ᴜ",v:"ᴠ",w:"ᴡ",x:"x",y:"ʏ",z:"ᴢ"},B={"ᴀ":"a",ʙ:"b","ᴄ":"c","ᴅ":"d","ᴇ":"e",ғ:"f",ɢ:"g",ʜ:"h",ɪ:"i","ᴊ":"j","ᴋ":"k",ʟ:"l","ᴍ":"m",ɴ:"n","ᴏ":"o","ᴘ":"p",ǫ:"q",ʀ:"r","ᴛ":"t","ᴜ":"u","ᴠ":"v","ᴡ":"w",ʏ:"y","ᴢ":"z"};function Ue(r,e){const t=r.charCodeAt(0);if(e==="normal")return Z(r);if(e==="small-caps"){const n=r.toLowerCase();return $e[n]||r}if(t>=65&&t<=90){const n=t-65;switch(e){case"sans-italic":return String.fromCodePoint(120328+n);case"sans-bold":return String.fromCodePoint(120276+n);case"sans-bold-italic":return String.fromCodePoint(120380+n);case"serif-bold":return String.fromCodePoint(119808+n);case"serif-italic":return String.fromCodePoint(119860+n);case"monospace":return String.fromCodePoint(120432+n);case"script":{const o={66:8492,69:8496,70:8497,72:8459,73:8464,76:8466,77:8499,82:8475};return String.fromCodePoint(o[t]||119964+n)}case"bold-script":return String.fromCodePoint(120016+n);case"fraktur":{const o={67:8493,72:8460,73:8465,82:8476,90:8488};return String.fromCodePoint(o[t]||120068+n)}case"bold-fraktur":return String.fromCodePoint(120172+n);case"double-struck":{const o={67:8450,72:8461,78:8469,80:8473,81:8474,82:8477,90:8484};return String.fromCodePoint(o[t]||120120+n)}case"bubble":return String.fromCodePoint(9398+n);case"bubble-black":return String.fromCodePoint(127312+n);case"square":return String.fromCodePoint(127280+n);case"square-black":return String.fromCodePoint(127344+n)}}if(t>=97&&t<=122){const n=t-97;switch(e){case"sans-italic":return String.fromCodePoint(120354+n);case"sans-bold":return String.fromCodePoint(120302+n);case"sans-bold-italic":return String.fromCodePoint(120406+n);case"serif-bold":return String.fromCodePoint(119834+n);case"serif-italic":return r==="h"?"ℎ":String.fromCodePoint(119886+n);case"monospace":return String.fromCodePoint(120458+n);case"script":{const o={101:8495,103:8458,111:8500};return String.fromCodePoint(o[t]||119990+n)}case"bold-script":return String.fromCodePoint(120042+n);case"fraktur":return String.fromCodePoint(120094+n);case"bold-fraktur":return String.fromCodePoint(120198+n);case"double-struck":return String.fromCodePoint(120146+n);case"bubble":return String.fromCodePoint(9424+n);case"bubble-black":return String.fromCodePoint(127312+n);case"square":return String.fromCodePoint(127280+n);case"square-black":return String.fromCodePoint(127344+n)}}if(t>=48&&t<=57){const n=t-48;switch(e){case"sans-bold":case"sans-bold-italic":return String.fromCodePoint(120812+n);case"serif-bold":return String.fromCodePoint(120782+n);case"monospace":return String.fromCodePoint(120822+n);case"double-struck":return String.fromCodePoint(120792+n);case"bubble":return n===0?"⓪":String.fromCodePoint(9312+(n-1));case"bubble-black":return n===0?"⓿":String.fromCodePoint(10122+(n-1));default:return r}}return r}function Z(r){if(B[r])return B[r];const e=r.codePointAt(0);return e?e===8462?"h":e===8492?"B":e===8496?"E":e===8497?"F":e===8459?"H":e===8464?"I":e===8466?"L":e===8499?"M":e===8475?"R":e===8495?"e":e===8458?"g":e===8500?"o":e===8493?"C":e===8460?"H":e===8465?"I":e===8476?"R":e===8488?"Z":e===8450?"C":e===8461?"H":e===8469?"N":e===8473?"P":e===8474?"Q":e===8477?"R":e===8484?"Z":e>=119808&&e<=119833?String.fromCharCode(65+(e-119808)):e>=119834&&e<=119859?String.fromCharCode(97+(e-119834)):e>=119860&&e<=119885?String.fromCharCode(65+(e-119860)):e>=119886&&e<=119911?String.fromCharCode(97+(e-119886)):e>=119912&&e<=119937?String.fromCharCode(65+(e-119912)):e>=119938&&e<=119963?String.fromCharCode(97+(e-119938)):e>=119964&&e<=119989?String.fromCharCode(65+(e-119964)):e>=119990&&e<=120015?String.fromCharCode(97+(e-119990)):e>=120016&&e<=120041?String.fromCharCode(65+(e-120016)):e>=120042&&e<=120067?String.fromCharCode(97+(e-120042)):e>=120068&&e<=120093?String.fromCharCode(65+(e-120068)):e>=120094&&e<=120119?String.fromCharCode(97+(e-120094)):e>=120172&&e<=120197?String.fromCharCode(65+(e-120172)):e>=120198&&e<=120223?String.fromCharCode(97+(e-120198)):e>=120120&&e<=120145?String.fromCharCode(65+(e-120120)):e>=120146&&e<=120171?String.fromCharCode(97+(e-120146)):e>=120276&&e<=120301?String.fromCharCode(65+(e-120276)):e>=120302&&e<=120327?String.fromCharCode(97+(e-120302)):e>=120328&&e<=120353?String.fromCharCode(65+(e-120328)):e>=120354&&e<=120379?String.fromCharCode(97+(e-120354)):e>=120380&&e<=120405?String.fromCharCode(65+(e-120380)):e>=120406&&e<=120431?String.fromCharCode(97+(e-120406)):e>=120432&&e<=120457?String.fromCharCode(65+(e-120432)):e>=120458&&e<=120483?String.fromCharCode(97+(e-120458)):e>=9398&&e<=9423?String.fromCharCode(65+(e-9398)):e>=9424&&e<=9449?String.fromCharCode(97+(e-9424)):e>=127312&&e<=127337?String.fromCharCode(65+(e-127312)):e>=127280&&e<=127305?String.fromCharCode(65+(e-127280)):e>=127344&&e<=127369?String.fromCharCode(65+(e-127344)):e>=120782&&e<=120791?String.fromCharCode(48+(e-120782)):e>=120792&&e<=120801?String.fromCharCode(48+(e-120792)):e>=120812&&e<=120821?String.fromCharCode(48+(e-120812)):e>=120822&&e<=120831?String.fromCharCode(48+(e-120822)):e===9450?"0":e>=9312&&e<=9320?String.fromCharCode(49+(e-9312)):e===9471?"0":e>=10122&&e<=10130?String.fromCharCode(49+(e-10122)):r:r}function k(r){if(!r)return"";const e=r.replace(/[\u0336\u0335\u0332]/g,"");let t="";for(const n of e)t+=Z(n);return t}function g(r,e){if(!r)return"";if(e==="normal")return k(r);if(e==="strikethrough")return r.replace(/[\u0336\u0335]/g,"").split("").map(a=>a===`
`||a==="\r"||a===" "?a:a+"̶").join("");if(e==="underline")return r.replace(/\u0332/g,"").split("").map(a=>a===`
`||a==="\r"||a===" "?a:a+"̲").join("");if(e==="uppercase")return k(r).toUpperCase();if(e==="lowercase")return k(r).toLowerCase();if(e==="titlecase")return k(r).replace(/\b\w+/g,a=>a.charAt(0).toUpperCase()+a.slice(1).toLowerCase());let t="";const n=k(r);for(const o of n)t+=Ue(o,e);return t}function $t(r){return Me(r,"bullet")}function Me(r,e){const t=o=>{switch(e){case"bullet":return"  • ";case"check":return"  ✓ ";case"arrow":return"  ➤ ";case"star":return"  ★ ";case"diamond":return"  ❖ ";case"number":return`  ${o+1}. `}};return r?r.split(`
`).map((o,a)=>{const i=o.trim();if(!i)return o;const s=i.replace(/^([•*\-–—✓✔➤➔★⭐◆❖]|\d+[\.\)])\s*/,"");return t(a)+s}).join(`
`):t(0)}function Ut(r){if(!r||!r.trim())return r;const t=k(r).split(`
`),n=[];let o=!1;for(let a=0;a<t.length;a++){const i=t[a],s=i.trim();if(!s){n.push("");continue}if(!o){o=!0,n.push(g(s,"sans-italic"));continue}if(/^(model|brand|device|item|condition|color|varient|variant)\s*[:=]/i.test(s)){const u=s.match(/^([^:=]+[:=]\s*)(.*)$/);if(u){const l=g(u[1],"sans-italic"),d=u[2];n.push(l+d);continue}}if((/^[•*\-–—✓✔➤➔★⭐◆❖]/.test(s)||/^(ram|rom|storage|storege|camera|battery|display|processor|chipset|condition|screen|charger|box|accessories|sound|sim|dual|official|unofficial|gaming|phone|fast)/i.test(s)||!s.includes(".")&&s.length<40&&!s.toLowerCase().includes("exchange")&&!s.toLowerCase().includes("price"))&&!s.toLowerCase().includes("exchange")&&!s.toLowerCase().includes("inbox")){const u=s.replace(/^[•*\-–—✓✔➤➔★⭐◆❖\s]+/,"");n.push("  • "+u);continue}if(s.toLowerCase().includes("exchange")||s.toLowerCase().includes("price")||s.toLowerCase().includes("inbox")||s.toLowerCase().includes("call")||s.toLowerCase().includes("contact")||s.toLowerCase().includes("location")){n.push(g(s,"sans-italic"));continue}n.push(i)}return n.join(`
`)}function Mt(r){if(!r||!r.trim())return"";if(typeof DOMParser<"u")try{const n=new DOMParser().parseFromString(r,"text/html");if(n&&n.body){n.querySelectorAll('i, em, span[style*="italic"]').forEach(a=>{const i=a.textContent||"";i.trim()&&(a.textContent=g(i,"sans-italic"))}),n.querySelectorAll('b, strong, span[style*="bold"], span[style*="700"]').forEach(a=>{const i=a.textContent||"";i.trim()&&(a.textContent=g(i,"sans-bold"))}),n.querySelectorAll('s, strike, del, span[style*="line-through"]').forEach(a=>{const i=a.textContent||"";i.trim()&&(a.textContent=g(i,"strikethrough"))}),n.querySelectorAll('u, ins, span[style*="underline"]').forEach(a=>{const i=a.textContent||"";i.trim()&&(a.textContent=g(i,"underline"))}),n.querySelectorAll("li").forEach(a=>{const i=(a.textContent||"").trim();a.textContent="  • "+i+`
`}),n.querySelectorAll("br").forEach(a=>a.replaceWith(`
`)),n.querySelectorAll("p, div").forEach(a=>{a.appendChild(document.createTextNode(`
`))});const o=(n.body.textContent||"").trim();if(o.length>0)return o.replace(/\r\n/g,`
`).replace(/\r/g,`
`).replace(/\n{3,}/g,`

`).trim()}}catch{}let e=r;return e=e.replace(/<(i|em)\b[^>]*>(.*?)<\/\1>/gi,(t,n,o)=>g(o,"sans-italic")),e=e.replace(/<(b|strong)\b[^>]*>(.*?)<\/\1>/gi,(t,n,o)=>g(o,"sans-bold")),e=e.replace(/<(s|del|strike)\b[^>]*>(.*?)<\/\1>/gi,(t,n,o)=>g(o,"strikethrough")),e=e.replace(/<(u|ins)\b[^>]*>(.*?)<\/\1>/gi,(t,n,o)=>g(o,"underline")),e=e.replace(/<li\b[^>]*>(.*?)<\/li>/gi,(t,n)=>"  • "+n.trim()+`
`),e=e.replace(/<br\s*\/?>/gi,`
`),e=e.replace(/<\/(p|div)>/gi,`
`),e=e.replace(/<[^>]+>/g,""),e.replace(/\r\n/g,`
`).replace(/\r/g,`
`).replace(/\n{3,}/g,`

`).trim()}const Gt=[{name:"Double Line (সমান লাইন)",value:"══════════════════════════════"},{name:"Thick Line (মোটা লাইন)",value:"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"},{name:"Thin Line (চিকন লাইন)",value:"──────────────────────────────"},{name:"Star Sparkle (তারকা বর্ডার)",value:"•┈┈┈••✦••┈┈┈••✦••┈┈┈••✦••┈┈┈•"},{name:"Flower Border (ফুলের বর্ডার)",value:"✿════════════════════════════✿"},{name:"Block Blocks (বক্স প্যাটার্ন)",value:"▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄"},{name:"Dashed Dots (ডট লাইন)",value:"┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈"},{name:"Double Arrow Star (স্টার অ্যারো)",value:"»»————-　★　————-««"}],qt=[{category:"🔥 Sales & Hot (হট ও অফার)",emojis:["🔥","⚡","💥","🚨","📢","🏷️","💯","🚀","⭐","✨","👑","🎯","💫","🌟"]},{category:"💰 Price & Shop (মূল্য ও কেনাকাটা)",emojis:["💰","💵","৳","💳","🛒","🛍️","📦","🎁","💎","🧾","🔖","🪙"]},{category:"📱 Tech & Gadget (মোবাইল ও গ্যাজেট)",emojis:["📱","💻","🖥️","🎧","⌚","📷","🔋","🔌","⚙️","📺","🎮","📸"]},{category:"🚚 Delivery & Place (ডেলিভারি ও ঠিকানা)",emojis:["🚚","🛵","🚗","🚲","🏠","📍","🌍","🕒","✈️","🏢","🗺️"]},{category:"📞 Contact & Social (যোগাযোগ ও ইনবক্স)",emojis:["📞","📱","💬","✉️","📩","📲","🤙","💌","🌐","🔔","🗨️"]},{category:"✅ Symbols & Badges (প্রতীক ও টিকচিহ্ন)",emojis:["✅","✔️","❌","👉","➔","➜","✦","★","❖","💎","🔴","🟢","🔹","🔸"]}],Ft=["🔥","⚡","💥","💰","৳","📍","🚚","📞","💬","👉","📦","🏷️","🚨","🚀","💯","🛒","👑","⭐","✨","✅","🎁","📱"],Bt=[{id:"price-cut",name:"Price Cut (ডিসকাউন্ট মূল্য)",icon:"💰",content:"💰 Regular Price: ̶২̶,̶৫̶০̶০̶ ৳  ➔  Offer Price: {price}"},{id:"cod-delivery",name:"Cash on Delivery (ক্যাশ অন ডেলিভারি)",icon:"🚚",content:"🚚 সারা বাংলাদেশে ক্যাশ অন হোম ডেলিভারি (প্রোডাক্ট দেখে পেমেন্ট করার সুবিধা)!"},{id:"location",name:"Location (ঠিকানা / লোকেশন)",icon:"📍",content:"📍 Location: {location}"},{id:"contact-whatsapp",name:"Phone / WhatsApp (কল ও হোয়াটসঅ্যাপ)",icon:"📞",content:"📞 Call / WhatsApp: {contact_info}"},{id:"condition-fresh",name:"100% Fresh Condition (কন্ডিশন)",icon:"⚡",content:"⚡ Condition: ১০০% ফুল ফ্রেশ, কোনো স্ক্র্যাচ বা সমস্যা নেই।"},{id:"warranty",name:"Warranty / Replacement (ওয়ারেন্টি)",icon:"🎁",content:"🎁 ৭ দিনের রিপ্লেসমেন্ট এবং ১ বছরের ফ্রি সার্ভিস ওয়ারেন্টি!"},{id:"urgency-stock",name:"Limited Stock (সীমিত স্টক সতর্কতা)",icon:"🚨",content:"🚨 Limited Stock Available! অফার শেষ হওয়ার আগেই দ্রুত অর্ডার করুন!"},{id:"inbox-cta",name:"Inbox CTA (ইনবক্স আহ্বান)",icon:"💬",content:"👉 অর্ডার করতে অথবা যেকোনো তথ্যের জন্য এখনই ইনবক্স করুন!"},{id:"exchange-offer",name:"Exchange Offer (এক্সচেঞ্জ অফার)",icon:"🔄",content:"🔄 যেকোনো ব্যবহৃত ফোন/ডিভাইসের সাথে এক্সচেঞ্জ পসিবল (শর্ত প্রযোজ্য)।"}],jt=[{id:"mobile-gadget-sale",name:"Mobile / Gadget Sale & Exchange",categoryName:"মোবাইল ও গ্যাজেট",icon:"📱",description:"Perfect for smartphones, tablets, and electronics sale or exchange.",template:`𝘴𝘢𝘭𝘦 𝘰𝘳 𝘦𝘹𝘤𝘩𝘢𝘯𝘨𝘦

𝘮𝘰𝘥𝘦𝘭 : {product_name}
  • 𝚁𝙰𝙼 / 𝚁𝙾𝙼 : 8GB / 128GB
  • 𝙲𝚊𝚖𝚎𝚛𝚊 : 100% Super Clear Lens
  • 𝙱𝚊𝚝𝚝𝚎𝚛𝚢 : 5000 mAh (Healthy backup)
  • 𝙲𝚘𝚗𝚍𝚒𝚝𝚒𝚘𝚗 : Full fresh, no scratch or internal issue

𝘑𝘦𝘬𝘰𝘯𝘰 𝘱𝘩𝘰𝘯𝘦 𝘦𝘳 𝘴𝘢𝘵𝘩𝘦 𝘦𝘹𝘤𝘩𝘢𝘯𝘨𝘦 𝘱𝘰𝘴𝘴𝘪𝘣𝘭𝘦 (𝘈𝘥𝘥 𝘭𝘢𝘨𝘣𝘦)
💰 𝘱𝘳𝘪𝘤𝘦 : {price}
📍 𝘭𝘰𝘤𝘢𝘵𝘪𝘰𝘯 : {location}
📞 𝘤𝘰𝘯𝘵𝘢𝘤𝘵 : {contact_info}`},{id:"ecommerce-flash-offer",name:"E-Commerce Magic Flash Sale",categoryName:"হট ডিল অফার",icon:"🔥",description:"High-converting layout with regular vs offer price, benefits, and COD guarantee.",template:`🔥 𝗠𝗔𝗚𝗜𝗖 𝗦𝗔𝗟𝗘 𝗢𝗙𝗙𝗘𝗥! 🔥
══════════════════════════════
{product_name}
══════════════════════════════

✨ 𝗞𝗲𝘆 𝗙𝗲𝗮𝘁𝘂𝗿𝗲𝘀:
  ✓ ১০০% অরিজিনাল এবং প্রিমিয়াম কোয়ালিটি
  ✓ সাথে পাচ্ছেন ৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি
  ✓ আকর্ষণীয় ডিজাইন ও দীর্ঘস্থায়ী ব্যবহার

💰 Regular Price: ̶২̶,̶৫̶০̶০̶ ৳
💥 Offer Price: {price}

🚚 সারা বাংলাদেশে ক্যাশ অন হোম ডেলিভারি!
📦 প্রোডাক্ট হাতে পেয়ে দেখে মূল্য পরিশোধের সুবিধা।

👉 অর্ডার করতে এখনই ইনবক্স করুন অথবা কল করুন:
📞 {contact_info}`},{id:"fashion-boutique-collection",name:"Fashion & Boutique Collection",categoryName:"পোশাক ও ফ্যাশন",icon:"👗",description:"Elegant design for clothing, footwear, watches, and boutique products.",template:`✨ 𝗡𝗲𝘄 𝗔𝗿𝗿𝗶𝘃𝗮𝗹 - 𝗘𝘅𝗰𝗹𝘂𝘀𝗶𝘃𝗲 𝗖𝗼𝗹𝗹𝗲𝗰𝘁𝗶𝗼𝗻 ✨
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👗 {product_name}

  ❖ ফেব্রিক: প্রিমিয়াম কোয়ালিটি সফট ফ্যাব্রিক
  ❖ সাইজ: M, L, XL, XXL এভেইলেবল
  ❖ কালার: ছবিতে দেখানো সেইম কালার
  ❖ ফিনিশিং: ১০০% নিখুঁত স্টিচিং ও আরামদায়ক

💵 ধামাকা প্রাইস: {price}
🚚 ডেলিভারি চার্জ: ঢাকা ৮০ টাকা, ঢাকার বাইরে ১৩০ টাকা।

📩 আপনার নাম, ঠিকানা ও মোবাইল নম্বর দিয়ে এখনই ইনবক্স করুন!`},{id:"bike-cycle-vehicle-sale",name:"Bike & Vehicle Sale Listing",categoryName:"বাইক ও সাইকেল",icon:"🏍️",description:"Detailed specifications for motorbikes, cycles, and cars.",template:`🏍️ 𝗙𝗼𝗿 𝗦𝗮𝗹𝗲 / বিক্রয় 🏍️
•┈┈┈••✦••┈┈┈••✦••┈┈┈••✦••┈┈┈•
{product_name}

  ➤ মডেল ও ইয়ার: 2023 Model
  ➤ কিলোমিটার রান: 12,500 km
  ➤ পেপারস: 2 Years Registration (All papers 100% OK)
  ➤ কন্ডিশন: একদম নতুনের মতো, এক টাকারও কাজ নেই

💰 আস্কিং প্রাইস: {price} (কিছুটা সম্মান করা হবে)
📍 লোকেশন: {location}
📞 সরাসরি কল দিন: {contact_info}`},{id:"short-punchy-deal",name:"Short & Punchy Flash Deal",categoryName:"শর্ট ডিল",icon:"⚡",description:"Quick 3-bullet listing for instant engagement on busy groups.",template:`⚡ 𝗙𝗟𝗔𝗦𝗛 𝗦𝗔𝗟𝗘 𝗔𝗟𝗘𝗥𝗧! ⚡

{product_name}
  • 100% Genuine & Authentic
  • Ready Stock Available
  • Instant Delivery Guaranteed

💰 Regular: ̶1̶9̶9̶9̶ ➔ Only: {price}
👉 দ্রুত ইনবক্স করুন, লিমিটেড স্টক!`},{id:"flat-room-property-rent",name:"Property & Flat Rent Listing",categoryName:"বাসা/ফ্ল্যাট ভাড়া",icon:"🏠",description:"Structured layout for apartment, room, or office space rentals.",template:`🏠 𝗙𝗹𝗮𝘁 / 𝗥𝗼𝗼𝗺 𝗥𝗲𝗻𝘁 🏠
──────────────────────────────
{product_name}

  ◆ অবস্থান: {location}
  ◆ বেডরুম ও বাথরুম: 2 Bed, 2 Bath, Balcony
  ◆ সুবিধা: 24h Security, Lift, Generator backup
  ◆ ভাড়া: {price} (Service charge included)

📞 বিস্তারিত জানতে ও সরাসরি ভিজিট করতে কল করুন:
📱 {contact_info}`}];function Kt(r){if(!r||typeof r!="string")return r||"";const e=r.trim();if(e.length<20)return r;const t=e.length,n=Math.floor(t/2);for(let a=-15;a<=15;a++){const i=n+a;if(i>10&&i<t){const s=e.slice(0,i).trim(),c=e.slice(i).trim();if(s.length>=15&&s===c)return s}}const o=e.split(`
`).filter(a=>a.trim().length>0);if(o.length>=2){const a=o[0].trim();if(a.length>=10){let i=a.length;for(;i<e.length;){const s=e.indexOf(a,i);if(s===-1)break;const c=e.slice(0,s).trim(),u=e.slice(s).trim();if(c.length>=20&&(c===u||u.startsWith(c)||c.startsWith(u)||c.length>30&&u.length>30&&c.slice(0,50)===u.slice(0,50)&&c.slice(-20)===u.slice(-20)))return c;i=s+a.length}}}if(e.length>60){const a=e.slice(0,35),i=e.indexOf(a,35);if(i>0){const s=e.slice(0,i).trim(),c=e.slice(i).trim();if(s.length>=25&&(s===c||c.startsWith(s.slice(0,Math.floor(s.length*.85)))))return s}}return r}class Ge{constructor(){E(this,"name","OpenAI")}buildSystemPrompt(e){return`You are an expert social media copywriter specializing in Facebook Marketplace and Facebook Group buy-and-sell posts.
Your goal is to write high-converting, attractive, clear captions that encourage genuine buyer engagement and inquiries.

Follow these rules:
1. Language: Write in ${e.language}. If language is Banglish, write Bengali phonetically in English alphabet like native Facebook sellers do. If Bangla, write in proper Bengali script. If English, write fluent, clean English.
2. Tone/Style: ${e.style}.
3. Formatting: Use neat line breaks, bullet points, and appropriate emojis to make the post readable and attractive.
4. Essential info: Highlight product name, price, key features, condition, and location clearly.
5. Safety: Do not make exaggerated false claims. Include a clear call to action (e.g. Inbox for details or call).`}buildUserPrompt(e){let t=`Create an engaging Facebook Group caption for the following product:
`;return t+=`Product Name: ${e.productName}
`,e.price&&(t+=`Price: ${e.price}
`),e.condition&&(t+=`Condition: ${e.condition}
`),e.location&&(t+=`Location: ${e.location}
`),e.productDetails&&(t+=`Product Details: ${e.productDetails}
`),e.targetAudience&&(t+=`Target Audience: ${e.targetAudience}
`),t+=`
Please output only the ready-to-post caption text.`,t}buildTransformPrompt(e,t,n){let o="";switch(e){case"shorten":o="Make this caption much shorter, concise, and punchy while retaining the product name, price, and primary call to action.";break;case"expand":o="Expand this caption by adding more engaging details, buyer benefits, and a stronger call to action.";break;case"make_professional":o="Rewrite this caption in a polished, professional, and trustworthy commercial tone.";break;case"make_natural":o="Rewrite this caption to sound very natural, friendly, and human, like an everyday local seller speaking directly to neighbors.";break;case"translate":o=`Translate and adapt this caption into ${n.targetLanguage||n.language}, keeping the same tone and formatting.`;break;case"regenerate":default:o="Rewrite this caption with a fresh, creative angle while keeping all the core product details intact.";break}return`${o}

Language to use: ${n.targetLanguage||n.language}
Style: ${n.style}

Original Caption:
"""
${t}
"""

Output only the revised caption text.`}async generateCaption(e,t){var a,i,s,c;const n=Date.now(),o=t.endpoint.replace(/\/+$/,"")+"/chat/completions";try{const u=await fetch(o,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t.apiKey}`},body:JSON.stringify({model:t.model||"gpt-4o-mini",temperature:t.temperature??.7,messages:[{role:"system",content:this.buildSystemPrompt(e)},{role:"user",content:this.buildUserPrompt(e)}]})});if(!u.ok){const y=await u.text();throw new Error(`OpenAI API error (${u.status}): ${y}`)}return{success:!0,content:((c=(s=(i=(a=(await u.json()).choices)==null?void 0:a[0])==null?void 0:i.message)==null?void 0:s.content)==null?void 0:c.trim())||"",provider:"openai",model:t.model,durationMs:Date.now()-n}}catch(u){const l=u instanceof Error?u.message:String(u);return{success:!1,content:"",provider:"openai",model:t.model,error:l,durationMs:Date.now()-n}}}async transformCaption(e,t,n,o){var s,c,u,l;const a=Date.now(),i=o.endpoint.replace(/\/+$/,"")+"/chat/completions";try{const d=await fetch(i,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${o.apiKey}`},body:JSON.stringify({model:o.model||"gpt-4o-mini",temperature:o.temperature??.7,messages:[{role:"system",content:this.buildSystemPrompt(n)},{role:"user",content:this.buildTransformPrompt(e,t,n)}]})});if(!d.ok){const m=await d.text();throw new Error(`OpenAI API error (${d.status}): ${m}`)}return{success:!0,content:((l=(u=(c=(s=(await d.json()).choices)==null?void 0:s[0])==null?void 0:c.message)==null?void 0:u.content)==null?void 0:l.trim())||"",provider:"openai",model:o.model,durationMs:Date.now()-a}}catch(d){const y=d instanceof Error?d.message:String(d);return{success:!1,content:"",provider:"openai",model:o.model,error:y,durationMs:Date.now()-a}}}}class qe{constructor(){E(this,"name","Google Gemini")}buildPrompt(e,t,n){const o=`You are an expert social media copywriter for Facebook Marketplace and Facebook Group buy-and-sell posts.
Write in language: ${e.targetLanguage||e.language}. (If Banglish, write colloquial Bengali in English alphabet. If Bangla, write in Bengali script. If English, write fluent English).
Style: ${e.style}.
Format with emojis, clean line breaks, and clear details.

Product Details:
Product Name: ${e.productName}
${e.price?`Price: ${e.price}`:""}
${e.condition?`Condition: ${e.condition}`:""}
${e.location?`Location: ${e.location}`:""}
${e.productDetails?`Details: ${e.productDetails}`:""}
${e.targetAudience?`Target Audience: ${e.targetAudience}`:""}
`;return t&&n?`${o}
Existing Caption:
"""
${n}
"""
Task: ${t.toUpperCase()} this caption according to the instructions above. Output only the final caption text.`:`${o}
Task: Generate an attractive, high-converting Facebook Group post caption. Output only the final caption text.`}async generateCaption(e,t){return this.executeGemini(this.buildPrompt(e),t)}async transformCaption(e,t,n,o){return this.executeGemini(this.buildPrompt(n,e,t),o)}async executeGemini(e,t){var c,u,l,d,y,P;const n=Date.now(),o=t.model||"gemini-1.5-flash",s=`${(t.endpoint||"https://generativelanguage.googleapis.com").replace(/\/+$/,"")}/v1beta/models/${o}:generateContent?key=${encodeURIComponent(t.apiKey)}`;try{const m=await fetch(s,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{role:"user",parts:[{text:e}]}],generationConfig:{temperature:t.temperature??.7}})});if(!m.ok){const ee=await m.text();throw new Error(`Gemini API error (${m.status}): ${ee}`)}return{success:!0,content:((P=(y=(d=(l=(u=(c=(await m.json()).candidates)==null?void 0:c[0])==null?void 0:u.content)==null?void 0:l.parts)==null?void 0:d[0])==null?void 0:y.text)==null?void 0:P.trim())||"",provider:"gemini",model:o,durationMs:Date.now()-n}}catch(m){const w=m instanceof Error?m.message:String(m);return{success:!1,content:"",provider:"gemini",model:o,error:w,durationMs:Date.now()-n}}}}class Fe{constructor(){E(this,"name","Custom API")}async generateCaption(e,t){return this.sendRequest("generate",e,t)}async transformCaption(e,t,n,o){return this.sendRequest(e,{...n,currentCaption:t},o)}async sendRequest(e,t,n){const o=Date.now(),a={"Content-Type":"application/json"};n.apiKey&&(a.Authorization=`Bearer ${n.apiKey}`,a["x-api-key"]=n.apiKey);try{const i=await fetch(n.endpoint,{method:"POST",headers:a,body:JSON.stringify({action:e,context:t,model:n.model,temperature:n.temperature})});if(!i.ok){const u=await i.text();throw new Error(`Custom API error (${i.status}): ${u}`)}const s=await i.json(),c=s.content||s.text||s.result||(typeof s=="string"?s:JSON.stringify(s));return{success:!0,content:String(c).trim(),provider:"custom",model:n.model||"custom-model",durationMs:Date.now()-o}}catch(i){const s=i instanceof Error?i.message:String(i);return{success:!1,content:"",provider:"custom",model:n.model||"custom-model",error:s,durationMs:Date.now()-o}}}}class Be{constructor(){E(this,"providers",{openai:new Ge,gemini:new qe,custom:new Fe})}getProvider(e){const t=this.providers[e];if(!t)throw new Error(`Unsupported AI provider: ${e}`);return t}async generateCaption(e,t){const n=await R(),o={provider:(t==null?void 0:t.provider)||n.ai.provider,endpoint:(t==null?void 0:t.endpoint)||n.ai.endpoint,apiKey:(t==null?void 0:t.apiKey)||n.ai.apiKey,model:(t==null?void 0:t.model)||n.ai.model,temperature:(t==null?void 0:t.temperature)??n.ai.temperature};if(!o.apiKey&&o.provider!=="custom")return{success:!1,content:"",provider:o.provider,model:o.model,error:`Please configure your ${o.provider.toUpperCase()} API key in Settings before generating captions.`};const a=this.getProvider(o.provider);await S.info("ai",`Generating caption using ${a.name} (${o.model})`);const i=await a.generateCaption(e,o);return i.success?await S.success("ai",`Caption generated successfully (${i.durationMs}ms)`):await S.error("ai",`Caption generation failed: ${i.error}`),i}async transformCaption(e,t,n,o){const a=await R(),i={provider:(o==null?void 0:o.provider)||a.ai.provider,endpoint:(o==null?void 0:o.endpoint)||a.ai.endpoint,apiKey:(o==null?void 0:o.apiKey)||a.ai.apiKey,model:(o==null?void 0:o.model)||a.ai.model,temperature:(o==null?void 0:o.temperature)??a.ai.temperature};if(!i.apiKey&&i.provider!=="custom")return{success:!1,content:"",provider:i.provider,model:i.model,error:`Please configure your ${i.provider.toUpperCase()} API key in Settings before transforming captions.`};const s=this.getProvider(i.provider);await S.info("ai",`Transforming caption (${e}) using ${s.name}`);const c=await s.transformCaption(e,t,n,i);return c.success?await S.success("ai",`Caption transformed (${e}) successfully`):await S.error("ai",`Caption transformation failed: ${c.error}`),c}}const Ht=new Be;export{U as $,Mt as A,Ht as B,yt as C,Gt as D,bt as E,Lt as F,ot as G,L as H,Ct as I,D as J,Q as K,kt as L,$ as M,oe as N,R as O,_t as P,S as Q,It as R,Dt as S,vt as T,Tt as U,Ot as V,T as W,Nt as X,O as Y,x as Z,v as _,Et as a,se as a0,W as a1,C as a2,Ze as a3,ae as a4,j as a5,ct as a6,Qe as a7,Ye as a8,ut as a9,ze as aa,We as ab,Xe as ac,lt as ad,et as ae,Je as af,Ve as ag,tt as ah,rt as ai,A as aj,$t as ak,pt as al,ft as am,dt as an,J as ao,ne as ap,wt as b,f as c,Rt as d,xt as e,Pt as f,V as g,At as h,mt as i,N as j,nt as k,it as l,Bt as m,Ft as n,Kt as o,at as p,St as q,st as r,ht as s,gt as t,jt as u,G as v,qt as w,Ut as x,g as y,Me as z};
