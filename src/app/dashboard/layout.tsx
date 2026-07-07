"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import type { Profile } from "@/lib/types";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const router = useRouter();
  const supabase = getSupabase();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return router.push("/auth");
      supabase.from("profiles").select("*").eq("id", data.user.id).single().then(({ data: p }) => setProfile(p));
    });
  }, [router, supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-card p-4">
        <Link href="/dashboard" className="text-xl font-bold text-primary">ChurchLive</Link>
        <nav className="mt-8 space-y-2">
          <Link href="/dashboard" className="block rounded-lg px-3 py-2 text-sm hover:bg-secondary">Overview</Link>
          <Link href="/dashboard/keys" className="block rounded-lg px-3 py-2 text-sm hover:bg-secondary">Stream Keys</Link>
          <Link href="/dashboard/streams" className="block rounded-lg px-3 py-2 text-sm hover:bg-secondary">Go Live</Link>
          <Link href="/dashboard/streams" className="block rounded-lg px-3 py-2 text-sm hover:bg-secondary">Past Streams</Link>
          {profile?.role === "admin" && (
            <Link href="/admin" className="block rounded-lg px-3 py-2 text-sm hover:bg-secondary text-primary">Admin Panel</Link>
          )}
        </nav>
        <div className="absolute bottom-4 left-4">
          <p className="text-xs text-muted-foreground">{profile?.username}</p>
          <button onClick={signOut} className="text-xs text-destructive hover:underline">Sign Out</button>
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
