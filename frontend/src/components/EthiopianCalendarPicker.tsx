import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./EthiopianCalendarPicker.css";

// ----------------------
// Conversion Functions
// ----------------------
function ethiopicToJdn(y: number, m: number, d: number) {
  // Ethiopian calendar epoch adjusted for correct year calculation
  const jdn = Math.floor(
    1723856 + 365 + 365 * (y - 1) + Math.floor(y / 4) + 30 * (m - 1) + d - 1
  );
  return jdn;
}

function gregorianToJdn(y: number, m: number, d: number) {
  const a = Math.floor((14 - m) / 12);
  const y2 = y + 4800 - a;
  const m2 = m + 12 * a - 3;

  return (
    d +
    Math.floor((153 * m2 + 2) / 5) +
    365 * y2 +
    Math.floor(y2 / 4) -
    Math.floor(y2 / 100) +
    Math.floor(y2 / 400) -
    32045
  );
}

function jdnToGregorian(jdn: number) {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);

  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);

  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = 100 * b + d - 4800 + Math.floor(m / 10);

  return { year, month, day };
}

function jdnToEthiopic(jdn: number) {
  // Adjusted epoch to fix year offset
  const r = jdn - (1723856 + 365);
  const n = Math.floor(r / 1461);
  const b = r % 1461;

  const year = 4 * n + Math.floor(b / 365.25) + 1;

  const dayOfYear = b - Math.floor(Math.floor(b / 365.25) * 365.25);
  const month = Math.floor(dayOfYear / 30) + 1;
  const day = (dayOfYear % 30) + 1;

  return { year, month, day };
}

type Language = "en" | "am";

interface EthiopianCalendarProps {
  language?: Language;
  selectedDate?: string;
  onSelect: (iso: string) => void;
}

// --------------------------------------
// UPDATED COMPONENT (Gregorian + Ethiopian)
// --------------------------------------
export default function EthiopianCalendarPicker({
  language = "am",
  selectedDate,
  onSelect,
}: EthiopianCalendarProps) {
  const today = new Date();
  const todayIso = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // Handle initial date
  let initialYear: number;
  let initialMonth: number;

  if (selectedDate) {
    const [sy, sm, sd] = selectedDate.split("-").map(Number);
    const jdn = gregorianToJdn(sy, sm, sd);

    if (language === "am") {
      const eth = jdnToEthiopic(jdn);
      initialYear = eth.year;
      initialMonth = eth.month;
    } else {
      const g = jdnToGregorian(jdn);
      initialYear = g.year;
      initialMonth = g.month;
    }
  } else {
    const todayJdn = gregorianToJdn(
      today.getFullYear(),
      today.getMonth() + 1,
      today.getDate()
    );

    if (language === "am") {
      const tEth = jdnToEthiopic(todayJdn);
      initialYear = tEth.year;
      initialMonth = tEth.month;
    } else {
      initialYear = today.getFullYear();
      initialMonth = today.getMonth() + 1;
    }
  }

  const [currentYear, setCurrentYear] = useState(initialYear);
  const [currentMonth, setCurrentMonth] = useState(initialMonth);

  const ETH_MONTHS = [
    "መስከረም",
    "ጥቅምት",
    "ኅዳር",
    "ታኅሣሥ",
    "ጥር",
    "የካቲት",
    "መጋቢት",
    "ሚያዝያ",
    "ግንቦት",
    "ሰኔ",
    "ሐምሌ",
    "ነሐሴ",
    "ጳጉሜን",
  ];

  const EN_MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const DAYS = [
    { am: "እሁድ", en: "Sun" },
    { am: "ሰኞ", en: "Mon" },
    { am: "ማክሰ", en: "Tue" },
    { am: "ረቡዕ", en: "Wed" },
    { am: "ሐሙስ", en: "Thu" },
    { am: "አርብ", en: "Fri" },
    { am: "ቅዳሜ", en: "Sat" },
  ];

  // -----------------------
  // GET DAYS IN MONTH
  // -----------------------
  const daysInMonth =
    language === "am"
      ? currentMonth === 13
        ? 5
        : 30
      : new Date(currentYear, currentMonth, 0).getDate();

  // Get first weekday (0 = Sunday)
  let firstWeekday = 0;

  if (language === "am") {
    const firstJdn = ethiopicToJdn(currentYear, currentMonth, 1);
    firstWeekday = (firstJdn + 1) % 7;
  } else {
    firstWeekday = new Date(currentYear, currentMonth - 1, 1).getDay();
  }

  const cells = [];

  for (let i = 0; i < firstWeekday; i++) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    let gregIso = "";

    if (language === "am") {
      const jdn = ethiopicToJdn(currentYear, currentMonth, day);
      const g = jdnToGregorian(jdn);
      gregIso = `${g.year}-${String(g.month).padStart(2, "0")}-${String(
        g.day
      ).padStart(2, "0")}`;
    } else {
      gregIso = `${currentYear}-${String(currentMonth).padStart(
        2,
        "0"
      )}-${String(day).padStart(2, "0")}`;
    }

    cells.push({
      etDate: day,
      gregIso,
      isToday: gregIso === todayIso,
      isSelected: gregIso === selectedDate,
    });
  }

  while (cells.length % 7 !== 0) cells.push(null);

  const goPrev = () => {
    if (currentMonth === 1) {
      setCurrentMonth(language === "am" ? 13 : 12);
      setCurrentYear(currentYear - 1);
    } else setCurrentMonth(currentMonth - 1);
  };

  const goNext = () => {
    if (currentMonth === (language === "am" ? 13 : 12)) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else setCurrentMonth(currentMonth + 1);
  };

  return (
    <div className="calendar">
      {/* Header */}
      <div className="calendar-header">
        <button onClick={goPrev} className="calendar-button">
          <ChevronLeft />
        </button>

        <div className="text-center">
          <div className="calendar-month-title">
            {language === "am"
              ? ETH_MONTHS[currentMonth - 1]
              : EN_MONTHS[currentMonth - 1]}
          </div>
          <div className="calendar-year-title">{currentYear}</div>
        </div>

        <button onClick={goNext} className="calendar-button">
          <ChevronRight />
        </button>
      </div>

      {/* Day Names */}
      <div className="day-names">
        {DAYS.map((d, idx) => (
          <div key={idx} className="day-name">
            <div>{language === "am" ? d.am : d.en}</div>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="calendar-grid">
        {cells.map((c, i) =>
          !c ? (
            <div key={i} className="calendar-cell" />
          ) : (
            <button
              key={i}
              onClick={() => onSelect(c.gregIso)}
              className={`calendar-cell ${c.isToday ? "today" : ""} ${
                c.isSelected ? "selected" : ""
              }`}
            >
              {language === "am" ? c.etDate : Number(c.gregIso.split("-")[2])}
            </button>
          )
        )}
      </div>
    </div>
  );
}
