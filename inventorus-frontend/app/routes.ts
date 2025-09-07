import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("components", "routes/components.tsx"),
  route("vendors", "routes/vendors.tsx"),
  route("types", "routes/types.tsx"),
] satisfies RouteConfig;
