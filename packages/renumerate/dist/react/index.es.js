import { jsx as i } from "react/jsx-runtime";
import r, { useState as c, useEffect as o } from "react";
import { Renumerate as a } from "../renumerate.es.js";
const u = r.createContext(
  null
);
function p({
  config: t,
  children: n
}) {
  const [e] = c(() => new a(t));
  return o(() => {
    e.updateConfig(t);
  }, [t, e]), o(() => (e.cleanup(), e.initialize(), () => {
    e.cleanup();
  }), [e]), /* @__PURE__ */ i(u.Provider, { value: { instance: e }, children: n });
}
function d({
  sessionId: t
}) {
  const n = r.useContext(u);
  if (!n)
    throw new Error("useRenumerate must be used within a RenumerateProvider");
  return {
    open: r.useCallback(() => {
      n.instance.showRetentionView(t);
    }, [t, n.instance])
  };
}
function b({ sessionId: t, className: n }) {
  const e = r.useContext(u);
  if (!e)
    throw new Error("useRenumerate must be used within a RenumerateProvider");
  return /* @__PURE__ */ i(
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
function w({ sessionId: t, className: n }) {
  const e = r.useContext(u);
  if (!e)
    throw new Error("useRenumerate must be used within a RenumerateProvider");
  return /* @__PURE__ */ i(
    "div",
    {
      className: n || "renumerate-subscription-hub",
      style: { height: "100%", width: "100%", minHeight: "220px" },
      children: /* @__PURE__ */ i(
        "iframe",
        {
          title: "SubscriptionHub",
          src: e.instance.getSubscriptionHubUrl(t),
          style: { height: "100%", width: "100%", minHeight: "220px" }
        }
      )
    }
  );
}
export {
  b as CancelButton,
  p as RenumerateProvider,
  w as SubscriptionHub,
  d as useRenumerate
};
