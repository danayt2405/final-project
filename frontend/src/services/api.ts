// API service layer for backend communication
import type { User, UserRole } from "../types";

const API_BASE_URL =
  typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL
    : "https://your-api-url.com/api";

// Mock mode - set to true to use mock data instead of real API calls
const USE_MOCK_DATA = true;

// Mock admin credentials
const MOCK_ADMIN_CREDENTIALS = {
  username: "admin",
  password: "admin123",
};

// Local storage keys
const STORAGE_KEYS = {
  USER: "complaint_system_user",
  TOKEN: "complaint_system_token",
};

/**
 * Get current authenticated user from localStorage
 */
export function getCurrentUser(): User | null {
  try {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * Check if user is super admin
 */
export function isSuperAdmin(): boolean {
  const user = getCurrentUser();
  return user?.role === "ADMIN";
}

/**
 * Login function - authenticates user and returns user data
 */
export async function login(username: string, password: string): Promise<User> {
  try {
    // Mock authentication
    if (USE_MOCK_DATA) {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (
        username === MOCK_ADMIN_CREDENTIALS.username &&
        password === MOCK_ADMIN_CREDENTIALS.password
      ) {
        const user: User = {
          id: "1",
          username: username,
          role: "ADMIN",
          token: "mock-token-" + Date.now(),
        };

        // Store user in localStorage
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        if (user.token) {
          localStorage.setItem(STORAGE_KEYS.TOKEN, user.token);
        }

        return user;
      } else {
        throw new Error("Invalid credentials");
      }
    }

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    const data = await response.json();
    const user: User = {
      id: data.id || data.userId,
      username: data.username,
      role: data.role || "ADMIN",
      token: data.token,
    };

    // Store user in localStorage
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    if (user.token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, user.token);
    }

    return user;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

/**
 * Logout function - clears user session
 */
export function logout(): void {
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.TOKEN);

  // Clear mock data too (important)
  localStorage.removeItem("mock_complaints");

  // Force logout redirect
  window.location.href = "/login";
}

/**
 * Get complaint types
 */
export async function getComplaintTypes(): Promise<any[]> {
  try {
    // Mock data
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return [
        { id: 1, name: "Cybercrime", nameAm: "የሳይበር ወንጀል" },
        { id: 2, name: "Data Breach", nameAm: "የመረጃ ጥሰት" },
        { id: 3, name: "Phishing", nameAm: "አስመሳይ መልእክት" },
        { id: 4, name: "Identity Theft", nameAm: "የማንነት ስርቆት" },
        { id: 5, name: "Network Security", nameAm: "የኔትወርክ ደህንነት" },
        { id: 6, name: "Other", nameAm: "ሌላ" },
      ];
    }

    const response = await fetch(`${API_BASE_URL}/complaint-types`);
    if (!response.ok) throw new Error("Failed to fetch complaint types");
    const data = await response.json();
    return Array.isArray(data) ? data : data.data || [];
  } catch (error) {
    console.error("Error fetching complaint types:", error);
    return [];
  }
}

/**
 * Submit a new complaint
 */
export async function submitComplaint(
  payload: any,
  voiceFiles: File[],
  otherFiles: File[]
): Promise<{ trackingNumber: string }> {
  try {
    // Mock submission
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const trackingNumber = "TRK-" + Date.now().toString().slice(-8);

      // Store in localStorage for tracking
      const complaints = JSON.parse(
        localStorage.getItem("mock_complaints") || "[]"
      );
      complaints.push({
        trackingNumber,
        ...payload,
        status: "Submitted",
        statusId: 1,
        submittedAt: new Date().toISOString(),
        voiceFilesCount: voiceFiles.length,
        filesCount: otherFiles.length,
      });
      localStorage.setItem("mock_complaints", JSON.stringify(complaints));

      return { trackingNumber };
    }

    const formData = new FormData();
    formData.append("data", JSON.stringify(payload));

    voiceFiles.forEach((file) => {
      formData.append("voiceFiles", file);
    });

    otherFiles.forEach((file) => {
      formData.append("files", file);
    });

    const response = await fetch(`${API_BASE_URL}/complaints`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to submit complaint");

    const data = await response.json();
    return { trackingNumber: data.trackingNumber || data.data?.trackingNumber };
  } catch (error) {
    console.error("Error submitting complaint:", error);
    throw error;
  }
}

/**
 * Track a complaint by tracking number
 */
export async function trackComplaint(trackingNumber: string): Promise<any> {
  try {
    // Mock tracking
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const complaints = JSON.parse(
        localStorage.getItem("mock_complaints") || "[]"
      );
      const complaint = complaints.find(
        (c: any) => c.trackingNumber === trackingNumber
      );

      if (!complaint) {
        throw new Error("Complaint not found");
      }

      return complaint;
    }

    const response = await fetch(
      `${API_BASE_URL}/complaints/track/${trackingNumber}`
    );
    if (!response.ok) throw new Error("Complaint not found");
    return await response.json();
  } catch (error) {
    console.error("Error tracking complaint:", error);
    throw error;
  }
}

/**
 * Upload additional evidence for a complaint
 */
