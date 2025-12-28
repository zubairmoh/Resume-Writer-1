import { useState } from "react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { FileText, MessageSquare, CheckCircle, Clock, AlertCircle, DollarSign, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function WriterPage() {
  const { user, logout, orders, updateOrderStatus, releaseEscrow } = useApp();
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  // Filter orders for the current writer
  // In a real app, we'd filter by user.id, but for mock we'll assume logged in writer sees their assigned orders
  // or all orders if we don't have a specific ID in the mock user object easily mapable
  // For demo, let's just show all orders that have an assigned writer or are unassigned
  const myOrders = orders.filter(o => o.assignedWriterId || !o.assignedWriterId); 
  const activeOrder = myOrders.find(o => o.id === selectedOrder);

  if (!user || user.role !== "writer") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <Button onClick={() => navigate("/login")}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold font-display text-primary">ProResumes.ca <span className="text-muted-foreground font-normal ml-2">| Writer Portal</span></h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium">{user.email}</p>
            <p className="text-xs text-muted-foreground">Senior Writer</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => { logout(); navigate("/"); }}>
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </header>

      <main className="flex-1 p-6 grid grid-cols-1 md:grid-cols-12 gap-6 max-w-7xl mx-auto w-full">
        {/* Sidebar: Order List */}
        <div className="md:col-span-4 space-y-4">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">My Assignments</CardTitle>
              <CardDescription>Manage your active orders</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-[calc(100vh-250px)]">
                <div className="divide-y">
                  {myOrders.map((order) => (
                    <div 
                      key={order.id}
                      className={`p-4 cursor-pointer hover:bg-secondary/50 transition-colors ${selectedOrder === order.id ? 'bg-secondary' : ''}`}
                      onClick={() => setSelectedOrder(order.id)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-sm">{order.id}</span>
                        <Badge variant={order.status === "Completed" ? "default" : "outline"} className="text-xs">
                          {order.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-xs font-medium">{order.tier} Package</p>
                          <p className="text-xs text-muted-foreground">{order.date}</p>
                        </div>
                        {order.escrowStatus === "held" && (
                          <Badge variant="secondary" className="text-[10px] bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                            Escrow Held
                          </Badge>
                        )}
                        {order.escrowStatus === "released" && (
                          <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-800 hover:bg-green-100">
                            Paid
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Main Content: Order Details */}
        <div className="md:col-span-8">
          {activeOrder ? (
            <div className="space-y-6">
              {/* Order Header */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle>Order #{activeOrder.id}</CardTitle>
                    <CardDescription>
                      {activeOrder.tier} Package • Due in {activeOrder.daysRemaining} days
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {activeOrder.status !== "Completed" && (
                      <Button onClick={() => updateOrderStatus(activeOrder.id, "Completed")}>
                        <CheckCircle className="w-4 h-4 mr-2" /> Mark Complete
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 p-4 bg-secondary/30 rounded-lg border">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground mb-1">Payment Status</p>
                      <div className="flex items-center gap-2">
                        <DollarSign className={`w-5 h-5 ${activeOrder.escrowStatus === "released" ? "text-green-500" : "text-yellow-500"}`} />
                        <span className="font-bold">
                          {activeOrder.escrowStatus === "released" ? "Funds Released" : "Funds in Escrow"}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground mb-1">Client Name</p>
                      <p className="font-semibold">John Doe</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground mb-1">Target Role</p>
                      <p className="font-semibold">Software Engineer</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="chat">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="chat">Client Chat</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="notes">Internal Notes</TabsTrigger>
                </TabsList>
                
                <TabsContent value="chat" className="mt-4">
                  <Card className="h-[400px] flex flex-col">
                    <CardContent className="flex-1 p-4 overflow-y-auto space-y-4">
                      <div className="flex justify-start">
                        <div className="bg-secondary rounded-lg rounded-tl-none p-3 max-w-[80%] text-sm">
                          Hi, I'm looking forward to working with you on my resume!
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <div className="bg-primary text-primary-foreground rounded-lg rounded-tr-none p-3 max-w-[80%] text-sm">
                          Great! I've reviewed your current resume. Could you clarify your gap in 2022?
                        </div>
                      </div>
                    </CardContent>
                    <div className="p-4 border-t flex gap-2">
                      <Input placeholder="Type a message..." />
                      <Button size="icon"><MessageSquare className="w-4 h-4" /></Button>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="documents" className="mt-4">
                  <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-2 opacity-20" />
                      <p>Client documents will appear here</p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground p-8 border-2 border-dashed rounded-xl">
              <div className="text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Select an order from the list to view details</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
