type LogLevel = "info" | "warn" | "error" | "debug"

function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const isProd = process.env.NODE_ENV === "production"
  const timestamp = new Date().toISOString()

  if (isProd) {
    // Structured JSON logging for cloud aggregators
    console.log(
      JSON.stringify({
        timestamp,
        level,
        message,
        ...meta,
      })
    )
  } else {
    // Development-friendly readable logs
    const colorMap = {
      info: "\x1b[32m", // Green
      warn: "\x1b[33m", // Yellow
      error: "\x1b[31m", // Red
      debug: "\x1b[35m", // Magenta
    }
    const color = colorMap[level] || "\x1b[37m"
    const reset = "\x1b[0m"

    console.log(
      `[${timestamp}] ${color}${level.toUpperCase()}${reset}: ${message}`,
      meta ? `\nMetadata: ${JSON.stringify(meta, null, 2)}` : ""
    )
  }
}

export const logger = {
  info: (msg: string, meta?: Record<string, unknown>) => log("info", msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => log("warn", msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => log("error", msg, meta),
  debug: (msg: string, meta?: Record<string, unknown>) => log("debug", msg, meta),
}
