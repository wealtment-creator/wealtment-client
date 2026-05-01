// All API calls — import endpointRoute and call the real Wealtment backend
import endpointRoute from "@/lib/endpointRoute";

// ── AUTH ─────────────────────────────────────────────────────────────────────
export const apiSignup = (body: {
  name: string;
  email: string;
  password: string;
  bitcoinAddress?: string;
  litecoinAddress?: string;
  referral?: string;
}) => endpointRoute.post("/auth/signup", body).then((r) => r.data);

export const apiLogin = (body: { email: string; password: string }) =>
  endpointRoute.post("/auth/login", body).then((r) => r.data);

export const apiForgotPassword = (email: string) =>
  endpointRoute.post("/auth/forgot-password", { email }).then((r) => r.data);

export const apiResetPassword = (token: string, password: string) =>
  endpointRoute.post("/auth/reset-password", { token, password }).then((r) => r.data);

// ── USER ─────────────────────────────────────────────────────────────────────
export const apiGetProfile = () =>
  endpointRoute.get("/user/profile").then((r) => r.data);

export const apiUpdateProfile = (body: {
  name?: string;
  bitcoinAddress?: string;
  litecoinAddress?: string;
}) => endpointRoute.put("/user/profile", body).then((r) => r.data);

// ── PLANS ────────────────────────────────────────────────────────────────────
export const apiGetPlans = () =>
  endpointRoute.get("/package").then((r) => r.data);

export const apiCreatePlan = (body: object) =>
  endpointRoute.post("/package", body).then((r) => r.data);

export const apiUpdatePlan = (id: string, body: object) =>
  endpointRoute.put(`/package/${id}`, body).then((r) => r.data);

export const apiDeletePlan = (id: string) =>
  endpointRoute.delete(`/package/${id}`).then((r) => r.data);

// ── INVESTMENTS ───────────────────────────────────────────────────────────────
export const apiInvest = (planId: string, amount:number, coin: "bitcoin" | "litecoin"
) =>
  endpointRoute.post("/investments", { packageId: planId, amount:amount, coinType:coin }).then((r) => r.data);

export const apiGetMyInvestments = () =>
  endpointRoute.get("/investments/my").then((r) => r.data);
  // endpointRoute.get("/package").then((r) => r.data);

export const apiGetAllInvestments = () =>
  endpointRoute.get("/admin/investments").then((r) => r.data);

// balance
export const apiGetBalance = () =>
  endpointRoute.get("/user/balance").then((r) => r.data);

export const apiGetCryptoPrices = () =>
  fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,litecoin&vs_currencies=usd")
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch crypto prices");
      return res.json();
    });
// http://localhost:6000/api/deposit/approve/69dbfd402af28f8a5d6956ec
// ── DEPOSITS ─────────────────────────────────────────────────────────────────
export const apiCreateDeposit = (body: {
  // investmentId?: string;
  amount: number|string;
 coinType: "bitcoin" | "litecoin";
  proof?: string;
}) => endpointRoute.post("/deposits", body).then((r) => r.data);



export const apiGetMyDeposits = () =>
  endpointRoute.get("/deposits/my").then((r) => r.data);

export const apiGetAllDeposits = () =>
  endpointRoute.get("/deposits").then((r) => r.data);

export const apiApproveDeposit = (id: string, description:string) =>
  endpointRoute.put(`/deposits/approve/${id}`,{description}).then((r) => r.data);
// profile
export const apiChangePassword = (body: { currentPassword: string; newPassword: string }) =>
  endpointRoute.put("/user/change-password", body).then((r) => r.data);

// ── WITHDRAWALS ───────────────────────────────────────────────────────────────
export const apiRequestWithdrawal = (body: { amount: number; coin: "BTC" | "LTC" , coinType: string, walletAddress: string }) =>
  endpointRoute.post("/withdrawals", body).then((r) => r.data);

export const apiGetMyWithdrawals = () =>
  endpointRoute.get("/withdrawals/my").then((r) => r.data);

export const apiGetAllWithdrawals = () =>
  endpointRoute.get("/withdrawals").then((r) => r.data);

// export const apiApproveWithdrawal = (id: string) =>
//   endpointRoute.put(`/withdrawals/approve/${id}`).then((r) => r.data);
export const apiApproveWithdrawal = (id: string, description: string) =>
  endpointRoute.put(`/withdrawals/approve/${id}`, { description }).then((r) => r.data);
// https://wealtment-backend.onrender.com/api/withdrawals/approve
// fund user
export const apiFundUser = (id: string, amount: number) =>
  endpointRoute.put(`/admin/fund-user/${id}`, { amount }).then((r) => r.data);

// admin get user
// Add this after apiGetProfile:
export const apiGetAllUsers = () =>
  endpointRoute.get("/admin/users").then((r) => r.data);

// delete user
export const apiDeleteUser= (id: string) =>
  endpointRoute.delete(`/admin/user/${id}`).then((r) => r.data);

// referral
export const apiGetReferrals = () =>
  endpointRoute.get("/user/referrals").then((r) => r.data);
export const apiTransferReferral = (amount: string) =>
  endpointRoute.post("/user/transfer-referral", { amount }).then((r) => r.data);
// apiGetBalance() → GET /user/balance → returns { success, balance }
// apiFundUser(id, amount) → PUT /admin/fund-user/:id body { amount }
// apiApproveWithdrawal(id) → now correctly hits PUT /withdrawals/approve/:id
// apiRequestWithdrawal and apiCreateDeposit now send coinType: "bitcoin" | "litecoin" (matching what the API expects)

export const apiDeductUser = (id: string, amount: number, coinType:'bitcoin'|'litecoin') =>
  endpointRoute.put(`/admin/deduct/${id}`, { amount, coinType}).then((r) => r.data);


// Email: send to ALL users
export const apiEmailAll = (subject: string, message: string) =>
  endpointRoute.post("/email/send/all", { subject, message }).then((r) => r.data);

// Email: send to SELECTED users
export const apiEmailSelected = (userIds: string[], subject: string, message: string) =>
  endpointRoute.post("/email/send/selected", { userIds, subject, message }).then((r) => r.data);

// editusers info

export const apiEditUser = (id: string, name: string, email: string,bitcoinAddress:string, litecoinAddress:string, password?: string) =>
  endpointRoute.put(`/admin/users/${id}`, { name, email, bitcoinAddress, litecoinAddress, password }).then((r) => r.data);
