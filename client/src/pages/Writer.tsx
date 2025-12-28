import { useState, useRef, useEffect } from "react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { FileText, MessageSquare, CheckCircle, DollarSign, LogOut, Send, User, Upload, History, TrendingUp, Star, Clock, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

export function WriterPage() {
  const { user, logout, orders, updateOrderStatus, releaseEscrow, messages, addMessage } = useApp();
  const navigate = useNavigate();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [notes, setNotes] = useState("");

  const myOrders = orders.filter(o => o.assignedWriterId || !o.assignedWriterId); 
  const activeOrder = myOrders.find(o => o.id === selectedOrderId);

  // Filter messages for the selected order
  const orderMessages = messages.filter(m => m.orderId === selectedOrderId).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [orderMessages, selectedOrderId]);

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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedOrderId) return;

    addMessage({
      orderId: selectedOrderId,
      senderId: "WR-001", // Mock ID for logged in writer
      senderName: "Sarah Jenkins", // Mock Name
      role: "writer",
      text: chatInput
    });
    setChatInput("");
  };

  const handleSaveNotes = () => {
    toast({
      title: "Notes Saved",
      description: "Internal notes updated successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
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
        {/* Sidebar: Order List & Stats */}
        <div className="md:col-span-4 space-y-6">
           {/* Writer Stats Card - NEW FEATURE */}
           <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
             <CardHeader className="pb-2">
               <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                 <Award className="w-4 h-4 text-primary" /> Performance
               </CardTitle>
             </CardHeader>
             <CardContent>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <div className="text-2xl font-bold text-foreground">4.9</div>
                   <div className="text-xs text-muted-foreground flex items-center gap-1">
                     <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" /> Avg Rating
                   </div>
                 </div>
                 <div>
                   <div className="text-2xl font-bold text-foreground">$1,240</div>
                   <div className="text-xs text-muted-foreground flex items-center gap-1">
                     <DollarSign className="w-3 h-3" /> This Month
                   </div>
                 </div>
                 <div>
                   <div className="text-2xl font-bold text-foreground">98%</div>
                   <div className="text-xs text-muted-foreground flex items-center gap-1">
                     <Clock className="w-3 h-3" /> On-Time
                   </div>
                 </div>
                 <div>
                   <div className="text-2xl font-bold text-foreground">12</div>
                   <div className="text-xs text-muted-foreground flex items-center gap-1">
                     <CheckCircle className="w-3 h-3" /> Completed
                   </div>
                 </div>
               </div>
             </CardContent>
           </Card>

          <Card className="h-[calc(100vh-340px)] flex flex-col border-none shadow-md">
            <CardHeader className="pb-3 border-b bg-card rounded-t-lg">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                My Assignments
              </CardTitle>
              <CardDescription>Manage your active orders</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-0 bg-background/50">
              <ScrollArea className="h-full">
                <div className="divide-y">
                  {myOrders.length === 0 ? (
                     <div className="p-8 text-center text-muted-foreground">
                       <p>No orders assigned yet.</p>
                     </div>
                  ) : (
                    myOrders.map((order) => (
                      <div 
                        key={order.id}
                        className={`p-4 cursor-pointer hover:bg-secondary/80 transition-all border-l-4 ${
                          selectedOrderId === order.id 
                            ? 'bg-secondary border-primary shadow-inner' 
                            : 'border-transparent bg-card'
                        }`}
                        onClick={() => setSelectedOrderId(order.id)}
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
                            <Badge variant="secondary" className="text-[10px] bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200">
                              Escrow Held
                            </Badge>
                          )}
                          {order.escrowStatus === "released" && (
                            <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-800 hover:bg-green-200 border-green-200">
                              Paid
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Main Content: Order Details */}
        <div className="md:col-span-8 h-[calc(100vh-140px)]">
          {activeOrder ? (
            <div className="h-full flex flex-col gap-4">
              {/* Order Header */}
              <Card className="shrink-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between py-4">
                  <div>
                    <CardTitle className="text-xl">Order #{activeOrder.id}</CardTitle>
                    <CardDescription>
                      {activeOrder.tier} Package • Due in {activeOrder.daysRemaining} days
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {activeOrder.status !== "Completed" && (
                      <Button onClick={() => updateOrderStatus(activeOrder.id, "Completed")} className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="w-4 h-4 mr-2" /> Mark Complete
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="py-2 pb-4">
                  <div className="flex gap-4 p-3 bg-secondary/30 rounded-lg border border-border/50">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Payment Status</p>
                      <div className="flex items-center gap-2">
                        <DollarSign className={`w-4 h-4 ${activeOrder.escrowStatus === "released" ? "text-green-500" : "text-yellow-500"}`} />
                        <span className={`font-bold text-sm ${activeOrder.escrowStatus === "released" ? "text-green-700" : "text-yellow-700"}`}>
                          {activeOrder.escrowStatus === "released" ? "Funds Released" : "Funds in Escrow"}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Client Name</p>
                      <p className="font-semibold text-sm">John Doe</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Target Role</p>
                      <p className="font-semibold text-sm">Software Engineer</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="chat" className="flex-1 flex flex-col min-h-0">
                <TabsList className="w-full justify-start bg-card border shadow-sm p-1">
                  <TabsTrigger value="chat" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Client Chat</TabsTrigger>
                  <TabsTrigger value="documents" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Documents</TabsTrigger>
                  <TabsTrigger value="notes" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Internal Notes</TabsTrigger>
                </TabsList>
                
                <TabsContent value="chat" className="flex-1 mt-2 min-h-0">
                  <Card className="h-full flex flex-col border-none shadow-md">
                    <CardContent className="flex-1 p-0 flex flex-col h-full bg-slate-50 dark:bg-slate-900/50">
                      <div className="flex-1 p-4 overflow-y-auto space-y-4" ref={scrollRef}>
                        {orderMessages.length === 0 ? (
                           <div className="text-center text-muted-foreground mt-10">
                             <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-20" />
                             <p>No messages yet. Start the conversation!</p>
                           </div>
                        ) : (
                          orderMessages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === "writer" ? "justify-end" : "justify-start"}`}>
                              <div className={`flex flex-col ${msg.role === "writer" ? "items-end" : "items-start"} max-w-[80%]`}>
                                <div className={`px-4 py-2 text-sm shadow-sm ${
                                  msg.role === "writer" 
                                    ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm" 
                                    : "bg-white dark:bg-card border text-foreground rounded-2xl rounded-tl-sm"
                                }`}>
                                  {msg.text}
                                </div>
                                <span className="text-[10px] text-muted-foreground mt-1 px-1">
                                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="p-4 bg-card border-t">
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                          <Input 
                            placeholder="Type a message to the client..." 
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            className="flex-1"
                          />
                          <Button type="submit" size="icon" disabled={!chatInput.trim()}>
                            <Send className="w-4 h-4" />
                          </Button>
                        </form>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="documents" className="flex-1 mt-2">
                  <Card className="h-full shadow-md border-none">
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium">Uploaded Documents</h3>
                          <Button size="sm">
                            <Upload className="w-4 h-4 mr-2" /> Upload New Version
                          </Button>
                        </div>
                        
                        {/* Revisions / Versions List */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Version History</h4>
                          <div className="flex items-center justify-between p-3 border rounded-lg bg-card">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">Resume_Draft_v1.pdf</p>
                                <p className="text-xs text-muted-foreground">Uploaded 2 hours ago</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">Draft</Badge>
                              <Button variant="ghost" size="icon"><History className="w-4 h-4" /></Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="notes" className="flex-1 mt-2">
                  <Card className="h-full shadow-md border-none flex flex-col">
                    <CardContent className="p-6 flex-1 flex flex-col gap-4">
                       <div className="space-y-2 flex-1 flex flex-col">
                         <h3 className="font-medium flex items-center gap-2">
                           <User className="w-4 h-4" /> Private Notes
                         </h3>
                         <p className="text-sm text-muted-foreground">Keep track of key details, strategy, or questions for this order. Not visible to client.</p>
                         <Textarea 
                           className="flex-1 resize-none bg-yellow-50/50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900/30" 
                           placeholder="Enter your notes here..."
                           value={notes}
                           onChange={(e) => setNotes(e.target.value)}
                         />
                       </div>
                       <div className="flex justify-end">
                         <Button onClick={handleSaveNotes}>Save Notes</Button>
                       </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground p-8 border-2 border-dashed rounded-xl bg-card/50">
              <div className="text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-20 text-primary" />
                <h3 className="text-xl font-medium text-foreground mb-2">Select an Order</h3>
                <p>Choose an assignment from the sidebar to view details and start working.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
