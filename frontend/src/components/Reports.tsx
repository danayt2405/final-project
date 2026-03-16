// Reports.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  LogOut,
  FileText,
  Lock as LockIcon,
  FileSpreadsheet,
  BarChart3,
  PieChart as PieChartIcon,
  Building2,
  ChevronDown,
  Printer,
  Calendar as CalendarIcon,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
} from "recharts";

import { toast } from "sonner@2.0.3";
import {
  login,
  logout,
  getCurrentUser,
  isSuperAdmin,
  api as axiosApi,
} from "../services/api";
import {
  getReportSummaryByStatusFilters,
  getDepartmentSummaryFilters,
} from "../services/ApiReport";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";

import EthiopianCalendarPicker from "./EthiopianCalendarPicker";

/* ------------------------- Constants / Types ------------------------- */
const ETHIOPIC_MONTHS_EN = [
  "Meskerem",
  "Tikimt",
  "Hidar",
  "Tahsas",
  "Tir",
  "Yekatit",
  "Megabit",
  "Miazia",
  "Ginbot",
  "Sene",
  "Hamle",
  "Nehase",
  "Pagume",
];

const ETHIOPIC_MONTHS_AM = [
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

type Language = "en" | "am";

export type StatusKey =
  | "submitted"
  | "in_review"
  | "investigating"
  | "resolved"
  | "rejected"
  | "closed";

export const STATUS_META: Record<
  StatusKey,
  { color: string; label_en: string; label_am: string }
> = {
  submitted: { color: "#0ea5e9", label_en: "Submitted", label_am: "የተላከ" },
  in_review: { color: "#f59e0b", label_en: "In Review", label_am: "በምርመራ" },
  investigating: {
    color: "#6366f1",
    label_en: "Investigating",
    label_am: "በመርመር ላይ",
  },
  resolved: { color: "#10b981", label_en: "Resolved", label_am: "ተፈታ" },
  rejected: { color: "#ef4444", label_en: "Rejected", label_am: "ተከለከለ" },
  closed: { color: "#6b7280", label_en: "Closed", label_am: "ተዘግቷል" },
};

/* ------------------------- Date Utilities ------------------------- */
function gregorianToJdn(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  const jdn =
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045;
  return jdn;
}

function jdnToEthiopic(jdn: number): {
  year: number;
  month: number;
  day: number;
} {
  const r = jdn - 1724220;
  const year = Math.floor((4 * r + 1463) / 1461);
  const month =
    Math.floor((r - 365 * (year - 1) - Math.floor((year - 1) / 4)) / 30) + 1;
  const day =
    r - 365 * (year - 1) - Math.floor((year - 1) / 4) - 30 * (month - 1) + 1;
  return { year, month, day };
}

/* ------------------------- Helper to safely unwrap responses ------------------------- */
function unwrapPossibleApiResponse<T>(resp: any): T | undefined {
  if (!resp) return undefined;
  // Most of your api.report helper functions return resp.data already.
  // Try common shapes safely.
  if (resp.data !== undefined) return resp.data as T;
  if (resp.payload !== undefined) return resp.payload as T;
  return resp as T;
}

/* ------------------------- Reports Component ------------------------- */
export default function Reports({
  initialLanguage = "en",
}: {
  initialLanguage?: Language;
}) {
  // auth + user (kept as in your last UI)
  const [user, setUser] = useState<any>(getCurrentUser());
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(Boolean(getCurrentUser()));

  // data
  const [statusSummary, setStatusSummary] = useState<Record<string, number>>(
    {}
  );
  const [deptSummary, setDeptSummary] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);

  // UI / filters
  const [view, setView] = useState<"bar" | "pie" | "table" | "compare">("bar");
  const statusKeys = Object.keys(STATUS_META) as StatusKey[];
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const rowsPerPage = 10;
  const [page, setPage] = useState(1);

  // language
  const [language, setLanguage] = useState<Language>(initialLanguage ?? "en");
  const superAdmin = isSuperAdmin();

  // date filters — ISO Gregorian strings returned by EthiopianCalendarPicker
  const [startDateIso, setStartDateIso] = useState<string>("");
  const [endDateIso, setEndDateIso] = useState<string>("");

  // calendar popups
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);

  // export/dropdown
  const [exportOpen, setExportOpen] = useState(false);

  useEffect(() => {
    if (loggedIn) {
      loadStatuses();
      loadReports();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedIn]);

  /* ------------------------- Load statuses (robust) ------------------------- */
  async function loadStatuses() {
    try {
      const resp = await axiosApi.get("/statuses");
      const list = unwrapPossibleApiResponse<any[]>(resp) ?? [];
      if (Array.isArray(list) && list.length) {
        setStatuses(list);
      } else {
        setStatuses(defaultStatuses());
      }
    } catch (err) {
      console.warn("Failed to load statuses", err);
      setStatuses(defaultStatuses());
    }
  }

  function defaultStatuses() {
    return [
      { id: 1, name: "submitted" },
      { id: 2, name: "in_review" },
      { id: 3, name: "investigating" },
      { id: 4, name: "resolved" },
      { id: 5, name: "rejected" },
      { id: 6, name: "closed" },
    ];
  }

  /* ------------------------- Build params (trim to avoid newline issues) ------------------------- */
  const buildParams = () => {
    const params: any = {};
    // Trim to remove stray whitespace/newlines that broke LocalDate parsing on backend
    const s = (startDateIso || "").toString().trim();
    const e = (endDateIso || "").toString().trim();
    if (s) params.startDate = s;
    if (e) params.endDate = e;
    if (activeStatusFilter && activeStatusFilter !== "all")
      params.status = String(activeStatusFilter).trim();
    return params;
  };

  /* ------------------------- Load reports (uses api.report helpers) ------------------------- */
  async function loadReports() {
    try {
      const params = buildParams();

      // NOTE: the helpers getReportSummaryByStatusFilters and getDepartmentSummaryFilters
      // accept an object { startDate, endDate, status } — pass params explicitly
      const [statusResp, deptResp] = await Promise.all([
        getReportSummaryByStatusFilters(params),
        getDepartmentSummaryFilters(params),
      ]);

      // unwrap safely (helpers usually return resp.data already)
      const statusObj =
        unwrapPossibleApiResponse<Record<string, number>>(statusResp) ?? {};
      const deptArr = unwrapPossibleApiResponse<any[]>(deptResp) ?? [];

      // set statusSummary with defensive defaults
      setStatusSummary({
        submitted: Number(statusObj.submitted ?? 0),
        in_review: Number(statusObj.in_review ?? 0),
        investigating: Number(statusObj.investigating ?? 0),
        resolved: Number(statusObj.resolved ?? 0),
        rejected: Number(statusObj.rejected ?? 0),
        closed: Number(statusObj.closed ?? 0),
      });

      // normalize dept data
      const departmentData = Array.isArray(deptArr) ? deptArr : [];
      const formattedDepartmentData = departmentData.map((item) => ({
        department: item.department ?? item.name ?? item.type ?? "Unknown",
        submitted: Number(item.submitted ?? 0),
        in_review: Number(item.in_review ?? 0),
        investigating: Number(item.investigating ?? 0),
        resolved: Number(item.resolved ?? 0),
        rejected: Number(item.rejected ?? 0),
        closed: Number(item.closed ?? 0),
        total: [
          item.submitted ?? 0,
          item.in_review ?? 0,
          item.investigating ?? 0,
          item.resolved ?? 0,
          item.rejected ?? 0,
          item.closed ?? 0,
        ].reduce((sum, current) => sum + Number(current || 0), 0),
      }));

      setDeptSummary(formattedDepartmentData);
    } catch (err: any) {
      console.error("[loadReports]", err);
      // If backend returns 400/500, show toast and log details for debugging
      toast.error(
        language === "am" ? "የሪፖርት መጫን አልተሳካም" : "Failed to load reports"
      );
    }
  }

  /* ------------------------- Auth (kept as you had it) ------------------------- */
  const handleLogout = () => {
    logout(); // clear localStorage

    setUser(null);
    setLoggedIn(false);
    setStatusSummary({});
    setDeptSummary([]);

    // 🔥 force redirect so the user sees the login page
    window.location.href = "/login";
  };

  /* ------------------------- Filtering & Pagination ------------------------- */
  const filteredDepts = useMemo(() => {
    const q = (searchTerm || "").trim().toLowerCase();
    let rows = deptSummary;
    if (activeStatusFilter !== "all") {
      rows = rows.filter((r) => (r[activeStatusFilter] ?? 0) > 0);
    }
    if (q)
      rows = rows.filter((r) => String(r.department).toLowerCase().includes(q));
    return rows;
  }, [deptSummary, activeStatusFilter, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredDepts.length / rowsPerPage));
  const currentPageRows = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredDepts.slice(start, start + rowsPerPage);
  }, [filteredDepts, page]);

  /* ------------------------- Chart data ------------------------- */
  type ChartDatum = { name: string; value: number; color?: string };
  const chartData = useMemo<ChartDatum[]>(() => {
    if (activeStatusFilter === "all") {
      return statusKeys.map((k) => ({
        name:
          language === "am" ? STATUS_META[k].label_am : STATUS_META[k].label_en,
        value: statusSummary[k] ?? 0,
        color: STATUS_META[k].color,
      }));
    }
    return deptSummary.map((d) => ({
      name: d.department,
      value: d[activeStatusFilter] ?? 0,
      color: STATUS_META[activeStatusFilter as StatusKey]?.color ?? "#8884d8",
    }));
  }, [statusSummary, deptSummary, activeStatusFilter, language]);

  /* ------------------------- Export / Print ------------------------- */
  const handlePrint = () => window.print();

  const handleExportPDF = async () => {
    const el = document.getElementById("report-area");
    if (!el) return toast.error("Report area not found");
    try {
      const prevW = el.style.width;
      const prevBg = el.style.background;
      el.style.width = "1200px";
      el.style.background = "#ffffff";
      await new Promise((r) => setTimeout(r, 80));
      const canvas = await html2canvas(el as HTMLElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#fff",
      });
      el.style.width = prevW;
      el.style.background = prevBg;
      const img = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const w = pdf.internal.pageSize.getWidth();
      const h = (canvas.height * w) / canvas.width;
      if (h <= pdf.internal.pageSize.getHeight()) {
        pdf.addImage(img, "PNG", 0, 0, w, h);
      } else {
        let position = 0;
        let remaining = h;
        while (remaining > 0) {
          pdf.addImage(img, "PNG", 0, -position, w, h);
          remaining -= pdf.internal.pageSize.getHeight();
          position += pdf.internal.pageSize.getHeight();
          if (remaining > 0) pdf.addPage();
        }
      }
      pdf.save(`reports_${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success(language === "am" ? "PDF ተፈጠረ" : "PDF exported");
    } catch (err) {
      console.error(err);
      toast.error(language === "am" ? "PDF መፍጠር አልተሳካም" : "Export failed");
    }
  };

  const handleExportExcel = () => {
    try {
      const summarySheet = XLSX.utils.json_to_sheet(
        statusKeys.map((k) => ({
          Status:
            language === "am"
              ? STATUS_META[k].label_am
              : STATUS_META[k].label_en,
          Count: statusSummary[k] ?? 0,
        }))
      );
      const deptSheet = XLSX.utils.json_to_sheet(deptSummary);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");
      XLSX.utils.book_append_sheet(wb, deptSheet, "Departments");
      XLSX.writeFile(
        wb,
        `reports_${new Date().toISOString().slice(0, 10)}.xlsx`
      );
      toast.success(language === "am" ? "Excel ተፈጠረ" : "Excel exported");
    } catch (err) {
      console.error(err);
      toast.error(language === "am" ? "Excel አልተሳካም" : "Export failed");
    }
  };

  /* ------------------------- Labels & Helpers ------------------------- */
  const labels = {
    title: { en: "Reports & Analytics", am: "ሪፖርቶች እና ትንተና" },
    print: { en: "Print", am: "አትም" },
    exportPdf: { en: "Export PDF", am: "PDF ያስቀምጡ" },
    exportExcel: { en: "Export Excel", am: "Excel ያስወጡ" },
    searchPlaceholder: { en: "Search department...", am: "የክፍል ፈልግ..." },
    departmentSummary: { en: "Department Summary", am: "የክፍሎች መግለጫ" },
    total: { en: "Total", am: "ጠቅላላ" },
    page: { en: "Page", am: "ገጽ" },
    from: { en: "From (Ethiopic)", am: "ከ (ኢትዮፒካዊ)" },
    to: { en: "To (Ethiopic)", am: "እስከ (ኢትዮፒካዊ)" },
    apply: { en: "Apply Filters", am: "መጠቀም" },
    clear: { en: "Clear", am: "አጥፋ" },
    selectDate: { en: "Select Date", am: "ቀን ምረጥ" },
  };

  const toggleLanguage = () => setLanguage((l) => (l === "en" ? "am" : "en"));

  const formatEthiopicDate = (isoDate?: string) => {
    if (!isoDate) return "";
    const [y, m, d] = isoDate.split("-").map(Number);
    if (!y || !m || !d) return isoDate;
    const jdn = gregorianToJdn(y, m, d);
    const e = jdnToEthiopic(jdn);
    const monthName =
      language === "am"
        ? ETHIOPIC_MONTHS_AM[e.month - 1]
        : ETHIOPIC_MONTHS_EN[e.month - 1];
    return `${e.day} ${monthName} ${e.year}`;
  };

  /* ------------------------- Render ------------------------- */
  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-blue-50">
        <Card className="max-w-md w-full shadow-lg">
          <CardHeader>
            <CardTitle>{labels.title[language]}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {language === "am" ? "ለመቀጠል ይግቡ" : "Sign in to continue"}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label>{language === "am" ? "የተጠቃሚ ስም" : "Username"}</Label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>{language === "am" ? "የይለፍ ቃል" : "Password"}</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                <LockIcon className="w-4 h-4 mr-2" />
                {language === "am" ? "ግባ" : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold">{labels.title[language]}</h1>
          <Button variant="outline" onClick={toggleLanguage}>
            {language === "am" ? "English" : "አማርኛ"}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4" /> {labels.print[language]}
          </Button>

          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setExportOpen((s) => !s)}
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />{" "}
              {language === "am" ? "ወስጥ ያድርጉ" : "Export"} <ChevronDown />
            </Button>
            {exportOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow z-40">
                <button
                  className="w-full text-left px-3 py-2 hover:bg-gray-100"
                  onClick={() => {
                    setExportOpen(false);
                    handleExportPDF();
                  }}
                >
                  PDF
                </button>
                <button
                  className="w-full text-left px-3 py-2 hover:bg-gray-100"
                  onClick={() => {
                    setExportOpen(false);
                    handleExportExcel();
                  }}
                >
                  Excel
                </button>
              </div>
            )}
          </div>

          <Button variant="destructive" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-1" />
            {language === "am" ? "ውጣ" : "Logout"}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            {language === "am" ? "ማጣሪያዎች" : "Filters"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Date Range Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2 mb-5">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">
                  {language === "am" ? "የቀን ክልል" : "Date Range"}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Start Date */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    {labels.from[language]}
                  </Label>
                  <div className="relative">
                    <Button
                      variant="outline"
                      className="w-full text-left justify-between h-11 bg-white hover:bg-gray-50 border-gray-300 shadow-sm"
                      onClick={() => {
                        setShowStartCalendar((s) => !s);
                        setShowEndCalendar(false);
                      }}
                    >
                      <span
                        className={
                          startDateIso ? "text-gray-900" : "text-gray-400"
                        }
                      >
                        {startDateIso
                          ? formatEthiopicDate(startDateIso)
                          : labels.selectDate[language]}
                      </span>
                      <CalendarIcon className="w-4 h-4 text-gray-400" />
                    </Button>

                    {showStartCalendar && (
                      <>
                        {/* Backdrop */}
                        <div
                          className="fixed inset-0 z-40 bg-black/20"
                          onClick={() => setShowStartCalendar(false)}
                        />

                        {/* Calendar Popup */}
                        <div className="absolute z-50 mt-2 left-0 shadow-2xl rounded-lg border border-gray-200 bg-white">
                          <EthiopianCalendarPicker
                            language={language}
                            selectedDate={startDateIso}
                            onSelect={(iso) => {
                              setStartDateIso((iso || "").toString().trim());
                              setShowStartCalendar(false);
                            }}
                            onClose={() => setShowStartCalendar(false)}
                          />
                        </div>
                      </>
                    )}
                  </div>
                  {startDateIso && (
                    <div className="text-xs text-gray-500 bg-white px-3 py-1.5 rounded border border-gray-200 inline-block">
                      <span className="font-medium">Gregorian:</span>{" "}
                      {startDateIso}
                    </div>
                  )}
                </div>

                {/* End Date */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    {labels.to[language]}
                  </Label>
                  <div className="relative">
                    <Button
                      variant="outline"
                      className="w-full text-left justify-between h-11 bg-white hover:bg-gray-50 border-gray-300 shadow-sm"
                      onClick={() => {
                        setShowEndCalendar((s) => !s);
                        setShowStartCalendar(false);
                      }}
                    >
                      <span
                        className={
                          endDateIso ? "text-gray-900" : "text-gray-400"
                        }
                      >
                        {endDateIso
                          ? formatEthiopicDate(endDateIso)
                          : labels.selectDate[language]}
                      </span>
                      <CalendarIcon className="w-4 h-4 text-gray-400" />
                    </Button>

                    {showEndCalendar && (
                      <>
                        {/* Backdrop */}
                        <div
                          className="fixed inset-0 z-40 bg-black/20"
                          onClick={() => setShowEndCalendar(false)}
                        />

                        {/* Calendar Popup */}
                        <div className="absolute z-50 mt-2 left-0 shadow-2xl rounded-lg border border-gray-200 bg-white">
                          <EthiopianCalendarPicker
                            language={language}
                            selectedDate={endDateIso}
                            onSelect={(iso) => {
                              setEndDateIso((iso || "").toString().trim());
                              setShowEndCalendar(false);
                            }}
                            onClose={() => setShowEndCalendar(false)}
                          />
                        </div>
                      </>
                    )}
                  </div>
                  {endDateIso && (
                    <div className="text-xs text-gray-500 bg-white px-3 py-1.5 rounded border border-gray-200 inline-block">
                      <span className="font-medium">Gregorian:</span>{" "}
                      {endDateIso}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Status and Actions Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-2 md:col-span-1">
                <Label className="text-sm font-medium text-gray-700">
                  {language === "am" ? "ሁኔታ" : "Status"}
                </Label>
                <select
                  value={activeStatusFilter}
                  onChange={(e) =>
                    setActiveStatusFilter(e.target.value || "all")
                  }
                  className="w-full h-11 border border-gray-300 rounded-md px-3 bg-white shadow-sm hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                >
                  <option value="all">
                    {language === "am" ? "ሁሉም" : "All"}
                  </option>
                  {statuses.map((s: any) => (
                    <option key={s.id ?? s.name} value={s.name ?? s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 md:col-span-2">
                <Button
                  onClick={() => {
                    setPage(1);
                    loadReports();
                  }}
                  className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all"
                >
                  {labels.apply[language]}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setStartDateIso("");
                    setEndDateIso("");
                    setActiveStatusFilter("all");
                    setPage(1);
                    loadReports();
                  }}
                  className="h-11 px-6 border-gray-300 hover:bg-gray-100"
                >
                  {labels.clear[language]}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Toggle */}
      <div className="flex gap-2 mb-6 print:hidden">
        <Button
          variant={view === "bar" ? "default" : "outline"}
          onClick={() => setView("bar")}
        >
          <BarChart3 className="w-4 h-4 mr-2" />{" "}
          {language === "am" ? "የአሞሌ ገበታ" : "Bar Chart"}
        </Button>
        <Button
          variant={view === "pie" ? "default" : "outline"}
          onClick={() => setView("pie")}
        >
          <PieChartIcon className="w-4 h-4 mr-2" />{" "}
          {language === "am" ? "የፓይ ገበታ" : "Pie Chart"}
        </Button>
        <Button
          variant={view === "table" ? "default" : "outline"}
          onClick={() => setView("table")}
        >
          <FileSpreadsheet className="w-4 h-4 mr-2" />{" "}
          {language === "am" ? "ሰንጠረዥ" : "Table"}
        </Button>
        {superAdmin && (
          <Button
            variant={view === "compare" ? "default" : "outline"}
            onClick={() => setView("compare")}
          >
            <Building2 className="w-4 h-4 mr-2" />{" "}
            {language === "am" ? "ማወዳደር" : "Compare"}
          </Button>
        )}
      </div>

      {/* Report area */}
      <div id="report-area" className="space-y-6">
        {/* charts */}
        {(view === "bar" || view === "pie") && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card>
              <CardHeader>
                <CardTitle>
                  {activeStatusFilter === "all"
                    ? language === "am"
                      ? "ሁኔታ ማጠቃለያ"
                      : "Status Summary"
                    : language === "am"
                    ? "የክፍል ስርጭት"
                    : "Department Distribution"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={380}>
                  {view === "bar" ? (
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value">
                        {chartData.map((c, i) => (
                          <Cell key={i} fill={c.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  ) : (
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={120}
                        label
                      >
                        {chartData.map((c, i) => (
                          <Cell key={i} fill={c.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  )}
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* table */}
        {view === "table" && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{labels.departmentSummary[language]}</CardTitle>
                <Input
                  placeholder={labels.searchPlaceholder[language]}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-xs"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        {language === "am" ? "የክፍል ስም" : "Department"}
                      </TableHead>
                      {statusKeys.map((k) => (
                        <TableHead key={k}>
                          {language === "am"
                            ? STATUS_META[k].label_am
                            : STATUS_META[k].label_en}
                        </TableHead>
                      ))}
                      <TableHead>{labels.total[language]}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentPageRows.map((r, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-semibold">
                          {r.department}
                        </TableCell>
                        {statusKeys.map((k) => (
                          <TableCell key={k} className="text-center">
                            <Badge
                              style={{ backgroundColor: STATUS_META[k].color }}
                              className="text-white"
                            >
                              {r[k] ?? 0}
                            </Badge>
                          </TableCell>
                        ))}
                        <TableCell className="text-center">
                          <Badge variant="outline">{r.total}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div>
                  {labels.page[language]} {page} / {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    {language === "am" ? "ቀዳሚ" : "Prev"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    {language === "am" ? "ቀጣይ" : "Next"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* compare (for superadmin) */}
        {view === "compare" && superAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>
                {language === "am" ? "የክፍሎች አቀማመጥ" : "Department Comparison"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={420}>
                <BarChart data={deptSummary}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {statusKeys.map((k) => (
                    <Bar
                      key={k}
                      dataKey={k}
                      name={
                        language === "am"
                          ? STATUS_META[k].label_am
                          : STATUS_META[k].label_en
                      }
                      fill={STATUS_META[k].color}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
