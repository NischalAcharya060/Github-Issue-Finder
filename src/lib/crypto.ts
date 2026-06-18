import { createCipheriv, createDecipheriv, randomBytes } from "crypto"
import { env } from "./env"

const ALGORITHM = "aes-256-gcm"

// Resolves a 32-byte key buffer from the hex key config
function getKeyBuffer(): Buffer {
  const keyHex = env.ENCRYPTION_KEY || "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
  return Buffer.from(keyHex, "hex")
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Returns a combined string in format `ciphertext:iv:authTag` (all hex).
 */
export function encrypt(text: string): string {
  const key = getKeyBuffer()
  const iv = randomBytes(12) // GCM standard IV size is 12 bytes
  const cipher = createCipheriv(ALGORITHM, key, iv)
  
  let encrypted = cipher.update(text, "utf8", "hex")
  encrypted += cipher.final("hex")
  
  const authTag = cipher.getAuthTag().toString("hex")
  
  return `${encrypted}:${iv.toString("hex")}:${authTag}`
}

/**
 * Decrypt an encrypted string in the format `ciphertext:iv:authTag`.
 * Returns the original plaintext.
 */
export function decrypt(encryptedText: string): string {
  const parts = encryptedText.split(":")
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted text format. Expected ciphertext:iv:authTag")
  }
  
  const [ciphertext, ivHex, authTagHex] = parts
  const key = getKeyBuffer()
  const iv = Buffer.from(ivHex, "hex")
  const authTag = Buffer.from(authTagHex, "hex")
  
  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)
  
  let decrypted = decipher.update(ciphertext, "hex", "utf8")
  decrypted += decipher.final("utf8")
  
  return decrypted
}
