import { onRequestGet as __api_me_ts_onRequestGet } from "/Users/stephencarrillo/Downloads/rewild-connect-starter/functions/api/me.ts"
import { onRequestGet as __api_ping_ts_onRequestGet } from "/Users/stephencarrillo/Downloads/rewild-connect-starter/functions/api/ping.ts"

export const routes = [
    {
      routePath: "/api/me",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_me_ts_onRequestGet],
    },
  {
      routePath: "/api/ping",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_ping_ts_onRequestGet],
    },
  ]