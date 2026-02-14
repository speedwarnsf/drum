"use client";

import React, { useEffect, useState } from "react";
import { Icon } from "./Icon";

interface PracticeStreak {
  current: number;
  longest: number;
  lastSession: string | null;
  isActive: boolean;
}

interface LastSession {
  date: string;
  duration: number;
  mode: string;
  bpm: number;
  accuracy?: number;
  incomplete?: boolean;
  leftOff?: {
    block: string;
    timeRemaining: number;
  };
}

interface SuggestedRoutine {
  id: string;
  title: string;
  description: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  focus: string[];
  blocks: Array<{
    name: string;
    duration: number;
    description: string;
  }>;
}

interface CompellingTodayCardProps {
  streak: PracticeStreak;
  lastSession: LastSession | null;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  focusAreas?: string[];
  onStartRoutine: (routine: SuggestedRoutine) => void;
  onContinueSession?: (session: LastSession) => void;
}

const PRACTICE_ROUTINES: SuggestedRoutine[] = [
  {
    id: 'morning-warmup',
    title: 'Morning Energy Boost',
    description: 'Start your day with focused fundamentals',
    duration: 15,
    difficulty: 'beginner',
    focus: ['timing', 'rudiments', 'coordination'],
    blocks: [
      { name: 'Stick Control', duration: 5, description: 'Single stroke roll at various speeds' },
      { name: 'Rudiment Focus', duration: 7, description: 'Work on 2-3 essential rudiments' },
      { name: 'Groove Practice', duration: 3, description: 'Simple rock beats to build muscle memory' }
    ]
  },
  {
    id: 'technique-builder',
    title: 'Technique Deep Dive',
    description: 'Advanced skill development for precision',
    duration: 25,
    difficulty: 'intermediate',
    focus: ['technique', 'rudiments', 'speed'],
    blocks: [
      { name: 'Technical Warm-up', duration: 5, description: 'Paradiddles and flam patterns' },
      { name: 'Speed Building', duration: 10, description: 'Graduated tempo training' },
      { name: 'Precision Work', duration: 10, description: 'Accent patterns and dynamics' }
    ]
  },
  {
    id: 'creative-exploration',
    title: 'Creative Flow Session',
    description: 'Explore musical ideas and improvisation',
    duration: 30,
    difficulty: 'advanced',
    focus: ['creativity', 'improvisation', 'musicality'],
    blocks: [
      { name: 'Groove Variations', duration: 10, description: 'Transform basic patterns' },
      { name: 'Free Improvisation', duration: 15, description: 'Unstructured creative playing' },
      { name: 'Style Integration', duration: 5, description: 'Apply new concepts to songs' }
    ]
  },
  {
    id: 'consistency-challenge',
    title: 'Steady State Marathon',
    description: 'Build endurance and rock-solid timing',
    duration: 20,
    difficulty: 'intermediate',
    focus: ['timing', 'endurance', 'consistency'],
    blocks: [
      { name: 'Metronome Lock', duration: 8, description: 'Perfect click synchronization' },
      { name: 'Endurance Test', duration: 10, description: 'Maintain groove without breaks' },
      { name: 'Timing Verification', duration: 2, description: 'Accuracy assessment' }
    ]
  }
];

