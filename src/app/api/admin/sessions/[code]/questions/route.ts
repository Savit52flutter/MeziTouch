import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/require-admin-api";
import { getSessionByCode } from "@/lib/session-lookup";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const denied = await requireAdminApi(request);
  if (denied) {
    return denied;
  }

  try {
    const { code } = await params;
    const session = await getSessionByCode(code);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const body = (await request.json()) as {
      prompt?: string;
      options?: string[];
    };

    const prompt = body.prompt?.trim();
    const options = (body.options ?? [])
      .map((option) => option.trim())
      .filter(Boolean);

    if (!prompt) {
      return NextResponse.json({ error: "Question prompt is required" }, { status: 400 });
    }

    if (options.length < 2) {
      return NextResponse.json(
        { error: "Add at least two answer options" },
        { status: 400 },
      );
    }

    const supabase = createServerClient();
    const { count } = await supabase
      .from("questions")
      .select("id", { count: "exact", head: true })
      .eq("session_id", session.id);

    const { data, error } = await supabase
      .from("questions")
      .insert({
        session_id: session.id,
        section: "Custom",
        prompt,
        question_type: "multiple_choice",
        options,
        sort_order: count ?? 0,
        is_confidential: false,
        allow_multiple: false,
        allow_other: false,
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id: data.id });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
