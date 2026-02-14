"use client";

import React, { useEffect, useState, useRef } from "react";

interface SessionNote {
  id: string;
  timestamp: number;
  content: string;
  type: 'note' | 'milestone' | 'struggle' | 'breakthrough';
}

interface PracticeSession {
  id: string;
  startTime: number;
  endTime?: number;
  duration: number; // in seconds
  bpm: number;
  mode: string;
  notes: SessionNote[];
  accuracy?: number;
  completed: boolean;
}

interface PracticeSessionTrackerProps {
  isActive: boolean;
  onStart: () => void;
  onStop: (session: PracticeSession) => void;
  onPause?: () => void;
  onResume?: () => void;
  bpm: number;
  mode: string;
  accuracy?: number;
  targetDuration?: number; // in minutes
}

export default function PracticeSessionTracker({
  isActive,
  onStart,
  onStop,
  onPause,
  onResume,
  bpm,
  mode,
  accuracy = 0,
  targetDuration = 20
}: PracticeSessionTrackerProps) {
  const [currentSession, setCurrentSession] = useState<PracticeSession | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [notes, setNotes] = useState<SessionNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [noteType, setNoteType] = useState<SessionNote['type']>('note');
  const [recentSessions] = useState<PracticeSession[]>([]);
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  // Start session
  useEffect(() => {
    if (isActive && !currentSession) {
      const newSession: PracticeSession = {
        id: `session-${Date.now()}`,
        startTime: Date.now(),
        duration: 0,
        bpm,
        mode,
        notes: [],
        completed: false
      };
      
      setCurrentSession(newSession);
      setElapsed(0);
      setNotes([]);
      setIsPaused(false);
      startTimeRef.current = Date.now();
      pausedTimeRef.current = 0;
      
      onStart();
    }
  }, [isActive, currentSession, bpm, mode, onStart]);

  // Timer logic
  useEffect(() => {
    if (isActive && currentSession && !isPaused) {
      intervalRef.current = window.setInterval(() => {
        const now = Date.now();
        const totalElapsed = Math.floor((now - startTimeRef.current - pausedTimeRef.current) / 1000);
        setElapsed(totalElapsed);
        
        setCurrentSession(prev => prev ? {
          ...prev,
          duration: totalElapsed,
          accuracy
        } : null);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, currentSession, isPaused, accuracy]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progressPercentage = targetDuration ? Math.min((elapsed / (targetDuration * 60)) * 100, 100) : 0;

  // Handle pause/resume
  const handlePause = () => {
    if (!isPaused) {
      setIsPaused(true);
      pausedTimeRef.current += Date.now() - (startTimeRef.current + elapsed * 1000 + pausedTimeRef.current);
      onPause?.();
    } else {
      setIsPaused(false);
      onResume?.();
    }
  };

  // Add note during session
  const addNote = () => {
    if (!newNote.trim() || !currentSession) return;

    const note: SessionNote = {
      id: `note-${Date.now()}`,
      timestamp: elapsed,
      content: newNote.trim(),
      type: noteType
    };

    const updatedNotes = [...notes, note];
    setNotes(updatedNotes);
    setCurrentSession(prev => prev ? {
      ...prev,
      notes: updatedNotes
    } : null);
    setNewNote("");
  };

  // End session
  const handleStop = () => {
    if (!currentSession) return;

    const finalSession: PracticeSession = {
      ...currentSession,
      endTime: Date.now(),
      duration: elapsed,
      notes,
      accuracy,
      completed: true
    };

    onStop(finalSession);
    setCurrentSession(null);
    setElapsed(0);
    setNotes([]);
    setIsPaused(false);
  };

  // Quick note buttons
  const quickNotes = [
    { type: 'milestone' as const, icon: '🎯', label: 'Milestone', color: 'var(--ink)' },
    { type: 'struggle' as const, icon: '⚠', label: 'Challenge', color: 'var(--ink-muted)' },
    { type: 'breakthrough' as const, icon: '💡', label: 'Breakthrough', color: 'var(--ink)' },
    { type: 'note' as const, icon: '📝', label: 'Note', color: 'var(--ink-muted)' }
  ];

  const addQuickNote = (type: SessionNote['type'], defaultContent: string) => {
    if (!currentSession) return;

    const note: SessionNote = {
      id: `note-${Date.now()}`,
      timestamp: elapsed,
      content: defaultContent,
      type
    };

    const updatedNotes = [...notes, note];
    setNotes(updatedNotes);
    setCurrentSession(prev => prev ? {
      ...prev,
      notes: updatedNotes
    } : null);
  };

  if (!isActive && !currentSession) {
    return (
      <div className="practice-session-tracker inactive" style={{
        padding: '20px',
        background: 'var(--panel)',
        border: '2px solid var(--stroke)',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '16px',
          color: 'var(--ink-muted)',
          marginBottom: '15px'
        }}>
          Ready to start practice session
        </div>
        
        <div style={{
          fontSize: '14px',
          color: 'var(--ink-muted)',
          marginBottom: '20px'
        }}>
          Target: {targetDuration} minutes • Mode: {mode} • {bpm} BPM
        </div>
        
        <button 
          onClick={onStart}
          className="btn"
          style={{
            background: 'var(--ink)',
            color: 'var(--bg)',
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 700
          }}
        >
          Start Session
        </button>
      </div>
    );
  }

  return (
    <div className="practice-session-tracker active" style={{
      padding: '20px',
      background: 'var(--panel-deep)',
      border: '3px solid var(--ink)',
      position: 'sticky',
      top: '20px',
      zIndex: 10
    }}>
      {/* Session Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div>
          <div style={{
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--ink)',
            fontFamily: 'var(--font-dm-mono), monospace'
          }}>
            {formatTime(elapsed)}
          </div>
          <div style={{
            fontSize: '13px',
            color: 'var(--ink-muted)',
            marginTop: '2px'
          }}>
            {mode} • {bpm} BPM
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}>
          {accuracy > 0 && (
            <div style={{
              background: accuracy >= 80 ? 'var(--ink)' : 'var(--ink-muted)',
              color: 'var(--bg)',
              padding: '4px 8px',
              fontSize: '12px',
              fontWeight: 600
            }}>
              {Math.round(accuracy)}% accuracy
            </div>
          )}
          
          <button
            onClick={handlePause}
            className="btn btn-small"
            style={{
              background: isPaused ? 'var(--ink)' : 'var(--stroke)',
              color: isPaused ? 'var(--bg)' : 'var(--ink)'
            }}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          
          <button
            onClick={handleStop}
            className="btn btn-small"
            style={{
              background: 'var(--ink)',
              color: 'var(--bg)'
            }}
          >
            Stop
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {targetDuration && (
        <div style={{
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '5px'
          }}>
            <span style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>
              Progress
            </span>
            <span style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>
              {Math.round(progressPercentage)}% ({targetDuration}min goal)
            </span>
          </div>
          
          <div style={{
            width: '100%',
            height: '8px',
            background: 'var(--stroke)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progressPercentage}%`,
              height: '100%',
              background: progressPercentage >= 100 ? 'var(--ink)' : 'var(--ink-muted)',
              transition: 'width 0.5s ease'
            }} />
          </div>
        </div>
      )}

      {/* Quick Notes */}
      <div style={{
        marginBottom: '15px'
      }}>
        <div style={{
          fontSize: '13px',
          color: 'var(--ink-muted)',
          marginBottom: '8px',
          fontWeight: 600
        }}>
          Quick Log:
        </div>
        
        <div style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          {quickNotes.map(({ type, label, color }) => (
            <button
              key={type}
              onClick={() => addQuickNote(type, `${label} at ${formatTime(elapsed)}`)}
              className="btn btn-small"
              style={{
                fontSize: '11px',
                padding: '4px 8px',
                background: color === 'var(--ink)' ? 'var(--ink)' : 'var(--stroke)',
                color: color === 'var(--ink)' ? 'var(--bg)' : 'var(--ink)',
                border: `1px solid ${color}`
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Note Input */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '15px'
      }}>
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addNote()}
          placeholder="Add note..."
          style={{
            flex: 1,
            padding: '8px',
            background: 'var(--bg)',
            border: '1px solid var(--stroke)',
            fontSize: '13px',
            color: 'var(--ink)'
          }}
        />
        
        <select
          value={noteType}
          onChange={(e) => setNoteType(e.target.value as SessionNote['type'])}
          style={{
            padding: '8px',
            background: 'var(--bg)',
            border: '1px solid var(--stroke)',
            fontSize: '13px',
            color: 'var(--ink)'
          }}
        >
          <option value="note">Note</option>
          <option value="milestone">Milestone</option>
          <option value="struggle">Challenge</option>
          <option value="breakthrough">Breakthrough</option>
        </select>
        
        <button
          onClick={addNote}
          disabled={!newNote.trim()}
          className="btn btn-small"
          style={{
            background: newNote.trim() ? 'var(--ink)' : 'var(--stroke)',
            color: newNote.trim() ? 'var(--bg)' : 'var(--ink-muted)'
          }}
        >
          Add
        </button>
      </div>

      {/* Session Notes */}
      {notes.length > 0 && (
        <div style={{
          maxHeight: '120px',
          overflowY: 'auto',
          background: 'var(--bg)',
          border: '1px solid var(--stroke)',
          padding: '10px'
        }}>
          <div style={{
            fontSize: '12px',
            color: 'var(--ink-muted)',
            marginBottom: '8px',
            fontWeight: 600
          }}>
            Session Notes ({notes.length}):
          </div>
          
          {notes.map((note) => (
            <div
              key={note.id}
              style={{
                marginBottom: '6px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px'
              }}
            >
              <span style={{
                color: 'var(--ink-muted)',
                fontFamily: 'var(--font-dm-mono), monospace',
                minWidth: '45px'
              }}>
                {formatTime(note.timestamp)}
              </span>
              
              <span style={{
                background: note.type === 'milestone' ? 'var(--ink)' :
                           note.type === 'breakthrough' ? 'var(--ink)' :
                           note.type === 'struggle' ? 'var(--ink-muted)' : 
                           'var(--stroke)',
                color: note.type === 'milestone' || note.type === 'breakthrough' ? 'var(--bg)' : 'var(--ink)',
                padding: '2px 6px',
                fontSize: '10px',
                fontWeight: 600,
                textTransform: 'uppercase',
                minWidth: '60px',
                textAlign: 'center'
              }}>
                {note.type}
              </span>
              
              <span style={{ color: 'var(--ink)', flex: 1 }}>
                {note.content}
              </span>
            </div>
          ))}
        </div>
      )}

      {isPaused && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--bg)',
          fontSize: '18px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '2px'
        }}>
          Session Paused
        </div>
      )}
    </div>
  );
}