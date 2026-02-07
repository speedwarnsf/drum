"use client";

import React, { useState } from "react";
import { Icon } from "./Icon";

/**
 * Gap Drill Controls
 * 
 * Gap drills are the secret weapon for developing internal time (Metric Projection).
 * 
 * WHY THEY WORK:
 * - When the click plays, you can REACT to it (hear → hit)
 * - When the click is SILENT, you must PROJECT the beat from inside
 * - Silence reveals whether you're projecting or reacting
 * 
 * Think of silence as DISTANCE TO TRAVEL, not emptiness to fill.
 * The gap between beats has physical length—you cross it with your internal clock.
 */

export type GapPreset = "easy" | "medium" | "hard" | "custom";

export type GapSettings = {
  beatsOn: number;
  beatsOff: number;
  offBeatMode: boolean;
};

export const GAP_PRESETS: Record<Exclude<GapPreset, "custom">, GapSettings> = {
  easy: { beatsOn: 8, beatsOff: 4, offBeatMode: false },
  medium: { beatsOn: 4, beatsOff: 4, offBeatMode: false },
  hard: { beatsOn: 4, beatsOff: 8, offBeatMode: false },
};

type GapDrillControlsProps = {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  settings: GapSettings;
  onSettingsChange: (settings: GapSettings) => void;
  preset: GapPreset;
  onPresetChange: (preset: GapPreset) => void;
  compact?: boolean;
  showExplanation?: boolean;
};

export default function GapDrillControls({
  enabled,
  onEnabledChange,
  settings,
  onSettingsChange,
  preset,
  onPresetChange,
  compact = false,
  showExplanation = true,
}: GapDrillControlsProps) {
  const [showProjectionTip, setShowProjectionTip] = useState(false);
  
  const handlePresetChange = (newPreset: GapPreset) => {
    onPresetChange(newPreset);
    if (newPreset !== "custom") {
      onSettingsChange(GAP_PRESETS[newPreset]);
    }
  };

  const handleCustomChange = (key: keyof GapSettings, value: number | boolean) => {
    onPresetChange("custom");
    onSettingsChange({ ...settings, [key]: value });
  };

  if (compact) {
    return (
      <div className="gap-controls gap-controls-compact">
        <button
          type="button"
          className={`btn btn-small touch-target ${enabled ? "" : "btn-ghost"}`}
          onClick={() => onEnabledChange(!enabled)}
          aria-pressed={enabled}
          aria-label={enabled ? "Gap drill enabled, tap to disable" : "Gap drill disabled, tap to enable"}
        >
          {enabled ? "Gap On" : "Gap Off"}
        </button>
        {enabled && (
          <>
            <select
              value={preset}
              onChange={(e) => handlePresetChange(e.target.value as GapPreset)}
              className="gap-preset-select touch-target"
              aria-label="Gap drill preset"
            >
              <option value="easy">Easy (8 on, 4 off)</option>
              <option value="medium">Medium (4 on, 4 off)</option>
              <option value="hard">Hard (4 on, 8 off)</option>
              <option value="custom">Custom</option>
            </select>
            <button
              type="button"
              className={`btn btn-small touch-target ${settings.offBeatMode ? "" : "btn-ghost"}`}
              onClick={() => handleCustomChange("offBeatMode", !settings.offBeatMode)}
              aria-pressed={settings.offBeatMode}
              aria-label="Off-beat mode - clicks on the 'and'"
            >
              Off-beat
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="gap-controls">
      <div className="gap-controls-header">
        <div className="gap-controls-title">
          <span className="kicker">Gap Drill Mode — Metric Projection Training</span>
          <p className="gap-controls-desc">
            Click plays, then goes silent. During silence, <strong>PROJECT</strong> the beat—don&apos;t wait for it.
          </p>
        </div>
        <button
          type="button"
          className={`btn touch-target ${enabled ? "" : "btn-ghost"}`}
          onClick={() => onEnabledChange(!enabled)}
          aria-pressed={enabled}
          aria-label={enabled ? "Disable gap drill" : "Enable gap drill"}
        >
          {enabled ? "Disable" : "Enable"}
        </button>
      </div>

      {enabled && showExplanation && (
        <div className="gap-projection-tip">
          <button 
            type="button"
            className="projection-tip-toggle"
            onClick={() => setShowProjectionTip(!showProjectionTip)}
            aria-expanded={showProjectionTip}
          >
            <Icon name="info" size={14} /> Why gap drills work {showProjectionTip ? "▼" : "▶"}
          </button>
          {showProjectionTip && (
            <div className="projection-tip-content">
              <p>
                <strong>Reaction vs Projection:</strong> When the click plays, you can <em>react</em> to it 
                (hear → hit). But when silence comes, you must <em>project</em> the beat from inside.
              </p>
              <p>
                <strong>Visualize silence as distance:</strong> The gap between beats has physical length. 
                Picture stepping stones—you&apos;re walking across them, not waiting for them to appear.
              </p>
              <p>
                <strong>Self-check:</strong> When the click returns, are you still aligned? 
                If you sped up, you were rushing to fill the void. 
                If you slowed down, you were waiting. 
                True projection = steady tempo.
              </p>
            </div>
          )}
        </div>
      )}

      {enabled && (
        <div className="gap-controls-body">
          <div className="gap-presets">
            <span className="gap-label">Preset:</span>
            {(["easy", "medium", "hard", "custom"] as GapPreset[]).map((p) => (
              <button
                key={p}
                type="button"
                className={`btn btn-small touch-target ${preset === p ? "" : "btn-ghost"}`}
                onClick={() => handlePresetChange(p)}
                aria-pressed={preset === p}
              >
                {p === "easy" && "Easy"}
                {p === "medium" && "Medium"}
                {p === "hard" && "Hard"}
                {p === "custom" && "Custom"}
              </button>
            ))}
          </div>

          <div className="gap-settings">
            <div className="gap-setting">
              <label>
                <span className="gap-setting-label">Beats on</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={32}
                  value={settings.beatsOn}
                  onChange={(e) => handleCustomChange("beatsOn", Math.max(1, parseInt(e.target.value) || 1))}
                  className="gap-input touch-target"
                  aria-label="Number of beats with click"
                />
              </label>
            </div>
            <div className="gap-setting">
              <label>
                <span className="gap-setting-label">Beats off</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={32}
                  value={settings.beatsOff}
                  onChange={(e) => handleCustomChange("beatsOff", Math.max(1, parseInt(e.target.value) || 1))}
                  className="gap-input touch-target"
                  aria-label="Number of silent beats"
                />
              </label>
            </div>
            <div className="gap-setting">
              <label className="gap-checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.offBeatMode}
                  onChange={(e) => handleCustomChange("offBeatMode", e.target.checked)}
                  className="gap-checkbox touch-target"
                />
                <span className="gap-setting-label">Off-beat mode</span>
              </label>
              <span className="gap-setting-hint">Click on the &quot;and&quot; (half-beat)</span>
            </div>
          </div>

          <div className="gap-info">
            <div className="gap-info-item">
              <span className="gap-info-label">Cycle</span>
              <span className="gap-info-value">{settings.beatsOn + settings.beatsOff} beats</span>
            </div>
            <div className="gap-info-item">
              <span className="gap-info-label">Pattern</span>
              <span className="gap-info-value">
                {settings.beatsOn} click{settings.beatsOn !== 1 ? "s" : ""} → {settings.beatsOff} silent
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
