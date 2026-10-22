var ye=Object.defineProperty;var be=(t,e,n)=>e in t?ye(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n;var A=(t,e,n)=>be(t,typeof e!="symbol"?e+"":e,n);import{r as h,j as c}from"./globals-2hvNdZnn.js";const _={general:{extensionName:"AI Group Poster",theme:"dark",notificationsEnabled:!0,defaultLanguage:"Bangla"},queue:{autoOpenNextGroup:!0,requireConfirmation:!0,delayBetweenItemsSec:0,maxItemsPerSession:50},ai:{provider:"openai",endpoint:"https://api.openai.com/v1",apiKey:"",model:"gpt-4o-mini",temperature:.7,defaultLanguage:"Bangla",defaultStyle:"Marketplace"},facebook:{supportedDomains:["facebook.com","web.facebook.com","m.facebook.com"],pageDetectionIntervalMs:1500,helperDockEnabled:!0,helperDockCollapsedDefault:!1},webhook:{enabled:!1,endpoint:"",secret:""},hasCompletedOnboarding:!1},ne=[{id:"tpl_marketplace_sale",name:"Standard Marketplace Sale",content:`🔥 {product_name} 🔥

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

Inbox for direct order!`,variables:["product_name","price","location","description"],isDefault:!1,createdAt:Date.now(),updatedAt:Date.now()}],we={status:"IDLE",searchUrl:"",query:"",totalFound:0,joinedCount:0,requestedCount:0,alreadyJoinedCount:0,failedCount:0,skippedCount:0,currentIndex:0,currentGroupName:"",countdownSec:0,message:"Enter any Facebook search link to start auto-joining.",groups:[]},xe={searchUrl:"",delaySec:0,maxGroups:0,autoAnswerQuestions:!0,defaultAnswer:"Yes, I agree to the group rules and guidelines.",saveToGroups:!0,selectedCategory:"Auto Joined"},f={GROUPS:"agp_groups",ACCOUNT_GROUPS:"agp_facebook_groups_by_account",POSTS:"agp_posts",TEMPLATES:"agp_templates",QUEUE:"agp_queue",QUEUE_STATE:"agp_queue_state",HISTORY:"agp_history",LOGS:"agp_logs",SETTINGS:"agp_settings",FACEBOOK_ACCOUNT:"agp_facebook_account",AUTO_JOIN_STATE:"agp_auto_join_state",AUTO_JOIN_CONFIG:"agp_auto_join_config"},re=()=>{var t;return typeof chrome<"u"&&!!((t=chrome.storage)!=null&&t.local)},v={};async function b(t,e){if(re())return new Promise(n=>{chrome.storage.local.get([t],r=>{if(chrome.runtime.lastError){console.warn(`Storage get error for ${t}:`,chrome.runtime.lastError),n(v[t]!==void 0?v[t]:e);return}r&&r[t]!==void 0?n(r[t]):n(e)})});try{if(typeof window<"u"&&window.localStorage){const n=window.localStorage.getItem(t);if(n!==null)return JSON.parse(n)}}catch(n){console.warn("LocalStorage access failed:",n)}return v[t]!==void 0?v[t]:e}async function k(t,e){if(v[t]=e,re())return new Promise((n,r)=>{chrome.storage.local.set({[t]:e},()=>{chrome.runtime.lastError?r(chrome.runtime.lastError):n()})});try{typeof window<"u"&&window.localStorage&&window.localStorage.setItem(t,JSON.stringify(e))}catch(n){console.warn("LocalStorage set failed:",n)}}function ae(t){return t&&t.trim().toLowerCase().replace(/[^a-z0-9_\u0980-\u09FF]/gi,"_")||"default_account"}async function oe(){return b(f.ACCOUNT_GROUPS,{})}async function T(t){const e=await le(),n=ae((e==null?void 0:e.userId)||(e==null?void 0:e.name)),r=await oe();if(r[n]&&Array.isArray(r[n].groups)&&r[n].groups.length>0){const i=r[n].groups.filter(l=>!N(l));if(i.length>0)return i}const o=(await b(f.GROUPS,[])).filter(s=>!N(s));if(o.length>0)return o;for(const s of Object.keys(r))if(r[s]&&Array.isArray(r[s].groups)&&r[s].groups.length>0){const i=r[s].groups.filter(l=>!N(l));if(i.length>0)return i}return[]}async function U(t,e){const n=(t||[]).filter(i=>!N(i)),r=await le(),a=ae((r==null?void 0:r.userId)||(r==null?void 0:r.name)),o=await oe(),s=o[a]||{accountContext:a,accountInfo:r||{isLoggedIn:!0,name:"Facebook User",lastSyncedAt:Date.now()},groups:[],lastSyncedAt:Date.now()};o[a]={...s,groups:n,lastSyncedAt:Date.now()},await k(f.ACCOUNT_GROUPS,o),await k(f.GROUPS,n)}function N(t){if(!t)return!0;const e=(t.name||"").trim().toLowerCase(),n=(t.url||"").trim().toLowerCase();if(e.startsWith("unread")||e.includes("commented on")||e.includes("also commented")||e.includes("likes your")||e.includes("liked your")||e.includes("reacted to")||e.includes("shared a post")||e.includes("shared your post")||e.includes("invited you")||e.includes("mentioned you")||e.includes("requested to join")||e.includes("মন্তব্য করেছেন")||e.includes("মতামত দিয়েছেন")||e.includes("লাইক দিয়েছেন")||e.includes("শেয়ার করেছেন")||n.includes("/permalink/")||n.includes("/posts/")||n.includes("/user/")||n.includes("/profile.php")||n.includes("/friends/")||n.includes("/people/")||n.includes("/photos/")||n.includes("/videos/")||n.includes("/events/")||n.includes("/files/")||n.includes("comment_id=")||n.includes("notif_id=")||n.includes("notif_t=")||n.includes("reply_comment_id="))return!0;const r=new Set(["about","about group","feed","discover","create","notifications","search","categories","joins","settings","help","privacy","terms","policies","support","messages","marketplace"]),a=e.replace(/\s*group\s*$/i,"").trim();return!!(r.has(e)||r.has(a)||t.groupId&&r.has(t.groupId.toLowerCase()))}async function Tt(t){if(N(t)){console.warn(`[AGP:Storage] Blocked invalid notification group from being saved: ${t.name}`);return}const e=await T(),n=e.findIndex(r=>r.id===t.id);n>=0?e[n]=t:e.unshift(t),await U(e)}async function Dt(t){const n=(await T()).filter(r=>r.id!==t);await U(n)}async function D(){return b(f.POSTS,[])}async function F(t){await k(f.POSTS,t)}async function Lt(t){const e=await D(),n=e.findIndex(r=>r.id===t.id);n>=0?e[n]=t:e.unshift(t),await F(e)}async function jt(t){const n=(await D()).filter(r=>r.id!==t);await F(n)}async function se(){return b(f.TEMPLATES,ne)}async function B(t){await k(f.TEMPLATES,t)}async function Ot(t){const e=await se(),n=e.findIndex(r=>r.id===t.id);n>=0?e[n]=t:e.push(t),await B(e)}async function Rt(t){const n=(await se()).filter(r=>r.id!==t);await B(n)}async function H(){return b(f.QUEUE,[])}async function L(t){await k(f.QUEUE,t)}async function $t(){const e=(await H()).filter(n=>n.status!=="POSTED"&&n.status!=="SKIPPED");await L(e)}const ie={isRunning:!1,isPaused:!1,currentItemId:null,activeTabId:null,sessionStartedAt:null,pacingDelayRemaining:0};async function Ut(){return b(f.QUEUE_STATE,ie)}async function ke(t){await k(f.QUEUE_STATE,t)}async function Se(){return b(f.HISTORY,[])}async function K(t){await k(f.HISTORY,t)}async function ce(t){const e=await Se();e.unshift(t),e.length>500&&(e.length=500),await K(e)}async function Gt(){await K([])}async function Ce(){return b(f.LOGS,[])}async function z(t){await k(f.LOGS,t)}async function _e(t){const e=await Ce();e.unshift(t),e.length>300&&(e.length=300),await z(e)}async function Mt(){await z([])}async function M(){const t=await b(f.SETTINGS,_);return{..._,...t,general:{..._.general,...(t==null?void 0:t.general)||{}},queue:{..._.queue,...(t==null?void 0:t.queue)||{}},ai:{..._.ai,...(t==null?void 0:t.ai)||{}},facebook:{..._.facebook,...(t==null?void 0:t.facebook)||{}},webhook:{..._.webhook,...(t==null?void 0:t.webhook)||{}}}}async function Ee(t){const e=await M(),n={...e,...t,general:{...e.general,...t.general||{}},queue:{...e.queue,...t.queue||{}},ai:{...e.ai,...t.ai||{}},facebook:{...e.facebook,...t.facebook||{}},webhook:{...e.webhook,...t.webhook||{}}};return await k(f.SETTINGS,n),n}async function le(){return b(f.FACEBOOK_ACCOUNT,null)}async function qt(){await U([]),await F([]),await B(ne),await L([]),await ke(ie),await K([]),await z([]),await Ee(_)}async function Ft(){return b(f.AUTO_JOIN_STATE,we)}async function Bt(){return b(f.AUTO_JOIN_CONFIG,xe)}async function Ht(t){await k(f.AUTO_JOIN_CONFIG,t)}function G(t="id"){const e=Math.random().toString(36).substring(2,9),n=Date.now().toString(36);return`${t}_${n}_${e}`}function Kt(t){return t?new Date(t).toLocaleDateString(void 0,{year:"numeric",month:"short",day:"numeric"}):"—"}function zt(t){return t?new Date(t).toLocaleTimeString(void 0,{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!1}):"—"}async function Yt(t){if(!t)return!1;try{if(navigator.clipboard&&window.isSecureContext)return await navigator.clipboard.writeText(t),!0}catch(e){console.warn("Navigator clipboard failed, attempting execCommand fallback",e)}try{const e=document.createElement("textarea");e.value=t,e.style.position="fixed",e.style.left="-999999px",e.style.top="-999999px",document.body.appendChild(e),e.focus(),e.select();const n=document.execCommand("copy");return document.body.removeChild(e),n}catch(e){return console.error("Copy to clipboard failed completely:",e),!1}}function Qt(t,e,n="application/json"){const r=new Blob([e],{type:n}),a=URL.createObjectURL(r),o=document.createElement("a");o.href=a,o.download=t,document.body.appendChild(o),o.click(),document.body.removeChild(o),URL.revokeObjectURL(a)}function Jt(t){if(!t)return"";if(!t.includes("{")||!t.includes("|"))return t;let e=t,n=0;const r=/\{([^{}]+)\}/g;for(;n<10&&r.test(e);)n++,e=e.replace(r,(a,o)=>{if(o.includes("|")){const s=o.split("|").map(i=>i.trim()).filter(Boolean);if(s.length>0)return s[Math.floor(Math.random()*s.length)]}return a});return e=e.replace(/\{([^{}\r\n]+?)(?=[.,!?\r\n]|$)/g,(a,o)=>o.includes("|")?o.split("|").map(i=>i.trim()).filter(Boolean)[0]||"":a),e}class Pe extends Error{constructor(e,n,r){super(r||`Invalid queue transition from ${e} to ${n}`),this.from=e,this.to=n,this.name="QueueTransitionError"}}const Ie={PENDING:["READY","IN_PROGRESS","SKIPPED","FAILED","POSTED"],READY:["IN_PROGRESS","SKIPPED","PENDING","FAILED","POSTED"],IN_PROGRESS:["WAITING_FOR_USER","FAILED","SKIPPED","READY","POSTED"],WAITING_FOR_USER:["POSTED","SKIPPED","FAILED","READY","IN_PROGRESS"],POSTED:["READY"],SKIPPED:["READY","PENDING"],FAILED:["READY","PENDING","SKIPPED"]};function Ae(t,e){if(t===e)return!0;const n=Ie[t];return!!(n&&n.includes(e))}function ve(t,e,n){if(!Ae(t.status,e))throw new Pe(t.status,e);const r=Date.now(),a={...t,status:e};return e==="IN_PROGRESS"&&!t.startedAt&&(a.startedAt=r),(e==="POSTED"||e==="SKIPPED"||e==="FAILED")&&(a.completedAt=r),e==="FAILED"?(a.errorMessage="Operation failed",a.retryCount=(t.retryCount||0)+1):e==="READY"&&t.status==="FAILED"&&(a.errorMessage=void 0),a}class Ne{async writeLog(e,n,r,a){const o={id:G("log"),timestamp:Date.now(),level:e,source:n,message:r,details:a},s=`[AGP:${n.toUpperCase()}][${e}]`;e==="ERROR"?console.error(s,r,a||""):e==="WARNING"?console.warn(s,r,a||""):console.log(s,r,a||"");try{await _e(o)}catch(i){console.warn("Failed to persist log entry:",i)}return o}info(e,n,r){return this.writeLog("INFO",e,n,r)}success(e,n,r){return this.writeLog("SUCCESS",e,n,r)}warning(e,n,r){return this.writeLog("WARNING",e,n,r)}error(e,n,r){return this.writeLog("ERROR",e,n,r)}}const S=new Ne;function Wt(t){const e={total:t.length,pending:0,ready:0,inProgress:0,waitingForUser:0,posted:0,skipped:0,failed:0};return t.forEach(n=>{switch(n.status){case"PENDING":e.pending++;break;case"READY":e.ready++;break;case"IN_PROGRESS":e.inProgress++;break;case"WAITING_FOR_USER":e.waitingForUser++;break;case"POSTED":e.posted++;break;case"SKIPPED":e.skipped++;break;case"FAILED":e.failed++;break}}),e}async function Vt(t,e,n="READY"){const[r,a]=await Promise.all([T(),D()]),o=a.find(l=>l.id===e);let s=0;const i=t.map(l=>{s++;const u=r.find(p=>p.id===l||p.groupId===l||p.url&&p.url.includes(l)),d=(u==null?void 0:u.url)||(l.startsWith("http")?l:`https://www.facebook.com/groups/${l}/`);return{id:G("queue"),groupId:l,groupName:u?u.name:"Facebook Group",groupUrl:d,postId:e,caption:(o==null?void 0:o.caption)||(o==null?void 0:o.description)||void 0,media:void 0,status:n,order:s,createdAt:Date.now()}});return await L(i),await S.info("queue",`Created clean posting queue for ${i.length} groups`),i}async function Zt(t,e){const n=await H(),r=n.findIndex(s=>s.id===t);if(r===-1)return n;const a=e==="UP"?r-1:r+1;if(a<0||a>=n.length)return n;const o=n[r];return n[r]=n[a],n[a]=o,n.forEach((s,i)=>{s.order=i+1}),await L(n),n}function Xt(t){const e=t.find(n=>n.status==="READY");return e||t.find(n=>n.status==="PENDING")||null}async function ue(t,e,n){const r=await H(),a=r.findIndex(s=>s.id===t);if(a===-1)throw new Error(`Queue item ${t} not found`);const o=ve(r[a],e);return r[a]=o,await L(r),{queue:r,updatedItem:o}}async function en(t,e){const{queue:n,updatedItem:r}=await ue(t,"POSTED"),[a,o]=await Promise.all([T(),D()]),s=a.find(d=>d.id===r.groupId),i=o.find(d=>d.id===r.postId),l=r.startedAt?Math.max(1,Math.round((Date.now()-r.startedAt)/1e3)):void 0,u={id:G("hist"),queueItemId:r.id,groupId:r.groupId,groupName:s?s.name:"Unknown Group",groupUrl:s?s.url:"",postId:r.postId,postTitle:i?i.title:"Untitled Post",productName:i?i.productName:"",status:"POSTED",postedAt:Date.now(),notes:"User confirmed posting on Facebook",durationSeconds:l};return await ce(u),s&&(s.postCount=(s.postCount||0)+1,s.lastPostedAt=Date.now(),s.status="POSTED",await U(a)),await S.success("queue",`Post marked as POSTED for group: ${s?s.name:r.groupId}`),r}async function tn(t,e="User skipped"){const{updatedItem:n}=await ue(t,"SKIPPED"),[r,a]=await Promise.all([T(),D()]),o=r.find(l=>l.id===n.groupId),s=a.find(l=>l.id===n.postId),i={id:G("hist"),queueItemId:n.id,groupId:n.groupId,groupName:o?o.name:"Unknown Group",groupUrl:o?o.url:"",postId:n.postId,postTitle:s?s.title:"Untitled Post",productName:s?s.productName:"",status:"SKIPPED",postedAt:Date.now(),notes:e};return await ce(i),await S.info("queue",`Post marked as SKIPPED for group: ${o?o.name:n.groupId}`),n}/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Te=t=>t.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),de=(...t)=>t.filter((e,n,r)=>!!e&&e.trim()!==""&&r.indexOf(e)===n).join(" ").trim();/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var De={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Le=h.forwardRef(({color:t="currentColor",size:e=24,strokeWidth:n=2,absoluteStrokeWidth:r,className:a="",children:o,iconNode:s,...i},l)=>h.createElement("svg",{ref:l,...De,width:e,height:e,stroke:t,strokeWidth:r?Number(n)*24/Number(e):n,className:de("lucide",a),...i},[...s.map(([u,d])=>h.createElement(u,d)),...Array.isArray(o)?o:[o]]));/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=(t,e)=>{const n=h.forwardRef(({className:r,...a},o)=>h.createElement(Le,{ref:o,iconNode:e,className:de(`lucide-${Te(t)}`,r),...a}));return n.displayName=`${t}`,n};/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const je=[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]],nn=m("Check",je);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Oe=[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]],rn=m("ChevronDown",Oe);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Re=[["path",{d:"m18 15-6-6-6 6",key:"153udz"}]],an=m("ChevronUp",Re);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $e=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]],Ue=m("CircleAlert",$e);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ge=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m16 12-4-4-4 4",key:"177agl"}],["path",{d:"M12 16V8",key:"1sbj14"}]],Me=m("CircleArrowUp",Ge);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const qe=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]],Fe=m("CircleCheck",qe);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Be=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]],on=m("Clock",Be);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const He=[["path",{d:"M12 13v8",key:"1l5pq0"}],["path",{d:"M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242",key:"1pljnt"}],["path",{d:"m8 17 4-4 4 4",key:"1quai1"}]],sn=m("CloudUpload",He);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ke=[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]],ze=m("ExternalLink",Ke);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ye=[["path",{d:"M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49",key:"ct8e1f"}],["path",{d:"M14.084 14.158a3 3 0 0 1-4.242-4.242",key:"151rxh"}],["path",{d:"M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143",key:"13bj9a"}],["path",{d:"m2 2 20 20",key:"1ooewy"}]],cn=m("EyeOff",Ye);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Qe=[["path",{d:"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",key:"1nclc0"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]],ln=m("Eye",Qe);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Je=[["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}],["line",{x1:"3",x2:"9",y1:"12",y2:"12",key:"1dyftd"}],["line",{x1:"15",x2:"21",y1:"12",y2:"12",key:"oup4p8"}]],We=m("GitCommitHorizontal",Je);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ve=[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",ry:"2",key:"1m3agn"}],["circle",{cx:"9",cy:"9",r:"2",key:"af1f0g"}],["path",{d:"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21",key:"1xmnt7"}]],un=m("Image",Ve);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ze=[["rect",{width:"7",height:"9",x:"3",y:"3",rx:"1",key:"10lvy0"}],["rect",{width:"7",height:"5",x:"14",y:"3",rx:"1",key:"16une8"}],["rect",{width:"7",height:"9",x:"14",y:"12",rx:"1",key:"1hutg5"}],["rect",{width:"7",height:"5",x:"3",y:"16",rx:"1",key:"ldoo1y"}]],dn=m("LayoutDashboard",Ze);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Xe=[["path",{d:"M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71",key:"1cjeqo"}],["path",{d:"M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",key:"19qd67"}]],pn=m("Link",Xe);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const et=[["rect",{x:"14",y:"4",width:"4",height:"16",rx:"1",key:"zuxfzm"}],["rect",{x:"6",y:"4",width:"4",height:"16",rx:"1",key:"1okwgv"}]],mn=m("Pause",et);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const tt=[["polygon",{points:"6 3 20 12 6 21 6 3",key:"1oa8hb"}]],fn=m("Play",tt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const nt=[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",key:"v9h5vc"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",key:"3uifl3"}],["path",{d:"M8 16H3v5",key:"1cv678"}]],R=m("RefreshCw",nt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const rt=[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["path",{d:"m21 21-4.3-4.3",key:"1qie3q"}]],gn=m("Search",rt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const at=[["polygon",{points:"5 4 15 12 5 20 5 4",key:"16p6eg"}],["line",{x1:"19",x2:"19",y1:"5",y2:"19",key:"futhcm"}]],hn=m("SkipForward",at);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ot=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M8 14s1.5 2 4 2 4-2 4-2",key:"1y1vjs"}],["line",{x1:"9",x2:"9.01",y1:"9",y2:"9",key:"yxxnd0"}],["line",{x1:"15",x2:"15.01",y1:"9",y2:"9",key:"1p4y9e"}]],yn=m("Smile",ot);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const st=[["path",{d:"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",key:"4pj2yx"}],["path",{d:"M20 3v4",key:"1olli1"}],["path",{d:"M22 5h-4",key:"1gvqau"}],["path",{d:"M4 17v2",key:"vumght"}],["path",{d:"M5 18H3",key:"zchphs"}]],it=m("Sparkles",st);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ct=[["polyline",{points:"4 17 10 11 4 5",key:"akl6gq"}],["line",{x1:"12",x2:"20",y1:"19",y2:"19",key:"q2wloq"}]],lt=m("Terminal",ct);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ut=[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]],bn=m("Trash2",ut);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const dt=[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["path",{d:"M16 3.13a4 4 0 0 1 0 7.75",key:"1da9ce"}]],wn=m("Users",dt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const pt=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],mt=m("X",pt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ft=[["path",{d:"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",key:"1xq2db"}]],gt=m("Zap",ft),Q="mdnahid7653959-spec/facebook-group-automation",ht="main",pe="http://127.0.0.1:3959",q="fb_auto_current_commit_sha",$="fb_auto_last_reloaded_at";function yt(t){try{const e=new Date(t).getTime();if(isNaN(e))return t;const n=Date.now(),r=Math.max(0,Math.floor((n-e)/1e3));if(r<60)return`${r}s ago`;const a=Math.floor(r/60);if(a<60)return`${a}m ago`;const o=Math.floor(a/60);if(o<24)return`${o}h ago`;const s=Math.floor(o/24);return s<30?`${s}d ago`:new Date(t).toLocaleDateString()}catch{return t}}async function bt(){return new Promise(t=>{var e;typeof chrome<"u"&&((e=chrome.storage)!=null&&e.local)?chrome.storage.local.get([q],n=>{t(n[q]||"a5bb018")}):t("a5bb018")})}async function J(t){return new Promise(e=>{var n;typeof chrome<"u"&&((n=chrome.storage)!=null&&n.local)?chrome.storage.local.set({[q]:t},()=>e()):e()})}async function wt(){return new Promise(t=>{var e;typeof chrome<"u"&&((e=chrome.storage)!=null&&e.local)?chrome.storage.local.set({[$]:Date.now()},()=>t()):t()})}async function xn(){return new Promise(t=>{var e;typeof chrome<"u"&&((e=chrome.storage)!=null&&e.local)?chrome.storage.local.get([$],n=>{const r=n[$];r&&Date.now()-r<2e4?(chrome.storage.local.remove([$]),t(!0)):t(!1)}):t(!1)})}async function xt(){var t,e,n;try{const r=`https://api.github.com/repos/${Q}/commits?sha=${ht}&per_page=1`,a=await fetch(r,{headers:{Accept:"application/vnd.github.v3+json"},cache:"no-store"});if(!a.ok)throw new Error(`GitHub API returned status ${a.status}`);const o=await a.json();if(!Array.isArray(o)||o.length===0)return null;const s=o[0],i=s.sha||"",l=s.commit||{},u=s.author||{},d=(l.message||"Updated code").split(`
`)[0],p=((t=l.author)==null?void 0:t.date)||((e=l.committer)==null?void 0:e.date)||new Date().toISOString();return{sha:i,shortSha:i.substring(0,7),message:d,author:u.login||((n=l.author)==null?void 0:n.name)||"Contributor",authorAvatar:u.avatar_url,date:p,relativeTime:yt(p),url:s.html_url||`https://github.com/${Q}/commit/${i}`}}catch(r){return console.warn("[AutoUpdater] Failed to fetch latest GitHub commit:",r),null}}async function W(){try{const t=new AbortController,e=setTimeout(()=>t.abort(),1200),n=await fetch(`${pe}/status`,{method:"GET",signal:t.signal});return clearTimeout(e),n.ok}catch{return!1}}async function kt(){try{const t=new AbortController,e=setTimeout(()=>t.abort(),6e4),n=await fetch(`${pe}/update-from-github`,{method:"POST",signal:t.signal});clearTimeout(e);const r=await n.json();return{success:r.success??r.ok??!0,message:r.message||"Extension successfully updated from GitHub and rebuilt!",output:r.output}}catch(t){return{success:!1,message:`Local companion update error: ${t.message||"Server did not respond"}`}}}function V(){wt().finally(()=>{var t;typeof chrome<"u"&&((t=chrome.runtime)!=null&&t.reload)?chrome.runtime.reload():window.location.reload()})}const kn=({isOpen:t,onClose:e,onShowToast:n})=>{const[r,a]=h.useState(null),[o,s]=h.useState(""),[i,l]=h.useState(!1),[u,d]=h.useState(!1),[p,w]=h.useState(!1),[C,g]=h.useState(null),[y,I]=h.useState(null);h.useEffect(()=>{t&&j()},[t]);const j=async()=>{l(!0),I(null);try{const[E,O]=await Promise.all([bt(),W()]);s(E),w(O);const Y=await xt();Y&&a(Y)}catch(E){I(E.message||"Could not verify update status")}finally{l(!1)}};if(!t)return null;const ge=!!(r&&o&&!r.sha.startsWith(o)&&!o.startsWith(r.sha)),he=async()=>{d(!0),g("Checking update source..."),I(null);try{if(await W()){g("Pulling from GitHub & building extension...");const O=await kt();if(!O.success)throw new Error(O.message);r!=null&&r.sha&&await J(r.sha),g("Rebuild complete! Reloading extension..."),n&&n("Extension updated from GitHub & reloading!"),setTimeout(()=>{V()},600)}else g("Reloading extension into Chrome..."),r!=null&&r.sha&&await J(r.sha),n&&n("Reloading extension with latest changes..."),setTimeout(()=>{V()},500)}catch(E){I(E.message||"Failed to complete update"),d(!1)}};return c.jsx("div",{className:"fixed inset-0 z-[100000] flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn",children:c.jsxs("div",{className:"w-full max-w-[360px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-800 dark:text-slate-100",children:[c.jsxs("div",{className:"px-4 py-3 bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-700 text-white flex items-center justify-between",children:[c.jsxs("div",{className:"flex items-center gap-2",children:[c.jsx("div",{className:"p-1.5 rounded-lg bg-white/20 backdrop-blur-sm",children:c.jsx(Me,{size:18,className:"text-white"})}),c.jsxs("div",{children:[c.jsx("h3",{className:"text-sm font-bold leading-tight",children:"Extension Updater"}),c.jsx("p",{className:"text-[10px] text-indigo-100",children:"GitHub Sync & Instant Reload"})]})]}),c.jsx("button",{onClick:e,disabled:u,className:"p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition",children:c.jsx(mt,{size:16})})]}),c.jsxs("div",{className:"p-4 space-y-3.5 text-xs max-h-[460px] overflow-y-auto",children:[c.jsxs("div",{className:"p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-2",children:[c.jsxs("div",{className:"flex items-center justify-between",children:[c.jsxs("span",{className:"font-bold text-[11px] text-slate-700 dark:text-slate-200 flex items-center gap-1.5",children:[c.jsx(We,{size:14,className:"text-indigo-500"}),"GitHub Repository"]}),c.jsxs("a",{href:"https://github.com/mdnahid7653959-spec/facebook-group-automation",target:"_blank",rel:"noreferrer",className:"text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5",children:[c.jsx("span",{children:"main branch"}),c.jsx(ze,{size:10})]})]}),i?c.jsxs("div",{className:"py-2 flex items-center justify-center gap-2 text-slate-400",children:[c.jsx(R,{size:13,className:"animate-spin text-indigo-500"}),c.jsx("span",{children:"Checking latest GitHub commit..."})]}):r?c.jsxs("div",{className:"space-y-1.5",children:[c.jsx("div",{className:"font-semibold text-slate-900 dark:text-slate-100 text-[11px] leading-snug line-clamp-2",children:r.message}),c.jsxs("div",{className:"flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-0.5",children:[c.jsxs("span",{className:"flex items-center gap-1",children:[c.jsx("span",{className:"px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[9px] text-slate-700 dark:text-slate-300 font-bold",children:r.shortSha}),c.jsxs("span",{children:["by ",r.author]})]}),c.jsx("span",{children:r.relativeTime})]})]}):c.jsx("div",{className:"text-[11px] text-slate-400 italic",children:"Could not connect to GitHub. Check internet connection."}),!i&&r&&c.jsx("div",{className:"pt-1",children:ge?c.jsxs("div",{className:"p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold flex items-center gap-2",children:[c.jsxs("span",{className:"relative flex h-2 w-2",children:[c.jsx("span",{className:"animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"}),c.jsx("span",{className:"relative inline-flex rounded-full h-2 w-2 bg-emerald-500"})]}),c.jsx("span",{children:"নতুন আপডেট GitHub-এ প্রস্তুত আছে!"})]}):c.jsxs("div",{className:"p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 text-[10px] flex items-center gap-1.5",children:[c.jsx(Fe,{size:12,className:"text-emerald-500 flex-shrink-0"}),c.jsx("span",{children:"আপনার এক্সটেনশনটি GitHub-এর সাথে সিঙ্ক আছে"})]})})]}),c.jsxs("div",{className:"p-2.5 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-[11px] space-y-1.5",children:[c.jsxs("div",{className:"flex items-center justify-between",children:[c.jsxs("span",{className:"font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5",children:[c.jsx(lt,{size:12,className:"text-indigo-500"}),"Local Companion Bridge"]}),c.jsx("span",{className:`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${p?"bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400":"bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`,children:p?"Active (Auto-Pull On)":"Offline (Reload On)"})]}),p?c.jsx("p",{className:"text-[10px] text-emerald-700 dark:text-emerald-400",children:"⚡ লোকাল ব্রিজ চালু আছে। ক্লিক করলেই অটোমেটিক git pull & build হয়ে এক্সটেনশন রিলোড হবে!"}):c.jsxs("p",{className:"text-[10px] text-slate-500 dark:text-slate-400 leading-tight",children:["💡 অটো গিট-পুল চালু করতে আপনার টার্মিনালে ",c.jsx("code",{className:"bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-400 font-mono font-bold",children:"npm run updater"})," চালান। (না চালালেও ",c.jsx("b",{children:"Instant Reload"})," কাজ করবে)।"]})]}),C&&c.jsxs("div",{className:"p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-[11px] flex items-center gap-2 animate-fadeIn",children:[c.jsx(R,{size:12,className:"animate-spin text-blue-500 flex-shrink-0"}),c.jsx("span",{children:C})]}),y&&c.jsxs("div",{className:"p-2 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-[11px] flex items-center gap-2 animate-fadeIn",children:[c.jsx(Ue,{size:12,className:"text-rose-500 flex-shrink-0"}),c.jsx("span",{children:y})]})]}),c.jsxs("div",{className:"p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2",children:[c.jsx("button",{onClick:j,disabled:i||u,className:"p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors",title:"Check GitHub for new updates",children:c.jsx(R,{size:14,className:i?"animate-spin text-indigo-500":""})}),c.jsx("button",{onClick:he,disabled:u,className:"flex-1 py-2.5 px-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50",children:u?c.jsxs(c.Fragment,{children:[c.jsx(R,{size:14,className:"animate-spin"}),c.jsx("span",{children:"Updating & Reloading..."})]}):p?c.jsxs(c.Fragment,{children:[c.jsx(it,{size:14,className:"text-yellow-300"}),c.jsx("span",{children:"1-Click Git Pull & Reload"})]}):c.jsxs(c.Fragment,{children:[c.jsx(gt,{size:14,className:"text-yellow-300"}),c.jsx("span",{children:"Instant Reload Extension"})]})})]})]})})};function Z(t){const e=[];if(!t||typeof t!="string")return{valid:!1,errors:["URL is required"]};const n=t.trim();if(!n)return{valid:!1,errors:["URL cannot be empty"]};let r=n;/^https?:\/\//i.test(r)||(r="https://"+r);let a;try{a=new URL(r)}catch{return{valid:!1,errors:["Invalid URL format"]}}const o=["facebook.com","www.facebook.com","web.facebook.com","m.facebook.com"],s=a.hostname.toLowerCase();o.some(y=>s===y||s.endsWith("."+y))||e.push("URL must be a Facebook domain (e.g. facebook.com, web.facebook.com)");const l=a.pathname.split("/").filter(Boolean),u=l.indexOf("groups");if(u===-1||u>=l.length-1)return e.push("URL must point directly to a Facebook group (e.g. /groups/group_name)"),{valid:!1,errors:e};const d=decodeURIComponent(l[u+1]);if(!d||["feed","discover","joins","about","settings","notifications","search","categories","create","help","privacy","support"].includes(d.toLowerCase()))return e.push("URL must point to a specific group, not a feed or discovery page"),{valid:!1,errors:e};const w=l.slice(u+2).map(y=>y.toLowerCase()),C=["permalink","posts","user","photos","videos","events","files","stories"];if(w.some(y=>C.includes(y)))return e.push("URL points to an individual post or permalink inside a group, not the group itself"),{valid:!1,errors:e};if(a.searchParams.has("comment_id")||a.searchParams.has("notif_id")||a.searchParams.has("notif_t"))return e.push("URL is a notification or comment permalink, not a group page"),{valid:!1,errors:e};const g=`https://www.facebook.com/groups/${d}/`;return{valid:e.length===0,errors:e,cleanUrl:g,groupId:d}}function Sn(t,e,n){var s,i;if(!t)return!1;const r=Z(t),a=r.valid?(s=r.groupId)==null?void 0:s.toLowerCase():null,o=r.valid?(i=r.cleanUrl)==null?void 0:i.toLowerCase():t.trim().toLowerCase();return e.some(l=>{var d,p;if(n&&l.id===n)return!1;if(l.url.trim().toLowerCase()===o)return!0;const u=Z(l.url);return!!(u.valid&&(o&&((d=u.cleanUrl)==null?void 0:d.toLowerCase())===o||a&&((p=u.groupId)==null?void 0:p.toLowerCase())===a)||l.groupId&&a&&l.groupId.toLowerCase()===a)})}function Cn(t){const e=[];if(!t||typeof t!="object")return{valid:!1,errors:["Backup data must be a valid JSON object"]};const n=t;return Array.isArray(n.groups)||e.push('Missing or invalid "groups" array'),Array.isArray(n.posts)||e.push('Missing or invalid "posts" array'),n.settings&&typeof n.settings!="object"&&e.push('Invalid "settings" object format'),e.length>0?{valid:!1,errors:e}:{valid:!0,errors:[],parsed:t}}const X="agp_discovery_progress";function St(){return{candidateCount:0,verifiedCount:0,duplicatesRemoved:0,rejectedCount:0,scrollIterations:0,mutationEvents:0,targetCount:null,targetCountStatus:"UNAVAILABLE",completionReason:null,scanDurationMs:0,lastNewGroupTimestamp:null}}const ee={state:"NOT_CONNECTED",foundCount:0,importedCount:0,duplicateCount:0,errorCount:0,message:'Click "Sync Facebook Groups" to discover all joined groups.',debugMetrics:St()};async function _n(){var t;return typeof chrome<"u"&&((t=chrome.storage)!=null&&t.local)?new Promise(e=>{chrome.storage.local.get([X],n=>{e(n[X]||ee)})}):ee}const Ct={a:"ᴀ",b:"ʙ",c:"ᴄ",d:"ᴅ",e:"ᴇ",f:"ғ",g:"ɢ",h:"ʜ",i:"ɪ",j:"ᴊ",k:"ᴋ",l:"ʟ",m:"ᴍ",n:"ɴ",o:"ᴏ",p:"ᴘ",q:"ǫ",r:"ʀ",s:"s",t:"ᴛ",u:"ᴜ",v:"ᴠ",w:"ᴡ",x:"x",y:"ʏ",z:"ᴢ"},te={"ᴀ":"a",ʙ:"b","ᴄ":"c","ᴅ":"d","ᴇ":"e",ғ:"f",ɢ:"g",ʜ:"h",ɪ:"i","ᴊ":"j","ᴋ":"k",ʟ:"l","ᴍ":"m",ɴ:"n","ᴏ":"o","ᴘ":"p",ǫ:"q",ʀ:"r","ᴛ":"t","ᴜ":"u","ᴠ":"v","ᴡ":"w",ʏ:"y","ᴢ":"z"};function _t(t,e){const n=t.charCodeAt(0);if(e==="normal")return me(t);if(e==="small-caps"){const r=t.toLowerCase();return Ct[r]||t}if(n>=65&&n<=90){const r=n-65;switch(e){case"sans-italic":return String.fromCodePoint(120328+r);case"sans-bold":return String.fromCodePoint(120276+r);case"sans-bold-italic":return String.fromCodePoint(120380+r);case"serif-bold":return String.fromCodePoint(119808+r);case"serif-italic":return String.fromCodePoint(119860+r);case"monospace":return String.fromCodePoint(120432+r);case"script":{const a={66:8492,69:8496,70:8497,72:8459,73:8464,76:8466,77:8499,82:8475};return String.fromCodePoint(a[n]||119964+r)}case"bold-script":return String.fromCodePoint(120016+r);case"fraktur":{const a={67:8493,72:8460,73:8465,82:8476,90:8488};return String.fromCodePoint(a[n]||120068+r)}case"bold-fraktur":return String.fromCodePoint(120172+r);case"double-struck":{const a={67:8450,72:8461,78:8469,80:8473,81:8474,82:8477,90:8484};return String.fromCodePoint(a[n]||120120+r)}case"bubble":return String.fromCodePoint(9398+r);case"bubble-black":return String.fromCodePoint(127312+r);case"square":return String.fromCodePoint(127280+r);case"square-black":return String.fromCodePoint(127344+r)}}if(n>=97&&n<=122){const r=n-97;switch(e){case"sans-italic":return String.fromCodePoint(120354+r);case"sans-bold":return String.fromCodePoint(120302+r);case"sans-bold-italic":return String.fromCodePoint(120406+r);case"serif-bold":return String.fromCodePoint(119834+r);case"serif-italic":return t==="h"?"ℎ":String.fromCodePoint(119886+r);case"monospace":return String.fromCodePoint(120458+r);case"script":{const a={101:8495,103:8458,111:8500};return String.fromCodePoint(a[n]||119990+r)}case"bold-script":return String.fromCodePoint(120042+r);case"fraktur":return String.fromCodePoint(120094+r);case"bold-fraktur":return String.fromCodePoint(120198+r);case"double-struck":return String.fromCodePoint(120146+r);case"bubble":return String.fromCodePoint(9424+r);case"bubble-black":return String.fromCodePoint(127312+r);case"square":return String.fromCodePoint(127280+r);case"square-black":return String.fromCodePoint(127344+r)}}if(n>=48&&n<=57){const r=n-48;switch(e){case"sans-bold":case"sans-bold-italic":return String.fromCodePoint(120812+r);case"serif-bold":return String.fromCodePoint(120782+r);case"monospace":return String.fromCodePoint(120822+r);case"double-struck":return String.fromCodePoint(120792+r);case"bubble":return r===0?"⓪":String.fromCodePoint(9312+(r-1));case"bubble-black":return r===0?"⓿":String.fromCodePoint(10122+(r-1));default:return t}}return t}function me(t){if(te[t])return te[t];const e=t.codePointAt(0);return e?e===8462?"h":e===8492?"B":e===8496?"E":e===8497?"F":e===8459?"H":e===8464?"I":e===8466?"L":e===8499?"M":e===8475?"R":e===8495?"e":e===8458?"g":e===8500?"o":e===8493?"C":e===8460?"H":e===8465?"I":e===8476?"R":e===8488?"Z":e===8450?"C":e===8461?"H":e===8469?"N":e===8473?"P":e===8474?"Q":e===8477?"R":e===8484?"Z":e>=119808&&e<=119833?String.fromCharCode(65+(e-119808)):e>=119834&&e<=119859?String.fromCharCode(97+(e-119834)):e>=119860&&e<=119885?String.fromCharCode(65+(e-119860)):e>=119886&&e<=119911?String.fromCharCode(97+(e-119886)):e>=119912&&e<=119937?String.fromCharCode(65+(e-119912)):e>=119938&&e<=119963?String.fromCharCode(97+(e-119938)):e>=119964&&e<=119989?String.fromCharCode(65+(e-119964)):e>=119990&&e<=120015?String.fromCharCode(97+(e-119990)):e>=120016&&e<=120041?String.fromCharCode(65+(e-120016)):e>=120042&&e<=120067?String.fromCharCode(97+(e-120042)):e>=120068&&e<=120093?String.fromCharCode(65+(e-120068)):e>=120094&&e<=120119?String.fromCharCode(97+(e-120094)):e>=120172&&e<=120197?String.fromCharCode(65+(e-120172)):e>=120198&&e<=120223?String.fromCharCode(97+(e-120198)):e>=120120&&e<=120145?String.fromCharCode(65+(e-120120)):e>=120146&&e<=120171?String.fromCharCode(97+(e-120146)):e>=120276&&e<=120301?String.fromCharCode(65+(e-120276)):e>=120302&&e<=120327?String.fromCharCode(97+(e-120302)):e>=120328&&e<=120353?String.fromCharCode(65+(e-120328)):e>=120354&&e<=120379?String.fromCharCode(97+(e-120354)):e>=120380&&e<=120405?String.fromCharCode(65+(e-120380)):e>=120406&&e<=120431?String.fromCharCode(97+(e-120406)):e>=120432&&e<=120457?String.fromCharCode(65+(e-120432)):e>=120458&&e<=120483?String.fromCharCode(97+(e-120458)):e>=9398&&e<=9423?String.fromCharCode(65+(e-9398)):e>=9424&&e<=9449?String.fromCharCode(97+(e-9424)):e>=127312&&e<=127337?String.fromCharCode(65+(e-127312)):e>=127280&&e<=127305?String.fromCharCode(65+(e-127280)):e>=127344&&e<=127369?String.fromCharCode(65+(e-127344)):e>=120782&&e<=120791?String.fromCharCode(48+(e-120782)):e>=120792&&e<=120801?String.fromCharCode(48+(e-120792)):e>=120812&&e<=120821?String.fromCharCode(48+(e-120812)):e>=120822&&e<=120831?String.fromCharCode(48+(e-120822)):e===9450?"0":e>=9312&&e<=9320?String.fromCharCode(49+(e-9312)):e===9471?"0":e>=10122&&e<=10130?String.fromCharCode(49+(e-10122)):t:t}function P(t){if(!t)return"";const e=t.replace(/[\u0336\u0335\u0332]/g,"");let n="";for(const r of e)n+=me(r);return n}function x(t,e){if(!t)return"";if(e==="normal")return P(t);if(e==="strikethrough")return t.replace(/[\u0336\u0335]/g,"").split("").map(o=>o===`
`||o==="\r"||o===" "?o:o+"̶").join("");if(e==="underline")return t.replace(/\u0332/g,"").split("").map(o=>o===`
`||o==="\r"||o===" "?o:o+"̲").join("");if(e==="uppercase")return P(t).toUpperCase();if(e==="lowercase")return P(t).toLowerCase();if(e==="titlecase")return P(t).replace(/\b\w+/g,o=>o.charAt(0).toUpperCase()+o.slice(1).toLowerCase());let n="";const r=P(t);for(const a of r)n+=_t(a,e);return n}function En(t){return fe(t,"bullet")}function fe(t,e){const n=a=>{switch(e){case"bullet":return"  • ";case"check":return"  ✓ ";case"arrow":return"  ➤ ";case"star":return"  ★ ";case"diamond":return"  ❖ ";case"number":return`  ${a+1}. `}};return t?t.split(`
`).map((a,o)=>{const s=a.trim();if(!s)return a;const i=s.replace(/^([•*\-–—✓✔➤➔★⭐◆❖]|\d+[\.\)])\s*/,"");return n(o)+i}).join(`
`):n(0)}function Pn(t,e=1){const n=e===1?"# ":"## ";return!t||!t.trim()?n:t.split(`
`).map(a=>{const o=a.trim();return o?o.startsWith("## ")?e===1?"# "+o.slice(3):o:o.startsWith("# ")?e===2?"## "+o.slice(2):o:n+o:a}).join(`
`)}function In(t){return!t||!t.trim()?"  1. ":fe(t,"number")}function An(t){return!t||!t.trim()?"> ":t.split(`
`).map(n=>{const r=n.trim();return r?r.startsWith("> ")?r:`> ${r}`:n}).join(`
`)}function vn(t){if(!t||!t.trim())return t;const n=P(t).split(`
`),r=[];let a=!1;for(let o=0;o<n.length;o++){const s=n[o],i=s.trim();if(!i){r.push("");continue}if(!a){a=!0,r.push(x(i,"sans-italic"));continue}if(/^(model|brand|device|item|condition|color|varient|variant)\s*[:=]/i.test(i)){const u=i.match(/^([^:=]+[:=]\s*)(.*)$/);if(u){const d=x(u[1],"sans-italic"),p=u[2];r.push(d+p);continue}}if((/^[•*\-–—✓✔➤➔★⭐◆❖]/.test(i)||/^(ram|rom|storage|storege|camera|battery|display|processor|chipset|condition|screen|charger|box|accessories|sound|sim|dual|official|unofficial|gaming|phone|fast)/i.test(i)||!i.includes(".")&&i.length<40&&!i.toLowerCase().includes("exchange")&&!i.toLowerCase().includes("price"))&&!i.toLowerCase().includes("exchange")&&!i.toLowerCase().includes("inbox")){const u=i.replace(/^[•*\-–—✓✔➤➔★⭐◆❖\s]+/,"");r.push("  • "+u);continue}if(i.toLowerCase().includes("exchange")||i.toLowerCase().includes("price")||i.toLowerCase().includes("inbox")||i.toLowerCase().includes("call")||i.toLowerCase().includes("contact")||i.toLowerCase().includes("location")){r.push(x(i,"sans-italic"));continue}r.push(s)}return r.join(`
`)}function Nn(t){if(!t||!t.trim())return"";if(typeof DOMParser<"u")try{const r=new DOMParser().parseFromString(t,"text/html");if(r&&r.body){r.querySelectorAll('i, em, span[style*="italic"]').forEach(o=>{const s=o.textContent||"";s.trim()&&(o.textContent=x(s,"sans-italic"))}),r.querySelectorAll('b, strong, span[style*="bold"], span[style*="700"]').forEach(o=>{const s=o.textContent||"";s.trim()&&(o.textContent=x(s,"sans-bold"))}),r.querySelectorAll('s, strike, del, span[style*="line-through"]').forEach(o=>{const s=o.textContent||"";s.trim()&&(o.textContent=x(s,"strikethrough"))}),r.querySelectorAll('u, ins, span[style*="underline"]').forEach(o=>{const s=o.textContent||"";s.trim()&&(o.textContent=x(s,"underline"))}),r.querySelectorAll("li").forEach(o=>{const s=(o.textContent||"").trim();o.textContent="  • "+s+`
`}),r.querySelectorAll("br").forEach(o=>o.replaceWith(`
`)),r.querySelectorAll("p, div").forEach(o=>{o.appendChild(document.createTextNode(`
`))});const a=(r.body.textContent||"").trim();if(a.length>0)return a.replace(/\r\n/g,`
`).replace(/\r/g,`
`).replace(/\n{3,}/g,`

`).trim()}}catch{}let e=t;return e=e.replace(/<(i|em)\b[^>]*>(.*?)<\/\1>/gi,(n,r,a)=>x(a,"sans-italic")),e=e.replace(/<(b|strong)\b[^>]*>(.*?)<\/\1>/gi,(n,r,a)=>x(a,"sans-bold")),e=e.replace(/<(s|del|strike)\b[^>]*>(.*?)<\/\1>/gi,(n,r,a)=>x(a,"strikethrough")),e=e.replace(/<(u|ins)\b[^>]*>(.*?)<\/\1>/gi,(n,r,a)=>x(a,"underline")),e=e.replace(/<li\b[^>]*>(.*?)<\/li>/gi,(n,r)=>"  • "+r.trim()+`
`),e=e.replace(/<br\s*\/?>/gi,`
`),e=e.replace(/<\/(p|div)>/gi,`
`),e=e.replace(/<[^>]+>/g,""),e.replace(/\r\n/g,`
`).replace(/\r/g,`
`).replace(/\n{3,}/g,`

`).trim()}const Tn=[{name:"Double Line (সমান লাইন)",value:"══════════════════════════════"},{name:"Thick Line (মোটা লাইন)",value:"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"},{name:"Thin Line (চিকন লাইন)",value:"──────────────────────────────"},{name:"Star Sparkle (তারকা বর্ডার)",value:"•┈┈┈••✦••┈┈┈••✦••┈┈┈••✦••┈┈┈•"},{name:"Flower Border (ফুলের বর্ডার)",value:"✿════════════════════════════✿"},{name:"Block Blocks (বক্স প্যাটার্ন)",value:"▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄"},{name:"Dashed Dots (ডট লাইন)",value:"┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈"},{name:"Double Arrow Star (স্টার অ্যারো)",value:"»»————-　★　————-««"}],Dn=[{category:"🔥 Sales & Hot (হট ও অফার)",emojis:["🔥","⚡","💥","🚨","📢","🏷️","💯","🚀","⭐","✨","👑","🎯","💫","🌟"]},{category:"💰 Price & Shop (মূল্য ও কেনাকাটা)",emojis:["💰","💵","৳","💳","🛒","🛍️","📦","🎁","💎","🧾","🔖","🪙"]},{category:"📱 Tech & Gadget (মোবাইল ও গ্যাজেট)",emojis:["📱","💻","🖥️","🎧","⌚","📷","🔋","🔌","⚙️","📺","🎮","📸"]},{category:"🚚 Delivery & Place (ডেলিভারি ও ঠিকানা)",emojis:["🚚","🛵","🚗","🚲","🏠","📍","🌍","🕒","✈️","🏢","🗺️"]},{category:"📞 Contact & Social (যোগাযোগ ও ইনবক্স)",emojis:["📞","📱","💬","✉️","📩","📲","🤙","💌","🌐","🔔","🗨️"]},{category:"✅ Symbols & Badges (প্রতীক ও টিকচিহ্ন)",emojis:["✅","✔️","❌","👉","➔","➜","✦","★","❖","💎","🔴","🟢","🔹","🔸"]}],Ln=["🔥","⚡","💥","💰","৳","📍","🚚","📞","💬","👉","📦","🏷️","🚨","🚀","💯","🛒","👑","⭐","✨","✅","🎁","📱"],jn=[{id:"price-cut",name:"Price Cut (ডিসকাউন্ট মূল্য)",icon:"💰",content:"💰 Regular Price: ̶২̶,̶৫̶০̶০̶ ৳  ➔  Offer Price: {price}"},{id:"cod-delivery",name:"Cash on Delivery (ক্যাশ অন ডেলিভারি)",icon:"🚚",content:"🚚 সারা বাংলাদেশে ক্যাশ অন হোম ডেলিভারি (প্রোডাক্ট দেখে পেমেন্ট করার সুবিধা)!"},{id:"location",name:"Location (ঠিকানা / লোকেশন)",icon:"📍",content:"📍 Location: {location}"},{id:"contact-whatsapp",name:"Phone / WhatsApp (কল ও হোয়াটসঅ্যাপ)",icon:"📞",content:"📞 Call / WhatsApp: {contact_info}"},{id:"condition-fresh",name:"100% Fresh Condition (কন্ডিশন)",icon:"⚡",content:"⚡ Condition: ১০০% ফুল ফ্রেশ, কোনো স্ক্র্যাচ বা সমস্যা নেই।"},{id:"warranty",name:"Warranty / Replacement (ওয়ারেন্টি)",icon:"🎁",content:"🎁 ৭ দিনের রিপ্লেসমেন্ট এবং ১ বছরের ফ্রি সার্ভিস ওয়ারেন্টি!"},{id:"urgency-stock",name:"Limited Stock (সীমিত স্টক সতর্কতা)",icon:"🚨",content:"🚨 Limited Stock Available! অফার শেষ হওয়ার আগেই দ্রুত অর্ডার করুন!"},{id:"inbox-cta",name:"Inbox CTA (ইনবক্স আহ্বান)",icon:"💬",content:"👉 অর্ডার করতে অথবা যেকোনো তথ্যের জন্য এখনই ইনবক্স করুন!"},{id:"exchange-offer",name:"Exchange Offer (এক্সচেঞ্জ অফার)",icon:"🔄",content:"🔄 যেকোনো ব্যবহৃত ফোন/ডিভাইসের সাথে এক্সচেঞ্জ পসিবল (শর্ত প্রযোজ্য)।"}],On=[{id:"mobile-gadget-sale",name:"Mobile / Gadget Sale & Exchange",categoryName:"মোবাইল ও গ্যাজেট",icon:"📱",description:"Perfect for smartphones, tablets, and electronics sale or exchange.",template:`𝘴𝘢𝘭𝘦 𝘰𝘳 𝘦𝘹𝘤𝘩𝘢𝘯𝘨𝘦

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
📱 {contact_info}`}];function Rn(t){if(!t||typeof t!="string")return t||"";const e=t.trim();if(e.length<30)return t;const n=e.length,r=Math.floor(n/2);for(let o=-15;o<=15;o++){const s=r+o;if(s>15&&s<n-15){const i=e.slice(0,s).trim(),l=e.slice(s).trim();if(i.length>=15&&i===l)return i}}const a=e.split(`
`).filter(o=>o.trim().length>0);if(a.length>=4){const o=Math.floor(a.length/2),s=a.slice(0,o).join(`
`).trim(),i=a.slice(o).join(`
`).trim();if(s.length>=25&&s===i)return s}return t}class Et{constructor(){A(this,"name","OpenAI")}buildSystemPrompt(e){return`You are an expert social media copywriter specializing in Facebook Marketplace and Facebook Group buy-and-sell posts.
Your goal is to write high-converting, attractive, clear captions that encourage genuine buyer engagement and inquiries.

Follow these rules:
1. Language: Write in ${e.language}. If language is Banglish, write Bengali phonetically in English alphabet like native Facebook sellers do. If Bangla, write in proper Bengali script. If English, write fluent, clean English.
2. Tone/Style: ${e.style}.
3. Formatting: Use neat line breaks, bullet points, and appropriate emojis to make the post readable and attractive.
4. Essential info: Highlight product name, price, key features, condition, and location clearly.
5. Safety: Do not make exaggerated false claims. Include a clear call to action (e.g. Inbox for details or call).`}buildUserPrompt(e){let n=`Create an engaging Facebook Group caption for the following product:
`;return n+=`Product Name: ${e.productName}
`,e.price&&(n+=`Price: ${e.price}
`),e.condition&&(n+=`Condition: ${e.condition}
`),e.location&&(n+=`Location: ${e.location}
`),e.productDetails&&(n+=`Product Details: ${e.productDetails}
`),e.targetAudience&&(n+=`Target Audience: ${e.targetAudience}
`),n+=`
Please output only the ready-to-post caption text.`,n}buildTransformPrompt(e,n,r){let a="";switch(e){case"shorten":a="Make this caption much shorter, concise, and punchy while retaining the product name, price, and primary call to action.";break;case"expand":a="Expand this caption by adding more engaging details, buyer benefits, and a stronger call to action.";break;case"make_professional":a="Rewrite this caption in a polished, professional, and trustworthy commercial tone.";break;case"make_natural":a="Rewrite this caption to sound very natural, friendly, and human, like an everyday local seller speaking directly to neighbors.";break;case"translate":a=`Translate and adapt this caption into ${r.targetLanguage||r.language}, keeping the same tone and formatting.`;break;case"regenerate":default:a="Rewrite this caption with a fresh, creative angle while keeping all the core product details intact.";break}return`${a}

Language to use: ${r.targetLanguage||r.language}
Style: ${r.style}

Original Caption:
"""
${n}
"""

Output only the revised caption text.`}async generateCaption(e,n){var o,s,i,l;const r=Date.now(),a=n.endpoint.replace(/\/+$/,"")+"/chat/completions";try{const u=await fetch(a,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${n.apiKey}`},body:JSON.stringify({model:n.model||"gpt-4o-mini",temperature:n.temperature??.7,messages:[{role:"system",content:this.buildSystemPrompt(e)},{role:"user",content:this.buildUserPrompt(e)}]})});if(!u.ok){const w=await u.text();throw new Error(`OpenAI API error (${u.status}): ${w}`)}return{success:!0,content:((l=(i=(s=(o=(await u.json()).choices)==null?void 0:o[0])==null?void 0:s.message)==null?void 0:i.content)==null?void 0:l.trim())||"",provider:"openai",model:n.model,durationMs:Date.now()-r}}catch(u){const d=u instanceof Error?u.message:String(u);return{success:!1,content:"",provider:"openai",model:n.model,error:d,durationMs:Date.now()-r}}}async transformCaption(e,n,r,a){var i,l,u,d;const o=Date.now(),s=a.endpoint.replace(/\/+$/,"")+"/chat/completions";try{const p=await fetch(s,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${a.apiKey}`},body:JSON.stringify({model:a.model||"gpt-4o-mini",temperature:a.temperature??.7,messages:[{role:"system",content:this.buildSystemPrompt(r)},{role:"user",content:this.buildTransformPrompt(e,n,r)}]})});if(!p.ok){const g=await p.text();throw new Error(`OpenAI API error (${p.status}): ${g}`)}return{success:!0,content:((d=(u=(l=(i=(await p.json()).choices)==null?void 0:i[0])==null?void 0:l.message)==null?void 0:u.content)==null?void 0:d.trim())||"",provider:"openai",model:a.model,durationMs:Date.now()-o}}catch(p){const w=p instanceof Error?p.message:String(p);return{success:!1,content:"",provider:"openai",model:a.model,error:w,durationMs:Date.now()-o}}}}class Pt{constructor(){A(this,"name","Google Gemini")}buildPrompt(e,n,r){const a=`You are an expert social media copywriter for Facebook Marketplace and Facebook Group buy-and-sell posts.
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
`;return n&&r?`${a}
Existing Caption:
"""
${r}
"""
Task: ${n.toUpperCase()} this caption according to the instructions above. Output only the final caption text.`:`${a}
Task: Generate an attractive, high-converting Facebook Group post caption. Output only the final caption text.`}async generateCaption(e,n){return this.executeGemini(this.buildPrompt(e),n)}async transformCaption(e,n,r,a){return this.executeGemini(this.buildPrompt(r,e,n),a)}async executeGemini(e,n){var l,u,d,p,w,C;const r=Date.now(),a=n.model||"gemini-1.5-flash",i=`${(n.endpoint||"https://generativelanguage.googleapis.com").replace(/\/+$/,"")}/v1beta/models/${a}:generateContent?key=${encodeURIComponent(n.apiKey)}`;try{const g=await fetch(i,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{role:"user",parts:[{text:e}]}],generationConfig:{temperature:n.temperature??.7}})});if(!g.ok){const j=await g.text();throw new Error(`Gemini API error (${g.status}): ${j}`)}return{success:!0,content:((C=(w=(p=(d=(u=(l=(await g.json()).candidates)==null?void 0:l[0])==null?void 0:u.content)==null?void 0:d.parts)==null?void 0:p[0])==null?void 0:w.text)==null?void 0:C.trim())||"",provider:"gemini",model:a,durationMs:Date.now()-r}}catch(g){const y=g instanceof Error?g.message:String(g);return{success:!1,content:"",provider:"gemini",model:a,error:y,durationMs:Date.now()-r}}}}class It{constructor(){A(this,"name","Custom API")}async generateCaption(e,n){return this.sendRequest("generate",e,n)}async transformCaption(e,n,r,a){return this.sendRequest(e,{...r,currentCaption:n},a)}async sendRequest(e,n,r){const a=Date.now(),o={"Content-Type":"application/json"};r.apiKey&&(o.Authorization=`Bearer ${r.apiKey}`,o["x-api-key"]=r.apiKey);try{const s=await fetch(r.endpoint,{method:"POST",headers:o,body:JSON.stringify({action:e,context:n,model:r.model,temperature:r.temperature})});if(!s.ok){const u=await s.text();throw new Error(`Custom API error (${s.status}): ${u}`)}const i=await s.json(),l=i.content||i.text||i.result||(typeof i=="string"?i:JSON.stringify(i));return{success:!0,content:String(l).trim(),provider:"custom",model:r.model||"custom-model",durationMs:Date.now()-a}}catch(s){const i=s instanceof Error?s.message:String(s);return{success:!1,content:"",provider:"custom",model:r.model||"custom-model",error:i,durationMs:Date.now()-a}}}}class At{constructor(){A(this,"providers",{openai:new Et,gemini:new Pt,custom:new It})}getProvider(e){const n=this.providers[e];if(!n)throw new Error(`Unsupported AI provider: ${e}`);return n}async generateCaption(e,n){const r=await M(),a={provider:(n==null?void 0:n.provider)||r.ai.provider,endpoint:(n==null?void 0:n.endpoint)||r.ai.endpoint,apiKey:(n==null?void 0:n.apiKey)||r.ai.apiKey,model:(n==null?void 0:n.model)||r.ai.model,temperature:(n==null?void 0:n.temperature)??r.ai.temperature};if(!a.apiKey&&a.provider!=="custom")return{success:!1,content:"",provider:a.provider,model:a.model,error:`Please configure your ${a.provider.toUpperCase()} API key in Settings before generating captions.`};const o=this.getProvider(a.provider);await S.info("ai",`Generating caption using ${o.name} (${a.model})`);const s=await o.generateCaption(e,a);return s.success?await S.success("ai",`Caption generated successfully (${s.durationMs}ms)`):await S.error("ai",`Caption generation failed: ${s.error}`),s}async transformCaption(e,n,r,a){const o=await M(),s={provider:(a==null?void 0:a.provider)||o.ai.provider,endpoint:(a==null?void 0:a.endpoint)||o.ai.endpoint,apiKey:(a==null?void 0:a.apiKey)||o.ai.apiKey,model:(a==null?void 0:a.model)||o.ai.model,temperature:(a==null?void 0:a.temperature)??o.ai.temperature};if(!s.apiKey&&s.provider!=="custom")return{success:!1,content:"",provider:s.provider,model:s.model,error:`Please configure your ${s.provider.toUpperCase()} API key in Settings before transforming captions.`};const i=this.getProvider(s.provider);await S.info("ai",`Transforming caption (${e}) using ${i.name}`);const l=await i.transformCaption(e,n,r,s);return l.success?await S.success("ai",`Caption transformed (${e}) successfully`):await S.error("ai",`Caption transformation failed: ${l.error}`),l}}const $n=new At;export{Se as $,Dn as A,vn as B,Fe as C,Tn as D,ze as E,Pn as F,x as G,fe as H,un as I,An as J,Nn as K,dn as L,$n as M,hn as N,zt as O,fn as P,lt as Q,R,it as S,bn as T,wn as U,T as V,D as W,mt as X,se as Y,gt as Z,H as _,mn as a,M as a0,S as a1,Cn as a2,U as a3,F as a4,B as a5,L as a6,K as a7,Ee as a8,cn as a9,En as aA,In as aB,en as aC,tn as aD,Xt as aE,ue as aF,ke as aG,ie as aa,_ as ab,Ut as ac,Ce as ad,ne as ae,Wt as af,Dt as ag,Tt as ah,Vt as ai,jt as aj,Lt as ak,$t as al,Zt as am,Gt as an,Rt as ao,Ot as ap,Mt as aq,qt as ar,we as as,Ft as at,Bt as au,N as av,xn as aw,xt as ax,bt as ay,Ht as az,kn as b,m as c,on as d,Sn as e,Ue as f,le as g,_n as h,pn as i,gn as j,nn as k,G as l,Kt as m,Qt as n,jn as o,Ln as p,yn as q,Jt as r,Rn as s,Yt as t,sn as u,Z as v,an as w,rn as x,ln as y,On as z};
