"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

export default function AdminOverview() {
  const [stats, setStats] = useState({ users: 0, liveStreams: 0, pendingReports: 0, totalStreams: 0 });
  const supabase = getSupabase();

  useEffect(() => {
    Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("streams").select("*", { count: "exact", head: true }).eq("is_live", true),
      supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("streams").select("*", { count: "exact", head: true }),
    ]).then(([users, live, reports, streams]) => {
      setStats({
        users: users.count || 0,
        liveStreams: live.count || 0,
        pendingReports: reports.count || 0,
        totalStreams: streams.count || 0,
      });
    });
  }, [supabase]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Admin Overview</h1>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: stats.users },
          { label: "Live Streams", value: stats.liveStreams },
          { label: "Pending Reports", value: stats.pendingReports },
          { label: "Total Streams", value: stats.totalStreams },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border p-6">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-2 text-3xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
