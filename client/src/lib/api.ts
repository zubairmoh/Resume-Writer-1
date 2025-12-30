const API_BASE = "/api";

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: "client" | "writer" | "admin";
  createdAt: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  source: string;
  status: string;
  assignedWriterId?: string;
  notes?: string;
  atsScore?: number;
  resumeText?: string;
  targetJob?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  clientId: string;
  writerId?: string;
  packageType: string;
  status: string;
  price: number;
  basePrice?: number;
  customPrice?: number;
  overrideReason?: string;
  overrideBy?: string;
  addons?: any;
  addonsTotal?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  paymentIntentId?: string;
  targetJobUrl?: string;
  targetJobTitle?: string;
  additionalInfo?: string;
  deliveryDate?: string;
  revisionsRemaining?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  orderId?: string;
  senderId: string;
  recipientId?: string;
  content: string;
  isRead?: boolean;
  type?: string;
  createdAt: string;
}

export interface Document {
  id: string;
  orderId: string;
  uploadedBy: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  notes?: string;
  version?: number;
  createdAt: string;
}

export interface AdminSettings {
  id?: string;
  stripePublishableKey?: string;
  stripeSecretKey?: string;
  paypalClientId?: string;
  paypalClientSecret?: string;
  businessEmail?: string;
  businessPhone?: string;
  businessAddress?: string;
  fomoEnabled?: boolean;
  chatWidgetEnabled?: boolean;
  notificationEmail?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  browseNotificationsEnabled?: boolean;
  updatedAt?: string;
}

export interface Addon {
  id: string;
  name: string;
  description?: string;
  price: number;
  isActive?: boolean;
  createdAt: string;
}

async function fetchAPI(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  auth: {
    signup: (data: {
      username: string;
      password: string;
      email: string;
      fullName: string;
      role: string;
    }) => fetchAPI("/auth/signup", { method: "POST", body: JSON.stringify(data) }),
    
    login: (username: string, password: string) =>
      fetchAPI("/auth/login", { method: "POST", body: JSON.stringify({ username, password }) }),
    
    logout: () => fetchAPI("/auth/logout", { method: "POST" }),
    
    me: (): Promise<User> => fetchAPI("/auth/me"),
  },

  users: {
    getWriters: (): Promise<User[]> => fetchAPI("/users/writers"),
    getAdmins: (): Promise<User[]> => fetchAPI("/users/admins"),
    getClients: (): Promise<User[]> => fetchAPI("/users/clients"),
    create: (data: {
      username: string;
      password: string;
      email: string;
      fullName: string;
      role: string;
    }) => fetchAPI("/users", { method: "POST", body: JSON.stringify(data) }),
  },

  leads: {
    create: (data: Partial<Lead>) => fetchAPI("/leads", { method: "POST", body: JSON.stringify(data) }),
    
    getAll: (): Promise<Lead[]> => fetchAPI("/leads"),
    
    update: (id: string, data: Partial<Lead>) =>
      fetchAPI(`/leads/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    
    delete: (id: string) => fetchAPI(`/leads/${id}`, { method: "DELETE" }),
  },

  orders: {
    create: (data: Partial<Order>) => fetchAPI("/orders", { method: "POST", body: JSON.stringify(data) }),
    
    getAll: (): Promise<Order[]> => fetchAPI("/orders"),
    
    getById: (id: string): Promise<Order> => fetchAPI(`/orders/${id}`),
    
    update: (id: string, data: Partial<Order>) =>
      fetchAPI(`/orders/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  },

  messages: {
    create: (data: Partial<Message>) =>
      fetchAPI("/messages", { method: "POST", body: JSON.stringify(data) }),
    
    getAll: (orderId?: string): Promise<Message[]> =>
      fetchAPI(`/messages${orderId ? `?orderId=${orderId}` : ""}`),
    
    markAsRead: (id: string) => fetchAPI(`/messages/${id}/read`, { method: "PATCH" }),
  },

  documents: {
    create: (data: Partial<Document>) =>
      fetchAPI("/documents", { method: "POST", body: JSON.stringify(data) }),
    
    getAll: (orderId: string): Promise<Document[]> => fetchAPI(`/documents?orderId=${orderId}`),
  },

  admin: {
    getSettings: (): Promise<AdminSettings> => fetchAPI("/admin/settings"),
    
    updateSettings: (data: Partial<AdminSettings>) =>
      fetchAPI("/admin/settings", { method: "PATCH", body: JSON.stringify(data) }),
    
    getUsers: (): Promise<User[]> => fetchAPI("/admin/users"),
    
    updateUserRole: (id: string, role: string) =>
      fetchAPI(`/admin/users/${id}/role`, { method: "PATCH", body: JSON.stringify({ role }) }),
    
    getMessages: (orderId?: string): Promise<Message[]> =>
      fetchAPI(`/admin/messages${orderId ? `?orderId=${orderId}` : ""}`),
  },

  addons: {
    getAll: (): Promise<Addon[]> => fetchAPI("/addons"),
    
    create: (data: Partial<Addon>) =>
      fetchAPI("/addons", { method: "POST", body: JSON.stringify(data) }),
    
    update: (id: string, data: Partial<Addon>) =>
      fetchAPI(`/addons/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  },

  widgets: {
    getLayout: (): Promise<WidgetConfig[] | null> => fetchAPI("/widgets"),
    
    saveLayout: (widgets: WidgetConfig[]) =>
      fetchAPI("/widgets", { method: "PUT", body: JSON.stringify({ widgets }) }),
  },
};

export interface WidgetConfig {
  id: string;
  type: "stats" | "chart" | "activity" | "shortcuts" | "orders" | "leads" | "messages";
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  visible: boolean;
}
