"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { generateStreamKey } from "@/lib/utils";
import type { StreamKey } from "@/lib/types";

export default function StreamKeysPage() {
  const [keys, setKeys] = useState<StreamKey[]>([]);
  const [newKey, setNewKey] = useState<string | null>(null);
  const supabase = getSupabase();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from("stream_keys").select("*").eq("user_id", user.id).then(({ data }) => setKeys(data || []));
    });
  }, [supabase]);

  const createKey = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const rawKey = generateStreamKey();
    const { error } = await supabase.from("stream_keys").insert({ user_id: user.id, key: rawKey });
    if (error) return alert(error.message);
    setNewKey(rawKey);
    const { data } = await supabase.from("stream_keys").select("*").eq("user_id", user.id);
    setKeys(data || []);
  };

  const deleteKey = async (id: string) => {
    await supabase.from("stream_keys").delete().eq("id", id);
    setKeys(keys.filter((k) => k.id !== id));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Stream Keys</h1>
      <button onClick={createKey} className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground">Generate New Key</button>
      {newKey && (
        <div className="rounded-lg border border-yellow-500 bg-yellow-900/20 p-4">
          <p className="text-sm font-semibold text-yellow-500">Save this key now! It will not be shown again.</p>
          <code className="mt-2 block rounded bg-black/30 px-3 py-2 text-sm font-mono">{newKey}</code>
          <button onClick={() => setNewKey(null)} className="mt-2 text-sm text-muted-foreground hover:underline">Dismiss</button>
        </div>
      )}
      <div className="space-y-3">
        {keys.map((k) => (
          <div key={k.id} className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">{k.label}</p>
              <p className="text-xs text-muted-foreground">Created {new Date(k.created_at).toLocaleDateString()} &middot; {k.is_active ? "Active" : "Inactive"}</p>
            </div>
            <button onClick={() => deleteKey(k.id)} className="text-sm text-destructive hover:underline">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
