"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

export default function AdminStreams() {
  const [streams, setStreams] = useState<any[]>([]);
  const supabase = getSupabase();

  useEffect(() => {
    supabase.from("streams").select("*, profiles!inner(username)").order("created_at", { ascending: false }).limit(50)
      .then(({ data }) => setStreams(data || []));
  }, [supabase]);

  const endStream = async (id: string) => {
    await supabase.from("streams").update({ is_live: false, ended_at: new Date().toISOString() }).eq("id", id);
    setStreams(streams.map((s: any) => s.id === id ? { ...s, is_live: false } : s));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Streams</h1>
      <div className="space-y-2">
        {streams.map((s: any) => (
          <div key={s.id} className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">{s.title}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(s.created_at).toLocaleDateString()}
                {s.is_live && <span className="ml-2 text-red-500">LIVE</span>}
              </p>
            </div>
            {s.is_live && (
              <button onClick={() => endStream(s.id)} className="rounded bg-destructive px-3 py-1 text-xs text-white">End Stream</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
