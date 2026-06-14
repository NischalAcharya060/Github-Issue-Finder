"use client"

import React, { useState } from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MarkdownProps {
  content: string
}

function InlineMarkdown({ text }: { text: string }) {
  // Safe parsing of bold, italic, inline code, and links
  const parts: React.ReactNode[] = []
  let currentIndex = 0

  // Combine regexes for links [text](url), bold **text**, italic *text*, inline code `code`
  const regex = /(\*\*|__)(.*?)\1|(\*|_)(.*?)\3|(`)(.*?)\5|\[(.*?)\]\((.*?)\)/g
  let match

  while ((match = regex.exec(text)) !== null) {
    const matchIndex = match.index

    // Push preceding text
    if (matchIndex > currentIndex) {
      parts.push(text.substring(currentIndex, matchIndex))
    }

    if (match[1]) {
      // Bold
      parts.push(<strong key={matchIndex} className="font-bold text-foreground">{match[2]}</strong>)
    } else if (match[3]) {
      // Italic
      parts.push(<em key={matchIndex} className="italic">{match[4]}</em>)
    } else if (match[5]) {
      // Inline code
      parts.push(
        <code
          key={matchIndex}
          className="font-mono bg-secondary/80 text-primary-foreground/90 dark:text-primary px-1.5 py-0.5 rounded text-xs ring-1 ring-border/30"
        >
          {match[6]}
        </code>
      )
    } else if (match[7]) {
      // Link
      const url = match[8]
      parts.push(
        <a
          key={matchIndex}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline font-medium break-all"
        >
          {match[7]}
        </a>
      )
    }

    currentIndex = regex.lastIndex
  }

  if (currentIndex < text.length) {
    parts.push(text.substring(currentIndex))
  }

  return <>{parts.length > 0 ? parts : text}</>
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy code: ", err)
    }
  }

  return (
    <div className="group relative my-3 overflow-hidden rounded-xl border border-border/80 bg-zinc-950 text-zinc-200">
      <div className="flex items-center justify-between bg-zinc-900/90 px-4 py-1.5 text-[10px] font-mono text-zinc-400">
        <span>{language || "code"}</span>
        <Button
          variant="ghost"
          size="xs"
          onClick={handleCopy}
          className="h-6 gap-1 bg-transparent hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
        >
          {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  )
}

export function Markdown({ content }: MarkdownProps) {
  if (!content) {
    return <p className="text-muted-foreground italic text-xs">No description provided.</p>
  }

  const lines = content.split(/\r?\n/)
  const elements: React.ReactNode[] = []

  let inCodeBlock = false
  let codeBlockLines: string[] = []
  let codeBlockLang = ""
  let listItems: string[] = []
  let listType: "bullet" | "ordered" | null = null

  const flushList = (key: number) => {
    if (listItems.length === 0) return
    if (listType === "bullet") {
      elements.push(
        <ul key={`list-${key}`} className="my-3 list-disc pl-6 space-y-1 text-sm text-foreground/90">
          {listItems.map((item, idx) => (
            <li key={idx}>
              <InlineMarkdown text={item} />
            </li>
          ))}
        </ul>
      )
    } else if (listType === "ordered") {
      elements.push(
        <ol key={`list-${key}`} className="my-3 list-decimal pl-6 space-y-1 text-sm text-foreground/90">
          {listItems.map((item, idx) => (
            <li key={idx}>
              <InlineMarkdown text={item} />
            </li>
          ))}
        </ol>
      )
    }
    listItems = []
    listType = null
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Handle Code Block
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        // End code block
        elements.push(
          <CodeBlock
            key={`code-${i}`}
            code={codeBlockLines.join("\n")}
            language={codeBlockLang}
          />
        )
        codeBlockLines = []
        inCodeBlock = false
      } else {
        // Start code block
        flushList(i)
        codeBlockLang = line.trim().slice(3).trim()
        inCodeBlock = true
      }
      continue
    }

    if (inCodeBlock) {
      codeBlockLines.push(line)
      continue
    }

    // Handle Headers
    if (line.startsWith("#")) {
      flushList(i)
      const headerMatch = line.match(/^(#{1,6})\s+(.*)$/)
      if (headerMatch) {
        const level = headerMatch[1].length
        const text = headerMatch[2]
        const headingClasses = [
          "",
          "text-2xl font-bold tracking-tight mt-6 mb-3 border-b border-border/40 pb-1.5",
          "text-xl font-bold mt-5 mb-2.5",
          "text-lg font-semibold mt-4 mb-2",
          "text-base font-semibold mt-3 mb-1.5",
          "text-sm font-semibold mt-3 mb-1.5",
          "text-xs font-semibold mt-2 mb-1",
        ]
        const className = headingClasses[level]
        const key = `h-${i}`
        
        if (level === 1) {
          elements.push(<h1 key={key} className={className}><InlineMarkdown text={text} /></h1>)
        } else if (level === 2) {
          elements.push(<h2 key={key} className={className}><InlineMarkdown text={text} /></h2>)
        } else if (level === 3) {
          elements.push(<h3 key={key} className={className}><InlineMarkdown text={text} /></h3>)
        } else if (level === 4) {
          elements.push(<h4 key={key} className={className}><InlineMarkdown text={text} /></h4>)
        } else if (level === 5) {
          elements.push(<h5 key={key} className={className}><InlineMarkdown text={text} /></h5>)
        } else {
          elements.push(<h6 key={key} className={className}><InlineMarkdown text={text} /></h6>)
        }
        continue;
      }
    }

    // Handle Blockquotes
    if (line.trim().startsWith(">")) {
      flushList(i)
      const quoteText = line.replace(/^\s*>\s*/, "")
      elements.push(
        <blockquote
          key={`quote-${i}`}
          className="my-3 border-l-4 border-primary/40 pl-4 italic text-muted-foreground bg-primary/5 py-1 px-2 rounded-r-lg"
        >
          <InlineMarkdown text={quoteText} />
        </blockquote>
      )
      continue
    }

    // Handle Bullet List Items
    const bulletMatch = line.match(/^\s*[-*+]\s+(.*)$/)
    if (bulletMatch) {
      if (listType !== "bullet") {
        flushList(i)
        listType = "bullet"
      }
      listItems.push(bulletMatch[1])
      continue
    }

    // Handle Ordered List Items
    const orderedMatch = line.match(/^\s*(\d+)\.\s+(.*)$/)
    if (orderedMatch) {
      if (listType !== "ordered") {
        flushList(i)
        listType = "ordered"
      }
      listItems.push(orderedMatch[2])
      continue
    }

    // Empty line separates blocks
    if (line.trim() === "") {
      flushList(i)
      continue
    }

    // If it's none of the above, it's a paragraph
    flushList(i)
    elements.push(
      <p key={`p-${i}`} className="my-2.5 text-sm leading-relaxed text-foreground/85">
        <InlineMarkdown text={line} />
      </p>
    )
  }

  // Flush remaining lists
  flushList(lines.length)

  return <div className="markdown-body select-text space-y-1">{elements}</div>
}
