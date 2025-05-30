"use client";

import * as React from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps {
  value: DateRange | undefined;
  onValueChange: (value: DateRange | undefined) => void;
  className?: string;
  align?: "start" | "center" | "end";
  locale?: string;
  placeholder?: string;
}

export function DateRangePicker({
  value,
  onValueChange,
  className,
  align = "start",
  locale = "ar",
  placeholder = "اختر الفترة",
}: DateRangePickerProps) {
  const localeObj = locale === "ar" ? ar : undefined;

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" />
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, "PPP", { locale: localeObj })} -{" "}
                  {format(value.to, "PPP", { locale: localeObj })}
                </>
              ) : (
                format(value.from, "PPP", { locale: localeObj })
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align}>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={value?.from}
            selected={value}
            onSelect={onValueChange}
            numberOfMonths={2}
            locale={localeObj}
            dir={locale === "ar" ? "rtl" : "ltr"}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}