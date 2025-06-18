import { jsx as u } from "react/jsx-runtime";
import r, { useState as c, useEffect as a } from "react";
import { Renumerate as s } from "../renumerate.es.js";
const i = r.createContext(
  null
);
function p({
  config: t,
  children: n
}) {
  const [e] = c(() => s.getInstance(t));
  return a(() => {
    e.updateConfig(t);
  }, [t, e]), a(() => (e.cleanup(), e.initialize(), () => {
    e.cleanup();
  }), [e]), /* @__PURE__ */ u(i.Provider, { value: { instance: e }, children: n });
}
function h({
  sessionId: t
}) {
  const n = r.useContext(i);
  if (!n)
    throw new Error("useRenumerate must be used within a RenumerateProvider");
  return {
    open: r.useCallback(() => {
      n.instance.showRetentionView(t);
    }, [t, n.instance])
  };
}
function d({
  sessionId: t,
  className: n
}) {
  const e = r.useContext(i);
  if (!e)
    throw new Error("useRenumerate must be used within a RenumerateProvider");
  return /* @__PURE__ */ u(
    "button",
    {
      type: "button",
      className: n || "renumerate-cancel-btn",
      onClick: () => {
        e.instance.showRetentionView(t);
      },
      children: "Cancel Subscription"
    }
  );
}
function f({
  sessionId: t,
  wrapperClassName: n,
  iframeClassName: e
}) {
  const o = r.useContext(i);
  if (!o)
    throw new Error("useRenumerate must be used within a RenumerateProvider");
  return /* @__PURE__ */ u("div", { className: n || "renumerate-subscription-hub", children: /* @__PURE__ */ u(
    "iframe",
    {
      className: e || "renumerate-subscription-hub-iframe",
      title: "SubscriptionHub",
      src: o.instance.getSubscriptionHubUrl(t)
    }
  ) });
}
export {
  d as CancelButton,
  p as RenumerateProvider,
  f as SubscriptionHub,
  h as useRenumerate
};
