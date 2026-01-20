import { useState, useEffect } from "react";
import { MessageSquare, X, Send, User } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useCreateMessage, useMessages, useCreateLead } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { AnimatePresence, motion } from "framer-motion";

export function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasPopped, setHasPopped] = useState(false);
  const { user } = useAuth();
  const createLead = useCreateLead();
  const [leadId, setLeadId] = useState<string | null>(localStorage.getItem("chat_lead_id"));
  
  const { data: leadMessages = [] } = useMessages(leadId || undefined);
  const createMessage = useCreateMessage();

  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen && !hasPopped) {
        setIsOpen(true);
        setHasPopped(true);
      }
    }, 15000);
    return () => clearTimeout(timer);
  }, [isOpen, hasPopped]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    let currentLeadId = leadId;

    // If no lead exists, create one first
    if (!currentLeadId) {
      try {
        const lead = await createLead.mutateAsync({
          name: "Website Visitor",
          email: "visitor@anonymous.com",
          source: "Live Chat",
          status: "new"
        });
        currentLeadId = lead.id;
        setLeadId(lead.id);
        localStorage.setItem("chat_lead_id", lead.id);
      } catch (error) {
        console.error("Failed to create lead:", error);
        return;
      }
    }

    try {
      await createMessage.mutateAsync({
        senderId: user?.id || currentLeadId || "anonymous", 
        content: inputValue,
        type: "lead_chat",
        orderId: currentLeadId || undefined
      });
      setInputValue("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // Combine initial message with real messages
  const allMessages = [
    { role: 'agent', text: "Hi there! 👋 I noticed you're looking to improve your resume. Do you have any questions about our packages?" },
    ...leadMessages.map((m: any) => ({
      role: m.senderId === leadId ? 'user' : 'agent',
      text: m.content
    }))
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="w-[350px] shadow-2xl border-primary/20">
              <CardHeader className="bg-primary text-primary-foreground p-4 rounded-t-lg flex flex-row justify-between items-center space-y-0">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <User className="w-6 h-6" />
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-primary"></div>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">ProResumes Support</h4>
                    <p className="text-xs text-primary-foreground/80">Online now</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-primary-foreground hover:bg-white/20 h-8 w-8" 
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </CardHeader>
              <CardContent className="h-[300px] p-4 overflow-y-auto bg-slate-50 dark:bg-slate-900/50 flex flex-col gap-3">
                <div className="text-xs text-center text-muted-foreground my-2">Today</div>
                {allMessages.map((msg, i) => (
                  <div 
                    key={i} 
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] p-3 text-sm ${
                        msg.role === 'user' 
                          ? 'bg-primary text-primary-foreground rounded-2xl rounded-tr-sm' 
                          : 'bg-white dark:bg-card border text-foreground rounded-2xl rounded-tl-sm shadow-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-card border p-3 rounded-2xl rounded-tl-sm shadow-sm flex gap-1">
                      <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="p-3 border-t bg-background rounded-b-lg">
                <form onSubmit={handleSendMessage} className="flex w-full gap-2">
                  <Input 
                    placeholder="Type a message..." 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="flex-1 focus-visible:ring-1"
                  />
                  <Button type="submit" size="icon" disabled={!inputValue.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
        >
          <MessageSquare className="w-7 h-7" />
          {hasPopped && !isOpen && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] text-white items-center justify-center">1</span>
            </span>
          )}
        </motion.button>
      )}
    </div>
  );
}
