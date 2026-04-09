const MINDBODY_API_BASE_URL = "https://api.mindbodyonline.com";
const MINDBODY_API_VERSION = "6";

const MINDBODY_API_KEY = process.env.MINDBODY_API_KEY;
const MINDBODY_SITE_ID = process.env.MINDBODY_SITE_ID;
const MINDBODY_USER_TOKEN = process.env.MINDBODY_USER_TOKEN;

type MindbodyPrimitive = string | number | boolean;
type MindbodyQueryValue = MindbodyPrimitive | MindbodyPrimitive[] | undefined;
type MindbodyQuery = Record<string, MindbodyQueryValue>;

type MindbodyRequestOptions = {
  method: "GET" | "POST";
  path: string;
  query?: MindbodyQuery;
  body?: unknown;
};

export type MindbodyPaginationResponse = {
  RequestedLimit?: number;
  RequestedOffset?: number;
  PageSize?: number;
  TotalResults?: number;
};

export type GetClientsQuery = {
  "request.clientIDs"?: string[];
  "request.includeInactive"?: boolean;
  "request.isProspect"?: boolean;
  "request.lastModifiedDate"?: string;
  "request.limit"?: number;
  "request.offset"?: number;
  "request.searchText"?: string;
  "request.uniqueIds"?: number[];
};

export type GetProductsQuery = {
  "request.categoryIds"?: number[];
  "request.limit"?: number;
  "request.locationId"?: number;
  "request.offset"?: number;
  "request.productIds"?: string[];
  "request.searchText"?: string;
  "request.secondaryCategoryIds"?: number[];
  "request.sellOnline"?: boolean;
  "request.subCategoryIds"?: number[];
};

export type GetContractsQuery = {
  "request.locationId": number;
  "request.contractIds"?: number[];
  "request.limit"?: number;
  "request.offset"?: number;
  "request.promoCode"?: string;
  "request.soldOnline"?: boolean;
  "request.uniqueClientId"?: number;
};

export type GetSalesQuery = {
  "request.endSaleDateTime"?: string;
  "request.limit"?: number;
  "request.offset"?: number;
  "request.paymentMethodId"?: number;
  "request.saleId"?: number;
  "request.startSaleDateTime"?: string;
};

export type MindbodyClientSummary = Record<string, unknown>;

export type GetClientsResponse = {
  PaginationResponse?: MindbodyPaginationResponse;
  Clients?: MindbodyClientSummary[];
} & Record<string, unknown>;

export type MindbodyProductSummary = {
  ProductId?: number;
  Id?: string;
  CategoryId?: number;
  SubCategoryId?: number;
  SecondaryCategoryId?: number;
} & Record<string, unknown>;

export type GetProductsResponse = {
  PaginationResponse?: MindbodyPaginationResponse;
  Products?: MindbodyProductSummary[];
} & Record<string, unknown>;

export type GetContractsResponse = Record<string, unknown>;
export type GetSalesResponse = Record<string, unknown>;
export type GetRequiredClientFieldsResponse = Record<string, unknown>;
export type AddClientRequest = Record<string, unknown>;
export type AddClientResponse = Record<string, unknown>;
export type CheckoutShoppingCartRequest = Record<string, unknown>;
export type PurchaseContractRequest = Record<string, unknown>;

export type MindbodyCheckoutResponse = {
  ShoppingCart?: {
    Id?: string;
    SubTotal?: number;
    DiscountTotal?: number;
    TaxTotal?: number;
  } & Record<string, unknown>;
  Transactions?: Array<
    {
      TransactionID?: number;
      AuthenticationUrl?: string;
    } & Record<string, unknown>
  >;
} & Record<string, unknown>;

export type MindbodyPurchaseContractResponse = {
  ClientId?: string;
  UniqueClientId?: number;
  LocationId?: number;
  ContractId?: number;
  ClientContractId?: number;
  Status?: string;
  PaymentProcessingFailures?: Array<
    {
      Type?: string;
      Message?: string;
      AuthenticationRedirectUrl?: string;
    } & Record<string, unknown>
  >;
} & Record<string, unknown>;

function getRequiredEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function buildMindbodyUrl(path: string, query?: MindbodyQuery): string {
  const url = new URL(
    `/public/v${MINDBODY_API_VERSION}/${path}`,
    MINDBODY_API_BASE_URL,
  );

  if (!query) {
    return url.toString();
  }

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        url.searchParams.append(`${key}[${index}]`, String(item));
      });
      continue;
    }

    url.searchParams.set(key, String(value));
  }

  return url.toString();
}

function getMindbodyHeaders(): Record<string, string> {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    "Api-Key": getRequiredEnv("MINDBODY_API_KEY", MINDBODY_API_KEY),
    SiteId: getRequiredEnv("MINDBODY_SITE_ID", MINDBODY_SITE_ID),
    Authorization: getRequiredEnv("MINDBODY_USER_TOKEN", MINDBODY_USER_TOKEN),
  };
}

function parseMindbodyResponse(responseText: string): unknown {
  if (responseText.length === 0) {
    return null;
  }

  try {
    return JSON.parse(responseText) as unknown;
  } catch {
    throw new Error("Mindbody returned a non-JSON response.");
  }
}

async function mindbodyFetch<T>({
  method,
  path,
  query,
  body,
}: MindbodyRequestOptions): Promise<T> {
  const response = await fetch(buildMindbodyUrl(path, query), {
    method,
    headers: getMindbodyHeaders(),
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });

  const responseText = await response.text();
  const responseData = parseMindbodyResponse(responseText);

  if (!response.ok) {
    throw new Error(
      `Mindbody request failed (${response.status} ${response.statusText}) for ${method} ${path}: ${responseText}`,
    );
  }

  return responseData as T;
}

export async function getClients(query: GetClientsQuery) {
  return mindbodyFetch<GetClientsResponse>({
    method: "GET",
    path: "client/clients",
    query,
  });
}

export async function addClient(body: AddClientRequest) {
  return mindbodyFetch<AddClientResponse>({
    method: "POST",
    path: "client/addclient",
    body,
  });
}

export async function getProducts(query: GetProductsQuery) {
  return mindbodyFetch<GetProductsResponse>({
    method: "GET",
    path: "sale/products",
    query,
  });
}

export async function getContracts(query: GetContractsQuery) {
  return mindbodyFetch<GetContractsResponse>({
    method: "GET",
    path: "sale/contracts",
    query,
  });
}

export async function getSales(query: GetSalesQuery) {
  return mindbodyFetch<GetSalesResponse>({
    method: "GET",
    path: "sale/sales",
    query,
  });
}

export async function getRequiredClientFields() {
  return mindbodyFetch<GetRequiredClientFieldsResponse>({
    method: "GET",
    path: "client/requiredclientfields",
  });
}

export async function checkoutShoppingCart(body: CheckoutShoppingCartRequest) {
  return mindbodyFetch<MindbodyCheckoutResponse>({
    method: "POST",
    path: "sale/checkoutshoppingcart",
    body,
  });
}

export async function purchaseContract(body: PurchaseContractRequest) {
  return mindbodyFetch<MindbodyPurchaseContractResponse>({
    method: "POST",
    path: "sale/purchasecontract",
    body,
  });
}

export function buildProductCheckoutMetadata(): never {
  throw new Error(
    "Product checkout metadata remains isolated until its exact request shape is explicitly confirmed for this implementation.",
  );
}
