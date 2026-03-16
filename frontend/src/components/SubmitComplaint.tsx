"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { VoiceRecorder } from "./VoiceRecorder";
import {
  CalendarIcon,
  Upload,
  X,
  CheckCircle,
  Copy,
  Check,
} from "lucide-react";
import { format } from "date-fns";
import { submitComplaint, getComplaintTypes } from "../services/api";
import { EthiopianCalendar } from "./EthiopianCalendar.tsx";
import {
  formatEthiopianDate,
  gregorianToEthiopian,
} from "../utils/ethiopianCalendar.ts";

type Language = "am" | "en";

const translations = {
  en: {
    title: "Submit Complaint",
    complaintDetails: "Complaint Details",
    complaintType: "Complaint Type",
    selectComplaintType: "Select complaint type",
    noComplaintTypes: "No complaint types found",
    executionStatus: "Execution Status",
    pickStatus: "Pick status",
    planned: "Planned",
    executed: "Executed",
    fullNameRequired: "Full Name",
    jobTitle: "Job Title",
    workDepartment: "Work Department",
    responsibleEntity: "Responsible Entity",
    additionalDetails: "Additional Details",
    damageLoss: "Damage/Loss",
    incidentLocation: "Incident Location",
    dateOfIncident: "Date of Incident",
    pickDate: "Pick date",
    evidence: "Evidence",
    attachFiles: "Attach Files",
    complainant: "Complainant",
    fullNameOptional: "Full Name",
    phone: "Phone",
    submitting: "Submitting...",
    submitComplaint: "Submit Complaint",
    trackingNumber: "Tracking Number",
    filesSelected: "files selected",
    complaintSubmitted: "Complaint Submitted Successfully!",
    tracking: "Tracking #",
    failedToSubmit: "Failed to submit",
    failedToLoadTypes: "Failed to load complaint types",
    position: "Position",
    department: "Department",
    fileRestrictions:
      "Accepted: PDF, PNG, JPG, MP4/WebM videos (Max 50MB each)",
    successMessage:
      "Your complaint has been submitted successfully. Please save this tracking number for future reference.",
    copyTracking: "Copy Tracking Number",
    copied: "Copied!",
    submitAnother: "Submit Another Complaint",

    // Validation messages (EN)
    val_required: "This field is required",
    val_string_only: "Only letters and spaces are allowed",
    val_number_only: "Only numbers are allowed",
    val_phone_invalid: "Phone must be exactly 10 digits",
    val_mixed_invalid:
      "Only letters, numbers and basic punctuation are allowed",
    val_select_required: "Please select an option",
  },
  am: {
    title: "ቅሬታ ያስገቡ",
    complaintDetails: "የቅሬታ ዝርዝሮች",
    complaintType: "የቅሬታ አይነት",
    selectComplaintType: "የቅሬታ አይነት ይምረጡ",
    noComplaintTypes: "ምንም የቅሬታ አይነቶች አልተገኙም",
    executionStatus: "የአፈፃፀም ሁኔታ",
    pickStatus: "ሁኔታ ይምረጡ",
    planned: "የታቀደ",
    executed: "የተፈፀመ",
    fullNameRequired: "የተጠያቂ አካል ሙሉ ስም",
    jobTitle: "የተጠያቂ አካል የስራ መደብ",
    workDepartment: "የተጠያቂ አካልየስራ ክፍል",
    responsibleEntity: "የተጠያቂ አካል ዝርዝር መረጃ",
    additionalDetails: "ተጨማሪ ዝርዝሮች",
    damageLoss: "ተጠያቂው አካል ያደረሰው ጉዳት/ኪሳራ",
    incidentLocation: "የክስተት ቦታ",
    dateOfIncident: "የክስተት ቀን",
    pickDate: "ቀን ይምረጡ",
    evidence: "ማስረጃ",
    attachFiles: "ፋይሎች ያያይዙ",
    complainant: "አቤቱታ አቅራቢ",
    fullNameOptional: "የአቤቱታ አቅራቢ አካል ሙሉ ስም",
    phone: "ስልክ",
    submitting: "በማስገባት ላይ...",
    submitComplaint: "ቅሬታ ያስገቡ",
    trackingNumber: "የክትትል ቁጥር",
    filesSelected: "ፋይሎች ተመርጠዋል",
    complaintSubmitted: "ቅሬታ በተሳካ ሁኔታ ገብቷል!",
    tracking: "የክትትል ቁጥር",
    failedToSubmit: "ማስገባት አልተሳካም",
    failedToLoadTypes: "የቅሬታ አይነቶችን መጫን አልተሳካም",
    position: "የስራ መደብ",
    department: "ክፍል",
    fileRestrictions:
      "ተቀብለው የፋይሎች: PDF, PNG, JPG, MP4/WebM የቪዲዮ ፋይሎች (እስከ 50MB የአንድ ፋይል)",
    successMessage: "ቅሬታዎ በተሳካ ሁኔታ ገብቷል። እባክዎ ይህን የክትትል ቁጥር ለወደፊት ማጣቀሻ ያስቀምጡ።",
    copyTracking: "የክትትል ቁጥር ቅዳ",
    copied: "ተቀድቷል!",
    submitAnother: "ሌላ ቅሬታ አስገባ",

    // Validation messages (AM)
    val_required: "ይህ መስክ አስፈላጊ ነው",
    val_string_only: "ይህ መስክ ፊደል ብቻ ይቀበላል",
    val_number_only: "ይህ መስክ ቁጥሮች ብቻ ይቀበላል",
    val_phone_invalid: "ስልክ ቁጥር 10 አሃዝ መሆን አለበት",
    val_mixed_invalid: "የተፈቀዱ ቁምፊ፣ ቁጥር እና ምልክቶች ብቻ",
    val_select_required: "እባክዎ አማራጭ ይምረጡ",
  },
};

