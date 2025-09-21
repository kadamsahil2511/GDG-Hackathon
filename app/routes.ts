import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("analyze", "routes/analyze.tsx"),
  route("api/fact-check", "routes/api.fact-check.ts")
] satisfies RouteConfig;
