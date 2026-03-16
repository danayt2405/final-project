// Ethiopian Calendar utilities

export interface EthiopianDate {
  year: number;
  month: number;
  day: number;
}

// Correct Ethiopian epoch (JDN)
const ETH_EPOCH = 1724220;

const ETHIOPIAN_MONTHS = [
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

export function getEthiopianMonthName(month: number): string {
  return ETHIOPIAN_MONTHS[month - 1] ?? "";
}

export function getDaysInEthiopianMonth(month: number, year: number): number {
  if (month === 13) return isEthiopianLeapYear(year) ? 6 : 5;
  return 30;
}

export function isEthiopianLeapYear(year: number): boolean {
  return year % 4 === 3;
}

// ---------- GREGORIAN → ETH ----------
export function gregorianToEthiopian(gregorianDate: Date): EthiopianDate {
  const y = gregorianDate.getFullYear();
  const m = gregorianDate.getMonth() + 1;
  const d = gregorianDate.getDate();

  // Convert Gregorian → JDN
  let jdn = gregorianToJDN(y, m, d);

  // Correct the +1 day offset (ONLY this!)

  // Convert JDN → Ethiopian
  return jdnToEthiopian(jdn);
}

// ---------- ETH → GREGORIAN ----------
export function ethiopianToGregorian(eth: EthiopianDate): Date {
  const jdn = ethiopianToJDN(eth.year, eth.month, eth.day);
  return jdnToGregorian(jdn);
}

// Gregorian → JDN
function gregorianToJDN(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;

  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

// JDN → Gregorian
function jdnToGregorian(jdn: number): Date {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);

  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = 100 * b + d - 4800 + Math.floor(m / 10);

  return new Date(year, month - 1, day);
}

// ETH → JDN
function ethiopianToJDN(year: number, month: number, day: number): number {
  const daysBeforeYear = 365 * (year - 1) + Math.floor((year - 1) / 4);

  const daysBeforeMonth =
    30 * (month - 1) + (month === 13 ? (isEthiopianLeapYear(year) ? 6 : 5) : 0);

  return ETH_EPOCH + daysBeforeYear + daysBeforeMonth + day;
}

// JDN → ETH
function jdnToEthiopian(jdn: number): EthiopianDate {
  const r = jdn - ETH_EPOCH;
  const year = Math.floor(r / 1461) * 4 + Math.floor((r % 1461) / 365) + 1;
  const dayOfYear = (r % 1461) % 365;

  const month = Math.floor(dayOfYear / 30) + 1;
  const day = (dayOfYear % 30) + 1;

  return { year, month, day };
}

export function formatEthiopianDate(date: EthiopianDate): string {
  return `${getEthiopianMonthName(date.month)} ${date.day}, ${date.year}`;
}
