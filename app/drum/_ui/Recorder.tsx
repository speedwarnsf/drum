"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AudioRecording,
  formatDuration,
  getMaxDurationMs,
  loadRecentRecordings,
  saveRecording,
  deleteRecording,
} from "../_lib/audioStorage";

type RecorderState = "idle" | "requesting" | "recording" | "playing";

type RecorderProps = {
  sessionId?: string | null;
  disabled?: boolean;
  showHistory?: boolean;
  compact?: boolean;
};

export default function Recorder({
  sessionId = null,
  disabled = false,
  showHistory = false,
  compact = false,
}: RecorderProps) {
  const [state, setState] = useState<RecorderState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [recordings, setRecordings] = useState<AudioRecording[]>([]);
  const [currentRecording, setCurrentRecording] = useState<AudioRecording | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

  const maxDurationMs = getMaxDurationMs();

  // Load recordings on mount
  useEffect(() => {
    if (showHistory) {
      setRecordings(loadRecentRecordings());
    }
  }, [showHistory]);

  // Timer for recording duration
  useEffect(() => {
    if (state === "recording") {
      timerRef.current = window.setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        setElapsedMs(elapsed);

        // Auto-stop at max duration
        if (elapsed >= maxDurationMs) {
          stopRecording();
        }
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [state, maxDurationMs]);

  const requestPermission = useCallback(async (): Promise<MediaStream | null> => {
    try {
      setState("requesting");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      return stream;
    } catch (err) {
      const errorName = (err as Error).name;
      if (errorName === "NotAllowedError" || errorName === "PermissionDeniedError") {
        setError("Microphone access denied. Please allow microphone access to record.");
      } else if (errorName === "NotFoundError") {
        setError("No microphone found. Please connect a microphone.");
      } else {
        setError("Could not access microphone. Please check your device settings.");
      }
      setState("idle");
      return null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    setCurrentRecording(null);

    const stream = await requestPermission();
    if (!stream) return;

    chunksRef.current = [];
    startTimeRef.current = Date.now();
    setElapsedMs(0);

    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";

    const recorder = new MediaRecorder(stream, { mimeType });
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    recorder.onstop = async () => {
      const duration = Date.now() - startTimeRef.current;
      const blob = new Blob(chunksRef.current, { type: mimeType });

      // Stop all tracks
      stream.getTracks().forEach((track) => track.stop());

      try {
        const recording = await saveRecording(blob, duration, sessionId);
        setCurrentRecording(recording);
        if (showHistory) {
          setRecordings(loadRecentRecordings());
        }
      } catch {
        setError("Failed to save recording.");
      }

      setState("idle");
    };

    recorder.onerror = () => {
      setError("Recording error occurred.");
      stream.getTracks().forEach((track) => track.stop());
      setState("idle");
    };

    recorder.start(1000); // Collect data every second
    setState("recording");
  }, [requestPermission, sessionId, showHistory]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, [state]);

  const playRecording = useCallback((recording: AudioRecording) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(recording.data);
    audioRef.current = audio;

    audio.onplay = () => {
      setState("playing");
      setPlayingId(recording.id);
    };

    audio.onended = () => {
      setState("idle");
      setPlayingId(null);
    };

    audio.onerror = () => {
      setError("Could not play recording.");
      setState("idle");
      setPlayingId(null);
    };

    audio.play();
  }, []);

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setState("idle");
    setPlayingId(null);
  }, []);

  const handleDelete = useCallback((id: string) => {
    deleteRecording(id);
    setRecordings(loadRecentRecordings());
    if (currentRecording?.id === id) {
      setCurrentRecording(null);
    }
    if (playingId === id) {
      stopPlayback();
    }
  }, [currentRecording, playingId, stopPlayback]);

  const isRecording = state === "recording";
  const isPlaying = state === "playing";
  const isRequesting = state === "requesting";
  const canRecord = !disabled && state === "idle";

  return (
    <div className={`recorder ${compact ? "recorder-compact" : ""}`}>
      <div className="recorder-header">
        <span className="recorder-icon" aria-hidden="true">🎙️</span>
        <span className="recorder-title">Self-Audit Recording</span>
      </div>

      {error && (
        <div className="recorder-error" role="alert">
          {error}
          <button
            type="button"
            className="recorder-error-dismiss"
            onClick={() => setError(null)}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      <div className="recorder-controls">
        {isRecording ? (
          <>
            <button
              type="button"
              className="recorder-btn recorder-btn-stop"
              onClick={stopRecording}
              aria-label="Stop recording"
            >
              <span className="recorder-btn-icon" aria-hidden="true">■</span>
              <span>Stop</span>
            </button>
            <div className="recorder-timer" role="timer" aria-live="polite">
              <span className="recorder-timer-dot" aria-hidden="true" />
              <span className="recorder-timer-value">{formatDuration(elapsedMs)}</span>
              <span className="recorder-timer-max">/ {formatDuration(maxDurationMs)}</span>
            </div>
          </>
        ) : (
          <button
            type="button"
            className="recorder-btn recorder-btn-record"
            onClick={startRecording}
            disabled={!canRecord}
            aria-label={isRequesting ? "Requesting microphone access" : "Start recording"}
          >
            <span className="recorder-btn-icon recorder-btn-icon-record" aria-hidden="true">●</span>
            <span>{isRequesting ? "Requesting..." : "Record"}</span>
          </button>
        )}
      </div>

      {currentRecording && !isRecording && (
        <div className="recorder-playback">
          <div className="recorder-playback-label">Just recorded</div>
          <div className="recorder-playback-row">
            {playingId === currentRecording.id ? (
              <button
                type="button"
                className="recorder-btn recorder-btn-small"
                onClick={stopPlayback}
                aria-label="Stop playback"
              >
                <span aria-hidden="true">■</span> Stop
              </button>
            ) : (
              <button
                type="button"
                className="recorder-btn recorder-btn-small"
                onClick={() => playRecording(currentRecording)}
                disabled={isPlaying}
                aria-label="Play recording"
              >
                <span aria-hidden="true">▶</span> Play
              </button>
            )}
            <span className="recorder-duration">{formatDuration(currentRecording.durationMs)}</span>
            <button
              type="button"
              className="recorder-btn recorder-btn-ghost recorder-btn-small"
              onClick={() => handleDelete(currentRecording.id)}
              aria-label="Delete recording"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {showHistory && recordings.length > 0 && (
        <div className="recorder-history">
          <div className="recorder-history-label">Recent recordings</div>
          <ul className="recorder-history-list">
            {recordings.map((rec) => (
              <li key={rec.id} className="recorder-history-item">
                <span className="recorder-history-date">
                  {formatRecordingDate(rec.ts)}
                </span>
                <span className="recorder-duration">{formatDuration(rec.durationMs)}</span>
                <div className="recorder-history-actions">
                  {playingId === rec.id ? (
                    <button
                      type="button"
                      className="recorder-btn recorder-btn-tiny"
                      onClick={stopPlayback}
                      aria-label="Stop playback"
                    >
                      ■
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="recorder-btn recorder-btn-tiny"
                      onClick={() => playRecording(rec)}
                      disabled={isPlaying && playingId !== rec.id}
                      aria-label="Play recording"
                    >
                      ▶
                    </button>
                  )}
                  <button
                    type="button"
                    className="recorder-btn recorder-btn-tiny recorder-btn-ghost"
                    onClick={() => handleDelete(rec.id)}
                    aria-label="Delete recording"
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="recorder-hint">
        Record 20-30 seconds and listen back for flams, timing issues, and evenness.
      </div>
    </div>
  );
}

function formatRecordingDate(ts: string): string {
  const date = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
