import { onRequestPost as __api_enter_code_ts_onRequestPost } from "/Users/stephencarrillo/Downloads/rewild-connect-starter/functions/api/enter-code.ts"
import { onRequestGet as __api_me_ts_onRequestGet } from "/Users/stephencarrillo/Downloads/rewild-connect-starter/functions/api/me.ts"
import { onRequestGet as __api_ping_ts_onRequestGet } from "/Users/stephencarrillo/Downloads/rewild-connect-starter/functions/api/ping.ts"
import { onRequestPost as __api_signup_ts_onRequestPost } from "/Users/stephencarrillo/Downloads/rewild-connect-starter/functions/api/signup.ts"

export const routes = [
    {
      routePath: "/api/enter-code",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_enter_code_ts_onRequestPost],
    },
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
  {
      routePath: "/api/signup",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_signup_ts_onRequestPost],
    },
  ]