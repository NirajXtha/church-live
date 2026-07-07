"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import type { Stream } from "@/lib/types";
import Link from "next/link";

export default function DashboardPage() {
  const [activeStream, setActiveStream] = useState<Stream | null>(null);
  const [recentStreams, setRecentStreams] = useState<Stream[]>([]);
  const supabase = getSupabase();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from("streams").select("*").eq("user_id", user.id).eq("is_live", true).single().then(({ data }) => setActiveStream(data));
      supabase.from("streams").select("*").eq("user_id", user.id).eq("is_live", false).order("created_at", { ascending: false }).limit(5).then(({ data }) => setRecentStreams(data || []));
    });
  }, [supabase]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      {activeStream && (
        <div className="rounded-lg border border-primary/50 bg-card p-6">
          <h2 className="text-lg font-semibold">You are live!</h2>
          <p className="text-muted-foreground">{activeStream.title}</p>
          <Link href={`/stream/${activeStream.id}`} className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground">View Stream</Link>
        </div>
      )}
      <div>
        <Link href="/dashboard/streams" className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground">Go Live</Link>
      </div>
      {recentStreams.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Streams</h2>
          <div className="space-y-2">
            {recentStreams.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">{s.title}</p>
                  <p className="text-sm text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
