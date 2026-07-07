import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const event = body.event;

  // Only validate on room creation / participant join
  if (event !== "room_started" && event !== "participant_joined") {
    return NextResponse.json({ ok: true });
  }

  // Extract stream key from participant identity or metadata
  const streamKey = body.participant?.identity || body.room?.metadata;

  if (!streamKey) {
    return NextResponse.json({ ok: true });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Verify stream key exists and is active
  const { data: key } = await supabase
    .from("stream_keys")
    .select("user_id")
    .eq("key", streamKey)
    .eq("is_active", true)
    .single();

  if (!key) {
    return NextResponse.json(
      { error: "Invalid or inactive stream key" },
      { status: 403 }
    );
  }

  // Update last_used_at
  await supabase
    .from("stream_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("key", streamKey);

  return NextResponse.json({ ok: true, user_id: key.user_id });
}
