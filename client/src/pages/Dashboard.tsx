import { useState, useEffect } from "react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Send, User, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RevisionTimer } from "@/components/RevisionTimer";
import { OrderHistory } from "@/components/OrderHistory";

export function DashboardPage() {
  const { user, logout, orders } = useApp();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { sender: "system", text: "Welcome! Your writer has been assigned." },
    { sender: "writer", text: "Hi there! I'm reviewing your current resume now. Do you have a specific target job title?" }
  ]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setChatHistory([...chatHistory, { sender: "user", text: message }]);
    setMessage("");
    // Mock reply
    setTimeout(() => {
      setChatHistory(prev => [...prev, { sender: "writer", text: "Got it, thanks for the info!" }]);
    }, 1000);
  };

  const currentOrder = orders[0]; // Just showing first order for demo

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card hidden md:flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-primary font-display">ResumePro</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Button variant="secondary" className="w-full justify-start">
            <FileText className="mr-2 h-4 w-4" /> My Orders
          </Button>
          <Button variant="ghost" className="w-full justify-start">
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
        <header className="h-16 border-b flex items-center justify-between px-6 bg-card/50 backdrop-blur">
          <h1 className="text-lg font-semibold">Client Dashboard</h1>
          <Button variant="outline" size="sm" className="md:hidden" onClick={() => { logout(); navigate("/"); }}>Logout</Button>
        </header>

        <div className="flex-1 p-6">
          <Tabs defaultValue="order" className="h-full flex flex-col">
            <TabsList className="w-full max-w-md grid grid-cols-3 mb-6">
              <TabsTrigger value="order">My Order</TabsTrigger>
              <TabsTrigger value="uploads">Uploads</TabsTrigger>
              <TabsTrigger value="chat">Chat with Writer</TabsTrigger>
            </TabsList>

            <TabsContent value="order" className="flex-1 space-y-6">
              <RevisionTimer daysRemaining={currentOrder.daysRemaining} orderId={currentOrder.id} />
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Order #{currentOrder.id}</span>
                    <Badge variant={currentOrder.status === "Completed" ? "default" : "secondary"}>
                      {currentOrder.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Package</p>
                      <p className="font-medium">{currentOrder.tier}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Date</p>
                      <p className="font-medium">{currentOrder.date}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Paid</p>
                      <p className="font-medium">${currentOrder.total}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Progress</p>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full w-[33%]" />
                    </div>
                    <p className="text-xs text-muted-foreground text-right">Drafting in progress...</p>
                  </div>
                </CardContent>
              </Card>

              <OrderHistory orders={orders} />
            </TabsContent>

            <TabsContent value="uploads" className="flex-1">
               <Card className="h-[400px] flex flex-col items-center justify-center border-dashed">
                 <div className="text-center space-y-4">
                   <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto">
                     <Upload className="w-8 h-8 text-muted-foreground" />
                   </div>
                   <h3 className="text-lg font-medium">Upload Job Descriptions</h3>
                   <p className="text-muted-foreground max-w-xs mx-auto text-sm">
                     Upload job descriptions you are targeting so we can optimize your resume keywords.
                   </p>
                   <Button>Select Files</Button>
                 </div>
               </Card>
            </TabsContent>

            <TabsContent value="chat" className="flex-1 h-full min-h-[500px]">
              <Card className="h-full flex flex-col">
                <CardHeader className="border-b py-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    Writer (Online)
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-0 flex flex-col h-full">
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {chatHistory.map((msg, i) => (
                        <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                            msg.sender === "user" 
                              ? "bg-primary text-primary-foreground rounded-tr-none" 
                              : "bg-secondary text-secondary-foreground rounded-tl-none"
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="p-4 border-t bg-card">
                    <form onSubmit={handleSend} className="flex gap-2">
                      <Input 
                        placeholder="Type a message..." 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="flex-1"
                      />
                      <Button type="submit" size="icon">
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
    </div>
  );
}
