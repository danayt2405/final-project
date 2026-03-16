// components/ComplaintTracker.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { toast } from "sonner";
import type { Language } from '../types';
import {
  Search,
  Send,
  Mic,
  Upload,
  FileAudio,
  FileVideo,
  File,
  X,
} from "lucide-react";
import { trackComplaint, uploadEvidence, addInfo } from "../services/api";

type ApiWrapper<T> = { success?: boolean; data?: T; error?: any } | T;

// Constants for validation
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_AUDIO_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_RECORDING_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds
const ACCEPTED_FILE_TYPES = '.pdf,.png,.jpg,.jpeg,.mp4,.webm';
const ACCEPTED_AUDIO_TYPES = ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/mp3'];

export function ComplaintTracker({ language }: { language: Language }) {
  const [searchId, setSearchId] = useState("");
  const [result, setResult] = useState<any | null>(null);
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const recordingStartTimeRef = useRef<number | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);

  const t = {
    title: language === "am" ? "የጥቆማ ሂደት መከታተያ" : "Complaint Process Tracker",
    searchPlaceholder:
      language === "am"
        ? "የጥቆማ ምስጢር ቁጥር ያስገቡ"
        : "Enter your complaint reference number",
    searchBtn: language === "am" ? "ፈልግ" : "Search",
    addMoreInfo: language === "am" ? "ተጨማሪ መረጃ" : "Additional Information",
    sendBtn: language === "am" ? "ላክ" : "Send",
    uploadFiles:
      language === "am"
        ? "ፋይሎች ይስቀሉ (PDF, PNG, JPG, MP4/WebM - እስከ 50MB)"
        : "Upload Files (PDF, PNG, JPG, MP4/WebM - Max 50MB)",
    filesAdded: language === "am" ? "ፋይሎች ተጨምረዋል!" : "Files added!",
    infoSent:
      language === "am"
        ? "ተጨማሪ መረጃ በተሳካ ሁኔታ ተልኳል"
        : "Additional information sent successfully",
    recordingStarted:
      language === "am" ? "የድምጽ ቀረጻ ተጀምሯል" : "Voice recording started",
    recordingStopped: language === "am" ? "ቀረጻ ቆሟል" : "Recording stopped",
    recordingMaxTime: language === "am" ? "ከፍተኛው የቀረጻ ጊዜ 5 ደቂቃዎች ላይ ተደርሷል" : "Maximum recording time of 5 minutes reached",
    fileTooLarge: language === "am" ? "ፋይል ከ50MB በላይ ነው" : "File exceeds 50MB limit",
    audioTooLarge: language === "am" ? "የድምጽ ፋይል ከ5MB በላይ ነው" : "Audio file exceeds 5MB limit",
    invalidFileType: language === "am" ? "ልክ ያልሆነ የፋይል አይነት" : "Invalid file type",
    or: language === "am" ? "ወይም" : "or",
  };

  /** Utility: normalize backend wrapper {success,data,error} -> actual data object */
  function unwrapApi<T = any>(raw: ApiWrapper<T>): T | null {
    if (!raw) return null;
    // If wrapper shape: { success: bool, data: {...} }
    if (typeof raw === "object" && raw !== null && "success" in (raw as any)) {
      const wrapper = raw as any;
      return wrapper.data ?? null;
    }
    // If plain object returned (no wrapper)
    return (raw as any) ?? null;
  }

  const handleSearch = async () => {
    if (!searchId.trim()) {
      toast.error(language === "am" ? "እባክዎ ቁጥር ያስገቡ" : "Please enter tracking number");
      return;
    }
    try {
      const raw = await trackComplaint(searchId.trim());
      const data = unwrapApi(raw);
      if (!data) {
        // If backend returned no data inside wrapper
        toast.error(language === "am" ? "አልተገኘም" : "Complaint not found");
        setResult(null);
        return;
      }
      setResult(data);
    } catch (err: any) {
      console.error(err);
      if (err?.status === 404 || err?.response?.status === 404) {
        toast.error(language === "am" ? "አልተገኘም" : "Complaint not found");
        setResult(null);
      } else {
        toast.error(language === "am" ? "የፍለጋ ስህተት" : "Failed to fetch tracking");
      }
    }
  };

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`${file.name}: ${t.fileTooLarge}`);
      return false;
    }

    // Check file type
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
    const acceptedExts = ['.pdf', '.png', '.jpg', '.jpeg', '.mp4', '.webm'];
    if (!acceptedExts.includes(fileExt)) {
      toast.error(`${file.name}: ${t.invalidFileType}`);
      return false;
    }

    return true;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      const validFiles = fileArray.filter(validateFile);
      
      if (validFiles.length > 0) {
        setUploadedFiles((p) => [...p, ...validFiles]);
        toast.success(t.filesAdded);
      }
      
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((p) => p.filter((_, i) => i !== index));
  };

  // Recording helpers (keeps your previous flow)
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      audioChunksRef.current = [];
      recordingStartTimeRef.current = Date.now();
      setRecordingTime(0);

      mr.ondataavailable = (ev) => {
        if (ev.data.size > 0) audioChunksRef.current.push(ev.data);
      };

      mr.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        
        // Check audio file size
        if (blob.size > MAX_AUDIO_SIZE) {
          toast.error(t.audioTooLarge);
          stream.getTracks().forEach((t) => t.stop());
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          setRecordingTime(0);
          return;
        }

        const file: File = new window.File(
          [blob],
          `voice-${Date.now()}.webm`,
          { type: "audio/webm" }
        );

        // add to uploadedFiles so user can send voice as part of files
        setUploadedFiles((p) => [...p, file]);
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        stream.getTracks().forEach((t) => t.stop());
        toast.success(t.recordingStopped);
        
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setRecordingTime(0);
      };

      mr.start();
      setIsRecording(true);
      
      // Start timer to track recording duration
      timerRef.current = window.setInterval(() => {
        const elapsed = Date.now() - (recordingStartTimeRef.current || Date.now());
        setRecordingTime(elapsed);
        
        // Auto-stop at 5 minutes
        if (elapsed >= MAX_RECORDING_TIME) {
          stopRecording();
          toast.info(t.recordingMaxTime);
        }
      }, 100);
      
      toast.success(t.recordingStarted);
    } catch (err) {
      console.error(err);
      toast.error(language === "am" ? "አልተሳካም" : "Recording failed");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSendInfo = async () => {
    // Ensure we've got a searched complaint (result may be wrapper)
    const tracking = result?.trackingNumber;
    if (!tracking) {
      toast.error(language === "am" ? "እባክዎ አንድ ጥቆማ ይፈልጉ" : "Please search a complaint first");
      return;
    }
    if (!additionalInfo.trim() && uploadedFiles.length === 0) {
      toast.error(language === "am" ? "እባክዎ መረጃ ወይም ፋይሎች ያክሉ" : "Please add information or files");
      return;
    }

    try {
      if (uploadedFiles.length > 0) {
        await uploadEvidence(tracking, uploadedFiles);
      }
      if (additionalInfo.trim()) {
        await addInfo(tracking, additionalInfo.trim());
      }

      toast.success(t.infoSent);
      setAdditionalInfo("");
      setUploadedFiles([]);

      // reload to show updated additionalDetails / attachments / response
      await refetchTracking(tracking);
    } catch (err) {
      console.error(err);
      toast.error(language === "am" ? "አልተሳካም" : "Failed to send info");
    }
  };

  async function refetchTracking(trackingNumber: string) {
    try {
      const raw = await trackComplaint(trackingNumber);
      const data = unwrapApi(raw);
      setResult(data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    // cleanup audio URL if present
    return () => {
      if (audioURL) URL.revokeObjectURL(audioURL);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [audioURL]);

  /** Small helpers for display */
  const formatDate = (iso?: string | null) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch {
      return iso;
    }
  };

  const statusColor = (statusName?: string) => {
    if (!statusName) return "bg-gray-200 text-gray-800";
    const s = String(statusName).toLowerCase();
    if (s.includes("resolved") || s.includes("closed") || s.includes("complete") || s.includes("completed"))
      return "bg-green-100 text-green-800";
    if (s.includes("in_review") || s.includes("in-review") || s.includes("review"))
      return "bg-yellow-100 text-yellow-800";
    if (s.includes("rejected") || s.includes("reopen") || s.includes("re-open"))
      return "bg-red-100 text-red-800";
    return "bg-blue-100 text-blue-800";
  };

  // Format recording time display
  const formatRecordingTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h2 className="mb-6 text-blue-900">{t.title}</h2>

      <Card className="shadow-lg border-blue-100 mb-6">
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder={t.searchPlaceholder}
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSearch} className="bg-blue-600">
              <Search className="w-4 h-4 mr-2" />
              {t.searchBtn}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result ? (
        <Card className="shadow-lg border-blue-100">
          <CardHeader>
            <CardTitle>
              Tracking: {result.trackingNumber}{" "}
              {result.status?.name && (
                <span className={`ml-3 px-2 py-0.5 text-xs rounded ${statusColor(result.status.name)}`}>
                  {result.status?.name}
                </span>
              )}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <Card className="shadow-lg border-blue-100 mb-6">
              <CardHeader>
                <CardTitle>
                  Tracking: {result.trackingNumber}
                </CardTitle>
              </CardHeader>

              <CardContent>

                {/* CURRENT STATUS */}
                <div className="mb-6 p-3 bg-gray-50 rounded">
                  <h4 className="font-semibold">Current Status</h4>
                  <div className="text-lg font-medium mt-1">
                    {result.statusName ?? "N/A"}
                  </div>
                </div>

                {/* ADMIN RESPONSE */}
                <div className="p-3 bg-gray-50 rounded">
                  <h4 className="font-semibold">Admin Response</h4>

                  {result.responseText ? (
                    <div className="mt-2">
                      <p className="whitespace-pre-wrap">{result.responseText}</p>
                      {result.responseDate && (
                        <p className="text-xs mt-2 text-slate-500">
                          {new Date(result.responseDate).toLocaleString()}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="italic text-sm text-slate-500 mt-1">
                      No response given yet.
                    </p>
                  )}
                </div>

              </CardContent>
            </Card>

          

            {/* Add more info & upload */}
            <div className="mb-2">
              <h4 className="font-semibold">{t.addMoreInfo}</h4>
              <Input
                placeholder={language === "am" ? "አስገባ..." : "Enter details..."}
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
              />

              <div className="mt-3 flex gap-2">
                <input 
                  ref={fileInputRef} 
                  type="file" 
                  className="hidden" 
                  onChange={handleFileUpload} 
                  multiple 
                  accept={ACCEPTED_FILE_TYPES}
                />
                <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                  <Upload className="w-4 h-4 mr-2" /> {t.uploadFiles}
                </Button>

                <Button onClick={isRecording ? stopRecording : startRecording} variant="outline">
                  <Mic className="w-4 h-4 mr-2" /> 
                  {isRecording 
                    ? `${formatRecordingTime(recordingTime)} / 5:00` 
                    : (language === "am" ? "መቅረጽ" : "Record Voice")}
                </Button>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  {uploadedFiles.map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-white rounded">
                      <div className="flex items-center gap-3">
                        {f.type.startsWith("audio") ? <FileAudio /> : f.type.startsWith("video") ? <FileVideo /> : <File />}
                        <div>
                          <div className="text-sm truncate">{f.name}</div>
                          <div className="text-xs text-slate-500">{(f.size / 1024).toFixed(1)} KB</div>
                        </div>
                      </div>
                      <Button variant="ghost" onClick={() => removeFile(i)}><X /></Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4">
                <Button onClick={handleSendInfo} className="w-full bg-blue-600">
                  <Send className="w-4 h-4 mr-2" /> {t.sendBtn}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </motion.div>
  );
}
