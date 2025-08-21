import { jsx as o } from "react/jsx-runtime";
import i, { useState as s, useEffect as c } from "react";
import { Renumerate as m } from "../renumerate.es.js";
const a = i.createContext(
  null
);
function h({
  config: t,
  children: n
}) {
  const [e] = s(() => m.getInstance(t));
  return c(() => {
    e.updateConfig(t);
  }, [t, e]), c(() => (e.cleanup(), e.initialize(), () => {
    e.cleanup();
  }), [e]), /* @__PURE__ */ o(a.Provider, { value: { instance: e }, children: n });
}
function d({
  sessionId: t,
  callbacks: n
}) {
  const e = i.useContext(a);
  if (!e)
    throw new Error("useRenumerate must be used within a RenumerateProvider");
  return {
    open: i.useCallback(() => {
      e.instance.showRetentionView(t, n);
    }, [t, n, e.instance])
  };
}
function C({
  sessionId: t,
  callbacks: n,
  className: e
}) {
  const u = i.useContext(a);
  if (!u)
    throw new Error("useRenumerate must be used within a RenumerateProvider");
  return /* @__PURE__ */ o(
    "button",
    {
      type: "button",
      className: e || "renumerate-cancel-btn",
      onClick: () => {
        u.instance.showRetentionView(t, n);
      },
      children: "Cancel Subscription"
    }
  );
}
function f({
  sessionId: t,
  callbacks: n,
  wrapperClassName: e,
  iframeClassName: u
}) {
  const r = i.useContext(a);
  if (!r)
    throw new Error("SubscriptionHub must be used within a RenumerateProvider");
  return c(() => (r.instance.setCallbacks(n), () => {
    r.instance.setCallbacks();
  }), [n, r.instance]), /* @__PURE__ */ o("div", { className: e || "renumerate-subscription-hub", children: /* @__PURE__ */ o(
    "iframe",
    {
      className: u || "renumerate-subscription-hub-iframe",
      title: "SubscriptionHub",
      src: r.instance.getSubscriptionHubUrl(t)
    }
  ) });
}
export {
  C as CancelButton,
  h as RenumerateProvider,
  f as SubscriptionHub,
  d as useRenumerate
};
