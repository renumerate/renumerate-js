import { jsx as i } from "react/jsx-runtime";
import r from "react";
import { Renumerate as u } from "../renumerate.es.js";
const o = r.createContext(
  null
);
function h({
  config: t,
  children: e
}) {
  const n = new u(t);
  return /* @__PURE__ */ i(o.Provider, { value: { instance: n }, children: e });
}
function l({
  sessionId: t
}) {
  const e = r.useContext(o);
  if (!e)
    throw new Error("useRenumerate must be used within a RenumerateProvider");
  return {
    open: r.useCallback(() => {
      e.instance.showRetentionView(t);
    }, [t, e.instance])
  };
}
function d({ sessionId: t, className: e }) {
  const n = r.useContext(o);
  if (!n)
    throw new Error("useRenumerate must be used within a RenumerateProvider");
  return /* @__PURE__ */ i(
    "button",
    {
      type: "button",
      className: e || "renumerate-cancel-btn",
      onClick: () => {
        n.instance.showRetentionView(t);
      },
      children: "Cancel Subscription"
    }
  );
}
function p({ sessionId: t, className: e }) {
  if (!r.useContext(o))
    throw new Error("useRenumerate must be used within a RenumerateProvider");
  return /* @__PURE__ */ i(
    "div",
    {
      className: e || "renumerate-subscription-hub",
      style: { height: "100%", width: "100%", minHeight: "220px" },
      children: /* @__PURE__ */ i(
        "iframe",
        {
          title: "SubscriptionHub",
          src: `https://renumerate.com/subscription/${t}`,
          style: { height: "100%", width: "100%", minHeight: "220px" }
        }
      )
    }
  );
}
export {
  d as CancelButton,
  h as RenumerateProvider,
  p as SubscriptionHub,
  l as useRenumerate
};
