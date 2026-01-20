import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface OrderHistoryProps {
  orders: any[];
}

export function OrderHistory({ orders }: OrderHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Order History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet</p>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-secondary/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-semibold text-sm">{order.id}</p>
                    <Badge
                      variant={
                        order.status === "Completed" ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {order.packageType} • ${order.price} • {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {order.status === "Completed" && (
                  <Button size="sm" variant="ghost" className="gap-2">
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
