const me = {
  status: "IDLE",
  searchUrl: "",
  query: "",
  totalFound: 0,
  joinedCount: 0,
  requestedCount: 0,
  alreadyJoinedCount: 0,
  failedCount: 0,
  skippedCount: 0,
  currentIndex: 0,
  currentGroupName: "",
  countdownSec: 0,
  message: "Enter any Facebook search link to start auto-joining.",
  groups: []
}, G = {
  general: {
    extensionName: "AI Group Poster",
    theme: "dark",
    notificationsEnabled: !0,
    defaultLanguage: "Bangla"
  },
  queue: {
    autoOpenNextGroup: !0,
    requireConfirmation: !0,
    delayBetweenItemsSec: 0,
    maxItemsPerSession: 50
  },
  ai: {
    provider: "openai",
    endpoint: "https://api.openai.com/v1",
    apiKey: "",
    model: "gpt-4o-mini",
    temperature: 0.7,
    defaultLanguage: "Bangla",
    defaultStyle: "Marketplace"
  },
  facebook: {
    supportedDomains: ["facebook.com", "web.facebook.com", "m.facebook.com"],
    pageDetectionIntervalMs: 1500,
    helperDockEnabled: !0,
    helperDockCollapsedDefault: !1
  },
  webhook: {
    enabled: !1,
    endpoint: "",
    secret: ""
  },
  hasCompletedOnboarding: !1
}, re = [
  {
    id: "tpl_marketplace_sale",
    name: "Standard Marketplace Sale",
    content: `🔥 {product_name} 🔥

💰 Price: {price} {old_price_tag}

📝 Details:
{description}

✨ Key Features:
{features}

📍 Location: {location}
🚚 Delivery: {delivery_info}
📞 Contact: {contact_info}

👉 {call_to_action}`,
    variables: ["product_name", "price", "old_price", "description", "features", "location", "delivery_info", "contact_info", "call_to_action"],
    isDefault: !0,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: "tpl_bike_vehicle",
    name: "Bike & Vehicle Sale",
    content: `🏍️ {product_name} For Sale

💵 Asking Price: {price}
📍 Location: {location}

📋 Condition & Description:
{description}

⚙️ Specifications:
{features}

📦 Delivery / Hand-to-Hand: {delivery_info}
📱 Call/WhatsApp: {contact_info}

{call_to_action}`,
    variables: ["product_name", "price", "description", "features", "location", "delivery_info", "contact_info", "call_to_action"],
    isDefault: !1,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: "tpl_minimal_quick",
    name: "Minimalist Quick Post",
    content: `{product_name}

Price: {price}
Location: {location}

{description}

Inbox for direct order!`,
    variables: ["product_name", "price", "location", "description"],
    isDefault: !1,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
], _ = {
  GROUPS: "agp_groups",
  ACCOUNT_GROUPS: "agp_facebook_groups_by_account",
  POSTS: "agp_posts",
  TEMPLATES: "agp_templates",
  QUEUE: "agp_queue",
  QUEUE_STATE: "agp_queue_state",
  HISTORY: "agp_history",
  LOGS: "agp_logs",
  SETTINGS: "agp_settings",
  FACEBOOK_ACCOUNT: "agp_facebook_account",
  AUTO_JOIN_STATE: "agp_auto_join_state",
  AUTO_JOIN_CONFIG: "agp_auto_join_config"
}, ne = () => {
  var t;
  return typeof chrome < "u" && !!((t = chrome.storage) != null && t.local);
}, Y = {};
async function O(t, e) {
  if (ne())
    return new Promise((a) => {
      chrome.storage.local.get([t], (n) => {
        if (chrome.runtime.lastError) {
          console.warn(`Storage get error for ${t}:`, chrome.runtime.lastError), a(Y[t] !== void 0 ? Y[t] : e);
          return;
        }
        n && n[t] !== void 0 ? a(n[t]) : a(e);
      });
    });
  try {
    if (typeof window < "u" && window.localStorage) {
      const a = window.localStorage.getItem(t);
      if (a !== null)
        return JSON.parse(a);
    }
  } catch (a) {
    console.warn("LocalStorage access failed:", a);
  }
  return Y[t] !== void 0 ? Y[t] : e;
}
async function U(t, e) {
  if (Y[t] = e, ne())
    return new Promise((a, n) => {
      chrome.storage.local.set({ [t]: e }, () => {
        chrome.runtime.lastError ? n(chrome.runtime.lastError) : a();
      });
    });
  try {
    typeof window < "u" && window.localStorage && window.localStorage.setItem(t, JSON.stringify(e));
  } catch (a) {
    console.warn("LocalStorage set failed:", a);
  }
}
function ie(t) {
  return t && t.trim().toLowerCase().replace(/[^a-z0-9_\u0980-\u09FF]/gi, "_") || "default_account";
}
async function se() {
  return O(_.ACCOUNT_GROUPS, {});
}
async function L(t) {
  const e = await v(), a = ie(t || (e == null ? void 0 : e.userId) || (e == null ? void 0 : e.name)), n = await se();
  if (n[a] && Array.isArray(n[a].groups) && n[a].groups.length > 0) {
    const s = n[a].groups.filter((i) => !K(i));
    if (s.length > 0) return s;
  }
  const o = (await O(_.GROUPS, [])).filter((r) => !K(r));
  if (o.length > 0)
    return o;
  for (const r of Object.keys(n))
    if (n[r] && Array.isArray(n[r].groups) && n[r].groups.length > 0) {
      const s = n[r].groups.filter((i) => !K(i));
      if (s.length > 0) return s;
    }
  return [];
}
async function X(t, e) {
  const a = (t || []).filter((s) => !K(s)), n = await v(), c = ie(e || (n == null ? void 0 : n.userId) || (n == null ? void 0 : n.name)), o = await se(), r = o[c] || {
    accountContext: c,
    accountInfo: n || { isLoggedIn: !0, name: "Facebook User", lastSyncedAt: Date.now() },
    groups: [],
    lastSyncedAt: Date.now()
  };
  o[c] = {
    ...r,
    groups: a,
    lastSyncedAt: Date.now()
  }, await U(_.ACCOUNT_GROUPS, o), await U(_.GROUPS, a);
}
function K(t) {
  if (!t) return !0;
  const e = (t.name || "").trim().toLowerCase(), a = (t.url || "").trim().toLowerCase();
  if (e.startsWith("unread") || e.includes("commented on") || e.includes("also commented") || e.includes("likes your") || e.includes("liked your") || e.includes("reacted to") || e.includes("shared a post") || e.includes("shared your post") || e.includes("invited you") || e.includes("mentioned you") || e.includes("requested to join") || e.includes("মন্তব্য করেছেন") || e.includes("মতামত দিয়েছেন") || e.includes("লাইক দিয়েছেন") || e.includes("শেয়ার করেছেন") || a.includes("/permalink/") || a.includes("/posts/") || a.includes("/user/") || a.includes("/profile.php") || a.includes("/friends/") || a.includes("/people/") || a.includes("/photos/") || a.includes("/videos/") || a.includes("/events/") || a.includes("/files/") || a.includes("comment_id=") || a.includes("notif_id=") || a.includes("notif_t=") || a.includes("reply_comment_id="))
    return !0;
  const n = /* @__PURE__ */ new Set([
    "about",
    "about group",
    "feed",
    "discover",
    "create",
    "notifications",
    "search",
    "categories",
    "joins",
    "settings",
    "help",
    "privacy",
    "terms",
    "policies",
    "support",
    "messages",
    "marketplace"
  ]), c = e.replace(/\s*group\s*$/i, "").trim();
  return !!(n.has(e) || n.has(c) || t.groupId && n.has(t.groupId.toLowerCase()));
}
async function J() {
  return O(_.POSTS, []);
}
async function ce() {
  return O(_.TEMPLATES, re);
}
async function B() {
  return O(_.QUEUE, []);
}
async function ee(t) {
  await U(_.QUEUE, t);
}
const we = {
  isRunning: !1,
  isPaused: !1,
  currentItemId: null,
  activeTabId: null,
  sessionStartedAt: null,
  pacingDelayRemaining: 0
};
async function D() {
  return O(_.QUEUE_STATE, we);
}
async function P(t) {
  await U(_.QUEUE_STATE, t);
}
async function ge() {
  return O(_.HISTORY, []);
}
async function Ie(t) {
  await U(_.HISTORY, t);
}
async function ue(t) {
  const e = await ge();
  e.unshift(t), e.length > 500 && (e.length = 500), await Ie(e);
}
async function he() {
  return O(_.LOGS, []);
}
async function Ee(t) {
  await U(_.LOGS, t);
}
async function be(t) {
  const e = await he();
  e.unshift(t), e.length > 300 && (e.length = 300), await Ee(e);
}
async function Q() {
  const t = await O(_.SETTINGS, G);
  return {
    ...G,
    ...t,
    general: { ...G.general, ...(t == null ? void 0 : t.general) || {} },
    queue: { ...G.queue, ...(t == null ? void 0 : t.queue) || {} },
    ai: { ...G.ai, ...(t == null ? void 0 : t.ai) || {} },
    facebook: { ...G.facebook, ...(t == null ? void 0 : t.facebook) || {} },
    webhook: { ...G.webhook, ...(t == null ? void 0 : t.webhook) || {} }
  };
}
async function le(t) {
  const e = await Q(), a = {
    ...e,
    ...t,
    general: { ...e.general, ...t.general || {} },
    queue: { ...e.queue, ...t.queue || {} },
    ai: { ...e.ai, ...t.ai || {} },
    facebook: { ...e.facebook, ...t.facebook || {} },
    webhook: { ...e.webhook, ...t.webhook || {} }
  };
  return await U(_.SETTINGS, a), a;
}
async function v() {
  return O(_.FACEBOOK_ACCOUNT, null);
}
async function j(t) {
  await U(_.FACEBOOK_ACCOUNT, t);
}
async function ye() {
  return O(_.AUTO_JOIN_STATE, me);
}
async function te(t) {
  await U(_.AUTO_JOIN_STATE, t);
}
async function Se(t) {
  await U(_.AUTO_JOIN_CONFIG, t);
}
function V(t = "id") {
  const e = Math.random().toString(36).substring(2, 9), a = Date.now().toString(36);
  return `${t}_${a}_${e}`;
}
function R(t) {
  if (!t) return "";
  if (!t.includes("{") || !t.includes("|")) return t;
  let e = t, a = 0;
  const n = /\{([^{}]+)\}/g;
  for (; a < 10 && n.test(e); )
    a++, e = e.replace(n, (c, o) => {
      if (o.includes("|")) {
        const r = o.split("|").map((s) => s.trim()).filter(Boolean);
        if (r.length > 0)
          return r[Math.floor(Math.random() * r.length)];
      }
      return c;
    });
  return e = e.replace(/\{([^{}\r\n]+?)(?=[.,!?\r\n]|$)/g, (c, o) => o.includes("|") ? o.split("|").map((s) => s.trim()).filter(Boolean)[0] || "" : c), e;
}
function _e(t) {
  if (!t) return "https://www.facebook.com/search/groups/?q=";
  const e = t.trim();
  if (e.startsWith("http://") || e.startsWith("https://"))
    try {
      const a = new URL(e);
      if (a.hostname.includes("facebook.com") || a.hostname.includes("fb.com")) {
        if (a.pathname.includes("/search/groups"))
          return e;
        const n = a.searchParams.get("q");
        return n ? `https://www.facebook.com/search/groups/?q=${encodeURIComponent(n)}` : e;
      }
    } catch {
    }
  return e.includes("facebook.com/search/groups") || e.includes("fb.com/search/groups") ? `https://${e.replace(/^https?:\/\//, "")}` : `https://www.facebook.com/search/groups/?q=${encodeURIComponent(e)}`;
}
class Ae extends Error {
  constructor(e, a, n) {
    super(n || `Invalid queue transition from ${e} to ${a}`), this.from = e, this.to = a, this.name = "QueueTransitionError";
  }
}
const Te = {
  PENDING: ["READY", "IN_PROGRESS", "SKIPPED", "FAILED", "POSTED"],
  READY: ["IN_PROGRESS", "SKIPPED", "PENDING", "FAILED", "POSTED"],
  IN_PROGRESS: ["WAITING_FOR_USER", "FAILED", "SKIPPED", "READY", "POSTED"],
  WAITING_FOR_USER: ["POSTED", "SKIPPED", "FAILED", "READY", "IN_PROGRESS"],
  POSTED: ["READY"],
  // Can reset/retry to ready
  SKIPPED: ["READY", "PENDING"],
  // Can un-skip or retry
  FAILED: ["READY", "PENDING", "SKIPPED"]
  // Can retry
};
function Ce(t, e) {
  if (t === e) return !0;
  const a = Te[t];
  return !!(a && a.includes(e));
}
function De(t, e, a) {
  if (!Ce(t.status, e))
    throw new Ae(t.status, e);
  const n = Date.now(), c = {
    ...t,
    status: e
  };
  return e === "IN_PROGRESS" && !t.startedAt && (c.startedAt = n), (e === "POSTED" || e === "SKIPPED" || e === "FAILED") && (c.completedAt = n), e === "FAILED" ? (c.errorMessage = "Operation failed", c.retryCount = (t.retryCount || 0) + 1) : e === "READY" && t.status === "FAILED" && (c.errorMessage = void 0), c;
}
class Pe {
  async writeLog(e, a, n, c) {
    const o = {
      id: V("log"),
      timestamp: Date.now(),
      level: e,
      source: a,
      message: n,
      details: c
    }, r = `[AGP:${a.toUpperCase()}][${e}]`;
    e === "ERROR" ? console.error(r, n, c || "") : e === "WARNING" ? console.warn(r, n, c || "") : console.log(r, n, c || "");
    try {
      await be(o);
    } catch (s) {
      console.warn("Failed to persist log entry:", s);
    }
    return o;
  }
  info(e, a, n) {
    return this.writeLog("INFO", e, a, n);
  }
  success(e, a, n) {
    return this.writeLog("SUCCESS", e, a, n);
  }
  warning(e, a, n) {
    return this.writeLog("WARNING", e, a, n);
  }
  error(e, a, n) {
    return this.writeLog("ERROR", e, a, n);
  }
}
const T = new Pe();
function Oe(t) {
  const e = {
    total: t.length,
    pending: 0,
    ready: 0,
    inProgress: 0,
    waitingForUser: 0,
    posted: 0,
    skipped: 0,
    failed: 0
  };
  return t.forEach((a) => {
    switch (a.status) {
      case "PENDING":
        e.pending++;
        break;
      case "READY":
        e.ready++;
        break;
      case "IN_PROGRESS":
        e.inProgress++;
        break;
      case "WAITING_FOR_USER":
        e.waitingForUser++;
        break;
      case "POSTED":
        e.posted++;
        break;
      case "SKIPPED":
        e.skipped++;
        break;
      case "FAILED":
        e.failed++;
        break;
    }
  }), e;
}
async function Ue(t, e, a = "READY") {
  const [n, c] = await Promise.all([L(), J()]), o = c.find((i) => i.id === e);
  let r = 0;
  const s = t.map((i) => {
    r++;
    const d = n.find(
      (w) => w.id === i || w.groupId === i || w.url && w.url.includes(i)
    ), m = (d == null ? void 0 : d.url) || (i.startsWith("http") ? i : `https://www.facebook.com/groups/${i}/`);
    return {
      id: V("queue"),
      groupId: i,
      groupName: d ? d.name : "Facebook Group",
      groupUrl: m,
      postId: e,
      caption: (o == null ? void 0 : o.caption) || (o == null ? void 0 : o.description) || void 0,
      media: void 0,
      // Lean: post.images will be used directly to avoid gigabytes of duplicate base64
      status: a,
      order: r,
      createdAt: Date.now()
    };
  });
  return await ee(s), await T.info("queue", `Created clean posting queue for ${s.length} groups`), s;
}
function ve(t) {
  const e = t.find((a) => a.status === "READY");
  return e || t.find((a) => a.status === "PENDING") || null;
}
async function H(t, e, a) {
  const n = await B(), c = n.findIndex((r) => r.id === t);
  if (c === -1)
    throw new Error(`Queue item ${t} not found`);
  const o = De(n[c], e);
  return n[c] = o, await ee(n), { queue: n, updatedItem: o };
}
async function ke(t, e) {
  const { queue: a, updatedItem: n } = await H(t, "POSTED"), [c, o] = await Promise.all([L(), J()]), r = c.find((m) => m.id === n.groupId), s = o.find((m) => m.id === n.postId), i = n.startedAt ? Math.max(1, Math.round((Date.now() - n.startedAt) / 1e3)) : void 0, d = {
    id: V("hist"),
    queueItemId: n.id,
    groupId: n.groupId,
    groupName: r ? r.name : "Unknown Group",
    groupUrl: r ? r.url : "",
    postId: n.postId,
    postTitle: s ? s.title : "Untitled Post",
    productName: s ? s.productName : "",
    status: "POSTED",
    postedAt: Date.now(),
    notes: "User confirmed posting on Facebook",
    durationSeconds: i
  };
  return await ue(d), r && (r.postCount = (r.postCount || 0) + 1, r.lastPostedAt = Date.now(), r.status = "POSTED", await X(c)), await T.success("queue", `Post marked as POSTED for group: ${r ? r.name : n.groupId}`), n;
}
async function de(t, e = "User skipped") {
  const { updatedItem: a } = await H(t, "SKIPPED"), [n, c] = await Promise.all([L(), J()]), o = n.find((i) => i.id === a.groupId), r = c.find((i) => i.id === a.postId), s = {
    id: V("hist"),
    queueItemId: a.id,
    groupId: a.groupId,
    groupName: o ? o.name : "Unknown Group",
    groupUrl: o ? o.url : "",
    postId: a.postId,
    postTitle: r ? r.title : "Untitled Post",
    productName: r ? r.productName : "",
    status: "SKIPPED",
    postedAt: Date.now(),
    notes: e
  };
  return await ue(s), await T.info("queue", `Post marked as SKIPPED for group: ${o ? o.name : a.groupId}`), a;
}
function Ge(t, e) {
  return {
    product_name: t.productName || "",
    title: t.title || "",
    price: t.price || "",
    old_price: t.oldPrice || "",
    old_price_tag: t.oldPrice ? `(Regular: ${t.oldPrice})` : "",
    description: t.description || "",
    features: t.features || "",
    location: t.location || "",
    delivery_info: t.deliveryInfo || "",
    contact_info: t.contactInfo || "",
    call_to_action: t.callToAction || "",
    caption: t.caption || ""
  };
}
function Ne(t, e) {
  if (!t) return "";
  const a = t.replace(/\{([a-zA-Z0-9_-]+)\}/g, (c, o) => {
    const r = o.toLowerCase();
    return r in e && e[r] !== void 0 ? e[r] : "";
  });
  return R(a).split(`
`).filter((c) => {
    const o = c.trim();
    return o ? !/^(💰\s*Price:\s*|📍\s*Location:\s*|🚚\s*Delivery:\s*|📞\s*Contact:\s*|✨\s*Key Features:\s*|📝\s*Details:\s*|👉\s*|📋\s*Condition.*:\s*|⚙️\s*Specifications:\s*|📦\s*Delivery.*:\s*|📱\s*Call.*:\s*|💵\s*Asking Price:\s*)$/i.test(
      o
    ) : !0;
  }).join(`
`).replace(/\n{3,}/g, `

`).trim();
}
function Re(t, e) {
  if (t.caption && !e)
    return R(t.caption);
  if (e) {
    const c = Ge(t), o = Ne(e, c);
    if (o.trim()) return R(o);
  }
  if (t.caption && t.caption.trim())
    return R(t.caption.trim());
  const a = [], n = t.productName || t.title;
  if (n && n !== "Facebook Group Listing" && n !== "Untitled Post" && a.push(n), t.price && t.price.trim()) {
    const c = t.oldPrice ? `Price: ${t.price} (Prev: ${t.oldPrice})` : `Price: ${t.price}`;
    a.push(c);
  }
  return t.description && t.description.trim() && a.push(t.description.trim()), t.features && t.features.trim() && a.push(`Features:
${t.features.trim()}`), t.location && t.location.trim() && a.push(`Location: ${t.location.trim()}`), t.deliveryInfo && t.deliveryInfo.trim() && a.push(`Delivery: ${t.deliveryInfo.trim()}`), t.contactInfo && t.contactInfo.trim() && a.push(`Contact: ${t.contactInfo.trim()}`), t.callToAction && t.callToAction.trim() && a.push(t.callToAction.trim()), a.join(`

`).trim();
}
function Le(t) {
  if (!t || typeof t != "string") return t || "";
  const e = t.trim();
  if (e.length < 20) return t;
  const a = e.length, n = Math.floor(a / 2);
  for (let o = -15; o <= 15; o++) {
    const r = n + o;
    if (r > 10 && r < a) {
      const s = e.slice(0, r).trim(), i = e.slice(r).trim();
      if (s.length >= 15 && s === i)
        return s;
    }
  }
  const c = e.split(`
`).filter((o) => o.trim().length > 0);
  if (c.length >= 2) {
    const o = c[0].trim();
    if (o.length >= 10) {
      let r = o.length;
      for (; r < e.length; ) {
        const s = e.indexOf(o, r);
        if (s === -1) break;
        const i = e.slice(0, s).trim(), d = e.slice(s).trim();
        if (i.length >= 20 && (i === d || d.startsWith(i) || i.startsWith(d) || i.length > 30 && d.length > 30 && i.slice(0, 50) === d.slice(0, 50) && i.slice(-20) === d.slice(-20)))
          return i;
        r = s + o.length;
      }
    }
  }
  if (e.length > 60) {
    const o = e.slice(0, 35), r = e.indexOf(o, 35);
    if (r > 0) {
      const s = e.slice(0, r).trim(), i = e.slice(r).trim();
      if (s.length >= 25 && (s === i || i.startsWith(s.slice(0, Math.floor(s.length * 0.85)))))
        return s;
    }
  }
  return t;
}
async function x(t, e) {
  try {
    const a = await Q();
    if (!a.webhook.enabled || !a.webhook.endpoint)
      return;
    const n = {
      "Content-Type": "application/json",
      "User-Agent": "AIGroupPoster-Extension/1.0"
    };
    a.webhook.secret && (n["x-agp-secret"] = a.webhook.secret);
    const c = {
      event: t,
      timestamp: Date.now(),
      payload: e
    };
    fetch(a.webhook.endpoint, {
      method: "POST",
      headers: n,
      body: JSON.stringify(c)
    }).catch((o) => {
      T.warning("queue", `Webhook dispatch to ${a.webhook.endpoint} failed: ${o}`);
    });
  } catch (a) {
    console.warn("Webhook error:", a);
  }
}
function Fe(t, e) {
  if (!t || !t.trim())
    return e ? e.split(/[-_.]+/).filter(Boolean).map((n) => n.charAt(0).toUpperCase() + n.slice(1)).join(" ") : "Facebook Group";
  let a = t.trim();
  return a = a.replace(/^(?:Visit|Open|View|গ্রুপ দেখুন|দেখুন)\s+/i, ""), a = a.replace(/\s*(?:Last active|You last visited|last visited|active)\s+[^\n]+/i, ""), a = a.replace(/\s*(?:গত|আগে|মিনিট আগে|ঘণ্টা আগে|দিন আগে)[^\n]*/i, ""), a = a.replace(/\s*·\s*(?:Public group|Private group|পাবলিক গ্রুপ|প্রাইভেট গ্রুপ).*$/i, ""), a = a.replace(/\s*·\s*\d+.*members.*$/i, ""), a = a.replace(/\s*·\s*[০-৯\d]+.*সদস্য.*$/i, ""), a = a.replace(/\s*·\s*[^\n]+/i, ""), (a.toLowerCase() === "visit" || a.toLowerCase() === "group" || a.toLowerCase() === "view group") && e ? e.split(/[-_.]+/).filter(Boolean).map((n) => n.charAt(0).toUpperCase() + n.slice(1)).join(" ") : a.trim() || "Facebook Group";
}
const Z = "agp_discovery_progress";
function Me() {
  return {
    candidateCount: 0,
    verifiedCount: 0,
    duplicatesRemoved: 0,
    rejectedCount: 0,
    scrollIterations: 0,
    mutationEvents: 0,
    targetCount: null,
    targetCountStatus: "UNAVAILABLE",
    completionReason: null,
    scanDurationMs: 0,
    lastNewGroupTimestamp: null
  };
}
const ae = {
  state: "NOT_CONNECTED",
  foundCount: 0,
  importedCount: 0,
  duplicateCount: 0,
  errorCount: 0,
  message: 'Click "Sync Facebook Groups" to discover all joined groups.',
  debugMetrics: Me()
};
async function oe() {
  var t;
  return typeof chrome < "u" && ((t = chrome.storage) != null && t.local) ? new Promise((e) => {
    chrome.storage.local.get([Z], (a) => {
      e(a[Z] || ae);
    });
  }) : ae;
}
async function N(t) {
  var e;
  typeof chrome < "u" && ((e = chrome.storage) != null && e.local) && await chrome.storage.local.set({ [Z]: t });
}
async function pe(t, e) {
  var b;
  const a = (e == null ? void 0 : e.accountContext) || ((b = await v()) == null ? void 0 : b.name) || "default_account", n = await L(a), c = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map(), s = (l) => l.trim().toLowerCase().replace(/\s+/g, " ");
  n.forEach((l) => {
    l.groupId && c.set(l.groupId.toLowerCase(), l), l.url && o.set(l.url.toLowerCase().replace(/\/$/, ""), l), l.name && r.set(s(l.name), l);
  });
  let i = 0, d = 0;
  const m = Date.now(), w = [], u = /* @__PURE__ */ new Set();
  for (const l of t) {
    if (K(l)) continue;
    const A = (l.groupId || "").toLowerCase(), g = (l.url || "").toLowerCase().replace(/\/$/, ""), h = s(l.name || "");
    let S = (A ? c.get(A) : void 0) || (g ? o.get(g) : void 0) || (h && h.length >= 3 ? r.get(h) : void 0);
    const C = Fe(l.name || "", l.groupId);
    if (S)
      d++, u.add(S.id), C && (!S.name || S.name.includes("·") || S.name.length < C.length) && (S.name = C), l.imageUrl && !S.imageUrl && (S.imageUrl = l.imageUrl), l.privacy && l.privacy !== "UNKNOWN" && (S.privacy = l.privacy), S.verified = !0, S.source = "facebook-ui", S.accountContext = a, S.discoveredAt = m, S.updatedAt = m;
    else {
      i++;
      const q = l.groupId ? `grp_${l.groupId.replace(/[^a-zA-Z0-9_-]/g, "")}` : V("grp"), z = l.url.startsWith("http") ? l.url : `https://www.facebook.com/groups/${l.groupId}/`, W = {
        id: q,
        name: C,
        url: z,
        groupId: l.groupId,
        privacy: l.privacy || "UNKNOWN",
        imageUrl: l.imageUrl,
        category: "Discovered",
        enabled: !0,
        selected: !0,
        // Selected by default for convenient queue creation
        status: "READY",
        postCount: 0,
        verified: !0,
        source: "facebook-ui",
        accountContext: a,
        discoveredAt: m,
        createdAt: m,
        updatedAt: m
      };
      w.push(W), A && c.set(A, W), g && o.set(g, W), h && r.set(h, W), u.add(W.id);
    }
  }
  let f;
  if ((e == null ? void 0 : e.syncMode) === "exact") {
    const l = (g) => g.source === "manual" || g.category && g.category !== "Discovered", A = n.filter((g) => u.has(g.id) || l(g));
    f = [...w, ...A];
  } else
    f = [...w, ...n];
  const I = [], p = /* @__PURE__ */ new Set(), k = /* @__PURE__ */ new Set();
  for (const l of f) {
    const A = l.url.toLowerCase().replace(/\/$/, "");
    !p.has(l.id) && !k.has(A) && (p.add(l.id), k.add(A), I.push(l));
  }
  return await X(I, a), await T.info(
    "dashboard",
    `Group discovery merged (${(e == null ? void 0 : e.syncMode) || "merge"}): ${i} imported, ${d} duplicates, total ${I.length}`
  ), {
    imported: i,
    duplicates: d,
    totalStored: I.length,
    verifiedCount: I.filter((l) => l.verified).length
  };
}
console.log("[AGP:Background] Service Worker starting with Group Discovery...");
chrome.runtime.onInstalled.addListener(async (t) => {
  console.log("[AGP:Background] Extension installed/updated:", t.reason);
  try {
    const e = await Q();
    e ? e.queue && e.queue.delayBetweenItemsSec > 3 && (e.queue.delayBetweenItemsSec = 0, await le(e)) : await chrome.storage.local.set({ agp_settings: G }), await fe();
    const a = await ce();
    (!a || a.length === 0) && await chrome.storage.local.set({ agp_templates: re }), await T.info("background", `AI Group Poster installed/updated (${t.reason})`);
  } catch (e) {
    console.error("Error during onInstalled initialization:", e);
  }
});
async function fe() {
  try {
    const t = await B();
    let e = !1;
    const a = t.map((n) => n.media && n.media.length > 0 ? (e = !0, { ...n, media: void 0 }) : n);
    if (e || t.length > 100) {
      const n = a.filter((c) => c.status === "READY" || c.status === "IN_PROGRESS");
      await chrome.storage.local.set({ agp_queue: n }), console.log("[AGP:Background] Pruned storage bloat from agp_queue.");
    }
  } catch (t) {
    console.warn("[AGP:Background] Clean storage bloat error:", t);
  }
}
fe();
async function M(t, e) {
  try {
    if (!(await Q()).general.notificationsEnabled) return;
    chrome.notifications && chrome.notifications.create({
      type: "basic",
      iconUrl: chrome.runtime.getURL("icons/icon48.png"),
      title: t,
      message: e,
      priority: 1
    });
  } catch (a) {
    console.warn("Could not show notification:", a);
  }
}
async function qe(t) {
  let e = t;
  for (; e > 0; ) {
    const n = await D();
    if (!n.isRunning || n.isPaused)
      break;
    await P({ ...n, pacingDelayRemaining: e }), await new Promise((c) => setTimeout(c, 1e3)), e--;
  }
  const a = await D();
  await P({ ...a, pacingDelayRemaining: 0 });
}
let E = null, y = null;
async function $() {
  var w;
  const t = await B(), e = ve(t);
  if (!e) {
    if (E) {
      try {
        await chrome.windows.remove(E);
      } catch {
      }
      E = null, y = null;
    } else if (y) {
      try {
        await chrome.tabs.remove(y);
      } catch {
      }
      y = null;
    }
    const u = await D();
    await P({
      ...u,
      isRunning: !1,
      isPaused: !1,
      currentItemId: null,
      expectedGroupId: null,
      expectedGroupName: null,
      expectedGroupUrl: null,
      pacingDelayRemaining: 0
    }), await M("Queue Completed", "All eligible items in the posting queue have been processed."), await T.success("queue", "Queue session completed successfully"), await x("QUEUE_COMPLETED", { totalProcessed: t.length });
    return;
  }
  const [a, n] = await Promise.all([L(), J()]);
  let c = a.find(
    (u) => u.id === e.groupId || u.groupId === e.groupId || u.url && e.groupId && u.url.includes(e.groupId)
  ), o = (c == null ? void 0 : c.url) || e.groupUrl || "";
  if (!o && e.groupId && !e.groupId.startsWith("grp_") && !e.groupId.startsWith("queue_") && (o = e.groupId.startsWith("http") ? e.groupId : `https://www.facebook.com/groups/${e.groupId}/`), !o || o.includes("/groups/grp_") || !o.includes("facebook.com")) {
    console.warn(`[AGP:Worker] Stale/invalid group URL: "${o}" for item ${e.id}. Skipping...`), await de(e.id), await $();
    return;
  }
  const r = c || {
    id: e.groupId,
    name: e.groupName || "Facebook Group",
    url: o,
    groupId: e.groupId,
    category: "General",
    enabled: !0,
    status: "READY",
    postCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  r.url = o;
  let s = n.find((u) => u.id === e.postId) || n[n.length - 1] || n[0];
  s || (s = {
    id: e.postId || "post_default",
    title: "Facebook Group Listing",
    productName: "Facebook Group Listing",
    caption: e.caption || "",
    description: e.caption || "",
    images: e.media || [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  }), await H(e.id, "IN_PROGRESS");
  let i, d = !1;
  if (E)
    try {
      const u = await chrome.windows.get(E, { populate: !0 });
      u && u.id && (d = !0);
    } catch {
      d = !1, E = null, y = null;
    }
  if (d && E) {
    if (y)
      try {
        const u = await chrome.tabs.get(y);
        if (u && u.windowId === E) {
          await chrome.tabs.update(y, { url: r.url, active: !0 }), i = y;
          try {
            await chrome.windows.update(E, { focused: !0 });
          } catch {
          }
        }
      } catch {
        y = null;
      }
    if (!i)
      try {
        const u = await chrome.tabs.create({
          windowId: E,
          url: r.url,
          active: !0
        });
        i = u.id, y = u.id ?? null;
      } catch (u) {
        console.warn("[AGP:Worker] Failed to create tab inside automation window:", u);
      }
  }
  if (!i || !E)
    try {
      const u = await chrome.windows.create({
        url: r.url,
        type: "popup",
        width: 960,
        height: 720,
        top: 60,
        left: 60,
        focused: !0
      });
      E = u.id ?? null, u.tabs && u.tabs.length > 0 ? i = u.tabs[0].id : u.id && (i = (w = (await chrome.tabs.query({ windowId: u.id }))[0]) == null ? void 0 : w.id), y = i ?? null;
    } catch (u) {
      console.error("[AGP:Worker] Failed to create dedicated automation popup window:", u);
    }
  const m = await D();
  await P({
    ...m,
    isRunning: !0,
    isPaused: !1,
    currentItemId: e.id,
    activeTabId: i ?? null,
    expectedGroupId: r.groupId || r.id,
    expectedGroupName: r.name,
    expectedGroupUrl: r.url,
    currentGroupMatch: !0
  }), await T.info("queue", `Opening group: ${r.name} (${r.url})`), await M("Group Opened", `Review your prepared post for: ${r.name}`), await x("POST_READY", { groupId: r.id, postId: s.id, groupName: r.name });
}
let F = null;
async function $e() {
  var n, c, o;
  const t = {
    state: "DISCOVERING",
    foundCount: 0,
    importedCount: 0,
    duplicateCount: 0,
    errorCount: 0,
    outcome: "PARTIAL",
    message: "Opening Facebook sync window...",
    lastDiscoveredAt: Date.now()
  };
  await N(t);
  let e = null, a = null;
  try {
    const s = await chrome.windows.create({
      url: "https://www.facebook.com/groups/joins/?nav_source=tab",
      type: "popup",
      width: 500,
      height: 680,
      top: 80,
      left: 80,
      focused: !0
    });
    if (e = s.id ?? null, F = e, s.tabs && s.tabs.length > 0 ? a = s.tabs[0].id ?? null : e && (a = ((n = (await chrome.tabs.query({ windowId: e }))[0]) == null ? void 0 : n.id) ?? null), !a)
      throw new Error("Failed to resolve Facebook tab for group sync.");
    console.log(`[AGP:Worker] Facebook popup window created (Win #${e}, Tab #${a})`);
    const i = Date.now();
    for (; Date.now() - i < 15e3; ) {
      try {
        if ((await chrome.tabs.get(a)).status === "complete") break;
      } catch {
      }
      await new Promise((f) => setTimeout(f, 400));
    }
    if (await new Promise((f) => setTimeout(f, 2200)), !await new Promise((f) => {
      chrome.tabs.sendMessage(a, { type: "CHECK_FACEBOOK_SESSION" }, (I) => {
        f(!chrome.runtime.lastError && (I == null ? void 0 : I.success));
      });
    }) && chrome.scripting)
      try {
        await chrome.scripting.executeScript({
          target: { tabId: a },
          files: ["facebook-content.js"]
        }), await new Promise((f) => setTimeout(f, 1e3));
      } catch (f) {
        console.warn("[AGP:Worker] Script injection warning:", f);
      }
    await N({
      state: "DISCOVERING",
      foundCount: 0,
      importedCount: 0,
      duplicateCount: 0,
      errorCount: 0,
      outcome: "PARTIAL",
      message: "Scanning Facebook joined groups...",
      lastDiscoveredAt: Date.now()
    });
    const m = await new Promise((f) => {
      chrome.tabs.sendMessage(a, { type: "START_GROUP_DISCOVERY" }, (I) => {
        chrome.runtime.lastError ? f({ success: !1, error: chrome.runtime.lastError.message }) : f(I || { success: !1, error: "No response from content script" });
      });
    });
    if (e) {
      try {
        await chrome.windows.remove(e);
      } catch (f) {
        console.warn("[AGP:Worker] Popup window auto-close note:", f);
      }
      F = null;
    }
    if (m != null && m.success && m.payload) {
      const f = m.payload, I = f.groups || [], p = f.profile, k = (p == null ? void 0 : p.userId) || (p == null ? void 0 : p.name) || void 0, b = await v(), l = ((p == null ? void 0 : p.name) || (b == null ? void 0 : b.name) || "").trim();
      b != null && b.name && (p != null && p.name) && b.name.trim().toLowerCase() !== p.name.trim().toLowerCase() && console.log(`[AGP:Worker] Account changed from "${b.name}" to "${p.name}". Isolated storage.`);
      const A = await pe(I, {
        syncMode: "exact",
        accountContext: k
      }), g = {
        isLoggedIn: !!(p != null && p.isLoggedIn || p != null && p.name),
        name: l || "Facebook User",
        profileUrl: (p == null ? void 0 : p.profileUrl) || (b == null ? void 0 : b.profileUrl) || "https://www.facebook.com",
        avatarUrl: (p == null ? void 0 : p.avatarUrl) || (b == null ? void 0 : b.avatarUrl) || "",
        userId: (p == null ? void 0 : p.userId) || (b == null ? void 0 : b.userId) || "",
        totalGroupsCount: A.totalStored,
        lastSyncedAt: Date.now()
      };
      await j(g);
      const h = f.outcome || (f.isPartial ? "PARTIAL" : "COMPLETE"), S = f.completionReason || (h === "COMPLETE" ? "TARGET_REACHED" : "STAGNANT_TIMEOUT");
      let C = "";
      h === "COMPLETE" ? C = `${A.totalStored} verified groups found — scan complete.` : C = `${A.totalStored} verified groups found — Facebook did not expose the complete list.`;
      const q = {
        state: h === "COMPLETE" ? "DISCOVERY_COMPLETE" : "DISCOVERY_PARTIAL",
        foundCount: f.totalFoundOnPage || A.totalStored,
        importedCount: A.imported,
        duplicateCount: A.duplicates,
        errorCount: 0,
        outcome: h,
        completionReason: S,
        targetCount: ((c = f.debugMetrics) == null ? void 0 : c.targetCount) ?? null,
        targetCountStatus: ((o = f.debugMetrics) == null ? void 0 : o.targetCountStatus) ?? "UNAVAILABLE",
        debugMetrics: f.debugMetrics,
        message: C,
        lastDiscoveredAt: Date.now()
      };
      return await N(q), h === "COMPLETE" ? (await M("Facebook Groups Synced", C), await T.success("dashboard", C)) : (await M("Facebook Groups Synced (Partial)", C), await T.info("dashboard", C)), q;
    }
    const u = {
      state: "DISCOVERY_FAILED",
      foundCount: 0,
      importedCount: 0,
      duplicateCount: 0,
      errorCount: 1,
      outcome: "FAILED",
      completionReason: "NO_JOINED_GROUP_INTERFACE",
      message: (m == null ? void 0 : m.error) || "Facebook group discovery failed.",
      lastDiscoveredAt: Date.now()
    };
    return await N(u), u;
  } catch (r) {
    if (e) {
      try {
        await chrome.windows.remove(e);
      } catch {
      }
      F = null;
    }
    const i = {
      state: "DISCOVERY_FAILED",
      foundCount: 0,
      importedCount: 0,
      duplicateCount: 0,
      errorCount: 1,
      outcome: "FAILED",
      completionReason: "NO_JOINED_GROUP_INTERFACE",
      message: `Discovery error: ${r instanceof Error ? r.message : String(r)}`,
      lastDiscoveredAt: Date.now()
    };
    return await N(i), i;
  }
}
chrome.runtime.onMessage.addListener((t, e, a) => ((async () => {
  var n, c;
  try {
    switch (t.type) {
      case "START_GROUP_DISCOVERY": {
        const o = await $e();
        a({ success: !0, progress: o });
        break;
      }
      case "CANCEL_GROUP_DISCOVERY": {
        if (F) {
          try {
            await chrome.windows.remove(F);
          } catch {
          }
          F = null;
        }
        await N({
          state: "DISCOVERY_PARTIAL",
          foundCount: 0,
          importedCount: 0,
          duplicateCount: 0,
          errorCount: 0,
          outcome: "CANCELLED",
          completionReason: "USER_CANCELLED",
          message: "Discovery cancelled by user.",
          lastDiscoveredAt: Date.now()
        }), a({ success: !0 });
        break;
      }
      case "GET_DISCOVERY_STATUS": {
        const o = await oe();
        a({ success: !0, progress: o });
        break;
      }
      case "GROUP_BATCH_DISCOVERED": {
        const o = t.payload;
        if (o && o.liveGroups && Array.isArray(o.liveGroups)) {
          try {
            await pe(o.liveGroups, { syncMode: "merge" });
          } catch (r) {
            console.warn("[AGP:Worker] Live batch merge warning:", r);
          }
          await N({
            state: "DISCOVERING",
            foundCount: o.verifiedCount || o.liveGroups.length,
            importedCount: o.verifiedCount || o.liveGroups.length,
            duplicateCount: o.duplicatesRemoved || 0,
            errorCount: 0,
            outcome: "PARTIAL",
            debugMetrics: o.debugMetrics,
            message: `Scanning Facebook Groups... ${o.verifiedCount || o.liveGroups.length} verified groups discovered`,
            lastDiscoveredAt: Date.now()
          });
        }
        a({ success: !0 });
        break;
      }
      case "GROUP_DISCOVERY_PROGRESS": {
        const o = t.payload;
        o && typeof o.foundCount == "number" && await N({
          state: "DISCOVERING",
          foundCount: o.foundCount,
          importedCount: o.foundCount,
          duplicateCount: 0,
          errorCount: 0,
          outcome: "PARTIAL",
          debugMetrics: o.debugMetrics,
          message: o.status || `Scanning Facebook Groups... ${o.foundCount} verified groups discovered`,
          lastDiscoveredAt: Date.now()
        }), a({ success: !0 });
        break;
      }
      case "GET_QUEUE_STATE": {
        const [o, r] = await Promise.all([B(), D()]), s = Oe(o);
        a({ success: !0, queue: o, state: r, stats: s });
        break;
      }
      case "DETECT_FB_SESSION": {
        const r = (await chrome.tabs.query({})).find((s) => s.url && s.url.includes("facebook.com"));
        if (r && r.id)
          return await (async () => {
            chrome.tabs.sendMessage(r.id, { type: "GET_FACEBOOK_USER_INFO" }, async (i) => {
              const d = await L();
              if (chrome.runtime.lastError || !i) {
                if (chrome.scripting && r.id)
                  try {
                    await chrome.scripting.executeScript({
                      target: { tabId: r.id },
                      files: ["facebook-content.js"]
                    }), setTimeout(() => {
                      chrome.tabs.sendMessage(r.id, { type: "GET_FACEBOOK_USER_INFO" }, async (w) => {
                        if (w && w.profile && w.profile.isLoggedIn) {
                          const u = {
                            isLoggedIn: !0,
                            name: w.profile.name,
                            profileUrl: w.profile.profileUrl,
                            avatarUrl: w.profile.avatarUrl,
                            userId: w.profile.userId,
                            totalGroupsCount: d.length,
                            lastSyncedAt: Date.now()
                          };
                          await j(u), a({ success: !0, account: u });
                        } else {
                          const u = await v();
                          a({ success: !0, account: u });
                        }
                      });
                    }, 400);
                    return;
                  } catch {
                  }
                const m = await v();
                a({ success: !0, account: m });
                return;
              }
              if (i && i.profile && i.profile.isLoggedIn) {
                const m = {
                  isLoggedIn: !0,
                  name: i.profile.name,
                  profileUrl: i.profile.profileUrl,
                  avatarUrl: i.profile.avatarUrl,
                  userId: i.profile.userId,
                  totalGroupsCount: d.length,
                  lastSyncedAt: Date.now()
                };
                await j(m), a({ success: !0, account: m });
              } else {
                const m = await v();
                a({ success: !0, account: m });
              }
            });
          })(), !0;
        {
          const s = await v();
          a({ success: !0, account: s });
        }
        break;
      }
      case "FB_USER_PROFILE_DETECTED": {
        const o = t.payload;
        if (o && o.name) {
          const r = await v();
          await j({
            isLoggedIn: !0,
            name: o.name,
            profileUrl: o.profileUrl,
            avatarUrl: o.avatarUrl,
            userId: o.userId,
            totalGroupsCount: (r == null ? void 0 : r.totalGroupsCount) || 0,
            lastSyncedAt: Date.now()
          });
        }
        a({ success: !0 });
        break;
      }
      case "START_QUEUE": {
        const o = await D();
        await P({
          ...o,
          isRunning: !0,
          isPaused: !1,
          sessionStartedAt: Date.now()
        }), await T.info("queue", "Queue execution started"), await x("QUEUE_STARTED", {}), await $(), a({ success: !0 });
        break;
      }
      case "PAUSE_QUEUE": {
        const o = await D();
        await P({ ...o, isPaused: !0 }), await T.info("queue", "Queue execution paused"), await M("Queue Paused", "Posting queue has been paused by user."), a({ success: !0 });
        break;
      }
      case "RESUME_QUEUE": {
        const o = await D();
        await P({ ...o, isPaused: !1, isRunning: !0 }), await T.info("queue", "Queue execution resumed"), await $(), a({ success: !0 });
        break;
      }
      case "CREATE_AND_START_QUEUE": {
        const o = t.payload;
        if (o && Array.isArray(o.groupIds) && o.postId) {
          const r = await Q(), s = typeof o.delaySec == "number" && o.delaySec >= 0 ? o.delaySec : 0;
          if (await le({
            queue: { ...r.queue, delayBetweenItemsSec: s }
          }), E)
            try {
              await chrome.windows.remove(E);
            } catch {
            }
          E = null, y = null, await Ue(o.groupIds, o.postId, "READY");
          const i = await D();
          await P({
            ...i,
            isRunning: !0,
            isPaused: !1,
            activeTabId: null,
            sessionStartedAt: Date.now()
          }), await T.info("queue", `Sequential posting queue created for ${o.groupIds.length} groups`), await x("QUEUE_STARTED", { count: o.groupIds.length }), await $(), a({ success: !0 });
        } else
          a({ success: !1, error: "Invalid payload for CREATE_AND_START_QUEUE" });
        break;
      }
      case "STOP_QUEUE": {
        if (E) {
          try {
            await chrome.windows.remove(E);
          } catch {
          }
          E = null, y = null;
        } else if (y) {
          try {
            await chrome.tabs.remove(y);
          } catch {
          }
          y = null;
        }
        const o = await D();
        await P({
          ...o,
          isRunning: !1,
          isPaused: !1,
          currentItemId: null,
          expectedGroupId: null,
          expectedGroupName: null,
          expectedGroupUrl: null,
          pacingDelayRemaining: 0
        }), await T.info("queue", "Queue execution stopped by user"), a({ success: !0 });
        break;
      }
      case "MARK_AS_POSTED": {
        const o = await D(), r = t.payload ? t.payload.itemId : o.currentItemId;
        if (!r) {
          a({ success: !1, error: "No active item to mark as posted" });
          return;
        }
        await ke(r), await M("Post Completed", "Group marked as posted."), await x("POST_MARKED_POSTED", { itemId: r });
        const s = await Q();
        o.isPaused || (await P({ ...o, isRunning: !0 }), s.queue.delayBetweenItemsSec > 0 && s.queue.delayBetweenItemsSec <= 5 && await qe(s.queue.delayBetweenItemsSec), await $()), a({ success: !0 });
        break;
      }
      case "SKIP_CURRENT_ITEM": {
        const o = await D(), r = t.payload, s = (r == null ? void 0 : r.itemId) || o.currentItemId;
        if (!s) {
          a({ success: !1, error: "No active item to skip" });
          return;
        }
        const i = (r == null ? void 0 : r.reason) || "Auto-skipped (posting unavailable or wrong group)";
        await de(s, i), await x("POST_SKIPPED", { itemId: s, reason: i }), o.isPaused || (await P({ ...o, isRunning: !0 }), await $()), a({ success: !0 });
        break;
      }
      case "UPDATE_QUEUE_ITEM_CAPTION": {
        const o = t.payload;
        if (o != null && o.itemId && o.caption !== void 0) {
          const s = (await B()).map((i) => i.id === o.itemId ? { ...i, caption: o.caption } : i);
          await ee(s);
        }
        a({ success: !0 });
        break;
      }
      case "FB_PAGE_DETECTED": {
        const o = await D();
        if (o.currentItemId)
          try {
            await H(o.currentItemId, "IN_PROGRESS");
          } catch {
          }
        a({ success: !0 });
        break;
      }
      case "GET_ACTIVE_POST_FOR_TAB": {
        if (!!!(e.tab && (e.tab.id === y || E && e.tab.windowId === E || e.tab.id === (await D()).activeTabId))) {
          a({ success: !0, payload: null, isUserTab: !0 });
          return;
        }
        const [r, s, i, d, m] = await Promise.all([
          B(),
          D(),
          L(),
          J(),
          ce()
        ]);
        let w = s.currentItemId && r.find((g) => g.id === s.currentItemId) || null;
        const u = ((n = e.tab) == null ? void 0 : n.url) || ((c = t.payload) == null ? void 0 : c.url) || "";
        if (!w && u) {
          const g = i.find((h) => u.includes(h.groupId || "") || h.url && u.includes(h.url));
          g && (w = r.find((h) => h.groupId === g.id && (h.status === "READY" || h.status === "IN_PROGRESS" || h.status === "WAITING_FOR_USER")) || null);
        }
        if (!w) {
          a({ success: !0, payload: null });
          return;
        }
        const f = i.find((g) => g.id === w.groupId) || null, I = d.find((g) => g.id === w.postId) || null;
        let p = "";
        if (w.caption)
          p = R(w.caption);
        else if (I != null && I.caption)
          p = R(I.caption);
        else if (I != null && I.description)
          p = R(I.description);
        else if (I) {
          const g = I.templateId ? m.find((h) => h.id === I.templateId) : void 0;
          p = R(Re(I, g == null ? void 0 : g.content));
        }
        p = Le(p);
        let k = !0;
        if (f && u)
          if (!!(e.tab && (e.tab.id === s.activeTabId || e.tab.id === y)))
            k = !0;
          else {
            const h = (f.groupId || "").replace(/^grp_/, "").toLowerCase().trim(), S = (f.url || "").toLowerCase().replace(/^https?:\/\/(www\.|m\.|web\.)?/, "").replace(/\/$/, ""), C = u.toLowerCase().replace(/^https?:\/\/(www\.|m\.|web\.)?/, "").replace(/\/$/, ""), q = h ? C.includes(h) : !1, z = S ? C.includes(S) || S.includes(C) : !1;
            (h || S) && (k = !!(q || z));
          }
        const b = r.findIndex((g) => g.id === w.id) + 1, l = r.filter((g) => g.status === "POSTED").length, A = {
          queueItem: w,
          group: f,
          post: I,
          caption: p,
          formattedPost: p,
          media: w.media || (I == null ? void 0 : I.images) || [],
          queueIndex: b > 0 ? b : 1,
          totalQueueItems: r.length,
          postedCount: l,
          isGroupMatch: k,
          expectedGroupName: f ? f.name : "Expected Group",
          expectedGroupUrl: f ? f.url : ""
        };
        a({ success: !0, payload: A });
        break;
      }
      case "OPEN_DASHBOARD": {
        const o = chrome.runtime.getURL("src/pages/dashboard/index.html"), r = await chrome.tabs.query({ url: o });
        r.length > 0 && r[0].id ? await chrome.tabs.update(r[0].id, { active: !0 }) : await chrome.tabs.create({ url: o, active: !0 }), a({ success: !0 });
        break;
      }
      case "FOCUS_POSTING_TAB":
      case "FOCUS_ACTIVE_POSTING_TAB": {
        if (E)
          try {
            await chrome.windows.update(E, { focused: !0 });
          } catch {
          }
        if (y)
          try {
            await chrome.tabs.update(y, { active: !0 });
            const o = await chrome.tabs.get(y);
            o.windowId && await chrome.windows.update(o.windowId, { focused: !0 });
          } catch {
          }
        a({ success: !0 });
        break;
      }
      case "GET_DEBUG_METRICS": {
        const o = await oe();
        a({ success: !0, debugMetrics: o.debugMetrics || null });
        break;
      }
      /* ================= AUTO-JOINER HANDLERS ================= */
      case "START_AUTO_JOIN": {
        const o = t.payload || {}, r = _e(o.searchUrl || ""), s = {
          searchUrl: r,
          delaySec: typeof o.delaySec == "number" ? Math.max(0, o.delaySec) : 0,
          maxGroups: typeof o.maxGroups == "number" ? o.maxGroups : 0,
          autoAnswerQuestions: o.autoAnswerQuestions !== !1,
          defaultAnswer: o.defaultAnswer || "Yes, I agree to the group rules and guidelines.",
          saveToGroups: o.saveToGroups !== !1,
          selectedCategory: o.selectedCategory || "Auto Joined"
        };
        await Se(s), await te({
          status: "SEARCHING",
          searchUrl: r,
          query: "",
          totalFound: 0,
          joinedCount: 0,
          requestedCount: 0,
          alreadyJoinedCount: 0,
          failedCount: 0,
          skippedCount: 0,
          currentIndex: 0,
          currentGroupName: "",
          countdownSec: 0,
          message: "Navigating to Facebook search page...",
          groups: [],
          startedAt: Date.now()
        }), await chrome.storage.local.set({
          agp_pending_auto_join: {
            active: !0,
            config: s,
            requestedAt: Date.now()
          }
        });
        const i = await chrome.tabs.query({ url: ["*://*.facebook.com/*", "*://facebook.com/*"] });
        let d = i.find((m) => m.url && m.url.includes("/search"));
        if (!d && i.length > 0 && (d = i[0]), d && d.id) {
          if (await chrome.tabs.update(d.id, { url: r, active: !0 }), d.windowId)
            try {
              await chrome.windows.update(d.windowId, { focused: !0 });
            } catch {
            }
        } else
          d = await chrome.tabs.create({ url: r, active: !0 });
        await T.info("background", `Started Auto-Join on: ${r}`), a({ success: !0, tabId: d == null ? void 0 : d.id, searchUrl: r });
        break;
      }
      case "PAUSE_AUTO_JOIN": {
        const o = await chrome.tabs.query({ url: ["*://*.facebook.com/*", "*://facebook.com/*"] });
        for (const r of o)
          r.id && chrome.tabs.sendMessage(r.id, { type: "PAUSE_AUTO_JOIN" }).catch(() => {
          });
        a({ success: !0 });
        break;
      }
      case "RESUME_AUTO_JOIN": {
        const o = await chrome.tabs.query({ url: ["*://*.facebook.com/*", "*://facebook.com/*"] });
        for (const r of o)
          r.id && chrome.tabs.sendMessage(r.id, { type: "RESUME_AUTO_JOIN" }).catch(() => {
          });
        a({ success: !0 });
        break;
      }
      case "STOP_AUTO_JOIN": {
        await chrome.storage.local.remove("agp_pending_auto_join");
        const o = await chrome.tabs.query({ url: ["*://*.facebook.com/*", "*://facebook.com/*"] });
        for (const r of o)
          r.id && chrome.tabs.sendMessage(r.id, { type: "STOP_AUTO_JOIN" }).catch(() => {
          });
        a({ success: !0 });
        break;
      }
      case "GET_AUTO_JOIN_STATE": {
        const o = await ye();
        a({ success: !0, state: o });
        break;
      }
      case "AUTO_JOIN_PROGRESS": {
        const o = t.payload;
        o && await te(o), a({ success: !0 });
        break;
      }
      case "AUTO_JOIN_SAVE_GROUPS": {
        const o = t.payload;
        if (o && o.group) {
          const r = await L();
          if (!r.some(
            (i) => {
              var d;
              return i.groupId && i.groupId.toLowerCase() === ((d = o.group.groupId) == null ? void 0 : d.toLowerCase()) || i.url && o.group.url && i.url.toLowerCase() === o.group.url.toLowerCase();
            }
          )) {
            const i = [...r, o.group];
            await X(i), await T.success("background", `Auto-joined group saved: "${o.group.name}" (Ready for posting)`), M("Facebook Group Added", `"${o.group.name}" is now saved and ready for posting.`);
          }
        }
        a({ success: !0 });
        break;
      }
      default:
        a({ success: !1, error: "Unknown message type" });
    }
  } catch (o) {
    const r = o instanceof Error ? o.message : String(o);
    console.error("[AGP:Background] Handler error:", r), a({ success: !1, error: r });
  }
})(), !0));
chrome.windows.onRemoved.addListener(async (t) => {
  if (t === E) {
    console.log("[AGP:Worker] Dedicated posting automation window closed by user."), E = null, y = null;
    const e = await D();
    e.isRunning && !e.isPaused && (await P({
      ...e,
      isRunning: !1,
      isPaused: !0,
      activeTabId: null
    }), await T.info("queue", "Automation window closed. Queue automatically paused."));
  } else t === F && (console.log("[AGP:Worker] Dedicated discovery window closed."), F = null);
});
