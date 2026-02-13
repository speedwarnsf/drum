"use client";

import React, { useState, useMemo } from "react";
import { 
  DRUM_PATTERNS, 
  PATTERN_CATEGORIES,
  getPatternsByCategory, 
  getPatternsByDifficulty,
  getRecommendedPatterns,
  type DrumPattern 
} from "../_lib/patternLibrary";
import { Icon } from "./Icon";

function DifficultyStars({ level }: { level: number }) {
  return (
    <span className="difficulty-stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <Icon key={i} name={i < level ? "starFilled" : "star"} size={12} />
      ))}
    </span>
  );
}

interface PatternBrowserProps {
  onPatternSelect?: (pattern: DrumPattern) => void;
  currentLevel?: "beginner" | "intermediate" | "advanced";
  completedPatterns?: string[];
  compact?: boolean;
}

export default function PatternBrowser({
  onPatternSelect,
  currentLevel = "beginner",
  completedPatterns = [],
  compact = false
}: PatternBrowserProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<number>(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyRecommended, setShowOnlyRecommended] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState<DrumPattern | null>(null);

  const filteredPatterns = useMemo(() => {
    let patterns = DRUM_PATTERNS;

    // Category filter
    if (selectedCategory !== "all") {
      patterns = getPatternsByCategory(selectedCategory as any);
    }

    // Difficulty filter
    patterns = patterns.filter(p => p.difficulty <= difficultyFilter);

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      patterns = patterns.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.syllables.toLowerCase().includes(query)
      );
    }

    // Recommended filter
    if (showOnlyRecommended) {
      const recommended = getRecommendedPatterns(currentLevel, completedPatterns);
      patterns = patterns.filter(p => recommended.some(r => r.id === p.id));
    }

    return patterns.sort((a, b) => a.difficulty - b.difficulty || a.name.localeCompare(b.name));
  }, [selectedCategory, difficultyFilter, searchQuery, showOnlyRecommended, currentLevel, completedPatterns]);

  const getDifficultyStars = (difficulty: number) => {
    return <DifficultyStars level={difficulty} />;
  };

  const getDifficultyLabel = (difficulty: number) => {
    switch (difficulty) {
      case 1: return "Foundational";
      case 2: return "Elementary";
      case 3: return "Intermediate";
      case 4: return "Advanced";
      case 5: return "Expert";
      default: return "Unknown";
    }
  };

  const isCompleted = (patternId: string) => completedPatterns.includes(patternId);

  const handlePatternClick = (pattern: DrumPattern) => {
    setSelectedPattern(pattern);
    onPatternSelect?.(pattern);
  };

  if (compact) {
    return (
      <div className="pattern-browser-compact">
        <div className="flex items-center gap-2 mb-3">
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-sm border px-2 py-1"
          >
            <option value="all">All Categories</option>
            {PATTERN_CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Search patterns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-sm border px-2 py-1 flex-1"
          />
        </div>
        <div className="grid gap-2" style={{ maxHeight: "300px", overflowY: "auto" }}>
          {filteredPatterns.slice(0, 20).map((pattern) => (
            <div
              key={pattern.id}
              className={`pattern-card-compact p-2 border cursor-pointer hover:bg-gray-50 ${
                selectedPattern?.id === pattern.id ? 'bg-blue-50 border-blue-300' : ''
              }`}
              onClick={() => handlePatternClick(pattern)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate flex items-center gap-2">
                    {pattern.name}
                    {isCompleted(pattern.id) && <span className="text-green-500">✓</span>}
                  </h4>
                  <p className="text-xs text-gray-600 truncate">{pattern.description}</p>
                </div>
                <div className="flex flex-col items-end text-xs text-gray-500">
                  <span>{getDifficultyStars(pattern.difficulty)}</span>
                  <span className="text-xs uppercase">{pattern.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {filteredPatterns.length > 20 && (
          <p className="text-xs text-gray-500 mt-2">
            Showing 20 of {filteredPatterns.length} patterns. Refine your search to see more.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="pattern-browser">
      <div className="pattern-browser-header mb-6">
        <h2 className="text-2xl font-bold mb-2">Drum Pattern Library</h2>
        <p className="text-gray-600">
          {DRUM_PATTERNS.length} patterns across {PATTERN_CATEGORIES.length} categories
        </p>
      </div>

      {/* Filters */}
      <div className="filters grid gap-4 mb-6 p-4 bg-gray-50 ">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border px-3 py-2"
            >
              <option value="all">All Categories</option>
              {PATTERN_CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} - {cat.description}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Max Difficulty: {getDifficultyLabel(difficultyFilter)}
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Foundational</span>
              <span>Expert</span>
            </div>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium mb-2">Search</label>
            <input
              type="text"
              placeholder="Pattern name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border px-3 py-2"
            />
          </div>
        </div>

        {/* Toggle Options */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlyRecommended}
              onChange={(e) => setShowOnlyRecommended(e.target.checked)}
            />
            <span className="text-sm">Show only recommended for my level</span>
          </label>
          <div className="text-sm text-gray-600">
            {completedPatterns.length} patterns completed
          </div>
        </div>
      </div>

      {/* Pattern Grid */}
      <div className="pattern-grid grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredPatterns.map((pattern) => (
          <PatternCard
            key={pattern.id}
            pattern={pattern}
            isCompleted={isCompleted(pattern.id)}
            isSelected={selectedPattern?.id === pattern.id}
            onClick={() => handlePatternClick(pattern)}
          />
        ))}
      </div>

      {filteredPatterns.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">No patterns found</p>
          <p>Try adjusting your filters or search terms.</p>
        </div>
      )}

      {/* Pattern Detail Modal */}
      {selectedPattern && (
        <PatternDetailModal
          pattern={selectedPattern}
          isCompleted={isCompleted(selectedPattern.id)}
          onClose={() => setSelectedPattern(null)}
        />
      )}
    </div>
  );
}

interface PatternCardProps {
  pattern: DrumPattern;
  isCompleted: boolean;
  isSelected: boolean;
  onClick: () => void;
}

function PatternCard({ pattern, isCompleted, isSelected, onClick }: PatternCardProps) {
  return (
    <div
      className={`pattern-card p-4 border  cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            {pattern.name}
            {isCompleted && <span className="text-green-500 text-sm"><Icon name="check" size={16} /></span>}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="px-2 py-1 bg-gray-100 text-xs uppercase font-medium">
              {pattern.category}
            </span>
            <span className="text-yellow-600" title={`Difficulty: ${pattern.difficulty}/5`}>
              <DifficultyStars level={pattern.difficulty} />
            </span>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-700 mb-3 line-clamp-2">
        {pattern.description}
      </p>

      <div className="space-y-2 text-sm">
        <div>
          <span className="font-medium">Syllables:</span>
          <div className="font-mono text-xs bg-gray-100 p-2 mt-1">
            {pattern.syllables}
          </div>
        </div>
        <div>
          <span className="font-medium">Notation:</span>
          <div className="font-mono text-xs bg-gray-100 p-2 mt-1">
            {pattern.notation}
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>BPM: {pattern.bpm.min}-{pattern.bpm.max}</span>
          <span>Feel: {pattern.feel}</span>
          <span>{pattern.timeSignature}</span>
        </div>
      </div>
    </div>
  );
}

interface PatternDetailModalProps {
  pattern: DrumPattern;
  isCompleted: boolean;
  onClose: () => void;
}

function PatternDetailModal({ pattern, isCompleted, onClose }: PatternDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white  max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                {pattern.name}
                {isCompleted && <span className="text-green-500"><Icon name="check" size={20} /></span>}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-3 py-1 bg-gray-100 text-sm uppercase font-medium">
                  {pattern.category}
                </span>
                <span className="text-yellow-600" title={`Difficulty: ${pattern.difficulty}/5`}>
                  <DifficultyStars level={pattern.difficulty} />
                </span>
                <span className="text-sm text-gray-600">{pattern.timeSignature}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ✕
            </button>
          </div>

          <p className="text-gray-700 mb-6">{pattern.description}</p>

          <div className="grid gap-4 mb-6">
            <div>
              <h3 className="font-semibold mb-2">Syllables (Gordon Method)</h3>
              <div className="font-mono text-sm bg-gray-100 p-3">
                {pattern.syllables}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Notation</h3>
              <div className="font-mono text-sm bg-gray-100 p-3">
                {pattern.notation}
              </div>
            </div>

            {pattern.sticking && (
              <div>
                <h3 className="font-semibold mb-2">Sticking</h3>
                <div className="font-mono text-sm bg-gray-100 p-3">
                  {pattern.sticking}
                </div>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="font-semibold mb-2">Tempo Range</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Minimum:</span>
                  <span>{pattern.bpm.min} BPM</span>
                </div>
                <div className="flex justify-between">
                  <span>Target:</span>
                  <span className="font-medium">{pattern.bpm.target} BPM</span>
                </div>
                <div className="flex justify-between">
                  <span>Maximum:</span>
                  <span>{pattern.bpm.max} BPM</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Details</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Feel:</span>
                  <span className="capitalize">{pattern.feel}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bars:</span>
                  <span>{pattern.bars}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time Signature:</span>
                  <span>{pattern.timeSignature}</span>
                </div>
              </div>
            </div>
          </div>

          {pattern.tips && pattern.tips.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Practice Tips</h3>
              <ul className="space-y-1 text-sm">
                {pattern.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {pattern.prerequisites && pattern.prerequisites.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Prerequisites</h3>
              <div className="flex flex-wrap gap-2">
                {pattern.prerequisites.map((prereqId) => (
                  <span
                    key={prereqId}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs"
                  >
                    {prereqId.replace(/-/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}