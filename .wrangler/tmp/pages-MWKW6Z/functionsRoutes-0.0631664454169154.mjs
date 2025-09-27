import { onRequestPost as __api_admin_codes_ts_onRequestPost } from "/Users/stephencarrillo/Desktop/rewild-clean/functions/api/admin/codes.ts"
import { onRequestPost as __api_admin_set_role_ts_onRequestPost } from "/Users/stephencarrillo/Desktop/rewild-clean/functions/api/admin/set-role.ts"
import { onRequestGet as __api_admin_users_ts_onRequestGet } from "/Users/stephencarrillo/Desktop/rewild-clean/functions/api/admin/users.ts"
import { onRequestPost as __api_shifts_signup_ts_onRequestPost } from "/Users/stephencarrillo/Desktop/rewild-clean/functions/api/shifts/signup.ts"
import { onRequestGet as __api_announcements_ts_onRequestGet } from "/Users/stephencarrillo/Desktop/rewild-clean/functions/api/announcements.ts"
import { onRequestPost as __api_announcements_ts_onRequestPost } from "/Users/stephencarrillo/Desktop/rewild-clean/functions/api/announcements.ts"
import { onRequestGet as __api_codes_ts_onRequestGet } from "/Users/stephencarrillo/Desktop/rewild-clean/functions/api/codes.ts"
import { onRequestPost as __api_enter_code_ts_onRequestPost } from "/Users/stephencarrillo/Desktop/rewild-clean/functions/api/enter-code.ts"
import { onRequestPost as __api_login_ts_onRequestPost } from "/Users/stephencarrillo/Desktop/rewild-clean/functions/api/login.ts"
import { onRequestPost as __api_logout_ts_onRequestPost } from "/Users/stephencarrillo/Desktop/rewild-clean/functions/api/logout.ts"
import { onRequestGet as __api_me_ts_onRequestGet } from "/Users/stephencarrillo/Desktop/rewild-clean/functions/api/me.ts"
import { onRequestGet as __api_messages_ts_onRequestGet } from "/Users/stephencarrillo/Desktop/rewild-clean/functions/api/messages.ts"
import { onRequestPost as __api_messages_ts_onRequestPost } from "/Users/stephencarrillo/Desktop/rewild-clean/functions/api/messages.ts"
import { onRequestGet as __api_photos_ts_onRequestGet } from "/Users/stephencarrillo/Desktop/rewild-clean/functions/api/photos.ts"
import { onRequestPost as __api_photos_ts_onRequestPost } from "/Users/stephencarrillo/Desktop/rewild-clean/functions/api/photos.ts"
import { onRequestGet as __api_ping_ts_onRequestGet } from "/Users/stephencarrillo/Desktop/rewild-clean/functions/api/ping.ts"
import { onRequestGet as __api_shifts_ts_onRequestGet } from "/Users/stephencarrillo/Desktop/rewild-clean/functions/api/shifts.ts"
import { onRequestPost as __api_shifts_ts_onRequestPost } from "/Users/stephencarrillo/Desktop/rewild-clean/functions/api/shifts.ts"
import { onRequestPost as __api_signup_ts_onRequestPost } from "/Users/stephencarrillo/Desktop/rewild-clean/functions/api/signup.ts"

export const routes = [
    {
      routePath: "/api/admin/codes",
      mountPath: "/api/admin",
      method: "POST",
      middlewares: [],
      modules: [__api_admin_codes_ts_onRequestPost],
    },
  {
      routePath: "/api/admin/set-role",
      mountPath: "/api/admin",
      method: "POST",
      middlewares: [],
      modules: [__api_admin_set_role_ts_onRequestPost],
    },
  {
      routePath: "/api/admin/users",
      mountPath: "/api/admin",
      method: "GET",
      middlewares: [],
      modules: [__api_admin_users_ts_onRequestGet],
    },
  {
      routePath: "/api/shifts/signup",
      mountPath: "/api/shifts",
      method: "POST",
      middlewares: [],
      modules: [__api_shifts_signup_ts_onRequestPost],
    },
  {
      routePath: "/api/announcements",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_announcements_ts_onRequestGet],
    },
  {
      routePath: "/api/announcements",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_announcements_ts_onRequestPost],
    },
  {
      routePath: "/api/codes",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_codes_ts_onRequestGet],
    },
  {
      routePath: "/api/enter-code",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_enter_code_ts_onRequestPost],
    },
  {
      routePath: "/api/login",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_login_ts_onRequestPost],
    },
  {
      routePath: "/api/logout",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_logout_ts_onRequestPost],
    },
  {
      routePath: "/api/me",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_me_ts_onRequestGet],
    },
  {
      routePath: "/api/messages",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_messages_ts_onRequestGet],
    },
  {
      routePath: "/api/messages",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_messages_ts_onRequestPost],
    },
  {
      routePath: "/api/photos",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_photos_ts_onRequestGet],
    },
  {
      routePath: "/api/photos",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_photos_ts_onRequestPost],
    },
  {
      routePath: "/api/ping",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_ping_ts_onRequestGet],
    },
  {
      routePath: "/api/shifts",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_shifts_ts_onRequestGet],
    },
  {
      routePath: "/api/shifts",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_shifts_ts_onRequestPost],
    },
  {
      routePath: "/api/signup",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_signup_ts_onRequestPost],
    },
  ]