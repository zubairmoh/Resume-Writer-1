import React, { createContext, useContext, useState } from "react";

type UserRole = "client" | "admin" | "writer" | null;

interface User {
  email: string;
  role: UserRole;
  name?: string;
}

interface Writer {
  id: string;
  name: string;
  email: string;
  activeOrders: number;
  rating: number;
  specialties: string[];
}

interface Order {
  id: string;
  tier: "Entry" | "Professional" | "Executive";
  addOns: {
    coverLetter: boolean;
    linkedin: boolean;
  };
  total: number;
  status: "Drafting" | "Review" | "Completed" | "Pending" | "In Progress" | "Under Review";
  date: string;
  daysRemaining: number;
  assignedWriterId?: string;
  escrowStatus: "held" | "released" | "refunded";
  targetJobs?: { title: string; company: string; url?: string }[];
}

interface Message {
  id: string;
  orderId: string;
  senderId: string;
  senderName: string;
  role: UserRole;
  text: string;
  timestamp: string;
}

interface RevisionRequest {
  id: string;
  orderId: string;
  comments: string;
  status: "pending" | "resolved";
  timestamp: string;
}

interface Notification {
  id: string;
  message: string;
  type: "success" | "info" | "warning";
  read: boolean;
  timestamp: string;
}

interface AdminSettings {
  stripeKey: string;
  emailFrom: string;
  emailProvider: "gmail" | "mailgun" | "sendgrid";
  revisionDays: number;
}

interface Document {
  id: string;
  orderId: string;
  type: "resume" | "coverLetter" | "jobDescription" | "completed";
  name: string;
  uploadedAt: string;
  size: string;
}

interface AppContextType {
  user: User | null;
  login: (email: string, role: UserRole) => void;
  logout: () => void;
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;
  notifications: Notification[];
  addNotification: (message: string, type: Notification["type"]) => void;
  markNotificationRead: (id: string) => void;
  documents: Document[];
  addDocument: (doc: Document) => void;
  settings: AdminSettings;
  updateSettings: (settings: AdminSettings) => void;
  writers: Writer[];
  addWriter: (writer: Writer) => void;
  updateWriter: (id: string, updates: Partial<Writer>) => void;
  deleteWriter: (id: string) => void;
  assignWriter: (orderId: string, writerId: string) => void;
  releaseEscrow: (orderId: string) => void;
  messages: Message[];
  addMessage: (msg: Omit<Message, "id" | "timestamp">) => void;
  revisions: RevisionRequest[];
  addRevisionRequest: (req: Omit<RevisionRequest, "id" | "status" | "timestamp">) => void;
  resolveRevision: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [writers, setWriters] = useState<Writer[]>([
    { id: "WR-001", name: "Sarah Jenkins", email: "sarah@proresumes.ca", activeOrders: 2, rating: 4.9, specialties: ["Tech", "Executive"] },
    { id: "WR-002", name: "Michael Chen", email: "michael@proresumes.ca", activeOrders: 1, rating: 4.8, specialties: ["Finance", "Entry Level"] },
  ]);

