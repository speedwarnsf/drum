"use client";

import React, { useState, useEffect, useCallback } from "react";
import Shell from "../_ui/Shell";
import { Icon } from "../_ui/Icon";
import {
  LeaderboardEntry,
  loadLeaderboard,
  updateLeaderboardEntry,
  loadCommunityProfile,
  saveCommunityProfile,
  CommunityProfile,
  ShareCardData,
  generateShareImage,
} from "../_lib/community";
import { loadSessions } from "../_lib/drumMvp";
import { calculatePracticeStats } from "../_lib/statsUtils";
import { getPracticeLog } from "../_lib/practiceTracker";

export default function CommunityPage() {
  const [tab, setTab] = useState<"leaderboard" | "share">("leaderboard");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [profile, setProfile] = useState<CommunityProfile | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    setLeaderboard(loadLeaderboard());
    setProfile(loadCommunityProfile());
  }, []);

  const handleSetName = useCallback(() => {
    if (!nameInput.trim()) return;
    const p: CommunityProfile = {
      id: profile?.id || crypto.randomUUID(),
      name: nameInput.trim(),
      createdAt: profile?.createdAt || new Date().toISOString(),
    };
    saveCommunityProfile(p);
    setProfile(p);

    // Update leaderboard with current stats
    const sessions = loadSessions();
    const stats = calculatePracticeStats(sessions);
    const log = getPracticeLog();
    const uniqueRudiments = new Set(log.map(e => e.rudimentId));

    const entry: LeaderboardEntry = {
      id: p.id,
      name: p.name,
      streak: stats.streak.current,
      totalMinutes: stats.totalMinutes,
      rudimentsMastered: uniqueRudiments.size,
      lastActive: new Date().toISOString().slice(0, 10),
      isCurrentUser: true,
    };
    updateLeaderboardEntry(entry);
    setLeaderboard(loadLeaderboard());
  }, [nameInput, profile]);

  const handleGenerateCard = useCallback(async () => {
    setGenerating(true);
    try {
      const sessions = loadSessions();
      const stats = calculatePracticeStats(sessions);
      const log = getPracticeLog();
      const uniqueRudiments = new Set(log.map(e => e.rudimentId));

      // Find top rudiment by time
      const rudimentTime: Record<string, number> = {};
      for (const entry of log) {
        rudimentTime[entry.rudimentId] = (rudimentTime[entry.rudimentId] || 0) + entry.durationSeconds;
      }
      const topRudiment = Object.entries(rudimentTime).sort((a, b) => b[1] - a[1])[0]?.[0];

      const data: ShareCardData = {
        playerName: profile?.name || "Drummer",
        streak: stats.streak.current,
        totalMinutes: stats.totalMinutes,
        rudimentsMastered: uniqueRudiments.size,
        totalSessions: stats.totalSessions,
        topRudiment: topRudiment?.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
      };

      const blob = await generateShareImage(data);
      const url = URL.createObjectURL(blob);
      setShareUrl(url);
    } catch (err) {
      console.error("Failed to generate share card:", err);
    } finally {
      setGenerating(false);
    }
  }, [profile]);

  const handleDownload = useCallback(() => {
    if (!shareUrl) return;
    const a = document.createElement("a");
    a.href = shareUrl;
    a.download = "drum-progress.png";
    a.click();
  }, [shareUrl]);

  const handleShare = useCallback(async () => {
    if (!shareUrl) return;
    try {
      const response = await fetch(shareUrl);
      const blob = await response.blob();
      const file = new File([blob], "drum-progress.png", { type: "image/png" });
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "My Drum Practice Progress",
          text: "Check out my drumming progress on Drum!",
          files: [file],
        });
      } else {
        handleDownload();
      }
    } catch {
      handleDownload();
    }
  }, [shareUrl, handleDownload]);

  return (
    <Shell title="Community" subtitle="Track, share, compete">
      {/* Tab bar */}
      <div className="community-tabs">
        <button
          className={`community-tab ${tab === "leaderboard" ? "active" : ""}`}
          onClick={() => setTab("leaderboard")}
        >
          Leaderboard
        </button>
        <button
          className={`community-tab ${tab === "share" ? "active" : ""}`}
          onClick={() => setTab("share")}
        >
          Share Progress
        </button>
      </div>

      {/* Profile setup */}
      {!profile && (
        <section className="card">
          <h2 className="card-title">Set Your Name</h2>
          <p className="sub">Enter a display name to appear on the leaderboard.</p>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Your name"
              className="sound-select"
              style={{ flex: 1 }}
              maxLength={24}
              onKeyDown={(e) => e.key === "Enter" && handleSetName()}
            />
            <button className="btn" onClick={handleSetName}>Save</button>
          </div>
        </section>
      )}

      {/* Leaderboard Tab */}
      {tab === "leaderboard" && (
        <section className="card">
          <h2 className="card-title">Practice Leaderboard</h2>
          <p className="sub" style={{ marginBottom: 16 }}>Top practice streaks and total time</p>
          <div className="leaderboard-list">
            {leaderboard.map((entry, i) => (
              <div
                key={entry.id}
                className={`leaderboard-row ${entry.isCurrentUser ? "leaderboard-you" : ""}`}
              >
                <span className="leaderboard-rank">
                  {i === 0 ? "#1" : i === 1 ? "#2" : i === 2 ? "#3" : `#${i + 1}`}
                </span>
                <span className="leaderboard-name">
                  {entry.name}
                  {entry.isCurrentUser && <span className="leaderboard-you-tag"> (you)</span>}
                </span>
                <span className="leaderboard-stat">
                  <Icon name="flame" size={14} /> {entry.streak}d
                </span>
                <span className="leaderboard-stat">
                  <Icon name="stopwatch" size={14} /> {formatMin(entry.totalMinutes)}
                </span>
                <span className="leaderboard-stat leaderboard-rudiments">
                  {entry.rudimentsMastered} rud.
                </span>
              </div>
            ))}
          </div>
          {profile && (
            <button
              className="btn"
              style={{ marginTop: 16 }}
              onClick={() => {
                setNameInput(profile.name);
                handleSetName();
              }}
            >
              Update My Stats
            </button>
          )}
        </section>
      )}

      {/* Share Tab */}
      {tab === "share" && (
        <section className="card">
          <h2 className="card-title">Share My Progress</h2>
          <p className="sub" style={{ marginBottom: 16 }}>
            Generate a shareable image card showing your practice stats.
          </p>
          <button
            className="btn"
            onClick={handleGenerateCard}
            disabled={generating}
          >
            {generating ? "Generating..." : "Generate Card"}
          </button>

          {shareUrl && (
            <div style={{ marginTop: 20 }}>
              <img
                src={shareUrl}
                alt="Practice progress card"
                style={{ width: "100%", maxWidth: 600, border: "1px solid var(--stroke)" }}
              />
              <div className="row" style={{ marginTop: 12, gap: 8 }}>
                <button className="btn" onClick={handleShare}>
                  Share
                </button>
                <button className="btn btn-ghost" onClick={handleDownload}>
                  Download
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Links */}
      <section className="card">
        <div className="row">
          <a href="/drum/challenge" className="btn">
            Challenge Mode
          </a>
          <a href="/drum/guided" className="btn btn-ghost">
            Guided Practice
          </a>
        </div>
      </section>
    </Shell>
  );
}

function formatMin(min: number): string {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  return `${h}h`;
}
