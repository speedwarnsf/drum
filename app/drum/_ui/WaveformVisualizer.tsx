"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

type WaveformVisualizerProps = {
  isRecording?: boolean;
  showFrequencyAnalysis?: boolean;
  beatTimes?: number[];
  width?: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
  showGrid?: boolean;
  sensitivity?: number;
};

export default function WaveformVisualizer({
  isRecording = false,
  showFrequencyAnalysis = false,
  beatTimes = [],
  width = 800,
  height = 200,
  color = "#f4ba34",
  backgroundColor = "rgba(0,0,0,0.1)",
  showGrid = true,
  sensitivity = 1.0,
}: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const frequencyDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize audio analysis
  const initializeAudio = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const analyzer = audioContext.createAnalyser();
      analyzer.fftSize = 2048;
      analyzer.smoothingTimeConstant = 0.8;
      
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyzer);
      
      audioContextRef.current = audioContext;
      analyzerRef.current = analyzer;
      mediaStreamRef.current = stream;
      
      dataArrayRef.current = new Uint8Array(analyzer.frequencyBinCount);
      frequencyDataRef.current = new Uint8Array(analyzer.frequencyBinCount);
      
      setIsActive(true);
      setError(null);
    } catch (err) {
      setError("Could not access microphone for waveform visualization");
      console.error("Audio initialization failed:", err);
    }
  }, []);

  // Cleanup audio
  const cleanupAudio = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    audioContextRef.current = null;
    analyzerRef.current = null;
    mediaStreamRef.current = null;
    dataArrayRef.current = null;
    frequencyDataRef.current = null;
    
    setIsActive(false);
  }, []);

  // Start/stop based on recording state
  useEffect(() => {
    if (isRecording && !isActive) {
      initializeAudio();
    } else if (!isRecording && isActive) {
      cleanupAudio();
    }

    return () => cleanupAudio();
  }, [isRecording, isActive, initializeAudio, cleanupAudio]);

  // Draw waveform
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const analyzer = analyzerRef.current;
    const dataArray = dataArrayRef.current;
    const frequencyData = frequencyDataRef.current;
    
    if (!canvas || !analyzer || !dataArray || !frequencyData) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Get audio data
    analyzer.getByteTimeDomainData(dataArray);
    analyzer.getByteFrequencyData(frequencyData);

    // Clear canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.lineWidth = 1;
      
      // Horizontal lines
      for (let i = 0; i <= 4; i++) {
        const y = (height / 4) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      
      // Vertical lines  
      for (let i = 0; i <= 8; i++) {
        const x = (width / 8) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
    }

    const centerY = height / 2;
    
    if (showFrequencyAnalysis) {
      // Draw frequency spectrum
      const barWidth = width / frequencyData.length * 2;
      
      for (let i = 0; i < frequencyData.length / 2; i++) {
        const barHeight = (frequencyData[i] / 255) * height * 0.8 * sensitivity;
        const x = i * barWidth;
        
        // Create gradient for bars
        const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, color + "80");
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
      }
    } else {
      // Draw waveform
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      const sliceWidth = width / dataArray.length;
      let x = 0;
      
      for (let i = 0; i < dataArray.length; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * height * sensitivity) / 2;
        
        if (i === 0) {
          ctx.moveTo(x, centerY + y);
        } else {
          ctx.lineTo(x, centerY + y);
        }
        
        x += sliceWidth;
      }
      
      ctx.stroke();

      // Draw beat markers
      if (beatTimes.length > 0) {
        const currentTime = Date.now();
        ctx.fillStyle = "#ff4444";
        
        beatTimes.forEach(beatTime => {
          const timeDiff = currentTime - beatTime;
          if (timeDiff < 2000 && timeDiff >= 0) { // Show beats from last 2 seconds
            const alpha = 1 - (timeDiff / 2000);
            ctx.globalAlpha = alpha;
            const beatX = width - (timeDiff / 2000) * width;
            ctx.fillRect(beatX - 2, 0, 4, height);
          }
        });
        
        ctx.globalAlpha = 1;
      }

      // Draw RMS level indicator
      let rms = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const value = (dataArray[i] - 128) / 128;
        rms += value * value;
      }
      rms = Math.sqrt(rms / dataArray.length);
      
      const rmsHeight = rms * height * sensitivity;
      ctx.fillStyle = color + "40";
      ctx.fillRect(width - 60, centerY - rmsHeight/2, 50, rmsHeight);
      
      // RMS level text
      ctx.fillStyle = "#ffffff";
      ctx.font = "12px monospace";
      ctx.fillText(`RMS: ${Math.round(rms * 100)}%`, width - 60, height - 10);
    }

    // Continue animation if active
    if (isActive) {
      animationRef.current = requestAnimationFrame(draw);
    }
  }, [
    width, 
    height, 
    backgroundColor, 
    color, 
    showGrid, 
    showFrequencyAnalysis, 
    sensitivity, 
    beatTimes, 
    isActive
  ]);

  // Start animation loop when active
  useEffect(() => {
    if (isActive) {
      animationRef.current = requestAnimationFrame(draw);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, draw]);

  return (
    <div className="waveform-visualizer">
      <div className="waveform-header">
        <h3>Audio Visualization</h3>
        <div className="waveform-status">
          {isActive ? (
            <span className="status-active">● Recording</span>
          ) : isRecording ? (
            <span className="status-initializing">○ Initializing...</span>
          ) : (
            <span className="status-inactive">○ Inactive</span>
          )}
        </div>
      </div>

      {error && (
        <div className="waveform-error" role="alert">
          {error}
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="waveform-canvas"
        style={{ 
          width: "100%", 
          maxWidth: `${width}px`,
          height: "auto",
          aspectRatio: `${width} / ${height}`,
          backgroundColor: backgroundColor,
        }}
        aria-label="Real-time audio waveform visualization"
      />

      <div className="waveform-controls">
        <label>
          <input
            type="checkbox"
            checked={showFrequencyAnalysis}
            onChange={(e) => showFrequencyAnalysis = e.target.checked}
          />
          Show frequency analysis
        </label>
      </div>
    </div>
  );
}

// Beat Accuracy Visualizer Component
type BeatAccuracyProps = {
  expectedBeats: number[];
  actualBeats: number[];
  toleranceMs?: number;
  width?: number;
  height?: number;
};

export function BeatAccuracyVisualizer({
  expectedBeats,
  actualBeats,
  toleranceMs = 50,
  width = 600,
  height = 100,
}: BeatAccuracyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "rgba(0,0,0,0.1)";
    ctx.fillRect(0, 0, width, height);

    if (expectedBeats.length === 0) return;

    const startTime = Math.min(...expectedBeats);
    const endTime = Math.max(...expectedBeats) + 1000; // Add 1s buffer
    const timeRange = endTime - startTime;
    const centerY = height / 2;

    // Draw expected beat markers
    ctx.fillStyle = "#4CAF50";
    expectedBeats.forEach(beatTime => {
      const x = ((beatTime - startTime) / timeRange) * width;
      ctx.fillRect(x - 2, centerY - 20, 4, 40);
    });

    // Draw tolerance zones
    ctx.fillStyle = "rgba(76, 175, 80, 0.2)";
    expectedBeats.forEach(beatTime => {
      const centerX = ((beatTime - startTime) / timeRange) * width;
      const toleranceWidth = (toleranceMs / timeRange) * width * 2;
      ctx.fillRect(centerX - toleranceWidth/2, centerY - 15, toleranceWidth, 30);
    });

    // Draw actual beats
    actualBeats.forEach(actualTime => {
      const x = ((actualTime - startTime) / timeRange) * width;
      
      // Find closest expected beat
      let closestBeat = expectedBeats[0];
      let minDiff = Math.abs(actualTime - closestBeat);
      
      expectedBeats.forEach(expectedTime => {
        const diff = Math.abs(actualTime - expectedTime);
        if (diff < minDiff) {
          minDiff = diff;
          closestBeat = expectedTime;
        }
      });

      // Color based on accuracy
      const isAccurate = minDiff <= toleranceMs;
      ctx.fillStyle = isAccurate ? "#2196F3" : "#FF5722";
      
      // Draw beat marker
      ctx.fillRect(x - 3, centerY - 25, 6, 50);
      
      // Draw timing difference
      ctx.fillStyle = isAccurate ? "#2196F3" : "#FF5722";
      ctx.font = "10px monospace";
      ctx.textAlign = "center";
      
      const diffText = minDiff > 0 ? `${Math.round(minDiff)}ms` : "ON";
      ctx.fillText(diffText, x, centerY + 40);
    });

    // Draw accuracy summary
    ctx.fillStyle = "#ffffff";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "left";
    
    const accurateBeats = actualBeats.filter(actualTime => {
      return expectedBeats.some(expectedTime => 
        Math.abs(actualTime - expectedTime) <= toleranceMs
      );
    });
    
    const accuracy = actualBeats.length > 0 
      ? Math.round((accurateBeats.length / actualBeats.length) * 100)
      : 0;
    
    ctx.fillText(`Timing Accuracy: ${accuracy}%`, 10, 20);
    ctx.fillText(`Beats: ${actualBeats.length}/${expectedBeats.length}`, 10, 35);

  }, [expectedBeats, actualBeats, toleranceMs, width, height]);

  return (
    <div className="beat-accuracy-visualizer">
      <h4>Beat Accuracy Analysis</h4>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="accuracy-canvas"
        style={{ 
          width: "100%", 
          maxWidth: `${width}px`,
          height: "auto",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: "0"
        }}
        aria-label="Beat timing accuracy visualization"
      />
      <div className="accuracy-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: "#4CAF50" }}></span>
          Expected beats
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: "#2196F3" }}></span>
          Accurate hits
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: "#FF5722" }}></span>
          Timing errors
        </div>
      </div>
    </div>
  );
}