const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  detail: unknown;
  constructor(status: number, detail: unknown, message?: string) {
    super(message ?? `Request failed (${status})`);
    this.status = status;
    this.detail = detail;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
};

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const url = new URL(path.startsWith("http") ? path : `${API_BASE}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === "") continue;
      url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, query, headers, ...rest } = options;
  const init: RequestInit = {
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(headers ?? {}),
    },
    ...rest,
  };
  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  const res = await fetch(buildUrl(path, query), init);
  if (res.status === 204) {
    return undefined as T;
  }
  const contentType = res.headers.get("content-type") ?? "";
  if (!res.ok) {
    let detail: unknown = undefined;
    if (contentType.includes("application/json")) {
      detail = await res.json().catch(() => undefined);
    } else {
      detail = await res.text().catch(() => undefined);
    }
    throw new ApiError(res.status, detail);
  }
  if (contentType.includes("application/json")) {
    return (await res.json()) as T;
  }
  return (await res.text()) as unknown as T;
}

export function qrImageUrl(
  vendorId: string,
  format: "png" | "jpeg" | "svg",
  opts: { download?: boolean } = {}
) {
  const url = new URL(`${API_BASE}/admin/qr/${vendorId}`);
  url.searchParams.set("format", format);
  if (opts.download) url.searchParams.set("download", "true");
  return url.toString();
}

export function vendorQrImageUrl(
  format: "png" | "jpeg" | "svg",
  opts: { download?: boolean } = {}
) {
  const url = new URL(`${API_BASE}/vendor/qr/image`);
  url.searchParams.set("format", format);
  if (opts.download) url.searchParams.set("download", "true");
  return url.toString();
}

export function customersCsvUrl(filters: {
  search?: string;
  budget?: string;
  looking_to_buy_in?: string;
}) {
  const url = new URL(`${API_BASE}/vendor/customers/export`);
  if (filters.search) url.searchParams.set("search", filters.search);
  if (filters.budget) url.searchParams.set("budget", filters.budget);
  if (filters.looking_to_buy_in)
    url.searchParams.set("looking_to_buy_in", filters.looking_to_buy_in);
  return url.toString();
}

export const vendorCarsSampleUrl = () => `${API_BASE}/vendor/cars/sample`;

export async function uploadVendorCarsCsv<T = unknown>(file: File): Promise<T> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/vendor/cars/upload`, {
    method: "POST",
    credentials: "include",
    body: form,
  });
  const contentType = res.headers.get("content-type") ?? "";
  if (!res.ok) {
    let detail: unknown = undefined;
    if (contentType.includes("application/json")) {
      detail = await res.json().catch(() => undefined);
    } else {
      detail = await res.text().catch(() => undefined);
    }
    throw new ApiError(res.status, detail);
  }
  return (await res.json()) as T;
}
