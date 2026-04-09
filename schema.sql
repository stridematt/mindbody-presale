create extension if not exists pgcrypto;

create table presale_offers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  mindbody_product_id text not null,
  mindbody_contract_id integer not null,
  mindbody_location_id integer not null,
  price_cents integer not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table presale_customers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  first_name text not null,
  last_name text not null,
  phone text,
  mindbody_client_id text,
  mindbody_unique_client_id bigint,
  signature_base64 text,
  signature_captured_at timestamptz,
  signature_reuse_consented boolean not null default false,
  signature_reuse_consented_at timestamptz,
  signature_reuse_consent_text text,
  stored_card_last_four text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table presale_purchases (
  id uuid primary key default gen_random_uuid(),
  presale_offer_id uuid not null references presale_offers(id),
  presale_customer_id uuid not null references presale_customers(id),
  status text not null,
  activation_status text not null default 'not_started',
  amount_cents integer not null,
  currency text not null default 'USD',
  mindbody_cart_id text,
  mindbody_sale_id bigint,
  mindbody_client_contract_id bigint,
  purchased_at timestamptz,
  activated_at timestamptz,
  activation_started_at timestamptz,
  activation_error text,
  bulk_activation_run_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint presale_purchases_status_check
    check (status in ('pending', 'completed', 'failed')),
  constraint presale_purchases_activation_status_check
    check (
      activation_status in (
        'not_started',
        'processing',
        'pending_authentication',
        'activated',
        'failed'
      )
    )
);

create table bulk_activation_runs (
  id uuid primary key default gen_random_uuid(),
  status text not null,
  requested_by text not null,
  requested_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  summary_json jsonb not null default '{}'::jsonb,
  constraint bulk_activation_runs_status_check
    check (status in ('pending', 'processing', 'completed', 'failed'))
);

alter table presale_purchases
  add constraint presale_purchases_bulk_activation_run_id_fkey
  foreign key (bulk_activation_run_id) references bulk_activation_runs(id);

create table presale_events (
  id uuid primary key default gen_random_uuid(),
  presale_purchase_id uuid not null references presale_purchases(id),
  type text not null,
  payload_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create unique index presale_purchases_mindbody_sale_id_unique
  on presale_purchases (mindbody_sale_id)
  where mindbody_sale_id is not null;

create unique index presale_purchases_mindbody_client_contract_id_unique
  on presale_purchases (mindbody_client_contract_id)
  where mindbody_client_contract_id is not null;

create index presale_customers_email_idx
  on presale_customers (email);

create index presale_purchases_status_idx
  on presale_purchases (status);

create index presale_purchases_activation_status_idx
  on presale_purchases (activation_status);

create index presale_purchases_presale_customer_id_idx
  on presale_purchases (presale_customer_id);

create index presale_purchases_presale_offer_id_idx
  on presale_purchases (presale_offer_id);

create index presale_purchases_bulk_activation_run_id_idx
  on presale_purchases (bulk_activation_run_id);

create index presale_events_presale_purchase_id_idx
  on presale_events (presale_purchase_id);
