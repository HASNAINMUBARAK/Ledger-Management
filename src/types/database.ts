export type BusinessType = 'HOTEL' | 'RESTAURANT';
export type PaymentMethod = 'CASH' | 'BANK';
export type ExpenseCategory = 'FOOD' | 'STAFF' | 'ELECTRICITY' | 'RENT' | 'MAINTENANCE' | 'OTHER';
export type SubscriptionStatus = 'ACTIVE' | 'INACTIVE' | 'TRIAL' | 'CANCELLED';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  type: BusinessType;
  cash_balance: number;
  bank_balance: number;
  stripe_customer_id?: string;
  subscription_status: SubscriptionStatus;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  business_id: string;
  date: string;
  category: ExpenseCategory;
  amount: number;
  payment_method: PaymentMethod;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  business_id: string;
  date: string;
  amount: number;
  payment_method: PaymentMethod;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface PnLReport {
  totalSales: number;
  totalExpenses: number;
  netProfit: number;
  salesByMethod: { cash: number; bank: number };
  expensesByMethod: { cash: number; bank: number };
  expensesByCategory: Record<ExpenseCategory, number>;
}
