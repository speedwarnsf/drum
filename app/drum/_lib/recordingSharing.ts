/**
 * Recording Sharing System
 * 
 * Enables the social layer (70-20-10 model):
 * - Share recordings anonymously for community feedback
 * - Get feedback from other drummers
 * - Build the "20% social" learning component
 * 
 * Uses Supabase Storage for audio files and a database table for metadata.
 */

import { getSupabaseClient } from "./supabaseClient";

export type SharedRecording = {
  id: string;
  user_id: string;
  storage_path: string;
  duration_ms: number;
  pattern_type: string | null; // e.g., "paradiddle", "basic-groove", null for general
  bpm: number | null;
  module_id: number | null;
  description: string | null;
  feedback_count: number;
  avg_cleanliness: number | null; // 1-5 rating
  created_at: string;
};

export type RecordingFeedback = {
  id: string;
  recording_id: string;
  reviewer_id: string;
  cleanliness_rating: number; // 1-5
  timing_rating: number; // 1-5
  comment: string | null;
  detected_issues: string[]; // ["flam", "rushing", "uneven"]
  created_at: string;
};

export type FeedbackSummary = {
  total_reviews: number;
  avg_cleanliness: number;
  avg_timing: number;
  common_issues: string[];
  comments: string[];
};

// ============================================
// SHARING FUNCTIONS
// ============================================

/**
 * Upload a recording to Supabase Storage and create a shared entry
 */
