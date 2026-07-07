export type Role = "user" | "moderator" | "admin";
export type LatencyMode = "low" | "normal";
export type ReportStatus = "pending" | "reviewed" | "dismissed" | "actioned";

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: Role;
  created_at: string;
}

export interface StreamKey {
  id: string;
  user_id: string;
  key: string;
  label: string;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
}

export interface Stream {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  category: string | null;
  tags: string[];
  is_live: boolean;
  latency_mode: LatencyMode;
  started_at: string | null;
  ended_at: string | null;
  viewer_count: number;
  recording_url: string | null;
  recording_expires_at: string | null;
  created_at: string;
}

export interface ChatMessage {
  id: number;
  stream_id: string;
  user_id: string;
  message: string;
  is_deleted: boolean;
  created_at: string;
  profiles?: Pick<Profile, "username" | "avatar_url" | "role">;
}

export interface Ban {
  id: string;
  stream_id: string | null;
  user_id: string;
  banned_by: string;
  reason: string | null;
  is_permanent: boolean;
  expires_at: string | null;
  created_at: string;
}

export interface Mute {
  id: string;
  stream_id: string | null;
  user_id: string;
  muted_by: string;
  expires_at: string | null;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  stream_id: string | null;
  message_id: number | null;
  reason: string;
  status: ReportStatus;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}
