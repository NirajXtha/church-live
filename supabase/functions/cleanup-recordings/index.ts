import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (_req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const storageUrl = Deno.env.get("SUPABASE_STORAGE_URL")!;
  const storageKey = Deno.env.get("SUPABASE_STORAGE_SERVICE_ROLE_KEY")!;

  const supabase = createClient(supabaseUrl, supabaseKey);
  const storageClient = createClient(storageUrl, storageKey);

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 15);

  // Get expired recordings
  const { data: expiredStreams } = await supabase
    .from("streams")
    .select("id, recording_url")
    .not("recording_url", "is", null)
    .lt("recording_expires_at", cutoff.toISOString());

  if (!expiredStreams?.length) {
    return new Response(JSON.stringify({ cleaned: 0 }), { status: 200 });
  }

  for (const stream of expiredStreams) {
    if (stream.recording_url) {
      const filePath = stream.recording_url.split("/").pop();
      if (filePath) {
        await storageClient.storage
          .from("recordings")
          .remove([filePath]);
      }
    }

    await supabase
      .from("streams")
      .update({ recording_url: null, recording_expires_at: null })
      .eq("id", stream.id);
  }

  return new Response(
    JSON.stringify({ cleaned: expiredStreams.length }),
    { status: 200 }
  );
});
