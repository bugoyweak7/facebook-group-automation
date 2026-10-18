(function(){"use strict";function He(o){const e=[];if(!o||typeof o!="string")return{valid:!1,errors:["URL is required"]};const t=o.trim();if(!t)return{valid:!1,errors:["URL cannot be empty"]};let n=t;/^https?:\/\//i.test(n)||(n="https://"+n);let r;try{r=new URL(n)}catch{return{valid:!1,errors:["Invalid URL format"]}}const s=["facebook.com","www.facebook.com","web.facebook.com","m.facebook.com"],a=r.hostname.toLowerCase();s.some(w=>a===w||a.endsWith("."+w))||e.push("URL must be a Facebook domain (e.g. facebook.com, web.facebook.com)");const c=r.pathname.split("/").filter(Boolean),l=c.indexOf("groups");if(l===-1||l>=c.length-1)return e.push("URL must point directly to a Facebook group (e.g. /groups/group_name)"),{valid:!1,errors:e};const d=decodeURIComponent(c[l+1]);if(!d||["feed","discover","joins","about","settings","notifications","search","categories","create","help","privacy","support"].includes(d.toLowerCase()))return e.push("URL must point to a specific group, not a feed or discovery page"),{valid:!1,errors:e};const h=c.slice(l+2).map(w=>w.toLowerCase()),u=["permalink","posts","user","photos","videos","events","files","stories"];if(h.some(w=>u.includes(w)))return e.push("URL points to an individual post or permalink inside a group, not the group itself"),{valid:!1,errors:e};if(r.searchParams.has("comment_id")||r.searchParams.has("notif_id")||r.searchParams.has("notif_t"))return e.push("URL is a notification or comment permalink, not a group page"),{valid:!1,errors:e};const p=`https://www.facebook.com/groups/${d}/`;return{valid:e.length===0,errors:e,cleanUrl:p,groupId:d}}const Ge={META_OG_TITLE:'meta[property="og:title"]',HEADER_H1:'h1[dir="auto"], h1 span'};function Le(){if(typeof window>"u")return{isGroupPage:!1,groupIdOrSlug:"",groupName:"",canonicalUrl:"",isReady:!1};const o=window.location.href,e=He(o);if(!e.valid||!e.groupId)return{isGroupPage:!1,groupIdOrSlug:"",groupName:"",canonicalUrl:o,isReady:!1};let t="";const n=document.querySelector(Ge.META_OG_TITLE);if(n&&n.content&&(t=n.content.replace(/\s*\|\s*Facebook.*$/i,"").trim()),!t){const s=document.querySelector(Ge.HEADER_H1);s&&s.innerText&&(t=s.innerText.trim())}!t&&document.title&&(t=document.title.replace(/\s*\|\s*Facebook.*$/i,"").trim()),t||(t=e.groupId.replace(/[-_.]+/g," "),t=t.charAt(0).toUpperCase()+t.slice(1));const r=document.readyState==="interactive"||document.readyState==="complete";return{isGroupPage:!0,groupIdOrSlug:e.groupId,groupName:t,canonicalUrl:e.cleanUrl||o,isReady:r}}const Ye=new Set(["feed","discover","create","notifications","search","categories","joins","member-requests","expert_badge","settings","about","events","media","files","chats","manage","canvas","support","buy_sell_discussion","permalink","user","profile.php","hashtag","messages","marketplace","stories","reels","watch","gaming","members","photos","videos","posts"]),ee=new Set(["view group","visit","open","view","join","group","groups","view all","see all","see more","গ্রুপ দেখুন","দেখুন","সব দেখুন","যোগ দিন","গ্রুপে যান","আরও দেখুন"]);function Qe(o){const e={"০":"0","১":"1","২":"2","৩":"3","৪":"4","৫":"5","৬":"6","৭":"7","৮":"8","৯":"9"};return o.replace(/[০-৯]/g,t=>e[t]||t)}function Xe(o){if(typeof document>"u")return{count:null,status:"UNAVAILABLE",rawText:""};const t=Array.from(document.querySelectorAll('h1, h2, h3, h4, span[dir="auto"], strong, div, p')),n=[/(?:All groups you['’]?ve joined|Groups you['’]?ve joined)\s*\(([0-9,kKmM\u09E6-\u09EF.]+)\)/i,/(?:আপনার যোগ দেওয়া সমস্ত গ্রুপ|আপনার যোগ দেওয়া সব গ্রুপ|আপনি যেসব গ্রুপে যোগ দিয়েছেন|যোগ দেওয়া সমস্ত গ্রুপ|যোগ দেওয়া সব গ্রুপ|যোগ দেওয়া গ্রুপ|সব গ্রুপ)\s*\(([0-9,kKmM\u09E6-\u09EF.]+)\)/i,/^All groups you['’]?ve joined\s*[:\-•]?\s*([0-9,kKmM\u09E6-\u09EF.]+)$/i],r=[/(?:Joined Groups|Your Groups|আমার গ্রুপ)\s*\(([0-9,kKmM\u09E6-\u09EF.]+)\)/i,/(?:Groups|গ্রুপ)\s*\(([0-9,kKmM\u09E6-\u09EF.]+)\)/i],s=a=>{const i=Qe(a).replace(/,/g,"").trim().toLowerCase();if(i.endsWith("k")){const l=parseFloat(i.replace("k",""));return isNaN(l)?null:Math.round(l*1e3)}if(i.endsWith("m")){const l=parseFloat(i.replace("m",""));return isNaN(l)?null:Math.round(l*1e6)}const c=parseInt(i,10);return isNaN(c)?null:c};for(const a of t){const i=(a.textContent||"").trim();if(!(i.length>120||i.length<3))for(const c of n){const l=i.match(c);if(l&&l[1]){const d=s(l[1]);if(d!==null&&d>0)return{count:d,status:"CONFIRMED",rawText:i}}}}for(const a of t){const i=(a.textContent||"").trim();if(!(i.length>80||i.length<3))for(const c of r){const l=i.match(c);if(l&&l[1]){const d=s(l[1]);if(d!==null&&d>0)return{count:d,status:"UNCERTAIN",rawText:i}}}}return{count:null,status:"UNAVAILABLE",rawText:""}}function Ze(o=document){const e=["end of results","no more groups to show","you’ve reached the end","you've reached the end","সব গ্রুপ দেখানো হয়েছে","ফলাফলের সমাপ্তি"],t=o.querySelectorAll('div[role="status"], span[dir="auto"], div, p');for(const n of t){const r=(n.textContent||"").trim().toLowerCase();if(!(r.length>100||r.length<5)){for(const s of e)if(r.includes(s))return!0}}return!1}function te(o){if(!o)return"";let e=o.trim();return e=e.replace(/^(?:Visit|Open|View|গ্রুপ দেখুন|দেখুন)\s+/i,""),e=e.replace(/\s*(?:Last active|You last visited|last visited|active)\s+[^\n]+/i,""),e=e.replace(/\s*(?:গত|আগে|মিনিট আগে|ঘণ্টা আগে|দিন আগে)[^\n]*/i,""),e=e.replace(/\s*·\s*(?:Public group|Private group|পাবলিক গ্রুপ|প্রাইভেট গ্রুপ).*$/i,""),e=e.replace(/\s*·\s*\d+.*members.*$/i,""),e=e.replace(/\s*·\s*[০-৯\d]+.*সদস্য.*$/i,""),e=e.replace(/\s*·\s*[^\n]+/i,""),e.trim()}function et(o){var m,h;const e=u=>({valid:!1,reason:u,name:"",url:"",groupId:"",privacy:"UNKNOWN"}),t=o.href||o.getAttribute("href")||"";if(!t||!t.includes("/groups/"))return e("Not a group link");if(t.includes("/permalink/")||t.includes("/posts/")||t.includes("/photos/")||t.includes("/videos/")||t.includes("comment_id=")||t.includes("notif_id="))return e("Post or photo permalink, not a group home");let n="";try{const p=new URL(t,"https://www.facebook.com").pathname.split("/").filter(Boolean),w=p.indexOf("groups");if(w!==-1&&p[w+1]&&(n=p[w+1],p.length>w+2)){const f=p[w+2].toLowerCase();if(["posts","permalink","photos","videos","user","media"].includes(f))return e("Post or photo permalink, not a group home")}}catch{return e("Malformed URL")}if(!n||Ye.has(n.toLowerCase()))return e("Non-group system path");if(o.closest('[aria-label*="Notification" i], [aria-label*="বিজ্ঞপ্তি" i], [data-pagelet*="Notification" i]'))return e("Inside notification flyout");const r=o.closest('div[role="listitem"], div[role="article"], div[role="gridcell"], li, div[role="row"]')||((m=o.parentElement)==null?void 0:m.parentElement)||o.parentElement;if(r){const u=(r.textContent||"").toLowerCase();if(u.includes("sponsored")||u.includes("বিজ্ঞাপন")||r.querySelector('[aria-label*="Sponsored" i], [aria-label*="বিজ্ঞাপন" i]'))return e("Sponsored advertisement");if((r.querySelectorAll?Array.from(r.querySelectorAll('a[href*="/groups/"]')):[]).length<=4){if(u.includes("requested to join")||u.includes("অনুরোধ পাঠানো হয়েছে")||u.includes("answer questions")||u.includes("update responses")||u.includes("suggested for you")||u.includes("আপনার জন্য প্রস্তাবিত")||u.includes("suggested groups")||u.includes("প্রস্তাবিত গ্রুপ"))return e("Unjoined or suggested group");if(r.querySelectorAll){const f=Array.from(r.querySelectorAll('button, [role="button"]'));for(const y of f){const g=(y.textContent||y.getAttribute("aria-label")||"").trim().toLowerCase();if((g==="join"||g==="join group"||g==="যোগ দিন"||g==="গ্রুপে যোগ দিন"||g==="request to join")&&!u.includes("view group")&&!u.includes("গ্রুপ দেখুন")&&!u.includes("visited")&&!u.includes("last active"))return e("Card has Join button, not joined")}}}}let s="";const a=(o.getAttribute("aria-label")||"").trim();if(a&&a.length>=2&&!ee.has(a.toLowerCase())&&(s=te(a)),!s){const u=(o.textContent||o.innerText||"").trim(),p=te(u);p&&p.length>=2&&!ee.has(p.toLowerCase())&&(s=p)}if(!s){const u=Array.from(o.querySelectorAll('h1, h2, h3, h4, span[dir="auto"], strong, span'));for(const p of u){const w=te((p.textContent||"").trim()),f=w.toLowerCase();if(w.length>=2&&!ee.has(f)&&!f.includes("last active")&&!f.includes("you last visited")&&!f.includes("members")&&!f.includes("সদস্য")&&!f.includes("ago")){s=w;break}}}if(!s&&r){const u=r.querySelector('h1, h2, h3, h4, [role="heading"]');if(u&&u.textContent){const p=te(u.textContent.trim());p.length>=2&&!ee.has(p.toLowerCase())&&(s=p)}}if(!s&&r){const u=Array.from(r.querySelectorAll('h1, h2, h3, h4, span[dir="auto"], strong, a[href*="/groups/"] > span'));for(const p of u){if(p===o)continue;const w=te((p.textContent||"").trim()),f=w.toLowerCase();if(w.length>=2&&w.length<200&&!ee.has(f)&&!f.includes("view group")&&!f.includes("you last visited")&&!f.includes("last active")&&!f.includes("members")&&!f.includes("সদস্য")&&!f.includes("hours ago")&&!f.includes("minutes ago")&&!f.includes("days ago")&&!f.includes("ঘণ্টা আগে")&&!f.includes("দিন আগে")&&!/^\d+ (hours?|minutes?|days?|weeks?) ago$/i.test(f)){s=w;break}}}s||(s=n.split(/[-_.]+/).filter(Boolean).map(u=>u.charAt(0).toUpperCase()+u.slice(1)).join(" "));let i="";const c=r!=null&&r.querySelector?r.querySelector("img, image")||o.querySelector("img, image"):null;c&&(i=c.getAttribute("src")||c.getAttribute("href")||((h=c.href)==null?void 0:h.baseVal)||"",(i.includes("/rsrc.php/")||i.includes("spacer")||i.includes("1x1"))&&(i=""));let l="UNKNOWN";const d=u=>{const p=(u||"").toLowerCase();return p.includes("public group")||p.includes("পাবলিক গ্রুপ")||p.includes("public")||p.includes("পাবলিক")?"PUBLIC":p.includes("private group")||p.includes("প্রাইভেট গ্রুপ")||p.includes("private")||p.includes("প্রাইভেট")?"PRIVATE":"UNKNOWN"};if(r){const u=d(r.textContent||"");if(u!=="UNKNOWN")l=u;else if(r.querySelectorAll){const p=Array.from(r.querySelectorAll("span, div, p"));for(const w of p){const f=d(w.textContent||"");if(f!=="UNKNOWN"){l=f;break}}}}return l==="UNKNOWN"&&(l=d(o.textContent||"")),{valid:!0,name:s,url:`https://www.facebook.com/groups/${n}/`,groupId:n,imageUrl:i,privacy:l}}function le(){if(typeof document>"u")return!1;const o=typeof window<"u"?window.location.href:"";if(o.includes("/login")||o.includes("/recover")||o.includes("/checkpoint"))return!1;const e=document.body&&(document.body.innerText||document.body.textContent)||"";return e.includes("What's on your mind")||e.includes("আপনার মনে কী আছে")||e.includes("কী ভাবছেন")||e.includes("Professional dashboard")||e.includes("Ads Manager")||e.includes("Meta Business Suite")?!0:!!document.querySelector('[role="navigation"], [data-pagelet="LeftRail"], [aria-label="Facebook"], input[placeholder*="Search" i], [aria-label*="profile" i], [aria-label*="Account" i], a[href*="/me/"], a[href*="/groups/"]')||!!(document.cookie&&document.cookie.includes("c_user"))}function oe(){var i,c;if(typeof document>"u")return{isLoggedIn:!1,name:"",profileUrl:""};let o="",e="",t="",n="";if(document.body){const d=(document.body.innerText||document.body.textContent||"").match(/(?:What['’]s on your mind|আপনার মনে কী আছে|কী ভাবছেন)[,?\s]+([^?!\n]+?)(?:\?|$)/i);if(d&&d[1]){const m=d[1].trim().replace(/[?,!]+$/,"").trim();m.length>=2&&m.length<=50&&!m.toLowerCase().includes("facebook")&&(o=m)}}const r=Array.from(document.querySelectorAll('a[href*="/me/"], a[href*="facebook.com/profile"], [role="navigation"] a[href]'));for(const l of r){const d=l.getAttribute("href")||l.href||"",m=l.querySelector('span[dir="auto"], span, strong, h1'),h=(m?m.textContent:l.innerText||l.textContent||"").trim();if(h&&h.length>=2&&h.length<=35&&!["Home","Friends","Feeds","Groups","Watch","Marketplace","Memories","Saved","Video","Settings","Meta AI","Professional dashboard","Ads Manager","Ad Center","Meta Business Suite","See more","See all","Facebook","Menu","Notifications"].includes(h)){o||(o=h),!e&&d&&(e=d);const p=l.querySelector("image, img");if(p&&!t&&(t=p.getAttribute("src")||((i=p.href)==null?void 0:i.baseVal)||""),o)break}}const s=document.querySelector('[aria-label="Your profile" i], [aria-label*="Your profile" i], [aria-label*="Account Controls" i], [aria-label*="আপনার প্রোফাইল" i]');if(s&&!t){const l=s.querySelector("image, img");l&&(t=l.getAttribute("src")||((c=l.href)==null?void 0:c.baseVal)||"")}try{const l=Array.from(document.querySelectorAll("script"));for(const d of l){const m=d.textContent||"";if(m.includes('"NAME":')||m.includes('"USER_ID":')||m.includes('"short_name":')){const h=m.match(/"NAME":\s*"([^"]+)"/)||m.match(/"short_name":\s*"([^"]+)"/);if(h&&h[1]&&!o)try{o=JSON.parse(`"${h[1]}"`)}catch{o=h[1]}const u=m.match(/"USER_ID":\s*"(\d+)"/);if(u&&u[1]&&!n&&(n=u[1]),o)break}}}catch{}if(!n&&document.cookie){const l=document.cookie.match(/c_user=(\d+)/);l&&(n=l[1])}const a=le()||!!(o||n);return{isLoggedIn:a,name:o||(a?"Facebook User":""),profileUrl:e||"https://www.facebook.com",avatarUrl:t,userId:n}}function tt(o){if(typeof document>"u")return[];const e=new Map,t=Date.now();try{const n=Array.from(document.querySelectorAll("script"));for(const r of n){const s=r.textContent||"";if(s.length<40)continue;const a=[/"__typename"\s*:\s*"Group"[\s\S]{0,500}?"id"\s*:\s*"(\d+)"[\s\S]{0,500}?"name"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/g,/"__typename"\s*:\s*"Group"[\s\S]{0,500}?"name"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"[\s\S]{0,500}?"id"\s*:\s*"(\d+)"/g,/"node"\s*:\s*\{[\s\S]{0,120}?"__typename"\s*:\s*"Group"[\s\S]{0,350}?"id"\s*:\s*"(\d+)"[\s\S]{0,350}?"name"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/g,/"node"\s*:\s*\{[\s\S]{0,120}?"__typename"\s*:\s*"Group"[\s\S]{0,350}?"name"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"[\s\S]{0,350}?"id"\s*:\s*"(\d+)"/g,/\{"id"\s*:\s*"(\d+)"[\s\S]{0,300}?"name"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"[\s\S]{0,300}?(?:"__typename"\s*:\s*"Group"|url"\s*:\s*"https:[^"]*?\/groups\/[^"]+?")/g,/\{"name"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"[\s\S]{0,300}?"id"\s*:\s*"(\d+)"[\s\S]{0,300}?(?:"__typename"\s*:\s*"Group"|url"\s*:\s*"https:[^"]*?\/groups\/[^"]+?")/g];for(const i of a){let c;for(;(c=i.exec(s))!==null;){let l="",d="";if(/^\d+$/.test(c[1])?(l=c[1],d=c[2]):/^\d+$/.test(c[2])&&(l=c[2],d=c[1]),l&&d){d=d.trim();try{d=d.replace(/\\u[\dA-Fa-f]{4}/g,h=>String.fromCharCode(parseInt(h.replace("\\u",""),16)))}catch{}const m=s.slice(Math.max(0,c.index-350),Math.min(s.length,c.index+600));if(m.includes('"__typename":"User"')||m.includes('"__typename":"Actor"')||m.includes('"__typename":"Story"')||m.includes('"__typename":"Comment"')||m.includes('"__typename":"Page"')||o&&d.toLowerCase()===o.toLowerCase())continue;if(d.length>=2&&!e.has(l)){let h="";const p=s.slice(Math.max(0,c.index-500),Math.min(s.length,c.index+1e3)).match(/"(?:uri|url|cover_photo|image)"\s*:\s*\{[^}]*"uri"\s*:\s*"([^"]+)"/);if(p&&p[1]){let w=p[1];try{w=w.replace(/\\u[\dA-Fa-f]{4}/g,f=>String.fromCharCode(parseInt(f.replace("\\u",""),16)))}catch{}!w.includes("/rsrc.php/")&&!w.includes("1x1")&&(h=w.replace(/\\\//g,"/"))}e.set(l,{name:Ue(d,l),url:`https://www.facebook.com/groups/${l}/`,groupId:l,privacy:"UNKNOWN",imageUrl:h,verified:!0,source:"facebook-ui",accountContext:o,discoveredAt:t})}}}}}}catch(n){console.warn("[AGP:Discovery] Script tags extraction warning:",n)}return Array.from(e.values())}function xe(o){if(typeof document>"u")return{items:[],rejectedCount:0};const e=new Map;let t=0;const n=Date.now(),r=tt(o);for(const a of r)e.set(a.groupId.toLowerCase(),a);const s=Array.from(document.querySelectorAll('a[href*="/groups/"]'));for(const a of s){const i=et(a);if(!i.valid||!i.name||!i.url||!i.groupId){t++;continue}const c=i.groupId.toLowerCase(),l=e.get(c);l?(!l.imageUrl&&i.imageUrl&&(l.imageUrl=i.imageUrl),i.name&&l.name.length<i.name.length&&(l.name=i.name),i.privacy!=="UNKNOWN"&&(l.privacy=i.privacy)):e.set(c,{name:i.name,url:i.url,groupId:i.groupId,privacy:i.privacy,imageUrl:i.imageUrl,verified:!0,source:"facebook-ui",accountContext:o,discoveredAt:n})}return{items:Array.from(e.values()),rejectedCount:t}}function _e(){if(typeof document>"u")return 0;let o=0;const e=Array.from(document.querySelectorAll('div[role="button"], button, span[dir="auto"], [role="navigation"] [role="button"], [data-pagelet="LeftRail"] [role="button"]'));for(const t of e){const n=(t.textContent||t.getAttribute("aria-label")||"").trim().toLowerCase();if(n==="see more"||n==="আরও দেখুন"||n==="see all"||n==="সব দেখুন"||n==="see all groups"||n==="সব গ্রুপ দেখুন"||n==="view more")try{(t.closest('[role="button"], button')||t).click(),o++}catch{}}return o}async function Te(o={}){var g,C,A,T,M,D;const e=o.maxRounds||350,t=o.stagnantLimit||35,n=o.scrollDelayMs!==void 0?o.scrollDelayMs:900,r=o.accountContext,s=Date.now(),a=le(),i=new Map;let c=0,l=0,d=0,m=0;const h=Xe(),u=h.count,p=h.status;console.log(`[AGP:Engine] Discovery started. Target count: ${u??"N/A"} (Status: ${p})`);const w=R=>({candidateCount:i.size+l,verifiedCount:i.size,duplicatesRemoved:c,rejectedCount:l,scrollIterations:m,mutationEvents:d,targetCount:u,targetCountStatus:p,completionReason:R,scanDurationMs:Date.now()-s,lastNewGroupTimestamp:i.size>0?Date.now():null}),f=R=>{let W=0;for(const L of R){const O=L.groupId.toLowerCase();i.has(O)?c++:(i.set(O,L),W++)}return W};let y=null;typeof MutationObserver<"u"&&typeof document<"u"&&(y=new MutationObserver(R=>{d+=R.length}),y.observe(document.body||document.documentElement,{childList:!0,subtree:!0}));try{try{_e()}catch{}const R=xe(r);if(l+=R.rejectedCount,f(R.items)>0&&o.onBatchDiscovered)try{await o.onBatchDiscovered(Array.from(i.values()),i.size,w(null))}catch{}if(o.onProgress){const F=u?`Found ${i.size} of ${u} groups...`:`Found ${i.size} groups...`;o.onProgress(i.size,F,u,w(null))}if(p==="CONFIRMED"&&u!==null&&i.size>=u){const F=w("TARGET_REACHED");return console.log(`[AGP:Engine] Target count of ${u} confirmed on initial scan.`),{isLoggedIn:a,groups:Array.from(i.values()),totalFound:i.size,targetCount:u,isPartial:!1,outcome:"COMPLETE",completionReason:"TARGET_REACHED",debugMetrics:F}}let L=0,O="PARTIAL",V="STAGNANT_TIMEOUT";for(let F=0;F<e;F++){if(m++,F%3===0)try{_e()}catch{}const $=Array.from(document.querySelectorAll('a[href*="/groups/"]'));if($.length>0){const G=$[$.length-1];try{G.scrollIntoView({block:"end",inline:"nearest",behavior:"smooth"})}catch{}}const Z=document.querySelector('[role="main"], [data-pagelet*="Group"]');if(Z&&Z.lastElementChild)try{Z.lastElementChild.scrollIntoView({block:"end",behavior:"smooth"})}catch{}const k=Math.max(((g=document.documentElement)==null?void 0:g.scrollHeight)||0,((C=document.scrollingElement)==null?void 0:C.scrollHeight)||0,((A=document.body)==null?void 0:A.scrollHeight)||0);window.scrollTo(0,k),document.scrollingElement&&(document.scrollingElement.scrollTop=k),document.documentElement&&(document.documentElement.scrollTop=k);const q=Array.from(document.querySelectorAll("div, main, section"));for(const G of q)if(G.scrollHeight>G.clientHeight+80){const K=window.getComputedStyle(G);(K.overflowY==="auto"||K.overflowY==="scroll")&&(G.scrollTop=G.scrollHeight,G.dispatchEvent(new Event("scroll",{bubbles:!0})))}window.dispatchEvent(new Event("scroll",{bubbles:!0}));try{window.dispatchEvent(new WheelEvent("wheel",{deltaY:2500,bubbles:!0})),(T=document.body)==null||T.dispatchEvent(new KeyboardEvent("keydown",{key:"PageDown",code:"PageDown",bubbles:!0}))}catch{}await new Promise(G=>setTimeout(G,n));const ae=xe(r);if(l+=ae.rejectedCount,f(ae.items)>0){if(L=0,o.onBatchDiscovered)try{await o.onBatchDiscovered(Array.from(i.values()),i.size,w(null))}catch{}if(o.onProgress){const G=u?`Scanning Facebook Groups... ${i.size} of ${u} discovered`:`Scanning Facebook Groups... ${i.size} groups discovered`;o.onProgress(i.size,G,u,w(null))}if(p==="CONFIRMED"&&u!==null&&i.size>=u){console.log(`[AGP:Engine] Target count reached: ${i.size} >= ${u}.`),O="COMPLETE",V="TARGET_REACHED";break}}else{if(L++,Ze()){console.log("[AGP:Engine] Explicit end-of-list indicator detected."),O="COMPLETE",V="LIST_END";break}if(window.scrollBy(0,-600),$.length>5&&((M=$[Math.max(0,$.length-6)])==null||M.scrollIntoView({block:"center",behavior:"instant"})),await new Promise(G=>setTimeout(G,300)),window.scrollBy(0,1200),$.length>0&&((D=$[$.length-1])==null||D.scrollIntoView({block:"end",behavior:"smooth"})),p==="CONFIRMED"&&u!==null&&i.size<u&&L<45){window.scrollBy(0,-1e3),await new Promise(G=>setTimeout(G,350)),window.scrollBy(0,2500);continue}if(L>=t){console.log(`[AGP:Engine] Scan complete/stagnant after ${L} attempts. Total verified: ${i.size}`),O="PARTIAL",V="STAGNANT_TIMEOUT";break}}}try{window.scrollTo({top:0,behavior:"smooth"})}catch{}const ye=O!=="COMPLETE",ve=w(V);return{isLoggedIn:a,groups:Array.from(i.values()),totalFound:i.size,targetCount:u,isPartial:ye,outcome:O,completionReason:V,debugMetrics:ve}}finally{y&&y.disconnect()}}function Ue(o,e){if(!o||!o.trim())return e?e.split(/[-_.]+/).filter(Boolean).map(n=>n.charAt(0).toUpperCase()+n.slice(1)).join(" "):"Facebook Group";let t=o.trim();return t=t.replace(/^(?:Visit|Open|View|গ্রুপ দেখুন|দেখুন)\s+/i,""),t=t.replace(/\s*(?:Last active|You last visited|last visited|active)\s+[^\n]+/i,""),t=t.replace(/\s*(?:গত|আগে|মিনিট আগে|ঘণ্টা আগে|দিন আগে)[^\n]*/i,""),t=t.replace(/\s*·\s*(?:Public group|Private group|পাবলিক গ্রুপ|প্রাইভেট গ্রুপ).*$/i,""),t=t.replace(/\s*·\s*\d+.*members.*$/i,""),t=t.replace(/\s*·\s*[০-৯\d]+.*সদস্য.*$/i,""),t=t.replace(/\s*·\s*[^\n]+/i,""),(t.toLowerCase()==="visit"||t.toLowerCase()==="group"||t.toLowerCase()==="view group")&&e?e.split(/[-_.]+/).filter(Boolean).map(n=>n.charAt(0).toUpperCase()+n.slice(1)).join(" "):t.trim()||"Facebook Group"}function Re(o="id"){const e=Math.random().toString(36).substring(2,9),t=Date.now().toString(36);return`${o}_${t}_${e}`}function Ne(o){if(!o)return"";if(!o.includes("{")||!o.includes("|"))return o;let e=o,t=0;const n=/\{([^{}]+)\}/g;for(;t<10&&n.test(e);)t++,e=e.replace(n,(r,s)=>{if(s.includes("|")){const a=s.split("|").map(i=>i.trim()).filter(Boolean);if(a.length>0)return a[Math.floor(Math.random()*a.length)]}return r});return e=e.replace(/\{([^{}\r\n]+?)(?=[.,!?\r\n]|$)/g,(r,s)=>s.includes("|")?s.split("|").map(i=>i.trim()).filter(Boolean)[0]||"":r),e}const J={GROUPS:"agp_groups",ACCOUNT_GROUPS:"agp_facebook_groups_by_account",LOGS:"agp_logs",FACEBOOK_ACCOUNT:"agp_facebook_account"},$e=()=>{var o;return typeof chrome<"u"&&!!((o=chrome.storage)!=null&&o.local)},ne={};async function ce(o,e){if($e())return new Promise(t=>{chrome.storage.local.get([o],n=>{if(chrome.runtime.lastError){console.warn(`Storage get error for ${o}:`,chrome.runtime.lastError),t(ne[o]!==void 0?ne[o]:e);return}n&&n[o]!==void 0?t(n[o]):t(e)})});try{if(typeof window<"u"&&window.localStorage){const t=window.localStorage.getItem(o);if(t!==null)return JSON.parse(t)}}catch(t){console.warn("LocalStorage access failed:",t)}return ne[o]!==void 0?ne[o]:e}async function Ae(o,e){if(ne[o]=e,$e())return new Promise((t,n)=>{chrome.storage.local.set({[o]:e},()=>{chrome.runtime.lastError?n(chrome.runtime.lastError):t()})});try{typeof window<"u"&&window.localStorage&&window.localStorage.setItem(o,JSON.stringify(e))}catch(t){console.warn("LocalStorage set failed:",t)}}function Oe(o){return o&&o.trim().toLowerCase().replace(/[^a-z0-9_\u0980-\u09FF]/gi,"_")||"default_account"}async function De(){return ce(J.ACCOUNT_GROUPS,{})}async function ot(o){await Ee();const e=Oe(o),t=await De();if(t[e]&&Array.isArray(t[e].groups)&&t[e].groups.length>0){const a=t[e].groups.filter(i=>!re(i));if(a.length>0)return a}const r=(await ce(J.GROUPS,[])).filter(s=>!re(s));if(r.length>0)return r;for(const s of Object.keys(t))if(t[s]&&Array.isArray(t[s].groups)&&t[s].groups.length>0){const a=t[s].groups.filter(i=>!re(i));if(a.length>0)return a}return[]}async function nt(o,e){const t=(o||[]).filter(i=>!re(i)),n=await Ee(),r=Oe(e),s=await De(),a=s[r]||{accountContext:r,accountInfo:n||{isLoggedIn:!0,name:"Facebook User",lastSyncedAt:Date.now()},groups:[],lastSyncedAt:Date.now()};s[r]={...a,groups:t,lastSyncedAt:Date.now()},await Ae(J.ACCOUNT_GROUPS,s),await Ae(J.GROUPS,t)}function re(o){if(!o)return!0;const e=(o.name||"").trim().toLowerCase(),t=(o.url||"").trim().toLowerCase();if(e.startsWith("unread")||e.includes("commented on")||e.includes("also commented")||e.includes("likes your")||e.includes("liked your")||e.includes("reacted to")||e.includes("shared a post")||e.includes("shared your post")||e.includes("invited you")||e.includes("mentioned you")||e.includes("requested to join")||e.includes("মন্তব্য করেছেন")||e.includes("মতামত দিয়েছেন")||e.includes("লাইক দিয়েছেন")||e.includes("শেয়ার করেছেন")||t.includes("/permalink/")||t.includes("/posts/")||t.includes("/user/")||t.includes("/profile.php")||t.includes("/friends/")||t.includes("/people/")||t.includes("/photos/")||t.includes("/videos/")||t.includes("/events/")||t.includes("/files/")||t.includes("comment_id=")||t.includes("notif_id=")||t.includes("notif_t=")||t.includes("reply_comment_id="))return!0;const n=new Set(["about","about group","feed","discover","create","notifications","search","categories","joins","settings","help","privacy","terms","policies","support","messages","marketplace"]),r=e.replace(/\s*group\s*$/i,"").trim();return!!(n.has(e)||n.has(r)||o.groupId&&n.has(o.groupId.toLowerCase()))}async function rt(){return ce(J.LOGS,[])}async function it(o){await Ae(J.LOGS,o)}async function st(o){const e=await rt();e.unshift(o),e.length>300&&(e.length=300),await it(e)}async function Ee(){return ce(J.FACEBOOK_ACCOUNT,null)}class at{async writeLog(e,t,n,r){const s={id:Re("log"),timestamp:Date.now(),level:e,source:t,message:n,details:r},a=`[AGP:${t.toUpperCase()}][${e}]`;e==="ERROR"?console.error(a,n,r||""):e==="WARNING"?console.warn(a,n,r||""):console.log(a,n,r||"");try{await st(s)}catch(i){console.warn("Failed to persist log entry:",i)}return s}info(e,t,n){return this.writeLog("INFO",e,t,n)}success(e,t,n){return this.writeLog("SUCCESS",e,t,n)}warning(e,t,n){return this.writeLog("WARNING",e,t,n)}error(e,t,n){return this.writeLog("ERROR",e,t,n)}}const lt=new at;async function ue(o,e){var y;const t=(e==null?void 0:e.accountContext)||((y=await Ee())==null?void 0:y.name)||"default_account",n=await ot(t),r=new Map,s=new Map,a=new Map,i=g=>g.trim().toLowerCase().replace(/\s+/g," ");n.forEach(g=>{g.groupId&&r.set(g.groupId.toLowerCase(),g),g.url&&s.set(g.url.toLowerCase().replace(/\/$/,""),g),g.name&&a.set(i(g.name),g)});let c=0,l=0;const d=Date.now(),m=[],h=new Set;for(const g of o){if(re(g))continue;const C=(g.groupId||"").toLowerCase(),A=(g.url||"").toLowerCase().replace(/\/$/,""),T=i(g.name||"");let M=(C?r.get(C):void 0)||(A?s.get(A):void 0)||(T&&T.length>=3?a.get(T):void 0);const D=Ue(g.name||"",g.groupId);if(M)l++,h.add(M.id),D&&(!M.name||M.name.includes("·")||M.name.length<D.length)&&(M.name=D),g.imageUrl&&!M.imageUrl&&(M.imageUrl=g.imageUrl),g.privacy&&g.privacy!=="UNKNOWN"&&(M.privacy=g.privacy),M.verified=!0,M.source="facebook-ui",M.accountContext=t,M.discoveredAt=d,M.updatedAt=d;else{c++;const R=g.groupId?`grp_${g.groupId.replace(/[^a-zA-Z0-9_-]/g,"")}`:Re("grp"),W=g.url.startsWith("http")?g.url:`https://www.facebook.com/groups/${g.groupId}/`,L={id:R,name:D,url:W,groupId:g.groupId,privacy:g.privacy||"UNKNOWN",imageUrl:g.imageUrl,category:"Discovered",enabled:!0,selected:!0,status:"READY",postCount:0,verified:!0,source:"facebook-ui",accountContext:t,discoveredAt:d,createdAt:d,updatedAt:d};m.push(L),C&&r.set(C,L),A&&s.set(A,L),T&&a.set(T,L),h.add(L.id)}}let u;if((e==null?void 0:e.syncMode)==="exact"){const g=A=>A.source==="manual"||A.category&&A.category!=="Discovered",C=n.filter(A=>h.has(A.id)||g(A));u=[...m,...C]}else u=[...m,...n];const p=[],w=new Set,f=new Set;for(const g of u){const C=g.url.toLowerCase().replace(/\/$/,"");!w.has(g.id)&&!f.has(C)&&(w.add(g.id),f.add(C),p.push(g))}return await nt(p,t),await lt.info("dashboard",`Group discovery merged (${(e==null?void 0:e.syncMode)||"merge"}): ${c} imported, ${l} duplicates, total ${p.length}`),{imported:c,duplicates:l,totalStored:p.length,verifiedCount:p.filter(g=>g.verified).length}}function ct(o){if(!o)return"<p><br></p>";const e=o.split(`
`),t=[];let n=!1,r=[];const s=()=>{n&&r.length>0&&(t.push("<ul>"+r.map(a=>`<li>${a}</li>`).join("")+"</ul>"),r=[],n=!1)};for(let a=0;a<e.length;a++){const i=e[a],c=i.trim();if(!c){s(),t.push("<p><br></p>");continue}const l=c.match(/^[•✓✔➤➔★⭐◆❖]\s*(.*)$/)||c.match(/^[\-*–—]\s+(.*)$/);if(l){n=!0,r.push(Fe(l[1]));continue}s(),t.push(`<p>${Fe(i)}</p>`)}return s(),t.join("")}function Fe(o){if(!o)return"";let e=o.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");return e=e.replace(/\*\*\*(.+?)\*\*\*/g,'<strong><em style="font-style: italic;">$1</em></strong>'),e=e.replace(/___(.+?)___/g,'<strong><em style="font-style: italic;">$1</em></strong>'),e=e.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>"),e=e.replace(/__(.+?)__/g,"<strong>$1</strong>"),e=e.replace(/\*([^*\n]+?)\*/g,'<em style="font-style: italic;">$1</em>'),e=e.replace(/_([^_\n]+?)_/g,'<em style="font-style: italic;">$1</em>'),e}function ut(o){if(!o||typeof o!="string")return o||"";const e=o.trim();if(e.length<20)return o;const t=e.length,n=Math.floor(t/2);for(let s=-15;s<=15;s++){const a=n+s;if(a>10&&a<t){const i=e.slice(0,a).trim(),c=e.slice(a).trim();if(i.length>=15&&i===c)return i}}const r=e.split(`
`).filter(s=>s.trim().length>0);if(r.length>=2){const s=r[0].trim();if(s.length>=10){let a=s.length;for(;a<e.length;){const i=e.indexOf(s,a);if(i===-1)break;const c=e.slice(0,i).trim(),l=e.slice(i).trim();if(c.length>=20&&(c===l||l.startsWith(c)||c.startsWith(l)||c.length>30&&l.length>30&&c.slice(0,50)===l.slice(0,50)&&c.slice(-20)===l.slice(-20)))return c;a=i+s.length}}}if(e.length>60){const s=e.slice(0,35),a=e.indexOf(s,35);if(a>0){const i=e.slice(0,a).trim(),c=e.slice(a).trim();if(i.length>=25&&(i===c||c.startsWith(i.slice(0,Math.floor(i.length*.85)))))return i}}return o}console.log("[AGP:Content] Facebook Assistant Content Script initialized.");let j=null,v=null,b=null,H=!1,de=!1,Y=null,pe=!1;function Ce(){I&&(clearInterval(I),I=null),U=!1,B=!0,pe=!0;try{chrome.runtime.sendMessage({type:"STOP_QUEUE"})}catch{}j&&(j.remove(),j=null,v=null),S("🛑 Auto-Posting বন্ধ করা হয়েছে (Stopped & Closed)")}async function qe(o){try{return await navigator.clipboard.writeText(o),!0}catch{const t=document.createElement("textarea");t.value=o,document.body.appendChild(t),t.select();const n=document.execCommand("copy");return document.body.removeChild(t),n}}function S(o,e=!1){if(v){const t=v.getElementById("agp-toast");t&&t.remove();const n=document.createElement("div");n.id="agp-toast",n.innerText=o,n.style.cssText=`
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
    `,v.appendChild(n),setTimeout(()=>n.remove(),2400);return}if(typeof document<"u"&&document.body){const t=document.getElementById("agp-global-toast");t&&t.remove();const n=document.createElement("div");n.id="agp-global-toast",n.innerText=o,n.style.cssText=`
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
    `,document.body.appendChild(n),requestAnimationFrame(()=>{n.style.opacity="1",n.style.transform="translateY(0)"}),setTimeout(()=>{n.style.opacity="0",n.style.transform="translateY(-10px)",setTimeout(()=>n.remove(),400)},3e3)}}let U=!1,P="Preparing auto-post...",I=null,B=!1;const x=o=>new Promise(e=>setTimeout(e,o));async function dt(o,e="media_1"){try{if(!o||typeof o!="string")return null;let t="image/jpeg",n=null;if(o.startsWith("data:")||o.startsWith("blob:")||o.startsWith("http://")||o.startsWith("https://"))try{const d=await fetch(o);(d.ok||o.startsWith("data:")||o.startsWith("blob:"))&&(n=await d.blob(),n&&n.size>0&&(t=(n.type||"").toLowerCase()||"image/jpeg"))}catch(d){console.warn("[AGP:AutoPost] fetch blob parsing failed, falling back to manual decode:",d)}if(!n||n.size===0){let d=o;if(o.startsWith("data:")){const m=o.indexOf(",");if(m!==-1){const h=o.slice(0,m);d=o.slice(m+1);const u=h.match(/:(.*?);/);t=u?u[1].toLowerCase():"image/jpeg"}}try{const m=atob(d.trim().replace(/\s/g,"")),h=new Uint8Array(m.length);for(let u=0;u<m.length;u++)h[u]=m.charCodeAt(u);if(h.length===0)return null;h.length>8&&h[4]===102&&h[5]===116&&h[6]===121&&h[7]===112&&(t="video/mp4"),n=new Blob([h.buffer],{type:t})}catch(m){return console.warn("[AGP:AutoPost] base64 decode failed:",m),null}}if(!n||n.size===0)return null;const r=t.startsWith("video/");let s="jpg";t.includes("video/mp4")||t.includes("mp4")?s="mp4":t.includes("video/webm")||t.includes("webm")?s="webm":t.includes("video/quicktime")||t.includes("mov")?s="mov":t.includes("video/x-m4v")||t.includes("m4v")?s="m4v":t.includes("video/mkv")||t.includes("matroska")?s="mkv":r?s="mp4":t.includes("png")?s="png":t.includes("webp")?s="webp":t.includes("gif")&&(s="gif");const a=Date.now(),i=e.replace(/\D/g,"")||"1",l=`${r?"VID":"IMG"}_${a}_${i}.${s}`;return new File([n],l,{type:t,lastModified:a})}catch(t){return console.warn("[AGP:AutoPost] mediaToFile error:",t),null}}function N(o){if(!o)return!1;if(o.offsetParent!==null)return!0;try{const e=window.getComputedStyle(o);if(e.display==="none"||e.visibility==="hidden"||e.opacity==="0")return!1;const t=o.getBoundingClientRect();return t.width>0&&t.height>0}catch{return!1}}function ke(){const o=Array.from(document.querySelectorAll('[data-pagelet="GroupInlineComposer"], [data-pagelet="FeedInlineComposer"], [data-pagelet="GroupComposer"], [data-pagelet*="Composer" i]'));for(const t of o){if(t.closest('[role="article"], [data-pagelet*="FeedUnit"], [data-pagelet*="Comment"], form'))continue;const n=t.querySelector('[role="button"]');if(n&&N(n))return n}const e=Array.from(document.querySelectorAll('[role="main"] [role="button"], [role="button"]'));for(const t of e){if(t.closest('[role="article"], [data-pagelet*="FeedUnit"], [data-pagelet*="Comment"], form'))continue;const n=(t.getAttribute("aria-label")||"").toLowerCase(),r=(t.textContent||"").trim().toLowerCase();if((n.includes("create a public post")||n.includes("write something")||n.includes("create a post")||n.includes("কিছু লিখুন")||n.includes("পোস্ট তৈরি করুন")||n.includes("একটি পাবলিক পোস্ট")||r==="create a public post..."||r==="write something..."||r==="create a post..."||r==="create post"||r.includes("কিছু লিখুন")||r.includes("পোস্ট তৈরি করুন")||r.includes("পাবলিক পোস্ট"))&&N(t))return t}return null}function fe(){const o=Array.from(document.querySelectorAll('[role="dialog"]'));for(const e of o)if(N(e)){if(e.closest('[role="article"]')||e.querySelector('[data-pagelet*="ChatTab"], [aria-label*="Messenger" i]'))continue;const t=(e.textContent||"").toLowerCase(),n=(e.getAttribute("aria-label")||"").toLowerCase();if(n.includes("create post")||n.includes("create a public post")||n.includes("পোস্ট তৈরি করুন")||t.includes("create post")||t.includes("create a public post")||t.includes("add to your post")||t.includes("পোস্ট তৈরি করুন")||t.includes("আপনার পোস্টে যোগ করুন")||!!e.querySelector('[aria-label*="Add to your post" i], [aria-label*="আপনার পোস্টে যোগ করুন" i], [aria-label*="Photo/video" i]'))return e}return null}function ie(){const o=(document.body?document.body.innerText:"").toLowerCase(),e=(document.title||"").toLowerCase();return window.location.href.toLowerCase().includes("/groups/grp_")||o.includes("this content isn't available right now")||o.includes("this content isn't available")||o.includes("content isn't available right now")||o.includes("the link you followed may be broken")||o.includes("page may have been removed")||o.includes("এই কন্টেন্টটি এখন উপলব্ধ নয়")||o.includes("এই লিঙ্কটি হয়তো ত্রুটিপূর্ণ")||e.includes("page not found")||e.includes("content not found")||!!document.querySelector('[role="main"] [aria-label*="Go to Feed" i], [role="main"] a[href="/"][role="button"]')}async function pt(){if(ie())return null;let o=fe();if(o)return o;const e=ke();if(!e)return console.log("[AGP:AutoPost] Composer trigger not found on page."),null;e.scrollIntoView({behavior:"instant",block:"center"}),await x(40),e.dispatchEvent(new PointerEvent("pointerdown",{bubbles:!0,cancelable:!0})),e.dispatchEvent(new MouseEvent("mousedown",{bubbles:!0,cancelable:!0})),e.dispatchEvent(new PointerEvent("pointerup",{bubbles:!0,cancelable:!0})),e.dispatchEvent(new MouseEvent("mouseup",{bubbles:!0,cancelable:!0})),e.click();const t=Date.now();for(;Date.now()-t<4e3;)if(await x(40),o=fe(),o)return o;return null}async function ft(o,e){if(!e||!e.trim())return!0;const t=ut(Ne(e)).replace(/\r\n/g,`
`).replace(/\r/g,`
`),n=t.split(`
`);await qe(t.trim());let r=null;const s=Date.now(),a=['div[role="textbox"][contenteditable="true"]','div[data-lexical-editor="true"][contenteditable="true"]','div[contenteditable="true"]:not([aria-label*="comment" i]):not([aria-label*="মন্তব্য" i])','div[data-editor="true"]','div[aria-label*="Create a public post" i][contenteditable="true"]','div[aria-label*="Write something" i][contenteditable="true"]','div[aria-label*="কিছু লিখুন" i][contenteditable="true"]','div[aria-label*="পাবলিক পোস্ট" i][contenteditable="true"]','div[aria-placeholder*="Create a public post" i]','div[aria-placeholder*="Write something" i]'];for(;Date.now()-s<5e3;){for(const f of a){const y=o.querySelector(f)||document.querySelector(`[role="dialog"] ${f}`);if(y&&N(y)){r=y;break}}if(r)break;await x(40)}if(!r)return console.warn("[AGP:AutoPost] Create post editor not found inside modal."),!1;const i=(r.textContent||"").trim(),c=t.trim().slice(0,30);if(i.length>=t.trim().length*.7&&(!c||i.includes(c)))return console.log("[AGP:AutoPost] Editor already contains caption. Skipping duplicate injection."),!0;r.scrollIntoView({behavior:"instant",block:"center"}),window.focus(),r.focus();const l={bubbles:!0,cancelable:!0,view:window};r.dispatchEvent(new PointerEvent("pointerdown",l)),r.dispatchEvent(new MouseEvent("mousedown",l)),r.dispatchEvent(new PointerEvent("pointerup",l)),r.dispatchEvent(new MouseEvent("mouseup",l)),r.dispatchEvent(new MouseEvent("click",l)),r.dispatchEvent(new FocusEvent("focus",{bubbles:!1})),r.dispatchEvent(new FocusEvent("focusin",{bubbles:!0})),await x(40);try{const f="agp_inj_"+Date.now()+"_"+Math.random().toString(36).slice(2,7),y=new Promise(C=>{const A=T=>{T.data&&T.data.type==="AGP_MAIN_INJECT_CAPTION_RESPONSE"&&T.data.messageId===f&&(window.removeEventListener("message",A),C(!!T.data.success))};window.addEventListener("message",A),setTimeout(()=>{window.removeEventListener("message",A),C(!1)},1e3)});if(window.postMessage({type:"AGP_MAIN_INJECT_CAPTION",messageId:f,caption:t},"*"),await y&&(console.log("[AGP:AutoPost] MAIN world injection succeeded with exact layout!"),await x(60),(r.textContent||"").trim().length>0))return!0}catch(f){console.warn("[AGP:AutoPost] MAIN world bridge error, using direct content injection:",f)}const d=(r.textContent||"").trim();if(d.length>=t.trim().length*.7&&(!c||d.includes(c)))return console.log("[AGP:AutoPost] Editor already populated by bridge. Skipping fallback Strategy 2."),!0;const m=window.getSelection();if(m){const f=document.createRange();f.selectNodeContents(r),m.removeAllRanges(),m.addRange(f),r.dispatchEvent(new InputEvent("beforeinput",{bubbles:!0,cancelable:!0,inputType:"deleteContentBackward"}))}document.execCommand("selectAll",!1),document.execCommand("delete",!1),await x(30);const h=r.querySelector("p")||r;if(h.dispatchEvent(new MouseEvent("mousedown",l)),h.dispatchEvent(new MouseEvent("mouseup",l)),h.click(),m){const f=document.createRange();h.childNodes.length>0?(f.setStart(h,0),f.setEnd(h,h.childNodes.length)):f.selectNodeContents(h),f.collapse(!0),m.removeAllRanges(),m.addRange(f)}document.dispatchEvent(new Event("selectionchange"));let u=!1;const p=ct(t);try{const f=new DataTransfer;f.setData("text/plain",t),f.setData("text/html",p);const y=new ClipboardEvent("paste",{bubbles:!0,cancelable:!0,clipboardData:f});r.dispatchEvent(y),await x(80);let g=(r.textContent||"").trim();(!g||g.length<5)&&(r.dispatchEvent(new InputEvent("beforeinput",{bubbles:!0,cancelable:!0,inputType:"insertFromPaste",dataTransfer:f})),await x(60),g=(r.textContent||"").trim());const C=r.querySelectorAll("p");g.length>0&&(!t.includes(`
`)||C.length>1||g.length>=t.trim().length*.7)&&(console.log("[AGP:AutoPost] Direct Native Paste event succeeded. Paragraph count:",C.length),u=!0)}catch(f){console.warn("[AGP:AutoPost] Native paste event error:",f)}if(!u)try{console.log("[AGP:AutoPost] Trying Strategy 3: Line-by-line Enter keystrokes with non-collapsing spacing..."),document.execCommand("selectAll",!1),document.execCommand("delete",!1),await x(30);for(let y=0;y<n.length;y++){const g=n[y],C=y===n.length-1;g.length>0?document.execCommand("insertText",!1,g):document.execCommand("insertText",!1," "),C||(r.dispatchEvent(new KeyboardEvent("keydown",{key:"Enter",code:"Enter",keyCode:13,which:13,bubbles:!0,cancelable:!0})),r.dispatchEvent(new InputEvent("beforeinput",{inputType:"insertParagraph",bubbles:!0,cancelable:!0})),document.execCommand("insertParagraph",!1),r.dispatchEvent(new InputEvent("input",{inputType:"insertParagraph",bubbles:!0})),r.dispatchEvent(new KeyboardEvent("keyup",{key:"Enter",code:"Enter",keyCode:13,which:13,bubbles:!0})),await x(8))}await x(80),(r.textContent||"").trim().length>0&&(console.log("[AGP:AutoPost] Strategy 3 succeeded."),u=!0)}catch(f){console.warn("[AGP:AutoPost] Strategy 3 error:",f)}return r.dispatchEvent(new Event("input",{bubbles:!0})),r.dispatchEvent(new Event("change",{bubbles:!0})),document.dispatchEvent(new Event("selectionchange")),await x(60),(r.textContent||"").trim().length>0}function gt(o){const e=o.querySelector('[aria-label*="Photo/video" i], [aria-label*="Photo / video" i], [aria-label*="Add photo" i], [aria-label*="Add Photos" i], [aria-label*="Add photos or videos" i], [aria-label*="Add video" i], [aria-label*="Add Photos/videos" i], [aria-label*="ফটো/ভিডিও" i], [aria-label*="Photo" i], [aria-label*="Video" i], [aria-label*="ছবি/ভিডিও" i], [aria-label*="ছবি" i], [aria-label*="ভিডিও" i], div[aria-label*="Photo" i], div[aria-label*="Video" i], div[aria-label*="ফটো" i], div[aria-label*="ভিডিও" i]');if(e&&N(e))return e;const t=Array.from(o.querySelectorAll('[role="button"], button, div[tabindex="0"]'));for(const r of t){const s=(r.getAttribute("aria-label")||"").toLowerCase();if((s.includes("photo")||s.includes("video")||s.includes("image")||s.includes("ফটো")||s.includes("ছবি")||s.includes("ভিডিও"))&&N(r))return r}const n=Array.from(o.querySelectorAll("span, div, p"));for(const r of n){const s=(r.textContent||"").trim().toLowerCase();if(s==="add to your post"||s==="আপনার পোস্টে যোগ করুন"||s.includes("add to your post")){const a=r.closest("div"),i=(a==null?void 0:a.parentElement)||a,c=i==null?void 0:i.querySelector('[role="button"], img, svg');if(c&&N(c))return c.closest('[role="button"]')||c}}return null}function Be(o){return o.querySelector('input[type="file"][accept*="video"]')||o.querySelector('input[type="file"][accept*="image"]')||o.querySelector('input[type="file"]')||document.querySelector('[role="dialog"] input[type="file"]')||document.querySelector('input[type="file"]')}function Q(o){var t;const e=(o.textContent||"").toLowerCase();if(e.includes("your file can't be uploaded")||e.includes("file can't be uploaded")||e.includes("আপলোড করা যাবে না")||e.includes("আপলোড করা যায়নি")||e.includes("couldn't be uploaded")||e.includes("error uploading")){const n=Array.from(o.querySelectorAll("span, div, p")).find(r=>{const s=(r.textContent||"").toLowerCase();return s.includes("your file can't be uploaded")||s.includes("file can't be uploaded")||s.includes("আপলোড করা যাবে না")||s.includes("আপলোড করা যায়নি")||s.includes("couldn't be uploaded")});return((t=n==null?void 0:n.textContent)==null?void 0:t.trim())||"Your file can't be uploaded"}return null}async function bt(o,e){if(!e||e.length===0)return!0;e.some(i=>i.includes("video")||i.includes(".mp4")||i.includes(".mov")||i.includes(".webm"));let t=Be(o);if(!t){const i=gt(o);if(i){i.scrollIntoView({behavior:"instant",block:"center"}),i.dispatchEvent(new PointerEvent("pointerdown",{bubbles:!0,cancelable:!0})),i.dispatchEvent(new MouseEvent("mousedown",{bubbles:!0,cancelable:!0})),i.dispatchEvent(new PointerEvent("pointerup",{bubbles:!0,cancelable:!0})),i.dispatchEvent(new MouseEvent("mouseup",{bubbles:!0,cancelable:!0})),i.click();const c=Date.now();for(;Date.now()-c<2500&&(await x(40),t=Be(o),!t););}}if(!t)return console.warn("[AGP:AutoPost] File input not found inside create post modal."),!1;const n=new DataTransfer;for(let i=0;i<e.length;i++){const c=await dt(e[i],`media_${i+1}`);c&&c.size>0&&(n.items.add(c),console.log(`[AGP:AutoPost] Prepared media file #${i+1}: ${c.name} (${c.type}, ${c.size} bytes)`))}if(n.files.length===0)return console.warn("[AGP:AutoPost] No valid non-empty files prepared from mediaList."),!1;t.files=n.files;const r=t._valueTracker;r&&r.setValue(""),t.dispatchEvent(new Event("change",{bubbles:!0,cancelable:!0})),t.dispatchEvent(new Event("input",{bubbles:!0,cancelable:!0}));const s=4e3,a=Date.now();for(;Date.now()-a<s;){const i=Q(o);if(i)return console.warn("[AGP:AutoPost] Facebook upload error detected:",i),!1;if(!!o.querySelector('video, img[src*="blob:"], img[src*="data:"], img[src*="fbcdn.net"], div[aria-label*="Video" i], div[aria-label*="Photo" i], div[data-pagelet*="MediaViewer"], div[aria-label*="Edit" i], button[aria-label*="Edit" i], div[aria-label*="Remove" i], div[role="button"][aria-label*="Edit" i]')){console.log("[AGP:AutoPost] Media preview mounted immediately in composer."),await x(80);break}await x(40)}return!Q(o)}function je(o,e){return o.includes("joined")||o.includes("যোগ দিয়েছেন")||o.includes("মেম্বার")||o.includes("member")||o.includes("leave group")||o.includes("গ্রুপ ত্যাগ")||e.includes("joined")||e.includes("যোগ দিয়েছেন")||e.includes("member")}function X(){const o=['[aria-label*="Join group" i]','[aria-label*="Join Group" i]','[aria-label*="গ্রুপে যোগ দিন" i]','[aria-label*="যোগ দিন" i]','[aria-label*="গ্রুপে যুক্ত হন" i]','[aria-label*="Request to join" i]','[aria-label*="Request to Join" i]','[aria-label*="গ্রুপে যোগ দেওয়ার অনুরোধ" i]','[aria-label*="যোগ দেওয়ার অনুরোধ" i]','[aria-label*="গ্রুপে যোগদানের অনুরোধ" i]','div[role="button"][aria-label*="Join" i]','div[role="button"][aria-label*="যোগ" i]','button[aria-label*="Join" i]','button[aria-label*="যোগ" i]'];for(const t of o){const n=document.querySelector(t);if(n&&N(n)){const r=(n.innerText||n.textContent||"").trim().toLowerCase(),s=(n.getAttribute("aria-label")||"").toLowerCase();if(!je(r,s))return n}}const e=Array.from(document.querySelectorAll('div[role="main"] [role="button"], div[role="main"] button, div[role="region"] [role="button"], [role="banner"] [role="button"], div[role="button"], button'));for(const t of e){if(!N(t))continue;const n=(t.innerText||t.textContent||"").trim().toLowerCase(),r=(t.getAttribute("aria-label")||"").toLowerCase();if(!je(n,r)&&(n==="join group"||n==="join"||n==="গ্রুপে যোগ দিন"||n==="যোগ দিন"||n==="গ্রুপে যুক্ত হন"||n==="request to join"||n==="request to join group"||n==="যোগ দেওয়ার অনুরোধ"||n==="যোগ দেওয়ার অনুরোধ জানান"||n.includes("join group")||n.includes("গ্রুপে যোগ দিন")))return t}return null}function Se(){const o=!!X(),e=!!ke();return o&&!e}async function ze(){const o=X();if(!o)return{success:!1,isInstantMember:!1,reason:"Join button not found"};console.log("[AGP:AutoJoin] Found Join button. Executing automatic join click..."),P="⚡ Auto-joining group (গ্রুপে যোগ দেওয়া হচ্ছে)...",E(),S("⚡ Auto-joining group...",!0),o.scrollIntoView({behavior:"instant",block:"center"}),await x(60);const e={bubbles:!0,cancelable:!0,view:window};o.dispatchEvent(new PointerEvent("pointerdown",e)),o.dispatchEvent(new MouseEvent("mousedown",e)),o.dispatchEvent(new PointerEvent("pointerup",e)),o.dispatchEvent(new MouseEvent("mouseup",e)),o.click(),await x(1500);const t=document.querySelector('div[role="dialog"]');if(t&&N(t)){console.log("[AGP:AutoJoin] Rules agreement or membership question dialog detected. Handling...");const a=Array.from(t.querySelectorAll('input[type="checkbox"], div[role="checkbox"]'));for(const l of a)l.getAttribute("aria-checked")==="true"||l.checked||(l.click(),await x(80));const i=Array.from(t.querySelectorAll('textarea, input[type="text"]'));for(const l of i)(!l.value||!l.value.trim())&&(l.value="Agree",l.dispatchEvent(new Event("input",{bubbles:!0})),l.dispatchEvent(new Event("change",{bubbles:!0})),await x(50));const c=Array.from(t.querySelectorAll('button, [role="button"], input[type="submit"]')).find(l=>{const d=(l.innerText||l.textContent||l.getAttribute("aria-label")||"").trim().toLowerCase();return d==="submit"||d==="send"||d==="agree"||d==="confirm"||d==="সাবমিট"||d==="জমা দিন"||d==="সম্মতি দিচ্ছি"||d.includes("submit")||d.includes("সাবমিট")});c&&N(c)&&(console.log("[AGP:AutoJoin] Clicking modal submit button..."),c.click(),await x(1200))}const n=Date.now();for(;Date.now()-n<3500;){const a=ke();if(a&&N(a))return console.log("[AGP:AutoJoin] Instant membership granted! Composer available."),S("✅ Joined group! Post box ready.",!0),{success:!0,isInstantMember:!0,reason:"Instant member"};await x(250)}const r=(document.body?document.body.innerText:"").toLowerCase();return r.includes("requested")||r.includes("pending")||r.includes("অনুরোধ করা হয়েছে")||r.includes("cancel request")||r.includes("অনুরোধ বাতিল")?(console.log("[AGP:AutoJoin] Join request sent (Pending admin approval)."),{success:!0,isInstantMember:!1,reason:"Join request pending admin approval"}):X()?{success:!0,isInstantMember:!1,reason:"Join submitted"}:{success:!0,isInstantMember:!1,reason:"Join request submitted"}}function We(){if(ie())return{forbidden:!0,reason:"Group unavailable or broken link"};const o=(document.body?document.body.innerText:"").toLowerCase();return o.includes("only admins can post")||o.includes("শুধুমাত্র অ্যাডমিনরা এই গ্রুপে পোস্ট করতে পারবেন")||o.includes("শুধুমাত্র অ্যাডমিনরা পোস্ট করতে পারবেন")||o.includes("posting is paused for this group")||o.includes("posting is turned off")||o.includes("এই গ্রুপের জন্য পোস্ট করা সাময়িকভাবে বন্ধ আছে")||o.includes("posting in this group has been paused")?{forbidden:!0,reason:"Posting is paused or admin-only in this group"}:o.includes("you can't post to this group")||o.includes("you've been temporarily blocked")||o.includes("you have been muted")||o.includes("আপনার অ্যাকাউন্ট সাময়িকভাবে ব্লক করা হয়েছে")||o.includes("আপনাকে এই গ্রুপে পোস্ট করা থেকে সাময়িকভাবে নিষিদ্ধ করা হয়েছে")?{forbidden:!0,reason:"Account restricted or muted in this group"}:{forbidden:!1,reason:""}}let Ve=!1;async function _(o){if(!(Ve||!(b!=null&&b.queueItem))){Ve=!0,U=!1,I&&(clearInterval(I),I=null);try{window.onbeforeunload=null}catch{}console.warn(`[AGP:AutoPost] Auto-skipping group: ${o}`),P=`⚡ Auto-skipping: ${o}...`,E(),S(`⚡ Auto-skipping: ${o}...`,!0),await x(200),chrome.runtime.sendMessage({type:"SKIP_CURRENT_ITEM",payload:{itemId:b.queueItem.id,reason:o}})}}async function mt(o,e=15e3){const t=Date.now();for(;Date.now()-t<e;){const n=[o,...Array.from(document.querySelectorAll('[role="dialog"]'))];for(const r of n){const s=Array.from(r.querySelectorAll('[role="button"], button'));for(const a of s){const i=(a.getAttribute("aria-label")||"").toLowerCase().trim(),c=(a.textContent||"").toLowerCase().trim(),l=a.getAttribute("aria-disabled")==="true"||a.disabled||a.classList.contains("aria-disabled")||a.classList.contains("disabled");if((i==="post"||i==="publish"||i==="submit"||i==="submit for review"||i==="পোস্ট"||i==="সাবমিট"||i==="পোস্ট করুন"||i==="সাবমিট করুন"||i.includes("post to group")||i.includes("গ্রুপে পোস্ট")||i.includes("submit for review")||i.includes("রিভিউ")||c==="post"||c==="পোস্ট"||c==="publish"||c==="submit"||c==="submit for review"||c==="পোস্ট করুন"||c==="সাবমিট"||c==="সাবমিট করুন"||c==="post to group"||c==="পাবলিশ"||c.includes("submit for review")||c.includes("রিভিউয়ের জন্য সাবমিট"))&&!l)return a.scrollIntoView({behavior:"instant",block:"center"}),await x(30),a.style.outline="3px solid #10b981",a.dispatchEvent(new PointerEvent("pointerdown",{bubbles:!0,cancelable:!0})),a.dispatchEvent(new MouseEvent("mousedown",{bubbles:!0,cancelable:!0})),a.dispatchEvent(new PointerEvent("pointerup",{bubbles:!0,cancelable:!0})),a.dispatchEvent(new MouseEvent("mouseup",{bubbles:!0,cancelable:!0})),a.click(),!0}}await x(40)}return!1}async function ge(){if(U||!b||!b.queueItem)return;if(ie()){await _("Group unavailable on Facebook");return}if(!b.isGroupMatch){await _("Wrong group URL detected");return}if(Se()||X()){U=!0,P="⚡ Step 0/4: Auto-joining group (গ্রুপে যোগ দেওয়া হচ্ছে)...",E(),S("⚡ Auto-joining group...",!0);const e=await ze();if(e.isInstantMember)console.log("[AGP:AutoPost] Successfully auto-joined group! Proceeding with post..."),P="⚡ Joined! Step 1/4: Opening Post Box...",E(),S("✅ Joined! Now opening post box...",!0),await x(1e3);else{P=`⚡ ${e.reason}. Advancing to next group...`,E(),S(`⚡ ${e.reason}`,!0),await x(1800),await _(e.reason);return}}const o=We();if(o.forbidden){await _(o.reason);return}U=!0,P="⚡ Step 1/4: Opening Post Box...",E();try{const e=await pt();if(!e){if(ie()){await _("Group unavailable on Facebook");return}await _("Could not open Facebook post box");return}P="⚡ Step 2/4: Typing caption...",E();const t=b.caption||b.formattedPost||"";t&&t.trim()&&(await ft(e,t)||(console.warn("[AGP:AutoPost] Caption injection check returned false, but clipboard has caption. Proceeding to photos..."),S("⚠️ Caption in clipboard (Ctrl+V ready)")));const n=b.media||[],r=n.some(u=>u.includes("video")||u.includes(".mp4")||u.includes(".mov")||u.includes(".webm")||u.includes("data:video"));if(n.length>0&&(P=r?`⚡ Step 3/4: Attaching video (${n.length} files)...`:`⚡ Step 3/4: Attaching ${n.length} photos...`,E(),!await bt(e,n))){const p=Q(e);if(p){console.warn("[AGP:AutoPost] Upload rejected by Facebook:",p),P=`❌ Upload failed: ${p}`,E(),await _(`Media rejected by Facebook: ${p}`);return}console.warn("[AGP:AutoPost] Media attachment warning - continuing post workflow")}if(P="⚡ Step 4/4: Submitting post...",E(),!await mt(e,15e3)){const u=Q(e);u?await _(`Facebook upload error: ${u}`):await _("Post button disabled or timed out");return}P="⚡ Post submitted! Shifting to next group...",E();const i=Date.now();let c=!1;const l=3500;for(;Date.now()-i<l;){const u=fe();if(!u){console.log("[AGP:AutoPost] Composer dialog closed cleanly. Post submitted successfully!"),c=!0;break}const p=Q(u);if(p){console.warn("[AGP:AutoPost] Post aborted due to Facebook file error:",p),P=`❌ Upload error: ${p}`,E(),await _(`Facebook upload error: ${p}`);return}const w=Array.from(document.querySelectorAll('[role="dialog"]'));for(const f of w){const y=(f.textContent||"").toLowerCase();if(y.includes("pending")||y.includes("approval")||y.includes("admin")||y.includes("অনুমোদনের অপেক্ষায়")||y.includes("অনুমোদন")||y.includes("সাবমিট করা হয়েছে")||y.includes("আপনার পোস্টটি জমা দেওয়া হয়েছে")){const g=Array.from(f.querySelectorAll('[role="button"], button')).find(C=>{const A=(C.textContent||"").toLowerCase().trim();return A==="done"||A==="ok"||A==="ঠিক আছে"||A==="close"||A==="বন্ধ করুন"||A==="got it"});if(g){g.click(),await x(150),c=!0;break}}}if(c)break;await x(60)}if(!c){const u=fe();if(u){const p=Q(u);if(p){console.warn("[AGP:AutoPost] Facebook upload error remained:",p),P=`❌ Upload failed: ${p}`,E(),await _(`Facebook upload error: ${p}`);return}if(!!u.querySelector('[aria-disabled="true"], button[disabled]')){console.warn("[AGP:AutoPost] Post button remained disabled after wait"),P="❌ Post button stayed disabled",E(),await _("Post button disabled or upload blocked by Facebook");return}}}try{window.onbeforeunload=null}catch{}P="⚡ Post submitted! Moving to next group...",E();const d=b.queueIndex,m=b.totalQueueItems,h=(b.postedCount||d-1)+1;S(`⚡ Auto-Posted to Group #${d}! (${h}/${m} done)`),chrome.runtime.sendMessage({type:"MARK_AS_POSTED",payload:{itemId:b.queueItem.id}})}catch(e){const t=e instanceof Error?e.message:String(e);console.log("[AGP:AutoPost] Routine caught error, auto-skipping:",t),await _(t||"Posting failed")}}function ht(){if(B||U||!(b!=null&&b.queueItem))return;if(ie()){P="⚡ Group unavailable on Facebook. Auto-skipping...",E(),setTimeout(()=>{_("Group unavailable on Facebook")},100);return}if(!b.isGroupMatch){P="⚡ Wrong group detected. Auto-skipping to next group...",E(),S("⚠️ Wrong group detected. Auto-skipping...",!0),setTimeout(()=>{B||_("Wrong group URL detected")},200);return}if(Se()||X()){P="⚡ Not joined: Auto-joining group...",E(),S("⚡ Auto-joining group...",!0),I&&clearInterval(I),I=null,setTimeout(()=>{!B&&!U&&ge()},100);return}const o=We();if(o.forbidden){P=`⚡ Cannot post: ${o.reason}. Auto-skipping...`,E(),setTimeout(()=>{_(o.reason)},200);return}P="⚡ Instant Auto-Posting in progress...",E(),I&&clearInterval(I),I=null,setTimeout(()=>{!B&&!U&&ge()},80)}function E(){var p,w,f,y,g,C,A,T,M,D,R,W,L,O,V,ye,ve,F,$,Z;if(pe||!v)return;const o=Le(),e=oe();if(!o.isGroupPage){const k=!!(Y!=null&&Y.isRunning),q=!!(Y!=null&&Y.isPaused),ae=0,Me=0,G=0;v.innerHTML=`
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

      ${H?`
        <div class="launcher-pill" id="agp-launcher-btn" title="Click to open AI Group Poster Assistant">
          <div class="badge-logo">AI</div>
          <span class="launcher-title">AI Group Poster</span>
          ${k?`
            <span class="status-pill running">
              <span class="pulse-dot"></span>
              Auto-Posting (${ae}/${Me})
            </span>
          `:q?`
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
              ${k?'<span class="status-pill running"><span class="pulse-dot"></span> Auto-Posting</span>':q?'<span class="status-pill paused">⏸️ Paused</span>':'<span class="status-pill ready">⚡ Ready</span>'}
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
                  <span>Posting: <strong>${ae} of ${Me}</strong> Groups</span>
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

              ${q?`
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
    `,(p=v.getElementById("agp-launcher-btn"))==null||p.addEventListener("click",K=>{var Je;(Je=K.target)!=null&&Je.closest("#agp-launcher-close")||(H=!1,E())}),(w=v.getElementById("agp-toggle-btn"))==null||w.addEventListener("click",()=>{H=!0,E()}),(f=v.getElementById("agp-close-btn"))==null||f.addEventListener("click",K=>{K.stopPropagation(),Ce()}),(y=v.getElementById("agp-launcher-close"))==null||y.addEventListener("click",K=>{K.stopPropagation(),Ce()}),(g=v.getElementById("btn-focus-tab"))==null||g.addEventListener("click",()=>{}),(C=v.getElementById("btn-pause-queue"))==null||C.addEventListener("click",()=>{chrome.runtime.sendMessage({type:"PAUSE_QUEUE"},()=>{S("Auto-posting paused"),se()})}),(A=v.getElementById("btn-resume-queue"))==null||A.addEventListener("click",()=>{chrome.runtime.sendMessage({type:"RESUME_QUEUE"},()=>{S("Resuming auto-posting..."),se()})}),(T=v.getElementById("btn-start-queue"))==null||T.addEventListener("click",()=>{chrome.runtime.sendMessage({type:"START_QUEUE"},()=>{S("Starting auto-posting queue..."),se()})}),(M=v.getElementById("btn-sync-groups"))==null||M.addEventListener("click",()=>{window.location.href="https://www.facebook.com/groups/joins/?nav_source=tab"}),(D=v.getElementById("btn-open-dashboard"))==null||D.addEventListener("click",()=>{chrome.runtime.sendMessage({type:"OPEN_DASHBOARD"})});return}const t=b==null?void 0:b.group,n=b==null?void 0:b.post,r=(b==null?void 0:b.queueIndex)||1,s=(b==null?void 0:b.totalQueueItems)||1,a=(b==null?void 0:b.postedCount)??Math.max(0,r-1),i=s>0?Math.round(a/s*100):0,c=(b==null?void 0:b.formattedPost)||(n==null?void 0:n.description)||"",l=(b==null?void 0:b.caption)||(n==null?void 0:n.caption)||(n==null?void 0:n.description)||"",d=b!=null&&b.media?b.media.length:n!=null&&n.images?n.images.length:0,m=b?b.isGroupMatch:!0,h=(b==null?void 0:b.expectedGroupName)||(t==null?void 0:t.name)||"Expected Group",u=o.groupName||"Current Page";v.innerHTML=`
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
        display: ${H?"none":"block"};
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
        max-height: ${de?"160px":"55px"};
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
            ${H?"▲ Expand":"▼ Minimize"}
          </button>
          <button class="icon-btn close-btn" id="agp-close-btn" title="Stop & Close (ডাইরেক্ট অফ)">✕</button>
        </div>
      </div>

      <div class="panel-body">
        ${m?"":`
          <div class="warning-box">
            <strong>⚠️ Wrong Group Detected!</strong><br/>
            Expected: <strong>${h}</strong><br/>
            Current page: <em>${u}</em><br/>
            <span style="font-size: 11px; color: #fca5a5;">Auto-skipping to next group...</span>
          </div>
        `}

        <div class="progress-container">
          <div class="progress-label">
            <span>Posted: <strong>${a} of ${s}</strong> Groups</span>
            <span>${i}%</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${i}%"></div>
          </div>
        </div>

        <div class="autopost-box">
          <div class="autopost-header">
            <span class="pulse-dot"></span>
            <span>${U?"Auto-Posting in Progress":B?"Auto-Pilot Paused":"Auto-Pilot Running"}</span>
          </div>
          <div class="autopost-status-text">${P}</div>
        </div>

        <div class="meta-row">
          <span class="group-name" title="${h}">${h}</span>
          <span class="queue-badge">Queue ${r} / ${s}</span>
        </div>

        <div class="post-card">
          <div class="post-title">${(n==null?void 0:n.productName)||(n==null?void 0:n.title)||"Prepared Listing"}</div>
          ${d>0?((n==null?void 0:n.images)||(b==null?void 0:b.media)||[]).some(k=>k.includes("video")||k.includes("data:video")||k.endsWith(".mp4")||k.endsWith(".webm")||k.endsWith(".mov"))?`<div class="media-badge" style="background:#065f46;color:#6ee7b7;border:1px solid #059669;">🎬 Video Attached (${d})</div>`:`<div class="media-badge">📷 ${d} Photos attached</div>`:""}
          <div class="post-preview">${l||c||"No prepared caption."}</div>
        </div>

        <button class="auto-btn ${U?"running":""}" id="btn-auto-post">
          ${U?"⏸️ Pause Auto-Posting":"🤖 Auto-Post Now"}
        </button>

        ${Se()||X()?`<button class="action-btn" id="btn-auto-join" style="background:#2563eb;color:#ffffff;font-weight:700;margin-top:6px;width:100%;justify-content:center;box-shadow:0 2px 4px rgba(37,99,235,0.3);">
                ➕ Auto-Join Group (গ্রুপে যোগ দিন)
              </button>`:""}

        <button class="action-btn primary-btn" id="btn-mark-posted">
          ✅ Mark Posted & Next Group
        </button>

        <div class="button-grid">
          <button class="action-btn" id="btn-toggle-caption">
            ${de?"Collapse":"👁️ View Caption"}
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
  `,(R=v.getElementById("agp-toggle-btn"))==null||R.addEventListener("click",()=>{H=!H,E()}),(W=v.getElementById("agp-close-btn"))==null||W.addEventListener("click",k=>{k.stopPropagation(),Ce()}),(L=v.getElementById("btn-auto-post"))==null||L.addEventListener("click",()=>{U?(B=!0,U=!1,P="Auto-posting paused by user",I&&clearInterval(I),S("Auto-posting paused"),E()):(B=!1,I&&clearInterval(I),ge())}),(O=v.getElementById("btn-auto-join"))==null||O.addEventListener("click",async()=>{const k=v==null?void 0:v.getElementById("btn-auto-join");k&&(k.textContent="⏳ Joining..."),(await ze()).isInstantMember&&ge()}),(V=v.getElementById("btn-toggle-caption"))==null||V.addEventListener("click",()=>{de=!de,E()}),(ye=v.getElementById("btn-copy-caption"))==null||ye.addEventListener("click",async()=>{const q=Ne(l||c).replace(/\r\n/g,`
`).replace(/\r/g,`
`).trim();await qe(q)&&S("Caption copied to clipboard!")}),(ve=v.getElementById("btn-mark-posted"))==null||ve.addEventListener("click",()=>{var k;I&&clearInterval(I);try{window.onbeforeunload=null}catch{}chrome.runtime.sendMessage({type:"MARK_AS_POSTED",payload:{itemId:(k=b==null?void 0:b.queueItem)==null?void 0:k.id}},()=>{S("Marked as Posted! Moving to next group...")})}),(F=v.getElementById("btn-skip"))==null||F.addEventListener("click",()=>{var k;I&&clearInterval(I);try{window.onbeforeunload=null}catch{}chrome.runtime.sendMessage({type:"SKIP_CURRENT_ITEM",payload:{itemId:(k=b==null?void 0:b.queueItem)==null?void 0:k.id,reason:"Skipped by user"}},()=>{S("Skipped group. Moving to next...")})}),($=v.getElementById("btn-pause"))==null||$.addEventListener("click",()=>{I&&clearInterval(I),B=!0,U=!1,chrome.runtime.sendMessage({type:"PAUSE_QUEUE"},()=>{S("Posting Session Paused")})}),(Z=v.getElementById("btn-open-dashboard"))==null||Z.addEventListener("click",()=>{chrome.runtime.sendMessage({type:"OPEN_DASHBOARD"})})}function wt(){pe||(j||(j=document.createElement("div"),j.id="ai-group-poster-dock-root",document.body.appendChild(j),v=j.attachShadow({mode:"open"})),E())}function se(){if(pe)return;const o=Le(),e=oe();e.isLoggedIn&&chrome.runtime.sendMessage({type:"FB_USER_PROFILE_DETECTED",payload:e}),o.isGroupPage&&(chrome.runtime.sendMessage({type:"FB_PAGE_DETECTED",payload:{url:o.canonicalUrl,groupIdOrSlug:o.groupIdOrSlug,pageTitle:o.groupName}}),chrome.runtime.sendMessage({type:"GET_ACTIVE_POST_FOR_TAB",payload:{url:o.canonicalUrl}},t=>{chrome.runtime.lastError||t!=null&&t.isUserTab||t&&t.payload&&(b=t.payload,wt(),b&&b.queueItem&&ht())}))}function yt(){if(typeof document>"u"||!document.body)return;const o=document.getElementById("agp-sync-window-overlay");o&&o.remove();const e=document.createElement("div");e.id="agp-sync-window-overlay",e.innerHTML=`
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
  `,document.body.appendChild(e)}function Pe(){const o=document.getElementById("agp-sync-window-overlay");o&&o.remove()}let be=null;chrome.runtime.onMessage.addListener((o,e,t)=>{if(o.type==="START_GROUP_DISCOVERY")return(async()=>{try{console.log("[AGP:Content] Starting deep group discovery scan on current Facebook page...");const n=oe(),r=n.userId||n.name||void 0;yt(),me();const s=await Te({maxRounds:350,stagnantLimit:30,scrollDelayMs:900,accountContext:r,onBatchDiscovered:async(l,d,m)=>{be=m;const h=he(),u=[...l];for(const p of h)u.find(w=>w.groupId.toLowerCase()===p.groupId.toLowerCase())||u.push(p);try{chrome.runtime.sendMessage({type:"GROUP_BATCH_DISCOVERED",payload:{liveGroups:u,verifiedCount:u.length,duplicatesRemoved:(m==null?void 0:m.duplicatesRemoved)||0,debugMetrics:m}})}catch{}try{await ue(u,{syncMode:"merge",accountContext:r})}catch(p){console.warn("[AGP:Content] Progressive batch merge error:",p)}},onProgress:(l,d,m,h)=>{be=h;const u=z.size,p=Math.max(l,u);try{chrome.runtime.sendMessage({type:"GROUP_DISCOVERY_PROGRESS",payload:{foundCount:p,status:d,targetCount:m,debugMetrics:h}})}catch{}}}),a=he();if(a.length>0)try{await ue(a,{syncMode:"merge",accountContext:r})}catch{}const i=[...s.groups];for(const l of a)i.find(d=>d.groupId.toLowerCase()===l.groupId.toLowerCase())||i.push(l);const c=Math.max(s.totalFound,i.length);be=s.debugMetrics,Pe(),t({success:!0,payload:{groups:i,sourceUrl:window.location.href,isLoggedIn:s.isLoggedIn,totalFoundOnPage:c,profile:n,outcome:s.outcome,completionReason:s.completionReason,isPartial:s.isPartial,debugMetrics:s.debugMetrics}})}catch(n){Pe();const r=n instanceof Error?n.message:String(n);t({success:!1,error:r})}})(),!0;if(o.type==="CANCEL_GROUP_DISCOVERY")return Pe(),S("AI Group Poster: Discovery cancelled.",!0),t({success:!0}),!1;if(o.type==="GET_DEBUG_METRICS")return t({success:!0,debugMetrics:be}),!1;if(o.type==="CHECK_FACEBOOK_SESSION"){const n=le(),r=oe();return t({success:!0,isLoggedIn:n,profile:r,currentUrl:window.location.href}),!1}if(o.type==="GET_FACEBOOK_USER_INFO")return(async()=>{try{const n=le(),r=oe();let a=xe(r.userId||r.name||void 0).items;t({success:!0,isLoggedIn:n,profile:r,groups:a,totalGroups:a.length,currentUrl:window.location.href})}catch(n){const r=n instanceof Error?n.message:String(n);t({success:!1,error:r})}})(),!0});let Ie=!1,z=new Map;function me(){if(typeof window>"u"||window.__agpFetchIntercepted)return;window.__agpFetchIntercepted=!0;const o=window.fetch;window.fetch=async function(...e){var n;const t=await o.apply(this,e);try{const r=typeof e[0]=="string"?e[0]:((n=e[0])==null?void 0:n.url)||"";(r.includes("/api/graphql")||r.includes("graphql"))&&t.clone().text().then(a=>{a.includes("Group")&&(a.includes("/groups/")||a.includes('__typename":"Group"'))&&vt(a)}).catch(()=>{})}catch{}return t},console.log("[AGP:Content] GraphQL response interceptor installed")}function vt(o){try{const e=/"__typename"\s*:\s*"Group"[^}]*?"id"\s*:\s*"(\d+)"[^}]*?"name"\s*:\s*"([^"]+)"/g;let t;for(;(t=e.exec(o))!==null;){const r=t[1],s=t[2].trim();r&&s&&s.length>=2&&z.set(r,{name:s,id:r})}const n=/"node"\s*:\s*\{\s*"__typename"\s*:\s*"Group"\s*,\s*"id"\s*:\s*"(\d+)"\s*,\s*"name"\s*:\s*"([^"]+)"/g;for(;(t=n.exec(o))!==null;){const r=t[1],s=t[2].trim();r&&s&&s.length>=2&&z.set(r,{name:s,id:r})}z.size>0&&console.log(`[AGP:Content] GraphQL interceptor: total ${z.size} groups captured`)}catch{}}function he(){const o=[];for(const[e,t]of z)o.push({name:t.name,url:`https://www.facebook.com/groups/${e}/`,groupId:e,privacy:"UNKNOWN",imageUrl:t.imageUrl});return o}async function Ke(){const o=window.location.href.toLowerCase();if((o.includes("/groups/joins")||o.includes("category=membership"))&&!Ie){Ie=!0,console.log("[AGP:Content] Detected Your Groups page (/groups/joins/)! Starting full auto-scan of all joined groups..."),S("AI Group Poster: Auto-scanning your joined groups..."),me();try{const e=await Te({maxRounds:350,stagnantLimit:30,scrollDelayMs:900,onBatchDiscovered:async(r,s)=>{const a=he(),i=[...r];for(const c of a)i.find(l=>l.groupId===c.groupId)||i.push(c);try{await ue(i,{syncMode:"merge"})}catch(c){console.warn("[AGP:Content] Batch save err:",c)}},onProgress:(r,s,a)=>{const i=z.size,c=Math.max(r,i);S(`AI Group Poster: Found ${c}${a?` / ${a}`:""} groups...`);try{chrome.runtime.sendMessage({type:"GROUP_DISCOVERY_PROGRESS",payload:{foundCount:c,status:s,targetCount:a}})}catch{}}}),t=he();if(t.length>0)try{await ue(t,{syncMode:"merge"}),console.log(`[AGP:Content] Final merge: added ${t.length} intercepted groups`)}catch{}const n=Math.max(e.totalFound,z.size);S(`AI Group Poster: Sync complete! Found ${n} groups.`)}catch(e){console.warn("[AGP:Content] Auto-scan err:",e)}finally{Ie=!1}}}(window.location.href.toLowerCase().includes("/groups/joins")||window.location.href.toLowerCase().includes("category=membership"))&&me(),se(),setTimeout(Ke,3e3);let we=window.location.href;new MutationObserver(()=>{window.location.href!==we&&(we=window.location.href,se(),(we.toLowerCase().includes("/groups/joins")||we.toLowerCase().includes("category=membership"))&&me(),setTimeout(Ke,3e3))}).observe(document.body,{childList:!0,subtree:!0})})();
