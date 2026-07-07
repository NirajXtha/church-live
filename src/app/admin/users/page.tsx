"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import type { Profile } from "@/lib/types";

export default function AdminUsers() {
  const [users, setUsers] = useState<Profile[]>([]);
  const supabase = getSupabase();

  useEffect(() => {
    supabase.from("profiles").select("*").order("created_at", { ascending: false })
      .then(({ data }) => setUsers((data || []) as Profile[]));
  }, [supabase]);

  const updateRole = async (id: string, role: string) => {
    await supabase.from("profiles").update({ role } as any).eq("id", id);
    setUsers(users.map((u) => (u.id === id ? { ...u, role: role as Profile["role"] } : u)));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Users</h1>
      <div className="space-y-2">
        {users.map((u) => (
          <div key={u.id} className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">{u.username}</p>
              <p className="text-xs text-muted-foreground">Role: {u.role}</p>
            </div>
            <select value={u.role} onChange={(e) => updateRole(u.id, e.target.value)}
              className="rounded border bg-transparent px-3 py-1 text-sm">
              <option value="user">User</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
