"use client";

import type React from "react";
import { getStatuses } from "../services/api";
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/select";
import { Textarea } from "./ui/textarea";

import {
  login,
  logout,
  getCurrentUser,
  getSubmittedComplaints,
  adminRespond,
} from "../services/api";

import {
  Eye,
  LogOut,
  FileText,
  Video,
  ImageIcon,
  Music,
  Download,
  Shield,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import type { Language } from "../App";

/* --------------------------------------
   NOTE:
   - Login UI removed (page always shows complaints)
   - Kept getCurrentUser() and logout()
   - All other features preserved
---------------------------------------*/

export default function SubmittedComplaints({
  language,
}: {
  language: Language;
}) {
  /* --------------------------------------
     AUTH STATE (UI removed — assume page loads into table)
     We keep `user` from getCurrentUser() and keep logout functionality.
  --------------------------------------- */
  const [user, setUser] = useState<any>(getCurrentUser());
  // Page will render the complaints UI immediately (no login form).
  const isLoggedIn = true;

  const [statuses, setStatuses] = useState<any[]>([]);

  /* --------------------------------------
     COMPLAINT DATA
  --------------------------------------- */
  const [complaints, setComplaints] = useState<any[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<any | null>(null);
  const [responseText, setResponseText] = useState("");
  const [newStatusId, setNewStatusId] = useState<number | null>(null);
  const [viewedComplaints, setViewedComplaints] = useState<Set<number>>(
    new Set()
  );

  /* --------------------------------------
     CHECK FOR UNREAD UPDATES
  --------------------------------------- */
  const hasUnreadUpdates = (complaint: any): boolean => {
    const status = complaint.status?.name?.toLowerCase() || "";
    const isSubmitted = ["submitted", "summited", "new"].includes(status);

    if (isSubmitted) {
      return false;
    }

    const storageKey = `complaint_${complaint.id}_viewed`;
    const storedData = localStorage.getItem(storageKey);

    if (!storedData) {
      const hasAttachments = (complaint.attachments || []).length > 0;
      const hasDetails =
        complaint.additionalDetails && complaint.additionalDetails !== "—";
      return hasAttachments || hasDetails;
    }

    try {
      const stored = JSON.parse(storedData);
      const storedAttachmentIds = stored.attachmentIds || [];
      const currentAttachmentIds = (complaint.attachments || []).map(
        (att: any) => att.id
      );
      const hasNewAttachments = currentAttachmentIds.some(
        (id: any) => !storedAttachmentIds.includes(id)
      );

      const storedDetails = stored.additionalDetails || "";
      const currentDetails = complaint.additionalDetails || "";
      const detailsChanged = storedDetails !== currentDetails;

      return hasNewAttachments || detailsChanged;
    } catch {
      return false;
    }
  };

  const getUpdateDetails = (
    complaint: any
  ): { newAttachments: number; detailsUpdated: boolean } => {
    const storageKey = `complaint_${complaint.id}_viewed`;
    const storedData = localStorage.getItem(storageKey);

    if (!storedData) {
      return {
        newAttachments: (complaint.attachments || []).length,
        detailsUpdated: !!(
          complaint.additionalDetails && complaint.additionalDetails !== "—"
        ),
      };
    }

    try {
      const stored = JSON.parse(storedData);
      const storedAttachmentIds = stored.attachmentIds || [];
      const currentAttachmentIds = (complaint.attachments || []).map(
        (att: any) => att.id
      );
      const newAttachmentCount = currentAttachmentIds.filter(
        (id: any) => !storedAttachmentIds.includes(id)
      ).length;

      const storedDetails = stored.additionalDetails || "";
      const currentDetails = complaint.additionalDetails || "";

      return {
        newAttachments: newAttachmentCount,
        detailsUpdated: storedDetails !== currentDetails,
      };
    } catch {
      return { newAttachments: 0, detailsUpdated: false };
    }
  };

  /* --------------------------------------
     MARK COMPLAINT AS VIEWED
  --------------------------------------- */
  const markComplaintAsViewed = (complaint: any) => {
    const storageKey = `complaint_${complaint.id}_viewed`;
    const attachmentIds = (complaint.attachments || []).map(
      (att: any) => att.id
    );
    const viewedData = {
      attachmentIds,
      additionalDetails: complaint.additionalDetails || "",
      viewedAt: new Date().toISOString(),
    };
    localStorage.setItem(storageKey, JSON.stringify(viewedData));

    setViewedComplaints((prev) => new Set(prev).add(complaint.id));
  };

  /* --------------------------------------
     TEXT (LANG)
  --------------------------------------- */
  const t = {
    login: language === "am" ? "ግባ" : "Login",
    username: language === "am" ? "የተጠቃሚ ስም" : "Username",
    password: language === "am" ? "የይለፍ ቃል" : "Password",
    signIn: language === "am" ? "ግባ" : "Sign In",
    logout: language === "am" ? "ውጣ" : "Logout",
    complaintType: language === "am" ? "የቅሬታ አይነት" : "Complaint Type",

    submitted: language === "am" ? "የቀረቡ ጥቆማዎች" : "Submitted Complaints",

    no: language === "am" ? "ቁ." : "No.",
    fullName: language === "am" ? "የተጠያቂ አካል ሙሉ ስም" : "Full Name",
    jobTitle: language === "am" ? "የተጠያቂ አካል የስራ መደብ" : "Job Title",
    department: language === "am" ? "የተጠያቂ አካል የስራ ክፍል" : "Department",
    status: language === "am" ? "የቅሬታው ሁኔታ" : "Status",
    executionStatus: language === "am" ? "የአፈፃፀም ሁኔታ" : "Execution Status",
    damage: language === "am" ? "ተጠያቂው አካል ያደረሰው ጉዳት/ኪሳራ" : "Damage / Loss",
    additionalDetails: language === "am" ? "ተጨማሪ ዝርዝሮች" : "Additional Details",
    responsibleEntity:
      language === "am" ? "የተጠያቂ አካል ዝርዝር መረጃ" : "Responsible Entity",
    location: language === "am" ? "የክስተት ቦታ" : "Location",
    dateOccurred: language === "am" ? "የክስተት ቀን" : "Date Occurred",
    complainant: language === "am" ? "አቤቱታ አቅራቢ መረጃ" : "Complainant",
    actions: language === "am" ? "ዝርዝር መረጃ" : "Actions",

    viewDetails: language === "am" ? "ዝርዝር" : "Details",
    respond: language === "am" ? "መልስ ስጥ" : "Respond",
    writeResponse: language === "am" ? "መልስ ይጻፉ" : "Write Response",
    updateStatus: language === "am" ? "የቅሬታ ሁኔታ ቀይሩ" : "Update Status",
    save: language === "am" ? "አስቀምጥ" : "Save",
    cancel: language === "am" ? "ይቅር" : "Cancel",
    evidence: language === "am" ? "ማስረጃ" : "Attachments",
    adminPortal: language === "am" ? "የአስተዳዳሪ ፖርታል" : "Admin Portal",
  };

  /* --------------------------------------
     LOGOUT
  --------------------------------------- */
  const handleLogout = () => {
    logout();
    setUser(null);
    setComplaints([]);
    toast.success(language === "am" ? "ውጣ" : "Logged out");
  };

  /* --------------------------------------
     LOAD DATA AFTER MOUNT
  --------------------------------------- */
  async function loadStatusesHandler() {
    try {
      const res = await getStatuses();
      const list = Array.isArray(res?.data) ? res.data : res;
      setStatuses(list || []);
    } catch (err) {
      console.error("Failed to load statuses", err);
      toast.error("Failed to load statuses");
    }
  }

  async function loadComplaints() {
    try {
      const data = await getSubmittedComplaints();

      console.log("[v0] Loaded complaints:", data?.length || 0);

      if (!data) {
        setComplaints([]);
        return;
      }

      // Remove duplicate complaints caused by attachments JOIN
      const uniqueComplaints = Array.from(
        data
          .reduce((map: Map<number, any>, item: any) => {
            if (!map.has(item.id)) {
              map.set(item.id, item);
            }
            return map;
          }, new Map())
          .values()
      );

      console.log(
        "[v0] Unique complaints after filtering:",
        uniqueComplaints.length
      );

      // Check for updates & show toast notifications
      uniqueComplaints.forEach((complaint: any) => {
        const updates = getUpdateDetails(complaint);
        const hasUpdates = hasUnreadUpdates(complaint);

        if (hasUpdates) {
          console.log(`[v0] Complaint #${complaint.id} has updates:`, {
            newAttachments: updates.newAttachments,
            detailsUpdated: updates.detailsUpdated,
            trackingNumber: complaint.trackingNumber,
          });

          toast.info(`New update on complaint ${complaint.trackingNumber}`, {
            description: `${updates.newAttachments} new attachment${
              updates.newAttachments !== 1 ? "s" : ""
            }${updates.detailsUpdated ? " and updated details" : ""}`,
            duration: 30000,
          });
        }
      });

      setComplaints(uniqueComplaints);
    } catch (err) {
      console.error("Error loading complaints:", err);
      toast.error("Failed to load complaints");
    }
  }

  useEffect(() => {
    // Load statuses and complaints on mount (page always shows complaints)
    loadStatusesHandler();
    loadComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* --------------------------------------
     RESPONSE HANDLER
  --------------------------------------- */
  async function handleRespond() {
    if (!selectedComplaint || !newStatusId) {
      toast.error("Select status");
      return;
    }

    try {
      await adminRespond(
        selectedComplaint.trackingNumber,
        newStatusId,
        responseText
      );
      toast.success("Saved");
      setSelectedComplaint(null);
    } catch {
      toast.error("Failed");
    }
  }

  /* --------------------------------------
     MAIN TABLE VIEW (login removed)
  --------------------------------------- */
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
      <div className="p-6 max-w-[1600px] mx-auto">
        {/* HEADER BAR WITH LOGOUT */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl mb-2 text-blue-600">{t.submitted}</h1>
            <p className="text-sm text-muted-foreground">
              {language === "am"
                ? "ሁሉንም ቅሬታዎች ይከታተሉ እና ይመልሱ"
                : "Monitor and respond to all complaints"}
            </p>
          </div>

          <Button
            variant="outline"
            onClick={handleLogout}
            className="h-10 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-all shadow-sm bg-transparent"
          >
            <LogOut className="w-4 h-4 mr-2" /> {t.logout}
          </Button>
        </div>

        <Card className="shadow-xl border-0 overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="bg-blue-600 text-white pb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-xl">{t.submitted}</CardTitle>
                <p className="text-blue-100 text-sm mt-1">
                  {complaints.length}{" "}
                  {language === "am" ? "ቅሬታዎች" : "total complaints"}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-800 border-b-2 border-blue-100 hover:bg-slate-50">
                    <TableHead className="whitespace-nowrap">{t.no}</TableHead>
                    <TableHead className="whitespace-nowrap">
                      {t.fullName}
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      {t.complaintType}
                    </TableHead>

                    <TableHead className="whitespace-nowrap">
                      {t.jobTitle}
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      {t.department}
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      {t.status}
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      {t.executionStatus}
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      {t.damage}
                    </TableHead>

                    <TableHead className="whitespace-nowrap">
                      {t.responsibleEntity}
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      {t.location}
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      {t.dateOccurred}
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      {t.complainant}
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-center">
                      {t.actions}
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {complaints.map((c, i) => {
                    const isNew =
                      c.status?.name?.toLowerCase() === "submitted" ||
                      c.status?.name?.toLowerCase() === "summited" ||
                      c.status?.name?.toLowerCase() === "new";

                    return (
                      <TableRow
                        key={c.id}
                        className="hover:bg-blue-50/50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-100"
                      >
                        <TableCell className="font-mono text-muted-foreground">
                          {String(i + 1).padStart(2, "0")}
                        </TableCell>

                        <TableCell>{c.fullName}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-sm border border-blue-100">
                            <FileText className="w-3 h-3" />
                            {c.typeName || "—"}
                          </span>
                        </TableCell>

                        <TableCell className="text-sm text-muted-foreground">
                          {c.jobTitle}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {c.workDepartment}
                        </TableCell>

                        <TableCell className="text-sm text-muted-foreground">
                          {(() => {
                            const raw = c.status?.name || "";
                            const status = raw.trim().toLowerCase();

                            if (
                              ["submitted", "summited", "new"].includes(status)
                            ) {
                              return (
                                <span className="font-semibold text-blue-600">
                                  NEW
                                </span>
                              );
                            }

                            return raw || "—";
                          })()}
                        </TableCell>

                        <TableCell className="text-sm">
                          {c.executionStatus}
                        </TableCell>
                        <TableCell className="text-sm">
                          {c.damageLoss}
                        </TableCell>

                        <TableCell className="text-sm">
                          {c.responsibleEntity}
                        </TableCell>
                        <TableCell className="text-sm">{c.location}</TableCell>
                        <TableCell className="text-sm font-mono text-muted-foreground">
                          {c.dateOccurred}
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">
                              {c.complainant?.fullName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {c.complainant?.department}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {c.complainant?.position}
                            </div>
                            <div className="text-xs text-blue-600">
                              {c.complainant?.phone}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="text-center">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedComplaint(c);
                              // Mark as viewed when clicked
                              markComplaintAsViewed(c);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all relative"
                          >
                            <Eye className="w-4 h-4 ml-[-6px]" />

                            {(() => {
                              const hasUpdates = hasUnreadUpdates(c);
                              const isViewed = viewedComplaints.has(c.id);

                              console.log(
                                `[v0] Complaint ${c.id}: hasUpdates=${hasUpdates}, isViewed=${isViewed}`
                              );

                              if (hasUpdates && !isViewed) {
                                return (
                                  <span className="absolute top-1 right-[-10px] flex h-3 w-3 z-50">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600 border-2 border-white shadow-lg"></span>
                                  </span>
                                );
                              }
                              return null;
                            })()}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* -------------------------
          DETAILS DIALOG
      -------------------------- */}
      <Dialog
        open={!!selectedComplaint}
        onOpenChange={() => setSelectedComplaint(null)}
      >
        <DialogContent className="max-w-2xl border-0 shadow-2xl">
          <div className="absolute inset-0 bg-blue-500/5 rounded-lg pointer-events-none"></div>

          <DialogHeader className="relative">
            <DialogTitle className="text-2xl text-blue-600">
              {t.respond}
            </DialogTitle>
            <DialogDescription className="text-base">
              {t.writeResponse}
            </DialogDescription>
          </DialogHeader>

          {selectedComplaint && (
            <>
              <div className="space-y-3 pb-4 border-b">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold">{t.additionalDetails}</span>
                  </div>
                  {(() => {
                    const updates = getUpdateDetails(selectedComplaint);
                    if (
                      updates.detailsUpdated &&
                      !viewedComplaints.has(selectedComplaint.id)
                    ) {
                      return (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
                          <AlertCircle className="w-3 h-3" />
                          NEW UPDATE
                        </span>
                      );
                    }
                    return null;
                  })()}
                </div>

                <div className="space-y-2">
                  {(() => {
                    const details = selectedComplaint.additionalDetails || "—";
                    if (details === "—") {
                      return <p className="text-sm text-muted-foreground">—</p>;
                    }

                    const detailLines = details
                      .split("\n")
                      .filter((line: string) => line.trim());

                    return detailLines.map((line: string, idx: number) => (
                      <p
                        key={idx}
                        className="text-sm text-muted-foreground pl-4 border-l-2 border-blue-200"
                      >
                        {line.trim()}
                      </p>
                    ));
                  })()}
                </div>
              </div>

              <div className="space-y-6 relative">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 pb-2 border-b">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-semibold">{t.evidence}</span>
                    </div>
                    {(() => {
                      const updates = getUpdateDetails(selectedComplaint);
                      if (
                        updates.newAttachments > 0 &&
                        !viewedComplaints.has(selectedComplaint.id)
                      ) {
                        return (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
                            <FileText className="w-3 h-3" />
                            {updates.newAttachments} NEW
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </div>

                  <div className="space-y-2.5">
                    {(() => {
                      const storageKey = `complaint_${selectedComplaint.id}_viewed`;
                      const storedData = localStorage.getItem(storageKey);
                      let storedAttachmentIds: any[] = [];

                      if (storedData) {
                        try {
                          const stored = JSON.parse(storedData);
                          storedAttachmentIds = stored.attachmentIds || [];
                        } catch {
                          // ignore
                        }
                      }

                      return (selectedComplaint.attachments || []).map(
                        (file: any, idx: number) => {
                          const isNewAttachment = !storedAttachmentIds.includes(
                            file.id
                          );
                          const type = file.fileType;
                          const icon =
                            type === "voice" ? (
                              <Music className="w-5 h-5 text-purple-600" />
                            ) : type === "video" ? (
                              <Video className="w-5 h-5 text-red-600" />
                            ) : type === "image" ? (
                              <ImageIcon className="w-5 h-5 text-green-600" />
                            ) : (
                              <FileText className="w-5 h-5 text-blue-600" />
                            );

                          const bgColor =
                            type === "voice"
                              ? "bg-purple-50 border-purple-100"
                              : type === "video"
                              ? "bg-red-50 border-red-100"
                              : type === "image"
                              ? "bg-green-50 border-green-100"
                              : "bg-blue-50 border-blue-100";

                          return (
                            <div
                              key={idx}
                              className={`flex justify-between items-center p-3.5 ${bgColor} border rounded-lg hover:shadow-md transition-all relative ${
                                isNewAttachment &&
                                !viewedComplaints.has(selectedComplaint.id)
                                  ? "ring-2 ring-green-400 animate-pulse"
                                  : ""
                              }`}
                            >
                              {isNewAttachment &&
                                !viewedComplaints.has(selectedComplaint.id) && (
                                  <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg z-10">
                                    NEW
                                  </span>
                                )}
                              <div className="flex items-center gap-3">
                                <div className="flex-shrink-0">{icon}</div>
                                <div>
                                  <div className="text-sm">{file.fileName}</div>
                                  <small className="text-muted-foreground">
                                    {(file.fileSizeBytes / 1024 / 1024).toFixed(
                                      2
                                    )}{" "}
                                    MB
                                  </small>
                                </div>
                              </div>

                              <Button
                                variant="ghost"
                                size="sm"
                                className="hover:bg-white/50"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          );
                        }
                      );
                    })()}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">{t.writeResponse}</Label>
                  <Textarea
                    value={responseText}
                    rows={4}
                    onChange={(e) => setResponseText(e.target.value)}
                    className="resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    placeholder={
                      language === "am"
                        ? "የእርስዎን ምላሽ እዚህ ይጻፉ..."
                        : "Write your response here..."
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Update Status</Label>
                  <Select onValueChange={(v) => setNewStatusId(Number(v))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>

                    <SelectContent>
                      {statuses.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter className="gap-2 relative">
                <Button
                  variant="outline"
                  onClick={() => setSelectedComplaint(null)}
                  className="border-gray-200 hover:bg-gray-50"
                >
                  {t.cancel}
                </Button>
                <Button
                  onClick={handleRespond}
                  className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {t.save}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