export async function shareRecording(
  audioBlob: Blob,
  options: {
    durationMs: number;
    patternType?: string;
    bpm?: number;
    moduleId?: number;
    description?: string;
  }
): Promise<SharedRecording | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data: userData, error: authError } = await supabase.auth.getUser();
  if (authError || !userData?.user) {
    console.error("[Sharing] Not authenticated:", authError?.message);
    return null;
  }

  const userId = userData.user.id;
  const fileId = `${userId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const filePath = `shared/${fileId}.webm`;

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from("recordings")
    .upload(filePath, audioBlob, {
      contentType: audioBlob.type || "audio/webm",
      upsert: false,
    });

  if (uploadError) {
    console.error("[Sharing] Upload failed:", uploadError.message);
    return null;
  }

  // Create database entry
  const { data, error: insertError } = await supabase
    .from("drum_shared_recordings")
    .insert({
      user_id: userId,
      storage_path: filePath,
      duration_ms: options.durationMs,
      pattern_type: options.patternType || null,
      bpm: options.bpm || null,
      module_id: options.moduleId || null,
      description: options.description || null,
    })
    .select()
    .single();

  if (insertError) {
    console.error("[Sharing] Insert failed:", insertError.message);
    // Try to clean up the uploaded file
    await supabase.storage.from("recordings").remove([filePath]);
    return null;
  }

  return data as SharedRecording;
}

/**
 * Get the public URL for a shared recording
 */
export async function getRecordingUrl(storagePath: string): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data } = supabase.storage.from("recordings").getPublicUrl(storagePath);
  return data?.publicUrl || null;
}

/**
 * Get recordings available for feedback (not your own, not already reviewed)
 */
export async function getRecordingsForReview(limit = 5): Promise<SharedRecording[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;

  // Get recordings that:
  // 1. Are not from the current user
  // 2. Have fewer than 3 reviews (need more feedback)
  // 3. Were created in the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  let query = supabase
    .from("drum_shared_recordings")
    .select("*")
    .lt("feedback_count", 3)
    .gte("created_at", sevenDaysAgo.toISOString())
    .order("feedback_count", { ascending: true })
    .limit(limit);

  if (userId) {
    query = query.neq("user_id", userId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[Sharing] Failed to load recordings for review:", error.message);
    return [];
  }

  return (data as SharedRecording[]) || [];
}

/**
 * Get your own shared recordings with feedback summaries
 */
export async function getMySharedRecordings(): Promise<SharedRecording[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return [];

  const { data, error } = await supabase
    .from("drum_shared_recordings")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Sharing] Failed to load my recordings:", error.message);
    return [];
  }

  return (data as SharedRecording[]) || [];
}

// ============================================
// FEEDBACK FUNCTIONS
// ============================================

/**
 * Submit feedback for a recording
 */
export async function submitFeedback(
  recordingId: string,
  feedback: {
    cleanlinessRating: number; // 1-5
    timingRating: number; // 1-5
    comment?: string;
    detectedIssues?: string[];
  }
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return false;

  // Insert feedback
  const { error: feedbackError } = await supabase.from("drum_recording_feedback").insert({
    recording_id: recordingId,
    reviewer_id: userData.user.id,
    cleanliness_rating: feedback.cleanlinessRating,
    timing_rating: feedback.timingRating,
    comment: feedback.comment || null,
    detected_issues: feedback.detectedIssues || [],
  });

  if (feedbackError) {
    console.error("[Sharing] Failed to submit feedback:", feedbackError.message);
    return false;
  }

  // Update the recording's feedback count and average
  // (This could also be done with a database trigger for accuracy)
  const { data: allFeedback } = await supabase
    .from("drum_recording_feedback")
    .select("cleanliness_rating")
    .eq("recording_id", recordingId);

  if (allFeedback && allFeedback.length > 0) {
    const avgCleanliness =
      allFeedback.reduce((sum, f) => sum + f.cleanliness_rating, 0) / allFeedback.length;

    await supabase
      .from("drum_shared_recordings")
      .update({
        feedback_count: allFeedback.length,
        avg_cleanliness: Math.round(avgCleanliness * 10) / 10,
      })
      .eq("id", recordingId);
  }

  return true;
}

/**
 * Get feedback summary for a recording
 */
export async function getFeedbackSummary(recordingId: string): Promise<FeedbackSummary | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("drum_recording_feedback")
    .select("*")
    .eq("recording_id", recordingId);

  if (error || !data || data.length === 0) {
    return null;
  }

  const feedback = data as RecordingFeedback[];

  const avgCleanliness =
    feedback.reduce((sum, f) => sum + f.cleanliness_rating, 0) / feedback.length;
  const avgTiming = feedback.reduce((sum, f) => sum + f.timing_rating, 0) / feedback.length;

  // Count common issues
  const issueCounts: Record<string, number> = {};
  feedback.forEach((f) => {
    f.detected_issues?.forEach((issue) => {
      issueCounts[issue] = (issueCounts[issue] || 0) + 1;
    });
  });

  const commonIssues = Object.entries(issueCounts)
    .filter(([, count]) => count >= feedback.length / 2) // Issues in ≥50% of reviews
    .map(([issue]) => issue);

  const comments = feedback
    .filter((f) => f.comment)
    .map((f) => f.comment as string);

  return {
    total_reviews: feedback.length,
    avg_cleanliness: Math.round(avgCleanliness * 10) / 10,
    avg_timing: Math.round(avgTiming * 10) / 10,
    common_issues: commonIssues,
    comments,
  };
}

/**
 * Check if user has already reviewed a recording
 */
export async function hasReviewed(recordingId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return false;

  const { count } = await supabase
    .from("drum_recording_feedback")
    .select("*", { count: "exact", head: true })
    .eq("recording_id", recordingId)
    .eq("reviewer_id", userData.user.id);

  return (count ?? 0) > 0;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Delete a shared recording (and its feedback)
 */
export async function deleteSharedRecording(recordingId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return false;

  // Get the recording to verify ownership and get storage path
  const { data: recording } = await supabase
    .from("drum_shared_recordings")
    .select("*")
    .eq("id", recordingId)
    .eq("user_id", userData.user.id)
    .single();

  if (!recording) {
    console.error("[Sharing] Recording not found or not owned by user");
    return false;
  }

  // Delete from storage
  await supabase.storage.from("recordings").remove([recording.storage_path]);

  // Delete feedback
  await supabase.from("drum_recording_feedback").delete().eq("recording_id", recordingId);

  // Delete recording entry
  const { error } = await supabase
    .from("drum_shared_recordings")
    .delete()
    .eq("id", recordingId);

  if (error) {
    console.error("[Sharing] Failed to delete recording:", error.message);
    return false;
  }

  return true;
}

/**
 * Get issue labels for display
 */
export function getIssueLabel(issue: string): string {
  const labels: Record<string, string> = {
    flam: "Flams detected (two hits instead of one)",
    rushing: "Rushing (tempo speeds up)",
    dragging: "Dragging (tempo slows down)",
    uneven: "Uneven spacing between hits",
    dynamics: "Inconsistent volume",
    timing: "General timing issues",
    clean: "Clean and solid!",
  };
  return labels[issue] || issue;
}

/**
 * Available issues for feedback selection
 * Icons are now icon names for the Icon component
 */
export const FEEDBACK_ISSUES = [
  { id: "flam", label: "Flams (two hits instead of one)", icon: "flam" },
  { id: "rushing", label: "Rushing (speeds up)", icon: "rushing" },
  { id: "dragging", label: "Dragging (slows down)", icon: "dragging" },
  { id: "uneven", label: "Uneven spacing", icon: "uneven" },
  { id: "dynamics", label: "Volume inconsistent", icon: "dynamics" },
  { id: "clean", label: "Sounds clean!", icon: "clean" },
];
