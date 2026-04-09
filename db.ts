import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;

function getRequiredEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const sql = neon(getRequiredEnv("DATABASE_URL", DATABASE_URL));
