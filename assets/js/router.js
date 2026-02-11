import { setActiveTab } from "./ui.js";

export function parseRoute() {
  const hash = location.hash || "#/home";
  const [path, queryString] = hash.slice(1).split("?");
  const route = path.replace(/^\//, "") || "home";

  const query = {};
  if (queryString) {
    for (const part of queryString.split("&")) {
      const [k, v] = part.split("=");
      query[decodeURIComponent(k)] = decodeURIComponent(v || "");
    }
  }
  return { route, query };
}

export function mountRouter(render) {
  const on = () => {
    const { route, query } = parseRoute();
    setActiveTab(route);
    render(route, query);
  };
  window.addEventListener("hashchange", on);
  on();
}