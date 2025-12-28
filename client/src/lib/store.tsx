import React, { createContext, useContext, useState } from "react";

type UserRole = "client" | "admin" | null;

interface User {
  email: string;
  role: UserRole;
}

interface Order {
  id: string;
  tier: "Entry" | "Professional" | "Executive";
  addOns: {
    coverLetter: boolean;
    linkedin: boolean;
  };
  total: number;
  status: "Drafting" | "Review" | "Completed";
  date: string;
  daysRemaining: number;
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "ORD-123",
      tier: "Professional",
      addOns: { coverLetter: true, linkedin: false },
      total: 249,
      status: "Drafting",
      date: "2024-12-25",
      daysRemaining: 28,
    },
    {
      id: "ORD-124",
      tier: "Entry",
      addOns: { coverLetter: false, linkedin: false },
      total: 99,
      status: "Review",
      date: "2024-12-20",
      daysRemaining: 23,
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
