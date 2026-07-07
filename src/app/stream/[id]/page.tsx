"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import type { Stream } from "@/lib/types";

export default function StreamPage() {
  const { id } = useParams<{ id: string }>();
  const [stream, setStream] = useState<Stream | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [latencyMode, setLatencyMode] = useState<"low" | "normal">("low");
  const [isLive, setIsLive] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const supabase = getSupabase();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id || null));
  }, [supabase]);

  useEffect(() => {
    supabase.from("streams").select("*").eq("id", id).single().then(({ data }) => {
      if (data) { setStream(data); setIsLive(data.is_live); setLatencyMode(data.latency_mode as "low" | "normal"); }
    });
  }, [id, supabase]);

  useEffect(() => {
    supabase.from("chat_messages").select("*, profiles!inner(username, avatar_url, role)")
      .eq("stream_id", id).eq("is_deleted", false)
      .order("created_at", { ascending: true }).limit(100)
      .then(({ data }) => { if (data) setMessages(data); });
  }, [id, supabase]);

  useEffect(() => {
    const channel = supabase.channel("chat:" + id)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: "stream_id=eq." + id },
        (payload) => { const msg = payload.new as any; if (!msg.is_deleted) setMessages((prev) => [...prev, msg]); }
      ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id, supabase]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !userId) return;
    const { error } = await supabase.from("chat_messages").insert({
      stream_id: id, user_id: userId, message: input.trim().slice(0, 500),
    });
    if (error) {
      if (error.message.includes("bans")) alert("You are banned from this stream.");
      else if (error.message.includes("mutes")) alert("You are muted in this stream.");
      return;
    }
    setInput("");
  }, [input, userId, id, supabase]);

  if (!stream) return <div className="flex h-screen items-center justify-center"><p className="text-muted-foreground">Loading stream...</p></div>;

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold">{stream.title}</h1>
          {isLive && <span className="rounded bg-red-600 px-2 py-0.5 text-xs font-medium text-white">LIVE</span>}
        </div>
        <button onClick={() => setLatencyMode(latencyMode === "low" ? "normal" : "low")}
          className="rounded-lg border px-3 py-1 text-xs">
          {latencyMode === "low" ? "Low Latency" : "DVR Mode"}
        </button>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 bg-black flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p className="text-lg">{isLive ? "Stream is live - player will render here" : "Stream has ended"}</p>
            {stream.recording_url && (
              <a href={stream.recording_url} className="mt-4 inline-block rounded-lg bg-primary px-6 py-2 text-sm text-primary-foreground">Watch Recording</a>
            )}
          </div>
        </div>
        <div className="flex w-80 flex-col border-l bg-card">
          <div className="border-b px-4 py-3"><h2 className="text-sm font-semibold">Live Chat</h2></div>
          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
            {messages.map((msg: any) => (
              <div key={msg.id} className="text-sm">
                <span className="font-medium text-primary">{msg.profiles?.username || "unknown"}</span>: {msg.message}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={sendMessage} className="border-t p-4">
            <div className="flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)}
                placeholder={userId ? "Type a message..." : "Sign in to chat"}
                disabled={!userId} maxLength={500}
                className="flex-1 rounded-lg border bg-transparent px-3 py-2 text-sm" />
              <button type="submit" disabled={!userId || !input.trim()}
                className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50">Send</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
