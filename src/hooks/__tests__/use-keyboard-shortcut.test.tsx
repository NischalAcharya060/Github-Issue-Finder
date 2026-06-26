import { renderHook } from "@testing-library/react"
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut"

describe("useKeyboardShortcut", () => {
  it("calls handler when matching key is pressed", () => {
    const handler = jest.fn()
    renderHook(() => useKeyboardShortcut("Escape", handler))

    const event = new KeyboardEvent("keydown", { key: "Escape" })
    window.dispatchEvent(event)

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it("does not call handler for non-matching key", () => {
    const handler = jest.fn()
    renderHook(() => useKeyboardShortcut("Escape", handler))

    const event = new KeyboardEvent("keydown", { key: "Enter" })
    window.dispatchEvent(event)

    expect(handler).not.toHaveBeenCalled()
  })

  it("calls handler when metaKey is required and pressed", () => {
    const handler = jest.fn()
    renderHook(() => useKeyboardShortcut("k", handler, { metaKey: true }))

    const event = new KeyboardEvent("keydown", { key: "k", metaKey: true })
    window.dispatchEvent(event)

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it("does not call handler when metaKey required but not pressed", () => {
    const handler = jest.fn()
    renderHook(() => useKeyboardShortcut("k", handler, { metaKey: true }))

    const event = new KeyboardEvent("keydown", { key: "k" })
    window.dispatchEvent(event)

    expect(handler).not.toHaveBeenCalled()
  })

  it("removes listener on unmount", () => {
    const handler = jest.fn()
    const { unmount } = renderHook(() => useKeyboardShortcut("Escape", handler))

    unmount()

    const event = new KeyboardEvent("keydown", { key: "Escape" })
    window.dispatchEvent(event)

    expect(handler).not.toHaveBeenCalled()
  })
})
