import { NextResponse } from "next/server";

import { sql } from "@/lib/db";

export async function GET() {
  const env = {
    MINDBODY_API_KEY: Boolean(process.env.MINDBODY_API_KEY),
    MINDBODY_SITE_ID: Boolean(process.env.MINDBODY_SITE_ID),
    MINDBODY_USER_TOKEN: Boolean(process.env.MINDBODY_USER_TOKEN),
    DATABASE_URL: Boolean(process.env.DATABASE_URL),
    NEXT_PUBLIC_APP_URL: Boolean(process.env.NEXT_PUBLIC_APP_URL),
  };

  try {
    await sql`select 1 as ok`;

    return NextResponse.json({
      status: "ok",
      service: "mindbody-presale",
      env,
      database: "ok",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown database error";

    return NextResponse.json(
      {
        status: "error",
        service: "mindbody-presale",
        env,
        database: "error",
        message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
