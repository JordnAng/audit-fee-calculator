// RPG 7 (Revised) Audit Fee Computation

interface Tier {
  cumulative: number;
  incremental: number;
  rate: number;
}

const REVENUE_ASSET_TIERS: Tier[] = [
  { cumulative: 100000, incremental: 100000, rate: 0.01 },
  { cumulative: 250000, incremental: 150000, rate: 0.00438 },
  { cumulative: 500000, incremental: 250000, rate: 0.00313 },
  { cumulative: 1000000, incremental: 500000, rate: 0.00188 },
  { cumulative: 2500000, incremental: 1500000, rate: 0.00125 },
  { cumulative: 5000000, incremental: 2500000, rate: 0.001 },
  { cumulative: 10000000, incremental: 5000000, rate: 0.00094 },
];

const OPEX_TIERS: Tier[] = [
  { cumulative: 50000, incremental: 50000, rate: 0.025 },
  { cumulative: 200000, incremental: 150000, rate: 0.0125 },
  { cumulative: 1000000, incremental: 800000, rate: 0.00625 },
  { cumulative: 2000000, incremental: 1000000, rate: 0.0025 },
];
const OPEX_EXCESS_RATE = 0.00125;

export interface TierBreakdown {
  from: number;
  to: number;
  amount: number;
  rate: number;
  fee: number;
}

export interface FeeResult {
  fee: number;
  breakdown: TierBreakdown[];
  negotiable: boolean;
}

export function computeRevenueOrAssetFee(value: number): FeeResult {
  if (value <= 0) return { fee: 0, breakdown: [], negotiable: false };
  if (value > 20000000) return { fee: 20000, breakdown: [], negotiable: true };

  const breakdown: TierBreakdown[] = [];
  let totalFee = 0;

  // If below first tier, min RM800
  if (value < REVENUE_ASSET_TIERS[0].cumulative) {
    const fee = Math.max(800, value * REVENUE_ASSET_TIERS[0].rate);
    breakdown.push({ from: 0, to: value, amount: value, rate: REVENUE_ASSET_TIERS[0].rate, fee });
    return { fee, breakdown, negotiable: false };
  }

  let prev = 0;
  for (const tier of REVENUE_ASSET_TIERS) {
    if (value <= prev) break;
    const applicable = Math.min(value - prev, tier.incremental);
    const fee = applicable * tier.rate;
    breakdown.push({ from: prev, to: prev + applicable, amount: applicable, rate: tier.rate, fee });
    totalFee += fee;
    prev = tier.cumulative;
  }

  // Beyond 10M but <= 20M: special rounding formula
  if (value > 10000000) {
    const excess = value - 10000000;
    const fee = Math.min(10000, Math.ceil((excess / 1000000) * 1000 / 1000) * 1000);
    breakdown.push({ from: 10000000, to: value, amount: excess, rate: 0, fee });
    totalFee += fee;
  }

  return { fee: totalFee, breakdown, negotiable: false };
}

export function computeOpexFee(value: number): FeeResult {
  if (value <= 0) return { fee: 0, breakdown: [], negotiable: false };

  const breakdown: TierBreakdown[] = [];
  let totalFee = 0;
  let prev = 0;

  for (const tier of OPEX_TIERS) {
    if (value <= prev) break;
    const applicable = Math.min(value - prev, tier.incremental);
    const fee = applicable * tier.rate;
    breakdown.push({ from: prev, to: prev + applicable, amount: applicable, rate: tier.rate, fee });
    totalFee += fee;
    prev = tier.cumulative;
  }

  if (value > 2000000) {
    const excess = value - 2000000;
    const fee = excess * OPEX_EXCESS_RATE;
    breakdown.push({ from: 2000000, to: value, amount: excess, rate: OPEX_EXCESS_RATE, fee });
    totalFee += fee;
  }

  return { fee: totalFee, breakdown, negotiable: false };
}

export function formatRM(value: number): string {
  return `RM ${value.toLocaleString('en-MY', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}
