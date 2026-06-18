import { PrismaClient } from "@prisma/client"
import { encrypt, decrypt } from "./crypto"

const globalForPrisma = globalThis as unknown as {
  prismaRaw: PrismaClient | undefined
}

const prismaRaw =
  globalForPrisma.prismaRaw ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prismaRaw = prismaRaw

export const prisma = prismaRaw.$extends({
  query: {
    account: {
      async create({ args, query }) {
        if (args.data.access_token) {
          args.data.access_token = encrypt(args.data.access_token)
        }
        if (args.data.refresh_token) {
          args.data.refresh_token = encrypt(args.data.refresh_token)
        }
        return query(args)
      },
      async update({ args, query }) {
        if (typeof args.data.access_token === "string") {
          args.data.access_token = encrypt(args.data.access_token)
        }
        if (typeof args.data.refresh_token === "string") {
          args.data.refresh_token = encrypt(args.data.refresh_token)
        }
        return query(args)
      },
      async findMany({ args, query }) {
        const results = await query(args)
        for (const account of results) {
          if (account.access_token) {
            try {
              account.access_token = decrypt(account.access_token)
            } catch {
              // Fail-safe: legacy plaintext token
            }
          }
          if (account.refresh_token) {
            try {
              account.refresh_token = decrypt(account.refresh_token)
            } catch {
              // Fail-safe
            }
          }
        }
        return results
      },
      async findUnique({ args, query }) {
        const account = await query(args)
        if (account) {
          if (account.access_token) {
            try {
              account.access_token = decrypt(account.access_token)
            } catch {
              // Fail-safe
            }
          }
          if (account.refresh_token) {
            try {
              account.refresh_token = decrypt(account.refresh_token)
            } catch {
              // Fail-safe
            }
          }
        }
        return account
      },
      async findFirst({ args, query }) {
        const account = await query(args)
        if (account) {
          if (account.access_token) {
            try {
              account.access_token = decrypt(account.access_token)
            } catch {
              // Fail-safe
            }
          }
          if (account.refresh_token) {
            try {
              account.refresh_token = decrypt(account.refresh_token)
            } catch {
              // Fail-safe
            }
          }
        }
        return account
      },
    },
  },
})

