"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AudioRecording,
  formatDuration,
  getMaxDurationMs,
  loadRecentRecordings,
  loadRecordingsForRudiment,
  saveRecording,
  deleteRecording,
  updateRecordingScore,
} from "../_lib/audioStorage";
import { shareRecording } from "../_lib/recordingSharing";

type RecorderState = "idle" | "requesting" | "recording" | "playing" | "unsupported";

type RecorderProps = {
  sessionId?: string | null;
  disabled?: boolean;
  showHistory?: boolean;
  compact?: boolean;
  patternType?: string;
  bpm?: number;
  moduleId?: number;
  rudimentId?: string | null;
  rudimentName?: string;
};

function checkMediaRecorderSupport(): { supported: boolean; reason?: string } {
  if (typeof window === "undefined") return { supported: false, reason: "Not in browser" };
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia)
    return { supported: false, reason: "Your browser doesn't support microphone access. Try Chrome or Firefox." };
  if (!window.MediaRecorder) {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS)
      return { supported: false, reason: "Recording requires iOS 14.3+. Please update or use Chrome on desktop." };
    return { supported: false, reason: "Your browser doesn't support audio recording. Try Chrome or Firefox." };
  }
  return { supported: true };
}

// Rhythm accuracy scoring
function scoreRhythmAccuracy(
  tapTimestamps: number[],
  bpm: number,
  recordingStartTime: number
): { score: number; details: { expected: number; actual: number | null; errorMs: number; rating: string }[] } {
  if (!bpm || tapTimestamps.length < 2) return { score: 0, details: [] };

  const beatIntervalMs = 60000 / bpm;
  const firstTap = tapTimestamps[0];
  const lastTap = tapTimestamps[tapTimestamps.length - 1];
  const duration = lastTap - firstTap;
  const expectedBeatCount = Math.round(duration / beatIntervalMs) + 1;

  // Generate expected beat positions aligned to first tap
  const expectedBeats: number[] = [];
  for (let i = 0; i < expectedBeatCount; i++) {
    expectedBeats.push(firstTap + i * beatIntervalMs);
  }

  const toleranceMs = beatIntervalMs * 0.25; // 25% of beat interval
  const details: { expected: number; actual: number | null; errorMs: number; rating: string }[] = [];
  const usedTaps = new Set<number>();

  for (const expected of expectedBeats) {
    let bestIdx = -1;
    let bestError = Infinity;
    for (let i = 0; i < tapTimestamps.length; i++) {
      if (usedTaps.has(i)) continue;
      const error = Math.abs(tapTimestamps[i] - expected);
      if (error < bestError) {
        bestError = error;
        bestIdx = i;
      }
    }

    if (bestIdx >= 0 && bestError <= toleranceMs) {
      usedTaps.add(bestIdx);
      const errorMs = tapTimestamps[bestIdx] - expected;
      let rating = "MISS";
      if (Math.abs(errorMs) <= beatIntervalMs * 0.05) rating = "PERFECT";
      else if (Math.abs(errorMs) <= beatIntervalMs * 0.15) rating = "GOOD";
      else rating = "OK";
      details.push({ expected: expected - recordingStartTime, actual: tapTimestamps[bestIdx] - recordingStartTime, errorMs, rating });
    } else {
      details.push({ expected: expected - recordingStartTime, actual: null, errorMs: beatIntervalMs, rating: "MISS" });
    }
  }

  if (details.length === 0) return { score: 0, details };
  const perfect = details.filter((d) => d.rating === "PERFECT").length;
  const good = details.filter((d) => d.rating === "GOOD").length;
  const ok = details.filter((d) => d.rating === "OK").length;
  const score = Math.round(((perfect * 1 + good * 0.7 + ok * 0.4) / details.length) * 100);

  return { score, details };
}

