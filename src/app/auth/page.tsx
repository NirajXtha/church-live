"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase";

export default function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const supabase = getSupabase();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) alert(error.message);
      else {
        setSuccessMsg("Account created! You can now sign in.");
        setMode("signin");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
    }

    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
    if (error) alert(error.message);
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6 rounded-lg border p-8">
        <h1 className="text-2xl font-bold text-center">
          {mode === "signin" ? "Sign In" : "Sign Up"}
        </h1>

        {successMsg && (
          <p className="text-center text-sm text-green-600">{successMsg}</p>
        )}

        <button onClick={handleGoogleSignIn}
          className="w-full rounded-lg border py-2 text-sm font-medium hover:bg-secondary transition-colors">
          Continue with Google
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <input type="email" placeholder="Email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border bg-transparent px-4 py-2 text-sm" required />
          <input type="password" placeholder="Password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border bg-transparent px-4 py-2 text-sm" required />
          <button type="submit" disabled={loading}
            className="w-full rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
            {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          {mode === "signin" ? (
            <>Don't have an account?{" "}
              <button onClick={() => { setMode("signup"); setSuccessMsg(""); }}
                className="underline cursor-pointer">Sign up</button></>
          ) : (
            <>Already have an account?{" "}
              <button onClick={() => { setMode("signin"); setSuccessMsg(""); }}
                className="underline cursor-pointer">Sign in</button></>
          )}
        </p>
      </div>
    </div>
  );
}
