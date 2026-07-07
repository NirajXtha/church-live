"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import type { Report } from "@/lib/types";

export default function AdminReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const supabase = getSupabase();

  useEffect(() => {
    supabase.from("reports").select("*").eq("status", "pending")
      .order("created_at", { ascending: false })
      .then(({ data }) => setReports((data || []) as Report[]));
  }, [supabase]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("reports").update({ status, reviewed_at: new Date().toISOString() }).eq("id", id);
    setReports(reports.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Reports</h1>
      {reports.length === 0 ? <p className="text-muted-foreground">No pending reports.</p> : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="rounded-lg border p-4">
              <p className="text-sm font-medium">Report #{r.id.slice(0, 8)}</p>
              <p className="text-sm text-muted-foreground">Reason: {r.reason}</p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => updateStatus(r.id, "dismissed")} className="rounded bg-secondary px-3 py-1 text-xs">Dismiss</button>
                <button onClick={() => updateStatus(r.id, "actioned")} className="rounded bg-primary px-3 py-1 text-xs text-primary-foreground">Take Action</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
