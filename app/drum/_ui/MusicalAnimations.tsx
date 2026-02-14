"use client";

import React, { ReactNode, useEffect, useState, useRef } from "react";

// Musical timing-based easing functions
const musicalEasings = {
  // Like a drum hit - quick attack, slower release
  drumHit: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  // Like a cymbal swell - slow build, quick finish
  cymbalSwell: 'cubic-bezier(0.4, 0, 0.2, 1)',
  // Natural musical rhythm
  rhythmic: 'cubic-bezier(0.23, 1, 0.32, 1)',
  // Bouncy like a stick rebound
  rebound: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  // Smooth like a sustained note
  sustain: 'cubic-bezier(0.4, 0, 0.6, 1)'
};

interface PageTransitionProps {
  children: ReactNode;
  direction?: 'slide-right' | 'slide-left' | 'fade' | 'scale';
  duration?: number;
  delay?: number;
}

export function PageTransition({
  children,
  direction = 'fade',
  duration = 600,
  delay = 0
}: PageTransitionProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const getTransformStyle = () => {
    if (!isVisible) {
      switch (direction) {
        case 'slide-right':
          return 'translateX(20px)';
        case 'slide-left':
          return 'translateX(-20px)';
        case 'scale':
          return 'scale(0.95)';
        default:
          return 'none';
      }
    }
    return 'none';
  };

  return (
    <div
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransformStyle(),
        transition: `opacity ${duration}ms ${musicalEasings.rhythmic}, 
                     transform ${duration}ms ${musicalEasings.rhythmic}`,
      }}
    >
      {children}
    </div>
  );
}

interface BeatPulseProps {
  isActive: boolean;
  bpm: number;
  intensity?: number;
  children: ReactNode;
}

export function BeatPulse({
  isActive,
  bpm,
  intensity = 1,
  children
}: BeatPulseProps) {
  const [isPulsing, setIsPulsing] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive) {
      const interval = (60 / bpm) * 1000;
      
      intervalRef.current = window.setInterval(() => {
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 150);
      }, interval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsPulsing(false);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, bpm]);

  return (
    <div
      style={{
        transform: isPulsing ? `scale(${1 + 0.05 * intensity})` : 'scale(1)',
        transition: `transform 150ms ${musicalEasings.drumHit}`,
        transformOrigin: 'center'
      }}
    >
      {children}
    </div>
  );
}

interface RhythmicFadeInProps {
  children: ReactNode[];
  bpm?: number;
  startDelay?: number;
}

export function RhythmicFadeIn({
  children,
  bpm = 120,
  startDelay = 0
}: RhythmicFadeInProps) {
  const [visibleCount, setVisibleCount] = useState(0);
  const beatInterval = (60 / bpm) * 1000;

  useEffect(() => {
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setVisibleCount(prev => {
          if (prev >= children.length) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, beatInterval / 2); // Half beat for smoother appearance

      return () => clearInterval(interval);
    }, startDelay);

    return () => clearTimeout(timer);
  }, [children.length, beatInterval, startDelay]);

  return (
    <>
      {children.map((child, index) => (
        <div
          key={index}
          style={{
            opacity: index < visibleCount ? 1 : 0,
            transform: index < visibleCount ? 'translateY(0)' : 'translateY(10px)',
            transition: `opacity 300ms ${musicalEasings.rhythmic}, 
                         transform 300ms ${musicalEasings.rhythmic}`,
          }}
        >
          {child}
        </div>
      ))}
    </>
  );
}

interface FloatingElementProps {
  children: ReactNode;
  amplitude?: number;
  duration?: number;
  delay?: number;
}

export function FloatingElement({
  children,
  amplitude = 5,
  duration = 3000,
  delay = 0
}: FloatingElementProps) {
  const [offset, setOffset] = useState(0);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    const animate = (currentTime: number) => {
      if (startTimeRef.current === 0) {
        startTimeRef.current = currentTime + delay;
      }

      if (currentTime >= startTimeRef.current) {
        const elapsed = currentTime - startTimeRef.current;
        const progress = (elapsed % duration) / duration;
        const newOffset = Math.sin(progress * Math.PI * 2) * amplitude;
        setOffset(newOffset);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [amplitude, duration, delay]);

  return (
    <div
      style={{
        transform: `translateY(${offset}px)`,
        transition: 'none'
      }}
    >
      {children}
    </div>
  );
}

interface SlideUpSequenceProps {
  children: ReactNode[];
  stagger?: number;
  startDelay?: number;
}

export function SlideUpSequence({
  children,
  stagger = 100,
  startDelay = 0
}: SlideUpSequenceProps) {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      children.forEach((_, index) => {
        setTimeout(() => {
          setVisibleCount(prev => Math.max(prev, index + 1));
        }, index * stagger);
      });
    }, startDelay);

    return () => clearTimeout(timer);
  }, [children.length, stagger, startDelay]);

  return (
    <>
      {children.map((child, index) => (
        <div
          key={index}
          style={{
            opacity: index < visibleCount ? 1 : 0,
            transform: index < visibleCount ? 'translateY(0)' : 'translateY(30px)',
            transition: `opacity 400ms ${musicalEasings.sustain}, 
                         transform 400ms ${musicalEasings.sustain}`,
          }}
        >
          {child}
        </div>
      ))}
    </>
  );
}

interface TempoVisualizerProps {
  bpm: number;
  isPlaying: boolean;
  size?: number;
  showRipples?: boolean;
}

