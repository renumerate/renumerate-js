import { jsx as a } from "react/jsx-runtime";
import u, { useState as s, useEffect as c } from "react";
import { Renumerate as l } from "../renumerate.es.js";
const o = u.createContext(
  null
);
function d({
  config: t,
  children: n
}) {
  const [e] = s(() => l.getInstance(t));
  return c(() => {
    e.updateConfig(t);
  }, [t, e]), c(() => (e.cleanup(), e.initialize(), () => {
    e.cleanup();
  }), [e]), /* @__PURE__ */ a(o.Provider, { value: { instance: e }, children: n });
}
function h({
  sessionId: t,
  callbacks: n
}) {
  const e = u.useContext(o);
  if (!e)
    throw new Error("useRenumerate must be used within a RenumerateProvider");
  return {
    open: u.useCallback(() => {
      e.instance.showRetentionView(t, n);
    }, [t, n, e.instance])
  };
}
function w({
  sessionId: t,
  callbacks: n,
  className: e
}) {
  const i = u.useContext(o);
  if (!i)
    throw new Error("useRenumerate must be used within a RenumerateProvider");
  return /* @__PURE__ */ a(
    "button",
    {
      type: "button",
      className: e || "renumerate-cancel-btn",
      onClick: () => {
        i.instance.showRetentionView(t, n);
      },
      children: "Cancel Subscription"
    }
  );
}
function C({
  sessionId: t,
  callbacks: n,
  wrapperClassName: e,
  iframeClassName: i
}) {
  const r = u.useContext(o);
  if (!r)
    throw new Error("SubscriptionHub must be used within a RenumerateProvider");
  return c(() => (r.instance.setCallbacks(n), () => {
    r.instance.setCallbacks();
  }), [n, r.instance]), /* @__PURE__ */ a("div", { className: e || "renumerate-subscription-hub", children: /* @__PURE__ */ a(
    "iframe",
    {
      className: i || "renumerate-subscription-hub-iframe",
      title: "SubscriptionHub",
      src: r.instance.getSubscriptionHubUrl(t),
      allow: "publickey-credentials-get"
    }
  ) });
}
export {
  w as CancelButton,
  d as RenumerateProvider,
  C as SubscriptionHub,
  h as useRenumerate
};
