import { useState, useEffect, useRef } from "react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Send, User, Upload, Edit, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RevisionTimer } from "@/components/RevisionTimer";
import { OrderHistory } from "@/components/OrderHistory";
import { NotificationBell } from "@/components/NotificationBell";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

export function DashboardPage() {
  const { user, logout, orders, messages, addMessage } = useApp();
  const navigate = useNavigate();
  const [messageInput, setMessageInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState({ name: "John Doe", email: "" });

  const currentOrder = orders[0];
  const orderMessages = messages.filter(m => m.orderId === currentOrder?.id).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      setProfileData(prev => ({ ...prev, email: user.email }));
    }
  }, [user, navigate]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [orderMessages]);

  if (!user || !currentOrder) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    
    addMessage({
      orderId: currentOrder.id,
      senderId: "USR-001",
      senderName: "Client",
      role: "client",
      text: messageInput
    });
    setMessageInput("");
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Profile Updated",
      description: "Your changes have been saved successfully.",
    });
    setIsProfileOpen(false);
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card hidden md:flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-primary font-display">ProResumes.ca</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Button variant="secondary" className="w-full justify-start font-medium">
            <FileText className="mr-2 h-4 w-4" /> My Orders
          </Button>
          <Button variant="ghost" className="w-full justify-start font-medium" onClick={() => setIsProfileOpen(true)}>
            <User className="mr-2 h-4 w-4" /> Profile
          </Button>
        </nav>
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {user.email[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user.email}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={() => { logout(); navigate("/"); }}>
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 border-b flex items-center justify-between px-6 bg-card/50 backdrop-blur sticky top-0 z-10">
          <h1 className="text-lg font-semibold">Client Dashboard</h1>
          <div className="flex items-center gap-4">
             <div className="md:hidden">
               <NotificationBell />
             </div>
             <div className="hidden md:block">
               <NotificationBell />
             </div>
             <Button variant="outline" size="sm" className="md:hidden" onClick={() => { logout(); navigate("/"); }}>Logout</Button>
          </div>
        </header>

        <div className="flex-1 p-6 max-w-5xl mx-auto w-full">
          <Tabs defaultValue="order" className="h-full flex flex-col">
            <TabsList className="w-full max-w-md grid grid-cols-3 mb-6 mx-auto md:mx-0">
              <TabsTrigger value="order">My Order</TabsTrigger>
              <TabsTrigger value="uploads">Uploads</TabsTrigger>
              <TabsTrigger value="chat">Chat with Writer</TabsTrigger>
            </TabsList>

            <TabsContent value="order" className="flex-1 space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                   <Card className="border-l-4 border-l-primary shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex justify-between items-center text-lg">
                        <span>Order #{currentOrder.id}</span>
                        <Badge variant={currentOrder.status === "Completed" ? "default" : "secondary"}>
                          {currentOrder.status}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs uppercase tracking-wide">Package</p>
                          <p className="font-medium mt-1">{currentOrder.tier}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs uppercase tracking-wide">Date</p>
                          <p className="font-medium mt-1">{currentOrder.date}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs uppercase tracking-wide">Total Paid</p>
                          <p className="font-medium mt-1">${currentOrder.total}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                           <span className="font-medium">Progress</span>
                           <span className="text-muted-foreground">33%</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
                          <div className="bg-primary h-full rounded-full w-[33%] transition-all duration-1000" />
                        </div>
                        <p className="text-xs text-muted-foreground text-right mt-1">Drafting in progress...</p>
                      </div>
                    </CardContent>
                  </Card>

                  <OrderHistory orders={orders} />
                </div>
                
                <div className="space-y-6">
                  <RevisionTimer daysRemaining={currentOrder.daysRemaining} orderId={currentOrder.id} />
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Your Writer</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          SJ
                        </div>
                        <div>
                          <p className="font-medium text-sm">Sarah Jenkins</p>
                          <p className="text-xs text-muted-foreground">Senior Resume Writer</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full" onClick={() => document.querySelector('[value="chat"]')?.dispatchEvent(new MouseEvent('click', {bubbles: true}))}>
                        <MessageSquare className="w-4 h-4 mr-2" /> Message
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="uploads" className="flex-1">
               <Card className="h-[400px] flex flex-col items-center justify-center border-dashed bg-secondary/20">
                 <div className="text-center space-y-4">
                   <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto shadow-sm border">
                     <Upload className="w-8 h-8 text-primary/80" />
                   </div>
                   <h3 className="text-lg font-medium">Upload Job Descriptions</h3>
                   <p className="text-muted-foreground max-w-xs mx-auto text-sm">
                     Upload job descriptions you are targeting so we can optimize your resume keywords.
                   </p>
                   <Button>Select Files</Button>
                 </div>
               </Card>
            </TabsContent>

            <TabsContent value="chat" className="flex-1 h-[600px] min-h-[500px]">
              <Card className="h-full flex flex-col border-none shadow-md">
                <CardHeader className="border-b py-3 bg-card">
                  <CardTitle className="text-base flex items-center gap-2">
                    <div className="relative">
                      <div className="w-2 h-2 rounded-full bg-green-500 absolute -right-0.5 -bottom-0.5 border border-white" />
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">SJ</div>
                    </div>
                    <div>
                      <span className="block text-sm">Sarah Jenkins</span>
                      <span className="block text-[10px] text-muted-foreground font-normal">Online now</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-0 flex flex-col h-full bg-slate-50 dark:bg-slate-900/50">
                  <ScrollArea className="flex-1 p-4" viewportRef={scrollRef}>
                    <div className="space-y-4 pb-4">
                      {orderMessages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === "client" ? "justify-end" : "justify-start"}`}>
                          <div className={`flex flex-col ${msg.role === "client" ? "items-end" : "items-start"} max-w-[80%]`}>
                            <div className={`px-4 py-2 text-sm shadow-sm ${
                              msg.role === "client" 
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
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="p-4 border-t bg-card">
                    <form onSubmit={handleSend} className="flex gap-2">
                      <Input 
                        placeholder="Type a message..." 
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        className="flex-1"
                      />
                      <Button type="submit" size="icon" disabled={!messageInput.trim()}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Profile Modal */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateProfile} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={profileData.name} onChange={(e) => setProfileData(p => ({...p, name: e.target.value}))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={profileData.email} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">Email cannot be changed directly.</p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsProfileOpen(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