export function TempoVisualizer({
  bpm,
  isPlaying,
  size = 60,
  showRipples = true
}: TempoVisualizerProps) {
  const [beat, setBeat] = useState(0);
  const [ripples, setRipples] = useState<{ id: number; scale: number }[]>([]);
  const intervalRef = useRef<number | null>(null);
  const rippleIdRef = useRef(0);

  useEffect(() => {
    if (isPlaying) {
      const interval = (60 / bpm) * 1000;
      
      intervalRef.current = window.setInterval(() => {
        setBeat(prev => (prev + 1) % 4);
        
        if (showRipples) {
          const newRipple = { id: rippleIdRef.current++, scale: 0 };
          setRipples(prev => [...prev, newRipple]);
          
          // Animate ripple
          requestAnimationFrame(() => {
            setRipples(prev => 
              prev.map(r => r.id === newRipple.id ? { ...r, scale: 2 } : r)
            );
          });
          
          // Remove ripple after animation
          setTimeout(() => {
            setRipples(prev => prev.filter(r => r.id !== newRipple.id));
          }, 800);
        }
      }, interval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setBeat(0);
      setRipples([]);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, bpm, showRipples]);

  return (
    <div style={{
      position: 'relative',
      width: size,
      height: size,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Ripple effects */}
      {ripples.map(ripple => (
        <div
          key={ripple.id}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            border: '2px solid var(--ink)',
            borderRadius: '50%',
            opacity: ripple.scale > 0 ? 0.6 - (ripple.scale * 0.3) : 0,
            transform: `scale(${ripple.scale})`,
            transition: `transform 800ms ${musicalEasings.cymbalSwell}, opacity 800ms linear`,
            pointerEvents: 'none'
          }}
        />
      ))}
      
      {/* Center beat indicator */}
      <div style={{
        width: '60%',
        height: '60%',
        background: isPlaying ? (beat === 0 ? 'var(--ink)' : 'var(--ink-muted)') : 'var(--stroke)',
        borderRadius: '50%',
        transform: isPlaying && beat === 0 ? 'scale(1.2)' : 'scale(1)',
        transition: `all 100ms ${musicalEasings.drumHit}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--bg)',
        fontSize: size * 0.25,
        fontWeight: 700,
        fontFamily: 'var(--font-dm-mono), monospace'
      }}>
        {isPlaying ? beat + 1 : '—'}
      </div>
    </div>
  );
}

interface ProgressAnimationProps {
  progress: number;
  width?: number;
  height?: number;
  animated?: boolean;
  musicSync?: boolean;
  bpm?: number;
}

export function ProgressAnimation({
  progress,
  width = 200,
  height = 8,
  animated = true,
  musicSync = false,
  bpm = 120
}: ProgressAnimationProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [pulse, setPulse] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setAnimatedProgress(progress);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setAnimatedProgress(progress);
    }
  }, [progress, animated]);

  useEffect(() => {
    if (musicSync) {
      const interval = (60 / bpm) * 1000;
      
      intervalRef.current = window.setInterval(() => {
        setPulse(true);
        setTimeout(() => setPulse(false), 100);
      }, interval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setPulse(false);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [musicSync, bpm]);

  return (
    <div style={{
      width,
      height,
      background: 'var(--stroke)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div
        style={{
          width: `${animatedProgress}%`,
          height: '100%',
          background: pulse ? 'var(--ink)' : 'var(--ink-muted)',
          transition: animated ? 
            `width 800ms ${musicalEasings.sustain}, background 100ms ${musicalEasings.drumHit}` : 
            `background 100ms ${musicalEasings.drumHit}`,
          position: 'relative'
        }}
      >
        {/* Progress shimmer effect */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
          transform: 'translateX(-100%)',
          animation: animatedProgress > 0 ? 'shimmer 2s infinite' : 'none',
        }} />
      </div>
      
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(${width}px); }
        }
      `}</style>
    </div>
  );
}

// Higher-order component for adding musical hover effects
interface MusicalHoverProps {
  children: ReactNode;
  hoverScale?: number;
  hoverIntensity?: number;
  className?: string;
}

export function MusicalHover({
  children,
  hoverScale = 1.02,
  hoverIntensity = 0.8,
  className = ""
}: MusicalHoverProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? `scale(${hoverScale})` : 'scale(1)',
        filter: isHovered ? `brightness(${1 + hoverIntensity * 0.1})` : 'brightness(1)',
        transition: `transform 200ms ${musicalEasings.rebound}, filter 200ms ease`,
        cursor: 'pointer'
      }}
    >
      {children}
    </div>
  );
}

// Component for creating rhythmic loading animations
interface RhythmicLoaderProps {
  isLoading: boolean;
  bpm?: number;
  dotCount?: number;
  size?: number;
}

export function RhythmicLoader({
  isLoading,
  bpm = 120,
  dotCount = 4,
  size = 8
}: RhythmicLoaderProps) {
  const [activeDot, setActiveDot] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isLoading) {
      const interval = (60 / bpm / 2) * 1000; // Half beat intervals
      
      intervalRef.current = window.setInterval(() => {
        setActiveDot(prev => (prev + 1) % dotCount);
      }, interval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setActiveDot(0);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isLoading, bpm, dotCount]);

  if (!isLoading) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: size / 2
    }}>
      {Array.from({ length: dotCount }).map((_, index) => (
        <div
          key={index}
          style={{
            width: size,
            height: size,
            background: index === activeDot ? 'var(--ink)' : 'var(--stroke)',
            transition: `background 100ms ${musicalEasings.drumHit}, transform 100ms ${musicalEasings.drumHit}`,
            transform: index === activeDot ? 'scale(1.2)' : 'scale(1)'
          }}
        />
      ))}
    </div>
  );
}

export { musicalEasings };