// src/services/api.js
import axios from "axios";

/**
 * API client singleton
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:8080/api",
  timeout: 30_000, // 30s
});

/* -------------------------
   DEV logging
   ------------------------- */
const isDev =
  typeof process !== "undefined" &&
  process.env &&
  process.env.NODE_ENV === "development";
if (isDev) {
  console.log("[api] baseURL:", api.defaults.baseURL);
}

/* -------------------------
   Request interceptor - attach JWT
   ------------------------- */
// =========================================
// DEBUG outgoing request for submitted list
// =========================================
api.interceptors.request.use((config) => {
  try {
    if (config.url && config.url.includes("/complaints/submitted")) {
      console.log("[api.request] Submissions request:", {
        url: config.url,
        method: config.method,
        headers: config.headers,
      });
    }
  } catch (e) {
    console.warn(e);
  }

  return config;
});

api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("jwt");
      if (token) {
        config.headers = {
          ...(config.headers || {}),
          Authorization: `Bearer ${token}`,
        };
      }
    } catch (e) {
      // ignore localStorage errors in some environments
      if (isDev)
        console.warn("[api] failed to read token from localStorage", e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* -------------------------
   Optional: Response interceptor to auto-logout on 401
   (Uncomment if you'd like the app to clear session automatically)
   ------------------------- */
// api.interceptors.response.use(
//   (resp) => resp,
//   (err) => {
//     const status = err?.response?.status;
//     if (status === 401) {
//       // clear stored credentials so frontend behaves consistently
//       localStorage.removeItem("jwt");
//       localStorage.removeItem("user");
//       // optionally reload or navigate to login route here
//     }
//     return Promise.reject(err);
//   }
// );

/* -------------------------
   Helper: unify error messages
   ------------------------- */
function handleError(error) {
  // dump everything useful
  console.error(
    "[api.handleError] error.toJSON:",
    error?.toJSON ? error.toJSON() : error
  );
  if (error?.response) {
    console.error("[api.handleError] response.data:", error.response.data);
    console.error(
      "[api.handleError] status:",
      error.response.status,
      "headers:",
      error.response.headers
    );
  } else if (error.request) {
    console.error("[api.handleError] no response, request:", error.request);
  }
  // existing behavior
  if (error?.response) {
    const { status, data } = error.response;
    const msg =
      (data && (data.message || data.error || data.msg)) ||
      `Request failed with status ${status}`;
    const e = new Error(msg);
    e.status = status;
    e.response = error.response;
    throw e;
  }
  const e = new Error(error?.message || "Network error");
  throw e;
}

/* -------------------------
   Auth helpers
   ------------------------- */

/**
 * Normalize a raw role string (from backend) to either "admin" or "superadmin" or "user"
 * @param {string} raw
 * @returns {string}
 */
function normalizeRole(raw) {
  if (!raw) return "user";
  const r = String(raw).toLowerCase();

  // Map known admin variations → "admin"
  const adminAliases = [
    "admin",
    "adminac",
    "admin_sa",
    "adminhr",
    "admin-sa",
    "admin_ac",
  ];
  if (adminAliases.includes(r)) return "admin";

  // Map known superadmin variations → "superadmin"
  const superaliases = ["superadmin", "super_admin", "super-admin"];
  if (superaliases.includes(r)) return "superadmin";

  // fallback keep raw
  return r;
}

/**
 * Extract token from various possible fields returned by backend
 * @param {object} data
 * @returns {string|null}
 */
function extractTokenFromResponse(data) {
  if (!data) return null;
  return (
    data.token ||
    data.accessToken ||
    data.access_token ||
    data.jwt ||
    data.jwtToken ||
    data.access_token ||
    null
  );
}

/* -------------------------
   AUTH API
   ------------------------- */

/**
 * Perform login. Stores normalized user + jwt into localStorage.
 * Returns the backend payload (augmented with normalized role).
 * @param {string} username
 * @param {string} password
 */
export async function login(username, password) {
  try {
    const resp = await api.post("/auth/login", { username, password });
    const data = resp.data || {};

    // extract token with many fallbacks
    const token = extractTokenFromResponse(data);
    if (!token) {
      // helpful debug log — developer should inspect backend response
      if (isDev)
        console.error(
          "[api.login] login response did not include token:",
          data
        );
      throw new Error(
        "Login failed: authentication token not provided by server"
      );
    }

    // store token
    localStorage.setItem("jwt", token);

    // normalize a minimal user object and keep original data as `raw`
    const rawRole =
      data.role ||
      data.roles?.[0] ||
      data.userRole ||
      data.authorities?.[0] ||
      "";
    const role = normalizeRole(rawRole);

    const user = {
      username: data.username || data.userName || data.user || username,
      fullName: data.fullName || data.name || data.full_name || null,
      role,
      raw: data, // keep original response for debugging if needed
    };

    localStorage.setItem("user", JSON.stringify(user));

    if (isDev) console.log("[api.login] stored user", user);

    return user;
  } catch (err) {
    return handleError(err);
  }
}

/**
 * Clear auth storage
 */
export function logout() {
  try {
    localStorage.removeItem("jwt");
    localStorage.removeItem("user");
  } catch (e) {
    if (isDev) console.warn("[api.logout] could not clear localStorage", e);
  }
}
export async function getStatuses() {
  try {
    const resp = await api.get("/statuses");
    return resp.data;
  } catch (err) {
    return handleError(err);
  }
}

/**
 * Get current user object from localStorage
 */
export function getCurrentUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    if (isDev) console.warn("[api.getCurrentUser] parse error", e);
    return null;
  }
}

/**
 * Check if user is admin (normalized role)
 */
export function isAdmin() {
  const u = getCurrentUser();
  if (!u) return false;
  return u.role === "admin" || u.role === "admin"; // intentionally simple: "admin" is normalized
}

/**
 * Check if user is superadmin (normalized role)
 */
export function isSuperAdmin() {
  const u = getCurrentUser();
  if (!u) return false;
  return u.role === "superadmin";
}

/* -------------------------
   Generic API endpoints
   ------------------------- */

/* Complaint types */
export async function getComplaintTypes() {
  try {
    const resp = await api.get("/complaints/complaint-types");
    return resp.data;
  } catch (err) {
    return handleError(err);
  }
}

/* Submit complaint (supports with or without files) */
export async function submitComplaint(
  payload,
  voiceFiles = [],
  otherFiles = []
) {
  try {
    // If files exist we send FormData, else JSON body
    const hasFiles =
      (voiceFiles && voiceFiles.length) || (otherFiles && otherFiles.length);
    if (hasFiles) {
      const fd = new FormData();
      fd.append(
        "payload",
        new Blob([JSON.stringify(payload)], { type: "application/json" })
      );

      voiceFiles.forEach((f) => fd.append("voiceFiles", f));
      otherFiles.forEach((f) => fd.append("attachments", f));

      const resp = await api.post("/complaints/submit-with-files", fd, {
        headers: { "Content-Type": "multipart/form-data" }, // browser will set boundary automatically
      });
      return resp.data;
    } else {
      const resp = await api.post("/complaints/submit", payload);
      return resp.data;
    }
  } catch (err) {
    return handleError(err);
  }
}

/* Track complaint */
export async function trackComplaint(trackingNumber) {
  try {
    const resp = await api.get(
      `/complaints/${encodeURIComponent(trackingNumber)}`
    );
    return resp.data;
  } catch (err) {
    return handleError(err);
  }
}

/* Upload evidence files */
export async function uploadEvidence(trackingNumber, files = []) {
  try {
    const fd = new FormData();
    files.forEach((f) => fd.append("files", f));
    const resp = await api.post(
      `/complaints/${encodeURIComponent(trackingNumber)}/evidence`,
      fd,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return resp.data;
  } catch (err) {
    return handleError(err);
  }
}

/* Add textual info to complaint */
export async function addInfo(trackingNumber, info) {
  try {
    const resp = await api.post(
      `/complaints/${encodeURIComponent(trackingNumber)}/info`,
      { info }
    );
    return resp.data;
  } catch (err) {
    return handleError(err);
  }
}

/* Admin respond (status update + response text) */
export async function adminRespond(trackingNumber, statusId, response) {
  try {
    const resp = await api.put(
      `/complaints/${encodeURIComponent(trackingNumber)}/response`,
      {
        statusId,
        response,
      }
    );
    return resp.data;
  } catch (err) {
    return handleError(err);
  }
}

/* Submitted complaints for admin view */
export async function getSubmittedComplaints() {
  try {
    const resp = await api.get("/complaints/submitted");
    return resp.data;
  } catch (err) {
    return handleError(err);
  }
}

/* Export the axios instance for advanced use if needed */
export { api };
