// Type definitions for the application

export type Language = 'en' | 'am';
export type Theme = 'light' | 'dark';
export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  token?: string;
}

export interface ComplaintStatus {
  id: number;
  name: string;
}

export interface Complaint {
  id: string;
  trackingNumber: string;
  fullName: string;
  jobTitle: string;
  workDepartment: string;
  status: ComplaintStatus;
  typeName?: string;
  executionStatus?: string;
  damageLoss?: string;
  additionalDetails?: string;
  responsibleEntity?: string;
  location?: string;
  dateOccurred?: string;
  complainant?: {
    fullName?: string;
    phone?: string;
    position?: string;
    department?: string;
  };
  attachments?: Array<{
    fileName: string;
    fileType: string;
    fileSizeBytes: number;
  }>;
  responseText?: string;
  responseDate?: string;
}
