var zt=Object.defineProperty;var Jt=(Z,F,X)=>F in Z?zt(Z,F,{enumerable:!0,configurable:!0,writable:!0,value:X}):Z[F]=X;var Q=(Z,F,X)=>Jt(Z,typeof F!="symbol"?F+"":F,X);(function(){"use strict";function Z(e){const t=[];if(!e||typeof e!="string")return{valid:!1,errors:["URL is required"]};const n=e.trim();if(!n)return{valid:!1,errors:["URL cannot be empty"]};let o=n;/^https?:\/\//i.test(o)||(o="https://"+o);let r;try{r=new URL(o)}catch{return{valid:!1,errors:["Invalid URL format"]}}const s=["facebook.com","www.facebook.com","web.facebook.com","m.facebook.com"],c=r.hostname.toLowerCase();s.some(h=>c===h||c.endsWith("."+h))||t.push("URL must be a Facebook domain (e.g. facebook.com, web.facebook.com)");const a=r.pathname.split("/").filter(Boolean),l=a.indexOf("groups");if(l===-1||l>=a.length-1)return t.push("URL must point directly to a Facebook group (e.g. /groups/group_name)"),{valid:!1,errors:t};const d=decodeURIComponent(a[l+1]);if(!d||["feed","discover","joins","about","settings","notifications","search","categories","create","help","privacy","support"].includes(d.toLowerCase()))return t.push("URL must point to a specific group, not a feed or discovery page"),{valid:!1,errors:t};const b=a.slice(l+2).map(h=>h.toLowerCase()),u=["permalink","posts","user","photos","videos","events","files","stories"];if(b.some(h=>u.includes(h)))return t.push("URL points to an individual post or permalink inside a group, not the group itself"),{valid:!1,errors:t};if(r.searchParams.has("comment_id")||r.searchParams.has("notif_id")||r.searchParams.has("notif_t"))return t.push("URL is a notification or comment permalink, not a group page"),{valid:!1,errors:t};const f=`https://www.facebook.com/groups/${d}/`;return{valid:t.length===0,errors:t,cleanUrl:f,groupId:d}}const F={META_OG_TITLE:'meta[property="og:title"]',HEADER_H1:'h1[dir="auto"], h1 span'};function X(){if(typeof window>"u")return{isGroupPage:!1,groupIdOrSlug:"",groupName:"",canonicalUrl:"",isReady:!1};const e=window.location.href,t=Z(e);if(!t.valid||!t.groupId)return{isGroupPage:!1,groupIdOrSlug:"",groupName:"",canonicalUrl:e,isReady:!1};let n="";const o=document.querySelector(F.META_OG_TITLE);if(o&&o.content&&(n=o.content.replace(/\s*\|\s*Facebook.*$/i,"").trim()),!n){const s=document.querySelector(F.HEADER_H1);s&&s.innerText&&(n=s.innerText.trim())}!n&&document.title&&(n=document.title.replace(/\s*\|\s*Facebook.*$/i,"").trim()),n||(n=t.groupId.replace(/[-_.]+/g," "),n=n.charAt(0).toUpperCase()+n.slice(1));const r=document.readyState==="interactive"||document.readyState==="complete";return{isGroupPage:!0,groupIdOrSlug:t.groupId,groupName:n,canonicalUrl:t.cleanUrl||e,isReady:r}}const Ee=new Set(["feed","discover","create","notifications","search","categories","joins","member-requests","expert_badge","settings","about","events","media","files","chats","manage","canvas","support","buy_sell_discussion","permalink","user","profile.php","hashtag","messages","marketplace","stories","reels","watch","gaming","members","photos","videos","posts"]),de=new Set(["view group","visit","open","view","join","group","groups","view all","see all","see more","গ্রুপ দেখুন","দেখুন","সব দেখুন","যোগ দিন","গ্রুপে যান","আরও দেখুন"]);function vt(e){const t={"০":"0","১":"1","২":"2","৩":"3","৪":"4","৫":"5","৬":"6","৭":"7","৮":"8","৯":"9"};return e.replace(/[০-৯]/g,n=>t[n]||n)}function At(e){if(typeof document>"u")return{count:null,status:"UNAVAILABLE",rawText:""};const n=Array.from(document.querySelectorAll('h1, h2, h3, h4, span[dir="auto"], strong, div, p')),o=[/(?:All groups you['’]?ve joined|Groups you['’]?ve joined)\s*\(([0-9,kKmM\u09E6-\u09EF.]+)\)/i,/(?:আপনার যোগ দেওয়া সমস্ত গ্রুপ|আপনার যোগ দেওয়া সব গ্রুপ|আপনি যেসব গ্রুপে যোগ দিয়েছেন|যোগ দেওয়া সমস্ত গ্রুপ|যোগ দেওয়া সব গ্রুপ|যোগ দেওয়া গ্রুপ|সব গ্রুপ)\s*\(([0-9,kKmM\u09E6-\u09EF.]+)\)/i,/^All groups you['’]?ve joined\s*[:\-•]?\s*([0-9,kKmM\u09E6-\u09EF.]+)$/i],r=[/(?:Joined Groups|Your Groups|আমার গ্রুপ)\s*\(([0-9,kKmM\u09E6-\u09EF.]+)\)/i,/(?:Groups|গ্রুপ)\s*\(([0-9,kKmM\u09E6-\u09EF.]+)\)/i],s=c=>{const i=vt(c).replace(/,/g,"").trim().toLowerCase();if(i.endsWith("k")){const l=parseFloat(i.replace("k",""));return isNaN(l)?null:Math.round(l*1e3)}if(i.endsWith("m")){const l=parseFloat(i.replace("m",""));return isNaN(l)?null:Math.round(l*1e6)}const a=parseInt(i,10);return isNaN(a)?null:a};for(const c of n){const i=(c.textContent||"").trim();if(!(i.length>120||i.length<3))for(const a of o){const l=i.match(a);if(l&&l[1]){const d=s(l[1]);if(d!==null&&d>0)return{count:d,status:"CONFIRMED",rawText:i}}}}for(const c of n){const i=(c.textContent||"").trim();if(!(i.length>80||i.length<3))for(const a of r){const l=i.match(a);if(l&&l[1]){const d=s(l[1]);if(d!==null&&d>0)return{count:d,status:"UNCERTAIN",rawText:i}}}}return{count:null,status:"UNAVAILABLE",rawText:""}}function Et(e=document){const t=["end of results","no more groups to show","you’ve reached the end","you've reached the end","সব গ্রুপ দেখানো হয়েছে","ফলাফলের সমাপ্তি"],n=e.querySelectorAll('div[role="status"], span[dir="auto"], div, p');for(const o of n){const r=(o.textContent||"").trim().toLowerCase();if(!(r.length>100||r.length<5)){for(const s of t)if(r.includes(s))return!0}}return!1}function pe(e){if(!e)return"";let t=e.trim();return t=t.replace(/^(?:Visit|Open|View|গ্রুপ দেখুন|দেখুন)\s+/i,""),t=t.replace(/\s*(?:Last active|You last visited|last visited|active)\s+[^\n]+/i,""),t=t.replace(/\s*(?:গত|আগে|মিনিট আগে|ঘণ্টা আগে|দিন আগে)[^\n]*/i,""),t=t.replace(/\s*·\s*(?:Public group|Private group|পাবলিক গ্রুপ|প্রাইভেট গ্রুপ).*$/i,""),t=t.replace(/\s*·\s*\d+.*members.*$/i,""),t=t.replace(/\s*·\s*[০-৯\d]+.*সদস্য.*$/i,""),t=t.replace(/\s*·\s*[^\n]+/i,""),t.trim()}function kt(e){var p,b;const t=u=>({valid:!1,reason:u,name:"",url:"",groupId:"",privacy:"UNKNOWN"}),n=e.href||e.getAttribute("href")||"";if(!n||!n.includes("/groups/"))return t("Not a group link");if(n.includes("/permalink/")||n.includes("/posts/")||n.includes("/photos/")||n.includes("/videos/")||n.includes("comment_id=")||n.includes("notif_id="))return t("Post or photo permalink, not a group home");let o="";try{const f=new URL(n,"https://www.facebook.com").pathname.split("/").filter(Boolean),h=f.indexOf("groups");if(h!==-1&&f[h+1]&&(o=f[h+1],f.length>h+2)){const g=f[h+2].toLowerCase();if(["posts","permalink","photos","videos","user","media"].includes(g))return t("Post or photo permalink, not a group home")}}catch{return t("Malformed URL")}if(!o||Ee.has(o.toLowerCase()))return t("Non-group system path");if(e.closest('[aria-label*="Notification" i], [aria-label*="বিজ্ঞপ্তি" i], [data-pagelet*="Notification" i]'))return t("Inside notification flyout");const r=e.closest('div[role="listitem"], div[role="article"], div[role="gridcell"], li, div[role="row"]')||((p=e.parentElement)==null?void 0:p.parentElement)||e.parentElement;if(r){const u=(r.textContent||"").toLowerCase();if(u.includes("sponsored")||u.includes("বিজ্ঞাপন")||r.querySelector('[aria-label*="Sponsored" i], [aria-label*="বিজ্ঞাপন" i]'))return t("Sponsored advertisement");if((r.querySelectorAll?Array.from(r.querySelectorAll('a[href*="/groups/"]')):[]).length<=4){if(u.includes("requested to join")||u.includes("অনুরোধ পাঠানো হয়েছে")||u.includes("answer questions")||u.includes("update responses")||u.includes("suggested for you")||u.includes("আপনার জন্য প্রস্তাবিত")||u.includes("suggested groups")||u.includes("প্রস্তাবিত গ্রুপ"))return t("Unjoined or suggested group");if(r.querySelectorAll){const g=Array.from(r.querySelectorAll('button, [role="button"]'));for(const y of g){const m=(y.textContent||y.getAttribute("aria-label")||"").trim().toLowerCase();if((m==="join"||m==="join group"||m==="যোগ দিন"||m==="গ্রুপে যোগ দিন"||m==="request to join")&&!u.includes("view group")&&!u.includes("গ্রুপ দেখুন")&&!u.includes("visited")&&!u.includes("last active"))return t("Card has Join button, not joined")}}}}let s="";const c=(e.getAttribute("aria-label")||"").trim();if(c&&c.length>=2&&!de.has(c.toLowerCase())&&(s=pe(c)),!s){const u=(e.textContent||e.innerText||"").trim(),f=pe(u);f&&f.length>=2&&!de.has(f.toLowerCase())&&(s=f)}if(!s){const u=Array.from(e.querySelectorAll('h1, h2, h3, h4, span[dir="auto"], strong, span'));for(const f of u){const h=pe((f.textContent||"").trim()),g=h.toLowerCase();if(h.length>=2&&!de.has(g)&&!g.includes("last active")&&!g.includes("you last visited")&&!g.includes("members")&&!g.includes("সদস্য")&&!g.includes("ago")){s=h;break}}}if(!s&&r){const u=r.querySelector('h1, h2, h3, h4, [role="heading"]');if(u&&u.textContent){const f=pe(u.textContent.trim());f.length>=2&&!de.has(f.toLowerCase())&&(s=f)}}if(!s&&r){const u=Array.from(r.querySelectorAll('h1, h2, h3, h4, span[dir="auto"], strong, a[href*="/groups/"] > span'));for(const f of u){if(f===e)continue;const h=pe((f.textContent||"").trim()),g=h.toLowerCase();if(h.length>=2&&h.length<200&&!de.has(g)&&!g.includes("view group")&&!g.includes("you last visited")&&!g.includes("last active")&&!g.includes("members")&&!g.includes("সদস্য")&&!g.includes("hours ago")&&!g.includes("minutes ago")&&!g.includes("days ago")&&!g.includes("ঘণ্টা আগে")&&!g.includes("দিন আগে")&&!/^\d+ (hours?|minutes?|days?|weeks?) ago$/i.test(g)){s=h;break}}}s||(s=o.split(/[-_.]+/).filter(Boolean).map(u=>u.charAt(0).toUpperCase()+u.slice(1)).join(" "));let i="";const a=r!=null&&r.querySelector?r.querySelector("img, image")||e.querySelector("img, image"):null;a&&(i=a.getAttribute("src")||a.getAttribute("href")||((b=a.href)==null?void 0:b.baseVal)||"",(i.includes("/rsrc.php/")||i.includes("spacer")||i.includes("1x1"))&&(i=""));let l="UNKNOWN";const d=u=>{const f=(u||"").toLowerCase();return f.includes("public group")||f.includes("পাবলিক গ্রুপ")||f.includes("public")||f.includes("পাবলিক")?"PUBLIC":f.includes("private group")||f.includes("প্রাইভেট গ্রুপ")||f.includes("private")||f.includes("প্রাইভেট")?"PRIVATE":"UNKNOWN"};if(r){const u=d(r.textContent||"");if(u!=="UNKNOWN")l=u;else if(r.querySelectorAll){const f=Array.from(r.querySelectorAll("span, div, p"));for(const h of f){const g=d(h.textContent||"");if(g!=="UNKNOWN"){l=g;break}}}}return l==="UNKNOWN"&&(l=d(e.textContent||"")),{valid:!0,name:s,url:`https://www.facebook.com/groups/${o}/`,groupId:o,imageUrl:i,privacy:l}}function ke(){if(typeof document>"u")return!1;const e=typeof window<"u"?window.location.href:"";if(e.includes("/login")||e.includes("/recover")||e.includes("/checkpoint"))return!1;const t=document.body&&(document.body.innerText||document.body.textContent)||"";return t.includes("What's on your mind")||t.includes("আপনার মনে কী আছে")||t.includes("কী ভাবছেন")||t.includes("Professional dashboard")||t.includes("Ads Manager")||t.includes("Meta Business Suite")?!0:!!document.querySelector('[role="navigation"], [data-pagelet="LeftRail"], [aria-label="Facebook"], input[placeholder*="Search" i], [aria-label*="profile" i], [aria-label*="Account" i], a[href*="/me/"], a[href*="/groups/"]')||!!(document.cookie&&document.cookie.includes("c_user"))}function fe(){var i,a;if(typeof document>"u")return{isLoggedIn:!1,name:"",profileUrl:""};let e="",t="",n="",o="";if(document.body){const d=(document.body.innerText||document.body.textContent||"").match(/(?:What['’]s on your mind|আপনার মনে কী আছে|কী ভাবছেন)[,?\s]+([^?!\n]+?)(?:\?|$)/i);if(d&&d[1]){const p=d[1].trim().replace(/[?,!]+$/,"").trim();p.length>=2&&p.length<=50&&!p.toLowerCase().includes("facebook")&&(e=p)}}const r=Array.from(document.querySelectorAll('a[href*="/me/"], a[href*="facebook.com/profile"], [role="navigation"] a[href]'));for(const l of r){const d=l.getAttribute("href")||l.href||"",p=l.querySelector('span[dir="auto"], span, strong, h1'),b=(p?p.textContent:l.innerText||l.textContent||"").trim();if(b&&b.length>=2&&b.length<=35&&!["Home","Friends","Feeds","Groups","Watch","Marketplace","Memories","Saved","Video","Settings","Meta AI","Professional dashboard","Ads Manager","Ad Center","Meta Business Suite","See more","See all","Facebook","Menu","Notifications"].includes(b)){e||(e=b),!t&&d&&(t=d);const f=l.querySelector("image, img");if(f&&!n&&(n=f.getAttribute("src")||((i=f.href)==null?void 0:i.baseVal)||""),e)break}}const s=document.querySelector('[aria-label="Your profile" i], [aria-label*="Your profile" i], [aria-label*="Account Controls" i], [aria-label*="আপনার প্রোফাইল" i]');if(s&&!n){const l=s.querySelector("image, img");l&&(n=l.getAttribute("src")||((a=l.href)==null?void 0:a.baseVal)||"")}try{const l=Array.from(document.querySelectorAll("script"));for(const d of l){const p=d.textContent||"";if(p.includes('"NAME":')||p.includes('"USER_ID":')||p.includes('"short_name":')){const b=p.match(/"NAME":\s*"([^"]+)"/)||p.match(/"short_name":\s*"([^"]+)"/);if(b&&b[1]&&!e)try{e=JSON.parse(`"${b[1]}"`)}catch{e=b[1]}const u=p.match(/"USER_ID":\s*"(\d+)"/);if(u&&u[1]&&!o&&(o=u[1]),e)break}}}catch{}if(!o&&document.cookie){const l=document.cookie.match(/c_user=(\d+)/);l&&(o=l[1])}const c=ke()||!!(e||o);return{isLoggedIn:c,name:e||(c?"Facebook User":""),profileUrl:t||"https://www.facebook.com",avatarUrl:n,userId:o}}function St(e){if(typeof document>"u")return[];const t=new Map,n=Date.now();try{const o=Array.from(document.querySelectorAll("script"));for(const r of o){const s=r.textContent||"";if(s.length<40)continue;const c=[/"__typename"\s*:\s*"Group"[\s\S]{0,500}?"id"\s*:\s*"(\d+)"[\s\S]{0,500}?"name"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/g,/"__typename"\s*:\s*"Group"[\s\S]{0,500}?"name"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"[\s\S]{0,500}?"id"\s*:\s*"(\d+)"/g,/"node"\s*:\s*\{[\s\S]{0,120}?"__typename"\s*:\s*"Group"[\s\S]{0,350}?"id"\s*:\s*"(\d+)"[\s\S]{0,350}?"name"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/g,/"node"\s*:\s*\{[\s\S]{0,120}?"__typename"\s*:\s*"Group"[\s\S]{0,350}?"name"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"[\s\S]{0,350}?"id"\s*:\s*"(\d+)"/g,/\{"id"\s*:\s*"(\d+)"[\s\S]{0,300}?"name"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"[\s\S]{0,300}?(?:"__typename"\s*:\s*"Group"|url"\s*:\s*"https:[^"]*?\/groups\/[^"]+?")/g,/\{"name"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"[\s\S]{0,300}?"id"\s*:\s*"(\d+)"[\s\S]{0,300}?(?:"__typename"\s*:\s*"Group"|url"\s*:\s*"https:[^"]*?\/groups\/[^"]+?")/g];for(const i of c){let a;for(;(a=i.exec(s))!==null;){let l="",d="";if(/^\d+$/.test(a[1])?(l=a[1],d=a[2]):/^\d+$/.test(a[2])&&(l=a[2],d=a[1]),l&&d){d=d.trim();try{d=d.replace(/\\u[\dA-Fa-f]{4}/g,b=>String.fromCharCode(parseInt(b.replace("\\u",""),16)))}catch{}const p=s.slice(Math.max(0,a.index-350),Math.min(s.length,a.index+600));if(p.includes('"__typename":"User"')||p.includes('"__typename":"Actor"')||p.includes('"__typename":"Story"')||p.includes('"__typename":"Comment"')||p.includes('"__typename":"Page"')||e&&d.toLowerCase()===e.toLowerCase())continue;if(d.length>=2&&!t.has(l)){let b="";const f=s.slice(Math.max(0,a.index-500),Math.min(s.length,a.index+1e3)).match(/"(?:uri|url|cover_photo|image)"\s*:\s*\{[^}]*"uri"\s*:\s*"([^"]+)"/);if(f&&f[1]){let h=f[1];try{h=h.replace(/\\u[\dA-Fa-f]{4}/g,g=>String.fromCharCode(parseInt(g.replace("\\u",""),16)))}catch{}!h.includes("/rsrc.php/")&&!h.includes("1x1")&&(b=h.replace(/\\\//g,"/"))}t.set(l,{name:Xe(d,l),url:`https://www.facebook.com/groups/${l}/`,groupId:l,privacy:"UNKNOWN",imageUrl:b,verified:!0,source:"facebook-ui",accountContext:e,discoveredAt:n})}}}}}}catch(o){console.warn("[AGP:Discovery] Script tags extraction warning:",o)}return Array.from(t.values())}function Oe(e){if(typeof document>"u")return{items:[],rejectedCount:0};const t=new Map;let n=0;const o=Date.now(),r=St(e);for(const c of r)t.set(c.groupId.toLowerCase(),c);const s=Array.from(document.querySelectorAll('a[href*="/groups/"]'));for(const c of s){const i=kt(c);if(!i.valid||!i.name||!i.url||!i.groupId){n++;continue}const a=i.groupId.toLowerCase(),l=t.get(a);l?(!l.imageUrl&&i.imageUrl&&(l.imageUrl=i.imageUrl),i.name&&l.name.length<i.name.length&&(l.name=i.name),i.privacy!=="UNKNOWN"&&(l.privacy=i.privacy)):t.set(a,{name:i.name,url:i.url,groupId:i.groupId,privacy:i.privacy,imageUrl:i.imageUrl,verified:!0,source:"facebook-ui",accountContext:e,discoveredAt:o})}return{items:Array.from(t.values()),rejectedCount:n}}function Qe(){if(typeof document>"u")return 0;let e=0;const t=Array.from(document.querySelectorAll('div[role="button"], button, span[dir="auto"], [role="navigation"] [role="button"], [data-pagelet="LeftRail"] [role="button"]'));for(const n of t){const o=(n.textContent||n.getAttribute("aria-label")||"").trim().toLowerCase();if(o==="see more"||o==="আরও দেখুন"||o==="see all"||o==="সব দেখুন"||o==="see all groups"||o==="সব গ্রুপ দেখুন"||o==="view more")try{(n.closest('[role="button"], button')||n).click(),e++}catch{}}return e}async function Ze(e={}){var m,x,v,C,P,B;const t=e.maxRounds||350,n=e.stagnantLimit||35,o=e.scrollDelayMs!==void 0?e.scrollDelayMs:75,r=e.accountContext,s=Date.now(),c=ke(),i=new Map;let a=0,l=0,d=0,p=0;const b=At(),u=b.count,f=b.status;console.log(`[AGP:Engine] Discovery started. Target count: ${u??"N/A"} (Status: ${f})`);const h=$=>({candidateCount:i.size+l,verifiedCount:i.size,duplicatesRemoved:a,rejectedCount:l,scrollIterations:p,mutationEvents:d,targetCount:u,targetCountStatus:f,completionReason:$,scanDurationMs:Date.now()-s,lastNewGroupTimestamp:i.size>0?Date.now():null}),g=$=>{let K=0;for(const L of $){const j=L.groupId.toLowerCase();i.has(j)?a++:(i.set(j,L),K++)}return K};let y=null;typeof MutationObserver<"u"&&typeof document<"u"&&(y=new MutationObserver($=>{d+=$.length}),y.observe(document.body||document.documentElement,{childList:!0,subtree:!0}));try{try{Qe()}catch{}const $=Oe(r);if(l+=$.rejectedCount,g($.items)>0&&e.onBatchDiscovered)try{await e.onBatchDiscovered(Array.from(i.values()),i.size,h(null))}catch{}if(e.onProgress){const J=u?`Found ${i.size} of ${u} groups...`:`Found ${i.size} groups...`;e.onProgress(i.size,J,u,h(null))}if(f==="CONFIRMED"&&u!==null&&i.size>=u){const J=h("TARGET_REACHED");return console.log(`[AGP:Engine] Target count of ${u} confirmed on initial scan.`),{isLoggedIn:c,groups:Array.from(i.values()),totalFound:i.size,targetCount:u,isPartial:!1,outcome:"COMPLETE",completionReason:"TARGET_REACHED",debugMetrics:J}}let L=0,j="PARTIAL",Y="STAGNANT_TIMEOUT";for(let J=0;J<t;J++){if(p++,J%3===0)try{Qe()}catch{}const q=Array.from(document.querySelectorAll('a[href*="/groups/"]'));if(q.length>0){const T=q[q.length-1];try{T.scrollIntoView({block:"end",inline:"nearest",behavior:"smooth"})}catch{}}const le=document.querySelector('[role="main"], [data-pagelet*="Group"]');if(le&&le.lastElementChild)try{le.lastElementChild.scrollIntoView({block:"end",behavior:"smooth"})}catch{}const ue=Math.max(((m=document.documentElement)==null?void 0:m.scrollHeight)||0,((x=document.scrollingElement)==null?void 0:x.scrollHeight)||0,((v=document.body)==null?void 0:v.scrollHeight)||0);window.scrollTo(0,ue),document.scrollingElement&&(document.scrollingElement.scrollTop=ue),document.documentElement&&(document.documentElement.scrollTop=ue);const S=Array.from(document.querySelectorAll("div, main, section"));for(const T of S)if(T.scrollHeight>T.clientHeight+80){const ve=window.getComputedStyle(T);(ve.overflowY==="auto"||ve.overflowY==="scroll")&&(T.scrollTop=T.scrollHeight,T.dispatchEvent(new Event("scroll",{bubbles:!0})))}window.dispatchEvent(new Event("scroll",{bubbles:!0}));try{window.dispatchEvent(new WheelEvent("wheel",{deltaY:2500,bubbles:!0})),(C=document.body)==null||C.dispatchEvent(new KeyboardEvent("keydown",{key:"PageDown",code:"PageDown",bubbles:!0}))}catch{}await new Promise(T=>setTimeout(T,o));const R=Oe(r);if(l+=R.rejectedCount,g(R.items)>0){if(L=0,e.onBatchDiscovered)try{await e.onBatchDiscovered(Array.from(i.values()),i.size,h(null))}catch{}if(e.onProgress){const T=u?`Scanning Facebook Groups... ${i.size} of ${u} discovered`:`Scanning Facebook Groups... ${i.size} groups discovered`;e.onProgress(i.size,T,u,h(null))}if(f==="CONFIRMED"&&u!==null&&i.size>=u){console.log(`[AGP:Engine] Target count reached: ${i.size} >= ${u}.`),j="COMPLETE",Y="TARGET_REACHED";break}}else{if(L++,Et()){console.log("[AGP:Engine] Explicit end-of-list indicator detected."),j="COMPLETE",Y="LIST_END";break}if(window.scrollBy(0,-600),q.length>5&&((P=q[Math.max(0,q.length-6)])==null||P.scrollIntoView({block:"center",behavior:"instant"})),await new Promise(T=>setTimeout(T,300)),window.scrollBy(0,1200),q.length>0&&((B=q[q.length-1])==null||B.scrollIntoView({block:"end",behavior:"smooth"})),f==="CONFIRMED"&&u!==null&&i.size<u&&L<45){window.scrollBy(0,-1e3),await new Promise(T=>setTimeout(T,350)),window.scrollBy(0,2500);continue}if(L>=n){console.log(`[AGP:Engine] Scan complete/stagnant after ${L} attempts. Total verified: ${i.size}`),j="PARTIAL",Y="STAGNANT_TIMEOUT";break}}}try{window.scrollTo({top:0,behavior:"smooth"})}catch{}const Me=j!=="COMPLETE",$e=h(Y);return{isLoggedIn:c,groups:Array.from(i.values()),totalFound:i.size,targetCount:u,isPartial:Me,outcome:j,completionReason:Y,debugMetrics:$e}}finally{y&&y.disconnect()}}function Xe(e,t){if(!e||!e.trim())return t?t.split(/[-_.]+/).filter(Boolean).map(o=>o.charAt(0).toUpperCase()+o.slice(1)).join(" "):"Facebook Group";let n=e.trim();return n=n.replace(/^(?:Visit|Open|View|গ্রুপ দেখুন|দেখুন)\s+/i,""),n=n.replace(/\s*(?:Last active|You last visited|last visited|active)\s+[^\n]+/i,""),n=n.replace(/\s*(?:গত|আগে|মিনিট আগে|ঘণ্টা আগে|দিন আগে)[^\n]*/i,""),n=n.replace(/\s*·\s*(?:Public group|Private group|পাবলিক গ্রুপ|প্রাইভেট গ্রুপ).*$/i,""),n=n.replace(/\s*·\s*\d+.*members.*$/i,""),n=n.replace(/\s*·\s*[০-৯\d]+.*সদস্য.*$/i,""),n=n.replace(/\s*·\s*[^\n]+/i,""),(n.toLowerCase()==="visit"||n.toLowerCase()==="group"||n.toLowerCase()==="view group")&&t?t.split(/[-_.]+/).filter(Boolean).map(o=>o.charAt(0).toUpperCase()+o.slice(1)).join(" "):n.trim()||"Facebook Group"}function Ne(e="id"){const t=Math.random().toString(36).substring(2,9),n=Date.now().toString(36);return`${e}_${n}_${t}`}function Re(e){if(!e)return"";if(!e.includes("{")||!e.includes("|"))return e;let t=e,n=0;const o=/\{([^{}]+)\}/g;for(;n<10&&o.test(t);)n++,t=t.replace(o,(r,s)=>{if(s.includes("|")){const c=s.split("|").map(i=>i.trim()).filter(Boolean);if(c.length>0)return c[Math.floor(Math.random()*c.length)]}return r});return t=t.replace(/\{([^{}\r\n]+?)(?=[.,!?\r\n]|$)/g,(r,s)=>s.includes("|")?s.split("|").map(i=>i.trim()).filter(Boolean)[0]||"":r),t}const et={status:"IDLE",searchUrl:"",query:"",totalFound:0,joinedCount:0,requestedCount:0,alreadyJoinedCount:0,failedCount:0,skippedCount:0,currentIndex:0,currentGroupName:"",countdownSec:0,message:"Enter any Facebook search link to start auto-joining.",groups:[]},ee={GROUPS:"agp_groups",ACCOUNT_GROUPS:"agp_facebook_groups_by_account",LOGS:"agp_logs",FACEBOOK_ACCOUNT:"agp_facebook_account"},tt=()=>{var e;return typeof chrome<"u"&&!!((e=chrome.storage)!=null&&e.local)},ge={};async function Se(e,t){if(tt())return new Promise(n=>{chrome.storage.local.get([e],o=>{if(chrome.runtime.lastError){console.warn(`Storage get error for ${e}:`,chrome.runtime.lastError),n(ge[e]!==void 0?ge[e]:t);return}o&&o[e]!==void 0?n(o[e]):n(t)})});try{if(typeof window<"u"&&window.localStorage){const n=window.localStorage.getItem(e);if(n!==null)return JSON.parse(n)}}catch(n){console.warn("LocalStorage access failed:",n)}return ge[e]!==void 0?ge[e]:t}async function Ue(e,t){if(ge[e]=t,tt())return new Promise((n,o)=>{chrome.storage.local.set({[e]:t},()=>{chrome.runtime.lastError?o(chrome.runtime.lastError):n()})});try{typeof window<"u"&&window.localStorage&&window.localStorage.setItem(e,JSON.stringify(t))}catch(n){console.warn("LocalStorage set failed:",n)}}function ot(e){return e&&e.trim().toLowerCase().replace(/[^a-z0-9_\u0980-\u09FF]/gi,"_")||"default_account"}async function nt(){return Se(ee.ACCOUNT_GROUPS,{})}async function rt(e){const t=await De(),n=ot(e||(t==null?void 0:t.userId)||(t==null?void 0:t.name)),o=await nt();if(o[n]&&Array.isArray(o[n].groups)&&o[n].groups.length>0){const i=o[n].groups.filter(a=>!be(a));if(i.length>0)return i}const s=(await Se(ee.GROUPS,[])).filter(c=>!be(c));if(s.length>0)return s;for(const c of Object.keys(o))if(o[c]&&Array.isArray(o[c].groups)&&o[c].groups.length>0){const i=o[c].groups.filter(a=>!be(a));if(i.length>0)return i}return[]}async function it(e,t){const n=(e||[]).filter(i=>!be(i)),o=await De(),r=ot(t||(o==null?void 0:o.userId)||(o==null?void 0:o.name)),s=await nt(),c=s[r]||{accountContext:r,accountInfo:o||{isLoggedIn:!0,name:"Facebook User",lastSyncedAt:Date.now()},groups:[],lastSyncedAt:Date.now()};s[r]={...c,groups:n,lastSyncedAt:Date.now()},await Ue(ee.ACCOUNT_GROUPS,s),await Ue(ee.GROUPS,n)}function be(e){if(!e)return!0;const t=(e.name||"").trim().toLowerCase(),n=(e.url||"").trim().toLowerCase();if(t.startsWith("unread")||t.includes("commented on")||t.includes("also commented")||t.includes("likes your")||t.includes("liked your")||t.includes("reacted to")||t.includes("shared a post")||t.includes("shared your post")||t.includes("invited you")||t.includes("mentioned you")||t.includes("requested to join")||t.includes("মন্তব্য করেছেন")||t.includes("মতামত দিয়েছেন")||t.includes("লাইক দিয়েছেন")||t.includes("শেয়ার করেছেন")||n.includes("/permalink/")||n.includes("/posts/")||n.includes("/user/")||n.includes("/profile.php")||n.includes("/friends/")||n.includes("/people/")||n.includes("/photos/")||n.includes("/videos/")||n.includes("/events/")||n.includes("/files/")||n.includes("comment_id=")||n.includes("notif_id=")||n.includes("notif_t=")||n.includes("reply_comment_id="))return!0;const o=new Set(["about","about group","feed","discover","create","notifications","search","categories","joins","settings","help","privacy","terms","policies","support","messages","marketplace"]),r=t.replace(/\s*group\s*$/i,"").trim();return!!(o.has(t)||o.has(r)||e.groupId&&o.has(e.groupId.toLowerCase()))}async function Ct(){return Se(ee.LOGS,[])}async function Pt(e){await Ue(ee.LOGS,e)}async function It(e){const t=await Ct();t.unshift(e),t.length>300&&(t.length=300),await Pt(t)}async function De(){return Se(ee.FACEBOOK_ACCOUNT,null)}class _t{async writeLog(t,n,o,r){const s={id:Ne("log"),timestamp:Date.now(),level:t,source:n,message:o,details:r},c=`[AGP:${n.toUpperCase()}][${t}]`;t==="ERROR"?console.error(c,o,r||""):t==="WARNING"?console.warn(c,o,r||""):console.log(c,o,r||"");try{await It(s)}catch(i){console.warn("Failed to persist log entry:",i)}return s}info(t,n,o){return this.writeLog("INFO",t,n,o)}success(t,n,o){return this.writeLog("SUCCESS",t,n,o)}warning(t,n,o){return this.writeLog("WARNING",t,n,o)}error(t,n,o){return this.writeLog("ERROR",t,n,o)}}const Gt=new _t;async function Ce(e,t){var y;const n=(t==null?void 0:t.accountContext)||((y=await De())==null?void 0:y.name)||"default_account",o=await rt(n),r=new Map,s=new Map,c=new Map,i=m=>m.trim().toLowerCase().replace(/\s+/g," ");o.forEach(m=>{m.groupId&&r.set(m.groupId.toLowerCase(),m),m.url&&s.set(m.url.toLowerCase().replace(/\/$/,""),m),m.name&&c.set(i(m.name),m)});let a=0,l=0;const d=Date.now(),p=[],b=new Set;for(const m of e){if(be(m))continue;const x=(m.groupId||"").toLowerCase(),v=(m.url||"").toLowerCase().replace(/\/$/,""),C=i(m.name||"");let P=(x?r.get(x):void 0)||(v?s.get(v):void 0)||(C&&C.length>=3?c.get(C):void 0);const B=Xe(m.name||"",m.groupId);if(P)l++,b.add(P.id),B&&(!P.name||P.name.includes("·")||P.name.length<B.length)&&(P.name=B),m.imageUrl&&!P.imageUrl&&(P.imageUrl=m.imageUrl),m.privacy&&m.privacy!=="UNKNOWN"&&(P.privacy=m.privacy),P.verified=!0,P.source="facebook-ui",P.accountContext=n,P.discoveredAt=d,P.updatedAt=d;else{a++;const $=m.groupId?`grp_${m.groupId.replace(/[^a-zA-Z0-9_-]/g,"")}`:Ne("grp"),K=m.url.startsWith("http")?m.url:`https://www.facebook.com/groups/${m.groupId}/`,L={id:$,name:B,url:K,groupId:m.groupId,privacy:m.privacy||"UNKNOWN",imageUrl:m.imageUrl,category:"Discovered",enabled:!0,selected:!0,status:"READY",postCount:0,verified:!0,source:"facebook-ui",accountContext:n,discoveredAt:d,createdAt:d,updatedAt:d};p.push(L),x&&r.set(x,L),v&&s.set(v,L),C&&c.set(C,L),b.add(L.id)}}let u;if((t==null?void 0:t.syncMode)==="exact"){const m=v=>v.source==="manual"||v.category&&v.category!=="Discovered",x=o.filter(v=>b.has(v.id)||m(v));u=[...p,...x]}else u=[...p,...o];const f=[],h=new Set,g=new Set;for(const m of u){const x=m.url.toLowerCase().replace(/\/$/,"");!h.has(m.id)&&!g.has(x)&&(h.add(m.id),g.add(x),f.push(m))}return await it(f,n),await Gt.info("dashboard",`Group discovery merged (${(t==null?void 0:t.syncMode)||"merge"}): ${a} imported, ${l} duplicates, total ${f.length}`),{imported:a,duplicates:l,totalStored:f.length,verifiedCount:f.filter(m=>m.verified).length}}function qe(e){if(!e)return"<p><br></p>";const t=e.split(`
`),n=[];let o=!1,r=[],s=!1,c=[],i=!1,a=[];const l=()=>{o&&r.length>0&&(n.push("<ul>"+r.map(u=>`<li>${u}</li>`).join("")+"</ul>"),r=[],o=!1)},d=()=>{s&&c.length>0&&(n.push("<ol>"+c.map(u=>`<li>${u}</li>`).join("")+"</ol>"),c=[],s=!1)},p=()=>{i&&a.length>0&&(n.push("<blockquote>"+a.map(u=>`<p>${u}</p>`).join("")+"</blockquote>"),a=[],i=!1)},b=()=>{l(),d(),p()};for(let u=0;u<t.length;u++){const f=t[u],h=f.trim();if(!h){b(),n.push("<p><br></p>");continue}const y=h.match(/^<h1\b[^>]*>(.*?)<\/h1>$/i)||h.match(/^#\s+(.+)$/)||h.match(/^h1:\s*(.+)$/i);if(y){b(),n.push(`<h1>${re(y[1])}</h1>`);continue}const x=h.match(/^<h[23]\b[^>]*>(.*?)<\/h[23]>$/i)||h.match(/^##\s+(.+)$/)||h.match(/^###\s+(.+)$/)||h.match(/^h[23]:\s*(.+)$/i);if(x){b(),n.push(`<h2>${re(x[1])}</h2>`);continue}const C=h.match(/^<blockquote\b[^>]*>(.*?)<\/blockquote>$/i)||h.match(/^>\s*(.+)$/)||h.match(/^[❝❞]\s*(.+?)[❝❞]?$/);if(C){l(),d(),i=!0,a.push(re(C[1]));continue}const P=h.match(/^(\d+)[\.\)]\s+(.*)$/);if(P){l(),p(),s=!0,c.push(re(P[2]));continue}const $=h.match(/^<li\b[^>]*>(.*?)<\/li>$/i)||h.match(/^[•✓✔➤➔★⭐◆❖]\s*(.*)$/)||h.match(/^[\-*–—]\s+(.*)$/);if($){d(),p(),o=!0,r.push(re($[1]));continue}b(),n.push(`<p>${re(f)}</p>`)}return b(),n.join("")}function re(e){if(!e)return"";let t=e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");return t=t.replace(/\*\*\*(.+?)\*\*\*/g,'<strong><em style="font-style: italic;">$1</em></strong>'),t=t.replace(/___(.+?)___/g,'<strong><em style="font-style: italic;">$1</em></strong>'),t=t.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>"),t=t.replace(/__(.+?)__/g,"<strong>$1</strong>"),t=t.replace(/\*([^*\n]+?)\*/g,'<em style="font-style: italic;">$1</em>'),t=t.replace(/_([^_\n]+?)_/g,'<em style="font-style: italic;">$1</em>'),t=t.replace(/~~(.+?)~~/g,"<s>$1</s>"),t=t.replace(/`([^`\n]+?)`/g,"<code>$1</code>"),t=t.replace(/&lt;(\/?)strong&gt;/gi,"<$1strong>").replace(/&lt;(\/?)b&gt;/gi,"<$1strong>").replace(/&lt;(\/?)em&gt;/gi,"<$1em>").replace(/&lt;(\/?)i&gt;/gi,"<$1em>").replace(/&lt;(\/?)s&gt;/gi,"<$1s>").replace(/&lt;(\/?)del&gt;/gi,"<$1s>").replace(/&lt;(\/?)u&gt;/gi,"<$1u>").replace(/&lt;(\/?)code&gt;/gi,"<$1code>").replace(/&lt;br\s*\/?&gt;/gi,"<br>"),t}function Tt(e){if(!e||typeof e!="string")return e||"";const t=e.trim();if(t.length<30)return e;const n=t.length,o=Math.floor(n/2);for(let s=-15;s<=15;s++){const c=o+s;if(c>15&&c<n-15){const i=t.slice(0,c).trim(),a=t.slice(c).trim();if(i.length>=15&&i===a)return i}}const r=t.split(`
`).filter(s=>s.trim().length>0);if(r.length>=4){const s=Math.floor(r.length/2),c=r.slice(0,s).join(`
`).trim(),i=r.slice(s).join(`
`).trim();if(c.length>=25&&c===i)return c}return e}function Be(e){try{const n=new URL(e.startsWith("http")?e:`https://${e}`).searchParams.get("q");return n?decodeURIComponent(n.replace(/\+/g," ")):""}catch{return""}}function Lt(){if(typeof window>"u")return!1;const e=window.location.href.toLowerCase();return(e.includes("facebook.com")||e.includes("fb.com"))&&e.includes("/search")}function je(e){var a;if(!e)return!1;const t=e.tagName.toLowerCase(),n=e.getAttribute("role")||"",o=t==="button"||n==="button"||t==="a"||e.getAttribute("tabindex")!==null,r=(e.innerText||e.textContent||"").trim().toLowerCase(),s=(e.getAttribute("aria-label")||"").trim().toLowerCase(),c=(((a=e.querySelector("[aria-label]"))==null?void 0:a.getAttribute("aria-label"))||"").trim().toLowerCase(),i=`${r} | ${s} | ${c}`.toLowerCase();return i.includes("joined")||i.includes("view group")||i.includes("edit membership")||i.includes("যোগ দিয়েছেন")||i.includes("যুক্ত হয়েছেন")||i.includes("গ্রুপ দেখুন")||i.includes("requested")||i.includes("pending")||i.includes("cancel request")||i.includes("অনুরোধ পাঠানো")||i.includes("অনুরোধ করা হয়েছে")||i.includes("share")||i.includes("শেয়ার")||i.includes("message")||i.includes("মেসেজ")||i.includes("close")||i.includes("menu")||i.includes("search")||i.includes("notifications")?!1:!!(r==="join"||r==="join group"||r==="+ join"||r==="+ join group"||r==="request to join"||r==="answer questions"||r==="যোগ দিন"||r==="+ যোগ দিন"||r==="গ্রুপে যোগ দিন"||r==="যুক্ত হোন"||r==="+ যুক্ত হোন"||r==="গ্রুপে যুক্ত হোন"||r==="যোগ দেওয়ার অনুরোধ"||r==="যোগ দেয়ার অনুরোধ"||s==="join"||s==="join group"||s.includes("join group")||s.includes("request to join")||s.includes("যোগ দিন")||s.includes("যুক্ত হোন")||s.includes("অনুরোধ")||o&&(r.startsWith("join ")||r.endsWith(" join")||r.includes("join group")||r.includes("যোগ দিন")||r.includes("যুক্ত হোন")||r.includes("join")&&r.length<=16))}function Fe(e){if(!e)return!1;const t=(e.innerText||e.textContent||"").trim().toLowerCase(),n=(e.getAttribute("aria-label")||"").trim().toLowerCase(),o=`${t} ${n}`.toLowerCase();return o.includes("joined")||o.includes("view group")||o.includes("edit membership")||o.includes("যোগ দিয়েছেন")||o.includes("যুক্ত হয়েছেন")||o.includes("গ্রুপ দেখুন")}function ze(e){if(!e)return!1;const t=(e.innerText||e.textContent||"").trim().toLowerCase(),n=(e.getAttribute("aria-label")||"").trim().toLowerCase(),o=`${t} ${n}`.toLowerCase();return o.includes("requested")||o.includes("pending")||o.includes("cancel request")||o.includes("অনুরোধ পাঠানো")||o.includes("অনুরোধ করা হয়েছে")}function st(e,t,n){let o="";const r=(e.getAttribute("aria-label")||"").trim();if(r&&r.length>=2&&!r.toLowerCase().includes("view group")&&!r.toLowerCase().includes("গ্রুপ দেখুন"))o=r;else{const s=t.querySelector('h1, h2, h3, h4, span[dir="auto"], strong');o=((s==null?void 0:s.textContent)||e.textContent||"").trim()}return o=o.split(`
`)[0].trim(),(!o||o.length<2)&&(o=n.split(/[-_.]+/).map(s=>s.charAt(0).toUpperCase()+s.slice(1)).join(" ")),o}function at(e){const t=(e.innerText||e.textContent||"").toLowerCase();return t.includes("public")||t.includes("পাবলিক")?"PUBLIC":t.includes("private")||t.includes("প্রাইভেট")?"PRIVATE":"UNKNOWN"}function ct(e){const t=(e.innerText||"").split(`
`).map(n=>n.trim()).filter(Boolean);for(const n of t){const o=n.toLowerCase();if((o.includes("member")||o.includes("সদস্য")||o.includes("post")||o.includes("পোস্ট"))&&(o.includes("public")||o.includes("private")||o.includes("পাবলিক")||o.includes("প্রাইভেট")||/\d/.test(n)))return n}return""}function lt(){if(typeof document>"u")return[];const e=[],t=new Set,n=Array.from(document.querySelectorAll('div[role="button"], button, a[role="button"], [role="button"], [aria-label*="Join" i], [aria-label*="যোগ" i], [aria-label*="যুক্ত" i]'));for(const r of n){if(!je(r))continue;let s=r.parentElement,c=null,i=null;for(let h=0;h<12&&s&&s!==document.body;h++){const g=Array.from(s.querySelectorAll('a[href*="/groups/"]')).filter(y=>{const x=(y.href||y.getAttribute("href")||"").match(/(?:facebook\.com|fb\.com)?\/groups\/([a-zA-Z0-9._-]+)(?:\/|\?|$)/i);return x&&!Ee.has(x[1].toLowerCase())});if(g.length>0){const y=new Set(g.map(m=>{const x=(m.href||m.getAttribute("href")||"").match(/(?:facebook\.com|fb\.com)?\/groups\/([a-zA-Z0-9._-]+)(?:\/|\?|$)/i);return x?x[1].toLowerCase():""}).filter(Boolean));if(y.size===1)c=g[0],i=s;else if(y.size>1)break}s=s.parentElement}if(!c)continue;const l=(c.href||c.getAttribute("href")||"").match(/(?:facebook\.com|fb\.com)?\/groups\/([a-zA-Z0-9._-]+)(?:\/|\?|$)/i);if(!l)continue;const d=l[1].toLowerCase();if(t.has(d))continue;t.add(d);const p=i||r.closest('div[role="feed"] > div')||r.parentElement||r,b=st(c,p,d),u=at(p),f=ct(p);e.push({cardElement:p,item:{id:d,groupId:d,name:b,url:`https://www.facebook.com/groups/${d}/`,privacy:u,membersText:f||void 0,status:"READY_TO_JOIN"},joinButton:r})}const o=Array.from(document.querySelectorAll('a[href*="/groups/"]'));for(const r of o){const c=(r.href||r.getAttribute("href")||"").match(/(?:facebook\.com|fb\.com)?\/groups\/([a-zA-Z0-9._-]+)(?:\/|\?|$)/i);if(!c)continue;const i=c[1].toLowerCase();if(Ee.has(i)||t.has(i))continue;let a=r.parentElement,l=null,d=null,p="READY_TO_JOIN";for(let h=0;h<12&&a&&a!==document.body;h++){const g=Array.from(a.querySelectorAll('a[href*="/groups/"]')).filter(x=>{const C=(x.href||x.getAttribute("href")||"").match(/(?:facebook\.com|fb\.com)?\/groups\/([a-zA-Z0-9._-]+)(?:\/|\?|$)/i);return C&&!Ee.has(C[1].toLowerCase())});if(new Set(g.map(x=>{const v=(x.href||x.getAttribute("href")||"").match(/(?:facebook\.com|fb\.com)?\/groups\/([a-zA-Z0-9._-]+)(?:\/|\?|$)/i);return v?v[1].toLowerCase():""}).filter(Boolean)).size>1)break;l=a;const m=Array.from(a.querySelectorAll('div[role="button"], button, a[role="button"], [role="button"], [aria-label]'));for(const x of m){if(Fe(x)){p="ALREADY_JOINED",d=null;break}if(ze(x)){p="REQUESTED",d=null;break}if(je(x)){p="READY_TO_JOIN",d=x;break}}if(d||p!=="READY_TO_JOIN")break;a=a.parentElement}if(l||(l=r.closest('div[role="feed"] > div')||r.closest('div[role="article"]')||r.parentElement||r),p==="READY_TO_JOIN"&&!d&&l){const h=Array.from(l.querySelectorAll('div[role="button"], button, a[role="button"], [role="button"]'));for(const g of h)if(!Fe(g)&&!ze(g)){const y=(g.innerText||g.textContent||g.getAttribute("aria-label")||"").trim().toLowerCase();if(y&&!y.includes("more")&&!y.includes("menu")&&!y.includes("share")&&!y.includes("close")){d=g;break}}}t.add(i);const b=st(r,l,i),u=at(l),f=ct(l);e.push({cardElement:l,item:{id:i,groupId:i,name:b,url:`https://www.facebook.com/groups/${i}/`,privacy:u,membersText:f||void 0,status:p},joinButton:d})}return e}function me(e){if(!e)return;try{e.scrollIntoView({behavior:"auto",block:"center"})}catch{}e.focus();const t=e.closest('div[role="button"], button, a[role="button"]')||e;t.focus();const n={bubbles:!0,cancelable:!0,view:window};if(t.dispatchEvent(new PointerEvent("pointerdown",n)),t.dispatchEvent(new MouseEvent("mousedown",n)),t.dispatchEvent(new PointerEvent("pointerup",n)),t.dispatchEvent(new MouseEvent("mouseup",n)),t.click(),t!==e)try{e.dispatchEvent(new MouseEvent("click",n)),e.click()}catch{}}async function Mt(e){let t=document.querySelector('div[role="dialog"]');if((!t||t.offsetParent===null&&t.getBoundingClientRect().height<=50)&&(await new Promise(i=>setTimeout(i,30)),t=document.querySelector('div[role="dialog"]')),!t||t.offsetParent===null&&t.getBoundingClientRect().height<=50)return!1;console.log("[AGP:AutoJoiner] Membership questions modal detected. Fast auto-answering...");const n=Array.from(t.querySelectorAll('input[type="checkbox"], div[role="checkbox"]'));for(const i of n)(i instanceof HTMLInputElement?i.checked:i.getAttribute("aria-checked")==="true")||me(i);const o=Array.from(t.querySelectorAll('input[type="radio"], div[role="radio"]'));o.length>0&&(o.some(a=>a instanceof HTMLInputElement?a.checked:a.getAttribute("aria-checked")==="true")||me(o[0]));const r=Array.from(t.querySelectorAll('textarea, input[type="text"]'));for(const i of r)(!i.value||i.value.trim()==="")&&(i.focus(),i.value=e||"Yes, I agree to the group rules and guidelines.",i.dispatchEvent(new Event("input",{bubbles:!0})),i.dispatchEvent(new Event("change",{bubbles:!0})));const s=Array.from(t.querySelectorAll('button, div[role="button"]'));for(const i of s){const a=(i.innerText||i.textContent||i.getAttribute("aria-label")||"").trim().toLowerCase();if(a==="submit"||a==="জমা দিন"||a==="send"||a==="confirm"||a==="next"||a==="পরবর্তী"||a==="done"||a==="অনুরোধ পাঠান"||a.includes("submit")||a.includes("জমা")){me(i),await new Promise(l=>setTimeout(l,15));break}}const c=document.querySelector('div[role="dialog"]');if(c){const i=Array.from(c.querySelectorAll('button, div[role="button"]'));for(const a of i){const l=(a.innerText||a.textContent||a.getAttribute("aria-label")||"").trim().toLowerCase();if(l==="submit"||l==="জমা দিন"||l==="done"||l.includes("submit")){me(a),await new Promise(d=>setTimeout(d,15));break}}}return!0}const oe=class oe{constructor(){Q(this,"state",{...et});Q(this,"config",{searchUrl:"",delaySec:0,maxGroups:0,autoAnswerQuestions:!0,defaultAnswer:"Yes, I agree to the group rules and guidelines.",saveToGroups:!0});Q(this,"isRunning",!1);Q(this,"isPaused",!1);Q(this,"shouldStop",!1);Q(this,"onProgressCallbacks",[])}static getInstance(){return oe.instance||(oe.instance=new oe),oe.instance}subscribe(t){this.onProgressCallbacks.push(t)}getState(){return{...this.state}}broadcastState(){var t;for(const n of this.onProgressCallbacks)try{n(this.state)}catch{}try{typeof chrome<"u"&&((t=chrome.runtime)!=null&&t.sendMessage)&&chrome.runtime.sendMessage({type:"AUTO_JOIN_PROGRESS",payload:this.state})}catch{}}pause(){this.isRunning&&!this.isPaused&&(this.isPaused=!0,this.state.status="PAUSED",this.state.message="Auto-Join paused by user.",this.broadcastState())}resume(){this.isRunning&&this.isPaused&&(this.isPaused=!1,this.state.status="JOINING",this.state.message="Resuming group auto-joining...",this.broadcastState())}stop(){this.shouldStop=!0,this.isRunning=!1,this.isPaused=!1,this.state.status="STOPPED",this.state.message="Auto-Join stopped by user.",this.broadcastState()}async start(t){if(this.isRunning)return console.warn("[AGP:AutoJoiner] Already running."),this.state;this.config={...this.config,...t,delaySec:typeof t.delaySec=="number"?t.delaySec:0},this.isRunning=!0,this.isPaused=!1,this.shouldStop=!1;const n=Be(window.location.href);this.state={...et,status:"SEARCHING",searchUrl:window.location.href,query:n,message:`Scanning Facebook group search results for "${n}"...`,startedAt:Date.now()},this.broadcastState();try{let o=0;const r=new Set;for(;!this.shouldStop;){for(;this.isPaused&&!this.shouldStop;)await new Promise(i=>setTimeout(i,500));if(this.shouldStop)break;const s=lt();if(this.state.groups=s.map(i=>i.item),this.state.totalFound=s.length,this.state.alreadyJoinedCount=s.filter(i=>i.item.status==="ALREADY_JOINED").length,this.state.requestedCount=s.filter(i=>i.item.status==="REQUESTED").length,this.state.joinedCount=s.filter(i=>i.item.status==="JOINED").length,this.config.saveToGroups)for(const i of s)i.item.status==="ALREADY_JOINED"&&!r.has(i.item.groupId)&&(r.add(i.item.groupId),await this.saveGroupToDatabase(i.item));const c=s.find(i=>i.item.status==="READY_TO_JOIN"&&!r.has(i.item.groupId));if(c){o=0;const{cardElement:i,item:a}=c;let l=c.joinButton;if(!l&&i){const d=Array.from(i.querySelectorAll('div[role="button"], button, a[role="button"], [role="button"]'));for(const p of d)if(je(p)){l=p;break}if(!l){for(const p of d)if(!Fe(p)&&!ze(p)){const b=(p.innerText||p.textContent||p.getAttribute("aria-label")||"").toLowerCase();if(!b.includes("more")&&!b.includes("menu")&&!b.includes("share")&&!b.includes("close")){l=p;break}}}}if(r.add(a.groupId),this.config.maxGroups>0&&this.state.joinedCount+this.state.requestedCount>=this.config.maxGroups){this.state.message=`Reached target limit of ${this.config.maxGroups} groups.`;break}if(l){this.state.status="JOINING",this.state.currentGroupName=a.name,a.status="JOINING",this.state.message=`Joining: "${a.name}"...`,this.broadcastState();try{i.scrollIntoView({behavior:"auto",block:"nearest"}),i.style.outline="3px solid #10b981",i.style.boxShadow="0 0 15px rgba(16, 185, 129, 0.45)",i.style.borderRadius="8px"}catch{}try{console.log(`[AGP:AutoJoiner] Triggering instant click on Join button for: "${a.name}"`),me(l),this.config.autoAnswerQuestions&&await Mt(this.config.defaultAnswer),a.status="JOINED",a.joinedAt=Date.now(),this.state.joinedCount++,this.config.saveToGroups&&await this.saveGroupToDatabase(a),this.state.message=`Joined "${a.name}" (${a.status})`,this.broadcastState()}catch(p){console.error("[AGP:AutoJoiner] Join error on",a.name,p),a.status="FAILED",a.error=String(p),this.state.failedCount++,this.broadcastState()}finally{try{i.style.outline="2px solid rgba(16, 185, 129, 0.35)",i.style.boxShadow="none"}catch{}}const d=typeof this.config.delaySec=="number"?this.config.delaySec:0;if(d<=0)this.state.countdownSec=0,await new Promise(p=>setTimeout(p,30));else{for(let p=d;p>0&&!this.shouldStop;p--){for(;this.isPaused&&!this.shouldStop;)await new Promise(b=>setTimeout(b,200));if(this.shouldStop)break;this.state.countdownSec=p,this.state.message=`Waiting ${p}s before next group...`,this.broadcastState(),await new Promise(b=>setTimeout(b,1e3))}this.state.countdownSec=0}}}else{this.state.message="Loading more Facebook groups on this page...",this.broadcastState();const i=document.body.scrollHeight;if(window.scrollBy({top:1800,behavior:"auto"}),window.dispatchEvent(new Event("scroll",{bubbles:!0})),await new Promise(d=>setTimeout(d,120)),!lt().some(d=>d.item.status==="READY_TO_JOIN"&&!r.has(d.item.groupId))&&document.body.scrollHeight===i){if(o++,o>=3)break}else o=0}}this.shouldStop||(this.state.status="COMPLETED",this.state.message=`Auto-join complete! Joined ${this.state.joinedCount} groups, requested ${this.state.requestedCount} groups.`)}catch(o){console.error("[AGP:AutoJoiner] Execution error:",o),this.state.status="ERROR",this.state.message=`Error: ${(o==null?void 0:o.message)||String(o)}`}finally{this.isRunning=!1,this.isPaused=!1,this.state.finishedAt=Date.now(),this.broadcastState()}return this.state}async saveGroupToDatabase(t){var n;try{const o=await rt();if(!o.some(s=>s.groupId&&s.groupId.toLowerCase()===t.groupId.toLowerCase()||s.url&&s.url.toLowerCase().includes(t.groupId.toLowerCase()))){const s={id:Ne(),name:t.name,url:t.url,groupId:t.groupId,privacy:t.privacy,category:this.config.selectedCategory||"Auto Joined",enabled:!0,selected:!1,status:"READY",postCount:0,verified:!0,source:"facebook-ui",createdAt:Date.now(),updatedAt:Date.now()};await it([...o,s]),console.log(`[AGP:AutoJoiner] Saved "${t.name}" (${t.groupId}) to My Facebook Groups database.`);try{typeof chrome<"u"&&((n=chrome.runtime)!=null&&n.sendMessage)&&chrome.runtime.sendMessage({type:"AUTO_JOIN_SAVE_GROUPS",payload:{group:s}})}catch{}}}catch(o){console.warn("[AGP:AutoJoiner] Save to database error:",o)}}};Q(oe,"instance");let U=oe,W=null,D=null;function Je(e){if(typeof document>"u")return;const t=U.getInstance(),n=t.getState();Be(window.location.href),W||(W=document.createElement("div"),W.id="agp-auto-joiner-root",W.style.cssText=`
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 2147483646;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    `,D=W.attachShadow({mode:"open"}),document.body.appendChild(W),t.subscribe(o=>{Pe(o)})),Pe(n,e)}let We=!1;function Pe(e,t){if(!D)return;const n=Be(window.location.href),o=e.status==="SEARCHING"||e.status==="JOINING",r=e.status==="PAUSED",s=e.status==="JOINING"?"#10b981":e.status==="SEARCHING"?"#3b82f6":e.status==="PAUSED"?"#f59e0b":e.status==="COMPLETED"?"#10b981":e.status==="ERROR"?"#ef4444":"#6366f1";if(We){D.innerHTML=`
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
        .dot { width: 8px; height: 8px; border-radius: 50%; background: ${s}; ${o?"animation: pulse 1.5s infinite;":""} }
        @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
      </style>
      <div id="agp-dock-expand" class="mini-badge">
        <div class="dot"></div>
        <span style="font-size: 12px; font-weight: 700;">Auto-Joiner: ${e.joinedCount} Joined</span>
        <span style="font-size: 11px; color: #94a3b8;">↗</span>
      </div>
    `;const u=D.getElementById("agp-dock-expand");u&&(u.onclick=()=>{We=!1,Pe(e,t)});return}D.innerHTML=`
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
        ${o?"animation: pulse 1.5s infinite;":""}
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
            <div class="subtitle" title="${n||"Group Search Results"}">
              ${n?`Search: "${n}"`:"Group Search Results"}
            </div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 4px;">
          <div class="status-pill">
            <div class="status-dot"></div>
            <span>${e.status}</span>
          </div>
          <button id="agp-dock-min" class="icon-btn" title="Minimize">−</button>
          <button id="agp-dock-close" class="icon-btn" title="Dismiss">✕</button>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-num" style="color: #60a5fa;">${e.totalFound}</div>
          <div class="stat-label">Found</div>
        </div>
        <div class="stat-item">
          <div class="stat-num" style="color: #34d399;">${e.joinedCount}</div>
          <div class="stat-label">Joined</div>
        </div>
        <div class="stat-item">
          <div class="stat-num" style="color: #fbbf24;">${e.requestedCount}</div>
          <div class="stat-label">Pending</div>
        </div>
        <div class="stat-item">
          <div class="stat-num" style="color: #a78bfa;">${e.alreadyJoinedCount}</div>
          <div class="stat-label">Member</div>
        </div>
      </div>

      ${e.countdownSec>0?`<div class="countdown-bar-container">
               <div class="countdown-bar" style="width: 100%; transition: width 0.9s linear;"></div>
             </div>`:""}

      <div class="message-box">
        ${e.message||"Ready to auto-join all groups on this search page and save them to your list."}
      </div>

      <div class="btn-row">
        ${!o&&!r?`<button id="btn-start-join" class="btn btn-primary">
                 <span>▶</span> Auto-Join All Groups
               </button>`:o?`<button id="btn-pause-join" class="btn btn-pause">⏸ Pause</button>
               <button id="btn-stop-join" class="btn btn-stop">⏹ Stop</button>`:`<button id="btn-resume-join" class="btn btn-primary">▶ Resume</button>
               <button id="btn-stop-join" class="btn btn-stop">⏹ Stop</button>`}
      </div>

      <div class="footer-actions">
        <span style="font-size: 10px; color: #64748b;">Groups auto-saved for posting</span>
        <button id="btn-view-groups" class="link-btn">View My Groups ↗</button>
      </div>
    </div>
  `;const c=D.getElementById("agp-dock-close");c&&(c.onclick=()=>{W&&(W.remove(),W=null,D=null)});const i=D.getElementById("agp-dock-min");i&&(i.onclick=()=>{We=!0,Pe(e,t)});const a=D.getElementById("btn-view-groups");a&&(a.onclick=()=>{var u;try{typeof chrome<"u"&&((u=chrome.runtime)!=null&&u.sendMessage)&&chrome.runtime.sendMessage({type:"OPEN_DASHBOARD"})}catch{}});const l=D.getElementById("btn-start-join");l&&(l.onclick=()=>{U.getInstance().start(t||{searchUrl:window.location.href,delaySec:0,maxGroups:0,autoAnswerQuestions:!0,defaultAnswer:"Yes, I agree to the group rules and guidelines.",saveToGroups:!0})});const d=D.getElementById("btn-pause-join");d&&(d.onclick=()=>{U.getInstance().pause()});const p=D.getElementById("btn-resume-join");p&&(p.onclick=()=>{U.getInstance().resume()});const b=D.getElementById("btn-stop-join");b&&(b.onclick=()=>{U.getInstance().stop()})}console.log("[AGP:Content] Facebook Assistant Content Script initialized.");let H=null,A=null,w=null,te=!1,Ie=!1,ie=null,_e=!1;function Ve(){_&&(clearInterval(_),_=null),O=!1,V=!0,_e=!0;try{chrome.runtime.sendMessage({type:"STOP_QUEUE"})}catch{}H&&(H.remove(),H=null,A=null),E("🛑 Auto-Posting বন্ধ করা হয়েছে (Stopped & Closed)")}async function $t(e){try{return await navigator.clipboard.writeText(e),!0}catch{const n=document.createElement("textarea");n.value=e,document.body.appendChild(n),n.select();const o=document.execCommand("copy");return document.body.removeChild(n),o}}async function ut(e,t){try{if(navigator.clipboard&&window.ClipboardItem){const n=new Blob([e],{type:"text/plain"}),o=new Blob([t],{type:"text/html"});return await navigator.clipboard.write([new window.ClipboardItem({"text/plain":n,"text/html":o})]),!0}}catch{}try{const n=r=>{var s,c;r.preventDefault(),(s=r.clipboardData)==null||s.setData("text/plain",e),(c=r.clipboardData)==null||c.setData("text/html",t)};document.addEventListener("copy",n);const o=document.execCommand("copy");if(document.removeEventListener("copy",n),o)return!0}catch{}return $t(e)}function E(e,t=!1){if(A){const n=A.getElementById("agp-toast");n&&n.remove();const o=document.createElement("div");o.id="agp-toast",o.innerText=e,o.style.cssText=`
      position: absolute;
      top: 12px;
      left: 50%;
      transform: translateX(-50%);
      background: ${t?"#ef4444":"#10b981"};
      color: #ffffff;
      font-size: 12px;
      font-weight: 600;
      padding: 6px 14px;
      border-radius: 9999px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.4);
      z-index: 1000;
      pointer-events: none;
      animation: fadeInOut 2.2s ease forwards;
    `,A.appendChild(o),setTimeout(()=>o.remove(),2400);return}if(typeof document<"u"&&document.body){const n=document.getElementById("agp-global-toast");n&&n.remove();const o=document.createElement("div");o.id="agp-global-toast",o.innerText=e,o.style.cssText=`
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${t?"#ef4444":"#10b981"};
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
    `,document.body.appendChild(o),requestAnimationFrame(()=>{o.style.opacity="1",o.style.transform="translateY(0)"}),setTimeout(()=>{o.style.opacity="0",o.style.transform="translateY(-10px)",setTimeout(()=>o.remove(),400)},3e3)}}let O=!1,I="Preparing auto-post...",_=null,V=!1;const G=e=>new Promise(t=>setTimeout(t,e));async function Ot(e,t="media_1"){try{if(!e||typeof e!="string")return null;let n="image/jpeg",o=null;if(e.startsWith("data:")||e.startsWith("blob:")||e.startsWith("http://")||e.startsWith("https://"))try{const d=await fetch(e);(d.ok||e.startsWith("data:")||e.startsWith("blob:"))&&(o=await d.blob(),o&&o.size>0&&(n=(o.type||"").toLowerCase()||"image/jpeg"))}catch(d){console.warn("[AGP:AutoPost] fetch blob parsing failed, falling back to manual decode:",d)}if(!o||o.size===0){let d=e;if(e.startsWith("data:")){const p=e.indexOf(",");if(p!==-1){const b=e.slice(0,p);d=e.slice(p+1);const u=b.match(/:(.*?);/);n=u?u[1].toLowerCase():"image/jpeg"}}try{const p=atob(d.trim().replace(/\s/g,"")),b=new Uint8Array(p.length);for(let u=0;u<p.length;u++)b[u]=p.charCodeAt(u);if(b.length===0)return null;b.length>8&&b[4]===102&&b[5]===116&&b[6]===121&&b[7]===112&&(n="video/mp4"),o=new Blob([b.buffer],{type:n})}catch(p){return console.warn("[AGP:AutoPost] base64 decode failed:",p),null}}if(!o||o.size===0)return null;const r=n.startsWith("video/");let s="jpg";n.includes("video/mp4")||n.includes("mp4")?s="mp4":n.includes("video/webm")||n.includes("webm")?s="webm":n.includes("video/quicktime")||n.includes("mov")?s="mov":n.includes("video/x-m4v")||n.includes("m4v")?s="m4v":n.includes("video/mkv")||n.includes("matroska")?s="mkv":r?s="mp4":n.includes("png")?s="png":n.includes("webp")?s="webp":n.includes("gif")&&(s="gif");const c=Date.now(),i=t.replace(/\D/g,"")||"1",l=`${r?"VID":"IMG"}_${c}_${i}.${s}`;return new File([o],l,{type:n,lastModified:c})}catch(n){return console.warn("[AGP:AutoPost] mediaToFile error:",n),null}}function N(e){if(!e)return!1;if(e.offsetParent!==null)return!0;try{const t=window.getComputedStyle(e);if(t.display==="none"||t.visibility==="hidden"||t.opacity==="0")return!1;const n=e.getBoundingClientRect();return n.width>0&&n.height>0}catch{return!1}}function he(){const e=Array.from(document.querySelectorAll('[data-pagelet="GroupInlineComposer"], [data-pagelet="FeedInlineComposer"], [data-pagelet="GroupComposer"], [data-pagelet*="Composer" i]'));for(const n of e){if(n.closest('[role="article"], [data-pagelet*="FeedUnit"], [data-pagelet*="Comment"], form'))continue;const o=n.querySelector('[role="button"]');if(o&&N(o))return o}const t=Array.from(document.querySelectorAll('[role="main"] [role="button"], [role="button"]'));for(const n of t){if(n.closest('[role="article"], [data-pagelet*="FeedUnit"], [data-pagelet*="Comment"], form'))continue;const o=(n.getAttribute("aria-label")||"").toLowerCase(),r=(n.textContent||"").trim().toLowerCase();if((o.includes("create a public post")||o.includes("write something")||o.includes("create a post")||o.includes("কিছু লিখুন")||o.includes("পোস্ট তৈরি করুন")||o.includes("একটি পাবলিক পোস্ট")||r==="create a public post..."||r==="write something..."||r==="create a post..."||r==="create post"||r.includes("কিছু লিখুন")||r.includes("পোস্ট তৈরি করুন")||r.includes("পাবলিক পোস্ট"))&&N(n))return n}return null}function se(){const e=Array.from(document.querySelectorAll('[role="dialog"]'));for(const t of e)if(N(t)){if(t.closest('[role="article"]')||t.querySelector('[data-pagelet*="ChatTab"], [aria-label*="Messenger" i]'))continue;const n=(t.textContent||"").toLowerCase(),o=(t.getAttribute("aria-label")||"").toLowerCase();if(o.includes("create post")||o.includes("create a public post")||o.includes("পোস্ট তৈরি করুন")||n.includes("create post")||n.includes("create a public post")||n.includes("add to your post")||n.includes("পোস্ট তৈরি করুন")||n.includes("আপনার পোস্টে যোগ করুন")||!!t.querySelector('[aria-label*="Add to your post" i], [aria-label*="আপনার পোস্টে যোগ করুন" i], [aria-label*="Photo/video" i]'))return t}return null}function we(){const e=(document.body?document.body.innerText:"").toLowerCase(),t=(document.title||"").toLowerCase();return window.location.href.toLowerCase().includes("/groups/grp_")||e.includes("this content isn't available right now")||e.includes("this content isn't available")||e.includes("content isn't available right now")||e.includes("the link you followed may be broken")||e.includes("page may have been removed")||e.includes("এই কন্টেন্টটি এখন উপলব্ধ নয়")||e.includes("এই লিঙ্কটি হয়তো ত্রুটিপূর্ণ")||t.includes("page not found")||t.includes("content not found")||!!document.querySelector('[role="main"] [aria-label*="Go to Feed" i], [role="main"] a[href="/"][role="button"]')}async function Nt(){if(we())return null;let e=se();if(e)return e;let t=he();if(!t){const o=Date.now();for(;Date.now()-o<3500;){if(e=se(),e)return e;if(t=he(),t)break;await G(10)}}if(!t)return console.log("[AGP:AutoPost] Composer trigger not found on page."),null;if(t.scrollIntoView({behavior:"instant",block:"center"}),t.dispatchEvent(new PointerEvent("pointerdown",{bubbles:!0,cancelable:!0})),t.dispatchEvent(new MouseEvent("mousedown",{bubbles:!0,cancelable:!0})),t.dispatchEvent(new PointerEvent("pointerup",{bubbles:!0,cancelable:!0})),t.dispatchEvent(new MouseEvent("mouseup",{bubbles:!0,cancelable:!0})),t.click(),e=se(),e)return e;const n=Date.now();for(;Date.now()-n<3500;){if(e=se(),e)return e;await G(10)}return null}async function dt(e,t){if(!t||!t.trim())return!0;const n=Tt(Re(t)).replace(/\r\n/g,`
`).replace(/\r/g,`
`),o=n.split(`
`);ut(n.trim(),qe(n)).catch(()=>{});let r=null;const s=Date.now(),c=['div[role="textbox"][contenteditable="true"]','div[data-lexical-editor="true"][contenteditable="true"]','div[contenteditable="true"]:not([aria-label*="comment" i]):not([aria-label*="মন্তব্য" i])','div[data-editor="true"]','div[aria-label*="Create a public post" i][contenteditable="true"]','div[aria-label*="Write something" i][contenteditable="true"]','div[aria-label*="কিছু লিখুন" i][contenteditable="true"]','div[aria-label*="পাবলিক পোস্ট" i][contenteditable="true"]','div[aria-placeholder*="Create a public post" i]','div[aria-placeholder*="Write something" i]'];for(;Date.now()-s<4e3;){for(const g of c){const y=e.querySelector(g)||document.querySelector(`[role="dialog"] ${g}`);if(y&&N(y)){r=y;break}}if(r)break;await G(10)}if(!r)return console.warn("[AGP:AutoPost] Create post editor not found inside modal."),!1;const i=(r.textContent||"").trim(),a=n.trim().slice(0,30);if(i.length>=n.trim().length*.7&&(!a||i.includes(a)))return console.log("[AGP:AutoPost] Editor already contains caption. Skipping duplicate injection."),!0;r.scrollIntoView({behavior:"instant",block:"center"}),window.focus(),r.focus();const l={bubbles:!0,cancelable:!0,view:window};r.dispatchEvent(new PointerEvent("pointerdown",l)),r.dispatchEvent(new MouseEvent("mousedown",l)),r.dispatchEvent(new PointerEvent("pointerup",l)),r.dispatchEvent(new MouseEvent("mouseup",l)),r.dispatchEvent(new MouseEvent("click",l)),r.dispatchEvent(new FocusEvent("focus",{bubbles:!1})),r.dispatchEvent(new FocusEvent("focusin",{bubbles:!0}));try{const g="agp_inj_"+Date.now()+"_"+Math.random().toString(36).slice(2,7),y=new Promise(x=>{const v=C=>{C.data&&C.data.type==="AGP_MAIN_INJECT_CAPTION_RESPONSE"&&C.data.messageId===g&&(window.removeEventListener("message",v),x(!!C.data.success))};window.addEventListener("message",v),setTimeout(()=>{window.removeEventListener("message",v),x(!1)},250)});if(window.postMessage({type:"AGP_MAIN_INJECT_CAPTION",messageId:g,caption:n},"*"),await y&&(console.log("[AGP:AutoPost] MAIN world injection succeeded with exact layout!"),(r.textContent||"").trim().length>0))return!0}catch(g){console.warn("[AGP:AutoPost] MAIN world bridge error, using direct content injection:",g)}const d=(r.textContent||"").trim();if(d.length>=n.trim().length*.7&&(!a||d.includes(a)))return console.log("[AGP:AutoPost] Editor already populated by bridge. Skipping fallback Strategy 2."),!0;const p=window.getSelection();if(p){const g=document.createRange();g.selectNodeContents(r),p.removeAllRanges(),p.addRange(g),r.dispatchEvent(new InputEvent("beforeinput",{bubbles:!0,cancelable:!0,inputType:"deleteContentBackward"}))}document.execCommand("selectAll",!1),document.execCommand("delete",!1),await G(10);const b=r.querySelector("p")||r;if(b.dispatchEvent(new MouseEvent("mousedown",l)),b.dispatchEvent(new MouseEvent("mouseup",l)),b.click(),p){const g=document.createRange();b.childNodes.length>0?(g.setStart(b,0),g.setEnd(b,b.childNodes.length)):g.selectNodeContents(b),g.collapse(!0),p.removeAllRanges(),p.addRange(g)}document.dispatchEvent(new Event("selectionchange"));let u=!1;const f=qe(n);try{const g=new DataTransfer;g.setData("text/plain",n),g.setData("text/html",f);const y=new ClipboardEvent("paste",{bubbles:!0,cancelable:!0,clipboardData:g});r.dispatchEvent(y),await G(20);let m=(r.textContent||"").trim();if((!m||m.length<5)&&(r.dispatchEvent(new InputEvent("beforeinput",{bubbles:!0,cancelable:!0,inputType:"insertFromPaste",dataTransfer:g})),await G(15),m=(r.textContent||"").trim()),!m||m.length<5)try{document.execCommand("insertHTML",!1,f),await G(15),m=(r.textContent||"").trim()}catch{}const x=r.querySelectorAll("p, h1, h2, h3, ul, ol, li, blockquote"),v=r.querySelectorAll("h1, h2, ul, ol, blockquote").length>0;m.length>0&&(!n.includes(`
`)||x.length>1||v||m.length>=n.trim().length*.4)&&(console.log("[AGP:AutoPost] Direct Native Paste event succeeded. Block count:",x.length),u=!0)}catch(g){console.warn("[AGP:AutoPost] Native paste event error:",g)}if(!u)try{console.log("[AGP:AutoPost] Trying Strategy 3: Line-by-line Enter keystrokes with non-collapsing spacing..."),document.execCommand("selectAll",!1),document.execCommand("delete",!1),await G(10);for(let y=0;y<o.length;y++){const m=o[y],x=y===o.length-1;m.length>0?document.execCommand("insertText",!1,m):document.execCommand("insertText",!1," "),x||(r.dispatchEvent(new KeyboardEvent("keydown",{key:"Enter",code:"Enter",keyCode:13,which:13,bubbles:!0,cancelable:!0})),r.dispatchEvent(new InputEvent("beforeinput",{inputType:"insertParagraph",bubbles:!0,cancelable:!0})),document.execCommand("insertParagraph",!1),r.dispatchEvent(new InputEvent("input",{inputType:"insertParagraph",bubbles:!0})),r.dispatchEvent(new KeyboardEvent("keyup",{key:"Enter",code:"Enter",keyCode:13,which:13,bubbles:!0})))}await G(15),(r.textContent||"").trim().length>0&&(console.log("[AGP:AutoPost] Strategy 3 succeeded."),u=!0)}catch(g){console.warn("[AGP:AutoPost] Strategy 3 error:",g)}return r.dispatchEvent(new Event("input",{bubbles:!0})),r.dispatchEvent(new Event("change",{bubbles:!0})),document.dispatchEvent(new Event("selectionchange")),await G(15),(r.textContent||"").trim().length>0}function Rt(e){const t=e.querySelector('[aria-label*="Photo/video" i], [aria-label*="Photo / video" i], [aria-label*="Add photo" i], [aria-label*="Add Photos" i], [aria-label*="Add photos or videos" i], [aria-label*="Add video" i], [aria-label*="Add Photos/videos" i], [aria-label*="ফটো/ভিডিও" i], [aria-label*="Photo" i], [aria-label*="Video" i], [aria-label*="ছবি/ভিডিও" i], [aria-label*="ছবি" i], [aria-label*="ভিডিও" i], div[aria-label*="Photo" i], div[aria-label*="Video" i], div[aria-label*="ফটো" i], div[aria-label*="ভিডিও" i]');if(t&&N(t))return t;const n=Array.from(e.querySelectorAll('[role="button"], button, div[tabindex="0"]'));for(const r of n){const s=(r.getAttribute("aria-label")||"").toLowerCase();if((s.includes("photo")||s.includes("video")||s.includes("image")||s.includes("ফটো")||s.includes("ছবি")||s.includes("ভিডিও"))&&N(r))return r}const o=Array.from(e.querySelectorAll("span, div, p"));for(const r of o){const s=(r.textContent||"").trim().toLowerCase();if(s==="add to your post"||s==="আপনার পোস্টে যোগ করুন"||s.includes("add to your post")){const c=r.closest("div"),i=(c==null?void 0:c.parentElement)||c,a=i==null?void 0:i.querySelector('[role="button"], img, svg');if(a&&N(a))return a.closest('[role="button"]')||a}}return null}function pt(e){return e.querySelector('input[type="file"][accept*="video"]')||e.querySelector('input[type="file"][accept*="image"]')||e.querySelector('input[type="file"]')||document.querySelector('[role="dialog"] input[type="file"]')||document.querySelector('input[type="file"]')}function ae(e){var n;const t=(e.textContent||"").toLowerCase();if(t.includes("your file can't be uploaded")||t.includes("file can't be uploaded")||t.includes("আপলোড করা যাবে না")||t.includes("আপলোড করা যায়নি")||t.includes("couldn't be uploaded")||t.includes("error uploading")){const o=Array.from(e.querySelectorAll("span, div, p")).find(r=>{const s=(r.textContent||"").toLowerCase();return s.includes("your file can't be uploaded")||s.includes("file can't be uploaded")||s.includes("আপলোড করা যাবে না")||s.includes("আপলোড করা যায়নি")||s.includes("couldn't be uploaded")});return((n=o==null?void 0:o.textContent)==null?void 0:n.trim())||"Your file can't be uploaded"}return null}async function Ut(e,t){if(!t||t.length===0)return!0;t.some(a=>a.includes("video")||a.includes(".mp4")||a.includes(".mov")||a.includes(".webm"));let n=pt(e);if(!n){const a=Rt(e);if(a){a.scrollIntoView({behavior:"instant",block:"center"}),a.dispatchEvent(new PointerEvent("pointerdown",{bubbles:!0,cancelable:!0})),a.dispatchEvent(new MouseEvent("mousedown",{bubbles:!0,cancelable:!0})),a.dispatchEvent(new PointerEvent("pointerup",{bubbles:!0,cancelable:!0})),a.dispatchEvent(new MouseEvent("mouseup",{bubbles:!0,cancelable:!0})),a.click();const l=Date.now();for(;Date.now()-l<2500&&(n=pt(e),!n);)await G(20)}}if(!n)return console.warn("[AGP:AutoPost] File input not found inside create post modal."),!1;const o=new DataTransfer,r=await Promise.all(t.map((a,l)=>Ot(a,`media_${l+1}`)));for(const a of r)a&&a.size>0&&(o.items.add(a),console.log(`[AGP:AutoPost] Prepared media file: ${a.name} (${a.type}, ${a.size} bytes)`));if(o.files.length===0)return console.warn("[AGP:AutoPost] No valid non-empty files prepared from mediaList."),!1;n.files=o.files;const s=n._valueTracker;s&&s.setValue(""),n.dispatchEvent(new Event("change",{bubbles:!0,cancelable:!0})),n.dispatchEvent(new Event("input",{bubbles:!0,cancelable:!0}));const c=4e3,i=Date.now();for(;Date.now()-i<c;){const a=ae(e);if(a)return console.warn("[AGP:AutoPost] Facebook upload error detected:",a),!1;if(!!e.querySelector('video, img[src*="blob:"], img[src*="data:"], img[src*="fbcdn.net"], div[aria-label*="Video" i], div[aria-label*="Photo" i], div[data-pagelet*="MediaViewer"], div[aria-label*="Edit" i], button[aria-label*="Edit" i], div[aria-label*="Remove" i], div[role="button"][aria-label*="Edit" i]')){console.log("[AGP:AutoPost] Media preview mounted immediately in composer.");break}await G(10)}return!ae(e)}function ft(e,t){return e.includes("joined")||e.includes("যোগ দিয়েছেন")||e.includes("মেম্বার")||e.includes("member")||e.includes("leave group")||e.includes("গ্রুপ ত্যাগ")||t.includes("joined")||t.includes("যোগ দিয়েছেন")||t.includes("member")}function ce(){const e=['[aria-label*="Join group" i]','[aria-label*="Join Group" i]','[aria-label*="গ্রুপে যোগ দিন" i]','[aria-label*="যোগ দিন" i]','[aria-label*="গ্রুপে যুক্ত হন" i]','[aria-label*="Request to join" i]','[aria-label*="Request to Join" i]','[aria-label*="গ্রুপে যোগ দেওয়ার অনুরোধ" i]','[aria-label*="যোগ দেওয়ার অনুরোধ" i]','[aria-label*="গ্রুপে যোগদানের অনুরোধ" i]','div[role="button"][aria-label*="Join" i]','div[role="button"][aria-label*="যোগ" i]','button[aria-label*="Join" i]','button[aria-label*="যোগ" i]'];for(const n of e){const o=document.querySelector(n);if(o&&N(o)){const r=(o.innerText||o.textContent||"").trim().toLowerCase(),s=(o.getAttribute("aria-label")||"").toLowerCase();if(!ft(r,s))return o}}const t=Array.from(document.querySelectorAll('div[role="main"] [role="button"], div[role="main"] button, div[role="region"] [role="button"], [role="banner"] [role="button"], div[role="button"], button'));for(const n of t){if(!N(n))continue;const o=(n.innerText||n.textContent||"").trim().toLowerCase(),r=(n.getAttribute("aria-label")||"").toLowerCase();if(!ft(o,r)&&(o==="join group"||o==="join"||o==="গ্রুপে যোগ দিন"||o==="যোগ দিন"||o==="গ্রুপে যুক্ত হন"||o==="request to join"||o==="request to join group"||o==="যোগ দেওয়ার অনুরোধ"||o==="যোগ দেওয়ার অনুরোধ জানান"||o.includes("join group")||o.includes("গ্রুপে যোগ দিন")))return n}return null}function He(){const e=!!ce(),t=!!he();return e&&!t}async function gt(){const e=ce();if(!e)return{success:!1,isInstantMember:!1,reason:"Join button not found"};console.log("[AGP:AutoJoin] Found Join button. Executing automatic join click..."),I="⚡ Auto-joining group (গ্রুপে যোগ দেওয়া হচ্ছে)...",k(),E("⚡ Auto-joining group...",!0),e.scrollIntoView({behavior:"instant",block:"center"}),await G(10);const t={bubbles:!0,cancelable:!0,view:window};e.dispatchEvent(new PointerEvent("pointerdown",t)),e.dispatchEvent(new MouseEvent("mousedown",t)),e.dispatchEvent(new PointerEvent("pointerup",t)),e.dispatchEvent(new MouseEvent("mouseup",t)),e.click();const n=Date.now();let o=null;for(;Date.now()-n<350&&(o=document.querySelector('div[role="dialog"]'),!(o&&N(o)));){const i=he();if(i&&N(i))break;await G(15)}if(o&&N(o)){console.log("[AGP:AutoJoin] Rules agreement or membership question dialog detected. Handling...");const i=Array.from(o.querySelectorAll('input[type="checkbox"], div[role="checkbox"]'));for(const d of i)d.getAttribute("aria-checked")==="true"||d.checked||d.click();const a=Array.from(o.querySelectorAll('textarea, input[type="text"]'));for(const d of a)(!d.value||!d.value.trim())&&(d.value="Agree",d.dispatchEvent(new Event("input",{bubbles:!0})),d.dispatchEvent(new Event("change",{bubbles:!0})));const l=Array.from(o.querySelectorAll('button, [role="button"], input[type="submit"]')).find(d=>{const p=(d.innerText||d.textContent||d.getAttribute("aria-label")||"").trim().toLowerCase();return p==="submit"||p==="send"||p==="agree"||p==="confirm"||p==="সাবমিট"||p==="জমা দিন"||p==="সম্মতি দিচ্ছি"||p.includes("submit")||p.includes("সাবমিট")});if(l&&N(l)){console.log("[AGP:AutoJoin] Clicking modal submit button..."),l.click();const d=Date.now();for(;Date.now()-d<600&&document.querySelector('div[role="dialog"]');)await G(20)}}const r=Date.now();for(;Date.now()-r<2500;){const i=he();if(i&&N(i))return console.log("[AGP:AutoJoin] Instant membership granted! Composer available."),E("✅ Joined group! Post box ready.",!0),{success:!0,isInstantMember:!0,reason:"Instant member"};await G(25)}const s=(document.body?document.body.innerText:"").toLowerCase();return s.includes("requested")||s.includes("pending")||s.includes("অনুরোধ করা হয়েছে")||s.includes("cancel request")||s.includes("অনুরোধ বাতিল")?(console.log("[AGP:AutoJoin] Join request sent (Pending admin approval)."),{success:!0,isInstantMember:!1,reason:"Join request pending admin approval"}):ce()?{success:!0,isInstantMember:!1,reason:"Join submitted"}:{success:!0,isInstantMember:!1,reason:"Join request submitted"}}function bt(){if(we())return{forbidden:!0,reason:"Group unavailable or broken link"};const e=(document.body?document.body.innerText:"").toLowerCase();return e.includes("only admins can post")||e.includes("শুধুমাত্র অ্যাডমিনরা এই গ্রুপে পোস্ট করতে পারবেন")||e.includes("শুধুমাত্র অ্যাডমিনরা পোস্ট করতে পারবেন")||e.includes("posting is paused for this group")||e.includes("posting is turned off")||e.includes("এই গ্রুপের জন্য পোস্ট করা সাময়িকভাবে বন্ধ আছে")||e.includes("posting in this group has been paused")?{forbidden:!0,reason:"Posting is paused or admin-only in this group"}:e.includes("you can't post to this group")||e.includes("you've been temporarily blocked")||e.includes("you have been muted")||e.includes("আপনার অ্যাকাউন্ট সাময়িকভাবে ব্লক করা হয়েছে")||e.includes("আপনাকে এই গ্রুপে পোস্ট করা থেকে সাময়িকভাবে নিষিদ্ধ করা হয়েছে")?{forbidden:!0,reason:"Account restricted or muted in this group"}:{forbidden:!1,reason:""}}let mt=!1;async function M(e){if(!(mt||!(w!=null&&w.queueItem))){mt=!0,O=!1,_&&(clearInterval(_),_=null);try{window.onbeforeunload=null}catch{}console.warn(`[AGP:AutoPost] Auto-skipping group: ${e}`),I=`⚡ Auto-skipping: ${e}...`,k(),E(`⚡ Auto-skipping: ${e}...`,!0),await G(200),chrome.runtime.sendMessage({type:"SKIP_CURRENT_ITEM",payload:{itemId:w.queueItem.id,reason:e}})}}async function Dt(e,t=15e3){const n=Date.now();for(;Date.now()-n<t;){const o=[e,...Array.from(document.querySelectorAll('[role="dialog"]'))];for(const r of o){const s=Array.from(r.querySelectorAll('[role="button"], button'));for(const c of s){const i=(c.getAttribute("aria-label")||"").toLowerCase().trim(),a=(c.textContent||"").toLowerCase().trim(),l=c.getAttribute("aria-disabled")==="true"||c.disabled||c.classList.contains("aria-disabled")||c.classList.contains("disabled");if((i==="post"||i==="publish"||i==="submit"||i==="submit for review"||i==="পোস্ট"||i==="সাবমিট"||i==="পোস্ট করুন"||i==="সাবমিট করুন"||i.includes("post to group")||i.includes("গ্রুপে পোস্ট")||i.includes("submit for review")||i.includes("রিভিউ")||a==="post"||a==="পোস্ট"||a==="publish"||a==="submit"||a==="submit for review"||a==="পোস্ট করুন"||a==="সাবমিট"||a==="সাবমিট করুন"||a==="post to group"||a==="পাবলিশ"||a.includes("submit for review")||a.includes("রিভিউয়ের জন্য সাবমিট"))&&!l)return c.scrollIntoView({behavior:"instant",block:"center"}),c.style.outline="3px solid #10b981",c.dispatchEvent(new PointerEvent("pointerdown",{bubbles:!0,cancelable:!0})),c.dispatchEvent(new MouseEvent("mousedown",{bubbles:!0,cancelable:!0})),c.dispatchEvent(new PointerEvent("pointerup",{bubbles:!0,cancelable:!0})),c.dispatchEvent(new MouseEvent("mouseup",{bubbles:!0,cancelable:!0})),c.click(),!0}}await G(10)}return!1}async function Ge(){if(O||!w||!w.queueItem)return;if(we()){await M("Group unavailable on Facebook");return}if(!w.isGroupMatch){await M("Wrong group URL detected");return}if(He()||ce()){O=!0,I="⚡ Step 0/4: Auto-joining group (গ্রুপে যোগ দেওয়া হচ্ছে)...",k(),E("⚡ Auto-joining group...",!0);const t=await gt();if(t.isInstantMember)console.log("[AGP:AutoPost] Successfully auto-joined group! Proceeding with post immediately..."),I="⚡ Joined! Step 1/4: Opening Post Box...",k(),E("✅ Joined! Now opening post box...",!0);else{I=`⚡ ${t.reason}. Advancing to next group...`,k(),E(`⚡ ${t.reason}`,!0),await G(100),await M(t.reason);return}}const e=bt();if(e.forbidden){await M(e.reason);return}O=!0,I="⚡ Step 1/4: Opening Post Box...",k();try{const t=await Nt();if(!t){if(we()){await M("Group unavailable on Facebook");return}await M("Could not open Facebook post box");return}I="⚡ Step 2/4: Typing caption...",k();const n=w.caption||w.formattedPost||"";n&&n.trim()&&(await dt(t,n)||(console.warn("[AGP:AutoPost] Caption injection check returned false, but clipboard has caption. Proceeding to photos..."),E("⚠️ Caption in clipboard (Ctrl+V ready)")));const o=w.media||[],r=o.some(u=>u.includes("video")||u.includes(".mp4")||u.includes(".mov")||u.includes(".webm")||u.includes("data:video"));if(o.length>0&&(I=r?`⚡ Step 3/4: Attaching video (${o.length} files)...`:`⚡ Step 3/4: Attaching ${o.length} photos...`,k(),!await Ut(t,o))){const f=ae(t);if(f){console.warn("[AGP:AutoPost] Upload rejected by Facebook:",f),I=`❌ Upload failed: ${f}`,k(),await M(`Media rejected by Facebook: ${f}`);return}console.warn("[AGP:AutoPost] Media attachment warning - continuing post workflow")}if(I="⚡ Step 4/4: Submitting post...",k(),!await Dt(t,15e3)){const u=ae(t);u?await M(`Facebook upload error: ${u}`):await M("Post button disabled or timed out");return}I="⚡ Post submitted! Shifting to next group...",k();const i=Date.now();let a=!1;const l=3500;for(;Date.now()-i<l;){const u=se();if(!u){console.log("[AGP:AutoPost] Composer dialog closed cleanly. Post submitted successfully!"),a=!0;break}const f=ae(u);if(f){console.warn("[AGP:AutoPost] Post aborted due to Facebook file error:",f),I=`❌ Upload error: ${f}`,k(),await M(`Facebook upload error: ${f}`);return}const h=Array.from(document.querySelectorAll('[role="dialog"]'));for(const g of h){const y=(g.textContent||"").toLowerCase();if(y.includes("pending")||y.includes("approval")||y.includes("admin")||y.includes("অনুমোদনের অপেক্ষায়")||y.includes("অনুমোদন")||y.includes("সাবমিট করা হয়েছে")||y.includes("আপনার পোস্টটি জমা দেওয়া হয়েছে")){const m=Array.from(g.querySelectorAll('[role="button"], button')).find(x=>{const v=(x.textContent||"").toLowerCase().trim();return v==="done"||v==="ok"||v==="ঠিক আছে"||v==="close"||v==="বন্ধ করুন"||v==="got it"});if(m){m.click(),a=!0;break}}}if(a)break;await G(10)}if(!a){const u=se();if(u){const f=ae(u);if(f){console.warn("[AGP:AutoPost] Facebook upload error remained:",f),I=`❌ Upload failed: ${f}`,k(),await M(`Facebook upload error: ${f}`);return}if(!!u.querySelector('[aria-disabled="true"], button[disabled]')){console.warn("[AGP:AutoPost] Post button remained disabled after wait"),I="❌ Post button stayed disabled",k(),await M("Post button disabled or upload blocked by Facebook");return}}}try{window.onbeforeunload=null}catch{}I="⚡ Post submitted! Moving to next group...",k();const d=w.queueIndex,p=w.totalQueueItems,b=(w.postedCount||d-1)+1;E(`⚡ Auto-Posted to Group #${d}! (${b}/${p} done)`),chrome.runtime.sendMessage({type:"MARK_AS_POSTED",payload:{itemId:w.queueItem.id}})}catch(t){const n=t instanceof Error?t.message:String(t);console.log("[AGP:AutoPost] Routine caught error, auto-skipping:",n),await M(n||"Posting failed")}}function qt(){if(V||O||!(w!=null&&w.queueItem))return;if(we()){I="⚡ Group unavailable on Facebook. Auto-skipping...",k(),setTimeout(()=>{M("Group unavailable on Facebook")},10);return}if(!w.isGroupMatch){I="⚡ Wrong group detected. Auto-skipping to next group...",k(),E("⚠️ Wrong group detected. Auto-skipping...",!0),setTimeout(()=>{V||M("Wrong group URL detected")},20);return}if(He()||ce()){I="⚡ Not joined: Auto-joining group...",k(),E("⚡ Auto-joining group...",!0),_&&clearInterval(_),_=null,setTimeout(()=>{!V&&!O&&Ge()},0);return}const e=bt();if(e.forbidden){I=`⚡ Cannot post: ${e.reason}. Auto-skipping...`,k(),setTimeout(()=>{M(e.reason)},20);return}I="⚡ Instant Auto-Posting in progress...",k(),_&&clearInterval(_),_=null,setTimeout(()=>{!V&&!O&&Ge()},0)}function k(){var f,h,g,y,m,x,v,C,P,B,$,K,L,j,Y,Me,$e,J,q,le,ue;if(_e||!A)return;const e=X(),t=fe();if(!e.isGroupPage){const S=!!(ie!=null&&ie.isRunning),R=!!(ie!=null&&ie.isPaused),ne=0,T=0,ve=0;A.innerHTML=`
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
              Auto-Posting (${ne}/${T})
            </span>
          `:R?`
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
              ${S?'<span class="status-pill running"><span class="pulse-dot"></span> Auto-Posting</span>':R?'<span class="status-pill paused">⏸️ Paused</span>':'<span class="status-pill ready">⚡ Ready</span>'}
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
                  <span>Posting: <strong>${ne} of ${T}</strong> Groups</span>
                  <span>${ve}%</span>
                </div>
                <div class="progress-bar-bg">
                  <div class="progress-bar-fill" style="width: ${ve}%"></div>
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
                  <strong>${t.name||"Facebook User"}</strong>
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

              ${R?`
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
    `,(f=A.getElementById("agp-launcher-btn"))==null||f.addEventListener("click",Ae=>{var xt;(xt=Ae.target)!=null&&xt.closest("#agp-launcher-close")||(te=!1,k())}),(h=A.getElementById("agp-toggle-btn"))==null||h.addEventListener("click",()=>{te=!0,k()}),(g=A.getElementById("agp-close-btn"))==null||g.addEventListener("click",Ae=>{Ae.stopPropagation(),Ve()}),(y=A.getElementById("agp-launcher-close"))==null||y.addEventListener("click",Ae=>{Ae.stopPropagation(),Ve()}),(m=A.getElementById("btn-focus-tab"))==null||m.addEventListener("click",()=>{}),(x=A.getElementById("btn-pause-queue"))==null||x.addEventListener("click",()=>{chrome.runtime.sendMessage({type:"PAUSE_QUEUE"},()=>{E("Auto-posting paused"),ye()})}),(v=A.getElementById("btn-resume-queue"))==null||v.addEventListener("click",()=>{chrome.runtime.sendMessage({type:"RESUME_QUEUE"},()=>{E("Resuming auto-posting..."),ye()})}),(C=A.getElementById("btn-start-queue"))==null||C.addEventListener("click",()=>{chrome.runtime.sendMessage({type:"START_QUEUE"},()=>{E("Starting auto-posting queue..."),ye()})}),(P=A.getElementById("btn-sync-groups"))==null||P.addEventListener("click",()=>{window.location.href="https://www.facebook.com/groups/joins/?nav_source=tab"}),(B=A.getElementById("btn-open-dashboard"))==null||B.addEventListener("click",()=>{chrome.runtime.sendMessage({type:"OPEN_DASHBOARD"})});return}const n=w==null?void 0:w.group,o=w==null?void 0:w.post,r=(w==null?void 0:w.queueIndex)||1,s=(w==null?void 0:w.totalQueueItems)||1,c=(w==null?void 0:w.postedCount)??Math.max(0,r-1),i=s>0?Math.round(c/s*100):0,a=(w==null?void 0:w.formattedPost)||(o==null?void 0:o.description)||"",l=(w==null?void 0:w.caption)||(o==null?void 0:o.caption)||(o==null?void 0:o.description)||"",d=w!=null&&w.media?w.media.length:o!=null&&o.images?o.images.length:0,p=w?w.isGroupMatch:!0,b=(w==null?void 0:w.expectedGroupName)||(n==null?void 0:n.name)||"Expected Group",u=e.groupName||"Current Page";A.innerHTML=`
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
        max-height: ${Ie?"160px":"55px"};
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
            Expected: <strong>${b}</strong><br/>
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
            <span>${O?"Auto-Posting in Progress":V?"Auto-Pilot Paused":"Auto-Pilot Running"}</span>
          </div>
          <div class="autopost-status-text">${I}</div>
        </div>

        <div class="meta-row">
          <span class="group-name" title="${b}">${b}</span>
          <span class="queue-badge">Queue ${r} / ${s}</span>
        </div>

        <div class="post-card">
          <div class="post-title">${(o==null?void 0:o.productName)||(o==null?void 0:o.title)||"Prepared Listing"}</div>
          ${d>0?((o==null?void 0:o.images)||(w==null?void 0:w.media)||[]).some(S=>S.includes("video")||S.includes("data:video")||S.endsWith(".mp4")||S.endsWith(".webm")||S.endsWith(".mov"))?`<div class="media-badge" style="background:#065f46;color:#6ee7b7;border:1px solid #059669;">🎬 Video Attached (${d})</div>`:`<div class="media-badge">📷 ${d} Photos attached</div>`:""}
          <div class="post-preview">${l||a||"No prepared caption."}</div>
        </div>

        <button class="auto-btn ${O?"running":""}" id="btn-auto-post">
          ${O?"⏸️ Pause Auto-Posting":"🤖 Auto-Post Now"}
        </button>

        ${He()||ce()?`<button class="action-btn" id="btn-auto-join" style="background:#2563eb;color:#ffffff;font-weight:700;margin-top:6px;width:100%;justify-content:center;box-shadow:0 2px 4px rgba(37,99,235,0.3);">
                ➕ Auto-Join Group (গ্রুপে যোগ দিন)
              </button>`:""}

        <button class="action-btn primary-btn" id="btn-mark-posted">
          ✅ Mark Posted & Next Group
        </button>

        <div class="button-grid" style="grid-template-columns: repeat(3, minmax(0, 1fr));">
          <button class="action-btn" id="btn-toggle-caption">
            ${Ie?"Collapse":"👁️ View"}
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
  `,($=A.getElementById("agp-toggle-btn"))==null||$.addEventListener("click",()=>{te=!te,k()}),(K=A.getElementById("agp-close-btn"))==null||K.addEventListener("click",S=>{S.stopPropagation(),Ve()}),(L=A.getElementById("btn-auto-post"))==null||L.addEventListener("click",()=>{O?(V=!0,O=!1,I="Auto-posting paused by user",_&&clearInterval(_),E("Auto-posting paused"),k()):(V=!1,_&&clearInterval(_),Ge())}),(j=A.getElementById("btn-auto-join"))==null||j.addEventListener("click",async()=>{const S=A==null?void 0:A.getElementById("btn-auto-join");S&&(S.textContent="⏳ Joining..."),(await gt()).isInstantMember&&Ge()}),(Y=A.getElementById("btn-toggle-caption"))==null||Y.addEventListener("click",()=>{Ie=!Ie,k()}),(Me=A.getElementById("btn-copy-caption"))==null||Me.addEventListener("click",async()=>{const R=Re(l||a).replace(/\r\n/g,`
`).replace(/\r/g,`
`).trim(),ne=qe(R);await ut(R,ne)&&E("📋 Caption & Design copied (Ctrl+V ready)!")}),($e=A.getElementById("btn-paste-caption"))==null||$e.addEventListener("click",async()=>{const R=Re(l||a).replace(/\r\n/g,`
`).replace(/\r/g,`
`).trim(),ne=document.querySelector('[role="dialog"]')||document.body;E("✨ Pasting caption with exact styling..."),await dt(ne,R)?E("✅ Caption pasted with exact design!"):E("⚠️ Click inside post box and press Ctrl+V",!0)}),(J=A.getElementById("btn-mark-posted"))==null||J.addEventListener("click",()=>{var S;_&&clearInterval(_);try{window.onbeforeunload=null}catch{}chrome.runtime.sendMessage({type:"MARK_AS_POSTED",payload:{itemId:(S=w==null?void 0:w.queueItem)==null?void 0:S.id}},()=>{E("Marked as Posted! Moving to next group...")})}),(q=A.getElementById("btn-skip"))==null||q.addEventListener("click",()=>{var S;_&&clearInterval(_);try{window.onbeforeunload=null}catch{}chrome.runtime.sendMessage({type:"SKIP_CURRENT_ITEM",payload:{itemId:(S=w==null?void 0:w.queueItem)==null?void 0:S.id,reason:"Skipped by user"}},()=>{E("Skipped group. Moving to next...")})}),(le=A.getElementById("btn-pause"))==null||le.addEventListener("click",()=>{_&&clearInterval(_),V=!0,O=!1,chrome.runtime.sendMessage({type:"PAUSE_QUEUE"},()=>{E("Posting Session Paused")})}),(ue=A.getElementById("btn-open-dashboard"))==null||ue.addEventListener("click",()=>{chrome.runtime.sendMessage({type:"OPEN_DASHBOARD"})})}function Bt(){_e||(H||(H=document.createElement("div"),H.id="ai-group-poster-dock-root",document.body.appendChild(H),A=H.attachShadow({mode:"open"})),k())}function ye(){var n;if(_e)return;const e=X(),t=fe();t.isLoggedIn&&chrome.runtime.sendMessage({type:"FB_USER_PROFILE_DETECTED",payload:t}),e.isGroupPage?(chrome.runtime.sendMessage({type:"FB_PAGE_DETECTED",payload:{url:e.canonicalUrl,groupIdOrSlug:e.groupIdOrSlug,pageTitle:e.groupName}}),chrome.runtime.sendMessage({type:"GET_ACTIVE_POST_FOR_TAB",payload:{url:e.canonicalUrl}},o=>{chrome.runtime.lastError||o!=null&&o.isUserTab||o&&o.payload&&(w=o.payload,Bt(),w&&w.queueItem&&qt())})):Lt()&&(console.log("[AGP:Content] Facebook Group Search Page detected."),Je(),typeof chrome<"u"&&((n=chrome.storage)!=null&&n.local)&&chrome.storage.local.get(["agp_pending_auto_join","agp_auto_join_config"],o=>{const r=o==null?void 0:o.agp_pending_auto_join,s=o==null?void 0:o.agp_auto_join_config;if(r&&r.active&&Date.now()-(r.requestedAt||0)<9e4){console.log("[AGP:Content] Detected pending Auto-Join request. Starting auto-joiner..."),chrome.storage.local.remove("agp_pending_auto_join");const c=r.config||s||{searchUrl:window.location.href,delaySec:0,maxGroups:0,autoAnswerQuestions:!0,defaultAnswer:"Yes, I agree to the group rules and guidelines.",saveToGroups:!0};Je(c),setTimeout(()=>{U.getInstance().start(c)},1500)}}))}function jt(){if(typeof document>"u"||!document.body)return;const e=document.getElementById("agp-sync-window-overlay");e&&e.remove();const t=document.createElement("div");t.id="agp-sync-window-overlay",t.innerHTML=`
    <div style="font-weight: 800; font-size: 14px; margin-bottom: 4px; color: #ffffff; letter-spacing: -0.2px;">
      Syncing your Facebook groups
    </div>
    <div style="font-size: 12px; color: #cbd5e1; margin-bottom: 2px; font-weight: 500;">
      Please keep this window open and visible.
    </div>
    <div style="font-size: 11px; color: #94a3b8;">
      It will scroll automatically and close when done.
    </div>
  `,t.style.cssText=`
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
  `,document.body.appendChild(t)}function Ke(){const e=document.getElementById("agp-sync-window-overlay");e&&e.remove()}let Te=null;chrome.runtime.onMessage.addListener((e,t,n)=>{if(e.type==="START_GROUP_DISCOVERY")return(async()=>{try{console.log("[AGP:Content] Starting deep group discovery scan on current Facebook page...");const o=fe(),r=o.userId||o.name||void 0;jt(),ht();const s=await Ze({maxRounds:350,stagnantLimit:25,scrollDelayMs:75,accountContext:r,onBatchDiscovered:async(l,d,p)=>{Te=p;const b=Le(),u=[...l];for(const f of b)u.find(h=>h.groupId.toLowerCase()===f.groupId.toLowerCase())||u.push(f);try{chrome.runtime.sendMessage({type:"GROUP_BATCH_DISCOVERED",payload:{liveGroups:u,verifiedCount:u.length,duplicatesRemoved:(p==null?void 0:p.duplicatesRemoved)||0,debugMetrics:p}})}catch{}try{await Ce(u,{syncMode:"merge",accountContext:r})}catch(f){console.warn("[AGP:Content] Progressive batch merge error:",f)}},onProgress:(l,d,p,b)=>{Te=b;const u=z.size,f=Math.max(l,u);try{chrome.runtime.sendMessage({type:"GROUP_DISCOVERY_PROGRESS",payload:{foundCount:f,status:d,targetCount:p,debugMetrics:b}})}catch{}}}),c=Le();if(c.length>0)try{await Ce(c,{syncMode:"merge",accountContext:r})}catch{}const i=[...s.groups];for(const l of c)i.find(d=>d.groupId.toLowerCase()===l.groupId.toLowerCase())||i.push(l);const a=Math.max(s.totalFound,i.length);Te=s.debugMetrics,Ke(),n({success:!0,payload:{groups:i,sourceUrl:window.location.href,isLoggedIn:s.isLoggedIn,totalFoundOnPage:a,profile:o,outcome:s.outcome,completionReason:s.completionReason,isPartial:s.isPartial,debugMetrics:s.debugMetrics}})}catch(o){Ke();const r=o instanceof Error?o.message:String(o);n({success:!1,error:r})}})(),!0;if(e.type==="CANCEL_GROUP_DISCOVERY")return Ke(),E("AI Group Poster: Discovery cancelled.",!0),n({success:!0}),!1;if(e.type==="GET_DEBUG_METRICS")return n({success:!0,debugMetrics:Te}),!1;if(e.type==="CHECK_FACEBOOK_SESSION"){const o=ke(),r=fe();return n({success:!0,isLoggedIn:o,profile:r,currentUrl:window.location.href}),!1}if(e.type==="GET_FACEBOOK_USER_INFO")return(async()=>{try{const o=ke(),r=fe();let c=Oe(r.userId||r.name||void 0).items;n({success:!0,isLoggedIn:o,profile:r,groups:c,totalGroups:c.length,currentUrl:window.location.href})}catch(o){const r=o instanceof Error?o.message:String(o);n({success:!1,error:r})}})(),!0;if(e.type==="START_AUTO_JOIN"||e.type==="AUTO_JOIN_START_ON_PAGE")return(async()=>{try{const o=e.payload||{},r={...o,delaySec:typeof o.delaySec=="number"?o.delaySec:0};Je(r);const s=await U.getInstance().start(r);n({success:!0,state:s})}catch(o){const r=o instanceof Error?o.message:String(o);n({success:!1,error:r})}})(),!0;if(e.type==="PAUSE_AUTO_JOIN"||e.type==="AUTO_JOIN_PAUSE_ON_PAGE")return U.getInstance().pause(),n({success:!0}),!1;if(e.type==="RESUME_AUTO_JOIN"||e.type==="AUTO_JOIN_RESUME_ON_PAGE")return U.getInstance().resume(),n({success:!0}),!1;if(e.type==="STOP_AUTO_JOIN"||e.type==="AUTO_JOIN_STOP_ON_PAGE")return U.getInstance().stop(),n({success:!0}),!1;if(e.type==="GET_AUTO_JOIN_STATE"){const o=U.getInstance().getState();return n({success:!0,state:o}),!1}});let Ye=!1,z=new Map;function ht(){if(typeof window>"u"||window.__agpFetchIntercepted)return;window.__agpFetchIntercepted=!0;const e=window.fetch;window.fetch=async function(...t){var o;const n=await e.apply(this,t);try{const r=typeof t[0]=="string"?t[0]:((o=t[0])==null?void 0:o.url)||"";(r.includes("/api/graphql")||r.includes("graphql"))&&n.clone().text().then(c=>{c.includes("Group")&&(c.includes("/groups/")||c.includes('__typename":"Group"'))&&Ft(c)}).catch(()=>{})}catch{}return n},console.log("[AGP:Content] GraphQL response interceptor installed")}function Ft(e){try{const t=/"__typename"\s*:\s*"Group"[^}]*?"id"\s*:\s*"(\d+)"[^}]*?"name"\s*:\s*"([^"]+)"/g;let n;for(;(n=t.exec(e))!==null;){const r=n[1],s=n[2].trim();r&&s&&s.length>=2&&z.set(r,{name:s,id:r})}const o=/"node"\s*:\s*\{\s*"__typename"\s*:\s*"Group"\s*,\s*"id"\s*:\s*"(\d+)"\s*,\s*"name"\s*:\s*"([^"]+)"/g;for(;(n=o.exec(e))!==null;){const r=n[1],s=n[2].trim();r&&s&&s.length>=2&&z.set(r,{name:s,id:r})}z.size>0&&console.log(`[AGP:Content] GraphQL interceptor: total ${z.size} groups captured`)}catch{}}function Le(){const e=[];for(const[t,n]of z)e.push({name:n.name,url:`https://www.facebook.com/groups/${t}/`,groupId:t,privacy:"UNKNOWN",imageUrl:n.imageUrl});return e}async function wt(){const e=window.location.href.toLowerCase();if((e.includes("/groups/joins")||e.includes("category=membership"))&&!Ye){Ye=!0,console.log("[AGP:Content] Detected Your Groups page (/groups/joins/)! Starting full auto-scan of all joined groups..."),E("AI Group Poster: Auto-scanning your joined groups..."),ht();try{const t=await Ze({maxRounds:350,stagnantLimit:25,scrollDelayMs:75,onBatchDiscovered:async(r,s)=>{const c=Le(),i=[...r];for(const a of c)i.find(l=>l.groupId===a.groupId)||i.push(a);try{await Ce(i,{syncMode:"merge"})}catch(a){console.warn("[AGP:Content] Batch save err:",a)}},onProgress:(r,s,c)=>{const i=z.size,a=Math.max(r,i);E(`AI Group Poster: Found ${a}${c?` / ${c}`:""} groups...`);try{chrome.runtime.sendMessage({type:"GROUP_DISCOVERY_PROGRESS",payload:{foundCount:a,status:s,targetCount:c}})}catch{}}}),n=Le();if(n.length>0)try{await Ce(n,{syncMode:"merge"}),console.log(`[AGP:Content] Final merge: added ${n.length} intercepted groups`)}catch{}const o=Math.max(t.totalFound,z.size);E(`AI Group Poster: Sync complete! Found ${o} groups.`)}catch(t){console.warn("[AGP:Content] Auto-scan err:",t)}finally{Ye=!1}}}window.addEventListener("message",e=>{if(!(e.source!==window||!e.data)){if(e.data.type==="AGP_MAIN_GRAPHQL_GROUPS"&&Array.isArray(e.data.groups)){for(const t of e.data.groups)t.id&&t.name&&z.set(t.id,{name:t.name,id:t.id});console.log(`[AGP:Content] Intercepted ${z.size} groups from MAIN world GraphQL`)}e.data.type==="AGP_MAIN_URL_CHANGED"&&xe()}}),chrome.runtime.onMessage.addListener(e=>{e&&e.type==="AGP_NAVIGATE_TO_GROUP"&&xe()}),ye(),setTimeout(wt,100);let yt=window.location.href;function xe(){window.location.href!==yt&&(yt=window.location.href,ye(),setTimeout(wt,100))}window.addEventListener("popstate",xe,{passive:!0}),window.addEventListener("hashchange",xe,{passive:!0}),setInterval(xe,40),setInterval(()=>{if(O||w&&w.queueItem)try{chrome.runtime.sendMessage({type:"KEEPALIVE_PING"},()=>{chrome.runtime.lastError})}catch{}},1e4)})();
