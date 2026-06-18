import { z } from "zod"

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),
  DIRECT_URL: z.string().url("DIRECT_URL must be a valid URL"),
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required"),
  AUTH_GITHUB_ID: z.string().min(1, "AUTH_GITHUB_ID is required"),
  AUTH_GITHUB_SECRET: z.string().min(1, "AUTH_GITHUB_SECRET is required"),
  UPSTASH_REDIS_REST_URL: z.string().url().optional().or(z.literal("")),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional().or(z.literal("")),
  ENCRYPTION_KEY: z.string().length(64, "ENCRYPTION_KEY must be a 64-character hex string").default("0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"),
})

const clientEnvSchema = z.object({
  NEXT_PUBLIC_GITHUB_TOKEN: z.string().optional().or(z.literal("")),
})

const isServer = typeof window === "undefined"

// Validated environment variables holder
let env: z.infer<typeof serverEnvSchema> & z.infer<typeof clientEnvSchema>

if (isServer) {
  const serverParsed = serverEnvSchema.safeParse(process.env)
  const clientParsed = clientEnvSchema.safeParse(process.env)

  if (!serverParsed.success) {
    console.error("❌ Invalid Server Environment Variables:", serverParsed.error.format())
    throw new Error("Invalid Server Environment Variables")
  }
  if (!clientParsed.success) {
    console.error("❌ Invalid Client Environment Variables:", clientParsed.error.format())
    throw new Error("Invalid Client Environment Variables")
  }

  env = { ...serverParsed.data, ...clientParsed.data }
} else {
  // Client-side execution: only validate and expose client-safe variables
  const clientParsed = clientEnvSchema.safeParse({
    NEXT_PUBLIC_GITHUB_TOKEN: process.env.NEXT_PUBLIC_GITHUB_TOKEN,
  })

  if (!clientParsed.success) {
    console.error("❌ Invalid Client Environment Variables:", clientParsed.error.format())
    throw new Error("Invalid Client Environment Variables")
  }

  env = {
    DATABASE_URL: "",
    DIRECT_URL: "",
    AUTH_SECRET: "",
    AUTH_GITHUB_ID: "",
    AUTH_GITHUB_SECRET: "",
    UPSTASH_REDIS_REST_URL: "",
    UPSTASH_REDIS_REST_TOKEN: "",
    ENCRYPTION_KEY: "",
    ...clientParsed.data,
  }
}

export { env }
