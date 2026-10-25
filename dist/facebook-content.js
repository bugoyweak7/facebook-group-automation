var Ft=Object.defineProperty;var zt=(Z,F,X)=>F in Z?Ft(Z,F,{enumerable:!0,configurable:!0,writable:!0,value:X}):Z[F]=X;var Q=(Z,F,X)=>zt(Z,typeof F!="symbol"?F+"":F,X);(function(){"use strict";function Z(t){const e=[];if(!t||typeof t!="string")return{valid:!1,errors:["URL is required"]};const o=t.trim();if(!o)return{valid:!1,errors:["URL cannot be empty"]};let n=o;/^https?:\/\//i.test(n)||(n="https://"+n);let r;try{r=new URL(n)}catch{return{valid:!1,errors:["Invalid URL format"]}}const s=["facebook.com","www.facebook.com","web.facebook.com","m.facebook.com"],c=r.hostname.toLowerCase();s.some(m=>c===m||c.endsWith("."+m))||e.push("URL must be a Facebook domain (e.g. facebook.com, web.facebook.com)");const a=r.pathname.split("/").filter(Boolean),l=a.indexOf("groups");if(l===-1||l>=a.length-1)return e.push("URL must point directly to a Facebook group (e.g. /groups/group_name)"),{valid:!1,errors:e};const d=decodeURIComponent(a[l+1]);if(!d||["feed","discover","joins","about","settings","notifications","search","categories","create","help","privacy","support"].includes(d.toLowerCase()))return e.push("URL must point to a specific group, not a feed or discovery page"),{valid:!1,errors:e};const g=a.slice(l+2).map(m=>m.toLowerCase()),u=["permalink","posts","user","photos","videos","events","files","stories"];if(g.some(m=>u.includes(m)))return e.push("URL points to an individual post or permalink inside a group, not the group itself"),{valid:!1,errors:e};if(r.searchParams.has("comment_id")||r.searchParams.has("notif_id")||r.searchParams.has("notif_t"))return e.push("URL is a notification or comment permalink, not a group page"),{valid:!1,errors:e};const f=`https://www.facebook.com/groups/${d}/`;return{valid:e.length===0,errors:e,cleanUrl:f,groupId:d}}const F={META_OG_TITLE:'meta[property="og:title"]',HEADER_H1:'h1[dir="auto"], h1 span'};function X(){if(typeof window>"u")return{isGroupPage:!1,groupIdOrSlug:"",groupName:"",canonicalUrl:"",isReady:!1};const t=window.location.href,e=Z(t);if(!e.valid||!e.groupId)return{isGroupPage:!1,groupIdOrSlug:"",groupName:"",canonicalUrl:t,isReady:!1};let o="";const n=document.querySelector(F.META_OG_TITLE);if(n&&n.content&&(o=n.content.replace(/\s*\|\s*Facebook.*$/i,"").trim()),!o){const s=document.querySelector(F.HEADER_H1);s&&s.innerText&&(o=s.innerText.trim())}!o&&document.title&&(o=document.title.replace(/\s*\|\s*Facebook.*$/i,"").trim()),o||(o=e.groupId.replace(/[-_.]+/g," "),o=o.charAt(0).toUpperCase()+o.slice(1));const r=document.readyState==="interactive"||document.readyState==="complete";return{isGroupPage:!0,groupIdOrSlug:e.groupId,groupName:o,canonicalUrl:e.cleanUrl||t,isReady:r}}const xe=new Set(["feed","discover","create","notifications","search","categories","joins","member-requests","expert_badge","settings","about","events","media","files","chats","manage","canvas","support","buy_sell_discussion","permalink","user","profile.php","hashtag","messages","marketplace","stories","reels","watch","gaming","members","photos","videos","posts"]),ue=new Set(["view group","visit","open","view","join","group","groups","view all","see all","see more","গ্রুপ দেখুন","দেখুন","সব দেখুন","যোগ দিন","গ্রুপে যান","আরও দেখুন"]);function xt(t){const e={"০":"0","১":"1","২":"2","৩":"3","৪":"4","৫":"5","৬":"6","৭":"7","৮":"8","৯":"9"};return t.replace(/[০-৯]/g,o=>e[o]||o)}function vt(t){if(typeof document>"u")return{count:null,status:"UNAVAILABLE",rawText:""};const o=Array.from(document.querySelectorAll('h1, h2, h3, h4, span[dir="auto"], strong, div, p')),n=[/(?:All groups you['’]?ve joined|Groups you['’]?ve joined)\s*\(([0-9,kKmM\u09E6-\u09EF.]+)\)/i,/(?:আপনার যোগ দেওয়া সমস্ত গ্রুপ|আপনার যোগ দেওয়া সব গ্রুপ|আপনি যেসব গ্রুপে যোগ দিয়েছেন|যোগ দেওয়া সমস্ত গ্রুপ|যোগ দেওয়া সব গ্রুপ|যোগ দেওয়া গ্রুপ|সব গ্রুপ)\s*\(([0-9,kKmM\u09E6-\u09EF.]+)\)/i,/^All groups you['’]?ve joined\s*[:\-•]?\s*([0-9,kKmM\u09E6-\u09EF.]+)$/i],r=[/(?:Joined Groups|Your Groups|আমার গ্রুপ)\s*\(([0-9,kKmM\u09E6-\u09EF.]+)\)/i,/(?:Groups|গ্রুপ)\s*\(([0-9,kKmM\u09E6-\u09EF.]+)\)/i],s=c=>{const i=xt(c).replace(/,/g,"").trim().toLowerCase();if(i.endsWith("k")){const l=parseFloat(i.replace("k",""));return isNaN(l)?null:Math.round(l*1e3)}if(i.endsWith("m")){const l=parseFloat(i.replace("m",""));return isNaN(l)?null:Math.round(l*1e6)}const a=parseInt(i,10);return isNaN(a)?null:a};for(const c of o){const i=(c.textContent||"").trim();if(!(i.length>120||i.length<3))for(const a of n){const l=i.match(a);if(l&&l[1]){const d=s(l[1]);if(d!==null&&d>0)return{count:d,status:"CONFIRMED",rawText:i}}}}for(const c of o){const i=(c.textContent||"").trim();if(!(i.length>80||i.length<3))for(const a of r){const l=i.match(a);if(l&&l[1]){const d=s(l[1]);if(d!==null&&d>0)return{count:d,status:"UNCERTAIN",rawText:i}}}}return{count:null,status:"UNAVAILABLE",rawText:""}}function At(t=document){const e=["end of results","no more groups to show","you’ve reached the end","you've reached the end","সব গ্রুপ দেখানো হয়েছে","ফলাফলের সমাপ্তি"],o=t.querySelectorAll('div[role="status"], span[dir="auto"], div, p');for(const n of o){const r=(n.textContent||"").trim().toLowerCase();if(!(r.length>100||r.length<5)){for(const s of e)if(r.includes(s))return!0}}return!1}function de(t){if(!t)return"";let e=t.trim();return e=e.replace(/^(?:Visit|Open|View|গ্রুপ দেখুন|দেখুন)\s+/i,""),e=e.replace(/\s*(?:Last active|You last visited|last visited|active)\s+[^\n]+/i,""),e=e.replace(/\s*(?:গত|আগে|মিনিট আগে|ঘণ্টা আগে|দিন আগে)[^\n]*/i,""),e=e.replace(/\s*·\s*(?:Public group|Private group|পাবলিক গ্রুপ|প্রাইভেট গ্রুপ).*$/i,""),e=e.replace(/\s*·\s*\d+.*members.*$/i,""),e=e.replace(/\s*·\s*[০-৯\d]+.*সদস্য.*$/i,""),e=e.replace(/\s*·\s*[^\n]+/i,""),e.trim()}function Et(t){var p,g;const e=u=>({valid:!1,reason:u,name:"",url:"",groupId:"",privacy:"UNKNOWN"}),o=t.href||t.getAttribute("href")||"";if(!o||!o.includes("/groups/"))return e("Not a group link");if(o.includes("/permalink/")||o.includes("/posts/")||o.includes("/photos/")||o.includes("/videos/")||o.includes("comment_id=")||o.includes("notif_id="))return e("Post or photo permalink, not a group home");let n="";try{const f=new URL(o,"https://www.facebook.com").pathname.split("/").filter(Boolean),m=f.indexOf("groups");if(m!==-1&&f[m+1]&&(n=f[m+1],f.length>m+2)){const b=f[m+2].toLowerCase();if(["posts","permalink","photos","videos","user","media"].includes(b))return e("Post or photo permalink, not a group home")}}catch{return e("Malformed URL")}if(!n||xe.has(n.toLowerCase()))return e("Non-group system path");if(t.closest('[aria-label*="Notification" i], [aria-label*="বিজ্ঞপ্তি" i], [data-pagelet*="Notification" i]'))return e("Inside notification flyout");const r=t.closest('div[role="listitem"], div[role="article"], div[role="gridcell"], li, div[role="row"]')||((p=t.parentElement)==null?void 0:p.parentElement)||t.parentElement;if(r){const u=(r.textContent||"").toLowerCase();if(u.includes("sponsored")||u.includes("বিজ্ঞাপন")||r.querySelector('[aria-label*="Sponsored" i], [aria-label*="বিজ্ঞাপন" i]'))return e("Sponsored advertisement");if((r.querySelectorAll?Array.from(r.querySelectorAll('a[href*="/groups/"]')):[]).length<=4){if(u.includes("requested to join")||u.includes("অনুরোধ পাঠানো হয়েছে")||u.includes("answer questions")||u.includes("update responses")||u.includes("suggested for you")||u.includes("আপনার জন্য প্রস্তাবিত")||u.includes("suggested groups")||u.includes("প্রস্তাবিত গ্রুপ"))return e("Unjoined or suggested group");if(r.querySelectorAll){const b=Array.from(r.querySelectorAll('button, [role="button"]'));for(const y of b){const h=(y.textContent||y.getAttribute("aria-label")||"").trim().toLowerCase();if((h==="join"||h==="join group"||h==="যোগ দিন"||h==="গ্রুপে যোগ দিন"||h==="request to join")&&!u.includes("view group")&&!u.includes("গ্রুপ দেখুন")&&!u.includes("visited")&&!u.includes("last active"))return e("Card has Join button, not joined")}}}}let s="";const c=(t.getAttribute("aria-label")||"").trim();if(c&&c.length>=2&&!ue.has(c.toLowerCase())&&(s=de(c)),!s){const u=(t.textContent||t.innerText||"").trim(),f=de(u);f&&f.length>=2&&!ue.has(f.toLowerCase())&&(s=f)}if(!s){const u=Array.from(t.querySelectorAll('h1, h2, h3, h4, span[dir="auto"], strong, span'));for(const f of u){const m=de((f.textContent||"").trim()),b=m.toLowerCase();if(m.length>=2&&!ue.has(b)&&!b.includes("last active")&&!b.includes("you last visited")&&!b.includes("members")&&!b.includes("সদস্য")&&!b.includes("ago")){s=m;break}}}if(!s&&r){const u=r.querySelector('h1, h2, h3, h4, [role="heading"]');if(u&&u.textContent){const f=de(u.textContent.trim());f.length>=2&&!ue.has(f.toLowerCase())&&(s=f)}}if(!s&&r){const u=Array.from(r.querySelectorAll('h1, h2, h3, h4, span[dir="auto"], strong, a[href*="/groups/"] > span'));for(const f of u){if(f===t)continue;const m=de((f.textContent||"").trim()),b=m.toLowerCase();if(m.length>=2&&m.length<200&&!ue.has(b)&&!b.includes("view group")&&!b.includes("you last visited")&&!b.includes("last active")&&!b.includes("members")&&!b.includes("সদস্য")&&!b.includes("hours ago")&&!b.includes("minutes ago")&&!b.includes("days ago")&&!b.includes("ঘণ্টা আগে")&&!b.includes("দিন আগে")&&!/^\d+ (hours?|minutes?|days?|weeks?) ago$/i.test(b)){s=m;break}}}s||(s=n.split(/[-_.]+/).filter(Boolean).map(u=>u.charAt(0).toUpperCase()+u.slice(1)).join(" "));let i="";const a=r!=null&&r.querySelector?r.querySelector("img, image")||t.querySelector("img, image"):null;a&&(i=a.getAttribute("src")||a.getAttribute("href")||((g=a.href)==null?void 0:g.baseVal)||"",(i.includes("/rsrc.php/")||i.includes("spacer")||i.includes("1x1"))&&(i=""));let l="UNKNOWN";const d=u=>{const f=(u||"").toLowerCase();return f.includes("public group")||f.includes("পাবলিক গ্রুপ")||f.includes("public")||f.includes("পাবলিক")?"PUBLIC":f.includes("private group")||f.includes("প্রাইভেট গ্রুপ")||f.includes("private")||f.includes("প্রাইভেট")?"PRIVATE":"UNKNOWN"};if(r){const u=d(r.textContent||"");if(u!=="UNKNOWN")l=u;else if(r.querySelectorAll){const f=Array.from(r.querySelectorAll("span, div, p"));for(const m of f){const b=d(m.textContent||"");if(b!=="UNKNOWN"){l=b;break}}}}return l==="UNKNOWN"&&(l=d(t.textContent||"")),{valid:!0,name:s,url:`https://www.facebook.com/groups/${n}/`,groupId:n,imageUrl:i,privacy:l}}function ve(){if(typeof document>"u")return!1;const t=typeof window<"u"?window.location.href:"";if(t.includes("/login")||t.includes("/recover")||t.includes("/checkpoint"))return!1;const e=document.body&&(document.body.innerText||document.body.textContent)||"";return e.includes("What's on your mind")||e.includes("আপনার মনে কী আছে")||e.includes("কী ভাবছেন")||e.includes("Professional dashboard")||e.includes("Ads Manager")||e.includes("Meta Business Suite")?!0:!!document.querySelector('[role="navigation"], [data-pagelet="LeftRail"], [aria-label="Facebook"], input[placeholder*="Search" i], [aria-label*="profile" i], [aria-label*="Account" i], a[href*="/me/"], a[href*="/groups/"]')||!!(document.cookie&&document.cookie.includes("c_user"))}function pe(){var i,a;if(typeof document>"u")return{isLoggedIn:!1,name:"",profileUrl:""};let t="",e="",o="",n="";if(document.body){const d=(document.body.innerText||document.body.textContent||"").match(/(?:What['’]s on your mind|আপনার মনে কী আছে|কী ভাবছেন)[,?\s]+([^?!\n]+?)(?:\?|$)/i);if(d&&d[1]){const p=d[1].trim().replace(/[?,!]+$/,"").trim();p.length>=2&&p.length<=50&&!p.toLowerCase().includes("facebook")&&(t=p)}}const r=Array.from(document.querySelectorAll('a[href*="/me/"], a[href*="facebook.com/profile"], [role="navigation"] a[href]'));for(const l of r){const d=l.getAttribute("href")||l.href||"",p=l.querySelector('span[dir="auto"], span, strong, h1'),g=(p?p.textContent:l.innerText||l.textContent||"").trim();if(g&&g.length>=2&&g.length<=35&&!["Home","Friends","Feeds","Groups","Watch","Marketplace","Memories","Saved","Video","Settings","Meta AI","Professional dashboard","Ads Manager","Ad Center","Meta Business Suite","See more","See all","Facebook","Menu","Notifications"].includes(g)){t||(t=g),!e&&d&&(e=d);const f=l.querySelector("image, img");if(f&&!o&&(o=f.getAttribute("src")||((i=f.href)==null?void 0:i.baseVal)||""),t)break}}const s=document.querySelector('[aria-label="Your profile" i], [aria-label*="Your profile" i], [aria-label*="Account Controls" i], [aria-label*="আপনার প্রোফাইল" i]');if(s&&!o){const l=s.querySelector("image, img");l&&(o=l.getAttribute("src")||((a=l.href)==null?void 0:a.baseVal)||"")}try{const l=Array.from(document.querySelectorAll("script"));for(const d of l){const p=d.textContent||"";if(p.includes('"NAME":')||p.includes('"USER_ID":')||p.includes('"short_name":')){const g=p.match(/"NAME":\s*"([^"]+)"/)||p.match(/"short_name":\s*"([^"]+)"/);if(g&&g[1]&&!t)try{t=JSON.parse(`"${g[1]}"`)}catch{t=g[1]}const u=p.match(/"USER_ID":\s*"(\d+)"/);if(u&&u[1]&&!n&&(n=u[1]),t)break}}}catch{}if(!n&&document.cookie){const l=document.cookie.match(/c_user=(\d+)/);l&&(n=l[1])}const c=ve()||!!(t||n);return{isLoggedIn:c,name:t||(c?"Facebook User":""),profileUrl:e||"https://www.facebook.com",avatarUrl:o,userId:n}}function kt(t){if(typeof document>"u")return[];const e=new Map,o=Date.now();try{const n=Array.from(document.querySelectorAll("script"));for(const r of n){const s=r.textContent||"";if(s.length<40)continue;const c=[/"__typename"\s*:\s*"Group"[\s\S]{0,500}?"id"\s*:\s*"(\d+)"[\s\S]{0,500}?"name"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/g,/"__typename"\s*:\s*"Group"[\s\S]{0,500}?"name"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"[\s\S]{0,500}?"id"\s*:\s*"(\d+)"/g,/"node"\s*:\s*\{[\s\S]{0,120}?"__typename"\s*:\s*"Group"[\s\S]{0,350}?"id"\s*:\s*"(\d+)"[\s\S]{0,350}?"name"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/g,/"node"\s*:\s*\{[\s\S]{0,120}?"__typename"\s*:\s*"Group"[\s\S]{0,350}?"name"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"[\s\S]{0,350}?"id"\s*:\s*"(\d+)"/g,/\{"id"\s*:\s*"(\d+)"[\s\S]{0,300}?"name"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"[\s\S]{0,300}?(?:"__typename"\s*:\s*"Group"|url"\s*:\s*"https:[^"]*?\/groups\/[^"]+?")/g,/\{"name"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"[\s\S]{0,300}?"id"\s*:\s*"(\d+)"[\s\S]{0,300}?(?:"__typename"\s*:\s*"Group"|url"\s*:\s*"https:[^"]*?\/groups\/[^"]+?")/g];for(const i of c){let a;for(;(a=i.exec(s))!==null;){let l="",d="";if(/^\d+$/.test(a[1])?(l=a[1],d=a[2]):/^\d+$/.test(a[2])&&(l=a[2],d=a[1]),l&&d){d=d.trim();try{d=d.replace(/\\u[\dA-Fa-f]{4}/g,g=>String.fromCharCode(parseInt(g.replace("\\u",""),16)))}catch{}const p=s.slice(Math.max(0,a.index-350),Math.min(s.length,a.index+600));if(p.includes('"__typename":"User"')||p.includes('"__typename":"Actor"')||p.includes('"__typename":"Story"')||p.includes('"__typename":"Comment"')||p.includes('"__typename":"Page"')||t&&d.toLowerCase()===t.toLowerCase())continue;if(d.length>=2&&!e.has(l)){let g="";const f=s.slice(Math.max(0,a.index-500),Math.min(s.length,a.index+1e3)).match(/"(?:uri|url|cover_photo|image)"\s*:\s*\{[^}]*"uri"\s*:\s*"([^"]+)"/);if(f&&f[1]){let m=f[1];try{m=m.replace(/\\u[\dA-Fa-f]{4}/g,b=>String.fromCharCode(parseInt(b.replace("\\u",""),16)))}catch{}!m.includes("/rsrc.php/")&&!m.includes("1x1")&&(g=m.replace(/\\\//g,"/"))}e.set(l,{name:et(d,l),url:`https://www.facebook.com/groups/${l}/`,groupId:l,privacy:"UNKNOWN",imageUrl:g,verified:!0,source:"facebook-ui",accountContext:t,discoveredAt:o})}}}}}}catch(n){console.warn("[AGP:Discovery] Script tags extraction warning:",n)}return Array.from(e.values())}function Oe(t){if(typeof document>"u")return{items:[],rejectedCount:0};const e=new Map;let o=0;const n=Date.now(),r=kt(t);for(const c of r)e.set(c.groupId.toLowerCase(),c);const s=Array.from(document.querySelectorAll('a[href*="/groups/"]'));for(const c of s){const i=Et(c);if(!i.valid||!i.name||!i.url||!i.groupId){o++;continue}const a=i.groupId.toLowerCase(),l=e.get(a);l?(!l.imageUrl&&i.imageUrl&&(l.imageUrl=i.imageUrl),i.name&&l.name.length<i.name.length&&(l.name=i.name),i.privacy!=="UNKNOWN"&&(l.privacy=i.privacy)):e.set(a,{name:i.name,url:i.url,groupId:i.groupId,privacy:i.privacy,imageUrl:i.imageUrl,verified:!0,source:"facebook-ui",accountContext:t,discoveredAt:n})}return{items:Array.from(e.values()),rejectedCount:o}}function Ze(){if(typeof document>"u")return 0;let t=0;const e=Array.from(document.querySelectorAll('div[role="button"], button, span[dir="auto"], [role="navigation"] [role="button"], [data-pagelet="LeftRail"] [role="button"]'));for(const o of e){const n=(o.textContent||o.getAttribute("aria-label")||"").trim().toLowerCase();if(n==="see more"||n==="আরও দেখুন"||n==="see all"||n==="সব দেখুন"||n==="see all groups"||n==="সব গ্রুপ দেখুন"||n==="view more")try{(o.closest('[role="button"], button')||o).click(),t++}catch{}}return t}async function Xe(t={}){var h,x,v,P,I,B;const e=t.maxRounds||350,o=t.stagnantLimit||35,n=t.scrollDelayMs!==void 0?t.scrollDelayMs:900,r=t.accountContext,s=Date.now(),c=ve(),i=new Map;let a=0,l=0,d=0,p=0;const g=vt(),u=g.count,f=g.status;console.log(`[AGP:Engine] Discovery started. Target count: ${u??"N/A"} (Status: ${f})`);const m=$=>({candidateCount:i.size+l,verifiedCount:i.size,duplicatesRemoved:a,rejectedCount:l,scrollIterations:p,mutationEvents:d,targetCount:u,targetCountStatus:f,completionReason:$,scanDurationMs:Date.now()-s,lastNewGroupTimestamp:i.size>0?Date.now():null}),b=$=>{let K=0;for(const L of $){const j=L.groupId.toLowerCase();i.has(j)?a++:(i.set(j,L),K++)}return K};let y=null;typeof MutationObserver<"u"&&typeof document<"u"&&(y=new MutationObserver($=>{d+=$.length}),y.observe(document.body||document.documentElement,{childList:!0,subtree:!0}));try{try{Ze()}catch{}const $=Oe(r);if(l+=$.rejectedCount,b($.items)>0&&t.onBatchDiscovered)try{await t.onBatchDiscovered(Array.from(i.values()),i.size,m(null))}catch{}if(t.onProgress){const z=u?`Found ${i.size} of ${u} groups...`:`Found ${i.size} groups...`;t.onProgress(i.size,z,u,m(null))}if(f==="CONFIRMED"&&u!==null&&i.size>=u){const z=m("TARGET_REACHED");return console.log(`[AGP:Engine] Target count of ${u} confirmed on initial scan.`),{isLoggedIn:c,groups:Array.from(i.values()),totalFound:i.size,targetCount:u,isPartial:!1,outcome:"COMPLETE",completionReason:"TARGET_REACHED",debugMetrics:z}}let L=0,j="PARTIAL",Y="STAGNANT_TIMEOUT";for(let z=0;z<e;z++){if(p++,z%3===0)try{Ze()}catch{}const q=Array.from(document.querySelectorAll('a[href*="/groups/"]'));if(q.length>0){const G=q[q.length-1];try{G.scrollIntoView({block:"end",inline:"nearest",behavior:"smooth"})}catch{}}const ce=document.querySelector('[role="main"], [data-pagelet*="Group"]');if(ce&&ce.lastElementChild)try{ce.lastElementChild.scrollIntoView({block:"end",behavior:"smooth"})}catch{}const le=Math.max(((h=document.documentElement)==null?void 0:h.scrollHeight)||0,((x=document.scrollingElement)==null?void 0:x.scrollHeight)||0,((v=document.body)==null?void 0:v.scrollHeight)||0);window.scrollTo(0,le),document.scrollingElement&&(document.scrollingElement.scrollTop=le),document.documentElement&&(document.documentElement.scrollTop=le);const S=Array.from(document.querySelectorAll("div, main, section"));for(const G of S)if(G.scrollHeight>G.clientHeight+80){const we=window.getComputedStyle(G);(we.overflowY==="auto"||we.overflowY==="scroll")&&(G.scrollTop=G.scrollHeight,G.dispatchEvent(new Event("scroll",{bubbles:!0})))}window.dispatchEvent(new Event("scroll",{bubbles:!0}));try{window.dispatchEvent(new WheelEvent("wheel",{deltaY:2500,bubbles:!0})),(P=document.body)==null||P.dispatchEvent(new KeyboardEvent("keydown",{key:"PageDown",code:"PageDown",bubbles:!0}))}catch{}await new Promise(G=>setTimeout(G,n));const N=Oe(r);if(l+=N.rejectedCount,b(N.items)>0){if(L=0,t.onBatchDiscovered)try{await t.onBatchDiscovered(Array.from(i.values()),i.size,m(null))}catch{}if(t.onProgress){const G=u?`Scanning Facebook Groups... ${i.size} of ${u} discovered`:`Scanning Facebook Groups... ${i.size} groups discovered`;t.onProgress(i.size,G,u,m(null))}if(f==="CONFIRMED"&&u!==null&&i.size>=u){console.log(`[AGP:Engine] Target count reached: ${i.size} >= ${u}.`),j="COMPLETE",Y="TARGET_REACHED";break}}else{if(L++,At()){console.log("[AGP:Engine] Explicit end-of-list indicator detected."),j="COMPLETE",Y="LIST_END";break}if(window.scrollBy(0,-600),q.length>5&&((I=q[Math.max(0,q.length-6)])==null||I.scrollIntoView({block:"center",behavior:"instant"})),await new Promise(G=>setTimeout(G,300)),window.scrollBy(0,1200),q.length>0&&((B=q[q.length-1])==null||B.scrollIntoView({block:"end",behavior:"smooth"})),f==="CONFIRMED"&&u!==null&&i.size<u&&L<45){window.scrollBy(0,-1e3),await new Promise(G=>setTimeout(G,350)),window.scrollBy(0,2500);continue}if(L>=o){console.log(`[AGP:Engine] Scan complete/stagnant after ${L} attempts. Total verified: ${i.size}`),j="PARTIAL",Y="STAGNANT_TIMEOUT";break}}}try{window.scrollTo({top:0,behavior:"smooth"})}catch{}const Me=j!=="COMPLETE",$e=m(Y);return{isLoggedIn:c,groups:Array.from(i.values()),totalFound:i.size,targetCount:u,isPartial:Me,outcome:j,completionReason:Y,debugMetrics:$e}}finally{y&&y.disconnect()}}function et(t,e){if(!t||!t.trim())return e?e.split(/[-_.]+/).filter(Boolean).map(n=>n.charAt(0).toUpperCase()+n.slice(1)).join(" "):"Facebook Group";let o=t.trim();return o=o.replace(/^(?:Visit|Open|View|গ্রুপ দেখুন|দেখুন)\s+/i,""),o=o.replace(/\s*(?:Last active|You last visited|last visited|active)\s+[^\n]+/i,""),o=o.replace(/\s*(?:গত|আগে|মিনিট আগে|ঘণ্টা আগে|দিন আগে)[^\n]*/i,""),o=o.replace(/\s*·\s*(?:Public group|Private group|পাবলিক গ্রুপ|প্রাইভেট গ্রুপ).*$/i,""),o=o.replace(/\s*·\s*\d+.*members.*$/i,""),o=o.replace(/\s*·\s*[০-৯\d]+.*সদস্য.*$/i,""),o=o.replace(/\s*·\s*[^\n]+/i,""),(o.toLowerCase()==="visit"||o.toLowerCase()==="group"||o.toLowerCase()==="view group")&&e?e.split(/[-_.]+/).filter(Boolean).map(n=>n.charAt(0).toUpperCase()+n.slice(1)).join(" "):o.trim()||"Facebook Group"}function Ne(t="id"){const e=Math.random().toString(36).substring(2,9),o=Date.now().toString(36);return`${t}_${o}_${e}`}function Re(t){if(!t)return"";if(!t.includes("{")||!t.includes("|"))return t;let e=t,o=0;const n=/\{([^{}]+)\}/g;for(;o<10&&n.test(e);)o++,e=e.replace(n,(r,s)=>{if(s.includes("|")){const c=s.split("|").map(i=>i.trim()).filter(Boolean);if(c.length>0)return c[Math.floor(Math.random()*c.length)]}return r});return e=e.replace(/\{([^{}\r\n]+?)(?=[.,!?\r\n]|$)/g,(r,s)=>s.includes("|")?s.split("|").map(i=>i.trim()).filter(Boolean)[0]||"":r),e}const tt={status:"IDLE",searchUrl:"",query:"",totalFound:0,joinedCount:0,requestedCount:0,alreadyJoinedCount:0,failedCount:0,skippedCount:0,currentIndex:0,currentGroupName:"",countdownSec:0,message:"Enter any Facebook search link to start auto-joining.",groups:[]},ee={GROUPS:"agp_groups",ACCOUNT_GROUPS:"agp_facebook_groups_by_account",LOGS:"agp_logs",FACEBOOK_ACCOUNT:"agp_facebook_account"},ot=()=>{var t;return typeof chrome<"u"&&!!((t=chrome.storage)!=null&&t.local)},fe={};async function Ae(t,e){if(ot())return new Promise(o=>{chrome.storage.local.get([t],n=>{if(chrome.runtime.lastError){console.warn(`Storage get error for ${t}:`,chrome.runtime.lastError),o(fe[t]!==void 0?fe[t]:e);return}n&&n[t]!==void 0?o(n[t]):o(e)})});try{if(typeof window<"u"&&window.localStorage){const o=window.localStorage.getItem(t);if(o!==null)return JSON.parse(o)}}catch(o){console.warn("LocalStorage access failed:",o)}return fe[t]!==void 0?fe[t]:e}async function Ue(t,e){if(fe[t]=e,ot())return new Promise((o,n)=>{chrome.storage.local.set({[t]:e},()=>{chrome.runtime.lastError?n(chrome.runtime.lastError):o()})});try{typeof window<"u"&&window.localStorage&&window.localStorage.setItem(t,JSON.stringify(e))}catch(o){console.warn("LocalStorage set failed:",o)}}function nt(t){return t&&t.trim().toLowerCase().replace(/[^a-z0-9_\u0980-\u09FF]/gi,"_")||"default_account"}async function rt(){return Ae(ee.ACCOUNT_GROUPS,{})}async function it(t){const e=await De(),o=nt(t||(e==null?void 0:e.userId)||(e==null?void 0:e.name)),n=await rt();if(n[o]&&Array.isArray(n[o].groups)&&n[o].groups.length>0){const i=n[o].groups.filter(a=>!ge(a));if(i.length>0)return i}const s=(await Ae(ee.GROUPS,[])).filter(c=>!ge(c));if(s.length>0)return s;for(const c of Object.keys(n))if(n[c]&&Array.isArray(n[c].groups)&&n[c].groups.length>0){const i=n[c].groups.filter(a=>!ge(a));if(i.length>0)return i}return[]}async function st(t,e){const o=(t||[]).filter(i=>!ge(i)),n=await De(),r=nt(e||(n==null?void 0:n.userId)||(n==null?void 0:n.name)),s=await rt(),c=s[r]||{accountContext:r,accountInfo:n||{isLoggedIn:!0,name:"Facebook User",lastSyncedAt:Date.now()},groups:[],lastSyncedAt:Date.now()};s[r]={...c,groups:o,lastSyncedAt:Date.now()},await Ue(ee.ACCOUNT_GROUPS,s),await Ue(ee.GROUPS,o)}function ge(t){if(!t)return!0;const e=(t.name||"").trim().toLowerCase(),o=(t.url||"").trim().toLowerCase();if(e.startsWith("unread")||e.includes("commented on")||e.includes("also commented")||e.includes("likes your")||e.includes("liked your")||e.includes("reacted to")||e.includes("shared a post")||e.includes("shared your post")||e.includes("invited you")||e.includes("mentioned you")||e.includes("requested to join")||e.includes("মন্তব্য করেছেন")||e.includes("মতামত দিয়েছেন")||e.includes("লাইক দিয়েছেন")||e.includes("শেয়ার করেছেন")||o.includes("/permalink/")||o.includes("/posts/")||o.includes("/user/")||o.includes("/profile.php")||o.includes("/friends/")||o.includes("/people/")||o.includes("/photos/")||o.includes("/videos/")||o.includes("/events/")||o.includes("/files/")||o.includes("comment_id=")||o.includes("notif_id=")||o.includes("notif_t=")||o.includes("reply_comment_id="))return!0;const n=new Set(["about","about group","feed","discover","create","notifications","search","categories","joins","settings","help","privacy","terms","policies","support","messages","marketplace"]),r=e.replace(/\s*group\s*$/i,"").trim();return!!(n.has(e)||n.has(r)||t.groupId&&n.has(t.groupId.toLowerCase()))}async function Ct(){return Ae(ee.LOGS,[])}async function St(t){await Ue(ee.LOGS,t)}async function Pt(t){const e=await Ct();e.unshift(t),e.length>300&&(e.length=300),await St(e)}async function De(){return Ae(ee.FACEBOOK_ACCOUNT,null)}class It{async writeLog(e,o,n,r){const s={id:Ne("log"),timestamp:Date.now(),level:e,source:o,message:n,details:r},c=`[AGP:${o.toUpperCase()}][${e}]`;e==="ERROR"?console.error(c,n,r||""):e==="WARNING"?console.warn(c,n,r||""):console.log(c,n,r||"");try{await Pt(s)}catch(i){console.warn("Failed to persist log entry:",i)}return s}info(e,o,n){return this.writeLog("INFO",e,o,n)}success(e,o,n){return this.writeLog("SUCCESS",e,o,n)}warning(e,o,n){return this.writeLog("WARNING",e,o,n)}error(e,o,n){return this.writeLog("ERROR",e,o,n)}}const _t=new It;async function Ee(t,e){var y;const o=(e==null?void 0:e.accountContext)||((y=await De())==null?void 0:y.name)||"default_account",n=await it(o),r=new Map,s=new Map,c=new Map,i=h=>h.trim().toLowerCase().replace(/\s+/g," ");n.forEach(h=>{h.groupId&&r.set(h.groupId.toLowerCase(),h),h.url&&s.set(h.url.toLowerCase().replace(/\/$/,""),h),h.name&&c.set(i(h.name),h)});let a=0,l=0;const d=Date.now(),p=[],g=new Set;for(const h of t){if(ge(h))continue;const x=(h.groupId||"").toLowerCase(),v=(h.url||"").toLowerCase().replace(/\/$/,""),P=i(h.name||"");let I=(x?r.get(x):void 0)||(v?s.get(v):void 0)||(P&&P.length>=3?c.get(P):void 0);const B=et(h.name||"",h.groupId);if(I)l++,g.add(I.id),B&&(!I.name||I.name.includes("·")||I.name.length<B.length)&&(I.name=B),h.imageUrl&&!I.imageUrl&&(I.imageUrl=h.imageUrl),h.privacy&&h.privacy!=="UNKNOWN"&&(I.privacy=h.privacy),I.verified=!0,I.source="facebook-ui",I.accountContext=o,I.discoveredAt=d,I.updatedAt=d;else{a++;const $=h.groupId?`grp_${h.groupId.replace(/[^a-zA-Z0-9_-]/g,"")}`:Ne("grp"),K=h.url.startsWith("http")?h.url:`https://www.facebook.com/groups/${h.groupId}/`,L={id:$,name:B,url:K,groupId:h.groupId,privacy:h.privacy||"UNKNOWN",imageUrl:h.imageUrl,category:"Discovered",enabled:!0,selected:!0,status:"READY",postCount:0,verified:!0,source:"facebook-ui",accountContext:o,discoveredAt:d,createdAt:d,updatedAt:d};p.push(L),x&&r.set(x,L),v&&s.set(v,L),P&&c.set(P,L),g.add(L.id)}}let u;if((e==null?void 0:e.syncMode)==="exact"){const h=v=>v.source==="manual"||v.category&&v.category!=="Discovered",x=n.filter(v=>g.has(v.id)||h(v));u=[...p,...x]}else u=[...p,...n];const f=[],m=new Set,b=new Set;for(const h of u){const x=h.url.toLowerCase().replace(/\/$/,"");!m.has(h.id)&&!b.has(x)&&(m.add(h.id),b.add(x),f.push(h))}return await st(f,o),await _t.info("dashboard",`Group discovery merged (${(e==null?void 0:e.syncMode)||"merge"}): ${a} imported, ${l} duplicates, total ${f.length}`),{imported:a,duplicates:l,totalStored:f.length,verifiedCount:f.filter(h=>h.verified).length}}function qe(t){if(!t)return"<p><br></p>";const e=t.split(`
`),o=[];let n=!1,r=[],s=!1,c=[],i=!1,a=[];const l=()=>{n&&r.length>0&&(o.push("<ul>"+r.map(u=>`<li>${u}</li>`).join("")+"</ul>"),r=[],n=!1)},d=()=>{s&&c.length>0&&(o.push("<ol>"+c.map(u=>`<li>${u}</li>`).join("")+"</ol>"),c=[],s=!1)},p=()=>{i&&a.length>0&&(o.push("<blockquote>"+a.map(u=>`<p>${u}</p>`).join("")+"</blockquote>"),a=[],i=!1)},g=()=>{l(),d(),p()};for(let u=0;u<e.length;u++){const f=e[u],m=f.trim();if(!m){g(),o.push("<p><br></p>");continue}const y=m.match(/^<h1\b[^>]*>(.*?)<\/h1>$/i)||m.match(/^#\s+(.+)$/)||m.match(/^h1:\s*(.+)$/i);if(y){g(),o.push(`<h1>${re(y[1])}</h1>`);continue}const x=m.match(/^<h[23]\b[^>]*>(.*?)<\/h[23]>$/i)||m.match(/^##\s+(.+)$/)||m.match(/^###\s+(.+)$/)||m.match(/^h[23]:\s*(.+)$/i);if(x){g(),o.push(`<h2>${re(x[1])}</h2>`);continue}const P=m.match(/^<blockquote\b[^>]*>(.*?)<\/blockquote>$/i)||m.match(/^>\s*(.+)$/)||m.match(/^[❝❞]\s*(.+?)[❝❞]?$/);if(P){l(),d(),i=!0,a.push(re(P[1]));continue}const I=m.match(/^(\d+)[\.\)]\s+(.*)$/);if(I){l(),p(),s=!0,c.push(re(I[2]));continue}const $=m.match(/^<li\b[^>]*>(.*?)<\/li>$/i)||m.match(/^[•✓✔➤➔★⭐◆❖]\s*(.*)$/)||m.match(/^[\-*–—]\s+(.*)$/);if($){d(),p(),n=!0,r.push(re($[1]));continue}g(),o.push(`<p>${re(f)}</p>`)}return g(),o.join("")}function re(t){if(!t)return"";let e=t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");return e=e.replace(/\*\*\*(.+?)\*\*\*/g,'<strong><em style="font-style: italic;">$1</em></strong>'),e=e.replace(/___(.+?)___/g,'<strong><em style="font-style: italic;">$1</em></strong>'),e=e.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>"),e=e.replace(/__(.+?)__/g,"<strong>$1</strong>"),e=e.replace(/\*([^*\n]+?)\*/g,'<em style="font-style: italic;">$1</em>'),e=e.replace(/_([^_\n]+?)_/g,'<em style="font-style: italic;">$1</em>'),e=e.replace(/~~(.+?)~~/g,"<s>$1</s>"),e=e.replace(/`([^`\n]+?)`/g,"<code>$1</code>"),e=e.replace(/&lt;(\/?)strong&gt;/gi,"<$1strong>").replace(/&lt;(\/?)b&gt;/gi,"<$1strong>").replace(/&lt;(\/?)em&gt;/gi,"<$1em>").replace(/&lt;(\/?)i&gt;/gi,"<$1em>").replace(/&lt;(\/?)s&gt;/gi,"<$1s>").replace(/&lt;(\/?)del&gt;/gi,"<$1s>").replace(/&lt;(\/?)u&gt;/gi,"<$1u>").replace(/&lt;(\/?)code&gt;/gi,"<$1code>").replace(/&lt;br\s*\/?&gt;/gi,"<br>"),e}function Tt(t){if(!t||typeof t!="string")return t||"";const e=t.trim();if(e.length<30)return t;const o=e.length,n=Math.floor(o/2);for(let s=-15;s<=15;s++){const c=n+s;if(c>15&&c<o-15){const i=e.slice(0,c).trim(),a=e.slice(c).trim();if(i.length>=15&&i===a)return i}}const r=e.split(`
`).filter(s=>s.trim().length>0);if(r.length>=4){const s=Math.floor(r.length/2),c=r.slice(0,s).join(`
`).trim(),i=r.slice(s).join(`
`).trim();if(c.length>=25&&c===i)return c}return t}function Be(t){try{const o=new URL(t.startsWith("http")?t:`https://${t}`).searchParams.get("q");return o?decodeURIComponent(o.replace(/\+/g," ")):""}catch{return""}}function Gt(){if(typeof window>"u")return!1;const t=window.location.href.toLowerCase();return(t.includes("facebook.com")||t.includes("fb.com"))&&t.includes("/search")}function je(t){var a;if(!t)return!1;const e=t.tagName.toLowerCase(),o=t.getAttribute("role")||"",n=e==="button"||o==="button"||e==="a"||t.getAttribute("tabindex")!==null,r=(t.innerText||t.textContent||"").trim().toLowerCase(),s=(t.getAttribute("aria-label")||"").trim().toLowerCase(),c=(((a=t.querySelector("[aria-label]"))==null?void 0:a.getAttribute("aria-label"))||"").trim().toLowerCase(),i=`${r} | ${s} | ${c}`.toLowerCase();return i.includes("joined")||i.includes("view group")||i.includes("edit membership")||i.includes("যোগ দিয়েছেন")||i.includes("যুক্ত হয়েছেন")||i.includes("গ্রুপ দেখুন")||i.includes("requested")||i.includes("pending")||i.includes("cancel request")||i.includes("অনুরোধ পাঠানো")||i.includes("অনুরোধ করা হয়েছে")||i.includes("share")||i.includes("শেয়ার")||i.includes("message")||i.includes("মেসেজ")||i.includes("close")||i.includes("menu")||i.includes("search")||i.includes("notifications")?!1:!!(r==="join"||r==="join group"||r==="+ join"||r==="+ join group"||r==="request to join"||r==="answer questions"||r==="যোগ দিন"||r==="+ যোগ দিন"||r==="গ্রুপে যোগ দিন"||r==="যুক্ত হোন"||r==="+ যুক্ত হোন"||r==="গ্রুপে যুক্ত হোন"||r==="যোগ দেওয়ার অনুরোধ"||r==="যোগ দেয়ার অনুরোধ"||s==="join"||s==="join group"||s.includes("join group")||s.includes("request to join")||s.includes("যোগ দিন")||s.includes("যুক্ত হোন")||s.includes("অনুরোধ")||n&&(r.startsWith("join ")||r.endsWith(" join")||r.includes("join group")||r.includes("যোগ দিন")||r.includes("যুক্ত হোন")||r.includes("join")&&r.length<=16))}function Fe(t){if(!t)return!1;const e=(t.innerText||t.textContent||"").trim().toLowerCase(),o=(t.getAttribute("aria-label")||"").trim().toLowerCase(),n=`${e} ${o}`.toLowerCase();return n.includes("joined")||n.includes("view group")||n.includes("edit membership")||n.includes("যোগ দিয়েছেন")||n.includes("যুক্ত হয়েছেন")||n.includes("গ্রুপ দেখুন")}function ze(t){if(!t)return!1;const e=(t.innerText||t.textContent||"").trim().toLowerCase(),o=(t.getAttribute("aria-label")||"").trim().toLowerCase(),n=`${e} ${o}`.toLowerCase();return n.includes("requested")||n.includes("pending")||n.includes("cancel request")||n.includes("অনুরোধ পাঠানো")||n.includes("অনুরোধ করা হয়েছে")}function at(t,e,o){let n="";const r=(t.getAttribute("aria-label")||"").trim();if(r&&r.length>=2&&!r.toLowerCase().includes("view group")&&!r.toLowerCase().includes("গ্রুপ দেখুন"))n=r;else{const s=e.querySelector('h1, h2, h3, h4, span[dir="auto"], strong');n=((s==null?void 0:s.textContent)||t.textContent||"").trim()}return n=n.split(`
`)[0].trim(),(!n||n.length<2)&&(n=o.split(/[-_.]+/).map(s=>s.charAt(0).toUpperCase()+s.slice(1)).join(" ")),n}function ct(t){const e=(t.innerText||t.textContent||"").toLowerCase();return e.includes("public")||e.includes("পাবলিক")?"PUBLIC":e.includes("private")||e.includes("প্রাইভেট")?"PRIVATE":"UNKNOWN"}function lt(t){const e=(t.innerText||"").split(`
`).map(o=>o.trim()).filter(Boolean);for(const o of e){const n=o.toLowerCase();if((n.includes("member")||n.includes("সদস্য")||n.includes("post")||n.includes("পোস্ট"))&&(n.includes("public")||n.includes("private")||n.includes("পাবলিক")||n.includes("প্রাইভেট")||/\d/.test(o)))return o}return""}function ut(){if(typeof document>"u")return[];const t=[],e=new Set,o=Array.from(document.querySelectorAll('div[role="button"], button, a[role="button"], [role="button"], [aria-label*="Join" i], [aria-label*="যোগ" i], [aria-label*="যুক্ত" i]'));for(const r of o){if(!je(r))continue;let s=r.parentElement,c=null,i=null;for(let m=0;m<12&&s&&s!==document.body;m++){const b=Array.from(s.querySelectorAll('a[href*="/groups/"]')).filter(y=>{const x=(y.href||y.getAttribute("href")||"").match(/(?:facebook\.com|fb\.com)?\/groups\/([a-zA-Z0-9._-]+)(?:\/|\?|$)/i);return x&&!xe.has(x[1].toLowerCase())});if(b.length>0){const y=new Set(b.map(h=>{const x=(h.href||h.getAttribute("href")||"").match(/(?:facebook\.com|fb\.com)?\/groups\/([a-zA-Z0-9._-]+)(?:\/|\?|$)/i);return x?x[1].toLowerCase():""}).filter(Boolean));if(y.size===1)c=b[0],i=s;else if(y.size>1)break}s=s.parentElement}if(!c)continue;const l=(c.href||c.getAttribute("href")||"").match(/(?:facebook\.com|fb\.com)?\/groups\/([a-zA-Z0-9._-]+)(?:\/|\?|$)/i);if(!l)continue;const d=l[1].toLowerCase();if(e.has(d))continue;e.add(d);const p=i||r.closest('div[role="feed"] > div')||r.parentElement||r,g=at(c,p,d),u=ct(p),f=lt(p);t.push({cardElement:p,item:{id:d,groupId:d,name:g,url:`https://www.facebook.com/groups/${d}/`,privacy:u,membersText:f||void 0,status:"READY_TO_JOIN"},joinButton:r})}const n=Array.from(document.querySelectorAll('a[href*="/groups/"]'));for(const r of n){const c=(r.href||r.getAttribute("href")||"").match(/(?:facebook\.com|fb\.com)?\/groups\/([a-zA-Z0-9._-]+)(?:\/|\?|$)/i);if(!c)continue;const i=c[1].toLowerCase();if(xe.has(i)||e.has(i))continue;let a=r.parentElement,l=null,d=null,p="READY_TO_JOIN";for(let m=0;m<12&&a&&a!==document.body;m++){const b=Array.from(a.querySelectorAll('a[href*="/groups/"]')).filter(x=>{const P=(x.href||x.getAttribute("href")||"").match(/(?:facebook\.com|fb\.com)?\/groups\/([a-zA-Z0-9._-]+)(?:\/|\?|$)/i);return P&&!xe.has(P[1].toLowerCase())});if(new Set(b.map(x=>{const v=(x.href||x.getAttribute("href")||"").match(/(?:facebook\.com|fb\.com)?\/groups\/([a-zA-Z0-9._-]+)(?:\/|\?|$)/i);return v?v[1].toLowerCase():""}).filter(Boolean)).size>1)break;l=a;const h=Array.from(a.querySelectorAll('div[role="button"], button, a[role="button"], [role="button"], [aria-label]'));for(const x of h){if(Fe(x)){p="ALREADY_JOINED",d=null;break}if(ze(x)){p="REQUESTED",d=null;break}if(je(x)){p="READY_TO_JOIN",d=x;break}}if(d||p!=="READY_TO_JOIN")break;a=a.parentElement}if(l||(l=r.closest('div[role="feed"] > div')||r.closest('div[role="article"]')||r.parentElement||r),p==="READY_TO_JOIN"&&!d&&l){const m=Array.from(l.querySelectorAll('div[role="button"], button, a[role="button"], [role="button"]'));for(const b of m)if(!Fe(b)&&!ze(b)){const y=(b.innerText||b.textContent||b.getAttribute("aria-label")||"").trim().toLowerCase();if(y&&!y.includes("more")&&!y.includes("menu")&&!y.includes("share")&&!y.includes("close")){d=b;break}}}e.add(i);const g=at(r,l,i),u=ct(l),f=lt(l);t.push({cardElement:l,item:{id:i,groupId:i,name:g,url:`https://www.facebook.com/groups/${i}/`,privacy:u,membersText:f||void 0,status:p},joinButton:d})}return t}function be(t){if(!t)return;try{t.scrollIntoView({behavior:"auto",block:"center"})}catch{}t.focus();const e=t.closest('div[role="button"], button, a[role="button"]')||t;e.focus();const o={bubbles:!0,cancelable:!0,view:window};if(e.dispatchEvent(new PointerEvent("pointerdown",o)),e.dispatchEvent(new MouseEvent("mousedown",o)),e.dispatchEvent(new PointerEvent("pointerup",o)),e.dispatchEvent(new MouseEvent("mouseup",o)),e.click(),e!==t)try{t.dispatchEvent(new MouseEvent("click",o)),t.click()}catch{}}async function Lt(t){let e=document.querySelector('div[role="dialog"]');if((!e||e.offsetParent===null&&e.getBoundingClientRect().height<=50)&&(await new Promise(i=>setTimeout(i,30)),e=document.querySelector('div[role="dialog"]')),!e||e.offsetParent===null&&e.getBoundingClientRect().height<=50)return!1;console.log("[AGP:AutoJoiner] Membership questions modal detected. Fast auto-answering...");const o=Array.from(e.querySelectorAll('input[type="checkbox"], div[role="checkbox"]'));for(const i of o)(i instanceof HTMLInputElement?i.checked:i.getAttribute("aria-checked")==="true")||be(i);const n=Array.from(e.querySelectorAll('input[type="radio"], div[role="radio"]'));n.length>0&&(n.some(a=>a instanceof HTMLInputElement?a.checked:a.getAttribute("aria-checked")==="true")||be(n[0]));const r=Array.from(e.querySelectorAll('textarea, input[type="text"]'));for(const i of r)(!i.value||i.value.trim()==="")&&(i.focus(),i.value=t||"Yes, I agree to the group rules and guidelines.",i.dispatchEvent(new Event("input",{bubbles:!0})),i.dispatchEvent(new Event("change",{bubbles:!0})));const s=Array.from(e.querySelectorAll('button, div[role="button"]'));for(const i of s){const a=(i.innerText||i.textContent||i.getAttribute("aria-label")||"").trim().toLowerCase();if(a==="submit"||a==="জমা দিন"||a==="send"||a==="confirm"||a==="next"||a==="পরবর্তী"||a==="done"||a==="অনুরোধ পাঠান"||a.includes("submit")||a.includes("জমা")){be(i),await new Promise(l=>setTimeout(l,60));break}}const c=document.querySelector('div[role="dialog"]');if(c){const i=Array.from(c.querySelectorAll('button, div[role="button"]'));for(const a of i){const l=(a.innerText||a.textContent||a.getAttribute("aria-label")||"").trim().toLowerCase();if(l==="submit"||l==="জমা দিন"||l==="done"||l.includes("submit")){be(a),await new Promise(d=>setTimeout(d,60));break}}}return!0}const oe=class oe{constructor(){Q(this,"state",{...tt});Q(this,"config",{searchUrl:"",delaySec:0,maxGroups:0,autoAnswerQuestions:!0,defaultAnswer:"Yes, I agree to the group rules and guidelines.",saveToGroups:!0});Q(this,"isRunning",!1);Q(this,"isPaused",!1);Q(this,"shouldStop",!1);Q(this,"onProgressCallbacks",[])}static getInstance(){return oe.instance||(oe.instance=new oe),oe.instance}subscribe(e){this.onProgressCallbacks.push(e)}getState(){return{...this.state}}broadcastState(){var e;for(const o of this.onProgressCallbacks)try{o(this.state)}catch{}try{typeof chrome<"u"&&((e=chrome.runtime)!=null&&e.sendMessage)&&chrome.runtime.sendMessage({type:"AUTO_JOIN_PROGRESS",payload:this.state})}catch{}}pause(){this.isRunning&&!this.isPaused&&(this.isPaused=!0,this.state.status="PAUSED",this.state.message="Auto-Join paused by user.",this.broadcastState())}resume(){this.isRunning&&this.isPaused&&(this.isPaused=!1,this.state.status="JOINING",this.state.message="Resuming group auto-joining...",this.broadcastState())}stop(){this.shouldStop=!0,this.isRunning=!1,this.isPaused=!1,this.state.status="STOPPED",this.state.message="Auto-Join stopped by user.",this.broadcastState()}async start(e){if(this.isRunning)return console.warn("[AGP:AutoJoiner] Already running."),this.state;this.config={...this.config,...e,delaySec:typeof e.delaySec=="number"?e.delaySec:0},this.isRunning=!0,this.isPaused=!1,this.shouldStop=!1;const o=Be(window.location.href);this.state={...tt,status:"SEARCHING",searchUrl:window.location.href,query:o,message:`Scanning Facebook group search results for "${o}"...`,startedAt:Date.now()},this.broadcastState();try{let n=0;const r=new Set;for(;!this.shouldStop;){for(;this.isPaused&&!this.shouldStop;)await new Promise(i=>setTimeout(i,500));if(this.shouldStop)break;const s=ut();if(this.state.groups=s.map(i=>i.item),this.state.totalFound=s.length,this.state.alreadyJoinedCount=s.filter(i=>i.item.status==="ALREADY_JOINED").length,this.state.requestedCount=s.filter(i=>i.item.status==="REQUESTED").length,this.state.joinedCount=s.filter(i=>i.item.status==="JOINED").length,this.config.saveToGroups)for(const i of s)i.item.status==="ALREADY_JOINED"&&!r.has(i.item.groupId)&&(r.add(i.item.groupId),await this.saveGroupToDatabase(i.item));const c=s.find(i=>i.item.status==="READY_TO_JOIN"&&!r.has(i.item.groupId));if(c){n=0;const{cardElement:i,item:a}=c;let l=c.joinButton;if(!l&&i){const d=Array.from(i.querySelectorAll('div[role="button"], button, a[role="button"], [role="button"]'));for(const p of d)if(je(p)){l=p;break}if(!l){for(const p of d)if(!Fe(p)&&!ze(p)){const g=(p.innerText||p.textContent||p.getAttribute("aria-label")||"").toLowerCase();if(!g.includes("more")&&!g.includes("menu")&&!g.includes("share")&&!g.includes("close")){l=p;break}}}}if(r.add(a.groupId),this.config.maxGroups>0&&this.state.joinedCount+this.state.requestedCount>=this.config.maxGroups){this.state.message=`Reached target limit of ${this.config.maxGroups} groups.`;break}if(l){this.state.status="JOINING",this.state.currentGroupName=a.name,a.status="JOINING",this.state.message=`Joining: "${a.name}"...`,this.broadcastState();try{i.scrollIntoView({behavior:"auto",block:"nearest"}),i.style.outline="3px solid #10b981",i.style.boxShadow="0 0 15px rgba(16, 185, 129, 0.45)",i.style.borderRadius="8px"}catch{}try{console.log(`[AGP:AutoJoiner] Triggering instant click on Join button for: "${a.name}"`),be(l),this.config.autoAnswerQuestions&&await Lt(this.config.defaultAnswer),a.status="JOINED",a.joinedAt=Date.now(),this.state.joinedCount++,this.config.saveToGroups&&await this.saveGroupToDatabase(a),this.state.message=`Joined "${a.name}" (${a.status})`,this.broadcastState()}catch(p){console.error("[AGP:AutoJoiner] Join error on",a.name,p),a.status="FAILED",a.error=String(p),this.state.failedCount++,this.broadcastState()}finally{try{i.style.outline="2px solid rgba(16, 185, 129, 0.35)",i.style.boxShadow="none"}catch{}}const d=typeof this.config.delaySec=="number"?this.config.delaySec:0;if(d<=0)this.state.countdownSec=0,await new Promise(p=>setTimeout(p,30));else{for(let p=d;p>0&&!this.shouldStop;p--){for(;this.isPaused&&!this.shouldStop;)await new Promise(g=>setTimeout(g,200));if(this.shouldStop)break;this.state.countdownSec=p,this.state.message=`Waiting ${p}s before next group...`,this.broadcastState(),await new Promise(g=>setTimeout(g,1e3))}this.state.countdownSec=0}}}else{this.state.message="Loading more Facebook groups on this page...",this.broadcastState();const i=document.body.scrollHeight;if(window.scrollBy({top:1800,behavior:"auto"}),window.dispatchEvent(new Event("scroll",{bubbles:!0})),await new Promise(d=>setTimeout(d,400)),!ut().some(d=>d.item.status==="READY_TO_JOIN"&&!r.has(d.item.groupId))&&document.body.scrollHeight===i){if(n++,n>=3)break}else n=0}}this.shouldStop||(this.state.status="COMPLETED",this.state.message=`Auto-join complete! Joined ${this.state.joinedCount} groups, requested ${this.state.requestedCount} groups.`)}catch(n){console.error("[AGP:AutoJoiner] Execution error:",n),this.state.status="ERROR",this.state.message=`Error: ${(n==null?void 0:n.message)||String(n)}`}finally{this.isRunning=!1,this.isPaused=!1,this.state.finishedAt=Date.now(),this.broadcastState()}return this.state}async saveGroupToDatabase(e){var o;try{const n=await it();if(!n.some(s=>s.groupId&&s.groupId.toLowerCase()===e.groupId.toLowerCase()||s.url&&s.url.toLowerCase().includes(e.groupId.toLowerCase()))){const s={id:Ne(),name:e.name,url:e.url,groupId:e.groupId,privacy:e.privacy,category:this.config.selectedCategory||"Auto Joined",enabled:!0,selected:!1,status:"READY",postCount:0,verified:!0,source:"facebook-ui",createdAt:Date.now(),updatedAt:Date.now()};await st([...n,s]),console.log(`[AGP:AutoJoiner] Saved "${e.name}" (${e.groupId}) to My Facebook Groups database.`);try{typeof chrome<"u"&&((o=chrome.runtime)!=null&&o.sendMessage)&&chrome.runtime.sendMessage({type:"AUTO_JOIN_SAVE_GROUPS",payload:{group:s}})}catch{}}}catch(n){console.warn("[AGP:AutoJoiner] Save to database error:",n)}}};Q(oe,"instance");let R=oe,J=null,U=null;function Je(t){if(typeof document>"u")return;const e=R.getInstance(),o=e.getState();Be(window.location.href),J||(J=document.createElement("div"),J.id="agp-auto-joiner-root",J.style.cssText=`
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 2147483646;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    `,U=J.attachShadow({mode:"open"}),document.body.appendChild(J),e.subscribe(n=>{ke(n)})),ke(o,t)}let We=!1;function ke(t,e){if(!U)return;const o=Be(window.location.href),n=t.status==="SEARCHING"||t.status==="JOINING",r=t.status==="PAUSED",s=t.status==="JOINING"?"#10b981":t.status==="SEARCHING"?"#3b82f6":t.status==="PAUSED"?"#f59e0b":t.status==="COMPLETED"?"#10b981":t.status==="ERROR"?"#ef4444":"#6366f1";if(We){U.innerHTML=`
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .mini-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 30px;
          padding: 8px 14px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5);
          color: white;
          cursor: pointer;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          transition: transform 0.2s;
        }
        .mini-badge:hover { transform: scale(1.05); }
        .dot { width: 8px; height: 8px; border-radius: 50%; background: ${s}; ${n?"animation: pulse 1.5s infinite;":""} }
        @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
      </style>
      <div id="agp-dock-expand" class="mini-badge">
        <div class="dot"></div>
        <span style="font-size: 12px; font-weight: 700;">Auto-Joiner: ${t.joinedCount} Joined</span>
        <span style="font-size: 11px; color: #94a3b8;">↗</span>
      </div>
    `;const u=U.getElementById("agp-dock-expand");u&&(u.onclick=()=>{We=!1,ke(t,e)});return}U.innerHTML=`
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      .dock-card {
        width: 380px;
        background: rgba(15, 23, 42, 0.95);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 18px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 25px rgba(99, 102, 241, 0.2);
        color: #f8fafc;
        padding: 16px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
      .dock-card:hover {
        border-color: rgba(99, 102, 241, 0.4);
      }
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
      }
      .title-group {
        display: flex;
        align-items: center;
        gap: 9px;
      }
      .badge-icon {
        width: 30px;
        height: 30px;
        background: linear-gradient(135deg, #6366f1, #3b82f6);
        border-radius: 9px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 900;
        font-size: 15px;
        color: white;
        box-shadow: 0 4px 10px rgba(99, 102, 241, 0.4);
      }
      .title {
        font-size: 14px;
        font-weight: 700;
        letter-spacing: -0.2px;
        color: #ffffff;
      }
      .subtitle {
        font-size: 11px;
        color: #94a3b8;
        max-width: 190px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .status-pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 3px 8px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 600;
        background: ${s}22;
        color: ${s};
        border: 1px solid ${s}55;
      }
      .status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: ${s};
        ${n?"animation: pulse 1.5s infinite;":""}
      }
      @keyframes pulse {
        0% { transform: scale(0.95); opacity: 0.8; }
        50% { transform: scale(1.3); opacity: 1; }
        100% { transform: scale(0.95); opacity: 0.8; }
      }
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 6px;
        margin-bottom: 12px;
        background: rgba(30, 41, 59, 0.65);
        padding: 10px 8px;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.06);
      }
      .stat-item {
        text-align: center;
      }
      .stat-num {
        font-size: 15px;
        font-weight: 800;
        color: #f1f5f9;
        line-height: 1.2;
      }
      .stat-label {
        font-size: 9px;
        color: #94a3b8;
        text-transform: uppercase;
        font-weight: 600;
        margin-top: 2px;
      }
      .message-box {
        background: rgba(0, 0, 0, 0.35);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 10px;
        padding: 9px 12px;
        font-size: 12px;
        color: #cbd5e1;
        margin-bottom: 10px;
        min-height: 38px;
        display: flex;
        align-items: center;
        line-height: 1.35;
      }
      .countdown-bar-container {
        height: 4px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 2px;
        overflow: hidden;
        margin-bottom: 12px;
      }
      .countdown-bar {
        height: 100%;
        background: linear-gradient(90deg, #10b981, #6366f1);
        transition: width 1s linear;
      }
      .btn-row {
        display: flex;
        gap: 8px;
        margin-bottom: 8px;
      }
      .btn {
        flex: 1;
        padding: 8px 12px;
        border: none;
        border-radius: 9px;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        transition: all 0.2s;
      }
      .btn-primary {
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
      }
      .btn-primary:hover {
        background: linear-gradient(135deg, #059669, #047857);
      }
      .btn-pause {
        background: #f59e0b;
        color: #0f172a;
      }
      .btn-stop {
        background: #ef4444;
        color: white;
      }
      .footer-actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 6px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      }
      .link-btn {
        background: transparent;
        border: none;
        color: #818cf8;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        text-decoration: underline;
        padding: 2px 4px;
      }
      .link-btn:hover { color: #a5b4fc; }
      .icon-btn {
        background: transparent;
        border: none;
        color: #64748b;
        cursor: pointer;
        font-size: 13px;
        padding: 3px 6px;
        border-radius: 4px;
      }
      .icon-btn:hover {
        color: #f1f5f9;
        background: rgba(255, 255, 255, 0.1);
      }
    </style>

    <div class="dock-card">
      <div class="header">
        <div class="title-group">
          <div class="badge-icon">⚡</div>
          <div>
            <div class="title" style="display: flex; align-items: center; gap: 6px;">
              <span>Facebook Auto-Joiner</span>
              <span style="font-size: 9px; font-weight: 700; background: rgba(16, 185, 129, 0.2); color: #34d399; padding: 1px 5px; border-radius: 4px; border: 1px solid rgba(16, 185, 129, 0.4);">TURBO FAST ⚡</span>
            </div>
            <div class="subtitle" title="${o||"Group Search Results"}">
              ${o?`Search: "${o}"`:"Group Search Results"}
            </div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 4px;">
          <div class="status-pill">
            <div class="status-dot"></div>
            <span>${t.status}</span>
          </div>
          <button id="agp-dock-min" class="icon-btn" title="Minimize">−</button>
          <button id="agp-dock-close" class="icon-btn" title="Dismiss">✕</button>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-num" style="color: #60a5fa;">${t.totalFound}</div>
          <div class="stat-label">Found</div>
        </div>
        <div class="stat-item">
          <div class="stat-num" style="color: #34d399;">${t.joinedCount}</div>
          <div class="stat-label">Joined</div>
        </div>
        <div class="stat-item">
          <div class="stat-num" style="color: #fbbf24;">${t.requestedCount}</div>
          <div class="stat-label">Pending</div>
        </div>
        <div class="stat-item">
          <div class="stat-num" style="color: #a78bfa;">${t.alreadyJoinedCount}</div>
          <div class="stat-label">Member</div>
        </div>
      </div>

      ${t.countdownSec>0?`<div class="countdown-bar-container">
               <div class="countdown-bar" style="width: 100%; transition: width 0.9s linear;"></div>
             </div>`:""}

      <div class="message-box">
        ${t.message||"Ready to auto-join all groups on this search page and save them to your list."}
      </div>

      <div class="btn-row">
        ${!n&&!r?`<button id="btn-start-join" class="btn btn-primary">
                 <span>▶</span> Auto-Join All Groups
               </button>`:n?`<button id="btn-pause-join" class="btn btn-pause">⏸ Pause</button>
               <button id="btn-stop-join" class="btn btn-stop">⏹ Stop</button>`:`<button id="btn-resume-join" class="btn btn-primary">▶ Resume</button>
               <button id="btn-stop-join" class="btn btn-stop">⏹ Stop</button>`}
      </div>

      <div class="footer-actions">
        <span style="font-size: 10px; color: #64748b;">Groups auto-saved for posting</span>
        <button id="btn-view-groups" class="link-btn">View My Groups ↗</button>
      </div>
    </div>
  `;const c=U.getElementById("agp-dock-close");c&&(c.onclick=()=>{J&&(J.remove(),J=null,U=null)});const i=U.getElementById("agp-dock-min");i&&(i.onclick=()=>{We=!0,ke(t,e)});const a=U.getElementById("btn-view-groups");a&&(a.onclick=()=>{var u;try{typeof chrome<"u"&&((u=chrome.runtime)!=null&&u.sendMessage)&&chrome.runtime.sendMessage({type:"OPEN_DASHBOARD"})}catch{}});const l=U.getElementById("btn-start-join");l&&(l.onclick=()=>{R.getInstance().start(e||{searchUrl:window.location.href,delaySec:0,maxGroups:0,autoAnswerQuestions:!0,defaultAnswer:"Yes, I agree to the group rules and guidelines.",saveToGroups:!0})});const d=U.getElementById("btn-pause-join");d&&(d.onclick=()=>{R.getInstance().pause()});const p=U.getElementById("btn-resume-join");p&&(p.onclick=()=>{R.getInstance().resume()});const g=U.getElementById("btn-stop-join");g&&(g.onclick=()=>{R.getInstance().stop()})}console.log("[AGP:Content] Facebook Assistant Content Script initialized.");let V=null,A=null,w=null,te=!1,Ce=!1,ie=null,Se=!1;function Ve(){T&&(clearInterval(T),T=null),O=!1,W=!0,Se=!0;try{chrome.runtime.sendMessage({type:"STOP_QUEUE"})}catch{}V&&(V.remove(),V=null,A=null),k("🛑 Auto-Posting বন্ধ করা হয়েছে (Stopped & Closed)")}async function Mt(t){try{return await navigator.clipboard.writeText(t),!0}catch{const o=document.createElement("textarea");o.value=t,document.body.appendChild(o),o.select();const n=document.execCommand("copy");return document.body.removeChild(o),n}}async function dt(t,e){try{if(navigator.clipboard&&window.ClipboardItem){const o=new Blob([t],{type:"text/plain"}),n=new Blob([e],{type:"text/html"});return await navigator.clipboard.write([new window.ClipboardItem({"text/plain":o,"text/html":n})]),!0}}catch{}try{const o=r=>{var s,c;r.preventDefault(),(s=r.clipboardData)==null||s.setData("text/plain",t),(c=r.clipboardData)==null||c.setData("text/html",e)};document.addEventListener("copy",o);const n=document.execCommand("copy");if(document.removeEventListener("copy",o),n)return!0}catch{}return Mt(t)}function k(t,e=!1){if(A){const o=A.getElementById("agp-toast");o&&o.remove();const n=document.createElement("div");n.id="agp-toast",n.innerText=t,n.style.cssText=`
      position: absolute;
      top: 12px;
      left: 50%;
      transform: translateX(-50%);
      background: ${e?"#ef4444":"#10b981"};
      color: #ffffff;
      font-size: 12px;
      font-weight: 600;
      padding: 6px 14px;
      border-radius: 9999px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.4);
      z-index: 1000;
      pointer-events: none;
      animation: fadeInOut 2.2s ease forwards;
    `,A.appendChild(n),setTimeout(()=>n.remove(),2400);return}if(typeof document<"u"&&document.body){const o=document.getElementById("agp-global-toast");o&&o.remove();const n=document.createElement("div");n.id="agp-global-toast",n.innerText=t,n.style.cssText=`
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${e?"#ef4444":"#10b981"};
      color: #ffffff;
      font-size: 13px;
      font-weight: 700;
      padding: 10px 20px;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.5);
      z-index: 2147483647;
      pointer-events: none;
      opacity: 0;
      transform: translateY(-10px);
      transition: opacity 0.3s ease, transform 0.3s ease;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `,document.body.appendChild(n),requestAnimationFrame(()=>{n.style.opacity="1",n.style.transform="translateY(0)"}),setTimeout(()=>{n.style.opacity="0",n.style.transform="translateY(-10px)",setTimeout(()=>n.remove(),400)},3e3)}}let O=!1,_="Preparing auto-post...",T=null,W=!1;const E=t=>new Promise(e=>setTimeout(e,t));async function $t(t,e="media_1"){try{if(!t||typeof t!="string")return null;let o="image/jpeg",n=null;if(t.startsWith("data:")||t.startsWith("blob:")||t.startsWith("http://")||t.startsWith("https://"))try{const d=await fetch(t);(d.ok||t.startsWith("data:")||t.startsWith("blob:"))&&(n=await d.blob(),n&&n.size>0&&(o=(n.type||"").toLowerCase()||"image/jpeg"))}catch(d){console.warn("[AGP:AutoPost] fetch blob parsing failed, falling back to manual decode:",d)}if(!n||n.size===0){let d=t;if(t.startsWith("data:")){const p=t.indexOf(",");if(p!==-1){const g=t.slice(0,p);d=t.slice(p+1);const u=g.match(/:(.*?);/);o=u?u[1].toLowerCase():"image/jpeg"}}try{const p=atob(d.trim().replace(/\s/g,"")),g=new Uint8Array(p.length);for(let u=0;u<p.length;u++)g[u]=p.charCodeAt(u);if(g.length===0)return null;g.length>8&&g[4]===102&&g[5]===116&&g[6]===121&&g[7]===112&&(o="video/mp4"),n=new Blob([g.buffer],{type:o})}catch(p){return console.warn("[AGP:AutoPost] base64 decode failed:",p),null}}if(!n||n.size===0)return null;const r=o.startsWith("video/");let s="jpg";o.includes("video/mp4")||o.includes("mp4")?s="mp4":o.includes("video/webm")||o.includes("webm")?s="webm":o.includes("video/quicktime")||o.includes("mov")?s="mov":o.includes("video/x-m4v")||o.includes("m4v")?s="m4v":o.includes("video/mkv")||o.includes("matroska")?s="mkv":r?s="mp4":o.includes("png")?s="png":o.includes("webp")?s="webp":o.includes("gif")&&(s="gif");const c=Date.now(),i=e.replace(/\D/g,"")||"1",l=`${r?"VID":"IMG"}_${c}_${i}.${s}`;return new File([n],l,{type:o,lastModified:c})}catch(o){return console.warn("[AGP:AutoPost] mediaToFile error:",o),null}}function D(t){if(!t)return!1;if(t.offsetParent!==null)return!0;try{const e=window.getComputedStyle(t);if(e.display==="none"||e.visibility==="hidden"||e.opacity==="0")return!1;const o=t.getBoundingClientRect();return o.width>0&&o.height>0}catch{return!1}}function He(){const t=Array.from(document.querySelectorAll('[data-pagelet="GroupInlineComposer"], [data-pagelet="FeedInlineComposer"], [data-pagelet="GroupComposer"], [data-pagelet*="Composer" i]'));for(const o of t){if(o.closest('[role="article"], [data-pagelet*="FeedUnit"], [data-pagelet*="Comment"], form'))continue;const n=o.querySelector('[role="button"]');if(n&&D(n))return n}const e=Array.from(document.querySelectorAll('[role="main"] [role="button"], [role="button"]'));for(const o of e){if(o.closest('[role="article"], [data-pagelet*="FeedUnit"], [data-pagelet*="Comment"], form'))continue;const n=(o.getAttribute("aria-label")||"").toLowerCase(),r=(o.textContent||"").trim().toLowerCase();if((n.includes("create a public post")||n.includes("write something")||n.includes("create a post")||n.includes("কিছু লিখুন")||n.includes("পোস্ট তৈরি করুন")||n.includes("একটি পাবলিক পোস্ট")||r==="create a public post..."||r==="write something..."||r==="create a post..."||r==="create post"||r.includes("কিছু লিখুন")||r.includes("পোস্ট তৈরি করুন")||r.includes("পাবলিক পোস্ট"))&&D(o))return o}return null}function Pe(){const t=Array.from(document.querySelectorAll('[role="dialog"]'));for(const e of t)if(D(e)){if(e.closest('[role="article"]')||e.querySelector('[data-pagelet*="ChatTab"], [aria-label*="Messenger" i]'))continue;const o=(e.textContent||"").toLowerCase(),n=(e.getAttribute("aria-label")||"").toLowerCase();if(n.includes("create post")||n.includes("create a public post")||n.includes("পোস্ট তৈরি করুন")||o.includes("create post")||o.includes("create a public post")||o.includes("add to your post")||o.includes("পোস্ট তৈরি করুন")||o.includes("আপনার পোস্টে যোগ করুন")||!!e.querySelector('[aria-label*="Add to your post" i], [aria-label*="আপনার পোস্টে যোগ করুন" i], [aria-label*="Photo/video" i]'))return e}return null}function me(){const t=(document.body?document.body.innerText:"").toLowerCase(),e=(document.title||"").toLowerCase();return window.location.href.toLowerCase().includes("/groups/grp_")||t.includes("this content isn't available right now")||t.includes("this content isn't available")||t.includes("content isn't available right now")||t.includes("the link you followed may be broken")||t.includes("page may have been removed")||t.includes("এই কন্টেন্টটি এখন উপলব্ধ নয়")||t.includes("এই লিঙ্কটি হয়তো ত্রুটিপূর্ণ")||e.includes("page not found")||e.includes("content not found")||!!document.querySelector('[role="main"] [aria-label*="Go to Feed" i], [role="main"] a[href="/"][role="button"]')}async function Ot(){if(me())return null;let t=Pe();if(t)return t;const e=He();if(!e)return console.log("[AGP:AutoPost] Composer trigger not found on page."),null;e.scrollIntoView({behavior:"instant",block:"center"}),await E(40),e.dispatchEvent(new PointerEvent("pointerdown",{bubbles:!0,cancelable:!0})),e.dispatchEvent(new MouseEvent("mousedown",{bubbles:!0,cancelable:!0})),e.dispatchEvent(new PointerEvent("pointerup",{bubbles:!0,cancelable:!0})),e.dispatchEvent(new MouseEvent("mouseup",{bubbles:!0,cancelable:!0})),e.click();const o=Date.now();for(;Date.now()-o<4e3;)if(await E(40),t=Pe(),t)return t;return null}async function pt(t,e){if(!e||!e.trim())return!0;const o=Tt(Re(e)).replace(/\r\n/g,`
`).replace(/\r/g,`
`),n=o.split(`
`);await dt(o.trim(),qe(o));let r=null;const s=Date.now(),c=['div[role="textbox"][contenteditable="true"]','div[data-lexical-editor="true"][contenteditable="true"]','div[contenteditable="true"]:not([aria-label*="comment" i]):not([aria-label*="মন্তব্য" i])','div[data-editor="true"]','div[aria-label*="Create a public post" i][contenteditable="true"]','div[aria-label*="Write something" i][contenteditable="true"]','div[aria-label*="কিছু লিখুন" i][contenteditable="true"]','div[aria-label*="পাবলিক পোস্ট" i][contenteditable="true"]','div[aria-placeholder*="Create a public post" i]','div[aria-placeholder*="Write something" i]'];for(;Date.now()-s<5e3;){for(const b of c){const y=t.querySelector(b)||document.querySelector(`[role="dialog"] ${b}`);if(y&&D(y)){r=y;break}}if(r)break;await E(40)}if(!r)return console.warn("[AGP:AutoPost] Create post editor not found inside modal."),!1;const i=(r.textContent||"").trim(),a=o.trim().slice(0,30);if(i.length>=o.trim().length*.7&&(!a||i.includes(a)))return console.log("[AGP:AutoPost] Editor already contains caption. Skipping duplicate injection."),!0;r.scrollIntoView({behavior:"instant",block:"center"}),window.focus(),r.focus();const l={bubbles:!0,cancelable:!0,view:window};r.dispatchEvent(new PointerEvent("pointerdown",l)),r.dispatchEvent(new MouseEvent("mousedown",l)),r.dispatchEvent(new PointerEvent("pointerup",l)),r.dispatchEvent(new MouseEvent("mouseup",l)),r.dispatchEvent(new MouseEvent("click",l)),r.dispatchEvent(new FocusEvent("focus",{bubbles:!1})),r.dispatchEvent(new FocusEvent("focusin",{bubbles:!0})),await E(40);try{const b="agp_inj_"+Date.now()+"_"+Math.random().toString(36).slice(2,7),y=new Promise(x=>{const v=P=>{P.data&&P.data.type==="AGP_MAIN_INJECT_CAPTION_RESPONSE"&&P.data.messageId===b&&(window.removeEventListener("message",v),x(!!P.data.success))};window.addEventListener("message",v),setTimeout(()=>{window.removeEventListener("message",v),x(!1)},1e3)});if(window.postMessage({type:"AGP_MAIN_INJECT_CAPTION",messageId:b,caption:o},"*"),await y&&(console.log("[AGP:AutoPost] MAIN world injection succeeded with exact layout!"),await E(60),(r.textContent||"").trim().length>0))return!0}catch(b){console.warn("[AGP:AutoPost] MAIN world bridge error, using direct content injection:",b)}const d=(r.textContent||"").trim();if(d.length>=o.trim().length*.7&&(!a||d.includes(a)))return console.log("[AGP:AutoPost] Editor already populated by bridge. Skipping fallback Strategy 2."),!0;const p=window.getSelection();if(p){const b=document.createRange();b.selectNodeContents(r),p.removeAllRanges(),p.addRange(b),r.dispatchEvent(new InputEvent("beforeinput",{bubbles:!0,cancelable:!0,inputType:"deleteContentBackward"}))}document.execCommand("selectAll",!1),document.execCommand("delete",!1),await E(30);const g=r.querySelector("p")||r;if(g.dispatchEvent(new MouseEvent("mousedown",l)),g.dispatchEvent(new MouseEvent("mouseup",l)),g.click(),p){const b=document.createRange();g.childNodes.length>0?(b.setStart(g,0),b.setEnd(g,g.childNodes.length)):b.selectNodeContents(g),b.collapse(!0),p.removeAllRanges(),p.addRange(b)}document.dispatchEvent(new Event("selectionchange"));let u=!1;const f=qe(o);try{if(document.execCommand("paste")&&(await E(60),(r.textContent||"").trim().length>=o.trim().length*.5&&(u=!0)),!u){const y=new DataTransfer;y.setData("text/plain",o),y.setData("text/html",f);const h=new ClipboardEvent("paste",{bubbles:!0,cancelable:!0,clipboardData:y});r.dispatchEvent(h),await E(80);let x=(r.textContent||"").trim();if((!x||x.length<5)&&(r.dispatchEvent(new InputEvent("beforeinput",{bubbles:!0,cancelable:!0,inputType:"insertFromPaste",dataTransfer:y})),await E(60),x=(r.textContent||"").trim()),!x||x.length<5)try{document.execCommand("insertHTML",!1,f),await E(60),x=(r.textContent||"").trim()}catch{}const v=r.querySelectorAll("p, h1, h2, h3, ul, ol, li, blockquote"),P=r.querySelectorAll("h1, h2, ul, ol, blockquote").length>0;x.length>0&&(!o.includes(`
`)||v.length>1||P||x.length>=o.trim().length*.4)&&(console.log("[AGP:AutoPost] Direct Native Paste event succeeded. Block count:",v.length),u=!0)}}catch(b){console.warn("[AGP:AutoPost] Native paste event error:",b)}if(!u)try{console.log("[AGP:AutoPost] Trying Strategy 3: Line-by-line Enter keystrokes with non-collapsing spacing..."),document.execCommand("selectAll",!1),document.execCommand("delete",!1),await E(30);for(let y=0;y<n.length;y++){const h=n[y],x=y===n.length-1;h.length>0?document.execCommand("insertText",!1,h):document.execCommand("insertText",!1," "),x||(r.dispatchEvent(new KeyboardEvent("keydown",{key:"Enter",code:"Enter",keyCode:13,which:13,bubbles:!0,cancelable:!0})),r.dispatchEvent(new InputEvent("beforeinput",{inputType:"insertParagraph",bubbles:!0,cancelable:!0})),document.execCommand("insertParagraph",!1),r.dispatchEvent(new InputEvent("input",{inputType:"insertParagraph",bubbles:!0})),r.dispatchEvent(new KeyboardEvent("keyup",{key:"Enter",code:"Enter",keyCode:13,which:13,bubbles:!0})),await E(8))}await E(80),(r.textContent||"").trim().length>0&&(console.log("[AGP:AutoPost] Strategy 3 succeeded."),u=!0)}catch(b){console.warn("[AGP:AutoPost] Strategy 3 error:",b)}return r.dispatchEvent(new Event("input",{bubbles:!0})),r.dispatchEvent(new Event("change",{bubbles:!0})),document.dispatchEvent(new Event("selectionchange")),await E(60),(r.textContent||"").trim().length>0}function Nt(t){const e=t.querySelector('[aria-label*="Photo/video" i], [aria-label*="Photo / video" i], [aria-label*="Add photo" i], [aria-label*="Add Photos" i], [aria-label*="Add photos or videos" i], [aria-label*="Add video" i], [aria-label*="Add Photos/videos" i], [aria-label*="ফটো/ভিডিও" i], [aria-label*="Photo" i], [aria-label*="Video" i], [aria-label*="ছবি/ভিডিও" i], [aria-label*="ছবি" i], [aria-label*="ভিডিও" i], div[aria-label*="Photo" i], div[aria-label*="Video" i], div[aria-label*="ফটো" i], div[aria-label*="ভিডিও" i]');if(e&&D(e))return e;const o=Array.from(t.querySelectorAll('[role="button"], button, div[tabindex="0"]'));for(const r of o){const s=(r.getAttribute("aria-label")||"").toLowerCase();if((s.includes("photo")||s.includes("video")||s.includes("image")||s.includes("ফটো")||s.includes("ছবি")||s.includes("ভিডিও"))&&D(r))return r}const n=Array.from(t.querySelectorAll("span, div, p"));for(const r of n){const s=(r.textContent||"").trim().toLowerCase();if(s==="add to your post"||s==="আপনার পোস্টে যোগ করুন"||s.includes("add to your post")){const c=r.closest("div"),i=(c==null?void 0:c.parentElement)||c,a=i==null?void 0:i.querySelector('[role="button"], img, svg');if(a&&D(a))return a.closest('[role="button"]')||a}}return null}function ft(t){return t.querySelector('input[type="file"][accept*="video"]')||t.querySelector('input[type="file"][accept*="image"]')||t.querySelector('input[type="file"]')||document.querySelector('[role="dialog"] input[type="file"]')||document.querySelector('input[type="file"]')}function se(t){var o;const e=(t.textContent||"").toLowerCase();if(e.includes("your file can't be uploaded")||e.includes("file can't be uploaded")||e.includes("আপলোড করা যাবে না")||e.includes("আপলোড করা যায়নি")||e.includes("couldn't be uploaded")||e.includes("error uploading")){const n=Array.from(t.querySelectorAll("span, div, p")).find(r=>{const s=(r.textContent||"").toLowerCase();return s.includes("your file can't be uploaded")||s.includes("file can't be uploaded")||s.includes("আপলোড করা যাবে না")||s.includes("আপলোড করা যায়নি")||s.includes("couldn't be uploaded")});return((o=n==null?void 0:n.textContent)==null?void 0:o.trim())||"Your file can't be uploaded"}return null}async function Rt(t,e){if(!e||e.length===0)return!0;e.some(i=>i.includes("video")||i.includes(".mp4")||i.includes(".mov")||i.includes(".webm"));let o=ft(t);if(!o){const i=Nt(t);if(i){i.scrollIntoView({behavior:"instant",block:"center"}),i.dispatchEvent(new PointerEvent("pointerdown",{bubbles:!0,cancelable:!0})),i.dispatchEvent(new MouseEvent("mousedown",{bubbles:!0,cancelable:!0})),i.dispatchEvent(new PointerEvent("pointerup",{bubbles:!0,cancelable:!0})),i.dispatchEvent(new MouseEvent("mouseup",{bubbles:!0,cancelable:!0})),i.click();const a=Date.now();for(;Date.now()-a<2500&&(await E(40),o=ft(t),!o););}}if(!o)return console.warn("[AGP:AutoPost] File input not found inside create post modal."),!1;const n=new DataTransfer;for(let i=0;i<e.length;i++){const a=await $t(e[i],`media_${i+1}`);a&&a.size>0&&(n.items.add(a),console.log(`[AGP:AutoPost] Prepared media file #${i+1}: ${a.name} (${a.type}, ${a.size} bytes)`))}if(n.files.length===0)return console.warn("[AGP:AutoPost] No valid non-empty files prepared from mediaList."),!1;o.files=n.files;const r=o._valueTracker;r&&r.setValue(""),o.dispatchEvent(new Event("change",{bubbles:!0,cancelable:!0})),o.dispatchEvent(new Event("input",{bubbles:!0,cancelable:!0}));const s=4e3,c=Date.now();for(;Date.now()-c<s;){const i=se(t);if(i)return console.warn("[AGP:AutoPost] Facebook upload error detected:",i),!1;if(!!t.querySelector('video, img[src*="blob:"], img[src*="data:"], img[src*="fbcdn.net"], div[aria-label*="Video" i], div[aria-label*="Photo" i], div[data-pagelet*="MediaViewer"], div[aria-label*="Edit" i], button[aria-label*="Edit" i], div[aria-label*="Remove" i], div[role="button"][aria-label*="Edit" i]')){console.log("[AGP:AutoPost] Media preview mounted immediately in composer."),await E(80);break}await E(40)}return!se(t)}function gt(t,e){return t.includes("joined")||t.includes("যোগ দিয়েছেন")||t.includes("মেম্বার")||t.includes("member")||t.includes("leave group")||t.includes("গ্রুপ ত্যাগ")||e.includes("joined")||e.includes("যোগ দিয়েছেন")||e.includes("member")}function ae(){const t=['[aria-label*="Join group" i]','[aria-label*="Join Group" i]','[aria-label*="গ্রুপে যোগ দিন" i]','[aria-label*="যোগ দিন" i]','[aria-label*="গ্রুপে যুক্ত হন" i]','[aria-label*="Request to join" i]','[aria-label*="Request to Join" i]','[aria-label*="গ্রুপে যোগ দেওয়ার অনুরোধ" i]','[aria-label*="যোগ দেওয়ার অনুরোধ" i]','[aria-label*="গ্রুপে যোগদানের অনুরোধ" i]','div[role="button"][aria-label*="Join" i]','div[role="button"][aria-label*="যোগ" i]','button[aria-label*="Join" i]','button[aria-label*="যোগ" i]'];for(const o of t){const n=document.querySelector(o);if(n&&D(n)){const r=(n.innerText||n.textContent||"").trim().toLowerCase(),s=(n.getAttribute("aria-label")||"").toLowerCase();if(!gt(r,s))return n}}const e=Array.from(document.querySelectorAll('div[role="main"] [role="button"], div[role="main"] button, div[role="region"] [role="button"], [role="banner"] [role="button"], div[role="button"], button'));for(const o of e){if(!D(o))continue;const n=(o.innerText||o.textContent||"").trim().toLowerCase(),r=(o.getAttribute("aria-label")||"").toLowerCase();if(!gt(n,r)&&(n==="join group"||n==="join"||n==="গ্রুপে যোগ দিন"||n==="যোগ দিন"||n==="গ্রুপে যুক্ত হন"||n==="request to join"||n==="request to join group"||n==="যোগ দেওয়ার অনুরোধ"||n==="যোগ দেওয়ার অনুরোধ জানান"||n.includes("join group")||n.includes("গ্রুপে যোগ দিন")))return o}return null}function Ke(){const t=!!ae(),e=!!He();return t&&!e}async function bt(){const t=ae();if(!t)return{success:!1,isInstantMember:!1,reason:"Join button not found"};console.log("[AGP:AutoJoin] Found Join button. Executing automatic join click..."),_="⚡ Auto-joining group (গ্রুপে যোগ দেওয়া হচ্ছে)...",C(),k("⚡ Auto-joining group...",!0),t.scrollIntoView({behavior:"instant",block:"center"}),await E(60);const e={bubbles:!0,cancelable:!0,view:window};t.dispatchEvent(new PointerEvent("pointerdown",e)),t.dispatchEvent(new MouseEvent("mousedown",e)),t.dispatchEvent(new PointerEvent("pointerup",e)),t.dispatchEvent(new MouseEvent("mouseup",e)),t.click(),await E(1500);const o=document.querySelector('div[role="dialog"]');if(o&&D(o)){console.log("[AGP:AutoJoin] Rules agreement or membership question dialog detected. Handling...");const c=Array.from(o.querySelectorAll('input[type="checkbox"], div[role="checkbox"]'));for(const l of c)l.getAttribute("aria-checked")==="true"||l.checked||(l.click(),await E(80));const i=Array.from(o.querySelectorAll('textarea, input[type="text"]'));for(const l of i)(!l.value||!l.value.trim())&&(l.value="Agree",l.dispatchEvent(new Event("input",{bubbles:!0})),l.dispatchEvent(new Event("change",{bubbles:!0})),await E(50));const a=Array.from(o.querySelectorAll('button, [role="button"], input[type="submit"]')).find(l=>{const d=(l.innerText||l.textContent||l.getAttribute("aria-label")||"").trim().toLowerCase();return d==="submit"||d==="send"||d==="agree"||d==="confirm"||d==="সাবমিট"||d==="জমা দিন"||d==="সম্মতি দিচ্ছি"||d.includes("submit")||d.includes("সাবমিট")});a&&D(a)&&(console.log("[AGP:AutoJoin] Clicking modal submit button..."),a.click(),await E(1200))}const n=Date.now();for(;Date.now()-n<3500;){const c=He();if(c&&D(c))return console.log("[AGP:AutoJoin] Instant membership granted! Composer available."),k("✅ Joined group! Post box ready.",!0),{success:!0,isInstantMember:!0,reason:"Instant member"};await E(250)}const r=(document.body?document.body.innerText:"").toLowerCase();return r.includes("requested")||r.includes("pending")||r.includes("অনুরোধ করা হয়েছে")||r.includes("cancel request")||r.includes("অনুরোধ বাতিল")?(console.log("[AGP:AutoJoin] Join request sent (Pending admin approval)."),{success:!0,isInstantMember:!1,reason:"Join request pending admin approval"}):ae()?{success:!0,isInstantMember:!1,reason:"Join submitted"}:{success:!0,isInstantMember:!1,reason:"Join request submitted"}}function mt(){if(me())return{forbidden:!0,reason:"Group unavailable or broken link"};const t=(document.body?document.body.innerText:"").toLowerCase();return t.includes("only admins can post")||t.includes("শুধুমাত্র অ্যাডমিনরা এই গ্রুপে পোস্ট করতে পারবেন")||t.includes("শুধুমাত্র অ্যাডমিনরা পোস্ট করতে পারবেন")||t.includes("posting is paused for this group")||t.includes("posting is turned off")||t.includes("এই গ্রুপের জন্য পোস্ট করা সাময়িকভাবে বন্ধ আছে")||t.includes("posting in this group has been paused")?{forbidden:!0,reason:"Posting is paused or admin-only in this group"}:t.includes("you can't post to this group")||t.includes("you've been temporarily blocked")||t.includes("you have been muted")||t.includes("আপনার অ্যাকাউন্ট সাময়িকভাবে ব্লক করা হয়েছে")||t.includes("আপনাকে এই গ্রুপে পোস্ট করা থেকে সাময়িকভাবে নিষিদ্ধ করা হয়েছে")?{forbidden:!0,reason:"Account restricted or muted in this group"}:{forbidden:!1,reason:""}}let ht=!1;async function M(t){if(!(ht||!(w!=null&&w.queueItem))){ht=!0,O=!1,T&&(clearInterval(T),T=null);try{window.onbeforeunload=null}catch{}console.warn(`[AGP:AutoPost] Auto-skipping group: ${t}`),_=`⚡ Auto-skipping: ${t}...`,C(),k(`⚡ Auto-skipping: ${t}...`,!0),await E(200),chrome.runtime.sendMessage({type:"SKIP_CURRENT_ITEM",payload:{itemId:w.queueItem.id,reason:t}})}}async function Ut(t,e=15e3){const o=Date.now();for(;Date.now()-o<e;){const n=[t,...Array.from(document.querySelectorAll('[role="dialog"]'))];for(const r of n){const s=Array.from(r.querySelectorAll('[role="button"], button'));for(const c of s){const i=(c.getAttribute("aria-label")||"").toLowerCase().trim(),a=(c.textContent||"").toLowerCase().trim(),l=c.getAttribute("aria-disabled")==="true"||c.disabled||c.classList.contains("aria-disabled")||c.classList.contains("disabled");if((i==="post"||i==="publish"||i==="submit"||i==="submit for review"||i==="পোস্ট"||i==="সাবমিট"||i==="পোস্ট করুন"||i==="সাবমিট করুন"||i.includes("post to group")||i.includes("গ্রুপে পোস্ট")||i.includes("submit for review")||i.includes("রিভিউ")||a==="post"||a==="পোস্ট"||a==="publish"||a==="submit"||a==="submit for review"||a==="পোস্ট করুন"||a==="সাবমিট"||a==="সাবমিট করুন"||a==="post to group"||a==="পাবলিশ"||a.includes("submit for review")||a.includes("রিভিউয়ের জন্য সাবমিট"))&&!l)return c.scrollIntoView({behavior:"instant",block:"center"}),await E(30),c.style.outline="3px solid #10b981",c.dispatchEvent(new PointerEvent("pointerdown",{bubbles:!0,cancelable:!0})),c.dispatchEvent(new MouseEvent("mousedown",{bubbles:!0,cancelable:!0})),c.dispatchEvent(new PointerEvent("pointerup",{bubbles:!0,cancelable:!0})),c.dispatchEvent(new MouseEvent("mouseup",{bubbles:!0,cancelable:!0})),c.click(),!0}}await E(40)}return!1}async function Ie(){if(O||!w||!w.queueItem)return;if(me()){await M("Group unavailable on Facebook");return}if(!w.isGroupMatch){await M("Wrong group URL detected");return}if(Ke()||ae()){O=!0,_="⚡ Step 0/4: Auto-joining group (গ্রুপে যোগ দেওয়া হচ্ছে)...",C(),k("⚡ Auto-joining group...",!0);const e=await bt();if(e.isInstantMember)console.log("[AGP:AutoPost] Successfully auto-joined group! Proceeding with post..."),_="⚡ Joined! Step 1/4: Opening Post Box...",C(),k("✅ Joined! Now opening post box...",!0),await E(1e3);else{_=`⚡ ${e.reason}. Advancing to next group...`,C(),k(`⚡ ${e.reason}`,!0),await E(1800),await M(e.reason);return}}const t=mt();if(t.forbidden){await M(t.reason);return}O=!0,_="⚡ Step 1/4: Opening Post Box...",C();try{const e=await Ot();if(!e){if(me()){await M("Group unavailable on Facebook");return}await M("Could not open Facebook post box");return}_="⚡ Step 2/4: Typing caption...",C();const o=w.caption||w.formattedPost||"";o&&o.trim()&&(await pt(e,o)||(console.warn("[AGP:AutoPost] Caption injection check returned false, but clipboard has caption. Proceeding to photos..."),k("⚠️ Caption in clipboard (Ctrl+V ready)")));const n=w.media||[],r=n.some(u=>u.includes("video")||u.includes(".mp4")||u.includes(".mov")||u.includes(".webm")||u.includes("data:video"));if(n.length>0&&(_=r?`⚡ Step 3/4: Attaching video (${n.length} files)...`:`⚡ Step 3/4: Attaching ${n.length} photos...`,C(),!await Rt(e,n))){const f=se(e);if(f){console.warn("[AGP:AutoPost] Upload rejected by Facebook:",f),_=`❌ Upload failed: ${f}`,C(),await M(`Media rejected by Facebook: ${f}`);return}console.warn("[AGP:AutoPost] Media attachment warning - continuing post workflow")}if(_="⚡ Step 4/4: Submitting post...",C(),!await Ut(e,15e3)){const u=se(e);u?await M(`Facebook upload error: ${u}`):await M("Post button disabled or timed out");return}_="⚡ Post submitted! Shifting to next group...",C();const i=Date.now();let a=!1;const l=3500;for(;Date.now()-i<l;){const u=Pe();if(!u){console.log("[AGP:AutoPost] Composer dialog closed cleanly. Post submitted successfully!"),a=!0;break}const f=se(u);if(f){console.warn("[AGP:AutoPost] Post aborted due to Facebook file error:",f),_=`❌ Upload error: ${f}`,C(),await M(`Facebook upload error: ${f}`);return}const m=Array.from(document.querySelectorAll('[role="dialog"]'));for(const b of m){const y=(b.textContent||"").toLowerCase();if(y.includes("pending")||y.includes("approval")||y.includes("admin")||y.includes("অনুমোদনের অপেক্ষায়")||y.includes("অনুমোদন")||y.includes("সাবমিট করা হয়েছে")||y.includes("আপনার পোস্টটি জমা দেওয়া হয়েছে")){const h=Array.from(b.querySelectorAll('[role="button"], button')).find(x=>{const v=(x.textContent||"").toLowerCase().trim();return v==="done"||v==="ok"||v==="ঠিক আছে"||v==="close"||v==="বন্ধ করুন"||v==="got it"});if(h){h.click(),await E(150),a=!0;break}}}if(a)break;await E(60)}if(!a){const u=Pe();if(u){const f=se(u);if(f){console.warn("[AGP:AutoPost] Facebook upload error remained:",f),_=`❌ Upload failed: ${f}`,C(),await M(`Facebook upload error: ${f}`);return}if(!!u.querySelector('[aria-disabled="true"], button[disabled]')){console.warn("[AGP:AutoPost] Post button remained disabled after wait"),_="❌ Post button stayed disabled",C(),await M("Post button disabled or upload blocked by Facebook");return}}}try{window.onbeforeunload=null}catch{}_="⚡ Post submitted! Moving to next group...",C();const d=w.queueIndex,p=w.totalQueueItems,g=(w.postedCount||d-1)+1;k(`⚡ Auto-Posted to Group #${d}! (${g}/${p} done)`),chrome.runtime.sendMessage({type:"MARK_AS_POSTED",payload:{itemId:w.queueItem.id}})}catch(e){const o=e instanceof Error?e.message:String(e);console.log("[AGP:AutoPost] Routine caught error, auto-skipping:",o),await M(o||"Posting failed")}}function Dt(){if(W||O||!(w!=null&&w.queueItem))return;if(me()){_="⚡ Group unavailable on Facebook. Auto-skipping...",C(),setTimeout(()=>{M("Group unavailable on Facebook")},100);return}if(!w.isGroupMatch){_="⚡ Wrong group detected. Auto-skipping to next group...",C(),k("⚠️ Wrong group detected. Auto-skipping...",!0),setTimeout(()=>{W||M("Wrong group URL detected")},200);return}if(Ke()||ae()){_="⚡ Not joined: Auto-joining group...",C(),k("⚡ Auto-joining group...",!0),T&&clearInterval(T),T=null,setTimeout(()=>{!W&&!O&&Ie()},100);return}const t=mt();if(t.forbidden){_=`⚡ Cannot post: ${t.reason}. Auto-skipping...`,C(),setTimeout(()=>{M(t.reason)},200);return}_="⚡ Instant Auto-Posting in progress...",C(),T&&clearInterval(T),T=null,setTimeout(()=>{!W&&!O&&Ie()},80)}function C(){var f,m,b,y,h,x,v,P,I,B,$,K,L,j,Y,Me,$e,z,q,ce,le;if(Se||!A)return;const t=X(),e=pe();if(!t.isGroupPage){const S=!!(ie!=null&&ie.isRunning),N=!!(ie!=null&&ie.isPaused),ne=0,G=0,we=0;A.innerHTML=`
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        @keyframes pulseDot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.6; }
        }
        .launcher-pill {
          position: fixed;
          bottom: 24px;
          right: 24px;
          background: #18191a;
          color: #ffffff;
          padding: 10px 16px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.15);
          cursor: pointer;
          z-index: 2147483647;
          user-select: none;
          transition: all 0.2s ease;
        }
        .launcher-pill:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 36px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,0.5);
          background: #242526;
        }
        .badge-logo {
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 900;
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(99,102,241,0.4);
        }
        .launcher-title {
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.2px;
        }
        .status-pill {
          font-size: 11px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .status-pill.running {
          background: rgba(16, 185, 129, 0.2);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.4);
        }
        .status-pill.ready {
          background: rgba(99, 102, 241, 0.2);
          color: #a5b4fc;
          border: 1px solid rgba(99, 102, 241, 0.4);
        }
        .status-pill.paused {
          background: rgba(245, 158, 11, 0.2);
          color: #fbbf24;
          border: 1px solid rgba(245, 158, 11, 0.4);
        }
        .pulse-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10b981;
          animation: pulseDot 1.4s infinite;
        }
        .panel-root {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 360px;
          background: #18191a;
          color: #e4e6eb;
          border-radius: 16px;
          box-shadow: 0 16px 48px -4px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.12);
          z-index: 2147483647;
          overflow: hidden;
          transition: transform 0.25s ease, opacity 0.2s ease;
        }
        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: #242526;
          border-bottom: 1px solid #3a3b3c;
          user-select: none;
        }
        .header-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 800;
          color: #ffffff;
        }
        .header-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .icon-btn {
          background: transparent;
          border: none;
          color: #b0b3b8;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .icon-btn:hover {
          background: #3a3b3c;
          color: #ffffff;
        }
        .close-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 700;
          line-height: 1;
          transition: all 0.15s ease;
        }
        .close-btn:hover {
          background: rgba(239, 68, 68, 0.25) !important;
          color: #ef4444 !important;
        }
        .launcher-close-btn {
          color: #94a3b8;
          font-size: 12px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 9999px;
          border: none;
          background: rgba(255, 255, 255, 0.1);
          cursor: pointer;
          transition: all 0.15s ease;
          margin-left: 6px;
          line-height: 1;
        }
        .launcher-close-btn:hover {
          background: #ef4444 !important;
          color: #ffffff !important;
        }
        .panel-body {
          padding: 14px 16px;
        }
        .info-card {
          background: #242526;
          border: 1px solid #3a3b3c;
          border-radius: 10px;
          padding: 10px 12px;
          margin-bottom: 12px;
        }
        .info-card-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
          color: #cbd5e1;
          margin-bottom: 6px;
        }
        .info-card-row:last-child {
          margin-bottom: 0;
        }
        .info-card strong {
          color: #ffffff;
        }
        .primary-btn {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: #ffffff;
          width: 100%;
          font-size: 13px;
          font-weight: 800;
          padding: 10px;
          border-radius: 8px;
          margin-bottom: 8px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
          transition: all 0.15s ease;
        }
        .primary-btn:hover {
          background: linear-gradient(135deg, #4f46e5, #4338ca);
          transform: translateY(-1px);
        }
        .action-btn {
          background: #3a3b3c;
          color: #e4e6eb;
          border: none;
          padding: 8px 10px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: center;
        }
        .action-btn:hover {
          background: #4e4f50;
          color: #ffffff;
        }
        .button-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          margin-bottom: 8px;
        }
        .progress-container {
          background: #242526;
          border: 1px solid #3a3b3c;
          border-radius: 10px;
          padding: 8px 12px;
          margin-bottom: 10px;
        }
        .progress-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 6px;
        }
        .progress-bar-bg {
          width: 100%;
          height: 6px;
          background: #3a3b3c;
          border-radius: 9999px;
          overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #06b6d4);
          border-radius: 9999px;
          transition: width 0.3s ease;
        }
      </style>

      ${te?`
        <div class="launcher-pill" id="agp-launcher-btn" title="Click to open AI Group Poster Assistant">
          <div class="badge-logo">AI</div>
          <span class="launcher-title">AI Group Poster</span>
          ${S?`
            <span class="status-pill running">
              <span class="pulse-dot"></span>
              Auto-Posting (${ne}/${G})
            </span>
          `:N?`
            <span class="status-pill paused">⏸️ Paused</span>
          `:`
            <span class="status-pill ready">⚡ Turbo Ready</span>
          `}
          <span style="font-size: 12px; color: #94a3b8;">▲</span>
          <button class="launcher-close-btn" id="agp-launcher-close" title="Stop & Close (ডাইরেক্ট অফ)">✕</button>
        </div>
      `:`
        <div class="panel-root">
          <div class="panel-header">
            <div class="header-title">
              <div class="badge-logo">AI</div>
              <span>AI GROUP POSTER</span>
              ${S?'<span class="status-pill running"><span class="pulse-dot"></span> Auto-Posting</span>':N?'<span class="status-pill paused">⏸️ Paused</span>':'<span class="status-pill ready">⚡ Ready</span>'}
            </div>
            <div class="header-actions">
              <button class="icon-btn" id="agp-toggle-btn" title="Minimize">▼ Minimize</button>
              <button class="close-btn" id="agp-close-btn" title="Stop & Close (ডাইরেক্ট অফ)">✕</button>
            </div>
          </div>

          <div class="panel-body">
            ${S?`
              <div class="progress-container">
                <div class="progress-label">
                  <span>Posting: <strong>${ne} of ${G}</strong> Groups</span>
                  <span>${we}%</span>
                </div>
                <div class="progress-bar-bg">
                  <div class="progress-bar-fill" style="width: ${we}%"></div>
                </div>
              </div>

              <div class="info-card">
                <div class="info-card-row">
                  <span>Current Group:</span>
                  <strong>Active Group</strong>
                </div>
                <div class="info-card-row">
                  <span>Speed:</span>
                  <span style="color: #34d399; font-weight: 700;">⚡ Instant (Turbo)</span>
                </div>
              </div>

              

              <button class="action-btn" id="btn-pause-queue" style="width: 100%; margin-bottom: 8px;">
                ⏸️ Pause Auto-Posting
              </button>
            `:`
              <div class="info-card">
                <div class="info-card-row">
                  <span>Logged in as:</span>
                  <strong>${e.name||"Facebook User"}</strong>
                </div>
                <div class="info-card-row">
                  <span>Posting Speed:</span>
                  <span style="color: #34d399; font-weight: 700;">⚡ Turbo (0s delay)</span>
                </div>
                <div class="info-card-row">
                  <span>System:</span>
                  <span style="color: #60a5fa; font-weight: 600;">Active & Synced</span>
                </div>
              </div>

              ${N?`
                <button class="primary-btn" id="btn-resume-queue">
                  ▶️ Resume Auto-Posting Queue
                </button>
              `:`
                <button class="primary-btn" id="btn-open-dashboard">
                  📊 Open Full Dashboard
                </button>
              `}

              <div class="button-grid">
                <button class="action-btn" id="btn-sync-groups">🔄 Sync Groups</button>
                <button class="action-btn" id="btn-start-queue">🤖 Start Queue</button>
              </div>
            `}

            ${S?`
              <button class="action-btn" id="btn-open-dashboard" style="width: 100%;">
                Open Full Dashboard ↗
              </button>
            `:""}
          </div>
        </div>
      `}
    `,(f=A.getElementById("agp-launcher-btn"))==null||f.addEventListener("click",ye=>{var yt;(yt=ye.target)!=null&&yt.closest("#agp-launcher-close")||(te=!1,C())}),(m=A.getElementById("agp-toggle-btn"))==null||m.addEventListener("click",()=>{te=!0,C()}),(b=A.getElementById("agp-close-btn"))==null||b.addEventListener("click",ye=>{ye.stopPropagation(),Ve()}),(y=A.getElementById("agp-launcher-close"))==null||y.addEventListener("click",ye=>{ye.stopPropagation(),Ve()}),(h=A.getElementById("btn-focus-tab"))==null||h.addEventListener("click",()=>{}),(x=A.getElementById("btn-pause-queue"))==null||x.addEventListener("click",()=>{chrome.runtime.sendMessage({type:"PAUSE_QUEUE"},()=>{k("Auto-posting paused"),he()})}),(v=A.getElementById("btn-resume-queue"))==null||v.addEventListener("click",()=>{chrome.runtime.sendMessage({type:"RESUME_QUEUE"},()=>{k("Resuming auto-posting..."),he()})}),(P=A.getElementById("btn-start-queue"))==null||P.addEventListener("click",()=>{chrome.runtime.sendMessage({type:"START_QUEUE"},()=>{k("Starting auto-posting queue..."),he()})}),(I=A.getElementById("btn-sync-groups"))==null||I.addEventListener("click",()=>{window.location.href="https://www.facebook.com/groups/joins/?nav_source=tab"}),(B=A.getElementById("btn-open-dashboard"))==null||B.addEventListener("click",()=>{chrome.runtime.sendMessage({type:"OPEN_DASHBOARD"})});return}const o=w==null?void 0:w.group,n=w==null?void 0:w.post,r=(w==null?void 0:w.queueIndex)||1,s=(w==null?void 0:w.totalQueueItems)||1,c=(w==null?void 0:w.postedCount)??Math.max(0,r-1),i=s>0?Math.round(c/s*100):0,a=(w==null?void 0:w.formattedPost)||(n==null?void 0:n.description)||"",l=(w==null?void 0:w.caption)||(n==null?void 0:n.caption)||(n==null?void 0:n.description)||"",d=w!=null&&w.media?w.media.length:n!=null&&n.images?n.images.length:0,p=w?w.isGroupMatch:!0,g=(w==null?void 0:w.expectedGroupName)||(o==null?void 0:o.name)||"Expected Group",u=t.groupName||"Current Page";A.innerHTML=`
    <style>
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
      @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, -6px); }
        15% { opacity: 1; transform: translate(-50%, 0); }
        85% { opacity: 1; transform: translate(-50%, 0); }
        100% { opacity: 0; transform: translate(-50%, -6px); }
      }
      @keyframes pulseDot {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.3); opacity: 0.6; }
      }
      .panel-root {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 380px;
        background: #18191a;
        color: #e4e6eb;
        border-radius: 16px;
        box-shadow: 0 16px 48px -4px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.12);
        z-index: 2147483647;
        overflow: hidden;
        transition: transform 0.25s ease, opacity 0.2s ease;
      }
      .panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        background: #242526;
        border-bottom: 1px solid #3a3b3c;
        user-select: none;
      }
      .header-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        font-weight: 800;
        color: #ffffff;
        letter-spacing: 0.2px;
      }
      .badge-logo {
        width: 22px;
        height: 22px;
        background: #6366f1;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 900;
        color: #ffffff;
      }
      .autopilot-pill {
        font-size: 10px;
        font-weight: 700;
        background: rgba(16, 185, 129, 0.2);
        color: #34d399;
        border: 1px solid rgba(16, 185, 129, 0.4);
        padding: 2px 7px;
        border-radius: 9999px;
      }
      .header-actions {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .icon-btn {
        background: transparent;
        border: none;
        color: #b0b3b8;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 12px;
      }
      .icon-btn:hover {
        background: #3a3b3c;
        color: #ffffff;
      }
      .icon-btn.close-btn {
        color: #f87171;
        font-size: 14px;
        font-weight: 700;
        padding: 2px 7px;
        margin-left: 4px;
        border-radius: 6px;
      }
      .icon-btn.close-btn:hover {
        background: rgba(239, 68, 68, 0.25);
        color: #ef4444;
      }
      .panel-body {
        padding: 14px 16px;
        display: ${te?"none":"block"};
      }
      .warning-box {
        background: rgba(239, 68, 68, 0.15);
        border: 1px solid rgba(239, 68, 68, 0.4);
        color: #fca5a5;
        padding: 10px 12px;
        border-radius: 8px;
        margin-bottom: 12px;
        font-size: 11px;
        line-height: 1.4;
      }

      /* Total Posted Progress Bar */
      .progress-container {
        background: #242526;
        border: 1px solid #3a3b3c;
        border-radius: 10px;
        padding: 8px 12px;
        margin-bottom: 10px;
      }
      .progress-label {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 11px;
        font-weight: 700;
        color: #ffffff;
        margin-bottom: 6px;
      }
      .progress-bar-bg {
        width: 100%;
        height: 6px;
        background: #3a3b3c;
        border-radius: 9999px;
        overflow: hidden;
      }
      .progress-bar-fill {
        height: 100%;
        background: linear-gradient(90deg, #10b981, #06b6d4);
        border-radius: 9999px;
        transition: width 0.3s ease;
      }

      /* Live Auto-Post Status Box */
      .autopost-box {
        background: rgba(99, 102, 241, 0.12);
        border: 1px solid rgba(99, 102, 241, 0.35);
        border-radius: 10px;
        padding: 10px 12px;
        margin-bottom: 10px;
      }
      .autopost-header {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        font-weight: 800;
        color: #a5b4fc;
        text-transform: uppercase;
        margin-bottom: 3px;
      }
      .pulse-dot {
        width: 7px;
        height: 7px;
        background: #10b981;
        border-radius: 50%;
        animation: pulseDot 1.4s infinite;
      }
      .autopost-status-text {
        font-size: 12px;
        font-weight: 600;
        color: #ffffff;
        line-height: 1.35;
      }

      .meta-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }
      .group-name {
        font-size: 12px;
        font-weight: 700;
        color: #e2e8f0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 210px;
      }
      .queue-badge {
        font-size: 11px;
        font-weight: 700;
        background: rgba(99, 102, 241, 0.2);
        color: #a5b4fc;
        padding: 2px 8px;
        border-radius: 12px;
        border: 1px solid rgba(99, 102, 241, 0.4);
      }
      .post-card {
        background: #242526;
        border: 1px solid #3a3b3c;
        border-radius: 10px;
        padding: 8px 12px;
        margin-bottom: 10px;
      }
      .post-title {
        font-size: 11px;
        font-weight: 700;
        color: #ffffff;
        margin-bottom: 3px;
      }
      .media-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 10px;
        font-weight: 600;
        background: #3a3b3c;
        color: #93c5fd;
        padding: 2px 7px;
        border-radius: 6px;
        margin-bottom: 4px;
      }
      .post-preview {
        font-size: 11px;
        color: #cbd5e1;
        max-height: ${Ce?"160px":"55px"};
        overflow-y: auto;
        white-space: pre-wrap;
        line-height: 1.4;
        border-left: 2px solid #6366f1;
        padding-left: 8px;
      }
      .button-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px;
        margin-bottom: 8px;
      }
      .action-btn {
        background: #3a3b3c;
        color: #e4e6eb;
        border: none;
        padding: 8px 10px;
        border-radius: 8px;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease;
        text-align: center;
      }
      .action-btn:hover {
        background: #4e4f50;
        color: #ffffff;
      }
      .auto-btn {
        background: linear-gradient(135deg, #6366f1, #4f46e5);
        color: #ffffff;
        width: 100%;
        font-size: 13px;
        font-weight: 800;
        padding: 10px;
        border-radius: 8px;
        margin-bottom: 6px;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
      }
      .auto-btn:hover {
        background: linear-gradient(135deg, #4f46e5, #4338ca);
      }
      .auto-btn.running {
        background: linear-gradient(135deg, #d97706, #b45309);
      }
      .primary-btn {
        background: #10b981;
        color: #ffffff;
        width: 100%;
        font-size: 12px;
        font-weight: 700;
        padding: 8px;
        border-radius: 8px;
        margin-bottom: 6px;
      }
      .primary-btn:hover {
        background: #059669;
      }
      .workflow-row {
        display: flex;
        gap: 6px;
      }
      .secondary-btn {
        flex: 1;
        background: #3a3b3c;
        color: #e4e6eb;
        border: none;
        padding: 7px;
        border-radius: 8px;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
      }
      .secondary-btn:hover {
        background: #4e4f50;
        color: #ffffff;
      }
      .link-btn {
        background: transparent;
        color: #818cf8;
        border: none;
        font-size: 10px;
        cursor: pointer;
        padding: 2px;
        margin-top: 6px;
        width: 100%;
        text-align: center;
        text-decoration: underline;
      }
    </style>

    <div class="panel-root">
      <div class="panel-header">
        <div class="header-title">
          <div class="badge-logo">AI</div>
          <span>AI GROUP POSTER</span>
          <span class="autopilot-pill">● Auto-Pilot ON</span>
        </div>
        <div class="header-actions">
          <button class="icon-btn" id="agp-toggle-btn">
            ${te?"▲ Expand":"▼ Minimize"}
          </button>
          <button class="icon-btn close-btn" id="agp-close-btn" title="Stop & Close (ডাইরেক্ট অফ)">✕</button>
        </div>
      </div>

      <div class="panel-body">
        ${p?"":`
          <div class="warning-box">
            <strong>⚠️ Wrong Group Detected!</strong><br/>
            Expected: <strong>${g}</strong><br/>
            Current page: <em>${u}</em><br/>
            <span style="font-size: 11px; color: #fca5a5;">Auto-skipping to next group...</span>
          </div>
        `}

        <div class="progress-container">
          <div class="progress-label">
            <span>Posted: <strong>${c} of ${s}</strong> Groups</span>
            <span>${i}%</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${i}%"></div>
          </div>
        </div>

        <div class="autopost-box">
          <div class="autopost-header">
            <span class="pulse-dot"></span>
            <span>${O?"Auto-Posting in Progress":W?"Auto-Pilot Paused":"Auto-Pilot Running"}</span>
          </div>
          <div class="autopost-status-text">${_}</div>
        </div>

        <div class="meta-row">
          <span class="group-name" title="${g}">${g}</span>
          <span class="queue-badge">Queue ${r} / ${s}</span>
        </div>

        <div class="post-card">
          <div class="post-title">${(n==null?void 0:n.productName)||(n==null?void 0:n.title)||"Prepared Listing"}</div>
          ${d>0?((n==null?void 0:n.images)||(w==null?void 0:w.media)||[]).some(S=>S.includes("video")||S.includes("data:video")||S.endsWith(".mp4")||S.endsWith(".webm")||S.endsWith(".mov"))?`<div class="media-badge" style="background:#065f46;color:#6ee7b7;border:1px solid #059669;">🎬 Video Attached (${d})</div>`:`<div class="media-badge">📷 ${d} Photos attached</div>`:""}
          <div class="post-preview">${l||a||"No prepared caption."}</div>
        </div>

        <button class="auto-btn ${O?"running":""}" id="btn-auto-post">
          ${O?"⏸️ Pause Auto-Posting":"🤖 Auto-Post Now"}
        </button>

        ${Ke()||ae()?`<button class="action-btn" id="btn-auto-join" style="background:#2563eb;color:#ffffff;font-weight:700;margin-top:6px;width:100%;justify-content:center;box-shadow:0 2px 4px rgba(37,99,235,0.3);">
                ➕ Auto-Join Group (গ্রুপে যোগ দিন)
              </button>`:""}

        <button class="action-btn primary-btn" id="btn-mark-posted">
          ✅ Mark Posted & Next Group
        </button>

        <div class="button-grid" style="grid-template-columns: repeat(3, minmax(0, 1fr));">
          <button class="action-btn" id="btn-toggle-caption">
            ${Ce?"Collapse":"👁️ View"}
          </button>
          <button class="action-btn" id="btn-copy-caption">📋 Copy</button>
          <button class="action-btn" id="btn-paste-caption" style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #fff; font-weight: bold;" title="ক্যাপশন সরাসরি পোস্টে পেস্ট করুন">✨ Paste to FB</button>
        </div>

        <div class="workflow-row">
          <button class="secondary-btn" id="btn-skip">⏭️ Skip Group</button>
          <button class="secondary-btn" id="btn-pause">⏸️ Pause Session</button>
        </div>

        <button class="link-btn" id="btn-open-dashboard">
          Open Extension Dashboard ↗
        </button>
      </div>
    </div>
  `,($=A.getElementById("agp-toggle-btn"))==null||$.addEventListener("click",()=>{te=!te,C()}),(K=A.getElementById("agp-close-btn"))==null||K.addEventListener("click",S=>{S.stopPropagation(),Ve()}),(L=A.getElementById("btn-auto-post"))==null||L.addEventListener("click",()=>{O?(W=!0,O=!1,_="Auto-posting paused by user",T&&clearInterval(T),k("Auto-posting paused"),C()):(W=!1,T&&clearInterval(T),Ie())}),(j=A.getElementById("btn-auto-join"))==null||j.addEventListener("click",async()=>{const S=A==null?void 0:A.getElementById("btn-auto-join");S&&(S.textContent="⏳ Joining..."),(await bt()).isInstantMember&&Ie()}),(Y=A.getElementById("btn-toggle-caption"))==null||Y.addEventListener("click",()=>{Ce=!Ce,C()}),(Me=A.getElementById("btn-copy-caption"))==null||Me.addEventListener("click",async()=>{const N=Re(l||a).replace(/\r\n/g,`
`).replace(/\r/g,`
`).trim(),ne=qe(N);await dt(N,ne)&&k("📋 Caption & Design copied (Ctrl+V ready)!")}),($e=A.getElementById("btn-paste-caption"))==null||$e.addEventListener("click",async()=>{const N=Re(l||a).replace(/\r\n/g,`
`).replace(/\r/g,`
`).trim(),ne=document.querySelector('[role="dialog"]')||document.body;k("✨ Pasting caption with exact styling..."),await pt(ne,N)?k("✅ Caption pasted with exact design!"):k("⚠️ Click inside post box and press Ctrl+V",!0)}),(z=A.getElementById("btn-mark-posted"))==null||z.addEventListener("click",()=>{var S;T&&clearInterval(T);try{window.onbeforeunload=null}catch{}chrome.runtime.sendMessage({type:"MARK_AS_POSTED",payload:{itemId:(S=w==null?void 0:w.queueItem)==null?void 0:S.id}},()=>{k("Marked as Posted! Moving to next group...")})}),(q=A.getElementById("btn-skip"))==null||q.addEventListener("click",()=>{var S;T&&clearInterval(T);try{window.onbeforeunload=null}catch{}chrome.runtime.sendMessage({type:"SKIP_CURRENT_ITEM",payload:{itemId:(S=w==null?void 0:w.queueItem)==null?void 0:S.id,reason:"Skipped by user"}},()=>{k("Skipped group. Moving to next...")})}),(ce=A.getElementById("btn-pause"))==null||ce.addEventListener("click",()=>{T&&clearInterval(T),W=!0,O=!1,chrome.runtime.sendMessage({type:"PAUSE_QUEUE"},()=>{k("Posting Session Paused")})}),(le=A.getElementById("btn-open-dashboard"))==null||le.addEventListener("click",()=>{chrome.runtime.sendMessage({type:"OPEN_DASHBOARD"})})}function qt(){Se||(V||(V=document.createElement("div"),V.id="ai-group-poster-dock-root",document.body.appendChild(V),A=V.attachShadow({mode:"open"})),C())}function he(){var o;if(Se)return;const t=X(),e=pe();e.isLoggedIn&&chrome.runtime.sendMessage({type:"FB_USER_PROFILE_DETECTED",payload:e}),t.isGroupPage?(chrome.runtime.sendMessage({type:"FB_PAGE_DETECTED",payload:{url:t.canonicalUrl,groupIdOrSlug:t.groupIdOrSlug,pageTitle:t.groupName}}),chrome.runtime.sendMessage({type:"GET_ACTIVE_POST_FOR_TAB",payload:{url:t.canonicalUrl}},n=>{chrome.runtime.lastError||n!=null&&n.isUserTab||n&&n.payload&&(w=n.payload,qt(),w&&w.queueItem&&Dt())})):Gt()&&(console.log("[AGP:Content] Facebook Group Search Page detected."),Je(),typeof chrome<"u"&&((o=chrome.storage)!=null&&o.local)&&chrome.storage.local.get(["agp_pending_auto_join","agp_auto_join_config"],n=>{const r=n==null?void 0:n.agp_pending_auto_join,s=n==null?void 0:n.agp_auto_join_config;if(r&&r.active&&Date.now()-(r.requestedAt||0)<9e4){console.log("[AGP:Content] Detected pending Auto-Join request. Starting auto-joiner..."),chrome.storage.local.remove("agp_pending_auto_join");const c=r.config||s||{searchUrl:window.location.href,delaySec:0,maxGroups:0,autoAnswerQuestions:!0,defaultAnswer:"Yes, I agree to the group rules and guidelines.",saveToGroups:!0};Je(c),setTimeout(()=>{R.getInstance().start(c)},1500)}}))}function Bt(){if(typeof document>"u"||!document.body)return;const t=document.getElementById("agp-sync-window-overlay");t&&t.remove();const e=document.createElement("div");e.id="agp-sync-window-overlay",e.innerHTML=`
    <div style="font-weight: 800; font-size: 14px; margin-bottom: 4px; color: #ffffff; letter-spacing: -0.2px;">
      Syncing your Facebook groups
    </div>
    <div style="font-size: 12px; color: #cbd5e1; margin-bottom: 2px; font-weight: 500;">
      Please keep this window open and visible.
    </div>
    <div style="font-size: 11px; color: #94a3b8;">
      It will scroll automatically and close when done.
    </div>
  `,e.style.cssText=`
    position: fixed;
    top: 18px;
    left: 18px;
    right: 18px;
    max-width: 360px;
    margin: 0 auto;
    background: rgba(15, 23, 42, 0.95);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    color: #ffffff;
    padding: 14px 18px;
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.16);
    box-shadow: 0 20px 45px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(99, 102, 241, 0.2);
    z-index: 2147483647;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    pointer-events: none;
    text-align: left;
    line-height: 1.4;
  `,document.body.appendChild(e)}function Ye(){const t=document.getElementById("agp-sync-window-overlay");t&&t.remove()}let _e=null;chrome.runtime.onMessage.addListener((t,e,o)=>{if(t.type==="START_GROUP_DISCOVERY")return(async()=>{try{console.log("[AGP:Content] Starting deep group discovery scan on current Facebook page...");const n=pe(),r=n.userId||n.name||void 0;Bt(),Te();const s=await Xe({maxRounds:350,stagnantLimit:30,scrollDelayMs:900,accountContext:r,onBatchDiscovered:async(l,d,p)=>{_e=p;const g=Ge(),u=[...l];for(const f of g)u.find(m=>m.groupId.toLowerCase()===f.groupId.toLowerCase())||u.push(f);try{chrome.runtime.sendMessage({type:"GROUP_BATCH_DISCOVERED",payload:{liveGroups:u,verifiedCount:u.length,duplicatesRemoved:(p==null?void 0:p.duplicatesRemoved)||0,debugMetrics:p}})}catch{}try{await Ee(u,{syncMode:"merge",accountContext:r})}catch(f){console.warn("[AGP:Content] Progressive batch merge error:",f)}},onProgress:(l,d,p,g)=>{_e=g;const u=H.size,f=Math.max(l,u);try{chrome.runtime.sendMessage({type:"GROUP_DISCOVERY_PROGRESS",payload:{foundCount:f,status:d,targetCount:p,debugMetrics:g}})}catch{}}}),c=Ge();if(c.length>0)try{await Ee(c,{syncMode:"merge",accountContext:r})}catch{}const i=[...s.groups];for(const l of c)i.find(d=>d.groupId.toLowerCase()===l.groupId.toLowerCase())||i.push(l);const a=Math.max(s.totalFound,i.length);_e=s.debugMetrics,Ye(),o({success:!0,payload:{groups:i,sourceUrl:window.location.href,isLoggedIn:s.isLoggedIn,totalFoundOnPage:a,profile:n,outcome:s.outcome,completionReason:s.completionReason,isPartial:s.isPartial,debugMetrics:s.debugMetrics}})}catch(n){Ye();const r=n instanceof Error?n.message:String(n);o({success:!1,error:r})}})(),!0;if(t.type==="CANCEL_GROUP_DISCOVERY")return Ye(),k("AI Group Poster: Discovery cancelled.",!0),o({success:!0}),!1;if(t.type==="GET_DEBUG_METRICS")return o({success:!0,debugMetrics:_e}),!1;if(t.type==="CHECK_FACEBOOK_SESSION"){const n=ve(),r=pe();return o({success:!0,isLoggedIn:n,profile:r,currentUrl:window.location.href}),!1}if(t.type==="GET_FACEBOOK_USER_INFO")return(async()=>{try{const n=ve(),r=pe();let c=Oe(r.userId||r.name||void 0).items;o({success:!0,isLoggedIn:n,profile:r,groups:c,totalGroups:c.length,currentUrl:window.location.href})}catch(n){const r=n instanceof Error?n.message:String(n);o({success:!1,error:r})}})(),!0;if(t.type==="START_AUTO_JOIN"||t.type==="AUTO_JOIN_START_ON_PAGE")return(async()=>{try{const n=t.payload||{},r={...n,delaySec:typeof n.delaySec=="number"?n.delaySec:0};Je(r);const s=await R.getInstance().start(r);o({success:!0,state:s})}catch(n){const r=n instanceof Error?n.message:String(n);o({success:!1,error:r})}})(),!0;if(t.type==="PAUSE_AUTO_JOIN"||t.type==="AUTO_JOIN_PAUSE_ON_PAGE")return R.getInstance().pause(),o({success:!0}),!1;if(t.type==="RESUME_AUTO_JOIN"||t.type==="AUTO_JOIN_RESUME_ON_PAGE")return R.getInstance().resume(),o({success:!0}),!1;if(t.type==="STOP_AUTO_JOIN"||t.type==="AUTO_JOIN_STOP_ON_PAGE")return R.getInstance().stop(),o({success:!0}),!1;if(t.type==="GET_AUTO_JOIN_STATE"){const n=R.getInstance().getState();return o({success:!0,state:n}),!1}});let Qe=!1,H=new Map;function Te(){if(typeof window>"u"||window.__agpFetchIntercepted)return;window.__agpFetchIntercepted=!0;const t=window.fetch;window.fetch=async function(...e){var n;const o=await t.apply(this,e);try{const r=typeof e[0]=="string"?e[0]:((n=e[0])==null?void 0:n.url)||"";(r.includes("/api/graphql")||r.includes("graphql"))&&o.clone().text().then(c=>{c.includes("Group")&&(c.includes("/groups/")||c.includes('__typename":"Group"'))&&jt(c)}).catch(()=>{})}catch{}return o},console.log("[AGP:Content] GraphQL response interceptor installed")}function jt(t){try{const e=/"__typename"\s*:\s*"Group"[^}]*?"id"\s*:\s*"(\d+)"[^}]*?"name"\s*:\s*"([^"]+)"/g;let o;for(;(o=e.exec(t))!==null;){const r=o[1],s=o[2].trim();r&&s&&s.length>=2&&H.set(r,{name:s,id:r})}const n=/"node"\s*:\s*\{\s*"__typename"\s*:\s*"Group"\s*,\s*"id"\s*:\s*"(\d+)"\s*,\s*"name"\s*:\s*"([^"]+)"/g;for(;(o=n.exec(t))!==null;){const r=o[1],s=o[2].trim();r&&s&&s.length>=2&&H.set(r,{name:s,id:r})}H.size>0&&console.log(`[AGP:Content] GraphQL interceptor: total ${H.size} groups captured`)}catch{}}function Ge(){const t=[];for(const[e,o]of H)t.push({name:o.name,url:`https://www.facebook.com/groups/${e}/`,groupId:e,privacy:"UNKNOWN",imageUrl:o.imageUrl});return t}async function wt(){const t=window.location.href.toLowerCase();if((t.includes("/groups/joins")||t.includes("category=membership"))&&!Qe){Qe=!0,console.log("[AGP:Content] Detected Your Groups page (/groups/joins/)! Starting full auto-scan of all joined groups..."),k("AI Group Poster: Auto-scanning your joined groups..."),Te();try{const e=await Xe({maxRounds:350,stagnantLimit:30,scrollDelayMs:900,onBatchDiscovered:async(r,s)=>{const c=Ge(),i=[...r];for(const a of c)i.find(l=>l.groupId===a.groupId)||i.push(a);try{await Ee(i,{syncMode:"merge"})}catch(a){console.warn("[AGP:Content] Batch save err:",a)}},onProgress:(r,s,c)=>{const i=H.size,a=Math.max(r,i);k(`AI Group Poster: Found ${a}${c?` / ${c}`:""} groups...`);try{chrome.runtime.sendMessage({type:"GROUP_DISCOVERY_PROGRESS",payload:{foundCount:a,status:s,targetCount:c}})}catch{}}}),o=Ge();if(o.length>0)try{await Ee(o,{syncMode:"merge"}),console.log(`[AGP:Content] Final merge: added ${o.length} intercepted groups`)}catch{}const n=Math.max(e.totalFound,H.size);k(`AI Group Poster: Sync complete! Found ${n} groups.`)}catch(e){console.warn("[AGP:Content] Auto-scan err:",e)}finally{Qe=!1}}}(window.location.href.toLowerCase().includes("/groups/joins")||window.location.href.toLowerCase().includes("category=membership"))&&Te(),he(),setTimeout(wt,3e3);let Le=window.location.href;new MutationObserver(()=>{window.location.href!==Le&&(Le=window.location.href,he(),(Le.toLowerCase().includes("/groups/joins")||Le.toLowerCase().includes("category=membership"))&&Te(),setTimeout(wt,3e3))}).observe(document.body,{childList:!0,subtree:!0})})();
