import { Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface RevisionTimerProps {
  daysRemaining: number;
  orderId: string;
}

export function RevisionTimer({ daysRemaining, orderId }: RevisionTimerProps) {
  const isExpiringSoon = daysRemaining <= 5;
  const isExpired = daysRemaining <= 0;

  return (
    <Card className={isExpiringSoon && !isExpired ? "border-yellow-500" : ""}>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full border-4 flex items-center justify-center relative"
            style={{
              borderColor: isExpired ? "#ef4444" : isExpiringSoon ? "#eab308" : "#3b82f6",
            }}>
            <div className="text-center">
              <p className="text-2xl font-bold">{Math.max(0, daysRemaining)}</p>
              <p className="text-xs text-muted-foreground">days</p>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4" />
              <p className="font-semibold text-sm">Revision Window</p>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              {isExpired
                ? "Revision period has expired"
                : isExpiringSoon
                ? `${daysRemaining} days remaining to request changes`
                : `${daysRemaining} days to request revisions`}
            </p>
            <div className="w-full bg-secondary rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all ${
                  isExpired
                    ? "bg-red-500"
                    : isExpiringSoon
                    ? "bg-yellow-500"
                    : "bg-primary"
                }`}
                style={{ width: `${Math.max(0, (daysRemaining / 30) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
