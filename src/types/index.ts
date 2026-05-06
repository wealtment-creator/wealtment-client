// // ─── Auth ─────────────────────────────────────────────────────────────────────
// export interface User {
//   _id: string;
//   id?: number;            // legacy compat
//   name: string;
//   email: string;
//   token: string;
//   role: "user" | "admin";
//   isAdmin: boolean;
//   bitcoinAddress?: string;
//   litecoinAddress?: string;
//   // local-only derived fields
//   balance: number;
//   btcBalance: number;
//   ltcBalance: number;
//   package: string | null;
//   // legacy aliases
//   bitcoin?: string;
//   litecoin?: string;
//   user:{ _id: any, name: any, email: any }
// }

// export interface AuthLoginResponse {
//   token: string;
//   user: {
//     _id: string;
//     name: string;
//     email: string;
//     role: "user" | "admin";
//     bitcoinAddress?: string;
//     litecoinAddress?: string;
//   };
// }

// // ─── Plans (Packages) ─────────────────────────────────────────────────────────
// export interface Plan {
//   _id: string;
//   id?: number;            // legacy compat
//   name: string;
//   pct: number;            // alias for returnRate
//   returnRate: number;     // e.g. 20 = 20%
//   days: number;           // duration in days
//   min: number;            // alias for minAmount
//   max: number | null;     // alias for maxAmount
//   minAmount: number;
//   maxAmount: number | null;
//   featured?: boolean;
//   color?: string;
//   profitPercentage?:number
//   minimumDeposit?:number
//   maximumDeposit?:number
//   duration?:number|string

// }

// // onst rate    = (p: Plan) => p.profitPercentage ?? p.pct ?? 0;
// //   const minAmt  = (p: Plan) => p.minimumDeposit ?? p.min  ?? 0;
// //   const maxAmt  = (p: Plan) => p.maximumDeposit  ?? p.max  ?? null;
// // legacy alias used across UI
// export type Package = Plan;

// // ─── Investments ──────────────────────────────────────────────────────────────
// export interface Investment {
//   _id: string;
//   userId: string;
//   planId: string;
//   plan?: Plan;
//   amount: number;
//   status: "pending" | "active" | "completed" | "cancelled";
//   startDate?: string;
//   endDate?: string;
//   expectedReturn?: number;
//   createdAt: string;
// }

// // ─── Deposits ─────────────────────────────────────────────────────────────────
// export interface Deposit {
//   _id?: string;
//   userId: string;
//   user?: { name: string; email: string };
//   investmentId?: string;
//   amount: number;
//   coin: "BTC" | "LTC";
//   coinType:"bitcoin" | "litecoin"
//   proof?: string;
//   status: "pending" | "approved" | "rejected";
//   createdAt: string;
// }

// // ─── Withdrawals ──────────────────────────────────────────────────────────────
// // export interface Withdrawal {
// //   _id: string;
// //   userId: string;
// //   user?: { name: string; email: string; bitcoinAddress?: string; litecoinAddress?: string };
// //   amount: number;
// //   coin: "BTC" | "LTC";
// //   walletAddress?: string;
// //   status: "pending" | "approved" | "rejected";
// //   createdAt: string;
// // }

// export interface Withdrawal {
//   _id: string;
//   user: {
//     _id: string;
//     name: string;
//     email: string;
//   } | string;             // /withdrawals/my returns user as string id
//   coinType: "bitcoin" | "litecoin";   // API uses full word
//   walletAddress?: string;
//   amount: number;
//   status: "pending" | "approved" | "rejected";
//   approvedAt?: string;
//   approvedBy?: string;
//   createdAt: string;
//   updatedAt: string;
// }

// // ─── Admin user row (local mock shape) ───────────────────────────────────────
// export interface AdminUser {
//   id: number;
//   _id?: string;
//   name: string;
//   email: string;
//   package: string;
//   amount: number;
//   status: "pending" | "approved" | "rejected";
//   balance: number;
//   days: number;
//   packageId: number;
// }

// // ─── Crypto ───────────────────────────────────────────────────────────────────
// export interface Coin {
//   sym: string;
//   name: string;
//   price: number;
//   chg: number;
// }

// // Legacy alias
// export interface WithdrawalRequest extends Withdrawal {
//   id: string;
//   userName: string;
//   coinType: "bitcoin" | "litecoin";
//   walletAddress: string;
//   usdValue: number;
// }


// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface User {
  _id: string;
  id?: number;
  name: string;
  email: string;
  token: string;
  role: "user" | "admin";
  isAdmin: boolean;
  bitcoinAddress?: string;
  litecoinAddress?: string;
  balance: number;
  btcBalance: number;
  ltcBalance: number;
  package: string | null;
  bitcoin?: string;
  referralCode?: string;
  litecoin?: string;
  bitcoinBalance?: number|string|null;
  litecoinBalance?: number|string|null;
}

// ─── Plans ────────────────────────────────────────────────────────────────────
export interface Plan {
  _id?: string;
  id?: number;
  name?: string;
  pct?: number;
  returnRate?: number;
  days?: number;
  min?: number;
  max?: number | null;
  minAmount?: number;
  maxAmount?: number | null;
  featured?: boolean;
  color?: string;
  profitPercentage?:number;
  minimumDeposit?:number;
  maximumDeposit?:number;
  duration?:number|string
}
export type Package = Plan;

// ─── Investments ──────────────────────────────────────────────────────────────
export interface Investment {
  _id: string;
  userId: string;
  planId?: string;
  plan?: Plan;
  package?: Plan;
  amount: number;
  profitPercentage?: number;
  totalProfit?: number;
  status: "pending" | "active" | "completed" | "cancelled";
  startDate?: string;
  endDate?: string;
  expectedReturn?: number;
  createdAt: string;
}

// ─── Deposits — matches real API response ────────────────────────────────────
// GET /deposits  → array of these
export interface Deposit {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  } | string;             // /deposits/my returns user as string id
  coinType: "bitcoin" | "litecoin";   // API uses full word
  walletAddress?: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
  coin?:string
}

// ─── Withdrawals — matches real API response ──────────────────────────────────
// GET /withdrawals  → array of these
export interface Withdrawal {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  } | string;             // /withdrawals/my returns user as string id
  coinType: "bitcoin" | "litecoin";   // API uses full word
  walletAddress?: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  approvedAt?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
  coin?:string
}

// ─── Crypto ───────────────────────────────────────────────────────────────────
export interface Coin {
  sym: string;
  name: string;
  price: number;
  chg: number;
}
