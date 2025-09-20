/// <reference types="@cloudflare/workers-types" />

export {}

declare global {
  // Bindings available to your _worker.ts via c.env
  interface Env {
    DB: D1Database
  }
}

