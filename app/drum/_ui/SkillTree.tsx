"use client";

import { useState, useEffect, useMemo } from "react";
import { Icon } from "./Icon";
import {
  SKILLS,
  SKILL_MAP,
  CATEGORY_INFO,
  SkillCategory,
  Skill,
  SkillProgress,
  SkillStatus,
  loadSkillProgress,
  getSkillStatus,
  getOverallProgress,
  getRecommendedSkill,
} from "../_lib/skillTree";

// ============================================
// Types
// ============================================

interface SkillNodeProps {
  skill: Skill;
  status: SkillStatus;
  progress?: SkillProgress;
  isRecommended: boolean;
  onClick: (skill: Skill) => void;
}

interface SkillDetailProps {
  skill: Skill;
  status: SkillStatus;
  progress?: SkillProgress;
  onClose: () => void;
}

interface SkillTreeProps {
  compact?: boolean;
  showProgress?: boolean;
  onSkillSelect?: (skill: Skill) => void;
}

// ============================================
// Skill Node Component
// ============================================

function SkillNode({ skill, status, progress, isRecommended, onClick }: SkillNodeProps) {
  const progressPercent = progress 
    ? Math.min(100, Math.round((progress.sessionsCompleted / skill.sessionsToMaster) * 100))
    : 0;

  return (
    <button
      className={`skill-node skill-node-${status} ${isRecommended ? "skill-node-recommended" : ""}`}
      onClick={() => onClick(skill)}
      aria-label={`${skill.name}: ${status}`}
    >
      <div className="skill-node-icon">
        <Icon name={CATEGORY_INFO[skill.category].icon} size={16} />
      </div>
      <div className="skill-node-name">{skill.name}</div>
      
      {status === "unlocked" && progress && progressPercent > 0 && (
        <div className="skill-node-progress">
          <div 
            className="skill-node-progress-fill" 
            style={{ width: `${progressPercent}%` }} 
          />
        </div>
      )}
      
      {status === "mastered" && (
        <div className="skill-node-mastered-badge">✓</div>
      )}
      
      {status === "locked" && (
        <div className="skill-node-lock"><Icon name="lock" size={16} /></div>
      )}
      
      {isRecommended && status !== "mastered" && (
        <div className="skill-node-recommended-badge">Next</div>
      )}
    </button>
  );
}

// ============================================
// Skill Detail Modal
// ============================================

