"use client";

import React, { useEffect, useRef } from "react";

interface BouncingBeatIndicatorProps {
  bpm: number;
  isPlaying: boolean;
  beat: number;
  subdivision?: "quarter" | "eighth" | "triplet" | "sixteenth";
  size?: "small" | "medium" | "large";
  showTrail?: boolean;
}

export default function BouncingBeatIndicator({
  bpm,
  isPlaying,
  beat,
  subdivision = "quarter",
  size = "medium",
  showTrail = true
}: BouncingBeatIndicatorProps) {
  const ballRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    small: "w-16 h-16",
    medium: "w-24 h-24", 
    large: "w-32 h-32"
  };

  const ballSizeClasses = {
    small: "w-4 h-4",
    medium: "w-6 h-6",
    large: "w-8 h-8"
  };

  // Calculate beat interval based on BPM and subdivision
  const getSubdivisionMultiplier = () => {
    switch (subdivision) {
      case "eighth": return 0.5;
      case "triplet": return 0.33333;
      case "sixteenth": return 0.25;
      default: return 1;
    }
  };

  const beatInterval = (60 / bpm) * getSubdivisionMultiplier();

  useEffect(() => {
    const ball = ballRef.current;
    const container = containerRef.current;
    const trail = trailRef.current;
    
    if (!ball || !container || !isPlaying) return;

    // Ball bouncing animation with physics-like behavior
    const animateBounce = () => {
      const containerHeight = container.clientHeight;
      const ballHeight = ball.clientHeight;
      const maxBounceHeight = containerHeight - ballHeight - 8; // Leave some padding
      
      // Reset position
      ball.style.transform = `translateY(0px)`;
      ball.style.transition = 'none';
      
      // Trigger bounce on strong beats
      const isStrongBeat = beat === 1;
      const bounceHeight = isStrongBeat ? maxBounceHeight : maxBounceHeight * 0.6;
      
      // Add visual intensity based on subdivision
      const intensity = subdivision === "sixteenth" ? 1.2 : 
                       subdivision === "eighth" ? 1.1 : 
                       subdivision === "triplet" ? 0.9 : 1;
      
      const finalHeight = bounceHeight * intensity;
      
      // Animate down first (preparation)
      requestAnimationFrame(() => {
        ball.style.transition = `transform ${beatInterval * 0.1}s cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
        ball.style.transform = `translateY(8px)`;
        
        // Then bounce up
        setTimeout(() => {
          ball.style.transition = `transform ${beatInterval * 0.4}s cubic-bezier(0.175, 0.885, 0.32, 1.275)`;
          ball.style.transform = `translateY(-${finalHeight}px)`;
          
          // Fall back down with gravity-like easing
          setTimeout(() => {
            ball.style.transition = `transform ${beatInterval * 0.5}s cubic-bezier(0.55, 0.055, 0.675, 0.19)`;
            ball.style.transform = `translateY(0px)`;
          }, beatInterval * 400);
          
        }, beatInterval * 100);
      });
    };

    // Create trail effect
    if (showTrail && trail) {
      const createTrailDot = () => {
        const dot = document.createElement('div');
        dot.className = 'trail-dot';
        dot.style.cssText = `
          position: absolute;
          width: 3px;
          height: 3px;
          background: var(--ink-muted);
          opacity: 0.6;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
          border-radius: 0;
        `;
        
        trail.appendChild(dot);
        
        // Fade out and remove
        setTimeout(() => {
          dot.style.opacity = '0';
          dot.style.transform = 'translate(-50%, -50%) scale(0.3)';
          setTimeout(() => {
            if (dot.parentNode) {
              dot.parentNode.removeChild(dot);
            }
          }, 800);
        }, 50);
      };
      
      createTrailDot();
    }

    animateBounce();
  }, [beat, bpm, subdivision, isPlaying, showTrail, beatInterval]);

  // Subdivision indicators
  const getSubdivisionDots = () => {
    const counts = {
      quarter: 4,
      eighth: 8, 
      triplet: 3,
      sixteenth: 16
    };
    
    return Array.from({ length: counts[subdivision] }, (_, i) => (
      <div 
        key={i}
        className={`subdivision-dot ${i < beat ? 'active' : ''}`}
        style={{
          width: '6px',
          height: '6px',
          background: i < beat ? 'var(--ink)' : 'var(--stroke)',
          margin: '2px',
          transition: 'background 0.1s ease',
          border: '1px solid var(--stroke)'
        }}
      />
    ));
  };

  return (
    <div className="bouncing-beat-indicator">
      <div 
        ref={containerRef}
        className={`beat-container ${sizeClasses[size]}`}
        style={{
          position: 'relative',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.1) 100%)',
          border: '2px solid var(--stroke)',
          borderRadius: '0',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          overflow: 'hidden'
        }}
      >
        {/* Trail container */}
        {showTrail && (
          <div 
            ref={trailRef}
            className="trail-container"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: 'none',
              zIndex: 1
            }}
          />
        )}
        
        {/* Bouncing ball */}
        <div
          ref={ballRef}
          className={`bouncing-ball ${ballSizeClasses[size]}`}
          style={{
            background: isPlaying ? 
              (beat === 1 ? 'var(--ink)' : 'var(--ink-muted)') : 
              'var(--stroke)',
            position: 'relative',
            zIndex: 2,
            marginBottom: '4px',
            transition: 'background 0.1s ease',
            boxShadow: isPlaying ? 
              '0 2px 8px rgba(0,0,0,0.3), 0 0 0 1px var(--shadow-hi)' : 
              'none'
          }}
        />
        
        {/* Beat number display */}
        <div 
          className="beat-number"
          style={{
            position: 'absolute',
            bottom: '-30px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '14px',
            fontWeight: 700,
            color: 'var(--ink)',
            fontFamily: 'var(--font-dm-mono), monospace'
          }}
        >
          {isPlaying ? beat || '—' : '—'}
        </div>
      </div>

      {/* Subdivision indicator dots */}
      <div 
        className="subdivision-indicators"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: '40px',
          flexWrap: 'wrap',
          maxWidth: '200px',
          margin: '40px auto 0'
        }}
      >
        {getSubdivisionDots()}
      </div>
      
      {/* Subdivision label */}
      <div 
        className="subdivision-label"
        style={{
          textAlign: 'center',
          marginTop: '8px',
          fontSize: '12px',
          color: 'var(--ink-muted)',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}
      >
        {subdivision === 'quarter' ? 'Quarter Notes' :
         subdivision === 'eighth' ? '8th Notes' :
         subdivision === 'triplet' ? 'Triplets' : 
         '16th Notes'}
      </div>
    </div>
  );
}