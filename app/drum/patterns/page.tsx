"use client";

import React, { useState, useEffect } from "react";
import PatternBrowser from "../_ui/PatternBrowser";
import { type DrumPattern } from "../_lib/patternLibrary";
import { loadProfile } from "../_lib/drumMvp";

export default function PatternsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [completedPatterns, setCompletedPatterns] = useState<string[]>([]);
  const [selectedPattern, setSelectedPattern] = useState<DrumPattern | null>(null);

  useEffect(() => {
    // Load user profile to determine skill level
    const userProfile = loadProfile();
    setProfile(userProfile);

    // Load completed patterns from localStorage
    try {
      const saved = localStorage.getItem("drum_completed_patterns");
      if (saved) {
        setCompletedPatterns(JSON.parse(saved));
      }
    } catch (err) {
      console.warn("Failed to load completed patterns:", err);
    }
  }, []);

  const handlePatternSelect = (pattern: DrumPattern) => {
    setSelectedPattern(pattern);
  };

  const handlePatternComplete = (patternId: string) => {
    const updated = [...completedPatterns, patternId];
    setCompletedPatterns(updated);
    
    // Save to localStorage
    try {
      localStorage.setItem("drum_completed_patterns", JSON.stringify(updated));
    } catch (err) {
      console.warn("Failed to save completed patterns:", err);
    }
  };

  const getCurrentLevel = (): "beginner" | "intermediate" | "advanced" => {
    if (!profile) return "beginner";
    
    // Determine level based on profile
    if (profile.level === "true_beginner") return "beginner";
    if (profile.level === "beginner") return "intermediate";
    return "advanced";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <PatternBrowser
          onPatternSelect={handlePatternSelect}
          currentLevel={getCurrentLevel()}
          completedPatterns={completedPatterns}
        />

        {selectedPattern && (
          <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-xl font-bold mb-2">Practice Session: {selectedPattern.name}</h3>
            <p className="text-gray-700 mb-4">{selectedPattern.description}</p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Practice Steps</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Start with metronome at {selectedPattern.bpm.min} BPM</li>
                  <li>Practice syllables first: "{selectedPattern.syllables}"</li>
                  <li>Add hands/feet slowly, focusing on coordination</li>
                  <li>Gradually increase tempo to {selectedPattern.bpm.target} BPM</li>
                  <li>Record yourself and listen for flams or timing issues</li>
                </ol>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Success Criteria</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Can play cleanly at target tempo</li>
                  <li>No flams between limbs</li>
                  <li>Even volume and timing</li>
                  <li>Can start and stop smoothly</li>
                  <li>Feels comfortable and relaxed</li>
                </ul>
                
                {!completedPatterns.includes(selectedPattern.id) && (
                  <button
                    onClick={() => handlePatternComplete(selectedPattern.id)}
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    Mark as Completed ✓
                  </button>
                )}
                
                {completedPatterns.includes(selectedPattern.id) && (
                  <div className="mt-4 flex items-center gap-2 text-green-600">
                    <span>✓</span>
                    <span className="font-medium">Completed!</span>
                  </div>
                )}
              </div>
            </div>

            {selectedPattern.tips && selectedPattern.tips.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-2">Practice Tips</h4>
                <ul className="grid md:grid-cols-2 gap-2">
                  {selectedPattern.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-blue-600 mt-1"></span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Progress Stats */}
        <div className="mt-8 grid md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-semibold text-gray-600">Total Patterns</h4>
            <p className="text-2xl font-bold text-blue-600">50+</p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-semibold text-gray-600">Completed</h4>
            <p className="text-2xl font-bold text-green-600">{completedPatterns.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-semibold text-gray-600">Your Level</h4>
            <p className="text-2xl font-bold text-purple-600 capitalize">{getCurrentLevel()}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-semibold text-gray-600">Progress</h4>
            <p className="text-2xl font-bold text-orange-600">
              {Math.round((completedPatterns.length / 50) * 100)}%
            </p>
          </div>
        </div>

        {/* Learning Path Suggestions */}
        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-bold mb-4">Recommended Learning Path</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded border">
              <h4 className="font-semibold text-green-600 mb-2">Start Here</h4>
              <p className="text-sm text-gray-700 mb-2">Essential foundation patterns</p>
              <ul className="text-xs space-y-1">
                <li>• Quarter Notes</li>
                <li>• Eighth Notes</li>
                <li>• Basic Rock Beat</li>
              </ul>
            </div>
            <div className="bg-white p-4 rounded border">
              <h4 className="font-semibold text-blue-600 mb-2">Next Level</h4>
              <p className="text-sm text-gray-700 mb-2">Build coordination and feel</p>
              <ul className="text-xs space-y-1">
                <li>• Rock with Hi-Hat</li>
                <li>• Single Stroke Roll</li>
                <li>• Basic Funk</li>
              </ul>
            </div>
            <div className="bg-white p-4 rounded border">
              <h4 className="font-semibold text-purple-600 mb-2">Advanced</h4>
              <p className="text-sm text-gray-700 mb-2">Complex grooves and styles</p>
              <ul className="text-xs space-y-1">
                <li>• Jazz Swing</li>
                <li>• Linear Fills</li>
                <li>• Ghost Note Funk</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}