function SkillDetail({ skill, status, progress, onClose }: SkillDetailProps) {
  const progressPercent = progress 
    ? Math.min(100, Math.round((progress.sessionsCompleted / skill.sessionsToMaster) * 100))
    : 0;

  const requirements = skill.requires.map(id => SKILL_MAP.get(id)).filter(Boolean) as Skill[];

  return (
    <div className="skill-detail-overlay" onClick={onClose}>
      <div className="skill-detail" onClick={e => e.stopPropagation()}>
        <button className="skill-detail-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        
        <div className="skill-detail-header">
          <div className="skill-detail-category">
            <span className="skill-detail-category-icon">
              <Icon name={CATEGORY_INFO[skill.category].icon} size={16} />
            </span>
            {CATEGORY_INFO[skill.category].label}
          </div>
          <h2 className="skill-detail-title">{skill.name}</h2>
          <div className={`skill-detail-status skill-detail-status-${status}`}>
            {status === "mastered" ? "Mastered" : status === "unlocked" ? "Unlocked" : "Locked"}
          </div>
        </div>
        
        <div className="skill-detail-body">
          <p className="skill-detail-description">{skill.description}</p>
          
          <div className="skill-detail-section">
            <div className="skill-detail-label">What it unlocks</div>
            <p className="skill-detail-benefit">{skill.benefit}</p>
          </div>
          
          {requirements.length > 0 && (
            <div className="skill-detail-section">
              <div className="skill-detail-label">Requires</div>
              <div className="skill-detail-requirements">
                {requirements.map(req => (
                  <span key={req.id} className="skill-detail-requirement">
                    <Icon name={CATEGORY_INFO[req.category].icon} size={14} /> {req.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {skill.unlockCondition && status === "locked" && (
            <div className="skill-detail-section">
              <div className="skill-detail-label">How to unlock</div>
              <p className="skill-detail-unlock">{skill.unlockCondition}</p>
            </div>
          )}
          
          {(status === "unlocked" || status === "mastered") && (
            <div className="skill-detail-section">
              <div className="skill-detail-label">
                Progress to mastery
              </div>
              <div className="skill-detail-progress-bar">
                <div 
                  className="skill-detail-progress-fill"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="skill-detail-progress-text">
                {progress?.sessionsCompleted ?? 0} / {skill.sessionsToMaster} sessions
                {status === "mastered" && " · Complete"}
              </div>
            </div>
          )}
          
          {progress?.masteredAt && (
            <div className="skill-detail-section">
              <div className="skill-detail-label">Mastered on</div>
              <div className="skill-detail-date">
                {new Date(progress.masteredAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// Connection Lines (SVG)
// ============================================

function SkillConnections({ progressMap }: { progressMap: Map<string, SkillProgress> }) {
  // Calculate lines between skills based on requirements
  const lines: { from: Skill; to: Skill; status: "active" | "inactive" }[] = [];
  
  for (const skill of SKILLS) {
    for (const reqId of skill.requires) {
      const reqSkill = SKILL_MAP.get(reqId);
      if (reqSkill) {
        const fromStatus = getSkillStatus(reqSkill, progressMap);
        const toStatus = getSkillStatus(skill, progressMap);
        const isActive = fromStatus !== "locked" && toStatus !== "locked";
        lines.push({ from: reqSkill, to: skill, status: isActive ? "active" : "inactive" });
      }
    }
  }

  return (
    <svg className="skill-connections" aria-hidden="true">
      {lines.map((line, i) => {
        // Calculate positions based on grid
        const fromX = line.from.position.x * 140 + 50;
        const fromY = line.from.position.y * 100 + 60;
        const toX = line.to.position.x * 140 + 50;
        const toY = line.to.position.y * 100 + 20;
        
        // Curved path
        const midY = (fromY + toY) / 2;
        const path = `M ${fromX} ${fromY} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toY}`;
        
        return (
          <path
            key={i}
            d={path}
            className={`skill-connection skill-connection-${line.status}`}
            fill="none"
          />
        );
      })}
    </svg>
  );
}

// ============================================
// Progress Summary
// ============================================

function ProgressSummary({ progressMap }: { progressMap: Map<string, SkillProgress> }) {
  const { unlocked, mastered, total, percent } = getOverallProgress(progressMap);
  const recommended = getRecommendedSkill(progressMap);

  return (
    <div className="skill-progress-summary">
      <div className="skill-progress-stats">
        <div className="skill-progress-stat">
          <span className="skill-progress-stat-value">{mastered}</span>
          <span className="skill-progress-stat-label">Mastered</span>
        </div>
        <div className="skill-progress-stat">
          <span className="skill-progress-stat-value">{unlocked}</span>
          <span className="skill-progress-stat-label">Unlocked</span>
        </div>
        <div className="skill-progress-stat">
          <span className="skill-progress-stat-value">{total - unlocked}</span>
          <span className="skill-progress-stat-label">Locked</span>
        </div>
      </div>
      
      <div className="skill-progress-bar-container">
        <div className="skill-progress-bar">
          <div 
            className="skill-progress-bar-fill"
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="skill-progress-percent">{percent}% mastery</span>
      </div>
      
      {recommended && (
        <div className="skill-progress-next">
          <span className="skill-progress-next-label">Suggested focus:</span>
          <span className="skill-progress-next-skill">
            <Icon name={CATEGORY_INFO[recommended.category].icon} size={14} /> {recommended.name}
          </span>
        </div>
      )}
    </div>
  );
}

// ============================================
// Category Filter
// ============================================

function CategoryFilter({ 
  selected, 
  onChange 
}: { 
  selected: SkillCategory | "all"; 
  onChange: (cat: SkillCategory | "all") => void;
}) {
  const categories: (SkillCategory | "all")[] = ["all", "foundation", "time", "rudiments", "grooves", "coordination"];
  
  return (
    <div className="skill-category-filter">
      {categories.map(cat => (
        <button
          key={cat}
          className={`skill-category-btn ${selected === cat ? "skill-category-btn-active" : ""}`}
          onClick={() => onChange(cat)}
        >
          {cat === "all" ? "All" : CATEGORY_INFO[cat].label}
        </button>
      ))}
    </div>
  );
}

// ============================================
// Main Skill Tree Component
// ============================================

export default function SkillTree({ compact = false, showProgress = true, onSkillSelect }: SkillTreeProps) {
  const [progressMap, setProgressMap] = useState<Map<string, SkillProgress>>(new Map());
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<SkillCategory | "all">("all");

  useEffect(() => {
    setProgressMap(loadSkillProgress());
  }, []);

  const recommended = useMemo(() => getRecommendedSkill(progressMap), [progressMap]);

  const filteredSkills = useMemo(() => {
    if (categoryFilter === "all") return SKILLS;
    return SKILLS.filter(s => s.category === categoryFilter);
  }, [categoryFilter]);

  // Group skills by category for grid layout
  const skillsByCategory = useMemo(() => {
    const groups = new Map<SkillCategory, Skill[]>();
    for (const skill of filteredSkills) {
      const existing = groups.get(skill.category) ?? [];
      existing.push(skill);
      groups.set(skill.category, existing);
    }
    return groups;
  }, [filteredSkills]);

  const handleSkillClick = (skill: Skill) => {
    setSelectedSkill(skill);
    onSkillSelect?.(skill);
  };

  if (compact) {
    // Compact view: just show unlocked skills in a simple list
    return (
      <div className="skill-tree-compact">
        {SKILLS.filter(s => {
          const status = getSkillStatus(s, progressMap);
          return status === "unlocked" || status === "mastered";
        }).map(skill => {
          const status = getSkillStatus(skill, progressMap);
          const progress = progressMap.get(skill.id);
          return (
            <SkillNode
              key={skill.id}
              skill={skill}
              status={status}
              progress={progress}
              isRecommended={recommended?.id === skill.id}
              onClick={handleSkillClick}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div className="skill-tree">
      {showProgress && <ProgressSummary progressMap={progressMap} />}
      
      <CategoryFilter selected={categoryFilter} onChange={setCategoryFilter} />
      
      <div className="skill-tree-grid-wrapper">
        <div className="skill-tree-grid">
          <SkillConnections progressMap={progressMap} />
          
          {Array.from(skillsByCategory.entries()).map(([category, skills]) => (
            <div key={category} className="skill-tree-category">
              <div className="skill-tree-category-header">
                <span className="skill-tree-category-icon">
                  <Icon name={CATEGORY_INFO[category].icon} size={16} />
                </span>
                <span className="skill-tree-category-label">
                  {CATEGORY_INFO[category].label}
                </span>
              </div>
              
              <div className="skill-tree-category-skills">
                {skills.sort((a, b) => a.position.y - b.position.y).map(skill => {
                  const status = getSkillStatus(skill, progressMap);
                  const progress = progressMap.get(skill.id);
                  return (
                    <SkillNode
                      key={skill.id}
                      skill={skill}
                      status={status}
                      progress={progress}
                      isRecommended={recommended?.id === skill.id}
                      onClick={handleSkillClick}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {selectedSkill && (
        <SkillDetail
          skill={selectedSkill}
          status={getSkillStatus(selectedSkill, progressMap)}
          progress={progressMap.get(selectedSkill.id)}
          onClose={() => setSelectedSkill(null)}
        />
      )}
    </div>
  );
}

// ============================================
// Individual exports for flexibility
// ============================================

export { ProgressSummary, SkillNode, SkillDetail };
