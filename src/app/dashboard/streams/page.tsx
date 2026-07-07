"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function GoLivePage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [latencyMode, setLatencyMode] = useState<"low" | "normal">("low");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = getSupabase();

  const startStream = async () => {
    if (!title.trim()) return;
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data: stream, error } = await supabase.from("streams").insert({
      user_id: user.id, title: title.trim(), description, latency_mode: latencyMode,
      is_live: true, started_at: new Date().toISOString(),
    }).select().single();
    if (error) { alert(error.message); setLoading(false); return; }
    router.push("/stream/" + stream.id);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-3xl font-bold">Go Live</h1>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Stream Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-lg border bg-transparent px-4 py-2"
            placeholder="Sunday Service" maxLength={120} />
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full rounded-lg border bg-transparent px-4 py-2"
            rows={3} maxLength={500} />
        </div>
        <div>
          <label className="text-sm font-medium">Latency Mode</label>
          <div className="mt-2 flex gap-3">
            <button onClick={() => setLatencyMode("low")}
              className={"rounded-lg border px-4 py-2 text-sm " + (latencyMode === "low" ? "border-primary bg-primary/10" : "")}>
              Low Latency (~500ms)
            </button>
            <button onClick={() => setLatencyMode("normal")}
              className={"rounded-lg border px-4 py-2 text-sm " + (latencyMode === "normal" ? "border-primary bg-primary/10" : "")}>
              Normal (DVR)
            </button>
          </div>
        </div>
        <button onClick={startStream} disabled={loading || !title.trim()}
          className="w-full rounded-lg bg-red-600 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">
          {loading ? "Starting..." : "Go Live"}
        </button>
      </div>
    </div>
  );
}
