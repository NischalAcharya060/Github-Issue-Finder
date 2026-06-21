"use client"

import { useState, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns"

interface DatePickerPopoverProps {
  value: string
  onChange: (date: string) => void
  onClose: () => void
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function DatePickerPopover({ value, onChange, onClose }: DatePickerPopoverProps) {
  const selectedDate = value ? new Date(value + "T00:00:00") : null
  const [viewDate, setViewDate] = useState(selectedDate || new Date())

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(viewDate)),
    end: endOfWeek(endOfMonth(viewDate)),
  })

  const prevMonth = useCallback(() => setViewDate((d) => subMonths(d, 1)), [])
  const nextMonth = useCallback(() => setViewDate((d) => addMonths(d, 1)), [])

  const selectDay = (day: Date) => {
    onChange(format(day, "yyyy-MM-dd"))
    onClose()
  }

  return (
    <div className="w-64 p-3">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
        >
          <ChevronLeft className="size-3.5" />
        </button>
        <span className="text-xs font-semibold text-foreground">
          {format(viewDate, "MMMM yyyy")}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
        >
          <ChevronRight className="size-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] font-semibold text-muted-foreground mb-1">
        {DAY_NAMES.map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day) => {
          const inMonth = isSameMonth(day, viewDate)
          const selected = selectedDate && isSameDay(day, selectedDate)
          const today = isToday(day)

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => selectDay(day)}
              className={cn(
                "flex size-8 items-center justify-center rounded-lg text-xs transition-colors cursor-pointer",
                !inMonth && "text-muted-foreground/30",
                inMonth && !selected && "text-foreground hover:bg-muted",
                selected && "bg-primary text-primary-foreground font-semibold",
                today && !selected && "ring-1 ring-primary/40"
              )}
            >
              {format(day, "d")}
            </button>
          )
        })}
      </div>
    </div>
  )
}
