"use client";

import React, { useState, useEffect, useCallback } from "react";
import Shell from "../_ui/Shell";
import { Icon } from "../_ui/Icon";
import { ErrorBoundary } from "../_ui/ErrorBoundary";
import { OfflineIndicator, useOnlineStatus } from "../_ui/OfflineIndicator";
import { LoadingSpinner } from "../_ui/LoadingSpinner";
import {
  SharedRecording,
  FeedbackSummary,
  getRecordingsForReview,
  getMySharedRecordings,
  getRecordingUrl,
  submitFeedback,
  getFeedbackSummary,
  hasReviewed,
  FEEDBACK_ISSUES,
} from "../_lib/recordingSharing";
import { getSupabaseClient } from "../_lib/supabaseClient";

/**
 * Community Page — The Social Layer
 * 
 * Based on the 70-20-10 model:
 * - 70% experiential (practice)
 * - 20% social (THIS PAGE - feedback from others)
 * - 10% formal (lessons)
 * 
 * Features:
 * - Review recordings from other drummers
 * - Get feedback on your shared recordings
 * - Build community through constructive feedback
 */

type Tab = "review" | "my-recordings";

export default function CommunityPage() {
  return (
    <ErrorBoundary>
      <CommunityPageInner />
      <OfflineIndicator />
    </ErrorBoundary>
  );
}

function CommunityPageInner() {
  const { isOnline } = useOnlineStatus();
  const [tab, setTab] = useState<Tab>("review");
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [recordingsToReview, setRecordingsToReview] = useState<SharedRecording[]>([]);
  const [myRecordings, setMyRecordings] = useState<SharedRecording[]>([]);

  useEffect(() => {
    async function checkAuth() {
      const supabase = getSupabaseClient();
      if (!supabase) {
        setLoading(false);
        return;
      }
      
      const { data } = await supabase.auth.getUser();
      setIsAuthenticated(!!data?.user);
      setLoading(false);
    }
    checkAuth();
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !isOnline) return;

    async function loadData() {
      if (tab === "review") {
        const recordings = await getRecordingsForReview();
        setRecordingsToReview(recordings);
      } else {
        const recordings = await getMySharedRecordings();
        setMyRecordings(recordings);
      }
    }
    loadData();
  }, [tab, isAuthenticated, isOnline]);

  if (loading) {
    return (
      <Shell title="Community" subtitle="Loading...">
        <section className="card">
          <LoadingSpinner message="Loading community..." />
        </section>
      </Shell>
    );
  }

  if (!isAuthenticated) {
    return (
      <Shell title="Community" subtitle="Get feedback from fellow drummers">
        <section className="card">
          <p>Sign in to share recordings and get feedback from the community.</p>
          <div className="row" style={{ marginTop: 16 }}>
            <a href="/drum/login" className="btn">
              Sign In
            </a>
          </div>
        </section>
      </Shell>
    );
  }

  if (!isOnline) {
    return (
      <Shell title="Community" subtitle="Get feedback from fellow drummers">
        <section className="card">
          <p>Community features require an internet connection.</p>
        </section>
      </Shell>
    );
  }

  return (
    <Shell title="Community" subtitle="Give and receive feedback — the 20% that accelerates learning">
      {/* Intro */}
      <section className="card">
        <div className="kicker">The 70-20-10 Model</div>
        <p>
          Research shows 20% of learning comes from <strong>social feedback</strong>.
          Share your recordings anonymously and help others improve.
        </p>
      </section>

      {/* Tab navigation */}
      <div className="community-tabs">
        <button
          type="button"
          className={`community-tab ${tab === "review" ? "community-tab-active" : ""}`}
          onClick={() => setTab("review")}
        >
          Review Others
          {recordingsToReview.length > 0 && (
            <span className="community-tab-badge">{recordingsToReview.length}</span>
          )}
        </button>
        <button
          type="button"
          className={`community-tab ${tab === "my-recordings" ? "community-tab-active" : ""}`}
          onClick={() => setTab("my-recordings")}
        >
          📤 My Shared
        </button>
      </div>

      {tab === "review" && (
        <ReviewTab
          recordings={recordingsToReview}
          onReviewComplete={() => {
            // Refresh the list
            getRecordingsForReview().then(setRecordingsToReview);
          }}
        />
      )}

      {tab === "my-recordings" && (
        <MyRecordingsTab recordings={myRecordings} />
      )}

      {/* How it works */}
      <section className="card">
        <h3 className="card-title">How it Works</h3>
        <ol style={{ marginTop: 8 }}>
          <li><strong>Share:</strong> After recording a practice clip, tap "Share for Feedback"</li>
          <li><strong>Review:</strong> Listen to recordings from others and give honest feedback</li>
          <li><strong>Learn:</strong> Get feedback on your own recordings</li>
        </ol>
        <p className="sub" style={{ marginTop: 12 }}>
          All feedback is anonymous. Be kind, be specific, be helpful.
        </p>
      </section>

      {/* Navigation */}
      <section className="card">
        <div className="row">
          <a href="/drum/today" className="btn btn-ghost">
            ← Back to Practice
          </a>
        </div>
      </section>
    </Shell>
  );
}

