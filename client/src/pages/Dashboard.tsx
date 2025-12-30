import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { useOrders, useMessages, useCreateMessage, useWriters } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Send, User, Upload, MessageSquare, AlertTriangle, FileInput, History, CheckCircle2, Circle, Clock, Briefcase, Plus, ExternalLink, Trash2, Loader2, LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RevisionTimer } from "@/components/RevisionTimer";
import { OrderHistory } from "@/components/OrderHistory";
import { NotificationBell } from "@/components/NotificationBell";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

import { ResumePreview } from "@/components/ResumePreview";

// Add this component locally
function TimelineItem({ title, date, status, isLast }: { title: string, date: string, status: 'completed' | 'current' | 'upcoming', isLast?: boolean }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full z-10 ${
          status === 'completed' ? 'bg-primary' : 
          status === 'current' ? 'bg-primary animate-pulse' : 'bg-muted-foreground/30'
        }`} />
        {!isLast && (
          <div className={`w-0.5 flex-1 my-1 ${
             status === 'completed' ? 'bg-primary/50' : 'bg-muted-foreground/20'
          }`} />
        )}
      </div>
      <div className={`pb-6 ${status === 'upcoming' ? 'opacity-50' : ''}`}>
        <p className="text-sm font-medium leading-none">{title}</p>
        <p className="text-xs text-muted-foreground mt-1">{date}</p>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { user: authUser, logout, isLoading: authLoading } = useAuth();
  const { data: orders = [], isLoading: ordersLoading } = useOrders();
  const { data: writers = [] } = useWriters();
  const createMessage = useCreateMessage();
  
  const navigate = useNavigate();
  const [messageInput, setMessageInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isRevisionOpen, setIsRevisionOpen] = useState(false);
  const [revisionComments, setRevisionComments] = useState("");
  const [profileData, setProfileData] = useState({ name: "", email: "" });

  const [targetJobs, setTargetJobs] = useState<{id: number; title: string; company: string; url: string}[]>([]);
  const [newJobUrl, setNewJobUrl] = useState("");

  const myOrders = orders.filter((o: any) => o.clientId === authUser?.id);
  const currentOrder: any = myOrders[0];
  const { data: messages = [] } = useMessages(currentOrder?.id);
  const orderMessages = messages.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  
  const isLoading = authLoading || ordersLoading;

  useEffect(() => {
    if (!isLoading && !authUser) {
      navigate("/login");
    } else if (authUser) {
      setProfileData({ name: authUser.fullName || authUser.username, email: authUser.email });
    }
  }, [authUser, isLoading, navigate]);

  const assignedWriter = writers.find((w: any) => w.id === currentOrder?.writerId);
  const writerInitials = assignedWriter?.fullName?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'TBA';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [orderMessages]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!authUser) return null;
  
  const user = authUser;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !currentOrder || !authUser) return;
    
    try {
      await createMessage.mutateAsync({
        orderId: currentOrder.id,
        senderId: authUser.id,
        content: messageInput,
        type: "chat",
      });
      setMessageInput("");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error sending message", description: error.message });
    }
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Profile Updated",
      description: "Your changes have been saved successfully.",
    });
    setIsProfileOpen(false);
  };

  const handleSubmitRevision = async () => {
    if (!revisionComments.trim() || !currentOrder || !authUser) {
      toast({ title: "Error", description: "Please enter your revision comments.", variant: "destructive" });
      return;
    }
    
    try {
      await createMessage.mutateAsync({
        orderId: currentOrder.id,
        senderId: authUser.id,
        content: `[REVISION REQUEST] ${revisionComments}`,
        type: "revision",
      });
      toast({
        title: "Revision Requested",
        description: "Your writer has been notified.",
      });
      setIsRevisionOpen(false);
      setRevisionComments("");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleAddTargetJob = () => {
    if (!newJobUrl) return;
    setTargetJobs([...targetJobs, { 
      id: Date.now(), 
      title: "New Role (Pending Review)", 
      company: "Unknown", 
      url: newJobUrl 
    }]);
    setNewJobUrl("");
    toast({ title: "Job Added", description: "Your writer will review this target role." });
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
          <Button variant="ghost" className="w-full justify-start font-medium" onClick={() => navigate("/my-dashboard")} data-testid="link-custom-dashboard">
            <LayoutDashboard className="mr-2 h-4 w-4" /> My Dashboard
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
            <TabsList className="w-full max-w-2xl grid grid-cols-6 mb-6 mx-auto md:mx-0">
              <TabsTrigger value="order">My Order</TabsTrigger>
              <TabsTrigger value="documents">Docs</TabsTrigger>
              <TabsTrigger value="preview">Live Preview</TabsTrigger>
              <TabsTrigger value="targeting">Targeting</TabsTrigger>
              <TabsTrigger value="tracker">Job Tracker</TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
            </TabsList>

            <TabsContent value="order" className="flex-1 space-y-6">
              {!currentOrder ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="w-12 h-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
                    <p className="text-muted-foreground mb-4">Start your journey with a professional resume</p>
                    <Button onClick={() => navigate("/pricing")}>Browse Packages</Button>
                  </CardContent>
                </Card>
              ) : (
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                   <Card className="border-l-4 border-l-primary shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex justify-between items-center text-lg">
                        <span>Order #{currentOrder.id.slice(0, 8)}</span>
                        <Badge variant={currentOrder.status === "Completed" ? "default" : "secondary"}>
                          {currentOrder.status}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs uppercase tracking-wide">Package</p>
                          <p className="font-medium mt-1">{currentOrder.packageType}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs uppercase tracking-wide">Date</p>
                          <p className="font-medium mt-1">{new Date(currentOrder.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs uppercase tracking-wide">Total Paid</p>
                          <p className="font-medium mt-1">${currentOrder.price}</p>
                        </div>
                      </div>

                      {/* Replaced Simple Progress Bar with Timeline */}
                      <div className="space-y-4 pt-2">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Order Timeline</h4>
                        <div className="pl-2">
                          <TimelineItem 
                            title="Order Placed" 
                            date="Dec 25, 2024" 
                            status="completed" 
                          />
                          <TimelineItem 
                            title="Writer Assigned" 
                            date="Dec 26, 2024" 
                            status="completed" 
                          />
                          <TimelineItem 
                            title="Initial Draft" 
                            date="In Progress" 
                            status="current" 
                          />
                          <TimelineItem 
                            title="Client Review" 
                            date="Pending" 
                            status="upcoming" 
                          />
                          <TimelineItem 
                            title="Final Delivery" 
                            date="Pending" 
                            status="upcoming" 
                            isLast
                          />
                        </div>
                      </div>

                      {/* ATS Score Card - NEW FEATURE */}
                      {currentOrder.status !== "Completed" ? (
                         <div className="bg-slate-900 text-white rounded-lg p-4 flex items-center justify-between shadow-lg">
                           <div>
                             <h4 className="font-bold flex items-center gap-2">
                               <CheckCircle2 className="w-5 h-5 text-green-400" /> ATS Optimization Goal
                             </h4>
                             <p className="text-sm text-slate-300 mt-1">Targeting 95+ Score</p>
                           </div>
                           <div className="text-right">
                             <span className="text-3xl font-bold text-green-400">95</span>
                             <span className="text-sm text-slate-400">/100</span>
                           </div>
                         </div>
                      ) : (
                         <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg p-4 flex items-center justify-between shadow-lg">
                           <div>
                             <h4 className="font-bold flex items-center gap-2">
                               <CheckCircle2 className="w-5 h-5 text-white" /> ATS Optimization Achieved!
                             </h4>
                             <p className="text-sm text-green-100 mt-1">Your resume is now top 1%</p>
                           </div>
                           <div className="text-right">
                             <span className="text-3xl font-bold text-white">98</span>
                             <span className="text-sm text-green-200">/100</span>
                           </div>
                         </div>
                      )}

                      {/* File Versions / Revisions */}
                      <div className="bg-secondary/20 rounded-lg p-4 border space-y-3">
                         <h4 className="text-sm font-semibold flex items-center gap-2">
                           <History className="w-4 h-4" /> Document History
                         </h4>
                         <div className="flex items-center justify-between text-sm p-2 bg-background rounded border">
                           <div className="flex items-center gap-2">
                             <FileText className="w-4 h-4 text-muted-foreground" />
                             <span>Resume_Draft_v1.pdf</span>
                           </div>
                           <Badge variant="outline" className="text-[10px]">Current Draft</Badge>
                         </div>
                         <div className="flex justify-end">
                           <Button size="sm" variant="outline" onClick={() => setIsRevisionOpen(true)}>
                             Request Revision
                           </Button>
                         </div>
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
                      {assignedWriter ? (
                        <>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                              {writerInitials}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{assignedWriter.fullName}</p>
                              <p className="text-xs text-muted-foreground">Resume Writer</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="w-full" onClick={() => document.querySelector('[value="chat"]')?.dispatchEvent(new MouseEvent('click', {bubbles: true}))}>
                            <MessageSquare className="w-4 h-4 mr-2" /> Message
                          </Button>
                        </>
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          <p className="text-sm">No writer assigned yet</p>
                          <p className="text-xs mt-1">A writer will be assigned shortly</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
              )}
            </TabsContent>

            <TabsContent value="documents" className="flex-1">
              <Card>
                <CardHeader>
                   <CardTitle>Document Uploads</CardTitle>
                   <CardDescription>Upload your current resume, cover letter, and any other helpful documents for your writer.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                   <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-secondary/20 transition-colors cursor-pointer" onClick={() => toast({ title: "Upload Started", description: "File upload simulation started." })}>
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Upload className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-1">Click to upload or drag and drop</h3>
                      <p className="text-sm text-muted-foreground mb-4">PDF, DOCX, TXT up to 10MB</p>
                      <Button>Select Files</Button>
                   </div>

                   <div className="space-y-4">
                      <h4 className="font-medium text-sm">Uploaded Files</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                           <div className="flex items-center gap-3">
                              <FileText className="w-8 h-8 text-blue-500" />
                              <div>
                                 <p className="text-sm font-medium">old_resume_2023.pdf</p>
                                 <p className="text-xs text-muted-foreground">Uploaded Dec 25, 2024</p>
                              </div>
                           </div>
                           <Button size="icon" variant="ghost" className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                         <div className="flex items-center justify-between p-3 border rounded-lg">
                           <div className="flex items-center gap-3">
                              <FileText className="w-8 h-8 text-blue-500" />
                              <div>
                                 <p className="text-sm font-medium">job_description.txt</p>
                                 <p className="text-xs text-muted-foreground">Uploaded Dec 25, 2024</p>
                              </div>
                           </div>
                           <Button size="icon" variant="ghost" className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </div>
                   </div>

                   <div className="space-y-2">
                      <Label htmlFor="notes">Notes for Writer</Label>
                      <Textarea id="notes" placeholder="Any specific instructions or things you want to highlight..." />
                      <Button variant="outline" onClick={() => toast({ title: "Notes Saved", description: "Your notes have been shared with the writer." })}>Save Notes</Button>
                   </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview" className="flex-1 h-[800px]">
               <ResumePreview />
            </TabsContent>

            <TabsContent value="targeting" className="flex-1">
               <Card>
                 <CardHeader>
                   <CardTitle>Target Roles & Strategy</CardTitle>
                   <CardDescription>
                     Provide 2-3 job postings you are targeting. Your writer will tailor your keywords to match these specifically.
                   </CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-6">
                   <div className="flex gap-2">
                     <Input 
                       placeholder="Paste LinkedIn or Company Job URL..." 
                       value={newJobUrl}
                       onChange={(e) => setNewJobUrl(e.target.value)}
                     />
                     <Button onClick={handleAddTargetJob}>
                       <Plus className="w-4 h-4 mr-2" /> Add Job
                     </Button>
                   </div>

                   <div className="space-y-3">
                     {targetJobs.map((job) => (
                       <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-secondary/20 transition-colors">
                         <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary">
                             <Briefcase className="w-5 h-5" />
                           </div>
                           <div>
                             <p className="font-medium">{job.title}</p>
                             <p className="text-sm text-muted-foreground">{job.company}</p>
                           </div>
                         </div>
                         <div className="flex items-center gap-2">
                           {job.url && (
                             <a href={job.url} target="_blank" rel="noreferrer">
                               <Button variant="ghost" size="icon"><ExternalLink className="w-4 h-4" /></Button>
                             </a>
                           )}
                           <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                             <Trash2 className="w-4 h-4" />
                           </Button>
                         </div>
                       </div>
                     ))}
                   </div>
                   
                   <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-900/30">
                     <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                       <CheckCircle2 className="w-4 h-4" /> Why is this important?
                     </h4>
                     <p className="text-sm text-blue-800 dark:text-blue-200">
                       Generic resumes get rejected. By analyzing these specific job descriptions, we can "keyword stuff" your resume ethically to pass the ATS (Applicant Tracking System) for these specific roles.
                     </p>
                   </div>
                 </CardContent>
               </Card>
            </TabsContent>

            <TabsContent value="tracker" className="flex-1">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                   <div>
                     <CardTitle>Job Application Tracker</CardTitle>
                     <CardDescription>Keep track of your active applications.</CardDescription>
                   </div>
                   <Button size="sm"><Plus className="w-4 h-4 mr-2" /> Add Application</Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Applied Column */}
                    <div className="bg-secondary/30 p-4 rounded-lg min-h-[400px]">
                      <h4 className="font-medium mb-4 flex items-center justify-between">
                        <span>Applied</span>
                        <Badge variant="secondary">1</Badge>
                      </h4>
                      <div className="space-y-3">
                         <Card className="p-3 shadow-sm cursor-grab active:cursor-grabbing">
                           <div className="flex justify-between items-start mb-2">
                             <span className="font-medium text-sm">Frontend Lead</span>
                             <Badge variant="outline" className="text-[10px]">RBC</Badge>
                           </div>
                           <p className="text-xs text-muted-foreground">Applied 2 days ago</p>
                         </Card>
                      </div>
                    </div>

                    {/* Interview Column */}
                    <div className="bg-secondary/30 p-4 rounded-lg min-h-[400px]">
                      <h4 className="font-medium mb-4 flex items-center justify-between">
                        <span>Interviewing</span>
                        <Badge variant="default" className="bg-blue-500">1</Badge>
                      </h4>
                      <div className="space-y-3">
                         <Card className="p-3 shadow-sm cursor-grab active:cursor-grabbing border-blue-200">
                           <div className="flex justify-between items-start mb-2">
                             <span className="font-medium text-sm">React Developer</span>
                             <Badge variant="outline" className="text-[10px]">Telus</Badge>
                           </div>
                           <p className="text-xs text-muted-foreground">Interview tomorrow 2pm</p>
                         </Card>
                      </div>
                    </div>

                    {/* Offer Column */}
                    <div className="bg-secondary/30 p-4 rounded-lg min-h-[400px]">
                      <h4 className="font-medium mb-4 flex items-center justify-between">
                        <span>Offer / Hired</span>
                        <Badge variant="default" className="bg-green-500">0</Badge>
                      </h4>
                      <div className="flex items-center justify-center h-32 text-muted-foreground text-sm italic border-2 border-dashed rounded-lg">
                        Drag success here!
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="chat" className="flex-1 h-[600px] min-h-[500px]">
              <Card className="h-full flex flex-col border-none shadow-md">
                <CardHeader className="border-b py-3 bg-card">
                  <CardTitle className="text-base flex items-center gap-2">
                    {assignedWriter ? (
                      <>
                        <div className="relative">
                          <div className="w-2 h-2 rounded-full bg-green-500 absolute -right-0.5 -bottom-0.5 border border-white" />
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">{writerInitials}</div>
                        </div>
                        <div>
                          <span className="block text-sm">{assignedWriter.fullName}</span>
                          <span className="block text-[10px] text-muted-foreground font-normal">Your Writer</span>
                        </div>
                      </>
                    ) : (
                      <span className="text-muted-foreground">No writer assigned yet</span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-0 flex flex-col h-full bg-slate-50 dark:bg-slate-900/50">
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4 pb-4" ref={scrollRef}>
                      {orderMessages.map((msg: any) => {
                        const isMe = msg.senderId === authUser?.id;
                        return (
                        <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                          <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[80%]`}>
                            <div className={`px-4 py-2 text-sm shadow-sm ${
                              isMe 
                                ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm" 
                                : "bg-white dark:bg-card border text-foreground rounded-2xl rounded-tl-sm"
                            }`}>
                              {msg.content}
                            </div>
                            <span className="text-[10px] text-muted-foreground mt-1 px-1">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );})}
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

      {/* Request Revision Modal */}
      <Dialog open={isRevisionOpen} onOpenChange={setIsRevisionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Revision</DialogTitle>
            <DialogDescription>
              Please explain what changes you would like to see.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
             <Textarea 
                placeholder="e.g., Can we highlight my leadership experience more in the summary?"
                value={revisionComments}
                onChange={(e) => setRevisionComments(e.target.value)}
                className="min-h-[100px]"
             />
          </div>
          <DialogFooter>
             <Button variant="outline" onClick={() => setIsRevisionOpen(false)}>Cancel</Button>
             <Button onClick={handleSubmitRevision}>Submit Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
