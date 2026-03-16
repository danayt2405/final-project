import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Mic,
  Square,
  Trash2,
  Upload,
  AlertCircle,
} from "lucide-react";
// ✅ Correct
import { toast } from "sonner";

import type { Language } from "../App";

interface VoiceRecorderProps {
  language: Language;
  onRecordingComplete: (file: File) => void;
}

export function VoiceRecorder({
  language,
  onRecordingComplete,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [hasMicrophone, setHasMicrophone] = useState(true);
  const [showPermissionHelp, setShowPermissionHelp] =
    useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Maximum recording duration: 5 minutes (300 seconds)
  const MAX_DURATION = 300;
  // Maximum file size: 5MB
  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  const t = {
    startRecording:
      language === "am" ? "ቀረጻ ጀምር" : "Start Recording",
    stopRecording:
      language === "am" ? "ቀረጻ አቁም" : "Stop Recording",
    recording: language === "am" ? "ቀረጻ ላይ..." : "Recording...",
    delete: language === "am" ? "ሰርዝ" : "Delete",
    save: language === "am" ? "አስቀምጥ" : "Save Recording",
    uploadAudio:
      language === "am" ? "የድምፅ ፋይል ይስቀሉ" : "Upload Audio File",
    maxDuration:
      language === "am" ? "ከፍተኛው 5 ደቂቃዎች" : "Max 5 minutes",
    micAccessDenied:
      language === "am"
        ? "የማይክሮፎን መዳረሻ ተከልክሏል። ፋይል ይስቀሉ።"
        : "Microphone not available. Please upload an audio file.",
    recordingStarted:
      language === "am"
        ? "የድምፅ ቀረጻ ተጀምሯል"
        : "Voice recording started",
    recordingStopped:
      language === "am" ? "ቀረጻ ቆሟል" : "Recording stopped",
    recordingMaxReached:
      language === "am"
        ? "ቀረጻ ቆሟል - ከፍተኛ ጊዜ ደርሷል"
        : "Recording stopped - Max duration reached",
    recordingSaved:
      language === "am"
        ? "ድምጽ ተቀርጿል እና ታስቀምጧል!"
        : "Voice recording saved!",
    audioFileAdded:
      language === "am"
        ? "የድምፅ ፋይል ተጨምሯል!"
        : "Audio file added!",
    fileTooLarge:
      language === "am"
        ? "ፋይሉ በጣም ትልቅ ነው። ከፍተኛው 5MB"
        : "File too large. Max 5MB",
    invalidFileType:
      language === "am"
        ? "እባክዎ የድምፅ ፋይል ይምረጡ (WebM, MP4, MP3)"
        : "Please select an audio file (WebM, MP4, MP3)",
    browserNotSupported:
      language === "am"
        ? "ብራውዘርዎ ቀረጻን አይደግፍም"
        : "Your browser does not support audio recording",
    permissionHelp:
      language === "am" ? "ድምጽ ለመቅረጽ፡" : "To record audio:",
    permissionStep1:
      language === "am"
        ? '• "ቀረጻ ጀምር" ይጫኑ እና የማይክሮፎን ፈቃድ ይስጡ'
        : '• Click "Start Recording" and allow microphone access',
    permissionStep2:
      language === "am"
        ? "• ካገዱት፣ በአሳሹ አድራሻ አሞሌ ላይ የመቆለፊያ አዶን ይጫኑ"
        : "• If blocked, click the lock icon in your browser's address bar",
    permissionStep3:
      language === "am"
        ? '• "ፍቀድ" ይምረጡ እና እንደገና ይሞክሩ'
        : '• Select "Allow" and try again',
    retry: language === "am" ? "እንደገና ይሞክሩ" : "Try Again",
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startRecording = async () => {
    try {
      // Check if browser supports MediaRecorder
      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        setHasMicrophone(false);
        toast.info(t.micAccessDenied);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      streamRef.current = stream;

      // Use the best available codec
      const options = { mimeType: "audio/webm;codecs=opus" };
      let mediaRecorder: MediaRecorder;

      if (MediaRecorder.isTypeSupported(options.mimeType)) {
        mediaRecorder = new MediaRecorder(stream, options);
      } else {
        mediaRecorder = new MediaRecorder(stream);
      }

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType,
        });

        // Check file size
        if (audioBlob.size > MAX_FILE_SIZE) {
          toast.error(t.fileTooLarge);
          // Stop all tracks to release microphone
          if (streamRef.current) {
            streamRef.current
              .getTracks()
              .forEach((track) => track.stop());
            streamRef.current = null;
          }
          return;
        }

        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);

        // Stop all tracks to release microphone
        if (streamRef.current) {
          streamRef.current
            .getTracks()
            .forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setShowPermissionHelp(false);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1;

          // Stop recording when max duration is reached
          if (newTime >= MAX_DURATION) {
            stopRecording();
            toast.info(t.recordingMaxReached);
            return MAX_DURATION;
          }

          return newTime;
        });
      }, 1000);

      toast.success(t.recordingStarted);
    } catch (error: any) {
      // Handle permission denial gracefully
      setHasMicrophone(false);
      setShowPermissionHelp(true);

      if (
        error.name === "NotAllowedError" ||
        error.name === "PermissionDeniedError"
      ) {
        toast.info(t.micAccessDenied);
      } else if (
        error.name === "NotFoundError" ||
        error.name === "DevicesNotFoundError"
      ) {
        toast.info(t.micAccessDenied);
      } else {
        toast.info(t.micAccessDenied);
      }
    }
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error(t.fileTooLarge);
        return;
      }

      // Check if it's a valid audio file (WebM, MP4, MP3 only)
      const validTypes = [
        "audio/webm",
        "audio/mp4",
        "audio/mpeg",
        "audio/mp3",
      ];
      if (!validTypes.includes(file.type)) {
        toast.error(t.invalidFileType);
        return;
      }

      const url = URL.createObjectURL(file);
      setAudioURL(url);

      // Calculate duration (approximate)
      const audio = new Audio(url);
      audio.addEventListener("loadedmetadata", () => {
        setRecordingTime(Math.floor(audio.duration));
      });

      toast.success(t.audioFileAdded);
      setShowPermissionHelp(false);
    }

    // Reset input
    e.target.value = "";
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      toast.success(t.recordingStopped);
    }
  };

  const saveRecording = () => {
    if (audioURL) {
      // Convert blob URL to File
      fetch(audioURL)
        .then((res) => res.blob())
        .then((blob) => {
          const timestamp = new Date()
            .toISOString()
            .replace(/[:.]/g, "-");
          // Determine file extension based on blob type
          const extension = blob.type.includes("webm")
            ? "webm"
            : blob.type.includes("mp3")
              ? "mp3"
              : blob.type.includes("mp4")
                ? "mp4"
                : blob.type.includes("wav")
                  ? "wav"
                  : blob.type.includes("m4a")
                    ? "m4a"
                    : blob.type.includes("ogg")
                      ? "ogg"
                      : "audio";
          const file = new File(
            [blob],
            `voice-recording-${timestamp}.${extension}`,
            { type: blob.type },
          );
          onRecordingComplete(file);
          toast.success(t.recordingSaved);

          // Reset state
          setAudioURL(null);
          setRecordingTime(0);
          setHasMicrophone(true); // Reset for next recording
          setShowPermissionHelp(false);
        });
    }
  };

  const deleteRecording = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    setAudioURL(null);
    setRecordingTime(0);
  };

  // Check microphone availability on mount
  useEffect(() => {
    const checkMicrophone = async () => {
      try {
        if (
          !navigator.mediaDevices ||
          !navigator.mediaDevices.getUserMedia
        ) {
          setHasMicrophone(false);
          return;
        }

        // Check if microphone devices are available
        const devices =
          await navigator.mediaDevices.enumerateDevices();
        const hasMic = devices.some(
          (device) => device.kind === "audioinput",
        );
        setHasMicrophone(hasMic);
      } catch {
        // If we can't check, assume no microphone and show upload option
        setHasMicrophone(false);
      }
    };

    checkMicrophone();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, [audioURL]);

  return (
    <div className="space-y-3">
      <input
        type="file"
        className="hidden"
        onChange={handleFileUpload}
        ref={fileInputRef}
        accept="audio/webm,audio/mp4,audio/mpeg,audio/mp3"
      />

      {!audioURL ? (
        <div className="space-y-2">
          {hasMicrophone && !showPermissionHelp ? (
            <>
              <Button
                type="button"
                variant="outline"
                className={`w-full ${
                  isRecording
                    ? "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400"
                    : "hover:bg-blue-50 dark:hover:bg-blue-900/20"
                }`}
                onClick={
                  isRecording ? stopRecording : startRecording
                }
              >
                {isRecording ? (
                  <>
                    <Square className="w-4 h-4 mr-2 fill-current" />
                    {t.stopRecording}
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    {t.startRecording}
                  </>
                )}
              </Button>

              {isRecording && (
                <div className="flex items-center justify-center gap-2 text-sm text-red-600 dark:text-red-400">
                  <div className="w-2 h-2 bg-red-600 dark:bg-red-400 rounded-full animate-pulse" />
                  <span>{t.recording}</span>
                  <span className="font-mono">
                    {formatTime(recordingTime)} /{" "}
                    {formatTime(MAX_DURATION)}
                  </span>
                </div>
              )}

              {!isRecording && (
                <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                  {t.maxDuration}
                </p>
              )}

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-300 dark:border-slate-600" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-slate-900 px-2 text-slate-500 dark:text-slate-400">
                    {language === "am" ? "ወይም" : "or"}
                  </span>
                </div>
              </div>
            </>
          ) : null}

          {showPermissionHelp && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    {t.micAccessDenied}
                  </p>
                  <div className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
                    <p className="font-medium">
                      {t.permissionHelp}
                    </p>
                    <p>{t.permissionStep1}</p>
                    <p>{t.permissionStep2}</p>
                    <p>{t.permissionStep3}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowPermissionHelp(false);
                      setHasMicrophone(true);
                      startRecording();
                    }}
                    className="mt-2"
                  >
                    {t.retry}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            className="w-full hover:bg-blue-50 dark:hover:bg-blue-900/20"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            {t.uploadAudio}
          </Button>

          <p className="text-xs text-center text-slate-500 dark:text-slate-400">
            {language === "am"
              ? "የፋይል ቅርጸቶች: WebM, MP4, MP3 (እስከ 5MB)"
              : "Accepted formats: WebM, MP4, MP3 (Max 5MB)"}
          </p>
        </div>
      ) : (
        <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm">
                {language === "am"
                  ? "የድምፅ ቀረጻ"
                  : "Voice Recording"}{" "}
                ({formatTime(recordingTime)})
              </span>
            </div>
          </div>

          <audio
            src={audioURL}
            controls
            className="w-full h-10"
          />

          <div className="flex gap-2">
            <Button
              type="button"
              variant="default"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={saveRecording}
            >
              {t.save}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={deleteRecording}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {t.delete}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}