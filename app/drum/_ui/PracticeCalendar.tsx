"use client";

import { useState } from "react";
import { DailyStats, generateCalendarData } from "../_lib/statsUtils";

type CalendarDay = {
  date: string;
  level: number;
  minutes: number;
  count: number;
};

type PracticeCalendarProps = {
  dailyStats: DailyStats[];
  weeks?: number;
  onDayClick?: (date: string) => void;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function PracticeCalendar({
  dailyStats,
  weeks = 12,
  onDayClick,
}: PracticeCalendarProps) {
  const [hoveredDay, setHoveredDay] = useState<CalendarDay | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const calendarData = generateCalendarData(dailyStats, weeks);

  // Group by weeks (columns)
  const weeksData: CalendarDay[][] = [];
  for (let i = 0; i < calendarData.length; i += 7) {
    weeksData.push(calendarData.slice(i, i + 7));
  }

  // Get month labels
  const monthLabels: { month: string; index: number }[] = [];
  let lastMonth = -1;
  calendarData.forEach((day, idx) => {
    const month = new Date(day.date).getMonth();
    if (month !== lastMonth) {
      monthLabels.push({ month: MONTHS[month], index: Math.floor(idx / 7) });
      lastMonth = month;
    }
  });

  function handleMouseEnter(day: CalendarDay, event: React.MouseEvent) {
    setHoveredDay(day);
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    });
  }

  function handleMouseLeave() {
    setHoveredDay(null);
  }

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <span className="calendar-title">Practice Activity</span>
        <div className="calendar-legend">
          <span className="calendar-legend-label">Less</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <span
              key={level}
              className={`calendar-legend-cell calendar-level-${level}`}
            />
          ))}
          <span className="calendar-legend-label">More</span>
        </div>
      </div>

      <div className="calendar-grid-wrapper">
        {/* Weekday labels */}
        <div className="calendar-weekdays">
          {WEEKDAYS.map((day, i) => (
            <span
              key={day}
              className="calendar-weekday"
              style={{ visibility: i % 2 === 1 ? "visible" : "hidden" }}
            >
              {day}
            </span>
          ))}
        </div>

        <div className="calendar-main">
          {/* Month labels */}
          <div className="calendar-months">
            {monthLabels.map(({ month, index }, i) => (
              <span
                key={`${month}-${i}`}
                className="calendar-month"
                style={{ gridColumn: index + 1 }}
              >
                {month}
              </span>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="calendar-grid">
            {weeksData.map((week, weekIdx) => (
              <div key={weekIdx} className="calendar-week">
                {week.map((day) => (
                  <button
                    key={day.date}
                    className={`calendar-cell calendar-level-${day.level}`}
                    onClick={() => day.count > 0 && onDayClick?.(day.date)}
                    onMouseEnter={(e) => handleMouseEnter(day, e)}
                    onMouseLeave={handleMouseLeave}
                    aria-label={`${formatDate(day.date)}: ${day.count} session${day.count !== 1 ? "s" : ""}, ${day.minutes} minutes`}
                    style={{ cursor: day.count > 0 ? "pointer" : "default" }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredDay && (
        <div
          className="calendar-tooltip"
          style={{
            position: "fixed",
            left: tooltipPos.x,
            top: tooltipPos.y,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="calendar-tooltip-date">{formatDate(hoveredDay.date)}</div>
          {hoveredDay.count > 0 ? (
            <div className="calendar-tooltip-stats">
              <span>{hoveredDay.count} session{hoveredDay.count !== 1 ? "s" : ""}</span>
              <span className="calendar-tooltip-sep">·</span>
              <span>{hoveredDay.minutes} min</span>
            </div>
          ) : (
            <div className="calendar-tooltip-stats">No practice</div>
          )}
        </div>
      )}
    </div>
  );
}
