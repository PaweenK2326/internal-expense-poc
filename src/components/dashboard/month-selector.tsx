"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

function getMonthDateFromQuery(searchParams: URLSearchParams): Date {
  const raw = searchParams.get("month");
  if (raw) {
    const [yearStr, monthStr] = raw.split("-");
    const parsedYear = Number(yearStr);
    const parsedMonth = Number(monthStr);

    if (
      Number.isFinite(parsedYear) &&
      Number.isFinite(parsedMonth) &&
      parsedMonth >= 1 &&
      parsedMonth <= 12
    ) {
      return new Date(parsedYear, parsedMonth - 1, 1);
    }
  }

  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export function MonthSelector() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const initialMonth = useMemo(
    () => getMonthDateFromQuery(new URLSearchParams(searchParams.toString())),
    [searchParams]
  );

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialMonth);
  const [viewYear, setViewYear] = useState(initialMonth.getFullYear());

  useEffect(() => {
    setSelectedDate(initialMonth);
    setViewYear(initialMonth.getFullYear());
  }, [initialMonth]);

  const handleSelect = (year: number, monthIndex0Based: number) => {
    const date = new Date(year, monthIndex0Based, 1);
    setSelectedDate(date);

    const month = String(monthIndex0Based + 1).padStart(2, "0");

    const params = new URLSearchParams(searchParams.toString());
    params.set("month", `${year}-${month}`);

    const queryString = params.toString();
    const url = queryString ? `${pathname}?${queryString}` : pathname;

    // Update URL and refetch server component with new search params
    router.push(url, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
      <Label className="text-sm text-muted-foreground">Month</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[220px] justify-start text-left text-sm font-normal",
              !selectedDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? format(selectedDate, "MMMM yyyy") : <span>Pick a month</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-3" align="end">
          <div className="flex items-center justify-between pb-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              type="button"
              onClick={() => setViewYear((year) => year - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">{viewYear}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              type="button"
              onClick={() => setViewYear((year) => year + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 12 }).map((_, index) => {
              const dateForMonth = new Date(viewYear, index, 1);
              const isSelected =
                selectedDate &&
                selectedDate.getFullYear() === viewYear &&
                selectedDate.getMonth() === index;

              return (
                <Button
                  key={index}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  className="h-8 px-2 text-xs"
                  onClick={() => handleSelect(viewYear, index)}
                >
                  {format(dateForMonth, "MMM")}
                </Button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

