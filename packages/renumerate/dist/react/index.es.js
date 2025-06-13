import { jsx as u } from "react/jsx-runtime";
import r, { useState as a, useEffect as o } from "react";
import { Renumerate as c } from "../renumerate.es.js";
const i = r.createContext(
  null
);
function p({
  config: t,
  children: n
}) {
  const [e] = a(() => c.getInstance(t));
  return o(() => {
    e.updateConfig(t);
  }, [t, e]), o(() => (e.cleanup(), e.initialize(), () => {
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
function d({ sessionId: t, className: n }) {
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
function f({ sessionId: t, className: n }) {
  const e = r.useContext(i);
  if (!e)
    throw new Error("useRenumerate must be used within a RenumerateProvider");
  return /* @__PURE__ */ u("div", { className: n || "renumerate-subscription-hub", children: /* @__PURE__ */ u(
    "iframe",
    {
      className: "renumerate-subscription-hub-iframe",
      title: "SubscriptionHub",
      src: e.instance.getSubscriptionHubUrl(t)
    }
  ) });
}
export {
  d as CancelButton,
  p as RenumerateProvider,
  f as SubscriptionHub,
  h as useRenumerate
};
