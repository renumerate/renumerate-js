import { jsx as c } from "react/jsx-runtime";
import f, { useState as h, useEffect as m, useCallback as R } from "react";
import { Renumerate as w } from "../renumerate.es.js";
const S = f.createContext(
  null
);
function g({
  config: t,
  children: i
}) {
  const [e] = h(() => w.getInstance(t)), [o, r] = h(null), [u, s] = h(!0), [a, l] = h(null);
  m(() => {
    e.updateConfig(t);
  }, [t, e]), m(() => (e.cleanup(), e.initialize(), () => {
    e.cleanup();
  }), [e]);
  const d = R(async () => {
    console.info("RenumerateProvider: Fetching session..."), s(!0), l(null);
    try {
      const n = await e.getSession();
      console.info("RenumerateProvider: Session fetched:", n), r(n);
    } catch (n) {
      console.error("RenumerateProvider: Session fetch failed:", n), l(n instanceof Error ? n : new Error(String(n))), r(null);
    } finally {
      s(!1);
    }
  }, [e]);
  m(() => {
    d();
  }, [d]);
  const b = R(async () => {
    s(!0), l(null);
    try {
      const n = await e.refreshSession();
      r(n);
    } catch (n) {
      l(n instanceof Error ? n : new Error(String(n))), r(null);
    } finally {
      s(!1);
    }
  }, [e]);
  return /* @__PURE__ */ c(
    S.Provider,
    {
      value: {
        instance: e,
        session: o,
        isSessionLoading: u,
        sessionError: a,
        refreshSession: b
      },
      children: i
    }
  );
}
function E() {
  const t = f.useContext(S);
  if (!t)
    throw new Error(
      "useRenumerateContext must be used within a RenumerateProvider"
    );
  return t;
}
function y({
  subscriptionId: t,
  callbacks: i
} = {}) {
  const e = f.useContext(S);
  if (!e)
    throw new Error("useRenumerate must be used within a RenumerateProvider");
  const { instance: o, session: r, isSessionLoading: u } = e;
  return {
    open: R(() => {
      o.showRetentionView(t, i);
    }, [t, i, o]),
    isReady: !u && r !== null
  };
}
function P({
  subscriptionId: t,
  callbacks: i,
  className: e,
  children: o
}) {
  const r = f.useContext(S);
  if (!r)
    throw new Error("CancelButton must be used within a RenumerateProvider");
  const { instance: u, isSessionLoading: s, session: a } = r;
  return /* @__PURE__ */ c(
    "button",
    {
      type: "button",
      className: e || "renumerate-cancel-btn",
      onClick: () => {
        u.showRetentionView(t, i);
      },
      disabled: s || a === null,
      children: o || "Cancel Subscription"
    }
  );
}
function L({
  callbacks: t,
  wrapperClassName: i,
  iframeClassName: e,
  loadingComponent: o,
  errorComponent: r
}) {
  const u = f.useContext(S);
  if (!u)
    throw new Error("SubscriptionHub must be used within a RenumerateProvider");
  const { instance: s, session: a, isSessionLoading: l, sessionError: d } = u, [b, n] = h(null);
  return m(() => (s.setCallbacks(t), () => {
    s.setCallbacks();
  }), [t, s]), m(() => {
    a && s.getSubscriptionHubUrl().then((p) => {
      console.info("SubscriptionHub URL:", p), n(p);
    }).catch((p) => {
      console.error("Failed to get SubscriptionHub URL:", p);
    });
  }, [a, s]), l || a && !b && !d ? /* @__PURE__ */ c("div", { className: i || "renumerate-subscription-hub", children: o || /* @__PURE__ */ c("div", { children: "Loading..." }) }) : d || !b ? /* @__PURE__ */ c("div", { className: i || "renumerate-subscription-hub", children: r || /* @__PURE__ */ c("div", { children: "Failed to load subscription hub" }) }) : /* @__PURE__ */ c("div", { className: i || "renumerate-subscription-hub", children: /* @__PURE__ */ c(
    "iframe",
    {
      className: e || "renumerate-subscription-hub-iframe",
      title: "SubscriptionHub",
      src: b,
      allow: "publickey-credentials-get; payment",
      "data-renumerate-subhub": "true"
    }
  ) });
}
export {
  P as CancelButton,
  g as RenumerateProvider,
  L as SubscriptionHub,
  y as useRenumerate,
  E as useRenumerateContext
};
