"use client";

import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  gregorianToEthiopian,
  ethiopianToGregorian,
  getEthiopianMonthName,
  getDaysInEthiopianMonth,
  type EthiopianDate,
} from "../utils/ethiopianCalendar";

interface EthiopianCalendarProps {
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
}

export function EthiopianCalendar({
  selected,
  onSelect,
}: EthiopianCalendarProps) {
  // Today EC
  const todayEth = gregorianToEthiopian(new Date());

  // Selected EC
  const selectedEth = selected ? gregorianToEthiopian(selected) : null;

  // Initial view: selected month or today's month
  const initialView: EthiopianDate = selectedEth
    ? { ...selectedEth }
    : { ...todayEth };

  const [viewDate, setViewDate] = useState<EthiopianDate>(initialView);

  useEffect(() => {
    if (selected) {
      const newSelected = gregorianToEthiopian(selected);
      if (
        newSelected.year !== viewDate.year ||
        newSelected.month !== viewDate.month
      ) {
        setViewDate(newSelected);
      }
    }
  }, [selected]);

  const weekDays = ["እሑድ", "ሰኞ", "ማክሰ", "ረቡዕ", "ሐሙስ", "ዓርብ", "ቅዳሜ"];

  const daysInMonth = getDaysInEthiopianMonth(viewDate.month, viewDate.year);

  // Compute weekday offset for the 1st day
  const firstDayGreg = ethiopianToGregorian({
    year: viewDate.year,
    month: viewDate.month,
    day: 1,
  });
  const startOffset = firstDayGreg.getDay(); // 0=Sun, 6=Sat

  const isSelected = (day: number) => {
    if (!selectedEth) return false;
    return (
      selectedEth.year === viewDate.year &&
      selectedEth.month === viewDate.month &&
      selectedEth.day === day
    );
  };

  const isToday = (day: number) => {
    return (
      todayEth.year === viewDate.year &&
      todayEth.month === viewDate.month &&
      todayEth.day === day
    );
  };

  const isFuture = (day: number) => {
    // First: if viewing a future year → block everything
    if (viewDate.year > todayEth.year) return true;

    // If viewing a future month in the same year → block all days
    if (viewDate.year === todayEth.year && viewDate.month > todayEth.month)
      return true;

    // If same month: block all days after today
    if (
      viewDate.year === todayEth.year &&
      viewDate.month === todayEth.month &&
      day > todayEth.day
    )
      return true;

    return false;
  };

  // Prevent navigating into future months
  const isNextMonthFuture = () => {
    const nextMonth = viewDate.month === 13 ? 1 : viewDate.month + 1;
    const nextYear = viewDate.month === 13 ? viewDate.year + 1 : viewDate.year;

    // Convert next Ethiopian month (day 1) → Gregorian
    const g = ethiopianToGregorian({
      year: nextYear,
      month: nextMonth,
      day: 1,
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    g.setHours(0, 0, 0, 0);

    return g.getTime() > today.getTime();
  };

  const handlePrev = () => {
    if (viewDate.month === 1)
      setViewDate({ year: viewDate.year - 1, month: 13, day: 1 });
    else setViewDate({ ...viewDate, month: viewDate.month - 1 });
  };

  const handleNext = () => {
    if (isNextMonthFuture()) return; // 🚫 Block moving into future

    if (viewDate.month === 13)
      setViewDate({ year: viewDate.year + 1, month: 1, day: 1 });
    else setViewDate({ ...viewDate, month: viewDate.month + 1 });
  };

  const handleClick = (day: number) => {
    if (isFuture(day)) return;
    const g = ethiopianToGregorian({
      year: viewDate.year,
      month: viewDate.month,
      day,
    });
    onSelect?.(g);
  };

  return (
    <div className="p-3 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          size="icon"
          variant="outline"
          onClick={handlePrev}
          type="button"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="text-center">
          <div className="font-semibold">
            {getEthiopianMonthName(viewDate.month)}
          </div>
          <div className="text-sm text-muted-foreground">{viewDate.year}</div>
        </div>

        <Button
          size="icon"
          variant="outline"
          onClick={handleNext}
          type="button"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 text-center mb-2">
        {weekDays.map((w, i) => (
          <div
            key={i}
            className="text-xs font-medium text-muted-foreground py-1"
          >
            {w}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`empty-${i}`} className="h-9" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const selectedFlag = isSelected(day);
          const todayFlag = isToday(day);
          const futureFlag = isFuture(day);

          const classes = [
            "h-9 w-9 mx-auto flex items-center justify-center rounded-md text-sm transition",
            futureFlag ? "opacity-30 cursor-not-allowed" : "hover:bg-gray-100",
            selectedFlag
              ? "bg-primary text-white"
              : todayFlag
              ? "border border-blue-500 text-blue-700 font-semibold"
              : "bg-transparent",
          ].join(" ");

          return (
            <button
              key={day}
              type="button"
              onClick={() => handleClick(day)}
              disabled={futureFlag}
              aria-current={todayFlag ? "date" : undefined}
              className={classes}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
