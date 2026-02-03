import { useState } from "react"
import { Button } from "./button"
import { Input } from "./input"
import { Label } from "./label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover"
import { IconCalendar, IconX } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

interface DateRangeFilterProps {
  startDate: string
  endDate: string
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
  className?: string
}

export function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  className,
}: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false)

  const hasFilter = startDate || endDate

  const clearFilter = () => {
    onStartDateChange("")
    onEndDateChange("")
  }

  const formatDisplayDate = (date: string) => {
    if (!date) return ""
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const getDisplayText = () => {
    if (startDate && endDate) {
      return `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`
    }
    if (startDate) {
      return `Dari ${formatDisplayDate(startDate)}`
    }
    if (endDate) {
      return `Sampai ${formatDisplayDate(endDate)}`
    }
    return "Filter tanggal"
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal",
            !hasFilter && "text-muted-foreground",
            className
          )}
        >
          <IconCalendar className="mr-2 h-4 w-4" />
          <span className="truncate">{getDisplayText()}</span>
          {hasFilter && (
            <IconX
              className="ml-2 h-4 w-4 shrink-0 opacity-50 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation()
                clearFilter()
              }}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Filter Tanggal</h4>
            <p className="text-sm text-muted-foreground">
              Pilih rentang tanggal untuk memfilter dokumen
            </p>
          </div>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="start-date">Dari Tanggal</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                max={endDate || undefined}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="end-date">Sampai Tanggal</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                min={startDate || undefined}
              />
            </div>
          </div>
          <div className="flex justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilter}
              disabled={!hasFilter}
            >
              Reset
            </Button>
            <Button size="sm" onClick={() => setIsOpen(false)}>
              Terapkan
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
