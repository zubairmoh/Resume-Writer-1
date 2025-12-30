import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type Lead, type Order, type Message, type Document, type AdminSettings, type User } from "./api";

export function useLeads() {
  return useQuery({
    queryKey: ["leads"],
    queryFn: () => api.leads.getAll(),
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Lead>) => api.leads.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Lead> }) => api.leads.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.leads.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: () => api.orders.getAll(),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: () => api.orders.getById(id),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Order>) => api.orders.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Order> }) => api.orders.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useMessages(orderId?: string) {
  return useQuery({
    queryKey: ["messages", orderId],
    queryFn: () => api.messages.getAll(orderId),
  });
}

export function useCreateMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Message>) => api.messages.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      if (variables.orderId) {
        queryClient.invalidateQueries({ queryKey: ["messages", variables.orderId] });
      }
    },
  });
}

export function useDocuments(orderId: string) {
  return useQuery({
    queryKey: ["documents", orderId],
    queryFn: () => api.documents.getAll(orderId),
    enabled: !!orderId,
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Document>) => api.documents.create(data),
    onSuccess: (_, variables) => {
      if (variables.orderId) {
        queryClient.invalidateQueries({ queryKey: ["documents", variables.orderId] });
      }
    },
  });
}

export function useWriters() {
  return useQuery({
    queryKey: ["writers"],
    queryFn: () => api.users.getWriters(),
  });
}

export function useAdmins() {
  return useQuery({
    queryKey: ["admins"],
    queryFn: () => api.users.getAdmins(),
  });
}

export function useClients() {
  return useQuery({
    queryKey: ["clients"],
    queryFn: () => api.users.getClients(),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      username: string;
      password: string;
      email: string;
      fullName: string;
      role: string;
    }) => api.users.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [variables.role + "s"] });
      queryClient.invalidateQueries({ queryKey: ["writers"] });
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

export function useAdminSettings() {
  return useQuery({
    queryKey: ["admin", "settings"],
    queryFn: () => api.admin.getSettings(),
  });
}

export function useUpdateAdminSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AdminSettings>) => api.admin.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
    },
  });
}