  const [revisions, setRevisions] = useState<RevisionRequest[]>([]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-1",
      orderId: "ORD-123",
      senderId: "WR-001",
      senderName: "Sarah Jenkins",
      role: "writer",
      text: "Hi there! I'm Sarah, and I'll be working on your resume. Could you provide a bit more detail about your last role?",
      timestamp: "2024-12-28T10:00:00",
    },
    {
      id: "msg-2",
      orderId: "ORD-123",
      senderId: "USR-001",
      senderName: "Client",
      role: "client",
      text: "Hi Sarah! Sure, I managed a team of 5 developers and led the migration to AWS.",
      timestamp: "2024-12-28T10:30:00",
    }
  ]);

  const [orders, setOrders] = useState<Order[]>([
    {
      id: "ORD-123",
      tier: "Professional",
      addOns: { coverLetter: true, linkedin: false },
      total: 249,
      status: "In Progress",
      date: "2024-12-25",
      daysRemaining: 28,
      assignedWriterId: "WR-001",
      escrowStatus: "held",
      targetJobs: [
        { title: "Senior Software Engineer", company: "Shopify", url: "https://shopify.com/careers/..." },
        { title: "Full Stack Developer", company: "Wealthsimple", url: "" }
      ]
    },
    {
      id: "ORD-124",
      tier: "Entry",
      addOns: { coverLetter: false, linkedin: false },
      total: 99,
      status: "Under Review",
      date: "2024-12-20",
      daysRemaining: 23,
      assignedWriterId: "WR-002",
      escrowStatus: "held",
    },
  ]);

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      message: "Your resume has been uploaded successfully",
      type: "success",
      read: true,
      timestamp: "2024-12-28T10:00:00",
    },
    {
      id: "2",
      message: "Your writer is reviewing your resume",
      type: "info",
      read: false,
      timestamp: "2024-12-28T11:30:00",
    },
  ]);

  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "doc-1",
      orderId: "ORD-123",
      type: "resume",
      name: "john_doe_resume.pdf",
      uploadedAt: "2024-12-25",
      size: "245 KB",
    },
    {
      id: "doc-2",
      orderId: "ORD-123",
      type: "coverLetter",
      name: "john_doe_cover_letter.pdf",
      uploadedAt: "2024-12-26",
      size: "189 KB",
    },
  ]);

  const [settings, setSettings] = useState<AdminSettings>({
    stripeKey: "pk_test_...",
    emailFrom: "noreply@resumepro.com",
    emailProvider: "sendgrid",
    revisionDays: 30,
  });

  const login = (email: string, role: UserRole) => {
    setUser({ email, role });
  };

  const logout = () => {
    setUser(null);
  };

  const addOrder = (order: Order) => {
    setOrders((prev) => [...prev, order]);
  };

  const updateOrderStatus = (orderId: string, status: Order["status"]) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  const addNotification = (message: string, type: Notification["type"]) => {
    const id = Date.now().toString();
    setNotifications((prev) => [
      {
        id,
        message,
        type,
        read: false,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const addDocument = (doc: Document) => {
    setDocuments((prev) => [...prev, doc]);
  };

  const updateSettings = (newSettings: AdminSettings) => {
    setSettings(newSettings);
  };

  const addWriter = (writer: Writer) => {
    setWriters(prev => [...prev, writer]);
  };

  const updateWriter = (id: string, updates: Partial<Writer>) => {
    setWriters(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  };

  const deleteWriter = (id: string) => {
    setWriters(prev => prev.filter(w => w.id !== id));
  };

  const assignWriter = (orderId: string, writerId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, assignedWriterId: writerId } : o));
  };

  const releaseEscrow = (orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, escrowStatus: "released" } : o));
  };

  const addMessage = (msg: Omit<Message, "id" | "timestamp">) => {
    const newMessage: Message = {
      ...msg,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addRevisionRequest = (req: Omit<RevisionRequest, "id" | "status" | "timestamp">) => {
    const newRevision: RevisionRequest = {
      ...req,
      id: `REV-${Date.now()}`,
      status: "pending",
      timestamp: new Date().toISOString(),
    };
    setRevisions(prev => [...prev, newRevision]);
  };

  const resolveRevision = (id: string) => {
    setRevisions(prev => prev.map(r => r.id === id ? { ...r, status: "resolved" } : r));
  };

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        logout,
        orders,
        addOrder,
        updateOrderStatus,
        notifications,
        addNotification,
        markNotificationRead,
        documents,
        addDocument,
        settings,
        updateSettings,
        writers,
        addWriter,
        updateWriter,
        deleteWriter,
        assignWriter,
        releaseEscrow,
        messages,
        addMessage,
        revisions,
        addRevisionRequest,
        resolveRevision,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
