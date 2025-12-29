import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminDocuments } from "@/components/AdminDocuments";
import { AdminSettings } from "@/components/AdminSettings";
import { Settings, Users, Briefcase, Plus, Trash2, Edit2, MessageSquare, DollarSign, PieChart, TrendingUp, AlertCircle, FileText } from "lucide-react";

// Mock Leads Data
const leads = [
  { id: 1, email: "alex.smith@example.com", date: "2024-12-29", score: 85, status: "New" },
  { id: 2, email: "sarah.jones@gmail.com", date: "2024-12-28", score: 45, status: "Followed Up" },
  { id: 3, email: "mike.chen@outlook.com", date: "2024-12-28", score: 92, status: "Converted" },
  { id: 4, email: "emily.wilson@yahoo.ca", date: "2024-12-27", score: 60, status: "New" },
  { id: 5, email: "david.lee@techcorp.com", date: "2024-12-27", score: 78, status: "Unsubscribed" },
];

export function AdminPage() {
  const { user, logout, orders, writers, assignWriter, releaseEscrow, messages, addWriter, updateWriter, deleteWriter } = useApp();
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  
  // Writer Management State
  const [editingWriter, setEditingWriter] = useState<string | null>(null); // ID or null
  const [isWriterModalOpen, setIsWriterModalOpen] = useState(false);
  const [writerForm, setWriterForm] = useState({ name: "", email: "", specialties: "", rating: "5.0" });
  
  const order = selectedOrder && selectedOrder !== "settings" ? orders.find(o => o.id === selectedOrder) : null;
  const orderMessages = order ? messages.filter(m => m.orderId === order.id).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) : [];

  // ... (rest of state)

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
            <div className="text-3xl font-bold text-blue-600">{leads.filter(l => l.status === "New").length}</div>
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
          <TabsTrigger value="leads" className="flex items-center gap-2">
            <FileText className="w-4 h-4" /> Leads
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
                    <TableHead>Email</TableHead>
                    <TableHead>Specialties</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Active Orders</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {writers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No writers found.</TableCell>
                    </TableRow>
                  ) : writers.map((writer) => (
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
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleOpenWriterModal(writer.id)}>
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDeleteWriter(writer.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
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
                    <TableHead>Email</TableHead>
                    <TableHead>Date Captured</TableHead>
                    <TableHead>ATS Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.email}</TableCell>
                      <TableCell>{lead.date}</TableCell>
                      <TableCell>
                        <Badge variant={lead.score > 75 ? "default" : lead.score > 50 ? "secondary" : "destructive"}>
                          {lead.score}/100
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{lead.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                         <Button size="sm" variant="ghost">Contact</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
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

      {/* Writer Add/Edit Modal */}
      <Dialog open={isWriterModalOpen} onOpenChange={setIsWriterModalOpen}>
        <DialogContent>
           <DialogHeader>
             <DialogTitle>{editingWriter ? "Edit Writer" : "Add New Writer"}</DialogTitle>
           </DialogHeader>
           <form onSubmit={handleSaveWriter} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="w-name">Full Name</Label>
                <Input id="w-name" value={writerForm.name} onChange={(e) => setWriterForm(p => ({...p, name: e.target.value}))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="w-email">Email</Label>
                <Input id="w-email" type="email" value={writerForm.email} onChange={(e) => setWriterForm(p => ({...p, email: e.target.value}))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="w-specialties">Specialties (comma separated)</Label>
                <Input id="w-specialties" placeholder="e.g. Tech, Finance, Medical" value={writerForm.specialties} onChange={(e) => setWriterForm(p => ({...p, specialties: e.target.value}))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="w-rating">Initial Rating</Label>
                <Input id="w-rating" type="number" step="0.1" min="0" max="5" value={writerForm.rating} onChange={(e) => setWriterForm(p => ({...p, rating: e.target.value}))} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsWriterModalOpen(false)}>Cancel</Button>
                <Button type="submit">Save Writer</Button>
              </DialogFooter>
           </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