// ============================================
// Review Tab — Listen and give feedback
// ============================================

function ReviewTab({
  recordings,
  onReviewComplete,
}: {
  recordings: SharedRecording[];
  onReviewComplete: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const current = recordings[currentIndex];

  useEffect(() => {
    if (!current) return;

    // Load audio URL
    getRecordingUrl(current.storage_path).then(setCurrentUrl);
    
    // Check if already reviewed
    hasReviewed(current.id).then(setAlreadyReviewed);
  }, [current]);

  const handlePlay = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleNext = useCallback(() => {
    if (currentIndex < recordings.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsPlaying(false);
      setCurrentUrl(null);
    }
  }, [currentIndex, recordings.length]);

  if (recordings.length === 0) {
    return (
      <section className="card">
        <div className="community-empty">
          <span className="community-empty-icon">🎉</span>
          <h3>All caught up!</h3>
          <p className="sub">
            No recordings need feedback right now. Check back later, or share your own!
          </p>
        </div>
      </section>
    );
  }

  if (!current) return null;

  return (
    <section className="card community-review-card">
      <div className="community-review-header">
        <span className="community-review-count">
          {currentIndex + 1} of {recordings.length}
        </span>
        {current.pattern_type && (
          <span className="community-review-pattern">{current.pattern_type}</span>
        )}
        {current.bpm && (
          <span className="community-review-bpm">{current.bpm} BPM</span>
        )}
      </div>

      {/* Audio player */}
      <div className="community-player">
        {currentUrl ? (
          <>
            <audio
              ref={audioRef}
              src={currentUrl}
              onEnded={() => setIsPlaying(false)}
              onError={() => console.error("Audio failed to load")}
            />
            <button
              type="button"
              className="community-play-btn touch-target"
              onClick={handlePlay}
            >
              {isPlaying ? "⏸ Pause" : "▶ Play"}
            </button>
            <span className="community-duration">
              {Math.round(current.duration_ms / 1000)}s
            </span>
          </>
        ) : (
          <LoadingSpinner message="Loading audio..." />
        )}
      </div>

      {current.description && (
        <p className="community-description">&quot;{current.description}&quot;</p>
      )}

      {/* Feedback form */}
      {alreadyReviewed ? (
        <div className="community-already-reviewed">
          <span>✓ You've already reviewed this recording</span>
          <button type="button" className="btn" onClick={handleNext}>
            Next Recording →
          </button>
        </div>
      ) : (
        <FeedbackForm
          recordingId={current.id}
          onSubmit={() => {
            onReviewComplete();
            handleNext();
          }}
          onSkip={handleNext}
        />
      )}
    </section>
  );
}

// ============================================
// Feedback Form
// ============================================

function FeedbackForm({
  recordingId,
  onSubmit,
  onSkip,
}: {
  recordingId: string;
  onSubmit: () => void;
  onSkip: () => void;
}) {
  const [cleanliness, setCleanliness] = useState(3);
  const [timing, setTiming] = useState(3);
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const toggleIssue = (issueId: string) => {
    setSelectedIssues((prev) =>
      prev.includes(issueId)
        ? prev.filter((id) => id !== issueId)
        : [...prev, issueId]
    );
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const success = await submitFeedback(recordingId, {
      cleanlinessRating: cleanliness,
      timingRating: timing,
      detectedIssues: selectedIssues,
      comment: comment.trim() || undefined,
    });
    setSubmitting(false);

    if (success) {
      onSubmit();
    }
  };

  return (
    <div className="feedback-form">
      <div className="feedback-section">
        <label className="feedback-label">Cleanliness (flams vs clean)</label>
        <div className="feedback-rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              className={`feedback-rating-btn ${cleanliness === n ? "feedback-rating-active" : ""}`}
              onClick={() => setCleanliness(n)}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="feedback-rating-labels">
          <span>Lots of flams</span>
          <span>Very clean</span>
        </div>
      </div>

      <div className="feedback-section">
        <label className="feedback-label">Timing (steady vs rushing/dragging)</label>
        <div className="feedback-rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              className={`feedback-rating-btn ${timing === n ? "feedback-rating-active" : ""}`}
              onClick={() => setTiming(n)}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="feedback-rating-labels">
          <span>Unsteady</span>
          <span>Rock solid</span>
        </div>
      </div>

      <div className="feedback-section">
        <label className="feedback-label">What did you notice? (select any)</label>
        <div className="feedback-issues">
          {FEEDBACK_ISSUES.map((issue) => (
            <button
              key={issue.id}
              type="button"
              className={`feedback-issue-btn ${selectedIssues.includes(issue.id) ? "feedback-issue-active" : ""}`}
              onClick={() => toggleIssue(issue.id)}
            >
              <span className="feedback-issue-emoji"><Icon name={issue.icon} size={18} /></span>
              <span className="feedback-issue-label">{issue.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="feedback-section">
        <label className="feedback-label">Quick tip (optional)</label>
        <textarea
          className="feedback-comment"
          placeholder="One specific suggestion to help them improve..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={200}
          rows={2}
        />
      </div>

      <div className="feedback-actions">
        <button
          type="button"
          className="btn feedback-submit-btn"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Submit Feedback"}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onSkip}>
          Skip
        </button>
      </div>
    </div>
  );
}

// ============================================
// My Recordings Tab
// ============================================

function MyRecordingsTab({ recordings }: { recordings: SharedRecording[] }) {
  if (recordings.length === 0) {
    return (
      <section className="card">
        <div className="community-empty">
          <span className="community-empty-icon">📤</span>
          <h3>No shared recordings yet</h3>
          <p className="sub">
            After a practice session, use the recorder and tap "Share for Feedback"
            to get input from other drummers.
          </p>
        </div>
      </section>
    );
  }

  return (
    <div className="my-recordings-list">
      {recordings.map((recording) => (
        <MyRecordingCard key={recording.id} recording={recording} />
      ))}
    </div>
  );
}

function MyRecordingCard({ recording }: { recording: SharedRecording }) {
  const [feedback, setFeedback] = useState<FeedbackSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeedbackSummary(recording.id).then((summary) => {
      setFeedback(summary);
      setLoading(false);
    });
  }, [recording.id]);

  const formatDate = (ts: string) => {
    const date = new Date(ts);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <section className="card my-recording-card">
      <div className="my-recording-header">
        <span className="my-recording-date">{formatDate(recording.created_at)}</span>
        {recording.pattern_type && (
          <span className="my-recording-pattern">{recording.pattern_type}</span>
        )}
        <span className="my-recording-feedback-count">
          {recording.feedback_count} review{recording.feedback_count !== 1 ? "s" : ""}
        </span>
      </div>

      {recording.description && (
        <p className="my-recording-description">&quot;{recording.description}&quot;</p>
      )}

      {loading ? (
        <p className="sub">Loading feedback...</p>
      ) : feedback ? (
        <div className="my-recording-feedback">
          <div className="my-recording-scores">
            <div className="my-recording-score">
              <span className="my-recording-score-value">{feedback.avg_cleanliness}</span>
              <span className="my-recording-score-label">Cleanliness</span>
            </div>
            <div className="my-recording-score">
              <span className="my-recording-score-value">{feedback.avg_timing}</span>
              <span className="my-recording-score-label">Timing</span>
            </div>
          </div>

          {feedback.common_issues.length > 0 && (
            <div className="my-recording-issues">
              <span className="my-recording-issues-label">Common feedback:</span>
              {feedback.common_issues.map((issue) => {
                const issueData = FEEDBACK_ISSUES.find((i) => i.id === issue);
                return (
                  <span key={issue} className="my-recording-issue">
                    {issueData && <Icon name={issueData.icon} size={14} />} {issue}
                  </span>
                );
              })}
            </div>
          )}

          {feedback.comments.length > 0 && (
            <div className="my-recording-comments">
              <span className="my-recording-comments-label">Tips from reviewers:</span>
              {feedback.comments.slice(0, 3).map((c, i) => (
                <p key={i} className="my-recording-comment">&quot;{c}&quot;</p>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="sub">No feedback yet. Check back soon!</p>
      )}
    </section>
  );
}