export async function uploadEvidence(
  trackingNumber: string,
  files: File[]
): Promise<void> {
  try {
    // Mock upload
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      return;
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await fetch(
      `${API_BASE_URL}/complaints/${trackingNumber}/evidence`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) throw new Error("Failed to upload evidence");
  } catch (error) {
    console.error("Error uploading evidence:", error);
    throw error;
  }
}

/**
 * Add additional information to a complaint
 */
export async function addInfo(
  trackingNumber: string,
  info: string
): Promise<void> {
  try {
    // Mock add info
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return;
    }

    const response = await fetch(
      `${API_BASE_URL}/complaints/${trackingNumber}/info`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ additionalInfo: info }),
      }
    );

    if (!response.ok) throw new Error("Failed to add information");
  } catch (error) {
    console.error("Error adding information:", error);
    throw error;
  }
}

/**
 * Get all submitted complaints (Admin only)
 */
export async function getSubmittedComplaints(): Promise<any[]> {
  try {
    // Mock data
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Get complaints from localStorage
      const complaints = JSON.parse(
        localStorage.getItem("mock_complaints") || "[]"
      );

      // If no complaints, return sample data
      if (complaints.length === 0) {
        return [
          {
            trackingNumber: "TRK-12345678",
            complaintType: "Cybercrime",
            description: "Sample complaint for testing",
            status: "Under Review",
            statusId: 2,
            submittedAt: new Date(Date.now() - 86400000).toISOString(),
            fullName: "Test User",
            email: "test@example.com",
          },
          {
            trackingNumber: "TRK-87654321",
            complaintType: "Phishing",
            description: "Another sample complaint",
            status: "Resolved",
            statusId: 4,
            submittedAt: new Date(Date.now() - 172800000).toISOString(),
            fullName: "Demo User",
            email: "demo@example.com",
          },
        ];
      }

      return complaints;
    }

    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/complaints`, { headers });
    if (!response.ok) throw new Error("Failed to fetch complaints");

    const data = await response.json();
    return Array.isArray(data) ? data : data.data || [];
  } catch (error) {
    console.error("Error fetching complaints:", error);
    throw error;
  }
}

/**
 * Admin respond to a complaint
 */
export async function adminRespond(
  trackingNumber: string,
  statusId: number,
  responseText: string
): Promise<void> {
  try {
    // Mock respond
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Update complaint in localStorage
      const complaints = JSON.parse(
        localStorage.getItem("mock_complaints") || "[]"
      );
      const index = complaints.findIndex(
        (c: any) => c.trackingNumber === trackingNumber
      );

      if (index !== -1) {
        const statusMap: Record<number, string> = {
          1: "Submitted",
          2: "Under Review",
          3: "In Progress",
          4: "Resolved",
          5: "Closed",
        };

        complaints[index].statusId = statusId;
        complaints[index].status = statusMap[statusId] || "Unknown";
        complaints[index].adminResponse = responseText;
        complaints[index].respondedAt = new Date().toISOString();

        localStorage.setItem("mock_complaints", JSON.stringify(complaints));
      }

      return;
    }

    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(
      `${API_BASE_URL}/complaints/${trackingNumber}/respond`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ statusId, responseText }),
      }
    );

    if (!response.ok) throw new Error("Failed to respond");
  } catch (error) {
    console.error("Error responding to complaint:", error);
    throw error;
  }
}

/**
 * Get report summary by status (Admin only)
 */
export async function getReportSummaryByStatus(): Promise<
  Record<string, number>
> {
  try {
    // Mock data
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 400));

      const complaints = JSON.parse(
        localStorage.getItem("mock_complaints") || "[]"
      );

      if (complaints.length === 0) {
        return {
          Submitted: 5,
          "Under Review": 3,
          "In Progress": 2,
          Resolved: 8,
          Closed: 4,
        };
      }

      // Count by status
      const summary: Record<string, number> = {};
      complaints.forEach((c: any) => {
        const status = c.status || "Submitted";
        summary[status] = (summary[status] || 0) + 1;
      });

      return summary;
    }

    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/reports/summary`, {
      headers,
    });
    if (!response.ok) throw new Error("Failed to fetch report summary");

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error("Error fetching report summary:", error);
    return {};
  }
}

/**
 * Get department summary (Admin only)
 */
export async function getDepartmentSummary(): Promise<any[]> {
  try {
    // Mock data
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 400));

      return [
        { department: "Cyber Security", count: 12, avgResolutionTime: 3.5 },
        { department: "Data Protection", count: 8, avgResolutionTime: 2.8 },
        { department: "Network Security", count: 15, avgResolutionTime: 4.2 },
        { department: "Incident Response", count: 6, avgResolutionTime: 1.9 },
        { department: "Forensics", count: 4, avgResolutionTime: 5.1 },
      ];
    }

    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/reports/departments`, {
      headers,
    });
    if (!response.ok) throw new Error("Failed to fetch department summary");

    const data = await response.json();
    return Array.isArray(data) ? data : data.data || [];
  } catch (error) {
    console.error("Error fetching department summary:", error);
    return [];
  }
}