export function SubmitComplaint({ language }: { language: Language }) {
  const t = translations[language];

  const [incidentDate, setIncidentDate] = useState<Date | undefined>();
  const [voiceFiles, setVoiceFiles] = useState<File[]>([]);
  const [otherFiles, setOtherFiles] = useState<File[]>([]);
  const [types, setTypes] = useState<{ id: number; name: string }[]>([]);
  const [typeId, setTypeId] = useState<number | null>(null);
  const [executionStatus, setExecutionStatus] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<string, string | null>>>(
    {}
  );

  const [submitAttempted, setSubmitAttempted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const hasDigit = (s: string) => /[0-9]/.test(s);
  const onlyDigits = (s: string) => /^[0-9]+$/.test(s);
  const mixedAllowed = (s: string) =>
    /^[A-Za-z0-9\u1200-\u137F\u0370-\u03FF0-9\s\.,\(\)\-_/\\:;'"%&]+$/.test(s);

  function validateField(field: string, value: string | null | undefined) {
    const v = value ?? "";
    switch (field) {
      case "typeId":
        if (!typeId) return t.val_select_required;
        return null;

      case "executionStatus":
        if (!executionStatus) return t.val_select_required;
        return null;

      case "fullName1":
      case "jobTitle1":
      case "workDept1":
        if (!v.trim()) return t.val_required;
        if (hasDigit(v)) return t.val_string_only;
        return null;

      case "phone":
        if (!v.trim()) return null; // optional
        if (!onlyDigits(v)) return t.val_number_only;
        if (v.length !== 10) return t.val_phone_invalid;
        return null;

      case "fullName2":
      case "complainantPosition":
      case "complainantDepartment":
        if (!v.trim()) return null; // optional
        if (hasDigit(v)) return t.val_string_only;
        return null;

      case "responsibleEntity":
      case "otherDetails":
        if (!v.trim()) return null; // optional
        if (!mixedAllowed(v)) return t.val_mixed_invalid;
        return null;

      case "damage":
      case "incidentLocation":
        if (!v.trim()) return t.val_required;
        if (!mixedAllowed(v)) return t.val_mixed_invalid;
        return null;

      case "incidentDate":
        if (!incidentDate) return t.val_required;
        return null;

      default:
        return null;
    }
  }

  function validateAll(): Record<string, string | null> {
    const newErrors: Record<string, string | null> = {};

    // Required fields
    newErrors["typeId"] = validateField("typeId", null);
    newErrors["executionStatus"] = validateField("executionStatus", null);
    newErrors["fullName1"] = validateField(
      "fullName1",
      (document.getElementById("fullName1") as HTMLInputElement)?.value
    );
    newErrors["jobTitle1"] = validateField(
      "jobTitle1",
      (document.getElementById("jobTitle1") as HTMLInputElement)?.value
    );
    newErrors["workDept1"] = validateField(
      "workDept1",
      (document.getElementById("workDept1") as HTMLInputElement)?.value
    );
    newErrors["damage"] = validateField(
      "damage",
      (document.getElementById("damage") as HTMLTextAreaElement)?.value
    );
    newErrors["incidentLocation"] = validateField(
      "incidentLocation",
      (document.getElementById("incidentLocation") as HTMLInputElement)?.value
    );
    newErrors["incidentDate"] = validateField("incidentDate", null);

    // Optional fields
    newErrors["responsibleEntity"] = validateField(
      "responsibleEntity",
      (document.getElementById("responsibleEntity") as HTMLTextAreaElement)
        ?.value
    );
    newErrors["otherDetails"] = validateField(
      "otherDetails",
      (document.getElementById("otherDetails") as HTMLTextAreaElement)?.value
    );
    newErrors["fullName2"] = validateField(
      "fullName2",
      (document.getElementById("fullName2") as HTMLInputElement)?.value
    );
    newErrors["phone"] = validateField(
      "phone",
      (document.getElementById("phone") as HTMLInputElement)?.value
    );
    newErrors["complainantPosition"] = validateField(
      "complainantPosition",
      (document.getElementById("complainantPosition") as HTMLInputElement)
        ?.value
    );
    newErrors["complainantDepartment"] = validateField(
      "complainantDepartment",
      (document.getElementById("complainantDepartment") as HTMLInputElement)
        ?.value
    );

    return newErrors;
  }

  useEffect(() => {
    async function loadTypes() {
      try {
        const res = await getComplaintTypes();
        const list = Array.isArray(res) ? res : res?.data || [];
        setTypes(list);
      } catch {}
    }
    loadTypes();
  }, []);

  useEffect(() => {
    // Re-validate all fields when language changes
    setErrors((prev) => {
      const newErrors: Record<string, string | null> = {};
      Object.keys(prev).forEach((key) => {
        newErrors[key] = validateField(
          key,
          (
            document.getElementById(key) as
              | HTMLInputElement
              | HTMLTextAreaElement
          )?.value
        );
      });
      return newErrors;
    });
  }, [language]);

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "voice" | "file"
  ) => {
    const files = e.target.files;
    if (!files) return;

    const list: File[] = Array.from(files);

    // File type validation
    const allowedTypes: Record<string, string[]> = {
      file: [
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/jpg",
        "video/mp4",
        "video/webm",
      ],
      voice: ["audio/webm", "audio/mp4", "audio/mpeg"],
    };

    // File size limit: 50MB for files, 5MB for voice
    const maxSize = type === "file" ? 50 * 1024 * 1024 : 5 * 1024 * 1024;

    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    list.forEach((file) => {
      const isValidType = allowedTypes[type].includes(file.type);
      const isValidSize = file.size <= maxSize;

      if (!isValidType) {
        invalidFiles.push(
          `${file.name}: Invalid file type. ${
            type === "file"
              ? "Only PDF, PNG, JPG, and MP4/WebM videos allowed."
              : "Invalid audio format."
          }`
        );
      } else if (!isValidSize) {
        invalidFiles.push(
          `${file.name}: File too large. Max ${
            type === "file" ? "50MB" : "5MB"
          }.`
        );
      } else {
        validFiles.push(file);
      }
    });

    if (invalidFiles.length > 0) {
      alert(invalidFiles.join("\n"));
    }

    if (validFiles.length > 0) {
      if (type === "voice") setVoiceFiles((p) => [...p, ...validFiles]);
      else setOtherFiles((p) => [...p, ...validFiles]);
    }

    e.target.value = "";
  };

  const handleChange = (field: string, value: string) => {
    setErrors((prev) => ({
      ...prev,
      [field]: validateField(field, value),
    }));
  };

  const removeFile = (index: number, type: "voice" | "other") => {
    if (type === "voice") {
      setVoiceFiles((prev) => prev.filter((_, i) => i !== index));
    } else {
      setOtherFiles((prev) => prev.filter((_, i) => i !== index));
    }
  };

  useEffect(() => {
    setErrors((prev) => ({ ...prev, typeId: validateField("typeId", null) }));
  }, [typeId]);

  useEffect(() => {
    setErrors((prev) => ({
      ...prev,
      executionStatus: validateField("executionStatus", null),
    }));
  }, [executionStatus]);

  useEffect(() => {
    setErrors((prev) => ({
      ...prev,
      incidentDate: validateField("incidentDate", null),
    }));
  }, [incidentDate]);

  const handleCopyTracking = () => {
    if (trackingNumber) {
      navigator.clipboard.writeText(trackingNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmitAnother = () => {
    setTrackingNumber(null);
    setTypeId(null);
    setExecutionStatus(null);
    setIncidentDate(undefined);
    setVoiceFiles([]);
    setOtherFiles([]);
    setSubmitAttempted(false);
    setErrors({});

    // Reset form inputs
    const form = document.querySelector("form");
    if (form) {
      (form as HTMLFormElement).reset();
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);

    const newErrors = validateAll();
    setErrors(newErrors);

    const firstErrorKey = Object.keys(newErrors).find((k) => newErrors[k]);
    if (firstErrorKey) return;

    const payload = {
      typeId,
      executionStatus,
      fullName: (document.getElementById("fullName1") as HTMLInputElement)
        ?.value,
      jobTitle: (document.getElementById("jobTitle1") as HTMLInputElement)
        ?.value,
      workDepartment: (document.getElementById("workDept1") as HTMLInputElement)
        ?.value,
      responsibleEntity: (
        document.getElementById("responsibleEntity") as HTMLTextAreaElement
      )?.value,
      additionalDetails: (
        document.getElementById("otherDetails") as HTMLTextAreaElement
      )?.value,
      damageLoss: (document.getElementById("damage") as HTMLTextAreaElement)
        ?.value,
      location: (
        document.getElementById("incidentLocation") as HTMLInputElement
      )?.value,
      dateOccurred: incidentDate
        ? incidentDate.toISOString().slice(0, 10)
        : null,
      complainant: {
        fullName: (document.getElementById("fullName2") as HTMLInputElement)
          ?.value,
        phone: (document.getElementById("phone") as HTMLInputElement)?.value,
        position: (
          document.getElementById("complainantPosition") as HTMLInputElement
        )?.value,
        department: (
          document.getElementById("complainantDepartment") as HTMLInputElement
        )?.value,
      },
    };

    try {
      setSubmitting(true);
      const res = await submitComplaint(payload, voiceFiles, otherFiles);
      setTrackingNumber(res.trackingNumber);
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field: string) =>
    `w-full ${errors[field] ? "border-red-500 focus:border-red-500" : ""}`;

  // Format date based on language
  const formatDateDisplay = (date: Date | undefined) => {
    if (!date) return t.pickDate;

    if (language === "am") {
      const ethDate = gregorianToEthiopian(date);
      return formatEthiopianDate(ethDate);
    } else {
      return format(date, "PPP");
    }
  };

  return (
    <motion.div>
      {/* Success Banner - Shows prominently at top */}
      <AnimatePresence>
        {trackingNumber && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="mb-8 p-6 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 shadow-xl"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>

              <div className="flex-1">
                <h3 className="text-green-900 mb-2">{t.complaintSubmitted}</h3>

                <p className="text-green-800 text-sm mb-4">
                  {t.successMessage}
                </p>

                <div className="bg-white rounded-lg p-4 border-2 border-green-300 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">
                        {t.trackingNumber}
                      </p>
                      <p className="text-2xl font-mono text-blue-700 tracking-wider">
                        {trackingNumber}
                      </p>
                    </div>

                    <Button
                      onClick={handleCopyTracking}
                      variant="outline"
                      size="sm"
                      className="ml-4"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          {t.copied}
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          {t.copyTracking}
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handleSubmitAnother}
                  variant="outline"
                  className="bg-white hover:bg-gray-50"
                >
                  {t.submitAnother}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <h2 className="mb-6 text-blue-900">{t.title}</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ----------------------------- COMPLAINT DETAILS ----------------------------- */}
        <Card>
          <CardHeader>
            <CardTitle>{t.complaintDetails}</CardTitle>
          </CardHeader>

          <CardContent>
            {/* Complaint Type */}
            <div className="space-y-2">
              <Label>{t.complaintType}</Label>
              <div className="flex items-center gap-2">
                <Select onValueChange={(v: string) => setTypeId(Number(v))}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.selectComplaintType} />
                  </SelectTrigger>
                  <SelectContent>
                    {types.length === 0 && (
                      <SelectItem value="none" disabled>
                        {t.noComplaintTypes}
                      </SelectItem>
                    )}
                    {types.map((type) => (
                      <SelectItem key={type.id} value={String(type.id)}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-red-600">*</span>
              </div>
              {submitAttempted && errors["typeId"] && (
                <div className="text-sm text-red-600 mt-1">
                  {errors["typeId"]}
                </div>
              )}
            </div>

            {/* Execution Status */}
            <div className="space-y-2 mt-5">
              <Label>{t.executionStatus}</Label>
              <div className="flex items-center gap-2">
                <Select onValueChange={(v: string) => setExecutionStatus(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.pickStatus} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Planned">{t.planned}</SelectItem>
                    <SelectItem value="Executed">{t.executed}</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-red-600">*</span>
              </div>
              {submitAttempted && errors["executionStatus"] && (
                <div className="text-sm text-red-600 mt-1">
                  {errors["executionStatus"]}
                </div>
              )}
            </div>

            {/* Name + Job + Work Dept */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="space-y-2">
                <Label>{t.fullNameRequired}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="fullName1"
                    className={inputClass("fullName1")}
                    onChange={(e) => handleChange("fullName1", e.target.value)}
                  />
                  <span className="text-red-600">*</span>
                </div>
                {errors["fullName1"] && (
                  <div className="text-sm text-red-600 mt-1">
                    {errors["fullName1"]}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>{t.jobTitle}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="jobTitle1"
                    className={inputClass("jobTitle1")}
                    onChange={(e) => handleChange("jobTitle1", e.target.value)}
                  />
                  <span className="text-red-600">*</span>
                </div>
                {errors["jobTitle1"] && (
                  <div className="text-sm text-red-600 mt-1">
                    {errors["jobTitle1"]}
                  </div>
                )}
              </div>

              <div className="space-y-2 col-span-2">
                <Label>{t.workDepartment}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="workDept1"
                    className={inputClass("workDept1")}
                    onChange={(e) => handleChange("workDept1", e.target.value)}
                  />
                  <span className="text-red-600">*</span>
                </div>
                {errors["workDept1"] && (
                  <div className="text-sm text-red-600 mt-1">
                    {errors["workDept1"]}
                  </div>
                )}
              </div>
            </div>

            {/* Responsible Entity */}
            <div className="space-y-2 mt-5">
              <Label>{t.responsibleEntity}</Label>
              <Textarea
                id="responsibleEntity"
                rows={3}
                className={inputClass("responsibleEntity")}
                onChange={(e) =>
                  handleChange("responsibleEntity", e.target.value)
                }
              />
              {errors["responsibleEntity"] && (
                <div className="text-sm text-red-600 mt-1">
                  {errors["responsibleEntity"]}
                </div>
              )}
            </div>

            {/* Additional Details */}
            <div className="space-y-2 mt-5">
              <Label>{t.additionalDetails}</Label>
              <Textarea
                id="otherDetails"
                rows={4}
                className={inputClass("otherDetails")}
                onChange={(e) => handleChange("otherDetails", e.target.value)}
              />
              {errors["otherDetails"] && (
                <div className="text-sm text-red-600 mt-1">
                  {errors["otherDetails"]}
                </div>
              )}
            </div>

            {/* Damage */}
            <div className="space-y-2 mt-5">
              <Label>{t.damageLoss}</Label>
              <div className="flex items-start gap-2">
                <Textarea
                  id="damage"
                  rows={3}
                  className={inputClass("damage")}
                  onChange={(e) => handleChange("damage", e.target.value)}
                />
                <span className="text-red-600">*</span>
              </div>
              {errors["damage"] && (
                <div className="text-sm text-red-600 mt-1">
                  {errors["damage"]}
                </div>
              )}
            </div>

            {/* Location + Date */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="space-y-2">
                <Label>{t.incidentLocation}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="incidentLocation"
                    className={inputClass("incidentLocation")}
                    onChange={(e) =>
                      handleChange("incidentLocation", e.target.value)
                    }
                  />
                  <span className="text-red-600">*</span>
                </div>
                {errors["incidentLocation"] && (
                  <div className="text-sm text-red-600 mt-1">
                    {errors["incidentLocation"]}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>{t.dateOfIncident}</Label>
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                        type="button"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        <span>{formatDateDisplay(incidentDate)}</span>
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-auto p-0" align="start">
                      {language === "am" ? (
                        <EthiopianCalendar
                          selected={incidentDate}
                          onSelect={(d: Date | undefined) => setIncidentDate(d)}
                        />
                      ) : (
                        <Calendar
                          mode="single"
                          selected={incidentDate}
                          onSelect={(d: Date | undefined) => setIncidentDate(d)}
                          disabled={(date: Date) => date > new Date()}
                        />
                      )}
                    </PopoverContent>
                  </Popover>
                  <span className="text-red-600">*</span>
                </div>
                {submitAttempted && errors["incidentDate"] && (
                  <div className="text-sm text-red-600 mt-1">
                    {errors["incidentDate"]}
                  </div>
                )}
              </div>
            </div>

            {/* File uploader */}
            <div className="space-y-3 mt-6">
              <Label>{t.evidence}</Label>

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                accept=".pdf,.png,.jpg,.jpeg,.mp4,.webm"
                onChange={(e) => handleFileSelect(e, "file")}
              />

              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2" /> {t.attachFiles}
              </Button>

              <p className="text-xs text-gray-600">{t.fileRestrictions}</p>

              <VoiceRecorder
                language={language}
                onRecordingComplete={(file: File) =>
                  setVoiceFiles((p) => [...p, file])
                }
              />
            </div>

            {/* File preview */}
            {[...voiceFiles, ...otherFiles].length > 0 && (
              <div className="mt-3 space-y-2">
                {[...voiceFiles, ...otherFiles].map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-gray-50 p-2 rounded"
                  >
                    <div>{file.name}</div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        removeFile(
                          idx,
                          file.type.startsWith("audio") ? "voice" : "other"
                        )
                      }
                    >
                      <X />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ----------------------------- COMPLAINANT SECTION ----------------------------- */}
        <Card>
          <CardHeader>
            <CardTitle>{t.complainant}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.fullNameOptional}</Label>
                <Input
                  id="fullName2"
                  className={inputClass("fullName2")}
                  onChange={(e) => handleChange("fullName2", e.target.value)}
                />
                {errors["fullName2"] && (
                  <div className="text-sm text-red-600 mt-1">
                    {errors["fullName2"]}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>{t.phone}</Label>
                <Input
                  id="phone"
                  type="tel"
                  className={inputClass("phone")}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
                {errors["phone"] && (
                  <div className="text-sm text-red-600 mt-1">
                    {errors["phone"]}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>{t.position}</Label>
                <Input
                  id="complainantPosition"
                  className={inputClass("complainantPosition")}
                  onChange={(e) =>
                    handleChange("complainantPosition", e.target.value)
                  }
                />
                {errors["complainantPosition"] && (
                  <div className="text-sm text-red-600 mt-1">
                    {errors["complainantPosition"]}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>{t.department}</Label>
                <Input
                  id="complainantDepartment"
                  className={inputClass("complainantDepartment")}
                  onChange={(e) =>
                    handleChange("complainantDepartment", e.target.value)
                  }
                />
                {errors["complainantDepartment"] && (
                  <div className="text-sm text-red-600 mt-1">
                    {errors["complainantDepartment"]}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full bg-blue-600"
          disabled={submitting}
        >
          {submitting ? t.submitting : t.submitComplaint}
        </Button>
      </form>
    </motion.div>
  );
}
