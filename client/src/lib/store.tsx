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
}

interface AppContextType {
  user: User | null;
  login: (email: string, role: UserRole) => void;
  logout: () => void;
  orders: Order[];
  addOrder: (order: Order) => void;
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
      date: "2024-05-15",
    },
  ]);

  const login = (email: string, role: UserRole) => {
    setUser({ email, role });
  };

  const logout = () => {
    setUser(null);
  };

  const addOrder = (order: Order) => {
    setOrders((prev) => [...prev, order]);
  };

  return (
    <AppContext.Provider value={{ user, login, logout, orders, addOrder }}>
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
