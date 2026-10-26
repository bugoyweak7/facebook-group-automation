const be = {
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
}, L = {
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
}, ue = [
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
}, le = () => {
  var e;
  return typeof chrome < "u" && !!((e = chrome.storage) != null && e.local);
}, J = {};
async function O(e, t) {
  if (le())
    return new Promise((a) => {
      chrome.storage.local.get([e], (n) => {
        if (chrome.runtime.lastError) {
          console.warn(`Storage get error for ${e}:`, chrome.runtime.lastError), a(J[e] !== void 0 ? J[e] : t);
          return;
        }
        n && n[e] !== void 0 ? a(n[e]) : a(t);
      });
    });
  try {
    if (typeof window < "u" && window.localStorage) {
      const a = window.localStorage.getItem(e);
      if (a !== null)
        return JSON.parse(a);
    }
  } catch (a) {
    console.warn("LocalStorage access failed:", a);
  }
  return J[e] !== void 0 ? J[e] : t;
}
async function U(e, t) {
  if (J[e] = t, le())
    return new Promise((a, n) => {
      chrome.storage.local.set({ [e]: t }, () => {
        chrome.runtime.lastError ? n(chrome.runtime.lastError) : a();
      });
    });
  try {
    typeof window < "u" && window.localStorage && window.localStorage.setItem(e, JSON.stringify(t));
  } catch (a) {
    console.warn("LocalStorage set failed:", a);
  }
}
function de(e) {
  return e && e.trim().toLowerCase().replace(/[^a-z0-9_\u0980-\u09FF]/gi, "_") || "default_account";
}
async function pe() {
  return O(_.ACCOUNT_GROUPS, {});
}
async function q(e) {
  const t = await k(), a = de(e || (t == null ? void 0 : t.userId) || (t == null ? void 0 : t.name)), n = await pe();
  if (n[a] && Array.isArray(n[a].groups) && n[a].groups.length > 0) {
    const i = n[a].groups.filter((c) => !z(c));
    if (i.length > 0) return i;
  }
  const o = (await O(_.GROUPS, [])).filter((r) => !z(r));
  if (o.length > 0)
    return o;
  for (const r of Object.keys(n))
    if (n[r] && Array.isArray(n[r].groups) && n[r].groups.length > 0) {
      const i = n[r].groups.filter((c) => !z(c));
      if (i.length > 0) return i;
    }
  return [];
}
async function oe(e, t) {
  const a = (e || []).filter((i) => !z(i)), n = await k(), s = de(t || (n == null ? void 0 : n.userId) || (n == null ? void 0 : n.name)), o = await pe(), r = o[s] || {
    accountContext: s,
    accountInfo: n || { isLoggedIn: !0, name: "Facebook User", lastSyncedAt: Date.now() },
    groups: [],
    lastSyncedAt: Date.now()
  };
  o[s] = {
    ...r,
    groups: a,
    lastSyncedAt: Date.now()
  }, await U(_.ACCOUNT_GROUPS, o), await U(_.GROUPS, a);
}
function z(e) {
  if (!e) return !0;
  const t = (e.name || "").trim().toLowerCase(), a = (e.url || "").trim().toLowerCase();
  if (t.startsWith("unread") || t.includes("commented on") || t.includes("also commented") || t.includes("likes your") || t.includes("liked your") || t.includes("reacted to") || t.includes("shared a post") || t.includes("shared your post") || t.includes("invited you") || t.includes("mentioned you") || t.includes("requested to join") || t.includes("মন্তব্য করেছেন") || t.includes("মতামত দিয়েছেন") || t.includes("লাইক দিয়েছেন") || t.includes("শেয়ার করেছেন") || a.includes("/permalink/") || a.includes("/posts/") || a.includes("/user/") || a.includes("/profile.php") || a.includes("/friends/") || a.includes("/people/") || a.includes("/photos/") || a.includes("/videos/") || a.includes("/events/") || a.includes("/files/") || a.includes("comment_id=") || a.includes("notif_id=") || a.includes("notif_t=") || a.includes("reply_comment_id="))
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
  ]), s = t.replace(/\s*group\s*$/i, "").trim();
  return !!(n.has(t) || n.has(s) || e.groupId && n.has(e.groupId.toLowerCase()));
}
async function Z() {
  return O(_.POSTS, []);
}
async function fe() {
  return O(_.TEMPLATES, ue);
}
async function x() {
  return O(_.QUEUE, []);
}
async function re(e) {
  await U(_.QUEUE, e);
}
const ye = {
  isRunning: !1,
  isPaused: !1,
  currentItemId: null,
  activeTabId: null,
  sessionStartedAt: null,
  pacingDelayRemaining: 0
};
async function A() {
  return O(_.QUEUE_STATE, ye);
}
async function D(e) {
  await U(_.QUEUE_STATE, e);
}
async function Ae() {
  return O(_.HISTORY, []);
}
async function Se(e) {
  await U(_.HISTORY, e);
}
async function we(e) {
  const t = await Ae();
  t.unshift(e), t.length > 500 && (t.length = 500), await Se(t);
}
async function Te() {
  return O(_.LOGS, []);
}
async function Ce(e) {
  await U(_.LOGS, e);
}
async function Pe(e) {
  const t = await Te();
  t.unshift(e), t.length > 300 && (t.length = 300), await Ce(t);
}
async function V() {
  const e = await O(_.SETTINGS, L);
  return {
    ...L,
    ...e,
    general: { ...L.general, ...(e == null ? void 0 : e.general) || {} },
    queue: { ...L.queue, ...(e == null ? void 0 : e.queue) || {} },
    ai: { ...L.ai, ...(e == null ? void 0 : e.ai) || {} },
    facebook: { ...L.facebook, ...(e == null ? void 0 : e.facebook) || {} },
    webhook: { ...L.webhook, ...(e == null ? void 0 : e.webhook) || {} }
  };
}
async function ge(e) {
  const t = await V(), a = {
    ...t,
    ...e,
    general: { ...t.general, ...e.general || {} },
    queue: { ...t.queue, ...e.queue || {} },
    ai: { ...t.ai, ...e.ai || {} },
    facebook: { ...t.facebook, ...e.facebook || {} },
    webhook: { ...t.webhook, ...e.webhook || {} }
  };
  return await U(_.SETTINGS, a), a;
}
async function k() {
  return O(_.FACEBOOK_ACCOUNT, null);
}
async function ee(e) {
  await U(_.FACEBOOK_ACCOUNT, e);
}
async function De() {
  return O(_.AUTO_JOIN_STATE, be);
}
async function ie(e) {
  await U(_.AUTO_JOIN_STATE, e);
}
async function ve(e) {
  await U(_.AUTO_JOIN_CONFIG, e);
}
function X(e = "id") {
  const t = Math.random().toString(36).substring(2, 9), a = Date.now().toString(36);
  return `${e}_${a}_${t}`;
}
function M(e) {
  if (!e) return "";
  if (!e.includes("{") || !e.includes("|")) return e;
  let t = e, a = 0;
  const n = /\{([^{}]+)\}/g;
  for (; a < 10 && n.test(t); )
    a++, t = t.replace(n, (s, o) => {
      if (o.includes("|")) {
        const r = o.split("|").map((i) => i.trim()).filter(Boolean);
        if (r.length > 0)
          return r[Math.floor(Math.random() * r.length)];
      }
      return s;
    });
  return t = t.replace(/\{([^{}\r\n]+?)(?=[.,!?\r\n]|$)/g, (s, o) => o.includes("|") ? o.split("|").map((i) => i.trim()).filter(Boolean)[0] || "" : s), t;
}
function Oe(e) {
  if (!e) return "https://www.facebook.com/search/groups/?q=";
  const t = e.trim();
  if (t.startsWith("http://") || t.startsWith("https://"))
    try {
      const a = new URL(t);
      if (a.hostname.includes("facebook.com") || a.hostname.includes("fb.com")) {
        if (a.pathname.includes("/search/groups"))
          return t;
        const n = a.searchParams.get("q");
        return n ? `https://www.facebook.com/search/groups/?q=${encodeURIComponent(n)}` : t;
      }
    } catch {
    }
  return t.includes("facebook.com/search/groups") || t.includes("fb.com/search/groups") ? `https://${t.replace(/^https?:\/\//, "")}` : `https://www.facebook.com/search/groups/?q=${encodeURIComponent(t)}`;
}
class Ue extends Error {
  constructor(t, a, n) {
    super(n || `Invalid queue transition from ${t} to ${a}`), this.from = t, this.to = a, this.name = "QueueTransitionError";
  }
}
const Ge = {
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
function ke(e, t) {
  if (e === t) return !0;
  const a = Ge[e];
  return !!(a && a.includes(t));
}
function Ne(e, t, a) {
  if (!ke(e.status, t))
    throw new Ue(e.status, t);
  const n = Date.now(), s = {
    ...e,
    status: t
  };
  return t === "IN_PROGRESS" && !e.startedAt && (s.startedAt = n), (t === "POSTED" || t === "SKIPPED" || t === "FAILED") && (s.completedAt = n), t === "FAILED" ? (s.errorMessage = "Operation failed", s.retryCount = (e.retryCount || 0) + 1) : t === "READY" && e.status === "FAILED" && (s.errorMessage = void 0), s;
}
class Re {
  async writeLog(t, a, n, s) {
    const o = {
      id: X("log"),
      timestamp: Date.now(),
      level: t,
      source: a,
      message: n,
      details: s
    }, r = `[AGP:${a.toUpperCase()}][${t}]`;
    t === "ERROR" ? console.error(r, n, s || "") : t === "WARNING" ? console.warn(r, n, s || "") : console.log(r, n, s || "");
    try {
      await Pe(o);
    } catch (i) {
      console.warn("Failed to persist log entry:", i);
    }
    return o;
  }
  info(t, a, n) {
    return this.writeLog("INFO", t, a, n);
  }
  success(t, a, n) {
    return this.writeLog("SUCCESS", t, a, n);
  }
  warning(t, a, n) {
    return this.writeLog("WARNING", t, a, n);
  }
  error(t, a, n) {
    return this.writeLog("ERROR", t, a, n);
  }
}
const S = new Re();
function Le(e) {
  const t = {
    total: e.length,
    pending: 0,
    ready: 0,
    inProgress: 0,
    waitingForUser: 0,
    posted: 0,
    skipped: 0,
    failed: 0
  };
  return e.forEach((a) => {
    switch (a.status) {
      case "PENDING":
        t.pending++;
        break;
      case "READY":
        t.ready++;
        break;
      case "IN_PROGRESS":
        t.inProgress++;
        break;
      case "WAITING_FOR_USER":
        t.waitingForUser++;
        break;
      case "POSTED":
        t.posted++;
        break;
      case "SKIPPED":
        t.skipped++;
        break;
      case "FAILED":
        t.failed++;
        break;
    }
  }), t;
}
async function Fe(e, t, a = "READY") {
  const [n, s] = await Promise.all([q(), Z()]), o = s.find((c) => c.id === t);
  let r = 0;
  const i = e.map((c) => {
    r++;
    const d = n.find(
      (I) => I.id === c || I.groupId === c || I.url && I.url.includes(c)
    ), f = (d == null ? void 0 : d.url) || (c.startsWith("http") ? c : `https://www.facebook.com/groups/${c}/`);
    return {
      id: X("queue"),
      groupId: c,
      groupName: d ? d.name : "Facebook Group",
      groupUrl: f,
      postId: t,
      caption: (o == null ? void 0 : o.caption) || (o == null ? void 0 : o.description) || void 0,
      media: void 0,
      // Lean: post.images will be used directly to avoid gigabytes of duplicate base64
      status: a,
      order: r,
      createdAt: Date.now()
    };
  });
  return await re(i), await S.info("queue", `Created clean posting queue for ${i.length} groups`), i;
}
function me(e) {
  const t = e.find((a) => a.status === "READY");
  return t || e.find((a) => a.status === "PENDING") || null;
}
async function te(e, t, a) {
  const n = await x(), s = n.findIndex((r) => r.id === e);
  if (s === -1)
    throw new Error(`Queue item ${e} not found`);
  const o = Ne(n[s], t);
  return n[s] = o, await re(n), { queue: n, updatedItem: o };
}
async function Me(e, t) {
  const { queue: a, updatedItem: n } = await te(e, "POSTED"), [s, o] = await Promise.all([q(), Z()]), r = s.find((f) => f.id === n.groupId), i = o.find((f) => f.id === n.postId), c = n.startedAt ? Math.max(1, Math.round((Date.now() - n.startedAt) / 1e3)) : void 0, d = {
    id: X("hist"),
    queueItemId: n.id,
    groupId: n.groupId,
    groupName: r ? r.name : "Unknown Group",
    groupUrl: r ? r.url : "",
    postId: n.postId,
    postTitle: i ? i.title : "Untitled Post",
    productName: i ? i.productName : "",
    status: "POSTED",
    postedAt: Date.now(),
    notes: "User confirmed posting on Facebook",
    durationSeconds: c
  };
  return await we(d), r && (r.postCount = (r.postCount || 0) + 1, r.lastPostedAt = Date.now(), r.status = "POSTED", await oe(s)), await S.success("queue", `Post marked as POSTED for group: ${r ? r.name : n.groupId}`), n;
}
async function ne(e, t = "User skipped") {
  const { updatedItem: a } = await te(e, "SKIPPED"), [n, s] = await Promise.all([q(), Z()]), o = n.find((c) => c.id === a.groupId), r = s.find((c) => c.id === a.postId), i = {
    id: X("hist"),
    queueItemId: a.id,
    groupId: a.groupId,
    groupName: o ? o.name : "Unknown Group",
    groupUrl: o ? o.url : "",
    postId: a.postId,
    postTitle: r ? r.title : "Untitled Post",
    productName: r ? r.productName : "",
    status: "SKIPPED",
    postedAt: Date.now(),
    notes: t
  };
  return await we(i), await S.info("queue", `Post marked as SKIPPED for group: ${o ? o.name : a.groupId}`), a;
}
function qe(e, t) {
  return {
    product_name: e.productName || "",
    title: e.title || "",
    price: e.price || "",
    old_price: e.oldPrice || "",
    old_price_tag: e.oldPrice ? `(Regular: ${e.oldPrice})` : "",
    description: e.description || "",
    features: e.features || "",
    location: e.location || "",
    delivery_info: e.deliveryInfo || "",
    contact_info: e.contactInfo || "",
    call_to_action: e.callToAction || "",
    caption: e.caption || ""
  };
}
function $e(e, t) {
  if (!e) return "";
  const a = e.replace(/\{([a-zA-Z0-9_-]+)\}/g, (s, o) => {
    const r = o.toLowerCase();
    return r in t && t[r] !== void 0 ? t[r] : "";
  });
  return M(a).split(`
`).filter((s) => {
    const o = s.trim();
    return o ? !/^(💰\s*Price:\s*|📍\s*Location:\s*|🚚\s*Delivery:\s*|📞\s*Contact:\s*|✨\s*Key Features:\s*|📝\s*Details:\s*|👉\s*|📋\s*Condition.*:\s*|⚙️\s*Specifications:\s*|📦\s*Delivery.*:\s*|📱\s*Call.*:\s*|💵\s*Asking Price:\s*)$/i.test(
      o
    ) : !0;
  }).join(`
`).replace(/\n{3,}/g, `

`).trim();
}
function xe(e, t) {
  if (e.caption && !t)
    return M(e.caption);
  if (t) {
    const s = qe(e), o = $e(t, s);
    if (o.trim()) return M(o);
  }
  if (e.caption && e.caption.trim())
    return M(e.caption.trim());
  const a = [], n = e.productName || e.title;
  if (n && n !== "Facebook Group Listing" && n !== "Untitled Post" && a.push(n), e.price && e.price.trim()) {
    const s = e.oldPrice ? `Price: ${e.price} (Prev: ${e.oldPrice})` : `Price: ${e.price}`;
    a.push(s);
  }
  return e.description && e.description.trim() && a.push(e.description.trim()), e.features && e.features.trim() && a.push(`Features:
${e.features.trim()}`), e.location && e.location.trim() && a.push(`Location: ${e.location.trim()}`), e.deliveryInfo && e.deliveryInfo.trim() && a.push(`Delivery: ${e.deliveryInfo.trim()}`), e.contactInfo && e.contactInfo.trim() && a.push(`Contact: ${e.contactInfo.trim()}`), e.callToAction && e.callToAction.trim() && a.push(e.callToAction.trim()), a.join(`

`).trim();
}
function We(e) {
  if (!e || typeof e != "string") return e || "";
  const t = e.trim();
  if (t.length < 30) return e;
  const a = t.length, n = Math.floor(a / 2);
  for (let o = -15; o <= 15; o++) {
    const r = n + o;
    if (r > 15 && r < a - 15) {
      const i = t.slice(0, r).trim(), c = t.slice(r).trim();
      if (i.length >= 15 && i === c)
        return i;
    }
  }
  const s = t.split(`
`).filter((o) => o.trim().length > 0);
  if (s.length >= 4) {
    const o = Math.floor(s.length / 2), r = s.slice(0, o).join(`
`).trim(), i = s.slice(o).join(`
`).trim();
    if (r.length >= 25 && r === i)
      return r;
  }
  return e;
}
async function B(e, t) {
  try {
    const a = await V();
    if (!a.webhook.enabled || !a.webhook.endpoint)
      return;
    const n = {
      "Content-Type": "application/json",
      "User-Agent": "AIGroupPoster-Extension/1.0"
    };
    a.webhook.secret && (n["x-agp-secret"] = a.webhook.secret);
    const s = {
      event: e,
      timestamp: Date.now(),
      payload: t
    };
    fetch(a.webhook.endpoint, {
      method: "POST",
      headers: n,
      body: JSON.stringify(s)
    }).catch((o) => {
      S.warning("queue", `Webhook dispatch to ${a.webhook.endpoint} failed: ${o}`);
    });
  } catch (a) {
    console.warn("Webhook error:", a);
  }
}
function Qe(e, t) {
  if (!e || !e.trim())
    return t ? t.split(/[-_.]+/).filter(Boolean).map((n) => n.charAt(0).toUpperCase() + n.slice(1)).join(" ") : "Facebook Group";
  let a = e.trim();
  return a = a.replace(/^(?:Visit|Open|View|গ্রুপ দেখুন|দেখুন)\s+/i, ""), a = a.replace(/\s*(?:Last active|You last visited|last visited|active)\s+[^\n]+/i, ""), a = a.replace(/\s*(?:গত|আগে|মিনিট আগে|ঘণ্টা আগে|দিন আগে)[^\n]*/i, ""), a = a.replace(/\s*·\s*(?:Public group|Private group|পাবলিক গ্রুপ|প্রাইভেট গ্রুপ).*$/i, ""), a = a.replace(/\s*·\s*\d+.*members.*$/i, ""), a = a.replace(/\s*·\s*[০-৯\d]+.*সদস্য.*$/i, ""), a = a.replace(/\s*·\s*[^\n]+/i, ""), (a.toLowerCase() === "visit" || a.toLowerCase() === "group" || a.toLowerCase() === "view group") && t ? t.split(/[-_.]+/).filter(Boolean).map((n) => n.charAt(0).toUpperCase() + n.slice(1)).join(" ") : a.trim() || "Facebook Group";
}
const ae = "agp_discovery_progress";
function Be() {
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
const se = {
  state: "NOT_CONNECTED",
  foundCount: 0,
  importedCount: 0,
  duplicateCount: 0,
  errorCount: 0,
  message: 'Click "Sync Facebook Groups" to discover all joined groups.',
  debugMetrics: Be()
};
async function ce() {
  var e;
  return typeof chrome < "u" && ((e = chrome.storage) != null && e.local) ? new Promise((t) => {
    chrome.storage.local.get([ae], (a) => {
      t(a[ae] || se);
    });
  }) : se;
}
async function F(e) {
  var t;
  typeof chrome < "u" && ((t = chrome.storage) != null && t.local) && await chrome.storage.local.set({ [ae]: e });
}
async function Ie(e, t) {
  var p;
  const a = (t == null ? void 0 : t.accountContext) || ((p = await k()) == null ? void 0 : p.name) || "default_account", n = await q(a), s = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map(), i = (l) => l.trim().toLowerCase().replace(/\s+/g, " ");
  n.forEach((l) => {
    l.groupId && s.set(l.groupId.toLowerCase(), l), l.url && o.set(l.url.toLowerCase().replace(/\/$/, ""), l), l.name && r.set(i(l.name), l);
  });
  let c = 0, d = 0;
  const f = Date.now(), I = [], C = /* @__PURE__ */ new Set();
  for (const l of e) {
    if (z(l)) continue;
    const E = (l.groupId || "").toLowerCase(), T = (l.url || "").toLowerCase().replace(/\/$/, ""), P = i(l.name || "");
    let y = (E ? s.get(E) : void 0) || (T ? o.get(T) : void 0) || (P && P.length >= 3 ? r.get(P) : void 0);
    const g = Qe(l.name || "", l.groupId);
    if (y)
      d++, C.add(y.id), g && (!y.name || y.name.includes("·") || y.name.length < g.length) && (y.name = g), l.imageUrl && !y.imageUrl && (y.imageUrl = l.imageUrl), l.privacy && l.privacy !== "UNKNOWN" && (y.privacy = l.privacy), y.verified = !0, y.source = "facebook-ui", y.accountContext = a, y.discoveredAt = f, y.updatedAt = f;
    else {
      c++;
      const b = l.groupId ? `grp_${l.groupId.replace(/[^a-zA-Z0-9_-]/g, "")}` : X("grp"), Q = l.url.startsWith("http") ? l.url : `https://www.facebook.com/groups/${l.groupId}/`, G = {
        id: b,
        name: g,
        url: Q,
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
        discoveredAt: f,
        createdAt: f,
        updatedAt: f
      };
      I.push(G), E && s.set(E, G), T && o.set(T, G), P && r.set(P, G), C.add(G.id);
    }
  }
  let w;
  if ((t == null ? void 0 : t.syncMode) === "exact") {
    const l = (T) => T.source === "manual" || T.category && T.category !== "Discovered", E = n.filter((T) => C.has(T.id) || l(T));
    w = [...I, ...E];
  } else
    w = [...I, ...n];
  const m = [], u = /* @__PURE__ */ new Set(), h = /* @__PURE__ */ new Set();
  for (const l of w) {
    const E = l.url.toLowerCase().replace(/\/$/, "");
    !u.has(l.id) && !h.has(E) && (u.add(l.id), h.add(E), m.push(l));
  }
  return await oe(m, a), await S.info(
    "dashboard",
    `Group discovery merged (${(t == null ? void 0 : t.syncMode) || "merge"}): ${c} imported, ${d} duplicates, total ${m.length}`
  ), {
    imported: c,
    duplicates: d,
    totalStored: m.length,
    verifiedCount: m.filter((l) => l.verified).length
  };
}
console.log("[AGP:Background] Service Worker starting with Group Discovery...");
chrome.runtime.onInstalled.addListener(async (e) => {
  console.log("[AGP:Background] Extension installed/updated:", e.reason);
  try {
    const t = await V();
    t ? t.queue && t.queue.delayBetweenItemsSec > 3 && (t.queue.delayBetweenItemsSec = 0, await ge(t)) : await chrome.storage.local.set({ agp_settings: L }), await he();
    const a = await fe();
    (!a || a.length === 0) && await chrome.storage.local.set({ agp_templates: ue }), await S.info("background", `AI Group Poster installed/updated (${e.reason})`);
  } catch (t) {
    console.error("Error during onInstalled initialization:", t);
  }
});
async function he() {
  try {
    const e = await x();
    let t = !1;
    const a = e.map((n) => n.media && n.media.length > 0 ? (t = !0, { ...n, media: void 0 }) : n);
    if (t || e.length > 100) {
      const n = a.filter((s) => s.status === "READY" || s.status === "IN_PROGRESS");
      await chrome.storage.local.set({ agp_queue: n }), console.log("[AGP:Background] Pruned storage bloat from agp_queue.");
    }
  } catch (e) {
    console.warn("[AGP:Background] Clean storage bloat error:", e);
  }
}
he();
async function W(e, t) {
  try {
    if (!(await V()).general.notificationsEnabled) return;
    chrome.notifications && chrome.notifications.create({
      type: "basic",
      iconUrl: chrome.runtime.getURL("icons/icon48.png"),
      title: e,
      message: t,
      priority: 1
    });
  } catch (a) {
    console.warn("Could not show notification:", a);
  }
}
async function Ke(e) {
  let t = e;
  for (; t > 0; ) {
    const n = await A();
    if (!n.isRunning || n.isPaused)
      break;
    await D({ ...n, pacingDelayRemaining: t }), await new Promise((s) => setTimeout(s, 1e3)), t--;
  }
  const a = await A();
  await D({ ...a, pacingDelayRemaining: 0 });
}
let j = null, H = null;
async function R() {
  if (j) return j;
  try {
    const e = await chrome.storage.local.get("agp_active_posting_window_id");
    e != null && e.agp_active_posting_window_id && (j = e.agp_active_posting_window_id);
  } catch {
  }
  return j;
}
async function K(e) {
  j = e;
  try {
    e ? await chrome.storage.local.set({ agp_active_posting_window_id: e }) : await chrome.storage.local.remove("agp_active_posting_window_id");
  } catch {
  }
}
async function Y() {
  if (H) return H;
  try {
    const e = await chrome.storage.local.get("agp_active_posting_tab_id");
    e != null && e.agp_active_posting_tab_id && (H = e.agp_active_posting_tab_id);
  } catch {
  }
  return H;
}
async function v(e) {
  H = e;
  try {
    e ? await chrome.storage.local.set({ agp_active_posting_tab_id: e }) : await chrome.storage.local.remove("agp_active_posting_tab_id");
  } catch {
  }
}
async function N() {
  var m;
  const e = await x(), t = me(e);
  if (!t) {
    const u = await R(), h = await Y();
    if (u) {
      try {
        await chrome.windows.remove(u);
      } catch {
      }
      await K(null), await v(null);
    } else if (h) {
      try {
        await chrome.tabs.remove(h);
      } catch {
      }
      await v(null);
    }
    const p = await A();
    await D({
      ...p,
      isRunning: !1,
      isPaused: !1,
      currentItemId: null,
      expectedGroupId: null,
      expectedGroupName: null,
      expectedGroupUrl: null,
      pacingDelayRemaining: 0
    }), await W("Queue Completed", "All eligible items in the posting queue have been processed."), await S.success("queue", "Queue session completed successfully"), await B("QUEUE_COMPLETED", { totalProcessed: e.length });
    return;
  }
  const [a, n] = await Promise.all([q(), Z()]);
  let s = a.find(
    (u) => u.id === t.groupId || u.groupId === t.groupId || u.url && t.groupId && u.url.includes(t.groupId)
  ), o = (s == null ? void 0 : s.url) || t.groupUrl || "";
  if (!o && t.groupId && !t.groupId.startsWith("grp_") && !t.groupId.startsWith("queue_") && (o = t.groupId.startsWith("http") ? t.groupId : `https://www.facebook.com/groups/${t.groupId}/`), !o || o.includes("/groups/grp_") || !o.includes("facebook.com")) {
    console.warn(`[AGP:Worker] Stale/invalid group URL: "${o}" for item ${t.id}. Skipping...`), await ne(t.id), await N();
    return;
  }
  const r = s || {
    id: t.groupId,
    name: t.groupName || "Facebook Group",
    url: o,
    groupId: t.groupId,
    category: "General",
    enabled: !0,
    status: "READY",
    postCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  r.url = o;
  let i = n.find((u) => u.id === t.postId) || n[n.length - 1] || n[0];
  i || (i = {
    id: t.postId || "post_default",
    title: "Facebook Group Listing",
    productName: "Facebook Group Listing",
    caption: t.caption || "",
    description: t.caption || "",
    images: t.media || [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  }), await te(t.id, "IN_PROGRESS");
  let c, d = !1;
  const f = await R();
  if (f)
    try {
      const u = await chrome.windows.get(f, { populate: !0 });
      u && u.id && (d = !0);
    } catch {
      d = !1, await K(null), await v(null);
    }
  const I = await R();
  if (d && I) {
    const u = await Y();
    if (u)
      try {
        await chrome.tabs.update(u, { url: r.url, active: !0 }), c = u, chrome.tabs.sendMessage(u, { type: "AGP_NAVIGATE_TO_GROUP", url: r.url }).catch(() => {
        });
        try {
          await chrome.windows.update(I, { focused: !0 });
        } catch {
        }
      } catch {
        await v(null);
      }
    if (!c)
      try {
        const h = await chrome.tabs.create({
          windowId: I,
          url: r.url,
          active: !0
        });
        c = h.id, await v(h.id ?? null);
      } catch (h) {
        console.warn("[AGP:Worker] Failed to create tab inside automation window:", h);
      }
  }
  const C = await R();
  if (!c || !C)
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
      await K(u.id ?? null), u.tabs && u.tabs.length > 0 ? c = u.tabs[0].id : u.id && (c = (m = (await chrome.tabs.query({ windowId: u.id }))[0]) == null ? void 0 : m.id), await v(c ?? null);
    } catch (u) {
      console.error("[AGP:Worker] Failed to create dedicated automation popup window:", u);
    }
  const w = await A();
  await D({
    ...w,
    isRunning: !0,
    isPaused: !1,
    currentItemId: t.id,
    activeTabId: c ?? null,
    expectedGroupId: r.groupId || r.id,
    expectedGroupName: r.name,
    expectedGroupUrl: r.url,
    currentGroupMatch: !0
  }), S.info("queue", `Opening group: ${r.name} (${r.url})`).catch(() => {
  }), W("Group Opened", `Review your prepared post for: ${r.name}`).catch(() => {
  }), B("POST_READY", { groupId: r.id, postId: i.id, groupName: r.name }).catch(() => {
  });
}
let $ = null;
async function Ye() {
  var n, s, o;
  const e = {
    state: "DISCOVERING",
    foundCount: 0,
    importedCount: 0,
    duplicateCount: 0,
    errorCount: 0,
    outcome: "PARTIAL",
    message: "Opening Facebook sync window...",
    lastDiscoveredAt: Date.now()
  };
  await F(e);
  let t = null, a = null;
  try {
    const i = await chrome.windows.create({
      url: "https://www.facebook.com/groups/joins/?nav_source=tab",
      type: "popup",
      width: 500,
      height: 680,
      top: 80,
      left: 80,
      focused: !0
    });
    if (t = i.id ?? null, $ = t, i.tabs && i.tabs.length > 0 ? a = i.tabs[0].id ?? null : t && (a = ((n = (await chrome.tabs.query({ windowId: t }))[0]) == null ? void 0 : n.id) ?? null), !a)
      throw new Error("Failed to resolve Facebook tab for group sync.");
    console.log(`[AGP:Worker] Facebook popup window created (Win #${t}, Tab #${a})`);
    const c = Date.now();
    for (; Date.now() - c < 15e3; ) {
      try {
        if ((await chrome.tabs.get(a)).status === "complete") break;
      } catch {
      }
      await new Promise((w) => setTimeout(w, 200));
    }
    if (await new Promise((w) => setTimeout(w, 400)), !await new Promise((w) => {
      chrome.tabs.sendMessage(a, { type: "CHECK_FACEBOOK_SESSION" }, (m) => {
        w(!chrome.runtime.lastError && (m == null ? void 0 : m.success));
      });
    }) && chrome.scripting)
      try {
        await chrome.scripting.executeScript({
          target: { tabId: a },
          files: ["facebook-content.js"]
        }), await new Promise((w) => setTimeout(w, 200));
      } catch (w) {
        console.warn("[AGP:Worker] Script injection warning:", w);
      }
    await F({
      state: "DISCOVERING",
      foundCount: 0,
      importedCount: 0,
      duplicateCount: 0,
      errorCount: 0,
      outcome: "PARTIAL",
      message: "Scanning Facebook joined groups...",
      lastDiscoveredAt: Date.now()
    });
    const f = await new Promise((w) => {
      chrome.tabs.sendMessage(a, { type: "START_GROUP_DISCOVERY" }, (m) => {
        chrome.runtime.lastError ? w({ success: !1, error: chrome.runtime.lastError.message }) : w(m || { success: !1, error: "No response from content script" });
      });
    });
    if (t) {
      try {
        await chrome.windows.remove(t);
      } catch (w) {
        console.warn("[AGP:Worker] Popup window auto-close note:", w);
      }
      $ = null;
    }
    if (f != null && f.success && f.payload) {
      const w = f.payload, m = w.groups || [], u = w.profile, h = (u == null ? void 0 : u.userId) || (u == null ? void 0 : u.name) || void 0, p = await k(), l = ((u == null ? void 0 : u.name) || (p == null ? void 0 : p.name) || "").trim();
      p != null && p.name && (u != null && u.name) && p.name.trim().toLowerCase() !== u.name.trim().toLowerCase() && console.log(`[AGP:Worker] Account changed from "${p.name}" to "${u.name}". Isolated storage.`);
      const E = await Ie(m, {
        syncMode: "exact",
        accountContext: h
      }), T = {
        isLoggedIn: !!(u != null && u.isLoggedIn || u != null && u.name),
        name: l || "Facebook User",
        profileUrl: (u == null ? void 0 : u.profileUrl) || (p == null ? void 0 : p.profileUrl) || "https://www.facebook.com",
        avatarUrl: (u == null ? void 0 : u.avatarUrl) || (p == null ? void 0 : p.avatarUrl) || "",
        userId: (u == null ? void 0 : u.userId) || (p == null ? void 0 : p.userId) || "",
        totalGroupsCount: E.totalStored,
        lastSyncedAt: Date.now()
      };
      await ee(T);
      const P = w.outcome || (w.isPartial ? "PARTIAL" : "COMPLETE"), y = w.completionReason || (P === "COMPLETE" ? "TARGET_REACHED" : "STAGNANT_TIMEOUT");
      let g = "";
      P === "COMPLETE" ? g = `${E.totalStored} verified groups found — scan complete.` : g = `${E.totalStored} verified groups found — Facebook did not expose the complete list.`;
      const b = {
        state: P === "COMPLETE" ? "DISCOVERY_COMPLETE" : "DISCOVERY_PARTIAL",
        foundCount: w.totalFoundOnPage || E.totalStored,
        importedCount: E.imported,
        duplicateCount: E.duplicates,
        errorCount: 0,
        outcome: P,
        completionReason: y,
        targetCount: ((s = w.debugMetrics) == null ? void 0 : s.targetCount) ?? null,
        targetCountStatus: ((o = w.debugMetrics) == null ? void 0 : o.targetCountStatus) ?? "UNAVAILABLE",
        debugMetrics: w.debugMetrics,
        message: g,
        lastDiscoveredAt: Date.now()
      };
      return await F(b), P === "COMPLETE" ? (await W("Facebook Groups Synced", g), await S.success("dashboard", g)) : (await W("Facebook Groups Synced (Partial)", g), await S.info("dashboard", g)), b;
    }
    const C = {
      state: "DISCOVERY_FAILED",
      foundCount: 0,
      importedCount: 0,
      duplicateCount: 0,
      errorCount: 1,
      outcome: "FAILED",
      completionReason: "NO_JOINED_GROUP_INTERFACE",
      message: (f == null ? void 0 : f.error) || "Facebook group discovery failed.",
      lastDiscoveredAt: Date.now()
    };
    return await F(C), C;
  } catch (r) {
    if (t) {
      try {
        await chrome.windows.remove(t);
      } catch {
      }
      $ = null;
    }
    const c = {
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
    return await F(c), c;
  }
}
chrome.runtime.onMessage.addListener((e, t, a) => ((async () => {
  var n, s;
  try {
    switch (e.type) {
      case "START_GROUP_DISCOVERY": {
        const o = await Ye();
        a({ success: !0, progress: o });
        break;
      }
      case "CANCEL_GROUP_DISCOVERY": {
        if ($) {
          try {
            await chrome.windows.remove($);
          } catch {
          }
          $ = null;
        }
        await F({
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
        const o = await ce();
        a({ success: !0, progress: o });
        break;
      }
      case "GROUP_BATCH_DISCOVERED": {
        const o = e.payload;
        if (o && o.liveGroups && Array.isArray(o.liveGroups)) {
          try {
            await Ie(o.liveGroups, { syncMode: "merge" });
          } catch (r) {
            console.warn("[AGP:Worker] Live batch merge warning:", r);
          }
          await F({
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
        const o = e.payload;
        o && typeof o.foundCount == "number" && await F({
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
        const [o, r] = await Promise.all([x(), A()]), i = Le(o);
        a({ success: !0, queue: o, state: r, stats: i });
        break;
      }
      case "DETECT_FB_SESSION": {
        const r = (await chrome.tabs.query({})).find((i) => i.url && i.url.includes("facebook.com"));
        if (r && r.id)
          return await (async () => {
            chrome.tabs.sendMessage(r.id, { type: "GET_FACEBOOK_USER_INFO" }, async (c) => {
              const d = await q();
              if (chrome.runtime.lastError || !c) {
                if (chrome.scripting && r.id)
                  try {
                    await chrome.scripting.executeScript({
                      target: { tabId: r.id },
                      files: ["facebook-content.js"]
                    }), setTimeout(() => {
                      chrome.tabs.sendMessage(r.id, { type: "GET_FACEBOOK_USER_INFO" }, async (I) => {
                        if (I && I.profile && I.profile.isLoggedIn) {
                          const C = {
                            isLoggedIn: !0,
                            name: I.profile.name,
                            profileUrl: I.profile.profileUrl,
                            avatarUrl: I.profile.avatarUrl,
                            userId: I.profile.userId,
                            totalGroupsCount: d.length,
                            lastSyncedAt: Date.now()
                          };
                          await ee(C), a({ success: !0, account: C });
                        } else {
                          const C = await k();
                          a({ success: !0, account: C });
                        }
                      });
                    }, 400);
                    return;
                  } catch {
                  }
                const f = await k();
                a({ success: !0, account: f });
                return;
              }
              if (c && c.profile && c.profile.isLoggedIn) {
                const f = {
                  isLoggedIn: !0,
                  name: c.profile.name,
                  profileUrl: c.profile.profileUrl,
                  avatarUrl: c.profile.avatarUrl,
                  userId: c.profile.userId,
                  totalGroupsCount: d.length,
                  lastSyncedAt: Date.now()
                };
                await ee(f), a({ success: !0, account: f });
              } else {
                const f = await k();
                a({ success: !0, account: f });
              }
            });
          })(), !0;
        {
          const i = await k();
          a({ success: !0, account: i });
        }
        break;
      }
      case "FB_USER_PROFILE_DETECTED": {
        const o = e.payload;
        if (o && o.name) {
          const r = await k();
          await ee({
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
        const o = await A();
        await D({
          ...o,
          isRunning: !0,
          isPaused: !1,
          sessionStartedAt: Date.now()
        }), await S.info("queue", "Queue execution started"), await B("QUEUE_STARTED", {}), await N(), a({ success: !0 });
        break;
      }
      case "PAUSE_QUEUE": {
        const o = await A();
        await D({ ...o, isPaused: !0 }), await S.info("queue", "Queue execution paused"), await W("Queue Paused", "Posting queue has been paused by user."), a({ success: !0 });
        break;
      }
      case "RESUME_QUEUE": {
        const o = await A();
        await D({ ...o, isPaused: !1, isRunning: !0 }), await S.info("queue", "Queue execution resumed"), await N(), a({ success: !0 });
        break;
      }
      case "CREATE_AND_START_QUEUE": {
        const o = e.payload;
        if (o && Array.isArray(o.groupIds) && o.postId) {
          const r = await V(), i = typeof o.delaySec == "number" && o.delaySec >= 0 ? o.delaySec : 0;
          await ge({
            queue: { ...r.queue, delayBetweenItemsSec: i }
          });
          const c = await R();
          if (c)
            try {
              await chrome.windows.remove(c);
            } catch {
            }
          await K(null), await v(null), await Fe(o.groupIds, o.postId, "READY");
          const d = await A();
          await D({
            ...d,
            isRunning: !0,
            isPaused: !1,
            activeTabId: null,
            sessionStartedAt: Date.now()
          }), await S.info("queue", `Sequential posting queue created for ${o.groupIds.length} groups`), await B("QUEUE_STARTED", { count: o.groupIds.length }), await N(), a({ success: !0 });
        } else
          a({ success: !1, error: "Invalid payload for CREATE_AND_START_QUEUE" });
        break;
      }
      case "STOP_QUEUE": {
        const o = await R(), r = await Y();
        if (o) {
          try {
            await chrome.windows.remove(o);
          } catch {
          }
          await K(null), await v(null);
        } else if (r) {
          try {
            await chrome.tabs.remove(r);
          } catch {
          }
          await v(null);
        }
        const i = await A();
        await D({
          ...i,
          isRunning: !1,
          isPaused: !1,
          currentItemId: null,
          expectedGroupId: null,
          expectedGroupName: null,
          expectedGroupUrl: null,
          pacingDelayRemaining: 0
        }), await S.info("queue", "Queue execution stopped by user"), a({ success: !0 });
        break;
      }
      case "MARK_AS_POSTED": {
        const o = await A(), r = e.payload ? e.payload.itemId : o.currentItemId;
        if (!r) {
          a({ success: !1, error: "No active item to mark as posted" });
          return;
        }
        await Me(r), W("Post Completed", "Group marked as posted.").catch(() => {
        }), B("POST_MARKED_POSTED", { itemId: r }).catch(() => {
        });
        const i = await V();
        o.isPaused || (await D({ ...o, isRunning: !0 }), i.queue.delayBetweenItemsSec > 0 && await Ke(i.queue.delayBetweenItemsSec), await N()), a({ success: !0 });
        break;
      }
      case "SKIP_CURRENT_ITEM": {
        const o = await A(), r = e.payload, i = (r == null ? void 0 : r.itemId) || o.currentItemId;
        if (!i) {
          a({ success: !1, error: "No active item to skip" });
          return;
        }
        const c = (r == null ? void 0 : r.reason) || "Auto-skipped (posting unavailable or wrong group)";
        await ne(i, c), await B("POST_SKIPPED", { itemId: i, reason: c }), o.isPaused || (await D({ ...o, isRunning: !0 }), await N()), a({ success: !0 });
        break;
      }
      case "UPDATE_QUEUE_ITEM_CAPTION": {
        const o = e.payload;
        if (o != null && o.itemId && o.caption !== void 0) {
          const i = (await x()).map((c) => c.id === o.itemId ? { ...c, caption: o.caption } : c);
          await re(i);
        }
        a({ success: !0 });
        break;
      }
      case "FB_PAGE_DETECTED": {
        const o = await A();
        if (o.currentItemId)
          try {
            await te(o.currentItemId, "IN_PROGRESS");
          } catch {
          }
        a({ success: !0 });
        break;
      }
      case "GET_ACTIVE_POST_FOR_TAB": {
        const o = await R(), r = await Y(), i = await A();
        if (!!!(t.tab && (t.tab.id === r || o && t.tab.windowId === o || t.tab.id === i.activeTabId))) {
          a({ success: !0, payload: null, isUserTab: !0 });
          return;
        }
        const [d, f, I, C, w] = await Promise.all([
          x(),
          A(),
          q(),
          Z(),
          fe()
        ]);
        let m = f.currentItemId && d.find((g) => g.id === f.currentItemId) || null;
        const u = ((n = t.tab) == null ? void 0 : n.url) || ((s = e.payload) == null ? void 0 : s.url) || "";
        if (!m && u) {
          const g = I.find((b) => u.includes(b.groupId || "") || b.url && u.includes(b.url));
          g && (m = d.find((b) => b.groupId === g.id && (b.status === "READY" || b.status === "IN_PROGRESS" || b.status === "WAITING_FOR_USER")) || null);
        }
        if (!m) {
          a({ success: !0, payload: null });
          return;
        }
        const h = I.find((g) => g.id === m.groupId) || null, p = C.find((g) => g.id === m.postId) || null;
        let l = "";
        if (m.caption)
          l = M(m.caption);
        else if (p != null && p.caption)
          l = M(p.caption);
        else if (p != null && p.description)
          l = M(p.description);
        else if (p) {
          const g = p.templateId ? w.find((b) => b.id === p.templateId) : void 0;
          l = M(xe(p, g == null ? void 0 : g.content));
        }
        l = We(l);
        let E = !0;
        if (h && u)
          if (!!(t.tab && (t.tab.id === i.activeTabId || t.tab.id === r)))
            E = !0;
          else {
            const b = (h.groupId || "").replace(/^grp_/, "").toLowerCase().trim(), Q = (h.url || "").toLowerCase().replace(/^https?:\/\/(www\.|m\.|web\.)?/, "").replace(/\/$/, ""), G = u.toLowerCase().replace(/^https?:\/\/(www\.|m\.|web\.)?/, "").replace(/\/$/, ""), _e = b ? G.includes(b) : !1, Ee = Q ? G.includes(Q) || Q.includes(G) : !1;
            (b || Q) && (E = !!(_e || Ee));
          }
        const T = d.findIndex((g) => g.id === m.id) + 1, P = d.filter((g) => g.status === "POSTED").length, y = {
          queueItem: m,
          group: h,
          post: p,
          caption: l,
          formattedPost: l,
          media: m.media || (p == null ? void 0 : p.images) || [],
          queueIndex: T > 0 ? T : 1,
          totalQueueItems: d.length,
          postedCount: P,
          isGroupMatch: E,
          expectedGroupName: h ? h.name : "Expected Group",
          expectedGroupUrl: h ? h.url : ""
        };
        a({ success: !0, payload: y });
        break;
      }
      case "OPEN_DASHBOARD": {
        const o = chrome.runtime.getURL("src/pages/dashboard/index.html"), r = await chrome.tabs.query({ url: o });
        r.length > 0 && r[0].id ? await chrome.tabs.update(r[0].id, { active: !0 }) : await chrome.tabs.create({ url: o, active: !0 }), a({ success: !0 });
        break;
      }
      case "FOCUS_POSTING_TAB":
      case "FOCUS_ACTIVE_POSTING_TAB": {
        const o = await R(), r = await Y();
        if (o)
          try {
            await chrome.windows.update(o, { focused: !0 });
          } catch {
          }
        if (r)
          try {
            await chrome.tabs.update(r, { active: !0 });
            const i = await chrome.tabs.get(r);
            i.windowId && await chrome.windows.update(i.windowId, { focused: !0 });
          } catch {
          }
        a({ success: !0 });
        break;
      }
      case "GET_DEBUG_METRICS": {
        const o = await ce();
        a({ success: !0, debugMetrics: o.debugMetrics || null });
        break;
      }
      /* ================= AUTO-JOINER HANDLERS ================= */
      case "START_AUTO_JOIN": {
        const o = e.payload || {}, r = Oe(o.searchUrl || ""), i = {
          searchUrl: r,
          delaySec: typeof o.delaySec == "number" ? Math.max(0, o.delaySec) : 0,
          maxGroups: typeof o.maxGroups == "number" ? o.maxGroups : 0,
          autoAnswerQuestions: o.autoAnswerQuestions !== !1,
          defaultAnswer: o.defaultAnswer || "Yes, I agree to the group rules and guidelines.",
          saveToGroups: o.saveToGroups !== !1,
          selectedCategory: o.selectedCategory || "Auto Joined"
        };
        await ve(i), await ie({
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
            config: i,
            requestedAt: Date.now()
          }
        });
        const c = await chrome.tabs.query({ url: ["*://*.facebook.com/*", "*://facebook.com/*"] });
        let d = c.find((f) => f.url && f.url.includes("/search"));
        if (!d && c.length > 0 && (d = c[0]), d && d.id) {
          if (await chrome.tabs.update(d.id, { url: r, active: !0 }), d.windowId)
            try {
              await chrome.windows.update(d.windowId, { focused: !0 });
            } catch {
            }
        } else
          d = await chrome.tabs.create({ url: r, active: !0 });
        await S.info("background", `Started Auto-Join on: ${r}`), a({ success: !0, tabId: d == null ? void 0 : d.id, searchUrl: r });
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
        const o = await De();
        a({ success: !0, state: o });
        break;
      }
      case "AUTO_JOIN_PROGRESS": {
        const o = e.payload;
        o && await ie(o), a({ success: !0 });
        break;
      }
      case "AUTO_JOIN_SAVE_GROUPS": {
        const o = e.payload;
        if (o && o.group) {
          const r = await q();
          if (!r.some(
            (c) => {
              var d;
              return c.groupId && c.groupId.toLowerCase() === ((d = o.group.groupId) == null ? void 0 : d.toLowerCase()) || c.url && o.group.url && c.url.toLowerCase() === o.group.url.toLowerCase();
            }
          )) {
            const c = [...r, o.group];
            await oe(c), await S.success("background", `Auto-joined group saved: "${o.group.name}" (Ready for posting)`), W("Facebook Group Added", `"${o.group.name}" is now saved and ready for posting.`);
          }
        }
        a({ success: !0 });
        break;
      }
      case "KEEPALIVE_PING": {
        a({ success: !0, timestamp: Date.now() });
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
chrome.windows.onRemoved.addListener(async (e) => {
  const t = await R();
  if (e === t) {
    console.log("[AGP:Worker] Dedicated posting automation window closed. Keeping queue active without auto-pausing."), await K(null), await v(null);
    const a = await A();
    a.isRunning && !a.isPaused && (console.log("[AGP:Worker] Queue is running; continuing next queue item..."), await N());
  } else e === $ && (console.log("[AGP:Worker] Dedicated discovery window closed."), $ = null);
});
chrome.tabs.onRemoved.addListener(async (e) => {
  const t = await Y();
  e === t && (console.log("[AGP:Worker] Posting tab closed. Clearing tab reference without auto-pausing."), await v(null));
});
try {
  chrome.alarms.create("AGP_QUEUE_WATCHDOG", { periodInMinutes: 0.25 });
} catch {
}
chrome.alarms.onAlarm.addListener(async (e) => {
  if (e.name === "AGP_QUEUE_WATCHDOG")
    try {
      const t = await A();
      if (t.isRunning && !t.isPaused) {
        const a = await x();
        if (me(a)) {
          const s = t.currentItemId ? a.find((o) => o.id === t.currentItemId) : null;
          s && s.startedAt && Date.now() - s.startedAt > 45e3 ? (console.warn(`[AGP:Watchdog] Item ${s.id} stalled for >45s. Auto-skipping to keep queue flowing...`), await ne(s.id, "Watchdog auto-recovery: Response took too long"), await N()) : t.currentItemId || (console.log("[AGP:Watchdog] Queue is active. Triggering next queue item..."), await N());
        }
      }
    } catch (t) {
      console.warn("[AGP:Watchdog] Watchdog check error:", t);
    }
});
