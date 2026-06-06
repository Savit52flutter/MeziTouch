import { createServerClient } from "./supabase/server";
import type { Session } from "./types";

export async function getSessionByCode(code: string): Promise<Session | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("code", code.toUpperCase())
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}
