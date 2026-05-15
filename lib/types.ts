export type UserType = "super_admin" | "vendor_admin";

export interface SessionUser {
  id: string;
  email: string;
  user_type: UserType;
}

export interface LoginResponse {
  user: SessionUser;
  access_token: string;
  token_type: string;
}

export interface Vendor {
  id: string;
  user_id: string;
  name: string;
  email: string;
  location: string | null;
  city: string | null;
  state: string | null;
  pin_code: number | null;
  created_at: string;
  updated_at: string;
}

export interface VendorListItem {
  id: string;
  name: string;
  email: string;
  city: string | null;
  state: string | null;
  created_at: string;
}

export interface PaginatedVendors {
  items: VendorListItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface VendorDropdownItem {
  id: string;
  name: string;
}

export interface CustomerOut {
  id: string;
  name: string;
  contact_number: string;
  budget: string;
  looking_to_buy_in: string;
  created_at: string;
}

export interface PaginatedCustomers {
  items: CustomerOut[];
  total: number;
  page: number;
  page_size: number;
}

export interface DailyCount {
  day: string;
  count: number;
}

export interface ScanStats {
  total_scans: number;
  unique_visitors: number;
  conversion_rate: number;
}

export interface AdminKpi {
  total_vendors: number;
  total_customers: number;
  customers_today: number;
  customers_this_month: number;
  scans: ScanStats;
  scans_this_month: ScanStats;
}

export interface VendorKpi {
  total_customers: number;
  customers_today: number;
  customers_this_week: number;
  customers_this_month: number;
  scans: ScanStats;
  scans_this_month: ScanStats;
}

export interface TopVendor {
  vendor_id: string;
  vendor_name: string;
  customer_count: number;
}

export interface CategoryCount {
  label: string;
  count: number;
}

export interface AdminLatestCustomer {
  id: string;
  vendor_id: string;
  vendor_name: string;
  name: string;
  contact_number: string;
  budget: string;
  looking_to_buy_in: string;
  created_at: string;
}

export interface VendorLatestCustomer {
  id: string;
  name: string;
  contact_number: string;
  budget: string;
  looking_to_buy_in: string;
  created_at: string;
}

export interface AdminDashboardStats {
  kpi: AdminKpi;
  daily_last_30_days: DailyCount[];
  daily_scans_last_30_days: DailyCount[];
  top_vendors: TopVendor[];
  budget_distribution: CategoryCount[];
  buy_in_distribution: CategoryCount[];
  latest_customers: AdminLatestCustomer[];
}

export interface VendorDashboardStats {
  kpi: VendorKpi;
  daily_last_30_days: DailyCount[];
  daily_scans_last_30_days: DailyCount[];
  budget_distribution: CategoryCount[];
  buy_in_distribution: CategoryCount[];
  latest_customers: VendorLatestCustomer[];
}

export interface PublicVendorInfo {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
}

export interface QrInfo {
  vendor_id: string;
  vendor_name: string;
  url: string;
}

export const BUDGET_OPTIONS = [
  "₹3-5L",
  "₹5-8L",
  "₹8-12L",
  "₹12L+",
] as const;
export type Budget = (typeof BUDGET_OPTIONS)[number];

export const BUY_IN_OPTIONS = [
  "This week",
  "This month",
  "Just exploring",
] as const;
export type BuyIn = (typeof BUY_IN_OPTIONS)[number];

export interface VendorCarOut {
  car_id: string;
  car_name: string;
  model: string;
  year: number;
  km_driven: number;
  cost_lakh: string;
  registration_year: number;
  transmission: string;
  fuel_type: string;
  owner_type: string;
  created_at: string;
}

export interface PaginatedVendorCars {
  items: VendorCarOut[];
  total: number;
  page: number;
  page_size: number;
}

export interface CarRowError {
  row: number;
  message: string;
}

export interface CarUploadResult {
  total_rows: number;
  inserted: number;
  duplicates_in_file: number;
  duplicates_in_db: number;
  errors: CarRowError[];
}
