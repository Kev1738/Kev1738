export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const Body = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // NOTE: if you only have anon key and your tables are Unrestricted, this still works.
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: Request) {
  try {
    // 1) Validate body
    const raw = await req.json().catch(() => null);
    const parsed = Body.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: "Invalid request body" }, { status: 400 });
    }
    const { email, password } = parsed.data;

    // 2) DB client guard
    const supa = getAdminClient();
    if (!supa) {
      return NextResponse.json(
        { success: false, message: "Server misconfigured: Supabase env vars missing" },
        { status: 500 }
      );
    }

    // 3) Find user
    const { data: user, error } = await supa
      .from("users")
      .select("id, email, role, is_active, password")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ success: false, message: "Database error" }, { status: 500 });
    }
    if (!user || user.is_active === false) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
    }

    // 4) Password check (supports plain or md5-hash in your seed)
    const stored = String(user.password ?? "");
    const isMd5 = /^[a-f0-9]{32}$/i.test(stored);
    let ok = false;
    if (isMd5) {
      const crypto = await import("crypto");
      ok = crypto.createHash("md5").update(password).digest("hex") === stored;
    } else {
      ok = stored === password;
    }
    if (!ok) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
    }

    // 5) Minimal session cookie (upgrade to JWT later)
    const session = { id: user.id, email: user.email, role: user.role };
    const res = NextResponse.json({ success: true, data: session, message: "Login successful" });
    res.cookies.set("auth-token", Buffer.from(JSON.stringify(session)).toString("base64"), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (err) {
    console.error("Login handler error:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
