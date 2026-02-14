"use client";

import React, { useEffect, useRef } from "react";

interface PracticeSession {
  date: string;
  duration: number;
  accuracy?: number;
  bpm?: number;
  mode: string;
}

interface RudimentProgress {
  name: string;
  mastery: number; // 0-100
  sessions: number;
  lastPracticed: string;
}

interface StreakData {
  date: string;
  practiced: boolean;
  duration?: number;
}

interface ProgressChartsProps {
  sessions: PracticeSession[];
  rudiments: RudimentProgress[];
  streakData: StreakData[];
  skillLevels: {
    timing: number;
    technique: number;
    creativity: number;
    endurance: number;
  };
  showAnimation?: boolean;
}

export default function ProgressCharts({
  sessions,
  rudiments,
  streakData,
  skillLevels,
  showAnimation = true
}: ProgressChartsProps) {
  const chartRefs = {
    weekly: useRef<HTMLDivElement>(null),
    accuracy: useRef<HTMLDivElement>(null),
    tempo: useRef<HTMLDivElement>(null),
    skills: useRef<HTMLDivElement>(null)
  };

  // Weekly Practice Chart
  const WeeklyChart = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const maxDuration = Math.max(...last7Days.map(date => {
      const dayTotal = sessions
        .filter(s => s.date === date)
        .reduce((sum, s) => sum + s.duration, 0);
      return dayTotal;
    }), 60); // Min 60 minutes for scale

    return (
      <div className="chart-container" style={{ marginBottom: '30px' }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: 600,
          color: 'var(--ink)',
          marginBottom: '15px'
        }}>
          Weekly Practice Volume
        </h3>
        
        <div style={{
          display: 'flex',
          alignItems: 'end',
          height: '120px',
          gap: '8px',
          padding: '0 10px'
        }}>
          {last7Days.map((date, index) => {
            const dayTotal = sessions
              .filter(s => s.date === date)
              .reduce((sum, s) => sum + s.duration, 0);
            
            const height = (dayTotal / maxDuration) * 100;
            const isToday = date === new Date().toISOString().split('T')[0];
            
            return (
              <div
                key={date}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <div style={{
                  fontSize: '11px',
                  color: 'var(--ink-muted)',
                  fontWeight: 600,
                  minHeight: '14px'
                }}>
                  {dayTotal > 0 ? `${dayTotal}min` : ''}
                </div>
                
                <div style={{
                  width: '100%',
                  height: '80px',
                  display: 'flex',
                  alignItems: 'end',
                  position: 'relative'
                }}>
                  <div style={{
                    width: '100%',
                    height: `${height}%`,
                    background: isToday ? 'var(--ink)' : 
                               dayTotal > 0 ? 'var(--ink-muted)' : 'var(--stroke)',
                    transition: showAnimation ? 'height 0.8s ease-out' : 'none',
                    transitionDelay: showAnimation ? `${index * 0.1}s` : '0s',
                    minHeight: dayTotal > 0 ? '3px' : '1px'
                  }} />
                </div>
                
                <div style={{
                  fontSize: '10px',
                  color: isToday ? 'var(--ink)' : 'var(--ink-muted)',
                  fontWeight: isToday ? 600 : 400,
                  textAlign: 'center'
                }}>
                  {new Date(date).toLocaleDateString('en', { weekday: 'short' })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Accuracy Trend Chart
  const AccuracyChart = () => {
    const recentSessions = sessions
      .filter(s => s.accuracy != null)
      .slice(-10)
      .reverse();

    if (recentSessions.length === 0) return null;

    const maxAccuracy = 100;
    const minAccuracy = Math.min(...recentSessions.map(s => s.accuracy || 0));
    const range = maxAccuracy - Math.max(0, minAccuracy - 10);

    return (
      <div className="chart-container" style={{ marginBottom: '30px' }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: 600,
          color: 'var(--ink)',
          marginBottom: '15px'
        }}>
          Timing Accuracy Trend
        </h3>
        
        <div style={{
          height: '100px',
          position: 'relative',
          background: 'var(--bg)',
          border: '1px solid var(--stroke)',
          padding: '10px'
        }}>
          {/* Grid lines */}
          {[25, 50, 75, 100].map(percent => (
            <div key={percent} style={{
              position: 'absolute',
              left: '10px',
              right: '10px',
              top: `${100 - percent}%`,
              height: '1px',
              background: 'var(--stroke)',
              opacity: 0.5
            }}>
              <span style={{
                position: 'absolute',
                left: '-40px',
                top: '-6px',
                fontSize: '9px',
                color: 'var(--ink-muted)'
              }}>
                {percent}%
              </span>
            </div>
          ))}
          
          {/* Accuracy line */}
          <svg
            width="100%"
            height="100%"
            style={{ position: 'absolute', top: 0, left: 0 }}
          >
            <polyline
              fill="none"
              stroke="var(--ink)"
              strokeWidth="2"
              points={recentSessions.map((session, index) => {
                const x = ((index + 1) / (recentSessions.length + 1)) * 100;
                const y = 100 - ((session.accuracy || 0) / range) * 100;
                return `${x},${y}`;
              }).join(' ')}
              style={{
                strokeDasharray: showAnimation ? '1000' : 'none',
                strokeDashoffset: showAnimation ? '1000' : 'none',
                animation: showAnimation ? 'drawLine 2s ease-out forwards' : 'none'
              }}
            />
            
            {/* Data points */}
            {recentSessions.map((session, index) => {
              const x = ((index + 1) / (recentSessions.length + 1)) * 100;
              const y = 100 - ((session.accuracy || 0) / range) * 100;
              
              return (
                <circle
                  key={index}
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r="3"
                  fill="var(--ink)"
                  style={{
                    opacity: showAnimation ? 0 : 1,
                    animation: showAnimation ? `fadeIn 0.5s ease-out ${1.5 + index * 0.1}s forwards` : 'none'
                  }}
                />
              );
            })}
          </svg>
        </div>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '8px',
          fontSize: '11px',
          color: 'var(--ink-muted)'
        }}>
          <span>Last {recentSessions.length} sessions</span>
          <span>Latest: {Math.round(recentSessions[recentSessions.length - 1]?.accuracy || 0)}%</span>
        </div>
      </div>
    );
  };

  // Tempo Progress Chart
  const TempoChart = () => {
    const tempoSessions = sessions
      .filter(s => s.bpm != null)
      .slice(-8)
      .reverse();

    if (tempoSessions.length === 0) return null;

    const maxBpm = Math.max(...tempoSessions.map(s => s.bpm || 0));
    const minBpm = Math.min(...tempoSessions.map(s => s.bpm || 0));

    return (
      <div className="chart-container" style={{ marginBottom: '30px' }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: 600,
          color: 'var(--ink)',
          marginBottom: '15px'
        }}>
          Tempo Development
        </h3>
        
        <div style={{
          display: 'flex',
          alignItems: 'end',
          height: '100px',
          gap: '6px',
          padding: '0 10px'
        }}>
          {tempoSessions.map((session, index) => {
            const height = minBpm === maxBpm ? 50 : 
              ((session.bpm! - minBpm) / (maxBpm - minBpm)) * 80 + 15;
            
            return (
              <div
                key={index}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <div style={{
                  fontSize: '10px',
                  color: 'var(--ink-muted)',
                  fontWeight: 600
                }}>
                  {session.bpm}
                </div>
                
                <div style={{
                  width: '100%',
                  height: `${height}%`,
                  background: 'var(--ink-muted)',
                  transition: showAnimation ? 'height 0.6s ease-out' : 'none',
                  transitionDelay: showAnimation ? `${index * 0.08}s` : '0s',
                  minHeight: '3px'
                }} />
              </div>
            );
          })}
        </div>
        
        <div style={{
          textAlign: 'center',
          marginTop: '8px',
          fontSize: '11px',
          color: 'var(--ink-muted)'
        }}>
          Range: {minBpm} - {maxBpm} BPM
        </div>
      </div>
    );
  };

  // Skills Radar Chart
  const SkillsRadar = () => {
    const skills = [
      { name: 'Timing', value: skillLevels.timing, angle: 0 },
      { name: 'Technique', value: skillLevels.technique, angle: 90 },
      { name: 'Creativity', value: skillLevels.creativity, angle: 180 },
      { name: 'Endurance', value: skillLevels.endurance, angle: 270 }
    ];

    const size = 120;
    const center = size / 2;
    const radius = 40;

    return (
      <div className="chart-container" style={{ marginBottom: '30px' }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: 600,
          color: 'var(--ink)',
          marginBottom: '15px'
        }}>
          Skill Balance
        </h3>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '30px',
          flexWrap: 'wrap'
        }}>
          <div style={{ position: 'relative' }}>
            <svg width={size} height={size}>
              {/* Grid circles */}
              {[0.25, 0.5, 0.75, 1].map(fraction => (
                <circle
                  key={fraction}
                  cx={center}
                  cy={center}
                  r={radius * fraction}
                  fill="none"
                  stroke="var(--stroke)"
                  strokeWidth="1"
                  opacity="0.3"
                />
              ))}
              
              {/* Skill area */}
              <polygon
                points={skills.map(skill => {
                  const angle = (skill.angle - 90) * (Math.PI / 180);
                  const r = radius * (skill.value / 100);
                  const x = center + r * Math.cos(angle);
                  const y = center + r * Math.sin(angle);
                  return `${x},${y}`;
                }).join(' ')}
                fill="var(--ink-muted)"
                fillOpacity="0.3"
                stroke="var(--ink)"
                strokeWidth="2"
                style={{
                  opacity: showAnimation ? 0 : 1,
                  animation: showAnimation ? 'fadeIn 1s ease-out 0.5s forwards' : 'none'
                }}
              />
              
              {/* Skill points and labels */}
              {skills.map((skill, index) => {
                const angle = (skill.angle - 90) * (Math.PI / 180);
                const pointR = radius * (skill.value / 100);
                const labelR = radius + 15;
                
                const pointX = center + pointR * Math.cos(angle);
                const pointY = center + pointR * Math.sin(angle);
                const labelX = center + labelR * Math.cos(angle);
                const labelY = center + labelR * Math.sin(angle);
                
                return (
                  <g key={skill.name}>
                    <circle
                      cx={pointX}
                      cy={pointY}
                      r="3"
                      fill="var(--ink)"
                      style={{
                        opacity: showAnimation ? 0 : 1,
                        animation: showAnimation ? `fadeIn 0.5s ease-out ${1 + index * 0.1}s forwards` : 'none'
                      }}
                    />
                    
                    <text
                      x={labelX}
                      y={labelY + 3}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="600"
                      fill="var(--ink)"
                      style={{
                        opacity: showAnimation ? 0 : 1,
                        animation: showAnimation ? `fadeIn 0.5s ease-out ${1.2 + index * 0.1}s forwards` : 'none'
                      }}
                    >
                      {skill.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            minWidth: '200px'
          }}>
            {skills.map(skill => (
              <div key={skill.name} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px',
                background: 'var(--bg)',
                border: '1px solid var(--stroke)'
              }}>
                <span style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--ink)'
                }}>
                  {skill.name}
                </span>
                <span style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'var(--ink)',
                  fontFamily: 'var(--font-dm-mono), monospace'
                }}>
                  {skill.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Rudiment Mastery Progress
  const RudimentProgress = () => {
    if (rudiments.length === 0) return null;

    const sortedRudiments = [...rudiments]
      .sort((a, b) => b.mastery - a.mastery)
      .slice(0, 8);

    return (
      <div className="chart-container" style={{ marginBottom: '30px' }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: 600,
          color: 'var(--ink)',
          marginBottom: '15px'
        }}>
          Rudiment Mastery
        </h3>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {sortedRudiments.map((rudiment, index) => (
            <div key={rudiment.name} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                minWidth: '120px',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--ink)'
              }}>
                {rudiment.name}
              </div>
              
              <div style={{
                flex: 1,
                height: '12px',
                background: 'var(--stroke)',
                position: 'relative'
              }}>
                <div style={{
                  width: `${rudiment.mastery}%`,
                  height: '100%',
                  background: rudiment.mastery >= 90 ? 'var(--ink)' :
                             rudiment.mastery >= 70 ? 'var(--ink-muted)' :
                             'var(--stroke)',
                  transition: showAnimation ? 'width 1s ease-out' : 'none',
                  transitionDelay: showAnimation ? `${index * 0.1}s` : '0s'
                }} />
              </div>
              
              <div style={{
                minWidth: '35px',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--ink)',
                textAlign: 'right',
                fontFamily: 'var(--font-dm-mono), monospace'
              }}>
                {rudiment.mastery}%
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Practice Streak Calendar
  const StreakCalendar = () => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    return (
      <div className="chart-container">
        <h3 style={{
          fontSize: '16px',
          fontWeight: 600,
          color: 'var(--ink)',
          marginBottom: '15px'
        }}>
          Practice Streak
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(10, 1fr)',
          gap: '3px',
          maxWidth: '300px'
        }}>
          {last30Days.map((date, index) => {
            const streakDay = streakData.find(d => d.date === date);
            const practiced = streakDay?.practiced || false;
            const intensity = streakDay?.duration ? Math.min(streakDay.duration / 30, 1) : practiced ? 0.5 : 0;
            
            return (
              <div
                key={date}
                title={`${date}: ${practiced ? `${streakDay?.duration || 0}min` : 'No practice'}`}
                style={{
                  aspectRatio: '1',
                  background: practiced ? 
                    `rgba(47, 26, 0, ${0.2 + intensity * 0.8})` : 
                    'var(--stroke)',
                  border: date === new Date().toISOString().split('T')[0] ? 
                    '2px solid var(--ink)' : '1px solid var(--bg)',
                  cursor: 'help',
                  transition: showAnimation ? 'background 0.3s ease-out' : 'none',
                  transitionDelay: showAnimation ? `${index * 0.03}s` : '0s'
                }}
              />
            );
          })}
        </div>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '10px',
          fontSize: '11px',
          color: 'var(--ink-muted)'
        }}>
          <span>30 days ago</span>
          <span>Today</span>
        </div>
      </div>
    );
  };

  return (
    <div className="progress-charts" style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0px'
    }}>
      <style jsx global>{`
        @keyframes drawLine {
          to { stroke-dashoffset: 0; }
        }
        
        @keyframes fadeIn {
          to { opacity: 1; }
        }
      `}</style>
      
      <WeeklyChart />
      <AccuracyChart />
      <TempoChart />
      <SkillsRadar />
      <RudimentProgress />
      <StreakCalendar />
    </div>
  );
}