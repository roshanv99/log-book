import { type RouteConfig, route } from "@react-router/dev/routes";

export default [
  // Auth routes (outside main layout)
  route("auth", "routes/auth.tsx", {}, [
    route("login", "routes/auth/login.tsx"),
    route("signup", "routes/auth/signup.tsx")
  ]),

  // Root layout route that includes our main app structure
  route("", "components/Layout.tsx", {}, [
    // Home route as index
    route("", "routes/home.tsx", { index: true }),
    
    // Finance routes
    route("finance", "routes/finance.tsx", {}, [
      route("", "routes/finance/index.tsx", { index: true }),
      route("monthly-churn", "routes/finance/monthly-churn.tsx"),
      route("query", "routes/finance/query.tsx"),
      route("upload-bill", "routes/finance/upload-bill.tsx")
    ]),
    
    // Workout routes
    route("workout", "routes/workout.tsx", {}, [
      route("", "routes/workout/index.tsx", { index: true }),
      route("overview", "routes/workout/overview.tsx"),
      route("query", "routes/workout/query.tsx")
    ]),
    
    // Settings route
    route("settings", "routes/settings/index.tsx")
  ])
] satisfies RouteConfig;
