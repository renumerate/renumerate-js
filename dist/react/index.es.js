import { jsx as o } from "react/jsx-runtime";
import r from "react";
import { Renumerate as i } from "../renumerate.es.js";
const u = r.createContext(
  null
);
function l({
  config: t,
  children: e
}) {
  const n = new i(t);
  return /* @__PURE__ */ o(u.Provider, { value: { instance: n }, children: e });
}
function h({
  sessionId: t
}) {
  const e = r.useContext(u);
  if (!e)
    throw new Error("useRenumerate must be used within a RenumerateProvider");
  return {
    open: r.useCallback(() => {
      e.instance.showRetentionView(t);
    }, [t, e.instance])
  };
}
function b({ sessionId: t, className: e }) {
  const n = r.useContext(u);
  if (!n)
    throw new Error("useRenumerate must be used within a RenumerateProvider");
  return /* @__PURE__ */ o(
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
function d({ sessionId: t, className: e }) {
  if (!r.useContext(u))
    throw new Error("useRenumerate must be used within a RenumerateProvider");
  return /* @__PURE__ */ o("div", { className: e || "renumerate-subscription-hub", children: /* @__PURE__ */ o(
    "iframe",
    {
      title: "SubscriptionHub",
      src: `https://renumerate.com/subscription/${t}`
    }
  ) });
}
export {
  b as CancelButton,
  l as RenumerateProvider,
  d as SubscriptionHub,
  h as useRenumerate
};
