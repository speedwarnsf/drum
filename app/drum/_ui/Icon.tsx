'use client';
import React from 'react';

interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

/**
 * Repodrum Icon System
 * 
 * Clean, minimal SVG icons for the "Quiet Master" aesthetic.
 * All icons use currentColor and are designed for consistency.
 */

// All SVG paths for Repodrum icons
const ICONS: Record<string, React.ReactNode> = {
  // === Navigation ===
  today: <path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm4.293,11.707-3.586-3.586A1,1,0,0,1,12.414,9.414l3.586,3.586a1,1,0,0,1-1.414,1.414ZM13,7a1,1,0,0,1-2,0V6a1,1,0,0,1,2,0Z"/>,
  
  patterns: <path d="M18,22H6a3,3,0,0,1-3-3V5A3,3,0,0,1,6,2H18a3,3,0,0,1,3,3V19A3,3,0,0,1,18,22ZM7,6A1,1,0,0,0,7,8h6a1,1,0,0,0,0-2Zm0,4a1,1,0,0,0,0,2H17a1,1,0,0,0,0-2Zm0,4a1,1,0,0,0,0,2H17a1,1,0,0,0,0-2Zm0,4a1,1,0,0,0,0,2h4a1,1,0,0,0,0-2Z"/>,
  
  drills: <><path d="M12,2V8l4-2V2a1,1,0,0,0-1-1H9A1,1,0,0,0,8,2V6l4,2Z"/><path d="M18,10H6a2,2,0,0,0-2,2v8a2,2,0,0,0,2,2H18a2,2,0,0,0,2-2V12A2,2,0,0,0,18,10ZM10,18a2,2,0,1,1,2-2A2,2,0,0,1,10,18Zm4-4a1,1,0,1,1,1-1A1,1,0,0,1,14,14Z"/></>,
  
  progress: <><path d="M3,13H5a1,1,0,0,1,1,1v6a1,1,0,0,1-1,1H3a1,1,0,0,1-1-1V14A1,1,0,0,1,3,13Z"/><path d="M10,9h2a1,1,0,0,1,1,1V20a1,1,0,0,1-1,1H10a1,1,0,0,1-1-1V10A1,1,0,0,1,10,9Z"/><path d="M17,4h2a1,1,0,0,1,1,1V20a1,1,0,0,1-1,1H17a1,1,0,0,1-1-1V5A1,1,0,0,1,17,4Z"/></>,
  
  skills: <path d="M20,9a1,1,0,0,0,1-1V4a1,1,0,0,0-1-1H16a1,1,0,0,0-1,1V5H9V4A1,1,0,0,0,8,3H4A1,1,0,0,0,3,4V8A1,1,0,0,0,4,9H5v6H4a1,1,0,0,0-1,1v4a1,1,0,0,0,1,1H8a1,1,0,0,0,1-1V19h6v1a1,1,0,0,0,1,1h4a1,1,0,0,0,1-1V16a1,1,0,0,0-1-1H19V9Zm-3,6H16a1,1,0,0,0-1,1v1H9V16a1,1,0,0,0-1-1H7V9H8A1,1,0,0,0,9,8V7h6V8a1,1,0,0,0,1,1h1Z"/>,
  
  community: <><circle cx="12" cy="8" r="4"/><path d="M12,14c-4.337,0-8,2.243-8,5v2a1,1,0,0,0,1,1H19a1,1,0,0,0,1-1V19C20,16.243,16.337,14,12,14Z"/></>,
  
  diagnostic: <><path d="M20.707,19.293l-4.054-4.054A7.948,7.948,0,0,0,18,11a8,8,0,1,0-8,8,7.948,7.948,0,0,0,4.239-1.347l4.054,4.054a1,1,0,0,0,1.414-1.414ZM4,11a6,6,0,1,1,6,6A6.007,6.007,0,0,1,4,11Z"/><path d="M10,7a1,1,0,0,0-1,1,3,3,0,0,0,3,3,1,1,0,0,0,0-2,1,1,0,0,1-1-1A1,1,0,0,0,10,7Z"/></>,
  
  method: <path d="M20,2H6.5A3.5,3.5,0,0,0,3,5.5v13A3.5,3.5,0,0,0,6.5,22H20a1,1,0,0,0,1-1V3A1,1,0,0,0,20,2ZM6.5,20A1.5,1.5,0,0,1,5,18.5,1.5,1.5,0,0,1,6.5,17H19v3Z"/>,
  
  history: <path d="M12,2A10,10,0,0,0,2,12a9.89,9.89,0,0,0,2.26,6.33l-2,2a1,1,0,0,0-.21,1.09A1,1,0,0,0,3,22h9A10,10,0,0,0,12,2Zm0,15a1.5,1.5,0,1,1,1.5-1.5A1.5,1.5,0,0,1,12,17Zm1-5a1,1,0,0,1-2,0V8a1,1,0,0,1,2,0Z"/>,
  
  journal: <><path d="M18,22H6a3,3,0,0,1-3-3V5A3,3,0,0,1,6,2h7.586A2,2,0,0,1,15,2.586L20.414,8A2,2,0,0,1,21,9.414V19A3,3,0,0,1,18,22ZM15,3V8a1,1,0,0,0,1,1h5Z"/></>,
  
  maintenance: <path d="M2,19a1,1,0,0,1,1-1H8.184a3,3,0,1,1,0,2H3A1,1,0,0,1,2,19ZM21,4H19a1,1,0,0,0,0,2h2a1,1,0,0,0,0-2ZM3,6h7.183a3,3,0,1,0,0-2H3A1,1,0,0,0,3,6Zm0,7H6.184a3,3,0,1,0,0-2H3a1,1,0,0,0,0,2Zm18-2H15a1,1,0,0,0,0,2h6a1,1,0,0,0,0-2Zm0,7H17a1,1,0,0,0,0,2h4a1,1,0,0,0,0-2Z"/>,
  
  // === Status & Feedback ===
  success: <path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm5.676,8.237-6,5.5a1,1,0,0,1-1.383-.03l-3-3a1,1,0,1,1,1.414-1.414l2.323,2.323,5.294-4.853a1,1,0,1,1,1.352,1.474Z"/>,
  
  warning: <path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2ZM11,7a1,1,0,0,1,2,0v6a1,1,0,0,1-2,0Zm1,12a1.5,1.5,0,1,1,1.5-1.5A1.5,1.5,0,0,1,12,19Z"/>,
  
  error: <path d="M13.414,12l4.293-4.293a1,1,0,0,0-1.414-1.414L12,10.586,7.707,6.293A1,1,0,0,0,6.293,7.707L10.586,12,6.293,16.293a1,1,0,1,0,1.414,1.414L12,13.414l4.293,4.293a1,1,0,0,0,1.414-1.414Z"/>,
  
  question: <path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,15a1.5,1.5,0,1,1,1.5-1.5A1.5,1.5,0,0,1,12,17Zm1.6-5.2a.76.76,0,0,0-.6.8,1,1,0,0,1-2,0,2.78,2.78,0,0,1,2-2.63A1.5,1.5,0,1,0,10.5,8.5a1,1,0,0,1-2,0,3.5,3.5,0,1,1,5.1,3.3Z"/>,
  
  info: <path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,15a1,1,0,0,1-1-1V12a1,1,0,0,1,2,0v4A1,1,0,0,1,12,17Zm1-8H11V7h2Z"/>,
  
  skip: <path d="M19,5V19a1,1,0,0,1-2,0V13L7.555,19.416A1,1,0,0,1,6,18.555V5.445A1,1,0,0,1,7.555,4.584L17,11V5a1,1,0,0,1,2,0Z"/>,
  
  // === Skill Categories ===
  foundation: <circle cx="12" cy="12" r="8" strokeWidth="2" stroke="currentColor" fill="none"/>,
  
  time: <><circle cx="12" cy="12" r="8" strokeWidth="2" stroke="currentColor" fill="none"/><circle cx="12" cy="12" r="3" fill="currentColor"/></>,
  
  rudiments: <><path d="M8,4L8,20" strokeWidth="2" stroke="currentColor" strokeLinecap="round"/><path d="M16,4L16,20" strokeWidth="2" stroke="currentColor" strokeLinecap="round"/><path d="M5,9L19,15" strokeWidth="2" stroke="currentColor" strokeLinecap="round"/></>,
  
  grooves: <><rect x="4" y="4" width="6" height="6" rx="1" fill="currentColor"/><rect x="14" y="4" width="6" height="6" rx="1" fill="currentColor" opacity="0.6"/><rect x="4" y="14" width="6" height="6" rx="1" fill="currentColor" opacity="0.6"/><rect x="14" y="14" width="6" height="6" rx="1" fill="currentColor"/></>,
  
  coordination: <><path d="M4,12L10,4L14,20L20,12" strokeWidth="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>,
  
  // === Drum-Specific ===
  drum: <><ellipse cx="12" cy="18" rx="8" ry="3" fill="currentColor"/><path d="M4,8v10M20,8v10" stroke="currentColor" strokeWidth="2"/><ellipse cx="12" cy="8" rx="8" ry="3" stroke="currentColor" strokeWidth="2" fill="none"/></>,
  
  metronome: <><path d="M8,22L10,4h4l2,18H8z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><path d="M12,8L17,3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="8" r="2" fill="currentColor"/></>,
  
  recording: <circle cx="12" cy="12" r="6" fill="currentColor"/>,
  
  play: <path d="M6,4.445V19.555a1,1,0,0,0,1.555.832L18.056,12.832a1,1,0,0,0,0-1.664L7.555,3.613A1,1,0,0,0,6,4.445Z"/>,
  
  stop: <rect x="5" y="5" width="14" height="14" rx="2" fill="currentColor"/>,
  
  // === Badge / Achievement Icons ===
  target: <><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none"/><circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" fill="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></>,
  
  flame: <path d="M12,2C9,6,8,8,8,11a4,4,0,0,0,8,0C16,8,15,6,12,2ZM10,11a2,2,0,0,0,4,0c0-1.5-.5-2.5-2-5C10.5,8.5,10,9.5,10,11Z" fillRule="evenodd"/>,
  
  gem: <path d="M12,2L4,8l8,14,8-14ZM12,18L6,9l6-5,6,5Z" fillRule="evenodd"/>,
  
  temple: <><path d="M4,22V11L12,5l8,6V22" stroke="currentColor" strokeWidth="2" fill="none"/><rect x="9" y="14" width="6" height="8" fill="currentColor"/><circle cx="12" cy="10" r="2" fill="currentColor"/></>,
  
  star: <path d="M12,2l2.4,7.4H22l-6,4.4,2.3,7.2L12,16.6,5.7,21l2.3-7.2-6-4.4h7.6Z"/>,
  
  // === Actions ===
  check: <path d="M9,16.17L4.83,12,3.41,13.41,9,19,21,7,19.59,5.59Z"/>,
  
  close: <path d="M13.414,12l4.293-4.293a1,1,0,0,0-1.414-1.414L12,10.586,7.707,6.293A1,1,0,0,0,6.293,7.707L10.586,12,6.293,16.293a1,1,0,1,0,1.414,1.414L12,13.414l4.293,4.293a1,1,0,0,0,1.414-1.414Z"/>,
  
  menu: <><path d="M3,8H21a1,1,0,0,0,0-2H3A1,1,0,0,0,3,8Z"/><path d="M21,11H3a1,1,0,0,0,0,2H21a1,1,0,0,0,0-2Z"/><path d="M21,16H3a1,1,0,0,0,0,2H21a1,1,0,0,0,0-2Z"/></>,
  
  // === Recording Issues ===
  flam: <><circle cx="8" cy="12" r="4" fill="currentColor"/><circle cx="16" cy="12" r="4" fill="currentColor" opacity="0.5"/></>,
  
  rushing: <><path d="M5,12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M15,8l4,4-4,4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>,
  
  dragging: <><path d="M5,12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M9,8l-4,4,4,4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>,
  
  uneven: <><path d="M4,16l4-8,4,8,4-8,4,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>,
  
  dynamics: <><rect x="4" y="14" width="3" height="6" fill="currentColor"/><rect x="9" y="10" width="3" height="10" fill="currentColor"/><rect x="14" y="6" width="3" height="14" fill="currentColor"/><rect x="19" y="4" width="3" height="16" fill="currentColor" opacity="0.5"/></>,
  
  clean: <><path d="M12,2L15,8.5,22,9.5,17,14.5,18,22,12,19,6,22,7,14.5,2,9.5,9,8.5Z" stroke="currentColor" strokeWidth="2" fill="none"/></>,
  
  // === Grade Faces (minimal) ===
  grade0: <><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M8,15h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></>,
  
  grade1: <><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M8,16q4,-2,8,0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/></>,
  
  grade2: <><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M8,15q4,1,8,0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/></>,
  
  grade3: <><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M9,14q3,2,6,0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><circle cx="9" cy="10" r="1" fill="currentColor"/><circle cx="15" cy="10" r="1" fill="currentColor"/></>,
  
  grade4: <><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M8,14q4,3,8,0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><circle cx="9" cy="10" r="1" fill="currentColor"/><circle cx="15" cy="10" r="1" fill="currentColor"/></>,
  
  grade5: <><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M8,13q4,4,8,0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><circle cx="9" cy="9" r="1.5" fill="currentColor"/><circle cx="15" cy="9" r="1.5" fill="currentColor"/></>,
  
  // === Practice Quality ===
  refresh: <><path d="M4,12a8,8,0,0,1,14-5.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><path d="M20,12a8,8,0,0,1-14,5.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><path d="M18,3v4h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/><path d="M6,21v-4h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>,
  
  thumbsUp: <path d="M14,9V4a2,2,0,0,0-2-2L8,9v11h9.28a2,2,0,0,0,2-1.7l1.38-9A2,2,0,0,0,18.72,7H14ZM8,9H4a2,2,0,0,0-2,2v9a2,2,0,0,0,2,2H8"/>,
  
  locked: <path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,11a2,2,0,1,1,2-2A2,2,0,0,1,12,13Zm-3-6a3,3,0,0,1,6,0V9H9Z" fillRule="evenodd"/>,
  
  // === Wrench/Tool ===
  wrench: <path d="M14.7,6.3a1,1,0,0,0,0,1.4l1.6,1.6a1,1,0,0,0,1.4,0l3.77-3.77a6,6,0,0,1-7.94,7.94l-6.91,6.91a2.12,2.12,0,0,1-3-3l6.91-6.91a6,6,0,0,1,7.94-7.94Z"/>,
};

export function Icon({ name, size = 20, className = '' }: IconProps) {
  const iconPath = ICONS[name];
  
  if (!iconPath) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }
  
  return (
    <svg 
      viewBox="0 0 24 24" 
      width={size} 
      height={size}
      fill="currentColor"
      className={`icon ${className}`}
      style={{ flexShrink: 0 }}
      aria-hidden="true"
    >
      {iconPath}
    </svg>
  );
}

// Export icon names for reference
export const ICON_NAMES = Object.keys(ICONS);
