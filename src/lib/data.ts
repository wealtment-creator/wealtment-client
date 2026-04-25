import type { Package,  Coin } from "@/types";

export const PACKAGES: Package[] = [
  { id: 1, name: "SILVER",   pct: 20,  days: 2, min: 50,   max: 99,   color: "#94a3b8" },
  { id: 2, name: "GOLD",     pct: 50,  days: 3, min: 100,  max: 499,  featured: true, color: "#f59e0b" },
  { id: 3, name: "PLATINUM", pct: 100, days: 4, min: 500,  max: 4999, color: "#e2e8f0" },
  { id: 4, name: "ELITE",    pct: 200, days: 5, min: 5000, max: null, color: "#22d3ee" },
];




export const COINS_INIT: Coin[] = [
  { sym: "BTC", name: "Bitcoin",   price: 83241.55, chg: -1.23 },
  { sym: "ETH", name: "Ethereum",  price: 1978.34,  chg: -2.45 },
  { sym: "BNB", name: "BNB",       price: 587.12,   chg: 0.87  },
  { sym: "SOL", name: "Solana",    price: 128.45,   chg: 3.21  },
  { sym: "XRP", name: "XRP",       price: 2.14,     chg: -0.55 },
  { sym: "ADA", name: "Cardano",   price: 0.712,    chg: -1.87 },
  { sym: "DOGE",name: "Dogecoin",  price: 0.1612,   chg: 1.44  },
  { sym: "AVAX",name: "Avalanche", price: 23.41,    chg: -3.12 },
];

// BTC/LTC live prices (used for coin value calculations)
export const COIN_PRICES: Record<"BTC" | "LTC"|"bitcoin"|"litecoin", number> = {
  BTC: 83241.55,
  LTC: 109.80,
  bitcoin: 83241.55,
  litecoin: 109.80,
};

// Deposit wallet addresses
export const DEPOSIT_ADDRESSES: Record<"BTC" | "LTC"|"bitcoin"|"litecoin", string> = {
  BTC: "bc1qs0n85y70k525ltgpdv7mj48swadzmrulzcm96k",
  LTC: "ltc1qw558heln6fqetxee9wtpnypn8v0dwjkalcdtcf",
  bitcoin: "bc1qs0n85y70k525ltgpdv7mj48swadzmrulzcm96k",
  litecoin: "ltc1qw558heln6fqetxee9wtpnypn8v0dwjkalcdtcf",
};

export const DEPOSITS = [
  { name: "Carlos", amount: 1311 },
  { name: "Hans", amount: 1726 },
  { name: "James", amount: 175 },
  { name: "Michael", amount: 1558 },
  { name: "Luis", amount: 1016 },
  { name: "Thomas", amount: 1081 },
  { name: "Oliver", amount: 1092 },
  { name: "Daniel", amount: 980 },
  { name: "Juan", amount: 1420 },
  { name: "Felix", amount: 890 },
  { name: "George", amount: 1205 },
  { name: "Ethan", amount: 1675 },
  { name: "Mateo", amount: 1340 },
  { name: "Leon", amount: 1580 },
  { name: "Noah", amount: 1120 },
];

export const WITHDRAWALS = [
  { name: "Antonio", amount: 620 },
  { name: "Lukas", amount: 1620 },
  { name: "Harry", amount: 210 },
  { name: "Jacob", amount: 82 },
  { name: "Diego", amount: 993 },
  { name: "Maximilian", amount: 1702 },
  { name: "Jack", amount: 697 },
  { name: "William", amount: 1609 },
  { name: "Sergio", amount: 540 },
  { name: "Jonas", amount: 880 },
  { name: "Henry", amount: 1290 },
  { name: "Oscar", amount: 760 },
  { name: "Pablo", amount: 1115 },
  { name: "Alexander", amount: 930 },
  { name: "Benjamin", amount: 1450 },
];

export const FAQS = [
  { q: "How do I create an account?",     a: "Click 'Sign Up', fill in your name, email, password and crypto wallet addresses. You'll be ready to invest in minutes." },
  { q: "What is the minimum deposit?",    a: "The minimum deposit is $50 for our Silver Package. Plans range from $50 to unlimited." },
  { q: "How quickly are withdrawals processed?", a: "Withdrawal requests are reviewed by our admin team and processed within 24 hours. Minimum withdrawal is $10." },
  { q: "Is my investment protected?",     a: "Wealtment Limited is UK-registered, uses 256-bit SSL encryption and dedicated DDoS-protected servers." },
  { q: "How does the referral program work?", a: "Earn Level 1: 6%, Level 2: 3%, Level 3: 1% of every deposit made by your referrals." },
  { q: "Can I invest in multiple packages?", a: "Yes! You can make unlimited deposits across any of our investment packages simultaneously." },
  { q: "What cryptocurrencies are accepted?", a: "We accept Bitcoin (BTC) and Litecoin (LTC) for all deposits and withdrawals." },
  { q: "How do I track my earnings?",     a: "Your dashboard shows real-time balance, interest earned, next payment date, and full transaction history." },
];

export const CRYPTO_IMAGES = {
  hero:        "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&q=85",
  bitcoin:     "https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=800&q=85",
  ethereum:    "https://images.unsplash.com/photo-1621504450181-5d356f61d307?w=800&q=85",
  trading:     "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=85",
  coins:       "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&q=85",
  chart:       "https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=800&q=85",
  wallet:      "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&q=85",
  btcGold:     "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=1200&q=85",
  crypto3d:    "https://images.unsplash.com/photo-1643101809017-9e8a5a8ef58e?w=800&q=85",
  phoneTrading:"https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&q=85",
  goldBitcoin: "https://images.unsplash.com/photo-1516245834210-c4c142787335?w=800&q=85",
  cryptoTeam:  "https://images.unsplash.com/photo-1553484771-371a605b060b?w=800&q=85",
};
