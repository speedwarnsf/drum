"use client";

import React, { useEffect, useRef } from "react";
import { Rudiment, RudimentNote, Hand, Accent } from "../_lib/rudimentLibrary";

type NotationProps = {
  rudiment: Rudiment;
  showVariations?: boolean;
  width?: number;
  height?: number;
  showPlayhead?: boolean;
  currentBeat?: number;
  interactive?: boolean;
  onNoteClick?: (note: RudimentNote, index: number) => void;
};

export default function RudimentNotation({
  rudiment,
  showVariations = false,
  width = 600,
  height = 150,
  showPlayhead = false,
  currentBeat = 0,
  interactive = false,
  onNoteClick,
}: NotationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    drawNotation();
  }, [rudiment, currentBeat, showPlayhead]);

  const drawNotation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Draw staff lines
    drawStaff(ctx);
    
    // Draw time signature
    drawTimeSignature(ctx, rudiment.pattern.timeSignature);
    
    // Draw notes
    drawNotes(ctx, rudiment.pattern);
    
    // Draw sticking pattern
    drawStickingPattern(ctx, rudiment.pattern);
    
    // Draw playhead if active
    if (showPlayhead) {
      drawPlayhead(ctx, currentBeat);
    }

    // Draw tempo marking
    drawTempoMarking(ctx, rudiment.pattern.suggestedTempo.target);
  };

  const drawStaff = (ctx: CanvasRenderingContext2D) => {
    const staffY = height / 2;
    const lineSpacing = 8;
    const staffWidth = width - 80;
    const startX = 60;

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1;

    // Draw single staff line for snare drum
    ctx.beginPath();
    ctx.moveTo(startX, staffY);
    ctx.lineTo(startX + staffWidth, staffY);
    ctx.stroke();

    // Draw measure lines
    const [numerator] = rudiment.pattern.timeSignature;
    const measureWidth = staffWidth / numerator;
    
    for (let i = 0; i <= numerator; i++) {
      const x = startX + (i * measureWidth);
      ctx.beginPath();
      ctx.moveTo(x, staffY - 20);
      ctx.lineTo(x, staffY + 20);
      ctx.stroke();
    }
  };

  const drawTimeSignature = (ctx: CanvasRenderingContext2D, timeSignature: [number, number]) => {
    const [numerator, denominator] = timeSignature;
    const staffY = height / 2;
    
    ctx.fillStyle = "#000000";
    ctx.font = "bold 20px serif";
    ctx.textAlign = "center";
    
    // Draw numerator
    ctx.fillText(numerator.toString(), 35, staffY - 5);
    // Draw denominator
    ctx.fillText(denominator.toString(), 35, staffY + 15);
  };

  const drawNotes = (ctx: CanvasRenderingContext2D, pattern: any) => {
    const staffY = height / 2;
    const staffWidth = width - 80;
    const startX = 60;
    const [numerator] = pattern.timeSignature;

    pattern.notes.forEach((note: RudimentNote, index: number) => {
      const x = startX + (note.timing * staffWidth);
      
      // Draw note head
      drawNoteHead(ctx, x, staffY, note, index);
      
      // Draw stem if needed
      if (note.duration < 0.5) {
        drawNoteStem(ctx, x, staffY, note);
      }
      
      // Draw beams or flags for eighth notes and shorter
      if (note.duration <= 0.125) {
        drawNoteFlag(ctx, x, staffY, note);
      }
    });
  };

  const drawNoteHead = (ctx: CanvasRenderingContext2D, x: number, y: number, note: RudimentNote, index: number) => {
    const radius = 6;
    
    // Determine note head style based on duration and accent
    ctx.fillStyle = note.accent === 'accent' ? "#000000" : 
                   note.accent === 'ghost' ? "#cccccc" : "#666666";
    
    // Draw note head
    ctx.beginPath();
    
    if (note.duration >= 0.5) {
      // Whole/half notes - hollow
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // Quarter notes and shorter - filled
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw accent mark
    if (note.accent === 'accent') {
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - 8, y - 15);
      ctx.lineTo(x + 8, y - 15);
      ctx.stroke();
      ctx.lineWidth = 1;
    }

    // Ghost note parentheses
    if (note.accent === 'ghost') {
      ctx.strokeStyle = "#999999";
      ctx.beginPath();
      ctx.arc(x - 10, y, 8, -Math.PI/2, Math.PI/2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + 10, y, 8, Math.PI/2, -Math.PI/2);
      ctx.stroke();
    }

    // Interactive click areas
    if (interactive && onNoteClick) {
      // Store click area data (this would be better with actual event handling)
      const clickArea = {
        x: x - radius,
        y: y - radius,
        width: radius * 2,
        height: radius * 2,
        note,
        index,
      };
    }
  };

  const drawNoteStem = (ctx: CanvasRenderingContext2D, x: number, y: number, note: RudimentNote) => {
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    // Stem direction based on hand (R = up, L = down)
    if (note.hand === 'R') {
      ctx.moveTo(x + 6, y);
      ctx.lineTo(x + 6, y - 25);
    } else {
      ctx.moveTo(x - 6, y);
      ctx.lineTo(x - 6, y + 25);
    }
    
    ctx.stroke();
    ctx.lineWidth = 1;
  };

  const drawNoteFlag = (ctx: CanvasRenderingContext2D, x: number, y: number, note: RudimentNote) => {
    ctx.fillStyle = "#000000";
    
    if (note.hand === 'R') {
      // Flag going right from stem top
      const stemTop = y - 25;
      ctx.beginPath();
      ctx.moveTo(x + 6, stemTop);
      ctx.quadraticCurveTo(x + 15, stemTop + 5, x + 6, stemTop + 10);
      ctx.fill();
    } else {
      // Flag going left from stem bottom
      const stemBottom = y + 25;
      ctx.beginPath();
      ctx.moveTo(x - 6, stemBottom);
      ctx.quadraticCurveTo(x - 15, stemBottom - 5, x - 6, stemBottom - 10);
      ctx.fill();
    }
  };

  const drawStickingPattern = (ctx: CanvasRenderingContext2D, pattern: any) => {
    const staffY = height / 2;
    const staffWidth = width - 80;
    const startX = 60;
    
    ctx.fillStyle = "#000000";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";

    pattern.notes.forEach((note: RudimentNote) => {
      const x = startX + (note.timing * staffWidth);
      
      // Draw hand indicator below staff
      const handY = note.hand === 'R' ? staffY + 35 : staffY + 50;
      ctx.fillStyle = note.hand === 'R' ? "#ff6b6b" : "#4ecdc4";
      
      ctx.fillText(note.hand, x, handY);
      
      // Draw small circle to connect to note
      ctx.beginPath();
      ctx.arc(x, handY - 8, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw pattern description
    ctx.fillStyle = "#666666";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`Pattern: ${pattern.stickingPattern}`, 10, height - 20);
  };

  const drawPlayhead = (ctx: CanvasRenderingContext2D, beat: number) => {
    const staffY = height / 2;
    const staffWidth = width - 80;
    const startX = 60;
    const [numerator] = rudiment.pattern.timeSignature;
    
    const x = startX + ((beat % numerator) / numerator) * staffWidth;
    
    ctx.strokeStyle = "#ff4444";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, staffY - 30);
    ctx.lineTo(x, staffY + 60);
    ctx.stroke();
    ctx.lineWidth = 1;
  };

  const drawTempoMarking = (ctx: CanvasRenderingContext2D, bpm: number) => {
    ctx.fillStyle = "#000000";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "left";
    
    // Draw quarter note symbol + BPM
    ctx.fillText(`♩ = ${bpm} BPM`, 10, 20);
  };

  // Handle canvas clicks for interactive mode
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive || !onNoteClick) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    
    // Simple hit testing - find closest note
    const staffWidth = width - 80;
    const startX = 60;
    
    rudiment.pattern.notes.forEach((note, index) => {
      const noteX = startX + (note.timing * staffWidth);
      const distance = Math.sqrt(Math.pow(clickX - noteX, 2) + Math.pow(clickY - height/2, 2));
      
      if (distance < 15) { // 15px hit radius
        onNoteClick(note, index);
      }
    });
  };

  return (
    <div className="rudiment-notation" ref={containerRef}>
      <div className="notation-header">
        <h3>{rudiment.name}</h3>
        <div className="notation-info">
          <span className="difficulty">Difficulty: {rudiment.pattern.difficulty}/5</span>
          <span className="tempo">Target: {rudiment.pattern.suggestedTempo.target} BPM</span>
        </div>
      </div>
      
      <div className="notation-canvas-container">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="notation-canvas"
          onClick={handleCanvasClick}
          style={{ 
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: '#ffffff',
            cursor: interactive ? 'pointer' : 'default'
          }}
          aria-label={`Musical notation for ${rudiment.name}: ${rudiment.pattern.stickingPattern}`}
        />
      </div>

      <div className="notation-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: "#ff6b6b" }}></span>
          <span>Right Hand (R)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: "#4ecdc4" }}></span>
          <span>Left Hand (L)</span>
        </div>
        <div className="legend-item">
          <span className="legend-symbol">&gt;</span>
          <span>Accent</span>
        </div>
        <div className="legend-item">
          <span className="legend-symbol">( )</span>
          <span>Ghost Note</span>
        </div>
      </div>

      <div className="rudiment-details">
        <p className="description">{rudiment.pattern.description}</p>
        
        {rudiment.practiceNotes.length > 0 && (
          <div className="practice-notes">
            <h4>Practice Tips:</h4>
            <ul>
              {rudiment.practiceNotes.map((note, index) => (
                <li key={index}>{note}</li>
              ))}
            </ul>
          </div>
        )}

        {rudiment.commonMistakes.length > 0 && (
          <details className="common-mistakes">
            <summary>Common Mistakes</summary>
            <ul>
              {rudiment.commonMistakes.map((mistake, index) => (
                <li key={index}>{mistake}</li>
              ))}
            </ul>
          </details>
        )}

        {showVariations && rudiment.variations.length > 0 && (
          <div className="variations">
            <h4>Variations:</h4>
            {rudiment.variations.map((variation, index) => (
              <div key={index} className="variation">
                <p><strong>Variation {index + 1}:</strong> {variation.description}</p>
                <p>Sticking: {variation.stickingPattern}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Simplified notation view for small spaces
export function CompactRudimentNotation({ 
  rudiment, 
  size = 'small' 
}: { 
  rudiment: Rudiment; 
  size?: 'small' | 'mini' 
}) {
  const dimensions = size === 'mini' ? { width: 200, height: 60 } : { width: 400, height: 100 };
  
  return (
    <div className={`compact-rudiment-notation ${size}`}>
      <div className="compact-header">
        <span className="rudiment-name">{rudiment.name}</span>
        <span className="sticking-pattern">{rudiment.pattern.stickingPattern}</span>
      </div>
      <RudimentNotation
        rudiment={rudiment}
        width={dimensions.width}
        height={dimensions.height}
        showVariations={false}
        interactive={false}
      />
    </div>
  );
}