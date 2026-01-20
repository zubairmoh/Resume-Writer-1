import { useState } from "react";
import { useLeads, useMessages, useCreateMessage } from "@/lib/hooks";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Send, MoreVertical, Phone, Video, User, Globe, Monitor, MapPin } from "lucide-react";

interface ChatSession {
  id: string;
  visitorName: string;
  visitorLocation: string;
  status: "active" | "idle" | "ended";
  lastMessage: string;
  unreadCount: number;
  messages: { id: string; text: string; sender: "visitor" | "agent"; timestamp: string }[];
}

export function AdminLiveChat() {
  const { user } = useAuth();
  const { data: leads = [] } = useLeads();
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const { data: messages = [] } = useMessages(selectedLeadId || undefined);
  const createMessage = useCreateMessage();
  const [replyText, setReplyText] = useState("");

  const chatLeads = leads.filter(l => l.source === "Live Chat");
  const selectedLead = chatLeads.find(l => l.id === selectedLeadId);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedLeadId) return;

    try {
      await createMessage.mutateAsync({
        senderId: user?.id || "admin",
        content: replyText,
        type: "lead_chat",
        orderId: selectedLeadId
      });
      setReplyText("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="flex h-[600px] border rounded-lg overflow-hidden bg-background shadow-sm">
      {/* Sidebar List */}
      <div className="w-80 border-r flex flex-col bg-slate-50 dark:bg-slate-900/50">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search visitors..." className="pl-8 bg-white dark:bg-slate-950" />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="flex flex-col">
            {chatLeads.map(lead => (
              <button
                key={lead.id}
                onClick={() => setSelectedLeadId(lead.id)}
                className={`flex items-start gap-3 p-4 text-left hover:bg-white dark:hover:bg-slate-800 transition-colors border-b last:border-0 ${selectedLeadId === lead.id ? "bg-white dark:bg-slate-800 border-l-4 border-l-primary" : "border-l-4 border-l-transparent"}`}
              >
                <div className="relative">
                  <Avatar>
                    <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                  </Avatar>
                  <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${lead.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-sm truncate">{lead.name}</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(lead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mb-1">{lead.email}</p>
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] text-muted-foreground">Live Chat</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-950">
        {selectedLead ? (
          <>
            <div className="h-16 border-b flex items-center justify-between px-6">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="font-bold text-sm">{selectedLead.name}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> 
                    Browsing: {selectedLead.source === 'Live Chat' ? '/pricing' : 'Direct'}
                  </p>
                </div>
              </div>
              <div className="hidden lg:flex items-center gap-6 px-4 border-l border-r h-10 mx-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Toronto, CA</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Chrome / macOS</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <Button variant="ghost" size="icon"><Phone className="w-4 h-4" /></Button>
                 <Button variant="ghost" size="icon"><Video className="w-4 h-4" /></Button>
                 <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
              </div>
            </div>

            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4">
                {messages.map((msg: any) => (
                  <div key={msg.id} className={`flex ${msg.senderId === "admin" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                      msg.senderId === "admin" 
                        ? "bg-primary text-primary-foreground rounded-br-sm" 
                        : "bg-secondary text-secondary-foreground rounded-bl-sm"
                    }`}>
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-muted-foreground self-end ml-2">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-4 border-t bg-slate-50 dark:bg-slate-900/30">
              <form onSubmit={handleSend} className="flex gap-2">
                <Input 
                  placeholder="Type your reply..." 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="bg-white dark:bg-slate-950"
                />
                <Button type="submit">
                  <Send className="w-4 h-4 mr-2" /> Send
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