export default function CompellingTodayCard({
  streak,
  lastSession,
  skillLevel,
  focusAreas = [],
  onStartRoutine,
  onContinueSession
}: CompellingTodayCardProps) {
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [motivationalMessage, setMotivationalMessage] = useState('');
  const [suggestedRoutines, setSuggestedRoutines] = useState<SuggestedRoutine[]>([]);

  // Determine time of day and generate contextual content
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setTimeOfDay('morning');
    } else if (hour < 18) {
      setTimeOfDay('afternoon');
    } else {
      setTimeOfDay('evening');
    }

    // Generate motivational message based on streak and time
    const messages = {
      morning: {
        high: ['Fuel your morning with rhythm!', 'Start strong - your hands are ready!'],
        medium: ['Morning practice sets the tone for greatness', 'Time to wake up those hands'],
        low: ['Fresh start, fresh beats - let\'s build momentum']
      },
      afternoon: {
        high: ['Midday momentum - keep the streak alive!', 'Afternoon energy boost through drumming'],
        medium: ['Perfect time for a focused session', 'Afternoon practice = evening satisfaction'],
        low: ['Turn this afternoon into drum progress']
      },
      evening: {
        high: ['Evening excellence - finish strong today!', 'End your day with rhythmic mastery'],
        medium: ['Wind down with purposeful practice', 'Evening session for tomorrow\'s confidence'],
        low: ['Transform your evening with some drumming']
      }
    };

    const streakLevel = streak.current >= 7 ? 'high' : streak.current >= 3 ? 'medium' : 'low';
    const timeMessages = messages[timeOfDay][streakLevel];
    setMotivationalMessage(timeMessages[Math.floor(Math.random() * timeMessages.length)]);

    // Filter and sort routines by relevance
    const relevant = PRACTICE_ROUTINES.filter(routine => {
      // Match skill level or one level above for growth
      const skillLevels = ['beginner', 'intermediate', 'advanced'];
      // Normalize: treat anything not in the list (e.g. true_beginner) as beginner
      const normalizedLevel = skillLevels.includes(skillLevel) ? skillLevel : 'beginner';
      const currentIndex = skillLevels.indexOf(normalizedLevel);
      const allowedLevels: string[] = [normalizedLevel];
      if (currentIndex < skillLevels.length - 1) {
        allowedLevels.push(skillLevels[currentIndex + 1]);
      }
      
      if (!allowedLevels.includes(routine.difficulty)) return false;
      
      return true;
    }).sort((a, b) => {
      // Prioritize by time of day
      if (timeOfDay === 'morning' && a.id === 'morning-warmup') return -1;
      if (timeOfDay === 'morning' && b.id === 'morning-warmup') return 1;
      if (timeOfDay === 'evening' && a.id === 'creative-exploration') return -1;
      if (timeOfDay === 'evening' && b.id === 'creative-exploration') return 1;
      
      // Then by focus area match
      const aMatches = a.focus.filter(f => focusAreas.includes(f)).length;
      const bMatches = b.focus.filter(f => focusAreas.includes(f)).length;
      return bMatches - aMatches;
    });

    setSuggestedRoutines(relevant.slice(0, 3));
  }, [timeOfDay, streak, skillLevel, focusAreas]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'var(--ink-muted)';
      case 'intermediate': return 'var(--ink)';
      case 'advanced': return 'var(--ink)';
      default: return 'var(--ink-muted)';
    }
  };

  const getStreakEmoji = (current: number) => {
    if (current >= 30) return '';  // No emoji rule
    if (current >= 14) return '';
    if (current >= 7) return '';
    if (current >= 3) return '';
    return '';
  };

  return (
    <div className="compelling-today-card" style={{
      background: 'linear-gradient(135deg, var(--panel) 0%, var(--panel-deep) 100%)',
      border: '3px solid var(--ink)',
      padding: '25px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative background pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '150px',
        height: '150px',
        background: 'linear-gradient(45deg, transparent 40%, rgba(47,26,0,0.05) 60%)',
        transform: 'rotate(45deg) translate(50px, -50px)',
        pointerEvents: 'none'
      }} />

      {/* Header Section */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <div>
          <div style={{
            fontSize: '24px',
            fontWeight: 700,
            color: 'var(--ink)',
            marginBottom: '5px'
          }}>
            {timeOfDay === 'morning' ? 'Good Morning!' : 
             timeOfDay === 'afternoon' ? 'Good Afternoon!' : 
             'Good Evening!'}
          </div>
          
          <div style={{
            fontSize: '16px',
            color: 'var(--ink-muted)',
            marginBottom: '8px'
          }}>
            {motivationalMessage}
          </div>
          
          {streak.current > 0 && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: streak.isActive ? 'var(--ink)' : 'var(--ink-muted)',
              color: 'var(--bg)',
              padding: '4px 12px',
              fontSize: '14px',
              fontWeight: 600,
              gap: '6px'
            }}>
              <span>{getStreakEmoji(streak.current)}</span>
              <span>{streak.current} day streak</span>
              {!streak.isActive && <span style={{ opacity: 0.8 }}>(broken)</span>}
            </div>
          )}
        </div>
        
        <div style={{
          textAlign: 'right'
        }}>
          <div style={{
            fontSize: '14px',
            color: 'var(--ink-muted)',
            marginBottom: '4px'
          }}>
            Skill Level
          </div>
          <div style={{
            fontSize: '16px',
            fontWeight: 600,
            color: 'var(--ink)',
            textTransform: 'capitalize'
          }}>
            {skillLevel}
          </div>
        </div>
      </div>

      {/* Continue Previous Session */}
      {lastSession && lastSession.incomplete && (
        <div style={{
          background: 'var(--bg)',
          border: '2px solid var(--ink)',
          padding: '15px',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px'
          }}>
            <div>
              <div style={{
                fontSize: '16px',
                fontWeight: 600,
                color: 'var(--ink)',
                marginBottom: '3px'
              }}>
                Continue where you left off
              </div>
              <div style={{
                fontSize: '13px',
                color: 'var(--ink-muted)'
              }}>
                {lastSession.mode} session from {lastSession.date}
              </div>
            </div>
            
            {onContinueSession && (
              <button
                onClick={() => onContinueSession(lastSession)}
                className="btn"
                style={{
                  background: 'var(--ink)',
                  color: 'var(--bg)',
                  padding: '8px 16px',
                  fontWeight: 600
                }}
              >
                Continue
              </button>
            )}
          </div>
          
          {lastSession.leftOff && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '12px',
              color: 'var(--ink-muted)'
            }}>
              <Icon name="clock" size={14} />
              <span>Left off: {lastSession.leftOff.block}</span>
              <span>•</span>
              <span>{Math.round(lastSession.leftOff.timeRemaining)}min remaining</span>
            </div>
          )}
        </div>
      )}

      {/* Suggested Routines */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          fontSize: '18px',
          fontWeight: 600,
          color: 'var(--ink)',
          marginBottom: '15px'
        }}>
          Suggested for you
        </div>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {suggestedRoutines.map((routine) => (
            <div
              key={routine.id}
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--stroke)',
                padding: '15px',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onClick={() => onStartRoutine(routine)}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '8px'
              }}>
                <div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: 'var(--ink)',
                    marginBottom: '3px'
                  }}>
                    {routine.title}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: 'var(--ink-muted)',
                    marginBottom: '8px'
                  }}>
                    {routine.description}
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px'
                }}>
                  <span style={{
                    background: getDifficultyColor(routine.difficulty),
                    color: 'var(--bg)',
                    padding: '2px 6px',
                    fontWeight: 600,
                    textTransform: 'uppercase'
                  }}>
                    {routine.difficulty}
                  </span>
                  <span style={{
                    color: 'var(--ink-muted)',
                    fontWeight: 600
                  }}>
                    {routine.duration}min
                  </span>
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                marginBottom: '10px'
              }}>
                {routine.focus.map((focus) => (
                  <span
                    key={focus}
                    style={{
                      background: focusAreas.includes(focus) ? 'var(--ink)' : 'var(--stroke)',
                      color: focusAreas.includes(focus) ? 'var(--bg)' : 'var(--ink)',
                      padding: '2px 8px',
                      fontSize: '11px',
                      fontWeight: 600,
                      textTransform: 'uppercase'
                    }}
                  >
                    {focus}
                  </span>
                ))}
              </div>
              
              <div style={{
                fontSize: '11px',
                color: 'var(--ink-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span>{routine.blocks.length} blocks:</span>
                <span>{routine.blocks.map(b => b.name).join(' • ')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
        gap: '15px',
        marginTop: '20px',
        paddingTop: '20px',
        borderTop: '1px solid var(--stroke)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '20px',
            fontWeight: 700,
            color: 'var(--ink)',
            fontFamily: 'var(--font-dm-mono), monospace'
          }}>
            {streak.current}
          </div>
          <div style={{
            fontSize: '12px',
            color: 'var(--ink-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Current Streak
          </div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '20px',
            fontWeight: 700,
            color: 'var(--ink)',
            fontFamily: 'var(--font-dm-mono), monospace'
          }}>
            {streak.longest}
          </div>
          <div style={{
            fontSize: '12px',
            color: 'var(--ink-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Best Streak
          </div>
        </div>
        
        {lastSession && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '20px',
              fontWeight: 700,
              color: 'var(--ink)',
              fontFamily: 'var(--font-dm-mono), monospace'
            }}>
              {lastSession.accuracy ? `${Math.round(lastSession.accuracy)}%` : `${lastSession.duration}min`}
            </div>
            <div style={{
              fontSize: '12px',
              color: 'var(--ink-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {lastSession.accuracy ? 'Last Accuracy' : 'Last Session'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}