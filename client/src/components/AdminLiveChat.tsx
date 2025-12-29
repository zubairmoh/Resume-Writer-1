import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Send, MoreVertical, Phone, Video, User } from "lucide-react";

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
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: "1",
      visitorName: "Visitor #4829",
      visitorLocation: "Toronto, ON",
      status: "active",
      lastMessage: "Do you offer rush services?",
      unreadCount: 1,
      messages: [
        { id: "1", text: "Hi, I'm looking for a resume writer.", sender: "visitor", timestamp: "10:30 AM" },
        { id: "2", text: "Hello! I can certainly help with that. What industry are you in?", sender: "agent", timestamp: "10:31 AM" },
        { id: "3", text: "I'm in Finance.", sender: "visitor", timestamp: "10:32 AM" },
        { id: "4", text: "Do you offer rush services?", sender: "visitor", timestamp: "10:33 AM" },
      ]
    },
    {
      id: "2",
      visitorName: "Visitor #4830",
      visitorLocation: "Vancouver, BC",
      status: "idle",
      lastMessage: "Thanks, I'll check it out.",
      unreadCount: 0,
      messages: [
        { id: "1", text: "How much is the executive package?", sender: "visitor", timestamp: "09:15 AM" },
        { id: "2", text: "It's currently $349 and includes LinkedIn optimization.", sender: "agent", timestamp: "09:16 AM" },
        { id: "3", text: "Thanks, I'll check it out.", sender: "visitor", timestamp: "09:17 AM" },
      ]
    },
     {
      id: "3",
      visitorName: "Visitor #4831",
      visitorLocation: "Montreal, QC",
      status: "active",
      lastMessage: "Is this service bilingual?",
      unreadCount: 2,
      messages: [
        { id: "1", text: "Bonjour!", sender: "visitor", timestamp: "11:00 AM" },
        { id: "2", text: "Is this service bilingual?", sender: "visitor", timestamp: "11:01 AM" },
      ]
    }
  ]);

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>("1");
  const [replyText, setReplyText] = useState("");

  const selectedSession = sessions.find(s => s.id === selectedSessionId);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedSessionId) return;

    setSessions(prev => prev.map(session => {
      if (session.id === selectedSessionId) {
        return {
          ...session,
          messages: [...session.messages, { 
            id: Date.now().toString(), 
            text: replyText, 
            sender: "agent", 
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
          }],
          lastMessage: replyText,
          status: "active"
        };
      }
      return session;
    }));
    setReplyText("");
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
            {sessions.map(session => (
              <button
                key={session.id}
                onClick={() => setSelectedSessionId(session.id)}
                className={`flex items-start gap-3 p-4 text-left hover:bg-white dark:hover:bg-slate-800 transition-colors border-b last:border-0 ${selectedSessionId === session.id ? "bg-white dark:bg-slate-800 border-l-4 border-l-primary" : "border-l-4 border-l-transparent"}`}
              >
                <div className="relative">
                  <Avatar>
                    <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                  </Avatar>
                  <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${session.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-sm truncate">{session.visitorName}</span>
                    <span className="text-[10px] text-muted-foreground">{session.messages[session.messages.length - 1]?.timestamp}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mb-1">{session.lastMessage}</p>
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] text-muted-foreground">{session.visitorLocation}</span>
                     {session.unreadCount > 0 && (
                       <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">{session.unreadCount}</Badge>
                     )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-950">
        {selectedSession ? (
          <>
            <div className="h-16 border-b flex items-center justify-between px-6">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="font-bold text-sm">{selectedSession.visitorName}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> 
                    Browsing: /pricing
                  </p>
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
                {selectedSession.messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === "agent" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                      msg.sender === "agent" 
                        ? "bg-primary text-primary-foreground rounded-br-sm" 
                        : "bg-secondary text-secondary-foreground rounded-bl-sm"
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-muted-foreground self-end ml-2">{msg.timestamp}</span>
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