export default function Recorder({
  sessionId = null,
  disabled = false,
  showHistory = false,
  compact = false,
  patternType,
  bpm,
  moduleId,
  rudimentId = null,
  rudimentName,
}: RecorderProps) {
  const [state, setState] = useState<RecorderState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [recordings, setRecordings] = useState<AudioRecording[]>([]);
  const [currentRecording, setCurrentRecording] = useState<AudioRecording | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [supportCheck, setSupportCheck] = useState<{ supported: boolean; reason?: string } | null>(null);
  const [sharing, setSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [currentBlob, setCurrentBlob] = useState<Blob | null>(null);
  const [accuracyResult, setAccuracyResult] = useState<{ score: number; details: { expected: number; actual: number | null; errorMs: number; rating: string }[] } | null>(null);
  const [showBeatComparison, setShowBeatComparison] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const tapTimestampsRef = useRef<number[]>([]);

  const maxDurationMs = getMaxDurationMs();

  useEffect(() => {
    const check = checkMediaRecorderSupport();
    setSupportCheck(check);
    if (!check.supported) setState("unsupported");
  }, []);

  // Load recordings
  useEffect(() => {
    if (showHistory) {
      const load = async () => {
        try {
          const recs = rudimentId
            ? await loadRecordingsForRudiment(rudimentId)
            : await loadRecentRecordings();
          setRecordings(recs);
        } catch {
          setRecordings([]);
        }
      };
      load();
    }
  }, [showHistory, rudimentId]);

  // Timer
  useEffect(() => {
    if (state === "recording") {
      timerRef.current = window.setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        setElapsedMs(elapsed);
        if (elapsed >= maxDurationMs) stopRecording();
      }, 100);
    } else {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [state, maxDurationMs]);

  // Waveform drawing
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser || state !== "recording") return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = "var(--bg, #1a1a1a)";
    ctx.fillRect(0, 0, w, h);

    // Draw center line
    ctx.strokeStyle = "rgba(128, 128, 128, 0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();

    // Draw waveform
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#c0392b";
    ctx.beginPath();

    const sliceWidth = w / bufferLength;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * h) / 2;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      x += sliceWidth;
    }
    ctx.lineTo(w, h / 2);
    ctx.stroke();

    // Detect taps (amplitude-based onset detection)
    let maxAmplitude = 0;
    for (let i = 0; i < bufferLength; i++) {
      const amplitude = Math.abs(dataArray[i] - 128);
      if (amplitude > maxAmplitude) maxAmplitude = amplitude;
    }
    if (maxAmplitude > 40) {
      const now = Date.now();
      const lastTap = tapTimestampsRef.current[tapTimestampsRef.current.length - 1] || 0;
      if (now - lastTap > 80) { // debounce 80ms
        tapTimestampsRef.current.push(now);
      }
    }

    animFrameRef.current = requestAnimationFrame(drawWaveform);
  }, [state]);

  useEffect(() => {
    if (state === "recording") {
      animFrameRef.current = requestAnimationFrame(drawWaveform);
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [state, drawWaveform]);

  const startRecording = useCallback(async () => {
    setError(null);
    setCurrentRecording(null);
    setAccuracyResult(null);
    setShowBeatComparison(false);
    tapTimestampsRef.current = [];
    setState("requesting");
    setError("Requesting microphone access...");
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      setError(null);
    } catch (err) {
      const errorName = (err as Error).name;
      const errorMsg = (err as Error).message;
      if (errorName === "NotAllowedError") setError("Microphone access denied. Check Settings → Safari → Microphone.");
      else if (errorName === "NotFoundError") setError("No microphone found.");
      else setError(`Could not access microphone: ${errorName} - ${errorMsg}`);
      setState("idle");
      return;
    }

    streamRef.current = stream;
    chunksRef.current = [];
    startTimeRef.current = Date.now();
    setElapsedMs(0);

    // Set up audio analyser for waveform
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx({ latencyHint: "interactive" });
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.3;
      source.connect(analyser);
      analyserRef.current = analyser;
    } catch {
      // Waveform won't work but recording still will
    }

    const mimeTypes = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
    let mimeType = "";
    for (const type of mimeTypes) {
      if (MediaRecorder.isTypeSupported(type)) { mimeType = type; break; }
    }

    try {
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };

      recorder.onstop = async () => {
        const duration = Date.now() - startTimeRef.current;
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;

        if (audioCtxRef.current) {
          audioCtxRef.current.close().catch(() => {});
          audioCtxRef.current = null;
        }
        analyserRef.current = null;

        setCurrentBlob(blob);
        setShareSuccess(false);

        // Score rhythm accuracy
        let score: number | undefined;
        if (bpm && tapTimestampsRef.current.length >= 4) {
          const result = scoreRhythmAccuracy(tapTimestampsRef.current, bpm, startTimeRef.current);
          setAccuracyResult(result);
          score = result.score;
        }

        try {
          const recording = await saveRecording(blob, duration, sessionId, rudimentId, bpm, score);
          setCurrentRecording(recording);
          if (showHistory) {
            const recs = rudimentId
              ? await loadRecordingsForRudiment(rudimentId)
              : await loadRecentRecordings();
            setRecordings(recs);
          }
        } catch {
          setError("Failed to save recording.");
        }

        setState("idle");
      };

      recorder.onerror = () => {
        setError("Recording error occurred.");
        stream.getTracks().forEach((t) => t.stop());
        setState("idle");
      };

      recorder.start(500);
      setState("recording");
    } catch {
      setError("Failed to start recording.");
      stream.getTracks().forEach((t) => t.stop());
      setState("idle");
    }
  }, [sessionId, rudimentId, bpm, showHistory]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state === "recording") mediaRecorderRef.current.stop();
  }, [state]);

  const playRecording = useCallback((recording: AudioRecording) => {
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(recording.data);
    audioRef.current = audio;
    audio.onplay = () => { setState("playing"); setPlayingId(recording.id); };
    audio.onended = () => { setState("idle"); setPlayingId(null); };
    audio.onerror = () => { setError("Could not play recording."); setState("idle"); setPlayingId(null); };
    audio.play();
  }, []);

  const stopPlayback = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    setState("idle");
    setPlayingId(null);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    await deleteRecording(id);
    const recs = rudimentId
      ? await loadRecordingsForRudiment(rudimentId)
      : await loadRecentRecordings();
    setRecordings(recs);
    if (currentRecording?.id === id) setCurrentRecording(null);
    if (playingId === id) stopPlayback();
  }, [currentRecording, playingId, stopPlayback, rudimentId]);

  // Play metronome clicks for beat comparison
  const playBeatComparison = useCallback(async (recording: AudioRecording) => {
    if (!bpm || !recording.blob) return;
    setShowBeatComparison(true);

    // Play recording audio
    const audio = new Audio(recording.data);
    audioRef.current = audio;

    // Create metronome clicks overlay
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();
    const beatInterval = 60 / bpm;
    const durationSec = recording.durationMs / 1000;
    const beatCount = Math.floor(durationSec / beatInterval);

    audio.onplay = () => {
      setState("playing");
      setPlayingId(recording.id);
      // Schedule metronome clicks
      for (let i = 0; i < beatCount; i++) {
        const time = ctx.currentTime + i * beatInterval;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = i % 4 === 0 ? 1000 : 800;
        gain.gain.setValueAtTime(0.15, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
        osc.start(time);
        osc.stop(time + 0.05);
      }
    };

    audio.onended = () => {
      setState("idle");
      setPlayingId(null);
      ctx.close().catch(() => {});
    };

    audio.play();
  }, [bpm]);

  const isRecording = state === "recording";
  const isPlaying = state === "playing";
  const isRequesting = state === "requesting";
  const isUnsupported = state === "unsupported";
  const canRecord = !disabled && state === "idle" && !isUnsupported;

  return (
    <div className={`recorder ${compact ? "recorder-compact" : ""}`}>
      <div className="recorder-header">
        <span className="recorder-icon" aria-hidden="true"></span>
        <span className="recorder-title">
          {rudimentName ? `Record: ${rudimentName}` : "Self-Audit Recording"}
        </span>
      </div>

      {isUnsupported && supportCheck?.reason && (
        <div className="recorder-error recorder-unsupported" role="alert">
          <div>
            <strong>Recording not available</strong>
            <p style={{ margin: "6px 0 0", fontSize: "12px", opacity: 0.9 }}>{supportCheck.reason}</p>
          </div>
        </div>
      )}

      {error && !isUnsupported && (
        <div className="recorder-error" role="alert">
          {error}
          <button type="button" className="recorder-error-dismiss" onClick={() => setError(null)} aria-label="Dismiss error">x</button>
        </div>
      )}

      {/* Waveform visualization */}
      {isRecording && (
        <div className="recorder-waveform-container">
          <canvas
            ref={canvasRef}
            width={600}
            height={80}
            className="recorder-waveform-canvas"
          />
        </div>
      )}

      {!isUnsupported && (
        <div className="recorder-controls">
          {isRecording ? (
            <>
              <button type="button" className="recorder-btn recorder-btn-stop touch-target" onClick={stopRecording} aria-label="Stop recording">
                <span className="recorder-btn-icon" aria-hidden="true">[  ]</span>
                <span>Stop</span>
              </button>
              <div className="recorder-timer" role="timer" aria-live="polite">
                <span className="recorder-timer-dot" aria-hidden="true" />
                <span className="recorder-timer-value">{formatDuration(elapsedMs)}</span>
                <span className="recorder-timer-max">/ {formatDuration(maxDurationMs)}</span>
              </div>
            </>
          ) : (
            <button type="button" className="recorder-btn recorder-btn-record touch-target" onClick={startRecording} disabled={!canRecord} aria-label={isRequesting ? "Requesting microphone access" : "Start recording"}>
              <span className="recorder-btn-icon recorder-btn-icon-record" aria-hidden="true">(o)</span>
              <span>{isRequesting ? "Requesting..." : "Record"}</span>
            </button>
          )}
        </div>
      )}

      {/* Accuracy Score */}
      {accuracyResult && accuracyResult.score > 0 && !isRecording && (
        <div className="recorder-accuracy">
          <div className="recorder-accuracy-header">
            <span className="recorder-accuracy-label">Rhythm Accuracy</span>
            <span className="recorder-accuracy-score">{accuracyResult.score}%</span>
          </div>
          <div className="recorder-accuracy-bar">
            <div className="recorder-accuracy-fill" style={{ width: `${accuracyResult.score}%` }} />
          </div>
          <div className="recorder-accuracy-breakdown">
            {(() => {
              const perfect = accuracyResult.details.filter(d => d.rating === "PERFECT").length;
              const good = accuracyResult.details.filter(d => d.rating === "GOOD").length;
              const ok = accuracyResult.details.filter(d => d.rating === "OK").length;
              const miss = accuracyResult.details.filter(d => d.rating === "MISS").length;
              return (
                <>
                  <span className="accuracy-stat accuracy-perfect">PERFECT: {perfect}</span>
                  <span className="accuracy-stat accuracy-good">GOOD: {good}</span>
                  <span className="accuracy-stat accuracy-ok">OK: {ok}</span>
                  <span className="accuracy-stat accuracy-miss">MISS: {miss}</span>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Current Recording Playback */}
      {currentRecording && !isRecording && !isUnsupported && (
        <div className="recorder-playback">
          <div className="recorder-playback-label">Just recorded</div>
          <div className="recorder-playback-row">
            {playingId === currentRecording.id ? (
              <button type="button" className="recorder-btn recorder-btn-small touch-target" onClick={stopPlayback} aria-label="Stop playback">
                [||] Stop
              </button>
            ) : (
              <button type="button" className="recorder-btn recorder-btn-small touch-target" onClick={() => playRecording(currentRecording)} disabled={isPlaying} aria-label="Play recording">
                {"[>] Play"}
              </button>
            )}
            {bpm && currentRecording.blob && (
              <button type="button" className="recorder-btn recorder-btn-small touch-target" onClick={() => playBeatComparison(currentRecording)} disabled={isPlaying} aria-label="Compare with metronome">
                {"[>|] Compare"}
              </button>
            )}
            <span className="recorder-duration">{formatDuration(currentRecording.durationMs)}</span>
            <button type="button" className="recorder-btn recorder-btn-ghost recorder-btn-small touch-target" onClick={() => handleDelete(currentRecording.id)} aria-label="Delete recording">
              Delete
            </button>
          </div>
          {showBeatComparison && (
            <div className="recorder-comparison-hint">
              Playing recording with metronome overlay at {bpm} BPM
            </div>
          )}

          {currentBlob && !shareSuccess && (
            <button
              type="button"
              className="recorder-btn recorder-share-btn touch-target"
              onClick={async () => {
                setSharing(true);
                setError(null);
                try {
                  const result = await shareRecording(currentBlob, { durationMs: currentRecording.durationMs, patternType, bpm, moduleId });
                  if (result) setShareSuccess(true);
                  else setError("Failed to share.");
                } catch { setError("Failed to share."); }
                setSharing(false);
              }}
              disabled={sharing}
            >
              {sharing ? "Sharing..." : "Share for Community Feedback"}
            </button>
          )}

          {shareSuccess && (
            <div className="recorder-share-success">
              Shared! Check <a href="/drum/community">Community</a> for feedback.
            </div>
          )}
        </div>
      )}

      {/* History */}
      {showHistory && recordings.length > 0 && !isUnsupported && (
        <div className="recorder-history">
          <div className="recorder-history-label">
            {rudimentId ? `Recordings for ${rudimentName || rudimentId}` : "Recent recordings"}
          </div>
          <ul className="recorder-history-list">
            {recordings.map((rec) => (
              <li key={rec.id} className="recorder-history-item">
                <span className="recorder-history-date">{formatRecordingDate(rec.ts)}</span>
                <span className="recorder-duration">{formatDuration(rec.durationMs)}</span>
                {rec.bpm && <span className="recorder-history-bpm">{rec.bpm} BPM</span>}
                {rec.accuracyScore != null && <span className="recorder-history-score">{rec.accuracyScore}%</span>}
                <div className="recorder-history-actions">
                  {playingId === rec.id ? (
                    <button type="button" className="recorder-btn recorder-btn-tiny touch-target" onClick={stopPlayback} aria-label="Stop playback">[||]</button>
                  ) : (
                    <button type="button" className="recorder-btn recorder-btn-tiny touch-target" onClick={() => playRecording(rec)} disabled={isPlaying && playingId !== rec.id} aria-label="Play recording">{"[>]"}</button>
                  )}
                  {bpm && rec.blob && (
                    <button type="button" className="recorder-btn recorder-btn-tiny touch-target" onClick={() => playBeatComparison(rec)} disabled={isPlaying} aria-label="Compare">{"[>|]"}</button>
                  )}
                  <button type="button" className="recorder-btn recorder-btn-tiny recorder-btn-ghost touch-target" onClick={() => handleDelete(rec.id)} aria-label="Delete recording">x</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="recorder-hint">
        {isUnsupported
          ? "You can still practice! Just listen back mentally after each exercise."
          : bpm
          ? `Record yourself and get a rhythm accuracy score at ${bpm} BPM. Compare your timing against the metronome.`
          : "Record 20-30 seconds and listen back for flams, timing issues, and evenness."}
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

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
