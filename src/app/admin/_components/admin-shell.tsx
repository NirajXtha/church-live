"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import type { Profile } from "@/lib/types";
import Link from "next/link";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const router = useRouter();
  const supabase = getSupabase();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/auth"); return; }
      supabase.from("profiles").select("*").eq("id", user.id).single()
        .then(({ data }) => {
          const p = data as Profile | null;
          if (!p || p.role !== "admin") { router.push("/dashboard"); return; }
          setProfile(p);
        });
    });
  }, [router, supabase]);

  if (!profile) return null;

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-card p-4">
        <Link href="/admin" className="text-xl font-bold text-primary">Admin Panel</Link>
        <nav className="mt-8 space-y-2">
          <Link href="/admin" className="block rounded-lg px-3 py-2 text-sm hover:bg-secondary">Overview</Link>
          <Link href="/admin/reports" className="block rounded-lg px-3 py-2 text-sm hover:bg-secondary">Reports</Link>
          <Link href="/admin/users" className="block rounded-lg px-3 py-2 text-sm hover:bg-secondary">Users</Link>
          <Link href="/admin/streams" className="block rounded-lg px-3 py-2 text-sm hover:bg-secondary">Streams</Link>
          <Link href="/dashboard" className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary">&larr; Back to Dashboard</Link>
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
