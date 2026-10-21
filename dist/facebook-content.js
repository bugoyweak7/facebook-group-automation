var Bt=Object.defineProperty;var jt=(X,B,ee)=>B in X?Bt(X,B,{enumerable:!0,configurable:!0,writable:!0,value:ee}):X[B]=ee;var Z=(X,B,ee)=>jt(X,typeof B!="symbol"?B+"":B,ee);(function(){"use strict";function X(t){const e=[];if(!t||typeof t!="string")return{valid:!1,errors:["URL is required"]};const n=t.trim();if(!n)return{valid:!1,errors:["URL cannot be empty"]};let o=n;/^https?:\/\//i.test(o)||(o="https://"+o);let i;try{i=new URL(o)}catch{return{valid:!1,errors:["Invalid URL format"]}}const s=["facebook.com","www.facebook.com","web.facebook.com","m.facebook.com"],l=i.hostname.toLowerCase();s.some(w=>l===w||l.endsWith("."+w))||e.push("URL must be a Facebook domain (e.g. facebook.com, web.facebook.com)");const a=i.pathname.split("/").filter(Boolean),c=a.indexOf("groups");if(c===-1||c>=a.length-1)return e.push("URL must point directly to a Facebook group (e.g. /groups/group_name)"),{valid:!1,errors:e};const d=decodeURIComponent(a[c+1]);if(!d||["feed","discover","joins","about","settings","notifications","search","categories","create","help","privacy","support"].includes(d.toLowerCase()))return e.push("URL must point to a specific group, not a feed or discovery page"),{valid:!1,errors:e};const b=a.slice(c+2).map(w=>w.toLowerCase()),u=["permalink","posts","user","photos","videos","events","files","stories"];if(b.some(w=>u.includes(w)))return e.push("URL points to an individual post or permalink inside a group, not the group itself"),{valid:!1,errors:e};if(i.searchParams.has("comment_id")||i.searchParams.has("notif_id")||i.searchParams.has("notif_t"))return e.push("URL is a notification or comment permalink, not a group page"),{valid:!1,errors:e};const f=`https://www.facebook.com/groups/${d}/`;return{valid:e.length===0,errors:e,cleanUrl:f,groupId:d}}const B={META_OG_TITLE:'meta[property="og:title"]',HEADER_H1:'h1[dir="auto"], h1 span'};function ee(){if(typeof window>"u")return{isGroupPage:!1,groupIdOrSlug:"",groupName:"",canonicalUrl:"",isReady:!1};const t=window.location.href,e=X(t);if(!e.valid||!e.groupId)return{isGroupPage:!1,groupIdOrSlug:"",groupName:"",canonicalUrl:t,isReady:!1};let n="";const o=document.querySelector(B.META_OG_TITLE);if(o&&o.content&&(n=o.content.replace(/\s*\|\s*Facebook.*$/i,"").trim()),!n){const s=document.querySelector(B.HEADER_H1);s&&s.innerText&&(n=s.innerText.trim())}!n&&document.title&&(n=document.title.replace(/\s*\|\s*Facebook.*$/i,"").trim()),n||(n=e.groupId.replace(/[-_.]+/g," "),n=n.charAt(0).toUpperCase()+n.slice(1));const i=document.readyState==="interactive"||document.readyState==="complete";return{isGroupPage:!0,groupIdOrSlug:e.groupId,groupName:n,canonicalUrl:e.cleanUrl||t,isReady:i}}const he=new Set(["feed","discover","create","notifications","search","categories","joins","member-requests","expert_badge","settings","about","events","media","files","chats","manage","canvas","support","buy_sell_discussion","permalink","user","profile.php","hashtag","messages","marketplace","stories","reels","watch","gaming","members","photos","videos","posts"]),ce=new Set(["view group","visit","open","view","join","group","groups","view all","see all","see more","গ্রুপ দেখুন","দেখুন","সব দেখুন","যোগ দিন","গ্রুপে যান","আরও দেখুন"]);function ht(t){const e={"০":"0","১":"1","২":"2","৩":"3","৪":"4","৫":"5","৬":"6","৭":"7","৮":"8","৯":"9"};return t.replace(/[০-৯]/g,n=>e[n]||n)}function wt(t){if(typeof document>"u")return{count:null,status:"UNAVAILABLE",rawText:""};const n=Array.from(document.querySelectorAll('h1, h2, h3, h4, span[dir="auto"], strong, div, p')),o=[/(?:All groups you['’]?ve joined|Groups you['’]?ve joined)\s*\(([0-9,kKmM\u09E6-\u09EF.]+)\)/i,/(?:আপনার যোগ দেওয়া সমস্ত গ্রুপ|আপনার যোগ দেওয়া সব গ্রুপ|আপনি যেসব গ্রুপে যোগ দিয়েছেন|যোগ দেওয়া সমস্ত গ্রুপ|যোগ দেওয়া সব গ্রুপ|যোগ দেওয়া গ্রুপ|সব গ্রুপ)\s*\(([0-9,kKmM\u09E6-\u09EF.]+)\)/i,/^All groups you['’]?ve joined\s*[:\-•]?\s*([0-9,kKmM\u09E6-\u09EF.]+)$/i],i=[/(?:Joined Groups|Your Groups|আমার গ্রুপ)\s*\(([0-9,kKmM\u09E6-\u09EF.]+)\)/i,/(?:Groups|গ্রুপ)\s*\(([0-9,kKmM\u09E6-\u09EF.]+)\)/i],s=l=>{const r=ht(l).replace(/,/g,"").trim().toLowerCase();if(r.endsWith("k")){const c=parseFloat(r.replace("k",""));return isNaN(c)?null:Math.round(c*1e3)}if(r.endsWith("m")){const c=parseFloat(r.replace("m",""));return isNaN(c)?null:Math.round(c*1e6)}const a=parseInt(r,10);return isNaN(a)?null:a};for(const l of n){const r=(l.textContent||"").trim();if(!(r.length>120||r.length<3))for(const a of o){const c=r.match(a);if(c&&c[1]){const d=s(c[1]);if(d!==null&&d>0)return{count:d,status:"CONFIRMED",rawText:r}}}}for(const l of n){const r=(l.textContent||"").trim();if(!(r.length>80||r.length<3))for(const a of i){const c=r.match(a);if(c&&c[1]){const d=s(c[1]);if(d!==null&&d>0)return{count:d,status:"UNCERTAIN",rawText:r}}}}return{count:null,status:"UNAVAILABLE",rawText:""}}function yt(t=document){const e=["end of results","no more groups to show","you’ve reached the end","you've reached the end","সব গ্রুপ দেখানো হয়েছে","ফলাফলের সমাপ্তি"],n=t.querySelectorAll('div[role="status"], span[dir="auto"], div, p');for(const o of n){const i=(o.textContent||"").trim().toLowerCase();if(!(i.length>100||i.length<5)){for(const s of e)if(i.includes(s))return!0}}return!1}function le(t){if(!t)return"";let e=t.trim();return e=e.replace(/^(?:Visit|Open|View|গ্রুপ দেখুন|দেখুন)\s+/i,""),e=e.replace(/\s*(?:Last active|You last visited|last visited|active)\s+[^\n]+/i,""),e=e.replace(/\s*(?:গত|আগে|মিনিট আগে|ঘণ্টা আগে|দিন আগে)[^\n]*/i,""),e=e.replace(/\s*·\s*(?:Public group|Private group|পাবলিক গ্রুপ|প্রাইভেট গ্রুপ).*$/i,""),e=e.replace(/\s*·\s*\d+.*members.*$/i,""),e=e.replace(/\s*·\s*[০-৯\d]+.*সদস্য.*$/i,""),e=e.replace(/\s*·\s*[^\n]+/i,""),e.trim()}function xt(t){var p,b;const e=u=>({valid:!1,reason:u,name:"",url:"",groupId:"",privacy:"UNKNOWN"}),n=t.href||t.getAttribute("href")||"";if(!n||!n.includes("/groups/"))return e("Not a group link");if(n.includes("/permalink/")||n.includes("/posts/")||n.includes("/photos/")||n.includes("/videos/")||n.includes("comment_id=")||n.includes("notif_id="))return e("Post or photo permalink, not a group home");let o="";try{const f=new URL(n,"https://www.facebook.com").pathname.split("/").filter(Boolean),w=f.indexOf("groups");if(w!==-1&&f[w+1]&&(o=f[w+1],f.length>w+2)){const g=f[w+2].toLowerCase();if(["posts","permalink","photos","videos","user","media"].includes(g))return e("Post or photo permalink, not a group home")}}catch{return e("Malformed URL")}if(!o||he.has(o.toLowerCase()))return e("Non-group system path");if(t.closest('[aria-label*="Notification" i], [aria-label*="বিজ্ঞপ্তি" i], [data-pagelet*="Notification" i]'))return e("Inside notification flyout");const i=t.closest('div[role="listitem"], div[role="article"], div[role="gridcell"], li, div[role="row"]')||((p=t.parentElement)==null?void 0:p.parentElement)||t.parentElement;if(i){const u=(i.textContent||"").toLowerCase();if(u.includes("sponsored")||u.includes("বিজ্ঞাপন")||i.querySelector('[aria-label*="Sponsored" i], [aria-label*="বিজ্ঞাপন" i]'))return e("Sponsored advertisement");if((i.querySelectorAll?Array.from(i.querySelectorAll('a[href*="/groups/"]')):[]).length<=4){if(u.includes("requested to join")||u.includes("অনুরোধ পাঠানো হয়েছে")||u.includes("answer questions")||u.includes("update responses")||u.includes("suggested for you")||u.includes("আপনার জন্য প্রস্তাবিত")||u.includes("suggested groups")||u.includes("প্রস্তাবিত গ্রুপ"))return e("Unjoined or suggested group");if(i.querySelectorAll){const g=Array.from(i.querySelectorAll('button, [role="button"]'));for(const y of g){const m=(y.textContent||y.getAttribute("aria-label")||"").trim().toLowerCase();if((m==="join"||m==="join group"||m==="যোগ দিন"||m==="গ্রুপে যোগ দিন"||m==="request to join")&&!u.includes("view group")&&!u.includes("গ্রুপ দেখুন")&&!u.includes("visited")&&!u.includes("last active"))return e("Card has Join button, not joined")}}}}let s="";const l=(t.getAttribute("aria-label")||"").trim();if(l&&l.length>=2&&!ce.has(l.toLowerCase())&&(s=le(l)),!s){const u=(t.textContent||t.innerText||"").trim(),f=le(u);f&&f.length>=2&&!ce.has(f.toLowerCase())&&(s=f)}if(!s){const u=Array.from(t.querySelectorAll('h1, h2, h3, h4, span[dir="auto"], strong, span'));for(const f of u){const w=le((f.textContent||"").trim()),g=w.toLowerCase();if(w.length>=2&&!ce.has(g)&&!g.includes("last active")&&!g.includes("you last visited")&&!g.includes("members")&&!g.includes("সদস্য")&&!g.includes("ago")){s=w;break}}}if(!s&&i){const u=i.querySelector('h1, h2, h3, h4, [role="heading"]');if(u&&u.textContent){const f=le(u.textContent.trim());f.length>=2&&!ce.has(f.toLowerCase())&&(s=f)}}if(!s&&i){const u=Array.from(i.querySelectorAll('h1, h2, h3, h4, span[dir="auto"], strong, a[href*="/groups/"] > span'));for(const f of u){if(f===t)continue;const w=le((f.textContent||"").trim()),g=w.toLowerCase();if(w.length>=2&&w.length<200&&!ce.has(g)&&!g.includes("view group")&&!g.includes("you last visited")&&!g.includes("last active")&&!g.includes("members")&&!g.includes("সদস্য")&&!g.includes("hours ago")&&!g.includes("minutes ago")&&!g.includes("days ago")&&!g.includes("ঘণ্টা আগে")&&!g.includes("দিন আগে")&&!/^\d+ (hours?|minutes?|days?|weeks?) ago$/i.test(g)){s=w;break}}}s||(s=o.split(/[-_.]+/).filter(Boolean).map(u=>u.charAt(0).toUpperCase()+u.slice(1)).join(" "));let r="";const a=i!=null&&i.querySelector?i.querySelector("img, image")||t.querySelector("img, image"):null;a&&(r=a.getAttribute("src")||a.getAttribute("href")||((b=a.href)==null?void 0:b.baseVal)||"",(r.includes("/rsrc.php/")||r.includes("spacer")||r.includes("1x1"))&&(r=""));let c="UNKNOWN";const d=u=>{const f=(u||"").toLowerCase();return f.includes("public group")||f.includes("পাবলিক গ্রুপ")||f.includes("public")||f.includes("পাবলিক")?"PUBLIC":f.includes("private group")||f.includes("প্রাইভেট গ্রুপ")||f.includes("private")||f.includes("প্রাইভেট")?"PRIVATE":"UNKNOWN"};if(i){const u=d(i.textContent||"");if(u!=="UNKNOWN")c=u;else if(i.querySelectorAll){const f=Array.from(i.querySelectorAll("span, div, p"));for(const w of f){const g=d(w.textContent||"");if(g!=="UNKNOWN"){c=g;break}}}}return c==="UNKNOWN"&&(c=d(t.textContent||"")),{valid:!0,name:s,url:`https://www.facebook.com/groups/${o}/`,groupId:o,imageUrl:r,privacy:c}}function we(){if(typeof document>"u")return!1;const t=typeof window<"u"?window.location.href:"";if(t.includes("/login")||t.includes("/recover")||t.includes("/checkpoint"))return!1;const e=document.body&&(document.body.innerText||document.body.textContent)||"";return e.includes("What's on your mind")||e.includes("আপনার মনে কী আছে")||e.includes("কী ভাবছেন")||e.includes("Professional dashboard")||e.includes("Ads Manager")||e.includes("Meta Business Suite")?!0:!!document.querySelector('[role="navigation"], [data-pagelet="LeftRail"], [aria-label="Facebook"], input[placeholder*="Search" i], [aria-label*="profile" i], [aria-label*="Account" i], a[href*="/me/"], a[href*="/groups/"]')||!!(document.cookie&&document.cookie.includes("c_user"))}function ue(){var r,a;if(typeof document>"u")return{isLoggedIn:!1,name:"",profileUrl:""};let t="",e="",n="",o="";if(document.body){const d=(document.body.innerText||document.body.textContent||"").match(/(?:What['’]s on your mind|আপনার মনে কী আছে|কী ভাবছেন)[,?\s]+([^?!\n]+?)(?:\?|$)/i);if(d&&d[1]){const p=d[1].trim().replace(/[?,!]+$/,"").trim();p.length>=2&&p.length<=50&&!p.toLowerCase().includes("facebook")&&(t=p)}}const i=Array.from(document.querySelectorAll('a[href*="/me/"], a[href*="facebook.com/profile"], [role="navigation"] a[href]'));for(const c of i){const d=c.getAttribute("href")||c.href||"",p=c.querySelector('span[dir="auto"], span, strong, h1'),b=(p?p.textContent:c.innerText||c.textContent||"").trim();if(b&&b.length>=2&&b.length<=35&&!["Home","Friends","Feeds","Groups","Watch","Marketplace","Memories","Saved","Video","Settings","Meta AI","Professional dashboard","Ads Manager","Ad Center","Meta Business Suite","See more","See all","Facebook","Menu","Notifications"].includes(b)){t||(t=b),!e&&d&&(e=d);const f=c.querySelector("image, img");if(f&&!n&&(n=f.getAttribute("src")||((r=f.href)==null?void 0:r.baseVal)||""),t)break}}const s=document.querySelector('[aria-label="Your profile" i], [aria-label*="Your profile" i], [aria-label*="Account Controls" i], [aria-label*="আপনার প্রোফাইল" i]');if(s&&!n){const c=s.querySelector("image, img");c&&(n=c.getAttribute("src")||((a=c.href)==null?void 0:a.baseVal)||"")}try{const c=Array.from(document.querySelectorAll("script"));for(const d of c){const p=d.textContent||"";if(p.includes('"NAME":')||p.includes('"USER_ID":')||p.includes('"short_name":')){const b=p.match(/"NAME":\s*"([^"]+)"/)||p.match(/"short_name":\s*"([^"]+)"/);if(b&&b[1]&&!t)try{t=JSON.parse(`"${b[1]}"`)}catch{t=b[1]}const u=p.match(/"USER_ID":\s*"(\d+)"/);if(u&&u[1]&&!o&&(o=u[1]),t)break}}}catch{}if(!o&&document.cookie){const c=document.cookie.match(/c_user=(\d+)/);c&&(o=c[1])}const l=we()||!!(t||o);return{isLoggedIn:l,name:t||(l?"Facebook User":""),profileUrl:e||"https://www.facebook.com",avatarUrl:n,userId:o}}function vt(t){if(typeof document>"u")return[];const e=new Map,n=Date.now();try{const o=Array.from(document.querySelectorAll("script"));for(const i of o){const s=i.textContent||"";if(s.length<40)continue;const l=[/"__typename"\s*:\s*"Group"[\s\S]{0,500}?"id"\s*:\s*"(\d+)"[\s\S]{0,500}?"name"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/g,/"__typename"\s*:\s*"Group"[\s\S]{0,500}?"name"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"[\s\S]{0,500}?"id"\s*:\s*"(\d+)"/g,/"node"\s*:\s*\{[\s\S]{0,120}?"__typename"\s*:\s*"Group"[\s\S]{0,350}?"id"\s*:\s*"(\d+)"[\s\S]{0,350}?"name"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/g,/"node"\s*:\s*\{[\s\S]{0,120}?"__typename"\s*:\s*"Group"[\s\S]{0,350}?"name"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"[\s\S]{0,350}?"id"\s*:\s*"(\d+)"/g,/\{"id"\s*:\s*"(\d+)"[\s\S]{0,300}?"name"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"[\s\S]{0,300}?(?:"__typename"\s*:\s*"Group"|url"\s*:\s*"https:[^"]*?\/groups\/[^"]+?")/g,/\{"name"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"[\s\S]{0,300}?"id"\s*:\s*"(\d+)"[\s\S]{0,300}?(?:"__typename"\s*:\s*"Group"|url"\s*:\s*"https:[^"]*?\/groups\/[^"]+?")/g];for(const r of l){let a;for(;(a=r.exec(s))!==null;){let c="",d="";if(/^\d+$/.test(a[1])?(c=a[1],d=a[2]):/^\d+$/.test(a[2])&&(c=a[2],d=a[1]),c&&d){d=d.trim();try{d=d.replace(/\\u[\dA-Fa-f]{4}/g,b=>String.fromCharCode(parseInt(b.replace("\\u",""),16)))}catch{}const p=s.slice(Math.max(0,a.index-350),Math.min(s.length,a.index+600));if(p.includes('"__typename":"User"')||p.includes('"__typename":"Actor"')||p.includes('"__typename":"Story"')||p.includes('"__typename":"Comment"')||p.includes('"__typename":"Page"')||t&&d.toLowerCase()===t.toLowerCase())continue;if(d.length>=2&&!e.has(c)){let b="";const f=s.slice(Math.max(0,a.index-500),Math.min(s.length,a.index+1e3)).match(/"(?:uri|url|cover_photo|image)"\s*:\s*\{[^}]*"uri"\s*:\s*"([^"]+)"/);if(f&&f[1]){let w=f[1];try{w=w.replace(/\\u[\dA-Fa-f]{4}/g,g=>String.fromCharCode(parseInt(g.replace("\\u",""),16)))}catch{}!w.includes("/rsrc.php/")&&!w.includes("1x1")&&(b=w.replace(/\\\//g,"/"))}e.set(c,{name:Ye(d,c),url:`https://www.facebook.com/groups/${c}/`,groupId:c,privacy:"UNKNOWN",imageUrl:b,verified:!0,source:"facebook-ui",accountContext:t,discoveredAt:n})}}}}}}catch(o){console.warn("[AGP:Discovery] Script tags extraction warning:",o)}return Array.from(e.values())}function Le(t){if(typeof document>"u")return{items:[],rejectedCount:0};const e=new Map;let n=0;const o=Date.now(),i=vt(t);for(const l of i)e.set(l.groupId.toLowerCase(),l);const s=Array.from(document.querySelectorAll('a[href*="/groups/"]'));for(const l of s){const r=xt(l);if(!r.valid||!r.name||!r.url||!r.groupId){n++;continue}const a=r.groupId.toLowerCase(),c=e.get(a);c?(!c.imageUrl&&r.imageUrl&&(c.imageUrl=r.imageUrl),r.name&&c.name.length<r.name.length&&(c.name=r.name),r.privacy!=="UNKNOWN"&&(c.privacy=r.privacy)):e.set(a,{name:r.name,url:r.url,groupId:r.groupId,privacy:r.privacy,imageUrl:r.imageUrl,verified:!0,source:"facebook-ui",accountContext:t,discoveredAt:o})}return{items:Array.from(e.values()),rejectedCount:n}}function He(){if(typeof document>"u")return 0;let t=0;const e=Array.from(document.querySelectorAll('div[role="button"], button, span[dir="auto"], [role="navigation"] [role="button"], [data-pagelet="LeftRail"] [role="button"]'));for(const n of e){const o=(n.textContent||n.getAttribute("aria-label")||"").trim().toLowerCase();if(o==="see more"||o==="আরও দেখুন"||o==="see all"||o==="সব দেখুন"||o==="see all groups"||o==="সব গ্রুপ দেখুন"||o==="view more")try{(n.closest('[role="button"], button')||n).click(),t++}catch{}}return t}async function Ke(t={}){var m,x,v,T,_,j;const e=t.maxRounds||350,n=t.stagnantLimit||35,o=t.scrollDelayMs!==void 0?t.scrollDelayMs:900,i=t.accountContext,s=Date.now(),l=we(),r=new Map;let a=0,c=0,d=0,p=0;const b=wt(),u=b.count,f=b.status;console.log(`[AGP:Engine] Discovery started. Target count: ${u??"N/A"} (Status: ${f})`);const w=$=>({candidateCount:r.size+c,verifiedCount:r.size,duplicatesRemoved:a,rejectedCount:c,scrollIterations:p,mutationEvents:d,targetCount:u,targetCountStatus:f,completionReason:$,scanDurationMs:Date.now()-s,lastNewGroupTimestamp:r.size>0?Date.now():null}),g=$=>{let K=0;for(const L of $){const q=L.groupId.toLowerCase();r.has(q)?a++:(r.set(q,L),K++)}return K};let y=null;typeof MutationObserver<"u"&&typeof document<"u"&&(y=new MutationObserver($=>{d+=$.length}),y.observe(document.body||document.documentElement,{childList:!0,subtree:!0}));try{try{He()}catch{}const $=Le(i);if(c+=$.rejectedCount,g($.items)>0&&t.onBatchDiscovered)try{await t.onBatchDiscovered(Array.from(r.values()),r.size,w(null))}catch{}if(t.onProgress){const F=u?`Found ${r.size} of ${u} groups...`:`Found ${r.size} groups...`;t.onProgress(r.size,F,u,w(null))}if(f==="CONFIRMED"&&u!==null&&r.size>=u){const F=w("TARGET_REACHED");return console.log(`[AGP:Engine] Target count of ${u} confirmed on initial scan.`),{isLoggedIn:l,groups:Array.from(r.values()),totalFound:r.size,targetCount:u,isPartial:!1,outcome:"COMPLETE",completionReason:"TARGET_REACHED",debugMetrics:F}}let L=0,q="PARTIAL",Y="STAGNANT_TIMEOUT";for(let F=0;F<e;F++){if(p++,F%3===0)try{He()}catch{}const D=Array.from(document.querySelectorAll('a[href*="/groups/"]'));if(D.length>0){const G=D[D.length-1];try{G.scrollIntoView({block:"end",inline:"nearest",behavior:"smooth"})}catch{}}const ae=document.querySelector('[role="main"], [data-pagelet*="Group"]');if(ae&&ae.lastElementChild)try{ae.lastElementChild.scrollIntoView({block:"end",behavior:"smooth"})}catch{}const k=Math.max(((m=document.documentElement)==null?void 0:m.scrollHeight)||0,((x=document.scrollingElement)==null?void 0:x.scrollHeight)||0,((v=document.body)==null?void 0:v.scrollHeight)||0);window.scrollTo(0,k),document.scrollingElement&&(document.scrollingElement.scrollTop=k),document.documentElement&&(document.documentElement.scrollTop=k);const z=Array.from(document.querySelectorAll("div, main, section"));for(const G of z)if(G.scrollHeight>G.clientHeight+80){const Q=window.getComputedStyle(G);(Q.overflowY==="auto"||Q.overflowY==="scroll")&&(G.scrollTop=G.scrollHeight,G.dispatchEvent(new Event("scroll",{bubbles:!0})))}window.dispatchEvent(new Event("scroll",{bubbles:!0}));try{window.dispatchEvent(new WheelEvent("wheel",{deltaY:2500,bubbles:!0})),(T=document.body)==null||T.dispatchEvent(new KeyboardEvent("keydown",{key:"PageDown",code:"PageDown",bubbles:!0}))}catch{}await new Promise(G=>setTimeout(G,o));const me=Le(i);if(c+=me.rejectedCount,g(me.items)>0){if(L=0,t.onBatchDiscovered)try{await t.onBatchDiscovered(Array.from(r.values()),r.size,w(null))}catch{}if(t.onProgress){const G=u?`Scanning Facebook Groups... ${r.size} of ${u} discovered`:`Scanning Facebook Groups... ${r.size} groups discovered`;t.onProgress(r.size,G,u,w(null))}if(f==="CONFIRMED"&&u!==null&&r.size>=u){console.log(`[AGP:Engine] Target count reached: ${r.size} >= ${u}.`),q="COMPLETE",Y="TARGET_REACHED";break}}else{if(L++,yt()){console.log("[AGP:Engine] Explicit end-of-list indicator detected."),q="COMPLETE",Y="LIST_END";break}if(window.scrollBy(0,-600),D.length>5&&((_=D[Math.max(0,D.length-6)])==null||_.scrollIntoView({block:"center",behavior:"instant"})),await new Promise(G=>setTimeout(G,300)),window.scrollBy(0,1200),D.length>0&&((j=D[D.length-1])==null||j.scrollIntoView({block:"end",behavior:"smooth"})),f==="CONFIRMED"&&u!==null&&r.size<u&&L<45){window.scrollBy(0,-1e3),await new Promise(G=>setTimeout(G,350)),window.scrollBy(0,2500);continue}if(L>=n){console.log(`[AGP:Engine] Scan complete/stagnant after ${L} attempts. Total verified: ${r.size}`),q="PARTIAL",Y="STAGNANT_TIMEOUT";break}}}try{window.scrollTo({top:0,behavior:"smooth"})}catch{}const Te=q!=="COMPLETE",Ge=w(Y);return{isLoggedIn:l,groups:Array.from(r.values()),totalFound:r.size,targetCount:u,isPartial:Te,outcome:q,completionReason:Y,debugMetrics:Ge}}finally{y&&y.disconnect()}}function Ye(t,e){if(!t||!t.trim())return e?e.split(/[-_.]+/).filter(Boolean).map(o=>o.charAt(0).toUpperCase()+o.slice(1)).join(" "):"Facebook Group";let n=t.trim();return n=n.replace(/^(?:Visit|Open|View|গ্রুপ দেখুন|দেখুন)\s+/i,""),n=n.replace(/\s*(?:Last active|You last visited|last visited|active)\s+[^\n]+/i,""),n=n.replace(/\s*(?:গত|আগে|মিনিট আগে|ঘণ্টা আগে|দিন আগে)[^\n]*/i,""),n=n.replace(/\s*·\s*(?:Public group|Private group|পাবলিক গ্রুপ|প্রাইভেট গ্রুপ).*$/i,""),n=n.replace(/\s*·\s*\d+.*members.*$/i,""),n=n.replace(/\s*·\s*[০-৯\d]+.*সদস্য.*$/i,""),n=n.replace(/\s*·\s*[^\n]+/i,""),(n.toLowerCase()==="visit"||n.toLowerCase()==="group"||n.toLowerCase()==="view group")&&e?e.split(/[-_.]+/).filter(Boolean).map(o=>o.charAt(0).toUpperCase()+o.slice(1)).join(" "):n.trim()||"Facebook Group"}function Me(t="id"){const e=Math.random().toString(36).substring(2,9),n=Date.now().toString(36);return`${t}_${n}_${e}`}function Qe(t){if(!t)return"";if(!t.includes("{")||!t.includes("|"))return t;let e=t,n=0;const o=/\{([^{}]+)\}/g;for(;n<10&&o.test(e);)n++,e=e.replace(o,(i,s)=>{if(s.includes("|")){const l=s.split("|").map(r=>r.trim()).filter(Boolean);if(l.length>0)return l[Math.floor(Math.random()*l.length)]}return i});return e=e.replace(/\{([^{}\r\n]+?)(?=[.,!?\r\n]|$)/g,(i,s)=>s.includes("|")?s.split("|").map(r=>r.trim()).filter(Boolean)[0]||"":i),e}const Ze={status:"IDLE",searchUrl:"",query:"",totalFound:0,joinedCount:0,requestedCount:0,alreadyJoinedCount:0,failedCount:0,skippedCount:0,currentIndex:0,currentGroupName:"",countdownSec:0,message:"Enter any Facebook search link to start auto-joining.",groups:[]},te={GROUPS:"agp_groups",ACCOUNT_GROUPS:"agp_facebook_groups_by_account",LOGS:"agp_logs",FACEBOOK_ACCOUNT:"agp_facebook_account"},Xe=()=>{var t;return typeof chrome<"u"&&!!((t=chrome.storage)!=null&&t.local)},de={};async function ye(t,e){if(Xe())return new Promise(n=>{chrome.storage.local.get([t],o=>{if(chrome.runtime.lastError){console.warn(`Storage get error for ${t}:`,chrome.runtime.lastError),n(de[t]!==void 0?de[t]:e);return}o&&o[t]!==void 0?n(o[t]):n(e)})});try{if(typeof window<"u"&&window.localStorage){const n=window.localStorage.getItem(t);if(n!==null)return JSON.parse(n)}}catch(n){console.warn("LocalStorage access failed:",n)}return de[t]!==void 0?de[t]:e}async function Oe(t,e){if(de[t]=e,Xe())return new Promise((n,o)=>{chrome.storage.local.set({[t]:e},()=>{chrome.runtime.lastError?o(chrome.runtime.lastError):n()})});try{typeof window<"u"&&window.localStorage&&window.localStorage.setItem(t,JSON.stringify(e))}catch(n){console.warn("LocalStorage set failed:",n)}}function et(t){return t&&t.trim().toLowerCase().replace(/[^a-z0-9_\u0980-\u09FF]/gi,"_")||"default_account"}async function tt(){return ye(te.ACCOUNT_GROUPS,{})}async function ot(t){const e=await Ne(),n=et(t||(e==null?void 0:e.userId)||(e==null?void 0:e.name)),o=await tt();if(o[n]&&Array.isArray(o[n].groups)&&o[n].groups.length>0){const r=o[n].groups.filter(a=>!pe(a));if(r.length>0)return r}const s=(await ye(te.GROUPS,[])).filter(l=>!pe(l));if(s.length>0)return s;for(const l of Object.keys(o))if(o[l]&&Array.isArray(o[l].groups)&&o[l].groups.length>0){const r=o[l].groups.filter(a=>!pe(a));if(r.length>0)return r}return[]}async function nt(t,e){const n=(t||[]).filter(r=>!pe(r)),o=await Ne(),i=et(e||(o==null?void 0:o.userId)||(o==null?void 0:o.name)),s=await tt(),l=s[i]||{accountContext:i,accountInfo:o||{isLoggedIn:!0,name:"Facebook User",lastSyncedAt:Date.now()},groups:[],lastSyncedAt:Date.now()};s[i]={...l,groups:n,lastSyncedAt:Date.now()},await Oe(te.ACCOUNT_GROUPS,s),await Oe(te.GROUPS,n)}function pe(t){if(!t)return!0;const e=(t.name||"").trim().toLowerCase(),n=(t.url||"").trim().toLowerCase();if(e.startsWith("unread")||e.includes("commented on")||e.includes("also commented")||e.includes("likes your")||e.includes("liked your")||e.includes("reacted to")||e.includes("shared a post")||e.includes("shared your post")||e.includes("invited you")||e.includes("mentioned you")||e.includes("requested to join")||e.includes("মন্তব্য করেছেন")||e.includes("মতামত দিয়েছেন")||e.includes("লাইক দিয়েছেন")||e.includes("শেয়ার করেছেন")||n.includes("/permalink/")||n.includes("/posts/")||n.includes("/user/")||n.includes("/profile.php")||n.includes("/friends/")||n.includes("/people/")||n.includes("/photos/")||n.includes("/videos/")||n.includes("/events/")||n.includes("/files/")||n.includes("comment_id=")||n.includes("notif_id=")||n.includes("notif_t=")||n.includes("reply_comment_id="))return!0;const o=new Set(["about","about group","feed","discover","create","notifications","search","categories","joins","settings","help","privacy","terms","policies","support","messages","marketplace"]),i=e.replace(/\s*group\s*$/i,"").trim();return!!(o.has(e)||o.has(i)||t.groupId&&o.has(t.groupId.toLowerCase()))}async function At(){return ye(te.LOGS,[])}async function Et(t){await Oe(te.LOGS,t)}async function St(t){const e=await At();e.unshift(t),e.length>300&&(e.length=300),await Et(e)}async function Ne(){return ye(te.FACEBOOK_ACCOUNT,null)}class kt{async writeLog(e,n,o,i){const s={id:Me("log"),timestamp:Date.now(),level:e,source:n,message:o,details:i},l=`[AGP:${n.toUpperCase()}][${e}]`;e==="ERROR"?console.error(l,o,i||""):e==="WARNING"?console.warn(l,o,i||""):console.log(l,o,i||"");try{await St(s)}catch(r){console.warn("Failed to persist log entry:",r)}return s}info(e,n,o){return this.writeLog("INFO",e,n,o)}success(e,n,o){return this.writeLog("SUCCESS",e,n,o)}warning(e,n,o){return this.writeLog("WARNING",e,n,o)}error(e,n,o){return this.writeLog("ERROR",e,n,o)}}const Ct=new kt;async function xe(t,e){var y;const n=(e==null?void 0:e.accountContext)||((y=await Ne())==null?void 0:y.name)||"default_account",o=await ot(n),i=new Map,s=new Map,l=new Map,r=m=>m.trim().toLowerCase().replace(/\s+/g," ");o.forEach(m=>{m.groupId&&i.set(m.groupId.toLowerCase(),m),m.url&&s.set(m.url.toLowerCase().replace(/\/$/,""),m),m.name&&l.set(r(m.name),m)});let a=0,c=0;const d=Date.now(),p=[],b=new Set;for(const m of t){if(pe(m))continue;const x=(m.groupId||"").toLowerCase(),v=(m.url||"").toLowerCase().replace(/\/$/,""),T=r(m.name||"");let _=(x?i.get(x):void 0)||(v?s.get(v):void 0)||(T&&T.length>=3?l.get(T):void 0);const j=Ye(m.name||"",m.groupId);if(_)c++,b.add(_.id),j&&(!_.name||_.name.includes("·")||_.name.length<j.length)&&(_.name=j),m.imageUrl&&!_.imageUrl&&(_.imageUrl=m.imageUrl),m.privacy&&m.privacy!=="UNKNOWN"&&(_.privacy=m.privacy),_.verified=!0,_.source="facebook-ui",_.accountContext=n,_.discoveredAt=d,_.updatedAt=d;else{a++;const $=m.groupId?`grp_${m.groupId.replace(/[^a-zA-Z0-9_-]/g,"")}`:Me("grp"),K=m.url.startsWith("http")?m.url:`https://www.facebook.com/groups/${m.groupId}/`,L={id:$,name:j,url:K,groupId:m.groupId,privacy:m.privacy||"UNKNOWN",imageUrl:m.imageUrl,category:"Discovered",enabled:!0,selected:!0,status:"READY",postCount:0,verified:!0,source:"facebook-ui",accountContext:n,discoveredAt:d,createdAt:d,updatedAt:d};p.push(L),x&&i.set(x,L),v&&s.set(v,L),T&&l.set(T,L),b.add(L.id)}}let u;if((e==null?void 0:e.syncMode)==="exact"){const m=v=>v.source==="manual"||v.category&&v.category!=="Discovered",x=o.filter(v=>b.has(v.id)||m(v));u=[...p,...x]}else u=[...p,...o];const f=[],w=new Set,g=new Set;for(const m of u){const x=m.url.toLowerCase().replace(/\/$/,"");!w.has(m.id)&&!g.has(x)&&(w.add(m.id),g.add(x),f.push(m))}return await nt(f,n),await Ct.info("dashboard",`Group discovery merged (${(e==null?void 0:e.syncMode)||"merge"}): ${a} imported, ${c} duplicates, total ${f.length}`),{imported:a,duplicates:c,totalStored:f.length,verifiedCount:f.filter(m=>m.verified).length}}function Pt(t){if(!t)return"<p><br></p>";const e=t.split(`
`),n=[];let o=!1,i=[];const s=()=>{o&&i.length>0&&(n.push("<ul>"+i.map(l=>`<li>${l}</li>`).join("")+"</ul>"),i=[],o=!1)};for(let l=0;l<e.length;l++){const r=e[l],a=r.trim();if(!a){s(),n.push("<p><br></p>");continue}const c=a.match(/^[•✓✔➤➔★⭐◆❖]\s*(.*)$/)||a.match(/^[\-*–—]\s+(.*)$/);if(c){o=!0,i.push(rt(c[1]));continue}s(),n.push(`<p>${rt(r)}</p>`)}return s(),n.join("")}function rt(t){if(!t)return"";let e=t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");return e=e.replace(/\*\*\*(.+?)\*\*\*/g,'<strong><em style="font-style: italic;">$1</em></strong>'),e=e.replace(/___(.+?)___/g,'<strong><em style="font-style: italic;">$1</em></strong>'),e=e.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>"),e=e.replace(/__(.+?)__/g,"<strong>$1</strong>"),e=e.replace(/\*([^*\n]+?)\*/g,'<em style="font-style: italic;">$1</em>'),e=e.replace(/_([^_\n]+?)_/g,'<em style="font-style: italic;">$1</em>'),e}function It(t){if(!t||typeof t!="string")return t||"";const e=t.trim();if(e.length<20)return t;const n=e.length,o=Math.floor(n/2);for(let s=-15;s<=15;s++){const l=o+s;if(l>10&&l<n){const r=e.slice(0,l).trim(),a=e.slice(l).trim();if(r.length>=15&&r===a)return r}}const i=e.split(`
`).filter(s=>s.trim().length>0);if(i.length>=2){const s=i[0].trim();if(s.length>=10){let l=s.length;for(;l<e.length;){const r=e.indexOf(s,l);if(r===-1)break;const a=e.slice(0,r).trim(),c=e.slice(r).trim();if(a.length>=20&&(a===c||c.startsWith(a)||a.startsWith(c)||a.length>30&&c.length>30&&a.slice(0,50)===c.slice(0,50)&&a.slice(-20)===c.slice(-20)))return a;l=r+s.length}}}if(e.length>60){const s=e.slice(0,35),l=e.indexOf(s,35);if(l>0){const r=e.slice(0,l).trim(),a=e.slice(l).trim();if(r.length>=25&&(r===a||a.startsWith(r.slice(0,Math.floor(r.length*.85)))))return r}}return t}function Re(t){try{const n=new URL(t.startsWith("http")?t:`https://${t}`).searchParams.get("q");return n?decodeURIComponent(n.replace(/\+/g," ")):""}catch{return""}}function _t(){if(typeof window>"u")return!1;const t=window.location.href.toLowerCase();return(t.includes("facebook.com")||t.includes("fb.com"))&&t.includes("/search")}function $e(t){var a;if(!t)return!1;const e=t.tagName.toLowerCase(),n=t.getAttribute("role")||"",o=e==="button"||n==="button"||e==="a"||t.getAttribute("tabindex")!==null,i=(t.innerText||t.textContent||"").trim().toLowerCase(),s=(t.getAttribute("aria-label")||"").trim().toLowerCase(),l=(((a=t.querySelector("[aria-label]"))==null?void 0:a.getAttribute("aria-label"))||"").trim().toLowerCase(),r=`${i} | ${s} | ${l}`.toLowerCase();return r.includes("joined")||r.includes("view group")||r.includes("edit membership")||r.includes("যোগ দিয়েছেন")||r.includes("যুক্ত হয়েছেন")||r.includes("গ্রুপ দেখুন")||r.includes("requested")||r.includes("pending")||r.includes("cancel request")||r.includes("অনুরোধ পাঠানো")||r.includes("অনুরোধ করা হয়েছে")||r.includes("share")||r.includes("শেয়ার")||r.includes("message")||r.includes("মেসেজ")||r.includes("close")||r.includes("menu")||r.includes("search")||r.includes("notifications")?!1:!!(i==="join"||i==="join group"||i==="+ join"||i==="+ join group"||i==="request to join"||i==="answer questions"||i==="যোগ দিন"||i==="+ যোগ দিন"||i==="গ্রুপে যোগ দিন"||i==="যুক্ত হোন"||i==="+ যুক্ত হোন"||i==="গ্রুপে যুক্ত হোন"||i==="যোগ দেওয়ার অনুরোধ"||i==="যোগ দেয়ার অনুরোধ"||s==="join"||s==="join group"||s.includes("join group")||s.includes("request to join")||s.includes("যোগ দিন")||s.includes("যুক্ত হোন")||s.includes("অনুরোধ")||o&&(i.startsWith("join ")||i.endsWith(" join")||i.includes("join group")||i.includes("যোগ দিন")||i.includes("যুক্ত হোন")||i.includes("join")&&i.length<=16))}function Ue(t){if(!t)return!1;const e=(t.innerText||t.textContent||"").trim().toLowerCase(),n=(t.getAttribute("aria-label")||"").trim().toLowerCase(),o=`${e} ${n}`.toLowerCase();return o.includes("joined")||o.includes("view group")||o.includes("edit membership")||o.includes("যোগ দিয়েছেন")||o.includes("যুক্ত হয়েছেন")||o.includes("গ্রুপ দেখুন")}function De(t){if(!t)return!1;const e=(t.innerText||t.textContent||"").trim().toLowerCase(),n=(t.getAttribute("aria-label")||"").trim().toLowerCase(),o=`${e} ${n}`.toLowerCase();return o.includes("requested")||o.includes("pending")||o.includes("cancel request")||o.includes("অনুরোধ পাঠানো")||o.includes("অনুরোধ করা হয়েছে")}function it(t,e,n){let o="";const i=(t.getAttribute("aria-label")||"").trim();if(i&&i.length>=2&&!i.toLowerCase().includes("view group")&&!i.toLowerCase().includes("গ্রুপ দেখুন"))o=i;else{const s=e.querySelector('h1, h2, h3, h4, span[dir="auto"], strong');o=((s==null?void 0:s.textContent)||t.textContent||"").trim()}return o=o.split(`
`)[0].trim(),(!o||o.length<2)&&(o=n.split(/[-_.]+/).map(s=>s.charAt(0).toUpperCase()+s.slice(1)).join(" ")),o}function st(t){const e=(t.innerText||t.textContent||"").toLowerCase();return e.includes("public")||e.includes("পাবলিক")?"PUBLIC":e.includes("private")||e.includes("প্রাইভেট")?"PRIVATE":"UNKNOWN"}function at(t){const e=(t.innerText||"").split(`
`).map(n=>n.trim()).filter(Boolean);for(const n of e){const o=n.toLowerCase();if((o.includes("member")||o.includes("সদস্য")||o.includes("post")||o.includes("পোস্ট"))&&(o.includes("public")||o.includes("private")||o.includes("পাবলিক")||o.includes("প্রাইভেট")||/\d/.test(n)))return n}return""}function ct(){if(typeof document>"u")return[];const t=[],e=new Set,n=Array.from(document.querySelectorAll('div[role="button"], button, a[role="button"], [role="button"], [aria-label*="Join" i], [aria-label*="যোগ" i], [aria-label*="যুক্ত" i]'));for(const i of n){if(!$e(i))continue;let s=i.parentElement,l=null,r=null;for(let w=0;w<12&&s&&s!==document.body;w++){const g=Array.from(s.querySelectorAll('a[href*="/groups/"]')).filter(y=>{const x=(y.href||y.getAttribute("href")||"").match(/(?:facebook\.com|fb\.com)?\/groups\/([a-zA-Z0-9._-]+)(?:\/|\?|$)/i);return x&&!he.has(x[1].toLowerCase())});if(g.length>0){const y=new Set(g.map(m=>{const x=(m.href||m.getAttribute("href")||"").match(/(?:facebook\.com|fb\.com)?\/groups\/([a-zA-Z0-9._-]+)(?:\/|\?|$)/i);return x?x[1].toLowerCase():""}).filter(Boolean));if(y.size===1)l=g[0],r=s;else if(y.size>1)break}s=s.parentElement}if(!l)continue;const c=(l.href||l.getAttribute("href")||"").match(/(?:facebook\.com|fb\.com)?\/groups\/([a-zA-Z0-9._-]+)(?:\/|\?|$)/i);if(!c)continue;const d=c[1].toLowerCase();if(e.has(d))continue;e.add(d);const p=r||i.closest('div[role="feed"] > div')||i.parentElement||i,b=it(l,p,d),u=st(p),f=at(p);t.push({cardElement:p,item:{id:d,groupId:d,name:b,url:`https://www.facebook.com/groups/${d}/`,privacy:u,membersText:f||void 0,status:"READY_TO_JOIN"},joinButton:i})}const o=Array.from(document.querySelectorAll('a[href*="/groups/"]'));for(const i of o){const l=(i.href||i.getAttribute("href")||"").match(/(?:facebook\.com|fb\.com)?\/groups\/([a-zA-Z0-9._-]+)(?:\/|\?|$)/i);if(!l)continue;const r=l[1].toLowerCase();if(he.has(r)||e.has(r))continue;let a=i.parentElement,c=null,d=null,p="READY_TO_JOIN";for(let w=0;w<12&&a&&a!==document.body;w++){const g=Array.from(a.querySelectorAll('a[href*="/groups/"]')).filter(x=>{const T=(x.href||x.getAttribute("href")||"").match(/(?:facebook\.com|fb\.com)?\/groups\/([a-zA-Z0-9._-]+)(?:\/|\?|$)/i);return T&&!he.has(T[1].toLowerCase())});if(new Set(g.map(x=>{const v=(x.href||x.getAttribute("href")||"").match(/(?:facebook\.com|fb\.com)?\/groups\/([a-zA-Z0-9._-]+)(?:\/|\?|$)/i);return v?v[1].toLowerCase():""}).filter(Boolean)).size>1)break;c=a;const m=Array.from(a.querySelectorAll('div[role="button"], button, a[role="button"], [role="button"], [aria-label]'));for(const x of m){if(Ue(x)){p="ALREADY_JOINED",d=null;break}if(De(x)){p="REQUESTED",d=null;break}if($e(x)){p="READY_TO_JOIN",d=x;break}}if(d||p!=="READY_TO_JOIN")break;a=a.parentElement}if(c||(c=i.closest('div[role="feed"] > div')||i.closest('div[role="article"]')||i.parentElement||i),p==="READY_TO_JOIN"&&!d&&c){const w=Array.from(c.querySelectorAll('div[role="button"], button, a[role="button"], [role="button"]'));for(const g of w)if(!Ue(g)&&!De(g)){const y=(g.innerText||g.textContent||g.getAttribute("aria-label")||"").trim().toLowerCase();if(y&&!y.includes("more")&&!y.includes("menu")&&!y.includes("share")&&!y.includes("close")){d=g;break}}}e.add(r);const b=it(i,c,r),u=st(c),f=at(c);t.push({cardElement:c,item:{id:r,groupId:r,name:b,url:`https://www.facebook.com/groups/${r}/`,privacy:u,membersText:f||void 0,status:p},joinButton:d})}return t}function fe(t){if(!t)return;try{t.scrollIntoView({behavior:"auto",block:"center"})}catch{}t.focus();const e=t.closest('div[role="button"], button, a[role="button"]')||t;e.focus();const n={bubbles:!0,cancelable:!0,view:window};if(e.dispatchEvent(new PointerEvent("pointerdown",n)),e.dispatchEvent(new MouseEvent("mousedown",n)),e.dispatchEvent(new PointerEvent("pointerup",n)),e.dispatchEvent(new MouseEvent("mouseup",n)),e.click(),e!==t)try{t.dispatchEvent(new MouseEvent("click",n)),t.click()}catch{}}async function Tt(t){let e=document.querySelector('div[role="dialog"]');if((!e||e.offsetParent===null&&e.getBoundingClientRect().height<=50)&&(await new Promise(r=>setTimeout(r,30)),e=document.querySelector('div[role="dialog"]')),!e||e.offsetParent===null&&e.getBoundingClientRect().height<=50)return!1;console.log("[AGP:AutoJoiner] Membership questions modal detected. Fast auto-answering...");const n=Array.from(e.querySelectorAll('input[type="checkbox"], div[role="checkbox"]'));for(const r of n)(r instanceof HTMLInputElement?r.checked:r.getAttribute("aria-checked")==="true")||fe(r);const o=Array.from(e.querySelectorAll('input[type="radio"], div[role="radio"]'));o.length>0&&(o.some(a=>a instanceof HTMLInputElement?a.checked:a.getAttribute("aria-checked")==="true")||fe(o[0]));const i=Array.from(e.querySelectorAll('textarea, input[type="text"]'));for(const r of i)(!r.value||r.value.trim()==="")&&(r.focus(),r.value=t||"Yes, I agree to the group rules and guidelines.",r.dispatchEvent(new Event("input",{bubbles:!0})),r.dispatchEvent(new Event("change",{bubbles:!0})));const s=Array.from(e.querySelectorAll('button, div[role="button"]'));for(const r of s){const a=(r.innerText||r.textContent||r.getAttribute("aria-label")||"").trim().toLowerCase();if(a==="submit"||a==="জমা দিন"||a==="send"||a==="confirm"||a==="next"||a==="পরবর্তী"||a==="done"||a==="অনুরোধ পাঠান"||a.includes("submit")||a.includes("জমা")){fe(r),await new Promise(c=>setTimeout(c,60));break}}const l=document.querySelector('div[role="dialog"]');if(l){const r=Array.from(l.querySelectorAll('button, div[role="button"]'));for(const a of r){const c=(a.innerText||a.textContent||a.getAttribute("aria-label")||"").trim().toLowerCase();if(c==="submit"||c==="জমা দিন"||c==="done"||c.includes("submit")){fe(a),await new Promise(d=>setTimeout(d,60));break}}}return!0}const ne=class ne{constructor(){Z(this,"state",{...Ze});Z(this,"config",{searchUrl:"",delaySec:0,maxGroups:0,autoAnswerQuestions:!0,defaultAnswer:"Yes, I agree to the group rules and guidelines.",saveToGroups:!0});Z(this,"isRunning",!1);Z(this,"isPaused",!1);Z(this,"shouldStop",!1);Z(this,"onProgressCallbacks",[])}static getInstance(){return ne.instance||(ne.instance=new ne),ne.instance}subscribe(e){this.onProgressCallbacks.push(e)}getState(){return{...this.state}}broadcastState(){var e;for(const n of this.onProgressCallbacks)try{n(this.state)}catch{}try{typeof chrome<"u"&&((e=chrome.runtime)!=null&&e.sendMessage)&&chrome.runtime.sendMessage({type:"AUTO_JOIN_PROGRESS",payload:this.state})}catch{}}pause(){this.isRunning&&!this.isPaused&&(this.isPaused=!0,this.state.status="PAUSED",this.state.message="Auto-Join paused by user.",this.broadcastState())}resume(){this.isRunning&&this.isPaused&&(this.isPaused=!1,this.state.status="JOINING",this.state.message="Resuming group auto-joining...",this.broadcastState())}stop(){this.shouldStop=!0,this.isRunning=!1,this.isPaused=!1,this.state.status="STOPPED",this.state.message="Auto-Join stopped by user.",this.broadcastState()}async start(e){if(this.isRunning)return console.warn("[AGP:AutoJoiner] Already running."),this.state;this.config={...this.config,...e,delaySec:typeof e.delaySec=="number"?e.delaySec:0},this.isRunning=!0,this.isPaused=!1,this.shouldStop=!1;const n=Re(window.location.href);this.state={...Ze,status:"SEARCHING",searchUrl:window.location.href,query:n,message:`Scanning Facebook group search results for "${n}"...`,startedAt:Date.now()},this.broadcastState();try{let o=0;const i=new Set;for(;!this.shouldStop;){for(;this.isPaused&&!this.shouldStop;)await new Promise(r=>setTimeout(r,500));if(this.shouldStop)break;const s=ct();if(this.state.groups=s.map(r=>r.item),this.state.totalFound=s.length,this.state.alreadyJoinedCount=s.filter(r=>r.item.status==="ALREADY_JOINED").length,this.state.requestedCount=s.filter(r=>r.item.status==="REQUESTED").length,this.state.joinedCount=s.filter(r=>r.item.status==="JOINED").length,this.config.saveToGroups)for(const r of s)r.item.status==="ALREADY_JOINED"&&!i.has(r.item.groupId)&&(i.add(r.item.groupId),await this.saveGroupToDatabase(r.item));const l=s.find(r=>r.item.status==="READY_TO_JOIN"&&!i.has(r.item.groupId));if(l){o=0;const{cardElement:r,item:a}=l;let c=l.joinButton;if(!c&&r){const d=Array.from(r.querySelectorAll('div[role="button"], button, a[role="button"], [role="button"]'));for(const p of d)if($e(p)){c=p;break}if(!c){for(const p of d)if(!Ue(p)&&!De(p)){const b=(p.innerText||p.textContent||p.getAttribute("aria-label")||"").toLowerCase();if(!b.includes("more")&&!b.includes("menu")&&!b.includes("share")&&!b.includes("close")){c=p;break}}}}if(i.add(a.groupId),this.config.maxGroups>0&&this.state.joinedCount+this.state.requestedCount>=this.config.maxGroups){this.state.message=`Reached target limit of ${this.config.maxGroups} groups.`;break}if(c){this.state.status="JOINING",this.state.currentGroupName=a.name,a.status="JOINING",this.state.message=`Joining: "${a.name}"...`,this.broadcastState();try{r.scrollIntoView({behavior:"auto",block:"nearest"}),r.style.outline="3px solid #10b981",r.style.boxShadow="0 0 15px rgba(16, 185, 129, 0.45)",r.style.borderRadius="8px"}catch{}try{console.log(`[AGP:AutoJoiner] Triggering instant click on Join button for: "${a.name}"`),fe(c),this.config.autoAnswerQuestions&&await Tt(this.config.defaultAnswer),a.status="JOINED",a.joinedAt=Date.now(),this.state.joinedCount++,this.config.saveToGroups&&await this.saveGroupToDatabase(a),this.state.message=`Joined "${a.name}" (${a.status})`,this.broadcastState()}catch(p){console.error("[AGP:AutoJoiner] Join error on",a.name,p),a.status="FAILED",a.error=String(p),this.state.failedCount++,this.broadcastState()}finally{try{r.style.outline="2px solid rgba(16, 185, 129, 0.35)",r.style.boxShadow="none"}catch{}}const d=typeof this.config.delaySec=="number"?this.config.delaySec:0;if(d<=0)this.state.countdownSec=0,await new Promise(p=>setTimeout(p,30));else{for(let p=d;p>0&&!this.shouldStop;p--){for(;this.isPaused&&!this.shouldStop;)await new Promise(b=>setTimeout(b,200));if(this.shouldStop)break;this.state.countdownSec=p,this.state.message=`Waiting ${p}s before next group...`,this.broadcastState(),await new Promise(b=>setTimeout(b,1e3))}this.state.countdownSec=0}}}else{this.state.message="Loading more Facebook groups on this page...",this.broadcastState();const r=document.body.scrollHeight;if(window.scrollBy({top:1800,behavior:"auto"}),window.dispatchEvent(new Event("scroll",{bubbles:!0})),await new Promise(d=>setTimeout(d,400)),!ct().some(d=>d.item.status==="READY_TO_JOIN"&&!i.has(d.item.groupId))&&document.body.scrollHeight===r){if(o++,o>=3)break}else o=0}}this.shouldStop||(this.state.status="COMPLETED",this.state.message=`Auto-join complete! Joined ${this.state.joinedCount} groups, requested ${this.state.requestedCount} groups.`)}catch(o){console.error("[AGP:AutoJoiner] Execution error:",o),this.state.status="ERROR",this.state.message=`Error: ${(o==null?void 0:o.message)||String(o)}`}finally{this.isRunning=!1,this.isPaused=!1,this.state.finishedAt=Date.now(),this.broadcastState()}return this.state}async saveGroupToDatabase(e){var n;try{const o=await ot();if(!o.some(s=>s.groupId&&s.groupId.toLowerCase()===e.groupId.toLowerCase()||s.url&&s.url.toLowerCase().includes(e.groupId.toLowerCase()))){const s={id:Me(),name:e.name,url:e.url,groupId:e.groupId,privacy:e.privacy,category:this.config.selectedCategory||"Auto Joined",enabled:!0,selected:!1,status:"READY",postCount:0,verified:!0,source:"facebook-ui",createdAt:Date.now(),updatedAt:Date.now()};await nt([...o,s]),console.log(`[AGP:AutoJoiner] Saved "${e.name}" (${e.groupId}) to My Facebook Groups database.`);try{typeof chrome<"u"&&((n=chrome.runtime)!=null&&n.sendMessage)&&chrome.runtime.sendMessage({type:"AUTO_JOIN_SAVE_GROUPS",payload:{group:s}})}catch{}}}catch(o){console.warn("[AGP:AutoJoiner] Save to database error:",o)}}};Z(ne,"instance");let N=ne,J=null,R=null;function qe(t){if(typeof document>"u")return;const e=N.getInstance(),n=e.getState();Re(window.location.href),J||(J=document.createElement("div"),J.id="agp-auto-joiner-root",J.style.cssText=`
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 2147483646;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    `,R=J.attachShadow({mode:"open"}),document.body.appendChild(J),e.subscribe(o=>{ve(o)})),ve(n,t)}let Be=!1;function ve(t,e){if(!R)return;const n=Re(window.location.href),o=t.status==="SEARCHING"||t.status==="JOINING",i=t.status==="PAUSED",s=t.status==="JOINING"?"#10b981":t.status==="SEARCHING"?"#3b82f6":t.status==="PAUSED"?"#f59e0b":t.status==="COMPLETED"?"#10b981":t.status==="ERROR"?"#ef4444":"#6366f1";if(Be){R.innerHTML=`
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
        <span style="font-size: 12px; font-weight: 700;">Auto-Joiner: ${t.joinedCount} Joined</span>
        <span style="font-size: 11px; color: #94a3b8;">↗</span>
      </div>
    `;const u=R.getElementById("agp-dock-expand");u&&(u.onclick=()=>{Be=!1,ve(t,e)});return}R.innerHTML=`
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
        ${!o&&!i?`<button id="btn-start-join" class="btn btn-primary">
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
  `;const l=R.getElementById("agp-dock-close");l&&(l.onclick=()=>{J&&(J.remove(),J=null,R=null)});const r=R.getElementById("agp-dock-min");r&&(r.onclick=()=>{Be=!0,ve(t,e)});const a=R.getElementById("btn-view-groups");a&&(a.onclick=()=>{var u;try{typeof chrome<"u"&&((u=chrome.runtime)!=null&&u.sendMessage)&&chrome.runtime.sendMessage({type:"OPEN_DASHBOARD"})}catch{}});const c=R.getElementById("btn-start-join");c&&(c.onclick=()=>{N.getInstance().start(e||{searchUrl:window.location.href,delaySec:0,maxGroups:0,autoAnswerQuestions:!0,defaultAnswer:"Yes, I agree to the group rules and guidelines.",saveToGroups:!0})});const d=R.getElementById("btn-pause-join");d&&(d.onclick=()=>{N.getInstance().pause()});const p=R.getElementById("btn-resume-join");p&&(p.onclick=()=>{N.getInstance().resume()});const b=R.getElementById("btn-stop-join");b&&(b.onclick=()=>{N.getInstance().stop()})}console.log("[AGP:Content] Facebook Assistant Content Script initialized.");let V=null,A=null,h=null,oe=!1,Ae=!1,re=null,Ee=!1;function je(){I&&(clearInterval(I),I=null),O=!1,W=!0,Ee=!0;try{chrome.runtime.sendMessage({type:"STOP_QUEUE"})}catch{}V&&(V.remove(),V=null,A=null),C("🛑 Auto-Posting বন্ধ করা হয়েছে (Stopped & Closed)")}async function lt(t){try{return await navigator.clipboard.writeText(t),!0}catch{const n=document.createElement("textarea");n.value=t,document.body.appendChild(n),n.select();const o=document.execCommand("copy");return document.body.removeChild(n),o}}function C(t,e=!1){if(A){const n=A.getElementById("agp-toast");n&&n.remove();const o=document.createElement("div");o.id="agp-toast",o.innerText=t,o.style.cssText=`
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
    `,A.appendChild(o),setTimeout(()=>o.remove(),2400);return}if(typeof document<"u"&&document.body){const n=document.getElementById("agp-global-toast");n&&n.remove();const o=document.createElement("div");o.id="agp-global-toast",o.innerText=t,o.style.cssText=`
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
    `,document.body.appendChild(o),requestAnimationFrame(()=>{o.style.opacity="1",o.style.transform="translateY(0)"}),setTimeout(()=>{o.style.opacity="0",o.style.transform="translateY(-10px)",setTimeout(()=>o.remove(),400)},3e3)}}let O=!1,P="Preparing auto-post...",I=null,W=!1;const E=t=>new Promise(e=>setTimeout(e,t));async function Gt(t,e="media_1"){try{if(!t||typeof t!="string")return null;let n="image/jpeg",o=null;if(t.startsWith("data:")||t.startsWith("blob:")||t.startsWith("http://")||t.startsWith("https://"))try{const d=await fetch(t);(d.ok||t.startsWith("data:")||t.startsWith("blob:"))&&(o=await d.blob(),o&&o.size>0&&(n=(o.type||"").toLowerCase()||"image/jpeg"))}catch(d){console.warn("[AGP:AutoPost] fetch blob parsing failed, falling back to manual decode:",d)}if(!o||o.size===0){let d=t;if(t.startsWith("data:")){const p=t.indexOf(",");if(p!==-1){const b=t.slice(0,p);d=t.slice(p+1);const u=b.match(/:(.*?);/);n=u?u[1].toLowerCase():"image/jpeg"}}try{const p=atob(d.trim().replace(/\s/g,"")),b=new Uint8Array(p.length);for(let u=0;u<p.length;u++)b[u]=p.charCodeAt(u);if(b.length===0)return null;b.length>8&&b[4]===102&&b[5]===116&&b[6]===121&&b[7]===112&&(n="video/mp4"),o=new Blob([b.buffer],{type:n})}catch(p){return console.warn("[AGP:AutoPost] base64 decode failed:",p),null}}if(!o||o.size===0)return null;const i=n.startsWith("video/");let s="jpg";n.includes("video/mp4")||n.includes("mp4")?s="mp4":n.includes("video/webm")||n.includes("webm")?s="webm":n.includes("video/quicktime")||n.includes("mov")?s="mov":n.includes("video/x-m4v")||n.includes("m4v")?s="m4v":n.includes("video/mkv")||n.includes("matroska")?s="mkv":i?s="mp4":n.includes("png")?s="png":n.includes("webp")?s="webp":n.includes("gif")&&(s="gif");const l=Date.now(),r=e.replace(/\D/g,"")||"1",c=`${i?"VID":"IMG"}_${l}_${r}.${s}`;return new File([o],c,{type:n,lastModified:l})}catch(n){return console.warn("[AGP:AutoPost] mediaToFile error:",n),null}}function U(t){if(!t)return!1;if(t.offsetParent!==null)return!0;try{const e=window.getComputedStyle(t);if(e.display==="none"||e.visibility==="hidden"||e.opacity==="0")return!1;const n=t.getBoundingClientRect();return n.width>0&&n.height>0}catch{return!1}}function Fe(){const t=Array.from(document.querySelectorAll('[data-pagelet="GroupInlineComposer"], [data-pagelet="FeedInlineComposer"], [data-pagelet="GroupComposer"], [data-pagelet*="Composer" i]'));for(const n of t){if(n.closest('[role="article"], [data-pagelet*="FeedUnit"], [data-pagelet*="Comment"], form'))continue;const o=n.querySelector('[role="button"]');if(o&&U(o))return o}const e=Array.from(document.querySelectorAll('[role="main"] [role="button"], [role="button"]'));for(const n of e){if(n.closest('[role="article"], [data-pagelet*="FeedUnit"], [data-pagelet*="Comment"], form'))continue;const o=(n.getAttribute("aria-label")||"").toLowerCase(),i=(n.textContent||"").trim().toLowerCase();if((o.includes("create a public post")||o.includes("write something")||o.includes("create a post")||o.includes("কিছু লিখুন")||o.includes("পোস্ট তৈরি করুন")||o.includes("একটি পাবলিক পোস্ট")||i==="create a public post..."||i==="write something..."||i==="create a post..."||i==="create post"||i.includes("কিছু লিখুন")||i.includes("পোস্ট তৈরি করুন")||i.includes("পাবলিক পোস্ট"))&&U(n))return n}return null}function Se(){const t=Array.from(document.querySelectorAll('[role="dialog"]'));for(const e of t)if(U(e)){if(e.closest('[role="article"]')||e.querySelector('[data-pagelet*="ChatTab"], [aria-label*="Messenger" i]'))continue;const n=(e.textContent||"").toLowerCase(),o=(e.getAttribute("aria-label")||"").toLowerCase();if(o.includes("create post")||o.includes("create a public post")||o.includes("পোস্ট তৈরি করুন")||n.includes("create post")||n.includes("create a public post")||n.includes("add to your post")||n.includes("পোস্ট তৈরি করুন")||n.includes("আপনার পোস্টে যোগ করুন")||!!e.querySelector('[aria-label*="Add to your post" i], [aria-label*="আপনার পোস্টে যোগ করুন" i], [aria-label*="Photo/video" i]'))return e}return null}function ge(){const t=(document.body?document.body.innerText:"").toLowerCase(),e=(document.title||"").toLowerCase();return window.location.href.toLowerCase().includes("/groups/grp_")||t.includes("this content isn't available right now")||t.includes("this content isn't available")||t.includes("content isn't available right now")||t.includes("the link you followed may be broken")||t.includes("page may have been removed")||t.includes("এই কন্টেন্টটি এখন উপলব্ধ নয়")||t.includes("এই লিঙ্কটি হয়তো ত্রুটিপূর্ণ")||e.includes("page not found")||e.includes("content not found")||!!document.querySelector('[role="main"] [aria-label*="Go to Feed" i], [role="main"] a[href="/"][role="button"]')}async function Lt(){if(ge())return null;let t=Se();if(t)return t;const e=Fe();if(!e)return console.log("[AGP:AutoPost] Composer trigger not found on page."),null;e.scrollIntoView({behavior:"instant",block:"center"}),await E(40),e.dispatchEvent(new PointerEvent("pointerdown",{bubbles:!0,cancelable:!0})),e.dispatchEvent(new MouseEvent("mousedown",{bubbles:!0,cancelable:!0})),e.dispatchEvent(new PointerEvent("pointerup",{bubbles:!0,cancelable:!0})),e.dispatchEvent(new MouseEvent("mouseup",{bubbles:!0,cancelable:!0})),e.click();const n=Date.now();for(;Date.now()-n<4e3;)if(await E(40),t=Se(),t)return t;return null}async function Mt(t,e){if(!e||!e.trim())return!0;const n=It(Qe(e)).replace(/\r\n/g,`
`).replace(/\r/g,`
`),o=n.split(`
`);await lt(n.trim());let i=null;const s=Date.now(),l=['div[role="textbox"][contenteditable="true"]','div[data-lexical-editor="true"][contenteditable="true"]','div[contenteditable="true"]:not([aria-label*="comment" i]):not([aria-label*="মন্তব্য" i])','div[data-editor="true"]','div[aria-label*="Create a public post" i][contenteditable="true"]','div[aria-label*="Write something" i][contenteditable="true"]','div[aria-label*="কিছু লিখুন" i][contenteditable="true"]','div[aria-label*="পাবলিক পোস্ট" i][contenteditable="true"]','div[aria-placeholder*="Create a public post" i]','div[aria-placeholder*="Write something" i]'];for(;Date.now()-s<5e3;){for(const g of l){const y=t.querySelector(g)||document.querySelector(`[role="dialog"] ${g}`);if(y&&U(y)){i=y;break}}if(i)break;await E(40)}if(!i)return console.warn("[AGP:AutoPost] Create post editor not found inside modal."),!1;const r=(i.textContent||"").trim(),a=n.trim().slice(0,30);if(r.length>=n.trim().length*.7&&(!a||r.includes(a)))return console.log("[AGP:AutoPost] Editor already contains caption. Skipping duplicate injection."),!0;i.scrollIntoView({behavior:"instant",block:"center"}),window.focus(),i.focus();const c={bubbles:!0,cancelable:!0,view:window};i.dispatchEvent(new PointerEvent("pointerdown",c)),i.dispatchEvent(new MouseEvent("mousedown",c)),i.dispatchEvent(new PointerEvent("pointerup",c)),i.dispatchEvent(new MouseEvent("mouseup",c)),i.dispatchEvent(new MouseEvent("click",c)),i.dispatchEvent(new FocusEvent("focus",{bubbles:!1})),i.dispatchEvent(new FocusEvent("focusin",{bubbles:!0})),await E(40);try{const g="agp_inj_"+Date.now()+"_"+Math.random().toString(36).slice(2,7),y=new Promise(x=>{const v=T=>{T.data&&T.data.type==="AGP_MAIN_INJECT_CAPTION_RESPONSE"&&T.data.messageId===g&&(window.removeEventListener("message",v),x(!!T.data.success))};window.addEventListener("message",v),setTimeout(()=>{window.removeEventListener("message",v),x(!1)},1e3)});if(window.postMessage({type:"AGP_MAIN_INJECT_CAPTION",messageId:g,caption:n},"*"),await y&&(console.log("[AGP:AutoPost] MAIN world injection succeeded with exact layout!"),await E(60),(i.textContent||"").trim().length>0))return!0}catch(g){console.warn("[AGP:AutoPost] MAIN world bridge error, using direct content injection:",g)}const d=(i.textContent||"").trim();if(d.length>=n.trim().length*.7&&(!a||d.includes(a)))return console.log("[AGP:AutoPost] Editor already populated by bridge. Skipping fallback Strategy 2."),!0;const p=window.getSelection();if(p){const g=document.createRange();g.selectNodeContents(i),p.removeAllRanges(),p.addRange(g),i.dispatchEvent(new InputEvent("beforeinput",{bubbles:!0,cancelable:!0,inputType:"deleteContentBackward"}))}document.execCommand("selectAll",!1),document.execCommand("delete",!1),await E(30);const b=i.querySelector("p")||i;if(b.dispatchEvent(new MouseEvent("mousedown",c)),b.dispatchEvent(new MouseEvent("mouseup",c)),b.click(),p){const g=document.createRange();b.childNodes.length>0?(g.setStart(b,0),g.setEnd(b,b.childNodes.length)):g.selectNodeContents(b),g.collapse(!0),p.removeAllRanges(),p.addRange(g)}document.dispatchEvent(new Event("selectionchange"));let u=!1;const f=Pt(n);try{const g=new DataTransfer;g.setData("text/plain",n),g.setData("text/html",f);const y=new ClipboardEvent("paste",{bubbles:!0,cancelable:!0,clipboardData:g});i.dispatchEvent(y),await E(80);let m=(i.textContent||"").trim();(!m||m.length<5)&&(i.dispatchEvent(new InputEvent("beforeinput",{bubbles:!0,cancelable:!0,inputType:"insertFromPaste",dataTransfer:g})),await E(60),m=(i.textContent||"").trim());const x=i.querySelectorAll("p");m.length>0&&(!n.includes(`
`)||x.length>1||m.length>=n.trim().length*.7)&&(console.log("[AGP:AutoPost] Direct Native Paste event succeeded. Paragraph count:",x.length),u=!0)}catch(g){console.warn("[AGP:AutoPost] Native paste event error:",g)}if(!u)try{console.log("[AGP:AutoPost] Trying Strategy 3: Line-by-line Enter keystrokes with non-collapsing spacing..."),document.execCommand("selectAll",!1),document.execCommand("delete",!1),await E(30);for(let y=0;y<o.length;y++){const m=o[y],x=y===o.length-1;m.length>0?document.execCommand("insertText",!1,m):document.execCommand("insertText",!1," "),x||(i.dispatchEvent(new KeyboardEvent("keydown",{key:"Enter",code:"Enter",keyCode:13,which:13,bubbles:!0,cancelable:!0})),i.dispatchEvent(new InputEvent("beforeinput",{inputType:"insertParagraph",bubbles:!0,cancelable:!0})),document.execCommand("insertParagraph",!1),i.dispatchEvent(new InputEvent("input",{inputType:"insertParagraph",bubbles:!0})),i.dispatchEvent(new KeyboardEvent("keyup",{key:"Enter",code:"Enter",keyCode:13,which:13,bubbles:!0})),await E(8))}await E(80),(i.textContent||"").trim().length>0&&(console.log("[AGP:AutoPost] Strategy 3 succeeded."),u=!0)}catch(g){console.warn("[AGP:AutoPost] Strategy 3 error:",g)}return i.dispatchEvent(new Event("input",{bubbles:!0})),i.dispatchEvent(new Event("change",{bubbles:!0})),document.dispatchEvent(new Event("selectionchange")),await E(60),(i.textContent||"").trim().length>0}function Ot(t){const e=t.querySelector('[aria-label*="Photo/video" i], [aria-label*="Photo / video" i], [aria-label*="Add photo" i], [aria-label*="Add Photos" i], [aria-label*="Add photos or videos" i], [aria-label*="Add video" i], [aria-label*="Add Photos/videos" i], [aria-label*="ফটো/ভিডিও" i], [aria-label*="Photo" i], [aria-label*="Video" i], [aria-label*="ছবি/ভিডিও" i], [aria-label*="ছবি" i], [aria-label*="ভিডিও" i], div[aria-label*="Photo" i], div[aria-label*="Video" i], div[aria-label*="ফটো" i], div[aria-label*="ভিডিও" i]');if(e&&U(e))return e;const n=Array.from(t.querySelectorAll('[role="button"], button, div[tabindex="0"]'));for(const i of n){const s=(i.getAttribute("aria-label")||"").toLowerCase();if((s.includes("photo")||s.includes("video")||s.includes("image")||s.includes("ফটো")||s.includes("ছবি")||s.includes("ভিডিও"))&&U(i))return i}const o=Array.from(t.querySelectorAll("span, div, p"));for(const i of o){const s=(i.textContent||"").trim().toLowerCase();if(s==="add to your post"||s==="আপনার পোস্টে যোগ করুন"||s.includes("add to your post")){const l=i.closest("div"),r=(l==null?void 0:l.parentElement)||l,a=r==null?void 0:r.querySelector('[role="button"], img, svg');if(a&&U(a))return a.closest('[role="button"]')||a}}return null}function ut(t){return t.querySelector('input[type="file"][accept*="video"]')||t.querySelector('input[type="file"][accept*="image"]')||t.querySelector('input[type="file"]')||document.querySelector('[role="dialog"] input[type="file"]')||document.querySelector('input[type="file"]')}function ie(t){var n;const e=(t.textContent||"").toLowerCase();if(e.includes("your file can't be uploaded")||e.includes("file can't be uploaded")||e.includes("আপলোড করা যাবে না")||e.includes("আপলোড করা যায়নি")||e.includes("couldn't be uploaded")||e.includes("error uploading")){const o=Array.from(t.querySelectorAll("span, div, p")).find(i=>{const s=(i.textContent||"").toLowerCase();return s.includes("your file can't be uploaded")||s.includes("file can't be uploaded")||s.includes("আপলোড করা যাবে না")||s.includes("আপলোড করা যায়নি")||s.includes("couldn't be uploaded")});return((n=o==null?void 0:o.textContent)==null?void 0:n.trim())||"Your file can't be uploaded"}return null}async function Nt(t,e){if(!e||e.length===0)return!0;e.some(r=>r.includes("video")||r.includes(".mp4")||r.includes(".mov")||r.includes(".webm"));let n=ut(t);if(!n){const r=Ot(t);if(r){r.scrollIntoView({behavior:"instant",block:"center"}),r.dispatchEvent(new PointerEvent("pointerdown",{bubbles:!0,cancelable:!0})),r.dispatchEvent(new MouseEvent("mousedown",{bubbles:!0,cancelable:!0})),r.dispatchEvent(new PointerEvent("pointerup",{bubbles:!0,cancelable:!0})),r.dispatchEvent(new MouseEvent("mouseup",{bubbles:!0,cancelable:!0})),r.click();const a=Date.now();for(;Date.now()-a<2500&&(await E(40),n=ut(t),!n););}}if(!n)return console.warn("[AGP:AutoPost] File input not found inside create post modal."),!1;const o=new DataTransfer;for(let r=0;r<e.length;r++){const a=await Gt(e[r],`media_${r+1}`);a&&a.size>0&&(o.items.add(a),console.log(`[AGP:AutoPost] Prepared media file #${r+1}: ${a.name} (${a.type}, ${a.size} bytes)`))}if(o.files.length===0)return console.warn("[AGP:AutoPost] No valid non-empty files prepared from mediaList."),!1;n.files=o.files;const i=n._valueTracker;i&&i.setValue(""),n.dispatchEvent(new Event("change",{bubbles:!0,cancelable:!0})),n.dispatchEvent(new Event("input",{bubbles:!0,cancelable:!0}));const s=4e3,l=Date.now();for(;Date.now()-l<s;){const r=ie(t);if(r)return console.warn("[AGP:AutoPost] Facebook upload error detected:",r),!1;if(!!t.querySelector('video, img[src*="blob:"], img[src*="data:"], img[src*="fbcdn.net"], div[aria-label*="Video" i], div[aria-label*="Photo" i], div[data-pagelet*="MediaViewer"], div[aria-label*="Edit" i], button[aria-label*="Edit" i], div[aria-label*="Remove" i], div[role="button"][aria-label*="Edit" i]')){console.log("[AGP:AutoPost] Media preview mounted immediately in composer."),await E(80);break}await E(40)}return!ie(t)}function dt(t,e){return t.includes("joined")||t.includes("যোগ দিয়েছেন")||t.includes("মেম্বার")||t.includes("member")||t.includes("leave group")||t.includes("গ্রুপ ত্যাগ")||e.includes("joined")||e.includes("যোগ দিয়েছেন")||e.includes("member")}function se(){const t=['[aria-label*="Join group" i]','[aria-label*="Join Group" i]','[aria-label*="গ্রুপে যোগ দিন" i]','[aria-label*="যোগ দিন" i]','[aria-label*="গ্রুপে যুক্ত হন" i]','[aria-label*="Request to join" i]','[aria-label*="Request to Join" i]','[aria-label*="গ্রুপে যোগ দেওয়ার অনুরোধ" i]','[aria-label*="যোগ দেওয়ার অনুরোধ" i]','[aria-label*="গ্রুপে যোগদানের অনুরোধ" i]','div[role="button"][aria-label*="Join" i]','div[role="button"][aria-label*="যোগ" i]','button[aria-label*="Join" i]','button[aria-label*="যোগ" i]'];for(const n of t){const o=document.querySelector(n);if(o&&U(o)){const i=(o.innerText||o.textContent||"").trim().toLowerCase(),s=(o.getAttribute("aria-label")||"").toLowerCase();if(!dt(i,s))return o}}const e=Array.from(document.querySelectorAll('div[role="main"] [role="button"], div[role="main"] button, div[role="region"] [role="button"], [role="banner"] [role="button"], div[role="button"], button'));for(const n of e){if(!U(n))continue;const o=(n.innerText||n.textContent||"").trim().toLowerCase(),i=(n.getAttribute("aria-label")||"").toLowerCase();if(!dt(o,i)&&(o==="join group"||o==="join"||o==="গ্রুপে যোগ দিন"||o==="যোগ দিন"||o==="গ্রুপে যুক্ত হন"||o==="request to join"||o==="request to join group"||o==="যোগ দেওয়ার অনুরোধ"||o==="যোগ দেওয়ার অনুরোধ জানান"||o.includes("join group")||o.includes("গ্রুপে যোগ দিন")))return n}return null}function ze(){const t=!!se(),e=!!Fe();return t&&!e}async function pt(){const t=se();if(!t)return{success:!1,isInstantMember:!1,reason:"Join button not found"};console.log("[AGP:AutoJoin] Found Join button. Executing automatic join click..."),P="⚡ Auto-joining group (গ্রুপে যোগ দেওয়া হচ্ছে)...",S(),C("⚡ Auto-joining group...",!0),t.scrollIntoView({behavior:"instant",block:"center"}),await E(60);const e={bubbles:!0,cancelable:!0,view:window};t.dispatchEvent(new PointerEvent("pointerdown",e)),t.dispatchEvent(new MouseEvent("mousedown",e)),t.dispatchEvent(new PointerEvent("pointerup",e)),t.dispatchEvent(new MouseEvent("mouseup",e)),t.click(),await E(1500);const n=document.querySelector('div[role="dialog"]');if(n&&U(n)){console.log("[AGP:AutoJoin] Rules agreement or membership question dialog detected. Handling...");const l=Array.from(n.querySelectorAll('input[type="checkbox"], div[role="checkbox"]'));for(const c of l)c.getAttribute("aria-checked")==="true"||c.checked||(c.click(),await E(80));const r=Array.from(n.querySelectorAll('textarea, input[type="text"]'));for(const c of r)(!c.value||!c.value.trim())&&(c.value="Agree",c.dispatchEvent(new Event("input",{bubbles:!0})),c.dispatchEvent(new Event("change",{bubbles:!0})),await E(50));const a=Array.from(n.querySelectorAll('button, [role="button"], input[type="submit"]')).find(c=>{const d=(c.innerText||c.textContent||c.getAttribute("aria-label")||"").trim().toLowerCase();return d==="submit"||d==="send"||d==="agree"||d==="confirm"||d==="সাবমিট"||d==="জমা দিন"||d==="সম্মতি দিচ্ছি"||d.includes("submit")||d.includes("সাবমিট")});a&&U(a)&&(console.log("[AGP:AutoJoin] Clicking modal submit button..."),a.click(),await E(1200))}const o=Date.now();for(;Date.now()-o<3500;){const l=Fe();if(l&&U(l))return console.log("[AGP:AutoJoin] Instant membership granted! Composer available."),C("✅ Joined group! Post box ready.",!0),{success:!0,isInstantMember:!0,reason:"Instant member"};await E(250)}const i=(document.body?document.body.innerText:"").toLowerCase();return i.includes("requested")||i.includes("pending")||i.includes("অনুরোধ করা হয়েছে")||i.includes("cancel request")||i.includes("অনুরোধ বাতিল")?(console.log("[AGP:AutoJoin] Join request sent (Pending admin approval)."),{success:!0,isInstantMember:!1,reason:"Join request pending admin approval"}):se()?{success:!0,isInstantMember:!1,reason:"Join submitted"}:{success:!0,isInstantMember:!1,reason:"Join request submitted"}}function ft(){if(ge())return{forbidden:!0,reason:"Group unavailable or broken link"};const t=(document.body?document.body.innerText:"").toLowerCase();return t.includes("only admins can post")||t.includes("শুধুমাত্র অ্যাডমিনরা এই গ্রুপে পোস্ট করতে পারবেন")||t.includes("শুধুমাত্র অ্যাডমিনরা পোস্ট করতে পারবেন")||t.includes("posting is paused for this group")||t.includes("posting is turned off")||t.includes("এই গ্রুপের জন্য পোস্ট করা সাময়িকভাবে বন্ধ আছে")||t.includes("posting in this group has been paused")?{forbidden:!0,reason:"Posting is paused or admin-only in this group"}:t.includes("you can't post to this group")||t.includes("you've been temporarily blocked")||t.includes("you have been muted")||t.includes("আপনার অ্যাকাউন্ট সাময়িকভাবে ব্লক করা হয়েছে")||t.includes("আপনাকে এই গ্রুপে পোস্ট করা থেকে সাময়িকভাবে নিষিদ্ধ করা হয়েছে")?{forbidden:!0,reason:"Account restricted or muted in this group"}:{forbidden:!1,reason:""}}let gt=!1;async function M(t){if(!(gt||!(h!=null&&h.queueItem))){gt=!0,O=!1,I&&(clearInterval(I),I=null);try{window.onbeforeunload=null}catch{}console.warn(`[AGP:AutoPost] Auto-skipping group: ${t}`),P=`⚡ Auto-skipping: ${t}...`,S(),C(`⚡ Auto-skipping: ${t}...`,!0),await E(200),chrome.runtime.sendMessage({type:"SKIP_CURRENT_ITEM",payload:{itemId:h.queueItem.id,reason:t}})}}async function Rt(t,e=15e3){const n=Date.now();for(;Date.now()-n<e;){const o=[t,...Array.from(document.querySelectorAll('[role="dialog"]'))];for(const i of o){const s=Array.from(i.querySelectorAll('[role="button"], button'));for(const l of s){const r=(l.getAttribute("aria-label")||"").toLowerCase().trim(),a=(l.textContent||"").toLowerCase().trim(),c=l.getAttribute("aria-disabled")==="true"||l.disabled||l.classList.contains("aria-disabled")||l.classList.contains("disabled");if((r==="post"||r==="publish"||r==="submit"||r==="submit for review"||r==="পোস্ট"||r==="সাবমিট"||r==="পোস্ট করুন"||r==="সাবমিট করুন"||r.includes("post to group")||r.includes("গ্রুপে পোস্ট")||r.includes("submit for review")||r.includes("রিভিউ")||a==="post"||a==="পোস্ট"||a==="publish"||a==="submit"||a==="submit for review"||a==="পোস্ট করুন"||a==="সাবমিট"||a==="সাবমিট করুন"||a==="post to group"||a==="পাবলিশ"||a.includes("submit for review")||a.includes("রিভিউয়ের জন্য সাবমিট"))&&!c)return l.scrollIntoView({behavior:"instant",block:"center"}),await E(30),l.style.outline="3px solid #10b981",l.dispatchEvent(new PointerEvent("pointerdown",{bubbles:!0,cancelable:!0})),l.dispatchEvent(new MouseEvent("mousedown",{bubbles:!0,cancelable:!0})),l.dispatchEvent(new PointerEvent("pointerup",{bubbles:!0,cancelable:!0})),l.dispatchEvent(new MouseEvent("mouseup",{bubbles:!0,cancelable:!0})),l.click(),!0}}await E(40)}return!1}async function ke(){if(O||!h||!h.queueItem)return;if(ge()){await M("Group unavailable on Facebook");return}if(!h.isGroupMatch){await M("Wrong group URL detected");return}if(ze()||se()){O=!0,P="⚡ Step 0/4: Auto-joining group (গ্রুপে যোগ দেওয়া হচ্ছে)...",S(),C("⚡ Auto-joining group...",!0);const e=await pt();if(e.isInstantMember)console.log("[AGP:AutoPost] Successfully auto-joined group! Proceeding with post..."),P="⚡ Joined! Step 1/4: Opening Post Box...",S(),C("✅ Joined! Now opening post box...",!0),await E(1e3);else{P=`⚡ ${e.reason}. Advancing to next group...`,S(),C(`⚡ ${e.reason}`,!0),await E(1800),await M(e.reason);return}}const t=ft();if(t.forbidden){await M(t.reason);return}O=!0,P="⚡ Step 1/4: Opening Post Box...",S();try{const e=await Lt();if(!e){if(ge()){await M("Group unavailable on Facebook");return}await M("Could not open Facebook post box");return}P="⚡ Step 2/4: Typing caption...",S();const n=h.caption||h.formattedPost||"";n&&n.trim()&&(await Mt(e,n)||(console.warn("[AGP:AutoPost] Caption injection check returned false, but clipboard has caption. Proceeding to photos..."),C("⚠️ Caption in clipboard (Ctrl+V ready)")));const o=h.media||[],i=o.some(u=>u.includes("video")||u.includes(".mp4")||u.includes(".mov")||u.includes(".webm")||u.includes("data:video"));if(o.length>0&&(P=i?`⚡ Step 3/4: Attaching video (${o.length} files)...`:`⚡ Step 3/4: Attaching ${o.length} photos...`,S(),!await Nt(e,o))){const f=ie(e);if(f){console.warn("[AGP:AutoPost] Upload rejected by Facebook:",f),P=`❌ Upload failed: ${f}`,S(),await M(`Media rejected by Facebook: ${f}`);return}console.warn("[AGP:AutoPost] Media attachment warning - continuing post workflow")}if(P="⚡ Step 4/4: Submitting post...",S(),!await Rt(e,15e3)){const u=ie(e);u?await M(`Facebook upload error: ${u}`):await M("Post button disabled or timed out");return}P="⚡ Post submitted! Shifting to next group...",S();const r=Date.now();let a=!1;const c=3500;for(;Date.now()-r<c;){const u=Se();if(!u){console.log("[AGP:AutoPost] Composer dialog closed cleanly. Post submitted successfully!"),a=!0;break}const f=ie(u);if(f){console.warn("[AGP:AutoPost] Post aborted due to Facebook file error:",f),P=`❌ Upload error: ${f}`,S(),await M(`Facebook upload error: ${f}`);return}const w=Array.from(document.querySelectorAll('[role="dialog"]'));for(const g of w){const y=(g.textContent||"").toLowerCase();if(y.includes("pending")||y.includes("approval")||y.includes("admin")||y.includes("অনুমোদনের অপেক্ষায়")||y.includes("অনুমোদন")||y.includes("সাবমিট করা হয়েছে")||y.includes("আপনার পোস্টটি জমা দেওয়া হয়েছে")){const m=Array.from(g.querySelectorAll('[role="button"], button')).find(x=>{const v=(x.textContent||"").toLowerCase().trim();return v==="done"||v==="ok"||v==="ঠিক আছে"||v==="close"||v==="বন্ধ করুন"||v==="got it"});if(m){m.click(),await E(150),a=!0;break}}}if(a)break;await E(60)}if(!a){const u=Se();if(u){const f=ie(u);if(f){console.warn("[AGP:AutoPost] Facebook upload error remained:",f),P=`❌ Upload failed: ${f}`,S(),await M(`Facebook upload error: ${f}`);return}if(!!u.querySelector('[aria-disabled="true"], button[disabled]')){console.warn("[AGP:AutoPost] Post button remained disabled after wait"),P="❌ Post button stayed disabled",S(),await M("Post button disabled or upload blocked by Facebook");return}}}try{window.onbeforeunload=null}catch{}P="⚡ Post submitted! Moving to next group...",S();const d=h.queueIndex,p=h.totalQueueItems,b=(h.postedCount||d-1)+1;C(`⚡ Auto-Posted to Group #${d}! (${b}/${p} done)`),chrome.runtime.sendMessage({type:"MARK_AS_POSTED",payload:{itemId:h.queueItem.id}})}catch(e){const n=e instanceof Error?e.message:String(e);console.log("[AGP:AutoPost] Routine caught error, auto-skipping:",n),await M(n||"Posting failed")}}function $t(){if(W||O||!(h!=null&&h.queueItem))return;if(ge()){P="⚡ Group unavailable on Facebook. Auto-skipping...",S(),setTimeout(()=>{M("Group unavailable on Facebook")},100);return}if(!h.isGroupMatch){P="⚡ Wrong group detected. Auto-skipping to next group...",S(),C("⚠️ Wrong group detected. Auto-skipping...",!0),setTimeout(()=>{W||M("Wrong group URL detected")},200);return}if(ze()||se()){P="⚡ Not joined: Auto-joining group...",S(),C("⚡ Auto-joining group...",!0),I&&clearInterval(I),I=null,setTimeout(()=>{!W&&!O&&ke()},100);return}const t=ft();if(t.forbidden){P=`⚡ Cannot post: ${t.reason}. Auto-skipping...`,S(),setTimeout(()=>{M(t.reason)},200);return}P="⚡ Instant Auto-Posting in progress...",S(),I&&clearInterval(I),I=null,setTimeout(()=>{!W&&!O&&ke()},80)}function S(){var f,w,g,y,m,x,v,T,_,j,$,K,L,q,Y,Te,Ge,F,D,ae;if(Ee||!A)return;const t=ee(),e=ue();if(!t.isGroupPage){const k=!!(re!=null&&re.isRunning),z=!!(re!=null&&re.isPaused),me=0,Ve=0,G=0;A.innerHTML=`
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

      ${oe?`
        <div class="launcher-pill" id="agp-launcher-btn" title="Click to open AI Group Poster Assistant">
          <div class="badge-logo">AI</div>
          <span class="launcher-title">AI Group Poster</span>
          ${k?`
            <span class="status-pill running">
              <span class="pulse-dot"></span>
              Auto-Posting (${me}/${Ve})
            </span>
          `:z?`
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
              ${k?'<span class="status-pill running"><span class="pulse-dot"></span> Auto-Posting</span>':z?'<span class="status-pill paused">⏸️ Paused</span>':'<span class="status-pill ready">⚡ Ready</span>'}
            </div>
            <div class="header-actions">
              <button class="icon-btn" id="agp-toggle-btn" title="Minimize">▼ Minimize</button>
              <button class="close-btn" id="agp-close-btn" title="Stop & Close (ডাইরেক্ট অফ)">✕</button>
            </div>
          </div>

          <div class="panel-body">
            ${k?`
              <div class="progress-container">
                <div class="progress-label">
                  <span>Posting: <strong>${me} of ${Ve}</strong> Groups</span>
                  <span>${G}%</span>
                </div>
                <div class="progress-bar-bg">
                  <div class="progress-bar-fill" style="width: ${G}%"></div>
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

              ${z?`
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

            ${k?`
              <button class="action-btn" id="btn-open-dashboard" style="width: 100%;">
                Open Full Dashboard ↗
              </button>
            `:""}
          </div>
        </div>
      `}
    `,(f=A.getElementById("agp-launcher-btn"))==null||f.addEventListener("click",Q=>{var mt;(mt=Q.target)!=null&&mt.closest("#agp-launcher-close")||(oe=!1,S())}),(w=A.getElementById("agp-toggle-btn"))==null||w.addEventListener("click",()=>{oe=!0,S()}),(g=A.getElementById("agp-close-btn"))==null||g.addEventListener("click",Q=>{Q.stopPropagation(),je()}),(y=A.getElementById("agp-launcher-close"))==null||y.addEventListener("click",Q=>{Q.stopPropagation(),je()}),(m=A.getElementById("btn-focus-tab"))==null||m.addEventListener("click",()=>{}),(x=A.getElementById("btn-pause-queue"))==null||x.addEventListener("click",()=>{chrome.runtime.sendMessage({type:"PAUSE_QUEUE"},()=>{C("Auto-posting paused"),be()})}),(v=A.getElementById("btn-resume-queue"))==null||v.addEventListener("click",()=>{chrome.runtime.sendMessage({type:"RESUME_QUEUE"},()=>{C("Resuming auto-posting..."),be()})}),(T=A.getElementById("btn-start-queue"))==null||T.addEventListener("click",()=>{chrome.runtime.sendMessage({type:"START_QUEUE"},()=>{C("Starting auto-posting queue..."),be()})}),(_=A.getElementById("btn-sync-groups"))==null||_.addEventListener("click",()=>{window.location.href="https://www.facebook.com/groups/joins/?nav_source=tab"}),(j=A.getElementById("btn-open-dashboard"))==null||j.addEventListener("click",()=>{chrome.runtime.sendMessage({type:"OPEN_DASHBOARD"})});return}const n=h==null?void 0:h.group,o=h==null?void 0:h.post,i=(h==null?void 0:h.queueIndex)||1,s=(h==null?void 0:h.totalQueueItems)||1,l=(h==null?void 0:h.postedCount)??Math.max(0,i-1),r=s>0?Math.round(l/s*100):0,a=(h==null?void 0:h.formattedPost)||(o==null?void 0:o.description)||"",c=(h==null?void 0:h.caption)||(o==null?void 0:o.caption)||(o==null?void 0:o.description)||"",d=h!=null&&h.media?h.media.length:o!=null&&o.images?o.images.length:0,p=h?h.isGroupMatch:!0,b=(h==null?void 0:h.expectedGroupName)||(n==null?void 0:n.name)||"Expected Group",u=t.groupName||"Current Page";A.innerHTML=`
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
        display: ${oe?"none":"block"};
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
        max-height: ${Ae?"160px":"55px"};
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
            ${oe?"▲ Expand":"▼ Minimize"}
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
            <span>Posted: <strong>${l} of ${s}</strong> Groups</span>
            <span>${r}%</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${r}%"></div>
          </div>
        </div>

        <div class="autopost-box">
          <div class="autopost-header">
            <span class="pulse-dot"></span>
            <span>${O?"Auto-Posting in Progress":W?"Auto-Pilot Paused":"Auto-Pilot Running"}</span>
          </div>
          <div class="autopost-status-text">${P}</div>
        </div>

        <div class="meta-row">
          <span class="group-name" title="${b}">${b}</span>
          <span class="queue-badge">Queue ${i} / ${s}</span>
        </div>

        <div class="post-card">
          <div class="post-title">${(o==null?void 0:o.productName)||(o==null?void 0:o.title)||"Prepared Listing"}</div>
          ${d>0?((o==null?void 0:o.images)||(h==null?void 0:h.media)||[]).some(k=>k.includes("video")||k.includes("data:video")||k.endsWith(".mp4")||k.endsWith(".webm")||k.endsWith(".mov"))?`<div class="media-badge" style="background:#065f46;color:#6ee7b7;border:1px solid #059669;">🎬 Video Attached (${d})</div>`:`<div class="media-badge">📷 ${d} Photos attached</div>`:""}
          <div class="post-preview">${c||a||"No prepared caption."}</div>
        </div>

        <button class="auto-btn ${O?"running":""}" id="btn-auto-post">
          ${O?"⏸️ Pause Auto-Posting":"🤖 Auto-Post Now"}
        </button>

        ${ze()||se()?`<button class="action-btn" id="btn-auto-join" style="background:#2563eb;color:#ffffff;font-weight:700;margin-top:6px;width:100%;justify-content:center;box-shadow:0 2px 4px rgba(37,99,235,0.3);">
                ➕ Auto-Join Group (গ্রুপে যোগ দিন)
              </button>`:""}

        <button class="action-btn primary-btn" id="btn-mark-posted">
          ✅ Mark Posted & Next Group
        </button>

        <div class="button-grid">
          <button class="action-btn" id="btn-toggle-caption">
            ${Ae?"Collapse":"👁️ View Caption"}
          </button>
          <button class="action-btn" id="btn-copy-caption">✍️ Copy Caption</button>
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
  `,($=A.getElementById("agp-toggle-btn"))==null||$.addEventListener("click",()=>{oe=!oe,S()}),(K=A.getElementById("agp-close-btn"))==null||K.addEventListener("click",k=>{k.stopPropagation(),je()}),(L=A.getElementById("btn-auto-post"))==null||L.addEventListener("click",()=>{O?(W=!0,O=!1,P="Auto-posting paused by user",I&&clearInterval(I),C("Auto-posting paused"),S()):(W=!1,I&&clearInterval(I),ke())}),(q=A.getElementById("btn-auto-join"))==null||q.addEventListener("click",async()=>{const k=A==null?void 0:A.getElementById("btn-auto-join");k&&(k.textContent="⏳ Joining..."),(await pt()).isInstantMember&&ke()}),(Y=A.getElementById("btn-toggle-caption"))==null||Y.addEventListener("click",()=>{Ae=!Ae,S()}),(Te=A.getElementById("btn-copy-caption"))==null||Te.addEventListener("click",async()=>{const z=Qe(c||a).replace(/\r\n/g,`
`).replace(/\r/g,`
`).trim();await lt(z)&&C("Caption copied to clipboard!")}),(Ge=A.getElementById("btn-mark-posted"))==null||Ge.addEventListener("click",()=>{var k;I&&clearInterval(I);try{window.onbeforeunload=null}catch{}chrome.runtime.sendMessage({type:"MARK_AS_POSTED",payload:{itemId:(k=h==null?void 0:h.queueItem)==null?void 0:k.id}},()=>{C("Marked as Posted! Moving to next group...")})}),(F=A.getElementById("btn-skip"))==null||F.addEventListener("click",()=>{var k;I&&clearInterval(I);try{window.onbeforeunload=null}catch{}chrome.runtime.sendMessage({type:"SKIP_CURRENT_ITEM",payload:{itemId:(k=h==null?void 0:h.queueItem)==null?void 0:k.id,reason:"Skipped by user"}},()=>{C("Skipped group. Moving to next...")})}),(D=A.getElementById("btn-pause"))==null||D.addEventListener("click",()=>{I&&clearInterval(I),W=!0,O=!1,chrome.runtime.sendMessage({type:"PAUSE_QUEUE"},()=>{C("Posting Session Paused")})}),(ae=A.getElementById("btn-open-dashboard"))==null||ae.addEventListener("click",()=>{chrome.runtime.sendMessage({type:"OPEN_DASHBOARD"})})}function Ut(){Ee||(V||(V=document.createElement("div"),V.id="ai-group-poster-dock-root",document.body.appendChild(V),A=V.attachShadow({mode:"open"})),S())}function be(){var n;if(Ee)return;const t=ee(),e=ue();e.isLoggedIn&&chrome.runtime.sendMessage({type:"FB_USER_PROFILE_DETECTED",payload:e}),t.isGroupPage?(chrome.runtime.sendMessage({type:"FB_PAGE_DETECTED",payload:{url:t.canonicalUrl,groupIdOrSlug:t.groupIdOrSlug,pageTitle:t.groupName}}),chrome.runtime.sendMessage({type:"GET_ACTIVE_POST_FOR_TAB",payload:{url:t.canonicalUrl}},o=>{chrome.runtime.lastError||o!=null&&o.isUserTab||o&&o.payload&&(h=o.payload,Ut(),h&&h.queueItem&&$t())})):_t()&&(console.log("[AGP:Content] Facebook Group Search Page detected."),qe(),typeof chrome<"u"&&((n=chrome.storage)!=null&&n.local)&&chrome.storage.local.get(["agp_pending_auto_join","agp_auto_join_config"],o=>{const i=o==null?void 0:o.agp_pending_auto_join,s=o==null?void 0:o.agp_auto_join_config;if(i&&i.active&&Date.now()-(i.requestedAt||0)<9e4){console.log("[AGP:Content] Detected pending Auto-Join request. Starting auto-joiner..."),chrome.storage.local.remove("agp_pending_auto_join");const l=i.config||s||{searchUrl:window.location.href,delaySec:0,maxGroups:0,autoAnswerQuestions:!0,defaultAnswer:"Yes, I agree to the group rules and guidelines.",saveToGroups:!0};qe(l),setTimeout(()=>{N.getInstance().start(l)},1500)}}))}function Dt(){if(typeof document>"u"||!document.body)return;const t=document.getElementById("agp-sync-window-overlay");t&&t.remove();const e=document.createElement("div");e.id="agp-sync-window-overlay",e.innerHTML=`
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
  `,document.body.appendChild(e)}function Je(){const t=document.getElementById("agp-sync-window-overlay");t&&t.remove()}let Ce=null;chrome.runtime.onMessage.addListener((t,e,n)=>{if(t.type==="START_GROUP_DISCOVERY")return(async()=>{try{console.log("[AGP:Content] Starting deep group discovery scan on current Facebook page...");const o=ue(),i=o.userId||o.name||void 0;Dt(),Pe();const s=await Ke({maxRounds:350,stagnantLimit:30,scrollDelayMs:900,accountContext:i,onBatchDiscovered:async(c,d,p)=>{Ce=p;const b=Ie(),u=[...c];for(const f of b)u.find(w=>w.groupId.toLowerCase()===f.groupId.toLowerCase())||u.push(f);try{chrome.runtime.sendMessage({type:"GROUP_BATCH_DISCOVERED",payload:{liveGroups:u,verifiedCount:u.length,duplicatesRemoved:(p==null?void 0:p.duplicatesRemoved)||0,debugMetrics:p}})}catch{}try{await xe(u,{syncMode:"merge",accountContext:i})}catch(f){console.warn("[AGP:Content] Progressive batch merge error:",f)}},onProgress:(c,d,p,b)=>{Ce=b;const u=H.size,f=Math.max(c,u);try{chrome.runtime.sendMessage({type:"GROUP_DISCOVERY_PROGRESS",payload:{foundCount:f,status:d,targetCount:p,debugMetrics:b}})}catch{}}}),l=Ie();if(l.length>0)try{await xe(l,{syncMode:"merge",accountContext:i})}catch{}const r=[...s.groups];for(const c of l)r.find(d=>d.groupId.toLowerCase()===c.groupId.toLowerCase())||r.push(c);const a=Math.max(s.totalFound,r.length);Ce=s.debugMetrics,Je(),n({success:!0,payload:{groups:r,sourceUrl:window.location.href,isLoggedIn:s.isLoggedIn,totalFoundOnPage:a,profile:o,outcome:s.outcome,completionReason:s.completionReason,isPartial:s.isPartial,debugMetrics:s.debugMetrics}})}catch(o){Je();const i=o instanceof Error?o.message:String(o);n({success:!1,error:i})}})(),!0;if(t.type==="CANCEL_GROUP_DISCOVERY")return Je(),C("AI Group Poster: Discovery cancelled.",!0),n({success:!0}),!1;if(t.type==="GET_DEBUG_METRICS")return n({success:!0,debugMetrics:Ce}),!1;if(t.type==="CHECK_FACEBOOK_SESSION"){const o=we(),i=ue();return n({success:!0,isLoggedIn:o,profile:i,currentUrl:window.location.href}),!1}if(t.type==="GET_FACEBOOK_USER_INFO")return(async()=>{try{const o=we(),i=ue();let l=Le(i.userId||i.name||void 0).items;n({success:!0,isLoggedIn:o,profile:i,groups:l,totalGroups:l.length,currentUrl:window.location.href})}catch(o){const i=o instanceof Error?o.message:String(o);n({success:!1,error:i})}})(),!0;if(t.type==="START_AUTO_JOIN"||t.type==="AUTO_JOIN_START_ON_PAGE")return(async()=>{try{const o=t.payload||{},i={...o,delaySec:typeof o.delaySec=="number"?o.delaySec:0};qe(i);const s=await N.getInstance().start(i);n({success:!0,state:s})}catch(o){const i=o instanceof Error?o.message:String(o);n({success:!1,error:i})}})(),!0;if(t.type==="PAUSE_AUTO_JOIN"||t.type==="AUTO_JOIN_PAUSE_ON_PAGE")return N.getInstance().pause(),n({success:!0}),!1;if(t.type==="RESUME_AUTO_JOIN"||t.type==="AUTO_JOIN_RESUME_ON_PAGE")return N.getInstance().resume(),n({success:!0}),!1;if(t.type==="STOP_AUTO_JOIN"||t.type==="AUTO_JOIN_STOP_ON_PAGE")return N.getInstance().stop(),n({success:!0}),!1;if(t.type==="GET_AUTO_JOIN_STATE"){const o=N.getInstance().getState();return n({success:!0,state:o}),!1}});let We=!1,H=new Map;function Pe(){if(typeof window>"u"||window.__agpFetchIntercepted)return;window.__agpFetchIntercepted=!0;const t=window.fetch;window.fetch=async function(...e){var o;const n=await t.apply(this,e);try{const i=typeof e[0]=="string"?e[0]:((o=e[0])==null?void 0:o.url)||"";(i.includes("/api/graphql")||i.includes("graphql"))&&n.clone().text().then(l=>{l.includes("Group")&&(l.includes("/groups/")||l.includes('__typename":"Group"'))&&qt(l)}).catch(()=>{})}catch{}return n},console.log("[AGP:Content] GraphQL response interceptor installed")}function qt(t){try{const e=/"__typename"\s*:\s*"Group"[^}]*?"id"\s*:\s*"(\d+)"[^}]*?"name"\s*:\s*"([^"]+)"/g;let n;for(;(n=e.exec(t))!==null;){const i=n[1],s=n[2].trim();i&&s&&s.length>=2&&H.set(i,{name:s,id:i})}const o=/"node"\s*:\s*\{\s*"__typename"\s*:\s*"Group"\s*,\s*"id"\s*:\s*"(\d+)"\s*,\s*"name"\s*:\s*"([^"]+)"/g;for(;(n=o.exec(t))!==null;){const i=n[1],s=n[2].trim();i&&s&&s.length>=2&&H.set(i,{name:s,id:i})}H.size>0&&console.log(`[AGP:Content] GraphQL interceptor: total ${H.size} groups captured`)}catch{}}function Ie(){const t=[];for(const[e,n]of H)t.push({name:n.name,url:`https://www.facebook.com/groups/${e}/`,groupId:e,privacy:"UNKNOWN",imageUrl:n.imageUrl});return t}async function bt(){const t=window.location.href.toLowerCase();if((t.includes("/groups/joins")||t.includes("category=membership"))&&!We){We=!0,console.log("[AGP:Content] Detected Your Groups page (/groups/joins/)! Starting full auto-scan of all joined groups..."),C("AI Group Poster: Auto-scanning your joined groups..."),Pe();try{const e=await Ke({maxRounds:350,stagnantLimit:30,scrollDelayMs:900,onBatchDiscovered:async(i,s)=>{const l=Ie(),r=[...i];for(const a of l)r.find(c=>c.groupId===a.groupId)||r.push(a);try{await xe(r,{syncMode:"merge"})}catch(a){console.warn("[AGP:Content] Batch save err:",a)}},onProgress:(i,s,l)=>{const r=H.size,a=Math.max(i,r);C(`AI Group Poster: Found ${a}${l?` / ${l}`:""} groups...`);try{chrome.runtime.sendMessage({type:"GROUP_DISCOVERY_PROGRESS",payload:{foundCount:a,status:s,targetCount:l}})}catch{}}}),n=Ie();if(n.length>0)try{await xe(n,{syncMode:"merge"}),console.log(`[AGP:Content] Final merge: added ${n.length} intercepted groups`)}catch{}const o=Math.max(e.totalFound,H.size);C(`AI Group Poster: Sync complete! Found ${o} groups.`)}catch(e){console.warn("[AGP:Content] Auto-scan err:",e)}finally{We=!1}}}(window.location.href.toLowerCase().includes("/groups/joins")||window.location.href.toLowerCase().includes("category=membership"))&&Pe(),be(),setTimeout(bt,3e3);let _e=window.location.href;new MutationObserver(()=>{window.location.href!==_e&&(_e=window.location.href,be(),(_e.toLowerCase().includes("/groups/joins")||_e.toLowerCase().includes("category=membership"))&&Pe(),setTimeout(bt,3e3))}).observe(document.body,{childList:!0,subtree:!0})})();
