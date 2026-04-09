import { NextResponse } from "next/server";

import { listActivePresaleOffers } from "../../../lib/presale-offers";

export async function GET() {
  try {
    const offers = await listActivePresaleOffers();

    return NextResponse.json({
      offers,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown presale offers error";

    return NextResponse.json(
      {
        error: "Failed to load presale offers.",
        message,
      },
      { status: 500 },
    );
  }
}
