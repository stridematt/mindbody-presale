import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;

export type PresaleOffer = {
  id: string;
  slug: string;
  name: string;
  mindbodyProductId: string;
  mindbodyContractId: number;
  mindbodyLocationId: number;
  priceCents: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type PresaleOfferRow = {
  id: string;
  slug: string;
  name: string;
  mindbody_product_id: string;
  mindbody_contract_id: number;
  mindbody_location_id: number;
  price_cents: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

function getRequiredEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function mapPresaleOffer(row: PresaleOfferRow): PresaleOffer {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    mindbodyProductId: row.mindbody_product_id,
    mindbodyContractId: row.mindbody_contract_id,
    mindbodyLocationId: row.mindbody_location_id,
    priceCents: row.price_cents,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function getSql() {
  return neon(getRequiredEnv("DATABASE_URL", DATABASE_URL));
}

export async function listActivePresaleOffers(): Promise<PresaleOffer[]> {
  const sql = getSql();

  const rows = await sql<PresaleOfferRow[]>`
    select
      id,
      slug,
      name,
      mindbody_product_id,
      mindbody_contract_id,
      mindbody_location_id,
      price_cents,
      is_active,
      created_at,
      updated_at
    from presale_offers
    where is_active = true
    order by created_at asc
  `;

  return rows.map(mapPresaleOffer);
}

export async function getPresaleOfferBySlug(
  slug: string,
): Promise<PresaleOffer | null> {
  const sql = getSql();

  const rows = await sql<PresaleOfferRow[]>`
    select
      id,
      slug,
      name,
      mindbody_product_id,
      mindbody_contract_id,
      mindbody_location_id,
      price_cents,
      is_active,
      created_at,
      updated_at
    from presale_offers
    where slug = ${slug}
    limit 1
  `;

  const row = rows[0];

  return row ? mapPresaleOffer(row) : null;
}

export async function getPresaleOfferById(
  id: string,
): Promise<PresaleOffer | null> {
  const sql = getSql();

  const rows = await sql<PresaleOfferRow[]>`
    select
      id,
      slug,
      name,
      mindbody_product_id,
      mindbody_contract_id,
      mindbody_location_id,
      price_cents,
      is_active,
      created_at,
      updated_at
    from presale_offers
    where id = ${id}
    limit 1
  `;

  const row = rows[0];

  return row ? mapPresaleOffer(row) : null;
}
