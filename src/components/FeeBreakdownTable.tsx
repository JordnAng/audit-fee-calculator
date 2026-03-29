import { TierBreakdown, formatRM } from "@/lib/auditFeeCalculator";

interface Props {
  title: string;
  breakdown: TierBreakdown[];
  totalFee: number;
  negotiable: boolean;
}

export default function FeeBreakdownTable({ title, breakdown, totalFee, negotiable }: Props) {
  if (breakdown.length === 0 && !negotiable) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">{title}</h3>
      {negotiable ? (
        <p className="text-sm text-muted-foreground italic">
          Negotiable (but should not be less than RM 20,000 per assignment)
        </p>
      ) : (
        <>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-2 font-medium">Range</th>
                <th className="pb-2 font-medium text-right">Amount</th>
                <th className="pb-2 font-medium text-right">Rate</th>
                <th className="pb-2 font-medium text-right">Fee</th>
              </tr>
            </thead>
            <tbody>
              {breakdown.map((row, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-2 text-foreground">
                    {formatRM(row.from)} – {formatRM(row.to)}
                  </td>
                  <td className="py-2 text-right text-foreground">{formatRM(row.amount)}</td>
                  <td className="py-2 text-right text-muted-foreground">
                    {row.rate > 0 ? `${(row.rate * 100).toFixed(3)}%` : "Special"}
                  </td>
                  <td className="py-2 text-right font-medium text-foreground">{formatRM(row.fee)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="pt-3 font-semibold text-foreground">Computed Fee</td>
                <td className="pt-3 text-right font-bold text-primary text-base">{formatRM(totalFee)}</td>
              </tr>
            </tfoot>
          </table>
        </>
      )}
    </div>
  );
}
