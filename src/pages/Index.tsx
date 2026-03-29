import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import FeeBreakdownTable from "@/components/FeeBreakdownTable";
import {
  computeRevenueOrAssetFee,
  computeOpexFee,
  formatRM,
} from "@/lib/auditFeeCalculator";
import { Calculator } from "lucide-react";

export default function Index() {
  const [grossRevenue, setGrossRevenue] = useState("");
  const [totalAssets, setTotalAssets] = useState("");
  const [totalOpex, setTotalOpex] = useState("");

  const revenueFee = useMemo(
    () => computeRevenueOrAssetFee(Number(grossRevenue) || 0),
    [grossRevenue]
  );
  const assetFee = useMemo(
    () => computeRevenueOrAssetFee(Number(totalAssets) || 0),
    [totalAssets]
  );
  const opexFee = useMemo(
    () => computeOpexFee(Number(totalOpex) || 0),
    [totalOpex]
  );

  const fees = [revenueFee.fee, assetFee.fee, opexFee.fee].filter((f) => f > 0);
  const recommendedFee = fees.length > 0 ? Math.max(...fees) : 0;

  const parseInput = (val: string) => val.replace(/[^0-9.]/g, "");
  const formatWithCommas = (val: string) => {
    if (!val) return "";
    const [whole, decimal] = val.split(".");
    const formatted = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return decimal !== undefined ? `${formatted}.${decimal}` : formatted;
  };
  const handleChange = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = parseInput(e.target.value.replace(/,/g, ""));
    setter(raw);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-16">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Calculator className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Audit Fee Calculator</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-8">
          Based on Recommended Practice Guide 7 (Revised), applicable to all work commencing on or after 1 March 2010.
        </p>

        {/* Inputs */}
        <Card className="p-6 mb-6 space-y-5">
          <div>
            <Label htmlFor="revenue" className="text-sm font-medium text-foreground">
              Gross Revenue (RM)
            </Label>
            <p className="text-xs text-muted-foreground mb-1.5">
              Total sales including all other income and earnings
            </p>
            <Input
              id="revenue"
              type="text"
              inputMode="decimal"
              placeholder="e.g. 500,000"
              value={formatWithCommas(grossRevenue)}
              onChange={handleChange(setGrossRevenue)}
            />
          </div>
          <div>
            <Label htmlFor="assets" className="text-sm font-medium text-foreground">
              Total Assets (RM)
            </Label>
            <p className="text-xs text-muted-foreground mb-1.5">
              Total assets excluding intangible assets from the Balance Sheet
            </p>
            <Input
              id="assets"
              type="text"
              inputMode="decimal"
              placeholder="e.g. 1,000,000"
              value={formatWithCommas(totalAssets)}
              onChange={handleChange(setTotalAssets)}
            />
          </div>
          <div>
            <Label htmlFor="opex" className="text-sm font-medium text-foreground">
              Total Operating Expenses (RM)
            </Label>
            <p className="text-xs text-muted-foreground mb-1.5">
              All expenses charged against gross profit, excluding direct cost of sales
            </p>
            <Input
              id="opex"
              type="text"
              inputMode="decimal"
              placeholder="e.g. 200,000"
              value={formatWithCommas(totalOpex)}
              onChange={handleChange(setTotalOpex)}
            />
          </div>
        </Card>

        {/* Result */}
        {recommendedFee > 0 && (
          <Card className="p-6 mb-6 bg-result border-result-border">
            <p className="text-sm font-medium text-muted-foreground mb-1">Recommended Audit Fee</p>
            <p className="text-3xl font-bold text-primary">{formatRM(recommendedFee)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Highest of the three computed fees below
            </p>

            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className={`rounded-md p-3 ${revenueFee.fee === recommendedFee && revenueFee.fee > 0 ? "bg-primary/10 ring-1 ring-primary/30" : "bg-background"}`}>
                <p className="text-xs text-muted-foreground">Revenue</p>
                <p className="font-semibold text-foreground text-sm">{formatRM(revenueFee.fee)}</p>
              </div>
              <div className={`rounded-md p-3 ${assetFee.fee === recommendedFee && assetFee.fee > 0 ? "bg-primary/10 ring-1 ring-primary/30" : "bg-background"}`}>
                <p className="text-xs text-muted-foreground">Assets</p>
                <p className="font-semibold text-foreground text-sm">{formatRM(assetFee.fee)}</p>
              </div>
              <div className={`rounded-md p-3 ${opexFee.fee === recommendedFee && opexFee.fee > 0 ? "bg-primary/10 ring-1 ring-primary/30" : "bg-background"}`}>
                <p className="text-xs text-muted-foreground">OpEx</p>
                <p className="font-semibold text-foreground text-sm">{formatRM(opexFee.fee)}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Breakdowns */}
        <div className="space-y-4">
          <FeeBreakdownTable title="Gross Revenue" breakdown={revenueFee.breakdown} totalFee={revenueFee.fee} negotiable={revenueFee.negotiable} />
          <FeeBreakdownTable title="Total Assets" breakdown={assetFee.breakdown} totalFee={assetFee.fee} negotiable={assetFee.negotiable} />
          <FeeBreakdownTable title="Total Operating Expenses" breakdown={opexFee.breakdown} totalFee={opexFee.fee} negotiable={opexFee.negotiable} />
        </div>
      </div>
    </div>
  );
}
