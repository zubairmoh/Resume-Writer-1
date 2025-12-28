import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminDocuments } from "@/components/AdminDocuments";
import { AdminSettings } from "@/components/AdminSettings";
import { Settings, Users, Briefcase } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

export function AdminPage() {
  const { user, logout, orders, writers, assignWriter, releaseEscrow } = useApp();
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user || user.role !== "admin") {
    return null;
  }

  const order = selectedOrder ? orders.find(o => o.id === selectedOrder) : null;

  const handleAssignWriter = (writerId: string) => {
    if (selectedOrder) {
      assignWriter(selectedOrder, writerId);
      toast({
        title: "Writer Assigned",
        description: "The order has been assigned successfully.",
      });
    }
  };

  const handleReleaseEscrow = (orderId: string) => {
    if (confirm("Are you sure you want to release funds to the writer? This cannot be undone.")) {
      releaseEscrow(orderId);
      toast({
        title: "Funds Released",
        description: "Payment has been released from escrow.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage client orders and assignments.</p>
        </div>
        <Button variant="outline" onClick={() => { logout(); navigate("/"); }}>Logout</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Writers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{writers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${orders.reduce((acc, curr) => acc + curr.total, 0)}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="orders">
        <TabsList className="mb-6">
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" /> Orders
          </TabsTrigger>
          <TabsTrigger value="writers" className="flex items-center gap-2">
            <Users className="w-4 h-4" /> Writers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>All Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Escrow</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => {
                    const assignedWriter = writers.find(w => w.id === order.assignedWriterId);
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>
                          <Badge variant={order.status === "Completed" ? "default" : "secondary"}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {assignedWriter ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                {assignedWriter.name[0]}
                              </div>
                              <span className="text-sm">{assignedWriter.name}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm italic">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={order.escrowStatus === "released" ? "outline" : "secondary"} className={order.escrowStatus === "held" ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" : "bg-green-100 text-green-800"}>
                            {order.escrowStatus === "held" ? "Held" : "Released"}
                          </Badge>
                        </TableCell>
                        <TableCell>${order.total}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" onClick={() => setSelectedOrder(order.id)}>Manage</Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="writers">
          <Card>
            <CardHeader>
              <CardTitle>Writer Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Specialties</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Active Orders</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {writers.map((writer) => (
                    <TableRow key={writer.id}>
                      <TableCell className="font-medium">{writer.name}</TableCell>
                      <TableCell>{writer.email}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {writer.specialties.map(s => (
                            <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{writer.rating} / 5.0</TableCell>
                      <TableCell>{writer.activeOrders}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline">Edit</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Order Detail Modal */}
      <Dialog open={!!selectedOrder && selectedOrder !== "settings"} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {order && (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">Info & Assignment</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="messages">Messages</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-6 mt-6">
                <div className="grid grid-cols-2 gap-4 text-sm border-b pb-6">
                  <div>
                    <p className="text-muted-foreground">Order ID</p>
                    <p className="font-medium">{order.id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Date</p>
                    <p className="font-medium">{order.date}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Package</p>
                    <p className="font-medium">{order.tier}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total</p>
                    <p className="font-medium">${order.total}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-sm">Writer Assignment</h4>
                  <div className="flex items-end gap-4">
                    <div className="flex-1 space-y-2">
                      <label className="text-sm font-medium">Assign To</label>
                      <Select 
                        defaultValue={order.assignedWriterId} 
                        onValueChange={handleAssignWriter}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a writer" />
                        </SelectTrigger>
                        <SelectContent>
                          {writers.map(w => (
                            <SelectItem key={w.id} value={w.id}>{w.name} ({w.activeOrders} active)</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {order.assignedWriterId && (
                      <div className="flex-1 space-y-2">
                        <label className="text-sm font-medium">Escrow Status</label>
                        <div className="flex items-center gap-2">
                          <Badge variant={order.escrowStatus === "released" ? "outline" : "secondary"} className={order.escrowStatus === "held" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}>
                            {order.escrowStatus === "held" ? "Funds Held" : "Funds Released"}
                          </Badge>
                          {order.escrowStatus === "held" && (
                            <Button size="sm" variant="outline" onClick={() => handleReleaseEscrow(order.id)}>
                              Release Payment
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="documents" className="mt-6">
                <AdminDocuments orderId={order.id} />
              </TabsContent>

              <TabsContent value="messages" className="space-y-4 mt-6">
                <div className="bg-secondary p-4 rounded-lg text-sm space-y-2 max-h-[300px] overflow-y-auto">
                  <p><strong>Client:</strong> Hi, when will my resume be ready?</p>
                  <p><strong>Writer:</strong> Almost done! Should have it by end of day tomorrow.</p>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Settings Button */}
      <Button 
        onClick={() => setSelectedOrder("settings")} 
        variant="outline" 
        size="lg"
        className="fixed bottom-8 right-8 gap-2 shadow-lg bg-background"
        data-testid="button-admin-settings"
      >
        <Settings className="w-5 h-5" />
        Admin Settings
      </Button>

      {/* Admin Settings Modal */}
      <Dialog open={selectedOrder === "settings"} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Admin Settings</DialogTitle>
          </DialogHeader>
          <AdminSettings />
        </DialogContent>
      </Dialog>
    </div>
  );
}
