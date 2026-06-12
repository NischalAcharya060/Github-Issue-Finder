import { renderHook, act } from "@testing-library/react"
import { useDebounce } from "@/hooks/use-debounce"

describe("useDebounce", () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("returns the initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("hello", 500))
    expect(result.current).toBe("hello")
  })

  it("updates after the delay", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: "hello" } }
    )

    rerender({ value: "world" })
    expect(result.current).toBe("hello")

    act(() => {
      jest.advanceTimersByTime(500)
    })

    expect(result.current).toBe("world")
  })
})
