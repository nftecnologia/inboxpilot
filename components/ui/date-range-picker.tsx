"use client"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"

interface DateRangePickerProps {
  className?: string
  date: DateRange | undefined
  onChange: (date: DateRange | undefined) => void
  locale?: any
}

export function DateRangePicker({ className, date, onChange, locale }: DateRangePickerProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Calendar
        initialFocus
        mode="range"
        defaultMonth={date?.from}
        selected={date}
        onSelect={onChange}
        numberOfMonths={2}
        locale={locale}
      />
    </div>
  )
}
