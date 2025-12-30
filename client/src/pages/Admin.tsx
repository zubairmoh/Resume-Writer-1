import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useLeads, useUpdateLead, useOrders, useUpdateOrder, useWriters, useCreateUser } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminDocuments } from "@/components/AdminDocuments";
import { AdminSettings } from "@/components/AdminSettings";
import { AdminLiveChat } from "@/components/AdminLiveChat";
import { Settings, Users, Briefcase, Plus, Trash2, Edit2, MessageSquare, DollarSign, PieChart, TrendingUp, AlertCircle, FileText, MessageCircle, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";

// AdminPage Component
export function AdminPage() {
  const { user: authUser, logout, isLoading: authLoading } = useAuth();
  const { data: leads = [], isLoading: leadsLoading } = useLeads();
  const { data: orders = [], isLoading: ordersLoading } = useOrders();
  const { data: writers = [], isLoading: writersLoading } = useWriters();
  const updateLead = useUpdateLead();
  const updateOrder = useUpdateOrder();
  const createUser = useCreateUser();
  
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  
  // Writer Management State
  const [editingWriter, setEditingWriter] = useState<string | null>(null);
  const [isWriterModalOpen, setIsWriterModalOpen] = useState(false);
  const [writerForm, setWriterForm] = useState({ name: "", email: "", password: "" });
  
  const order = selectedOrder && selectedOrder !== "settings" ? orders.find((o: any) => o.id === selectedOrder) : null;

  // Financial Calculations
  const totalEscrowHeld = orders.filter((o: any) => o.paymentStatus === "held").reduce((acc: number, curr: any) => acc + (curr.price || 0), 0);
  const totalReleased = orders.filter((o: any) => o.paymentStatus === "released").reduce((acc: number, curr: any) => acc + (curr.price || 0), 0);
  const totalRefunded = orders.filter((o: any) => o.paymentStatus === "refunded").reduce((acc: number, curr: any) => acc + (curr.price || 0), 0);
  
  const isLoading = authLoading || leadsLoading || ordersLoading || writersLoading;

  useEffect(() => {
    if (!authLoading && (!authUser || authUser.role !== "admin")) {
      navigate("/login");
    }
  }, [authUser, authLoading, navigate]);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  if (!authUser || authUser.role !== "admin") {
    return null;
  }
  
  const user = authUser;

  const handleAssignWriter = async (orderId: string, writerId: string) => {
    try {
      await updateOrder.mutateAsync({ id: orderId, data: { writerId } });
      toast({
        title: "Writer Assigned",
        description: "The order has been assigned successfully.",
      });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleReleaseEscrow = async (orderId: string) => {
    if (confirm("Are you sure you want to release funds to the writer? This cannot be undone.")) {
      try {
        await updateOrder.mutateAsync({ id: orderId, data: { paymentStatus: "released" } });
        toast({
          title: "Funds Released",
          description: "Payment has been released from escrow.",
        });
      } catch (error: any) {
        toast({ variant: "destructive", title: "Error", description: error.message });
      }
    }
  };

  const handleUpdateLeadStatus = async (leadId: string, status: string) => {
    try {
      await updateLead.mutateAsync({ id: leadId, data: { status } });
      toast({ title: "Lead Updated", description: `Status changed to ${status}` });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleAssignLeadToWriter = async (leadId: string, writerId: string) => {
    try {
      await updateLead.mutateAsync({ id: leadId, data: { assignedWriterId: writerId } });
      toast({ title: "Writer Assigned to Lead" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  // Writer Management Handlers
  const handleOpenWriterModal = () => {
    setEditingWriter(null);
    setWriterForm({ name: "", email: "", password: "" });
    setIsWriterModalOpen(true);
  };

  const handleSaveWriter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!writerForm.name || !writerForm.email || !writerForm.password) {
      toast({ variant: "destructive", title: "Please fill all fields" });
      return;
    }
    
    try {
      const username = writerForm.email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
      await createUser.mutateAsync({
        username,
        email: writerForm.email,
        password: writerForm.password,
        fullName: writerForm.name,
        role: "writer",
      });
      toast({ title: "Writer Added", description: "New writer added to the team." });
      setIsWriterModalOpen(false);
      setWriterForm({ name: "", email: "", password: "" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display text-primary">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage client orders, writers, and leads.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setSelectedOrder("settings")}>
            <Settings className="w-4 h-4 mr-2" /> Settings
          </Button>
          <Button variant="outline" onClick={() => { logout(); navigate("/"); }}>Logout</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
            <CardTitle className="text-sm font-medium text-muted-foreground">New Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{leads.filter((l: any) => l.status === "new").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${orders.reduce((acc: number, curr: any) => acc + (curr.price || 0), 0)}</div>
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
          <TabsTrigger value="leads" className="flex items-center gap-2">
            <FileText className="w-4 h-4" /> Leads
          </TabsTrigger>
          <TabsTrigger value="live-chat" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" /> Live Visitors
          </TabsTrigger>
          <TabsTrigger value="financials" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" /> Financials & Escrow
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
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No orders yet</TableCell>
                    </TableRow>
                  ) : orders.map((order: any) => {
                    const assignedWriter = writers.find((w: any) => w.id === order.writerId);
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id.slice(0, 8)}...</TableCell>
                        <TableCell>
                          <Badge variant={order.status === "completed" ? "default" : "secondary"}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {assignedWriter ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                {assignedWriter.fullName?.[0] || "W"}
                              </div>
                              <span className="text-sm">{assignedWriter.fullName}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm italic">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={order.paymentStatus === "released" ? "outline" : "secondary"} className={order.paymentStatus === "held" ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" : "bg-green-100 text-green-800"}>
                            {order.paymentStatus === "held" ? "Held" : order.paymentStatus === "released" ? "Released" : order.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>${order.price || 0}</TableCell>
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
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Writer Management</CardTitle>
              <Button size="sm" onClick={() => handleOpenWriterModal()}>
                <Plus className="w-4 h-4 mr-2" /> Add Writer
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {writers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No writers found. Add a writer to get started.</TableCell>
                    </TableRow>
                  ) : writers.map((writer: any) => (
                    <TableRow key={writer.id}>
                      <TableCell className="font-medium">{writer.fullName}</TableCell>
                      <TableCell>{writer.username}</TableCell>
                      <TableCell>{writer.email}</TableCell>
                      <TableCell>{new Date(writer.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leads">
          <Card>
            <CardHeader>
              <CardTitle>Lead Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>ATS Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No leads yet. Leads will appear here when visitors submit their resumes for ATS scanning.</TableCell>
                    </TableRow>
                  ) : leads.map((lead: any) => {
                     const assignedWriter = writers.find((w: any) => w.id === lead.assignedWriterId);
                     return (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>{lead.email}</TableCell>
                      <TableCell><Badge variant="outline">{lead.source}</Badge></TableCell>
                      <TableCell>
                        {lead.atsScore ? (
                          <Badge variant={lead.atsScore > 75 ? "default" : lead.atsScore > 50 ? "secondary" : "destructive"}>
                            {lead.atsScore}/100
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Select 
                          defaultValue={lead.status} 
                          onValueChange={(val: any) => handleUpdateLeadStatus(lead.id, val)}
                        >
                          <SelectTrigger className="w-[130px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="followed_up">Followed Up</SelectItem>
                            <SelectItem value="converted">Converted</SelectItem>
                            <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                         <Select 
                          defaultValue={lead.assignedWriterId || "unassigned"} 
                          onValueChange={(val) => handleAssignLeadToWriter(lead.id, val === "unassigned" ? "" : val)}
                        >
                          <SelectTrigger className="w-[150px] h-8">
                            <SelectValue placeholder="Unassigned" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned">Unassigned</SelectItem>
                            {writers.map((w: any) => (
                              <SelectItem key={w.id} value={w.id}>{w.fullName}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                         <Button size="sm" variant="ghost" onClick={() => toast({ title: "Email Sent", description: `Follow-up email sent to ${lead.email}` })}>
                           <MessageSquare className="w-4 h-4" />
                         </Button>
                      </TableCell>
                    </TableRow>
                  )})}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="live-chat">
           <AdminLiveChat />
        </TabsContent>

        <TabsContent value="financials">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Funds in Escrow
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">${totalEscrowHeld}</div>
                <p className="text-xs text-yellow-700/80 mt-1">Held until order completion</p>
              </CardContent>
            </Card>
            <Card className="bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-800 dark:text-green-200 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Released Earnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-900 dark:text-green-100">${totalReleased}</div>
                <p className="text-xs text-green-700/80 mt-1">Paid out to writers</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <PieChart className="w-4 h-4" /> Platform Fees
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${(totalReleased * 0.2).toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">Est. 20% platform commission</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Escrow Ledger</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Writer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => {
                    const assignedWriter = writers.find(w => w.id === order.assignedWriterId);
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>${order.total}</TableCell>
                        <TableCell>{assignedWriter?.name || "Unassigned"}</TableCell>
                        <TableCell>
                          <Badge variant={order.escrowStatus === "released" ? "outline" : "secondary"} className={order.escrowStatus === "held" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}>
                            {order.escrowStatus === "held" ? "Held in Escrow" : "Released"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {order.escrowStatus === "held" && (
                            <Button size="sm" variant="outline" onClick={() => handleReleaseEscrow(order.id)}>
                              Release Payment
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
                        defaultValue={order.writerId || ""} 
                        onValueChange={(val) => handleAssignWriter(order.id, val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a writer" />
                        </SelectTrigger>
                        <SelectContent>
                          {writers.map((w: any) => (
                            <SelectItem key={w.id} value={w.id}>{w.fullName}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {order.writerId && (
                      <div className="flex-1 space-y-2">
                        <label className="text-sm font-medium">Payment Status</label>
                        <div className="flex items-center gap-2">
                          <Badge variant={order.paymentStatus === "released" ? "outline" : "secondary"} className={order.paymentStatus === "held" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}>
                            {order.paymentStatus === "held" ? "Funds Held" : order.paymentStatus === "released" ? "Funds Released" : order.paymentStatus}
                          </Badge>
                          {order.paymentStatus === "held" && (
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
                <ScrollArea className="h-[300px] border rounded-lg p-4 bg-secondary/20">
                   {orderMessages.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        <p>No messages exchanged yet.</p>
                      </div>
                   ) : (
                     <div className="space-y-4">
                       {orderMessages.map((msg) => (
                         <div key={msg.id} className="flex flex-col gap-1">
                           <div className="flex justify-between text-xs text-muted-foreground px-1">
                             <span className="font-medium">{msg.role === "writer" ? "Writer" : msg.role === "admin" ? "Admin" : "Client"}</span>
                             <span>{new Date(msg.timestamp).toLocaleString()}</span>
                           </div>
                           <div className={`p-3 rounded-lg text-sm ${msg.role === "writer" ? "bg-white border" : msg.role === "admin" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                             {msg.text}
                           </div>
                         </div>
                       ))}
                     </div>
                   )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Admin Settings Modal */}
      <Dialog open={selectedOrder === "settings"} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Admin Settings</DialogTitle>
          </DialogHeader>
          <AdminSettings />
        </DialogContent>
      </Dialog>

      {/* Writer Add Modal */}
      <Dialog open={isWriterModalOpen} onOpenChange={setIsWriterModalOpen}>
        <DialogContent>
           <DialogHeader>
             <DialogTitle>Add New Writer</DialogTitle>
           </DialogHeader>
           <form onSubmit={handleSaveWriter} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="w-name">Full Name</Label>
                <Input id="w-name" value={writerForm.name} onChange={(e) => setWriterForm(p => ({...p, name: e.target.value}))} required data-testid="input-writer-name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="w-email">Email</Label>
                <Input id="w-email" type="email" value={writerForm.email} onChange={(e) => setWriterForm(p => ({...p, email: e.target.value}))} required data-testid="input-writer-email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="w-password">Password</Label>
                <Input id="w-password" type="password" value={writerForm.password} onChange={(e) => setWriterForm(p => ({...p, password: e.target.value}))} required data-testid="input-writer-password" />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsWriterModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createUser.isPending}>{createUser.isPending ? "Adding..." : "Add Writer"}</Button>
              </DialogFooter>
           </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
