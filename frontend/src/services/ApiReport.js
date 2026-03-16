// src/services/api.report.js
// Clean, correct, fully synced with backend filters

import { api } from "./api";

/* ---------------------------------------------
   1. Summary By Status
   Supports: startDate, endDate, status
--------------------------------------------- */
export async function getReportSummaryByStatusFilters({
  startDate,
  endDate,
  status,
} = {}) {
  try {
    const params = {};

    // only add params if they're provided
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (status && status !== "all") params.status = status;

    const resp = await api.get("/admin/report/summary-by-status", { params });
    return resp?.data ?? resp;
  } catch (err) {
    console.error("[getReportSummaryByStatusFilters]", err);
    throw err;
  }
}

/* ---------------------------------------------
   2. Department Summary
   Supports: startDate, endDate, status (backend optional)
--------------------------------------------- */
export async function getDepartmentSummaryFilters({
  startDate,
  endDate,
  status,
} = {}) {
  try {
    const params = {};

    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (status && status !== "all") params.status = status;

    const resp = await api.get("/admin/report/department-summary", { params });
    return resp?.data ?? resp;
  } catch (err) {
    console.error("[getDepartmentSummaryFilters]", err);
    throw err;
  }
}
