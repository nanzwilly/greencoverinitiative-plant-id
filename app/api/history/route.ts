import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";
import type { IdentificationHistoryRecord } from "@/types";

export async function GET() {
  const session = await getServerSession(authOptions);

  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const rows = (await sql`
    select
      id::text,
      user_id::text,
      plant_name,
      scientific_name,
      confidence,
      result_json,
      image_thumbnail,
      created_at::text as created_at
    from identification_history
    where user_id = ${userId}::uuid
    order by created_at desc
    limit 50
  `) as IdentificationHistoryRecord[];

  return NextResponse.json({ success: true, history: rows });
}

