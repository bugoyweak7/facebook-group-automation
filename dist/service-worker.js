const G = {
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
}, ae = [
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
], A = {
  GROUPS: "agp_groups",
  ACCOUNT_GROUPS: "agp_facebook_groups_by_account",
  POSTS: "agp_posts",
  TEMPLATES: "agp_templates",
  QUEUE: "agp_queue",
  QUEUE_STATE: "agp_queue_state",
  HISTORY: "agp_history",
  LOGS: "agp_logs",
  SETTINGS: "agp_settings",
  FACEBOOK_ACCOUNT: "agp_facebook_account"
}, oe = () => {
  var t;
  return typeof chrome < "u" && !!((t = chrome.storage) != null && t.local);
}, K = {};
async function v(t, e) {
  if (oe())
    return new Promise((a) => {
      chrome.storage.local.get([t], (n) => {
        if (chrome.runtime.lastError) {
          console.warn(`Storage get error for ${t}:`, chrome.runtime.lastError), a(K[t] !== void 0 ? K[t] : e);
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
  return K[t] !== void 0 ? K[t] : e;
}
async function L(t, e) {
  if (K[t] = e, oe())
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
function re(t) {
  return t && t.trim().toLowerCase().replace(/[^a-z0-9_\u0980-\u09FF]/gi, "_") || "default_account";
}
async function ne() {
  return v(A.ACCOUNT_GROUPS, {});
}
async function F(t) {
  const e = await U(), a = re(t || (e == null ? void 0 : e.userId) || (e == null ? void 0 : e.name)), n = await ne();
  if (n[a] && Array.isArray(n[a].groups) && n[a].groups.length > 0) {
    const i = n[a].groups.filter((s) => !Y(s));
    if (i.length > 0) return i;
  }
  const o = (await v(A.GROUPS, [])).filter((r) => !Y(r));
  if (o.length > 0)
    return o;
  for (const r of Object.keys(n))
    if (n[r] && Array.isArray(n[r].groups) && n[r].groups.length > 0) {
      const i = n[r].groups.filter((s) => !Y(s));
      if (i.length > 0) return i;
    }
  return [];
}
async function ie(t, e) {
  const a = (t || []).filter((i) => !Y(i)), n = await U(), c = re(e || (n == null ? void 0 : n.userId) || (n == null ? void 0 : n.name)), o = await ne(), r = o[c] || {
    accountContext: c,
    accountInfo: n || { isLoggedIn: !0, name: "Facebook User", lastSyncedAt: Date.now() },
    groups: [],
    lastSyncedAt: Date.now()
  };
  o[c] = {
    ...r,
    groups: a,
    lastSyncedAt: Date.now()
  }, await L(A.ACCOUNT_GROUPS, o), await L(A.GROUPS, a);
}
function Y(t) {
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
async function V() {
  return v(A.POSTS, []);
}
async function se() {
  return v(A.TEMPLATES, ae);
}
async function x() {
  return v(A.QUEUE, []);
}
async function X(t) {
  await L(A.QUEUE, t);
}
const fe = {
  isRunning: !1,
  isPaused: !1,
  currentItemId: null,
  activeTabId: null,
  sessionStartedAt: null,
  pacingDelayRemaining: 0
};
async function C() {
  return v(A.QUEUE_STATE, fe);
}
async function T(t) {
  await L(A.QUEUE_STATE, t);
}
async function me() {
  return v(A.HISTORY, []);
}
async function we(t) {
  await L(A.HISTORY, t);
}
async function ce(t) {
  const e = await me();
  e.unshift(t), e.length > 500 && (e.length = 500), await we(e);
}
async function ge() {
  return v(A.LOGS, []);
}
async function Ie(t) {
  await L(A.LOGS, t);
}
async function he(t) {
  const e = await ge();
  e.unshift(t), e.length > 300 && (e.length = 300), await Ie(e);
}
async function B() {
  const t = await v(A.SETTINGS, G);
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
async function ue(t) {
  const e = await B(), a = {
    ...e,
    ...t,
    general: { ...e.general, ...t.general || {} },
    queue: { ...e.queue, ...t.queue || {} },
    ai: { ...e.ai, ...t.ai || {} },
    facebook: { ...e.facebook, ...t.facebook || {} },
    webhook: { ...e.webhook, ...t.webhook || {} }
  };
  return await L(A.SETTINGS, a), a;
}
async function U() {
  return v(A.FACEBOOK_ACCOUNT, null);
}
async function H(t) {
  await L(A.FACEBOOK_ACCOUNT, t);
}
function j(t = "id") {
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
        const r = o.split("|").map((i) => i.trim()).filter(Boolean);
        if (r.length > 0)
          return r[Math.floor(Math.random() * r.length)];
      }
      return c;
    });
  return e = e.replace(/\{([^{}\r\n]+?)(?=[.,!?\r\n]|$)/g, (c, o) => o.includes("|") ? o.split("|").map((i) => i.trim()).filter(Boolean)[0] || "" : c), e;
}
class Ee extends Error {
  constructor(e, a, n) {
    super(n || `Invalid queue transition from ${e} to ${a}`), this.from = e, this.to = a, this.name = "QueueTransitionError";
  }
}
const ye = {
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
function Se(t, e) {
  if (t === e) return !0;
  const a = ye[t];
  return !!(a && a.includes(e));
}
function be(t, e, a) {
  if (!Se(t.status, e))
    throw new Ee(t.status, e);
  const n = Date.now(), c = {
    ...t,
    status: e
  };
  return e === "IN_PROGRESS" && !t.startedAt && (c.startedAt = n), (e === "POSTED" || e === "SKIPPED" || e === "FAILED") && (c.completedAt = n), e === "FAILED" ? (c.errorMessage = "Operation failed", c.retryCount = (t.retryCount || 0) + 1) : e === "READY" && t.status === "FAILED" && (c.errorMessage = void 0), c;
}
class _e {
  async writeLog(e, a, n, c) {
    const o = {
      id: j("log"),
      timestamp: Date.now(),
      level: e,
      source: a,
      message: n,
      details: c
    }, r = `[AGP:${a.toUpperCase()}][${e}]`;
    e === "ERROR" ? console.error(r, n, c || "") : e === "WARNING" ? console.warn(r, n, c || "") : console.log(r, n, c || "");
    try {
      await he(o);
    } catch (i) {
      console.warn("Failed to persist log entry:", i);
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
const P = new _e();
function Ae(t) {
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
async function De(t, e, a = "READY") {
  const [n, c] = await Promise.all([F(), V()]), o = c.find((s) => s.id === e);
  let r = 0;
  const i = t.map((s) => {
    r++;
    const I = n.find(
      (m) => m.id === s || m.groupId === s || m.url && m.url.includes(s)
    ), f = (I == null ? void 0 : I.url) || (s.startsWith("http") ? s : `https://www.facebook.com/groups/${s}/`);
    return {
      id: j("queue"),
      groupId: s,
      groupName: I ? I.name : "Facebook Group",
      groupUrl: f,
      postId: e,
      caption: (o == null ? void 0 : o.caption) || (o == null ? void 0 : o.description) || void 0,
      media: void 0,
      // Lean: post.images will be used directly to avoid gigabytes of duplicate base64
      status: a,
      order: r,
      createdAt: Date.now()
    };
  });
  return await X(i), await P.info("queue", `Created clean posting queue for ${i.length} groups`), i;
}
function Ce(t) {
  const e = t.find((a) => a.status === "READY");
  return e || t.find((a) => a.status === "PENDING") || null;
}
async function z(t, e, a) {
  const n = await x(), c = n.findIndex((r) => r.id === t);
  if (c === -1)
    throw new Error(`Queue item ${t} not found`);
  const o = be(n[c], e);
  return n[c] = o, await X(n), { queue: n, updatedItem: o };
}
async function Pe(t, e) {
  const { queue: a, updatedItem: n } = await z(t, "POSTED"), [c, o] = await Promise.all([F(), V()]), r = c.find((f) => f.id === n.groupId), i = o.find((f) => f.id === n.postId), s = n.startedAt ? Math.max(1, Math.round((Date.now() - n.startedAt) / 1e3)) : void 0, I = {
    id: j("hist"),
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
    durationSeconds: s
  };
  return await ce(I), r && (r.postCount = (r.postCount || 0) + 1, r.lastPostedAt = Date.now(), r.status = "POSTED", await ie(c)), await P.success("queue", `Post marked as POSTED for group: ${r ? r.name : n.groupId}`), n;
}
async function le(t, e = "User skipped") {
  const { updatedItem: a } = await z(t, "SKIPPED"), [n, c] = await Promise.all([F(), V()]), o = n.find((s) => s.id === a.groupId), r = c.find((s) => s.id === a.postId), i = {
    id: j("hist"),
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
  return await ce(i), await P.info("queue", `Post marked as SKIPPED for group: ${o ? o.name : a.groupId}`), a;
}
function Te(t, e) {
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
function ve(t, e) {
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
function Ue(t, e) {
  if (t.caption && !e)
    return R(t.caption);
  if (e) {
    const c = Te(t), o = ve(e, c);
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
function Oe(t) {
  if (!t || typeof t != "string") return t || "";
  const e = t.trim();
  if (e.length < 20) return t;
  const a = e.length, n = Math.floor(a / 2);
  for (let o = -15; o <= 15; o++) {
    const r = n + o;
    if (r > 10 && r < a) {
      const i = e.slice(0, r).trim(), s = e.slice(r).trim();
      if (i.length >= 15 && i === s)
        return i;
    }
  }
  const c = e.split(`
`).filter((o) => o.trim().length > 0);
  if (c.length >= 2) {
    const o = c[0].trim();
    if (o.length >= 10) {
      let r = o.length;
      for (; r < e.length; ) {
        const i = e.indexOf(o, r);
        if (i === -1) break;
        const s = e.slice(0, i).trim(), I = e.slice(i).trim();
        if (s.length >= 20 && (s === I || I.startsWith(s) || s.startsWith(I) || s.length > 30 && I.length > 30 && s.slice(0, 50) === I.slice(0, 50) && s.slice(-20) === I.slice(-20)))
          return s;
        r = i + o.length;
      }
    }
  }
  if (e.length > 60) {
    const o = e.slice(0, 35), r = e.indexOf(o, 35);
    if (r > 0) {
      const i = e.slice(0, r).trim(), s = e.slice(r).trim();
      if (i.length >= 25 && (i === s || s.startsWith(i.slice(0, Math.floor(i.length * 0.85)))))
        return i;
    }
  }
  return t;
}
async function $(t, e) {
  try {
    const a = await B();
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
      P.warning("queue", `Webhook dispatch to ${a.webhook.endpoint} failed: ${o}`);
    });
  } catch (a) {
    console.warn("Webhook error:", a);
  }
}
function Ge(t, e) {
  if (!t || !t.trim())
    return e ? e.split(/[-_.]+/).filter(Boolean).map((n) => n.charAt(0).toUpperCase() + n.slice(1)).join(" ") : "Facebook Group";
  let a = t.trim();
  return a = a.replace(/^(?:Visit|Open|View|গ্রুপ দেখুন|দেখুন)\s+/i, ""), a = a.replace(/\s*(?:Last active|You last visited|last visited|active)\s+[^\n]+/i, ""), a = a.replace(/\s*(?:গত|আগে|মিনিট আগে|ঘণ্টা আগে|দিন আগে)[^\n]*/i, ""), a = a.replace(/\s*·\s*(?:Public group|Private group|পাবলিক গ্রুপ|প্রাইভেট গ্রুপ).*$/i, ""), a = a.replace(/\s*·\s*\d+.*members.*$/i, ""), a = a.replace(/\s*·\s*[০-৯\d]+.*সদস্য.*$/i, ""), a = a.replace(/\s*·\s*[^\n]+/i, ""), (a.toLowerCase() === "visit" || a.toLowerCase() === "group" || a.toLowerCase() === "view group") && e ? e.split(/[-_.]+/).filter(Boolean).map((n) => n.charAt(0).toUpperCase() + n.slice(1)).join(" ") : a.trim() || "Facebook Group";
}
const Z = "agp_discovery_progress";
function ke() {
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
const ee = {
  state: "NOT_CONNECTED",
  foundCount: 0,
  importedCount: 0,
  duplicateCount: 0,
  errorCount: 0,
  message: 'Click "Sync Facebook Groups" to discover all joined groups.',
  debugMetrics: ke()
};
async function te() {
  var t;
  return typeof chrome < "u" && ((t = chrome.storage) != null && t.local) ? new Promise((e) => {
    chrome.storage.local.get([Z], (a) => {
      e(a[Z] || ee);
    });
  }) : ee;
}
async function k(t) {
  var e;
  typeof chrome < "u" && ((e = chrome.storage) != null && e.local) && await chrome.storage.local.set({ [Z]: t });
}
async function de(t, e) {
  var y;
  const a = (e == null ? void 0 : e.accountContext) || ((y = await U()) == null ? void 0 : y.name) || "default_account", n = await F(a), c = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map(), i = (l) => l.trim().toLowerCase().replace(/\s+/g, " ");
  n.forEach((l) => {
    l.groupId && c.set(l.groupId.toLowerCase(), l), l.url && o.set(l.url.toLowerCase().replace(/\/$/, ""), l), l.name && r.set(i(l.name), l);
  });
  let s = 0, I = 0;
  const f = Date.now(), m = [], u = /* @__PURE__ */ new Set();
  for (const l of t) {
    if (Y(l)) continue;
    const _ = (l.groupId || "").toLowerCase(), w = (l.url || "").toLowerCase().replace(/\/$/, ""), h = i(l.name || "");
    let b = (_ ? c.get(_) : void 0) || (w ? o.get(w) : void 0) || (h && h.length >= 3 ? r.get(h) : void 0);
    const D = Ge(l.name || "", l.groupId);
    if (b)
      I++, u.add(b.id), D && (!b.name || b.name.includes("·") || b.name.length < D.length) && (b.name = D), l.imageUrl && !b.imageUrl && (b.imageUrl = l.imageUrl), l.privacy && l.privacy !== "UNKNOWN" && (b.privacy = l.privacy), b.verified = !0, b.source = "facebook-ui", b.accountContext = a, b.discoveredAt = f, b.updatedAt = f;
    else {
      s++;
      const M = l.groupId ? `grp_${l.groupId.replace(/[^a-zA-Z0-9_-]/g, "")}` : j("grp"), J = l.url.startsWith("http") ? l.url : `https://www.facebook.com/groups/${l.groupId}/`, W = {
        id: M,
        name: D,
        url: J,
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
      m.push(W), _ && c.set(_, W), w && o.set(w, W), h && r.set(h, W), u.add(W.id);
    }
  }
  let p;
  if ((e == null ? void 0 : e.syncMode) === "exact") {
    const l = (w) => w.source === "manual" || w.category && w.category !== "Discovered", _ = n.filter((w) => u.has(w.id) || l(w));
    p = [...m, ..._];
  } else
    p = [...m, ...n];
  const g = [], d = /* @__PURE__ */ new Set(), O = /* @__PURE__ */ new Set();
  for (const l of p) {
    const _ = l.url.toLowerCase().replace(/\/$/, "");
    !d.has(l.id) && !O.has(_) && (d.add(l.id), O.add(_), g.push(l));
  }
  return await ie(g, a), await P.info(
    "dashboard",
    `Group discovery merged (${(e == null ? void 0 : e.syncMode) || "merge"}): ${s} imported, ${I} duplicates, total ${g.length}`
  ), {
    imported: s,
    duplicates: I,
    totalStored: g.length,
    verifiedCount: g.filter((l) => l.verified).length
  };
}
console.log("[AGP:Background] Service Worker starting with Group Discovery...");
chrome.runtime.onInstalled.addListener(async (t) => {
  console.log("[AGP:Background] Extension installed/updated:", t.reason);
  try {
    const e = await B();
    e ? e.queue && e.queue.delayBetweenItemsSec > 3 && (e.queue.delayBetweenItemsSec = 0, await ue(e)) : await chrome.storage.local.set({ agp_settings: G }), await pe();
    const a = await se();
    (!a || a.length === 0) && await chrome.storage.local.set({ agp_templates: ae }), await P.info("background", `AI Group Poster installed/updated (${t.reason})`);
  } catch (e) {
    console.error("Error during onInstalled initialization:", e);
  }
});
async function pe() {
  try {
    const t = await x();
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
pe();
async function Q(t, e) {
  try {
    if (!(await B()).general.notificationsEnabled) return;
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
async function Re(t) {
  let e = t;
  for (; e > 0; ) {
    const n = await C();
    if (!n.isRunning || n.isPaused)
      break;
    await T({ ...n, pacingDelayRemaining: e }), await new Promise((c) => setTimeout(c, 1e3)), e--;
  }
  const a = await C();
  await T({ ...a, pacingDelayRemaining: 0 });
}
let E = null, S = null;
async function q() {
  var m;
  const t = await x(), e = Ce(t);
  if (!e) {
    if (E) {
      try {
        await chrome.windows.remove(E);
      } catch {
      }
      E = null, S = null;
    } else if (S) {
      try {
        await chrome.tabs.remove(S);
      } catch {
      }
      S = null;
    }
    const u = await C();
    await T({
      ...u,
      isRunning: !1,
      isPaused: !1,
      currentItemId: null,
      expectedGroupId: null,
      expectedGroupName: null,
      expectedGroupUrl: null,
      pacingDelayRemaining: 0
    }), await Q("Queue Completed", "All eligible items in the posting queue have been processed."), await P.success("queue", "Queue session completed successfully"), await $("QUEUE_COMPLETED", { totalProcessed: t.length });
    return;
  }
  const [a, n] = await Promise.all([F(), V()]);
  let c = a.find(
    (u) => u.id === e.groupId || u.groupId === e.groupId || u.url && e.groupId && u.url.includes(e.groupId)
  ), o = (c == null ? void 0 : c.url) || e.groupUrl || "";
  if (!o && e.groupId && !e.groupId.startsWith("grp_") && !e.groupId.startsWith("queue_") && (o = e.groupId.startsWith("http") ? e.groupId : `https://www.facebook.com/groups/${e.groupId}/`), !o || o.includes("/groups/grp_") || !o.includes("facebook.com")) {
    console.warn(`[AGP:Worker] Stale/invalid group URL: "${o}" for item ${e.id}. Skipping...`), await le(e.id), await q();
    return;
  }
  const r = c || {
    id: e.groupId,
    name: e.groupName || "Facebook Group",
    url: o,
    groupId: e.groupId,
    category: "General",
    postCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  r.url = o;
  let i = n.find((u) => u.id === e.postId) || n[n.length - 1] || n[0];
  i || (i = {
    id: e.postId || "post_default",
    title: "Facebook Group Listing",
    productName: "Facebook Group Listing",
    caption: e.caption || "",
    description: e.caption || "",
    images: e.media || [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  }), await z(e.id, "IN_PROGRESS");
  let s, I = !1;
  if (E)
    try {
      const u = await chrome.windows.get(E, { populate: !0 });
      u && u.id && (I = !0);
    } catch {
      I = !1, E = null, S = null;
    }
  if (I && E) {
    if (S)
      try {
        const u = await chrome.tabs.get(S);
        if (u && u.windowId === E) {
          await chrome.tabs.update(S, { url: r.url, active: !0 }), s = S;
          try {
            await chrome.windows.update(E, { focused: !0 });
          } catch {
          }
        }
      } catch {
        S = null;
      }
    if (!s)
      try {
        const u = await chrome.tabs.create({
          windowId: E,
          url: r.url,
          active: !0
        });
        s = u.id, S = u.id ?? null;
      } catch (u) {
        console.warn("[AGP:Worker] Failed to create tab inside automation window:", u);
      }
  }
  if (!s || !E)
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
      E = u.id ?? null, u.tabs && u.tabs.length > 0 ? s = u.tabs[0].id : u.id && (s = (m = (await chrome.tabs.query({ windowId: u.id }))[0]) == null ? void 0 : m.id), S = s ?? null;
    } catch (u) {
      console.error("[AGP:Worker] Failed to create dedicated automation popup window:", u);
    }
  const f = await C();
  await T({
    ...f,
    isRunning: !0,
    isPaused: !1,
    currentItemId: e.id,
    activeTabId: s ?? null,
    expectedGroupId: r.groupId || r.id,
    expectedGroupName: r.name,
    expectedGroupUrl: r.url,
    currentGroupMatch: !0
  }), await P.info("queue", `Opening group: ${r.name} (${r.url})`), await Q("Group Opened", `Review your prepared post for: ${r.name}`), await $("POST_READY", { groupId: r.id, postId: i.id, groupName: r.name });
}
let N = null;
async function Ne() {
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
  await k(t);
  let e = null, a = null;
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
    if (e = i.id ?? null, N = e, i.tabs && i.tabs.length > 0 ? a = i.tabs[0].id ?? null : e && (a = ((n = (await chrome.tabs.query({ windowId: e }))[0]) == null ? void 0 : n.id) ?? null), !a)
      throw new Error("Failed to resolve Facebook tab for group sync.");
    console.log(`[AGP:Worker] Facebook popup window created (Win #${e}, Tab #${a})`);
    const s = Date.now();
    for (; Date.now() - s < 15e3; ) {
      try {
        if ((await chrome.tabs.get(a)).status === "complete") break;
      } catch {
      }
      await new Promise((p) => setTimeout(p, 400));
    }
    if (await new Promise((p) => setTimeout(p, 2200)), !await new Promise((p) => {
      chrome.tabs.sendMessage(a, { type: "CHECK_FACEBOOK_SESSION" }, (g) => {
        p(!chrome.runtime.lastError && (g == null ? void 0 : g.success));
      });
    }) && chrome.scripting)
      try {
        await chrome.scripting.executeScript({
          target: { tabId: a },
          files: ["facebook-content.js"]
        }), await new Promise((p) => setTimeout(p, 1e3));
      } catch (p) {
        console.warn("[AGP:Worker] Script injection warning:", p);
      }
    await k({
      state: "DISCOVERING",
      foundCount: 0,
      importedCount: 0,
      duplicateCount: 0,
      errorCount: 0,
      outcome: "PARTIAL",
      message: "Scanning Facebook joined groups...",
      lastDiscoveredAt: Date.now()
    });
    const f = await new Promise((p) => {
      chrome.tabs.sendMessage(a, { type: "START_GROUP_DISCOVERY" }, (g) => {
        chrome.runtime.lastError ? p({ success: !1, error: chrome.runtime.lastError.message }) : p(g || { success: !1, error: "No response from content script" });
      });
    });
    if (e) {
      try {
        await chrome.windows.remove(e);
      } catch (p) {
        console.warn("[AGP:Worker] Popup window auto-close note:", p);
      }
      N = null;
    }
    if (f != null && f.success && f.payload) {
      const p = f.payload, g = p.groups || [], d = p.profile, O = (d == null ? void 0 : d.userId) || (d == null ? void 0 : d.name) || void 0, y = await U(), l = ((d == null ? void 0 : d.name) || (y == null ? void 0 : y.name) || "").trim();
      y != null && y.name && (d != null && d.name) && y.name.trim().toLowerCase() !== d.name.trim().toLowerCase() && console.log(`[AGP:Worker] Account changed from "${y.name}" to "${d.name}". Isolated storage.`);
      const _ = await de(g, {
        syncMode: "exact",
        accountContext: O
      }), w = {
        isLoggedIn: !!(d != null && d.isLoggedIn || d != null && d.name),
        name: l || "Facebook User",
        profileUrl: (d == null ? void 0 : d.profileUrl) || (y == null ? void 0 : y.profileUrl) || "https://www.facebook.com",
        avatarUrl: (d == null ? void 0 : d.avatarUrl) || (y == null ? void 0 : y.avatarUrl) || "",
        userId: (d == null ? void 0 : d.userId) || (y == null ? void 0 : y.userId) || "",
        totalGroupsCount: _.totalStored,
        lastSyncedAt: Date.now()
      };
      await H(w);
      const h = p.outcome || (p.isPartial ? "PARTIAL" : "COMPLETE"), b = p.completionReason || (h === "COMPLETE" ? "TARGET_REACHED" : "STAGNANT_TIMEOUT");
      let D = "";
      h === "COMPLETE" ? D = `${_.totalStored} verified groups found — scan complete.` : D = `${_.totalStored} verified groups found — Facebook did not expose the complete list.`;
      const M = {
        state: h === "COMPLETE" ? "DISCOVERY_COMPLETE" : "DISCOVERY_PARTIAL",
        foundCount: p.totalFoundOnPage || _.totalStored,
        importedCount: _.imported,
        duplicateCount: _.duplicates,
        errorCount: 0,
        outcome: h,
        completionReason: b,
        targetCount: ((c = p.debugMetrics) == null ? void 0 : c.targetCount) ?? null,
        targetCountStatus: ((o = p.debugMetrics) == null ? void 0 : o.targetCountStatus) ?? "UNAVAILABLE",
        debugMetrics: p.debugMetrics,
        message: D,
        lastDiscoveredAt: Date.now()
      };
      return await k(M), h === "COMPLETE" ? (await Q("Facebook Groups Synced", D), await P.success("dashboard", D)) : (await Q("Facebook Groups Synced (Partial)", D), await P.info("dashboard", D)), M;
    }
    const u = {
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
    return await k(u), u;
  } catch (r) {
    if (e) {
      try {
        await chrome.windows.remove(e);
      } catch {
      }
      N = null;
    }
    const s = {
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
    return await k(s), s;
  }
}
chrome.runtime.onMessage.addListener((t, e, a) => ((async () => {
  var n, c;
  try {
    switch (t.type) {
      case "START_GROUP_DISCOVERY": {
        const o = await Ne();
        a({ success: !0, progress: o });
        break;
      }
      case "CANCEL_GROUP_DISCOVERY": {
        if (N) {
          try {
            await chrome.windows.remove(N);
          } catch {
          }
          N = null;
        }
        await k({
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
        const o = await te();
        a({ success: !0, progress: o });
        break;
      }
      case "GROUP_BATCH_DISCOVERED": {
        const o = t.payload;
        if (o && o.liveGroups && Array.isArray(o.liveGroups)) {
          try {
            await de(o.liveGroups, { syncMode: "merge" });
          } catch (r) {
            console.warn("[AGP:Worker] Live batch merge warning:", r);
          }
          await k({
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
        o && typeof o.foundCount == "number" && await k({
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
        const [o, r] = await Promise.all([x(), C()]), i = Ae(o);
        a({ success: !0, queue: o, state: r, stats: i });
        break;
      }
      case "DETECT_FB_SESSION": {
        const r = (await chrome.tabs.query({})).find((i) => i.url && i.url.includes("facebook.com"));
        if (r && r.id)
          return await (async () => {
            chrome.tabs.sendMessage(r.id, { type: "GET_FACEBOOK_USER_INFO" }, async (s) => {
              const I = await F();
              if (chrome.runtime.lastError || !s) {
                if (chrome.scripting && r.id)
                  try {
                    await chrome.scripting.executeScript({
                      target: { tabId: r.id },
                      files: ["facebook-content.js"]
                    }), setTimeout(() => {
                      chrome.tabs.sendMessage(r.id, { type: "GET_FACEBOOK_USER_INFO" }, async (m) => {
                        if (m && m.profile && m.profile.isLoggedIn) {
                          const u = {
                            isLoggedIn: !0,
                            name: m.profile.name,
                            profileUrl: m.profile.profileUrl,
                            avatarUrl: m.profile.avatarUrl,
                            userId: m.profile.userId,
                            totalGroupsCount: I.length,
                            lastSyncedAt: Date.now()
                          };
                          await H(u), a({ success: !0, account: u });
                        } else {
                          const u = await U();
                          a({ success: !0, account: u });
                        }
                      });
                    }, 400);
                    return;
                  } catch {
                  }
                const f = await U();
                a({ success: !0, account: f });
                return;
              }
              if (s && s.profile && s.profile.isLoggedIn) {
                const f = {
                  isLoggedIn: !0,
                  name: s.profile.name,
                  profileUrl: s.profile.profileUrl,
                  avatarUrl: s.profile.avatarUrl,
                  userId: s.profile.userId,
                  totalGroupsCount: I.length,
                  lastSyncedAt: Date.now()
                };
                await H(f), a({ success: !0, account: f });
              } else {
                const f = await U();
                a({ success: !0, account: f });
              }
            });
          })(), !0;
        {
          const i = await U();
          a({ success: !0, account: i });
        }
        break;
      }
      case "FB_USER_PROFILE_DETECTED": {
        const o = t.payload;
        if (o && o.name) {
          const r = await U();
          await H({
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
        const o = await C();
        await T({
          ...o,
          isRunning: !0,
          isPaused: !1,
          sessionStartedAt: Date.now()
        }), await P.info("queue", "Queue execution started"), await $("QUEUE_STARTED", {}), await q(), a({ success: !0 });
        break;
      }
      case "PAUSE_QUEUE": {
        const o = await C();
        await T({ ...o, isPaused: !0 }), await P.info("queue", "Queue execution paused"), await Q("Queue Paused", "Posting queue has been paused by user."), a({ success: !0 });
        break;
      }
      case "RESUME_QUEUE": {
        const o = await C();
        await T({ ...o, isPaused: !1, isRunning: !0 }), await P.info("queue", "Queue execution resumed"), await q(), a({ success: !0 });
        break;
      }
      case "CREATE_AND_START_QUEUE": {
        const o = t.payload;
        if (o && Array.isArray(o.groupIds) && o.postId) {
          const r = await B(), i = typeof o.delaySec == "number" && o.delaySec >= 0 ? o.delaySec : 0;
          if (await ue({
            queue: { ...r.queue, delayBetweenItemsSec: i }
          }), E)
            try {
              await chrome.windows.remove(E);
            } catch {
            }
          E = null, S = null, await De(o.groupIds, o.postId, "READY");
          const s = await C();
          await T({
            ...s,
            isRunning: !0,
            isPaused: !1,
            activeTabId: null,
            sessionStartedAt: Date.now()
          }), await P.info("queue", `Sequential posting queue created for ${o.groupIds.length} groups`), await $("QUEUE_STARTED", { count: o.groupIds.length }), await q(), a({ success: !0 });
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
          E = null, S = null;
        } else if (S) {
          try {
            await chrome.tabs.remove(S);
          } catch {
          }
          S = null;
        }
        const o = await C();
        await T({
          ...o,
          isRunning: !1,
          isPaused: !1,
          currentItemId: null,
          expectedGroupId: null,
          expectedGroupName: null,
          expectedGroupUrl: null,
          pacingDelayRemaining: 0
        }), await P.info("queue", "Queue execution stopped by user"), a({ success: !0 });
        break;
      }
      case "MARK_AS_POSTED": {
        const o = await C(), r = t.payload ? t.payload.itemId : o.currentItemId;
        if (!r) {
          a({ success: !1, error: "No active item to mark as posted" });
          return;
        }
        await Pe(r), await Q("Post Completed", "Group marked as posted."), await $("POST_MARKED_POSTED", { itemId: r });
        const i = await B();
        o.isPaused || (await T({ ...o, isRunning: !0 }), i.queue.delayBetweenItemsSec > 0 && i.queue.delayBetweenItemsSec <= 5 && await Re(i.queue.delayBetweenItemsSec), await q()), a({ success: !0 });
        break;
      }
      case "SKIP_CURRENT_ITEM": {
        const o = await C(), r = t.payload, i = (r == null ? void 0 : r.itemId) || o.currentItemId;
        if (!i) {
          a({ success: !1, error: "No active item to skip" });
          return;
        }
        const s = (r == null ? void 0 : r.reason) || "Auto-skipped (posting unavailable or wrong group)";
        await le(i, s), await $("POST_SKIPPED", { itemId: i, reason: s }), o.isPaused || (await T({ ...o, isRunning: !0 }), await q()), a({ success: !0 });
        break;
      }
      case "UPDATE_QUEUE_ITEM_CAPTION": {
        const o = t.payload;
        if (o != null && o.itemId && o.caption !== void 0) {
          const i = (await x()).map((s) => s.id === o.itemId ? { ...s, caption: o.caption } : s);
          await X(i);
        }
        a({ success: !0 });
        break;
      }
      case "FB_PAGE_DETECTED": {
        const o = await C();
        if (o.currentItemId)
          try {
            await z(o.currentItemId, "IN_PROGRESS");
          } catch {
          }
        a({ success: !0 });
        break;
      }
      case "GET_ACTIVE_POST_FOR_TAB": {
        if (!!!(e.tab && (e.tab.id === S || E && e.tab.windowId === E || e.tab.id === (await C()).activeTabId))) {
          a({ success: !0, payload: null, isUserTab: !0 });
          return;
        }
        const [r, i, s, I, f] = await Promise.all([
          x(),
          C(),
          F(),
          V(),
          se()
        ]);
        let m = i.currentItemId && r.find((w) => w.id === i.currentItemId) || null;
        const u = ((n = e.tab) == null ? void 0 : n.url) || ((c = t.payload) == null ? void 0 : c.url) || "";
        if (!m && u) {
          const w = s.find((h) => u.includes(h.groupId || "") || h.url && u.includes(h.url));
          w && (m = r.find((h) => h.groupId === w.id && (h.status === "READY" || h.status === "IN_PROGRESS" || h.status === "WAITING_FOR_USER")) || null);
        }
        if (!m) {
          a({ success: !0, payload: null });
          return;
        }
        const p = s.find((w) => w.id === m.groupId) || null, g = I.find((w) => w.id === m.postId) || null;
        let d = "";
        if (m.caption)
          d = R(m.caption);
        else if (g != null && g.caption)
          d = R(g.caption);
        else if (g != null && g.description)
          d = R(g.description);
        else if (g) {
          const w = g.templateId ? f.find((h) => h.id === g.templateId) : void 0;
          d = R(Ue(g, w == null ? void 0 : w.content));
        }
        d = Oe(d);
        let O = !0;
        if (p && u)
          if (!!(e.tab && (e.tab.id === i.activeTabId || e.tab.id === S)))
            O = !0;
          else {
            const h = (p.groupId || "").replace(/^grp_/, "").toLowerCase().trim(), b = (p.url || "").toLowerCase().replace(/^https?:\/\/(www\.|m\.|web\.)?/, "").replace(/\/$/, ""), D = u.toLowerCase().replace(/^https?:\/\/(www\.|m\.|web\.)?/, "").replace(/\/$/, ""), M = h ? D.includes(h) : !1, J = b ? D.includes(b) || b.includes(D) : !1;
            (h || b) && (O = !!(M || J));
          }
        const y = r.findIndex((w) => w.id === m.id) + 1, l = r.filter((w) => w.status === "POSTED").length, _ = {
          queueItem: m,
          group: p,
          post: g,
          caption: d,
          formattedPost: d,
          media: m.media || (g == null ? void 0 : g.images) || [],
          queueIndex: y > 0 ? y : 1,
          totalQueueItems: r.length,
          postedCount: l,
          isGroupMatch: O,
          expectedGroupName: p ? p.name : "Expected Group",
          expectedGroupUrl: p ? p.url : ""
        };
        a({ success: !0, payload: _ });
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
        if (S)
          try {
            await chrome.tabs.update(S, { active: !0 });
            const o = await chrome.tabs.get(S);
            o.windowId && await chrome.windows.update(o.windowId, { focused: !0 });
          } catch {
          }
        a({ success: !0 });
        break;
      }
      case "GET_DEBUG_METRICS": {
        const o = await te();
        a({ success: !0, debugMetrics: o.debugMetrics || null });
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
    console.log("[AGP:Worker] Dedicated posting automation window closed by user."), E = null, S = null;
    const e = await C();
    e.isRunning && !e.isPaused && (await T({
      ...e,
      isRunning: !1,
      isPaused: !0,
      activeTabId: null
    }), await P.info("queue", "Automation window closed. Queue automatically paused."));
  } else t === N && (console.log("[AGP:Worker] Dedicated discovery window closed."), N = null);
});
