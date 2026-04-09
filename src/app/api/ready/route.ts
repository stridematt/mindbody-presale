import { NextResponse } from "next/server";

export async function GET() {
  const env = {
    MINDBODY_API_KEY: Boolean(process.env.MINDBODY_API_KEY),
    MINDBODY_SITE_ID: Boolean(process.env.MINDBODY_SITE_ID),
    MINDBODY_STAFF_USERNAME: Boolean(process.env.MINDBODY_STAFF_USERNAME),
    MINDBODY_STAFF_PASSWORD: Boolean(process.env.MINDBODY_STAFF_PASSWORD),
    DATABASE_URL: Boolean(process.env.DATABASE_URL),
    NEXT_PUBLIC_APP_URL: Boolean(process.env.NEXT_PUBLIC_APP_URL),
  };

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      {
        status: "not_ready",
        service: "mindbody-presale",
        env,
        database: "not_configured",
        message: "DATABASE_URL is not configured yet.",
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }

  try {
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(process.env.DATABASE_URL);

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
