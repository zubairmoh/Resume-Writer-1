import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, FileText, DollarSign, TrendingUp, Clock, 
  MessageSquare, ExternalLink, Settings, GripVertical,
  Plus, X, Eye, EyeOff, LayoutDashboard
} from "lucide-react";
import { useOrders, useLeads, useMessages, useWriters, useClients } from "@/lib/hooks";
import type { WidgetConfig } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface WidgetProps {
  widget: WidgetConfig;
  onRemove: (id: string) => void;
  userRole: string;
  isDragging?: boolean;
}

function StatsWidget({ widget, onRemove, userRole }: WidgetProps) {
  const { data: orders = [] } = useOrders();
  const { data: leads = [] } = useLeads();
  const { data: writers = [] } = useWriters();
  const { data: clients = [] } = useClients();

  const stats = userRole === "admin" ? [
    { label: "Total Orders", value: orders.length, icon: FileText, color: "text-blue-500" },
    { label: "Active Leads", value: leads.filter((l: any) => l.status === "new").length, icon: Users, color: "text-green-500" },
    { label: "Writers", value: writers.length, icon: Users, color: "text-purple-500" },
    { label: "Clients", value: clients.length, icon: Users, color: "text-orange-500" },
  ] : userRole === "writer" ? [
    { label: "Assigned Orders", value: orders.length, icon: FileText, color: "text-blue-500" },
    { label: "In Progress", value: orders.filter((o: any) => o.status === "in_progress").length, icon: Clock, color: "text-yellow-500" },
    { label: "Completed", value: orders.filter((o: any) => o.status === "completed").length, icon: TrendingUp, color: "text-green-500" },
    { label: "Revisions", value: orders.filter((o: any) => o.status === "revision").length, icon: FileText, color: "text-orange-500" },
  ] : [
    { label: "My Orders", value: orders.length, icon: FileText, color: "text-blue-500" },
    { label: "In Progress", value: orders.filter((o: any) => o.status === "in_progress").length, icon: Clock, color: "text-yellow-500" },
    { label: "Completed", value: orders.filter((o: any) => o.status === "completed").length, icon: TrendingUp, color: "text-green-500" },
    { label: "Pending", value: orders.filter((o: any) => o.status === "pending").length, icon: Clock, color: "text-gray-500" },
  ];

  return (
    <WidgetWrapper widget={widget} onRemove={onRemove}>
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    </WidgetWrapper>
  );
}

function RecentOrdersWidget({ widget, onRemove, userRole }: WidgetProps) {
  const { data: orders = [] } = useOrders();
  const recentOrders = orders.slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "revision": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <WidgetWrapper widget={widget} onRemove={onRemove}>
      {recentOrders.length === 0 ? (
        <p className="text-center text-muted-foreground py-4">No orders yet</p>
      ) : (
        <div className="space-y-2">
          {recentOrders.map((order: any) => (
            <div key={order.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg" data-testid={`widget-order-${order.id}`}>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{order.packageType} Package</p>
                <p className="text-xs text-muted-foreground">${order.price}</p>
              </div>
              <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
            </div>
          ))}
        </div>
      )}
    </WidgetWrapper>
  );
}

function RecentLeadsWidget({ widget, onRemove }: WidgetProps) {
  const { data: leads = [] } = useLeads();
  const recentLeads = leads.slice(0, 5);

  return (
    <WidgetWrapper widget={widget} onRemove={onRemove}>
      {recentLeads.length === 0 ? (
        <p className="text-center text-muted-foreground py-4">No leads yet</p>
      ) : (
        <div className="space-y-2">
          {recentLeads.map((lead: any) => (
            <div key={lead.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg" data-testid={`widget-lead-${lead.id}`}>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{lead.name}</p>
                <p className="text-xs text-muted-foreground">{lead.email}</p>
              </div>
              {lead.atsScore && (
                <Badge variant="outline">{lead.atsScore}%</Badge>
              )}
            </div>
          ))}
        </div>
      )}
    </WidgetWrapper>
  );
}

function ShortcutsWidget({ widget, onRemove, userRole }: WidgetProps) {
  const shortcuts = userRole === "admin" ? [
    { label: "View All Orders", icon: FileText, href: "/admin?tab=orders" },
    { label: "Manage Leads", icon: Users, href: "/admin?tab=leads" },
    { label: "Settings", icon: Settings, href: "/admin?tab=settings" },
  ] : userRole === "writer" ? [
    { label: "My Assignments", icon: FileText, href: "/writer" },
    { label: "Messages", icon: MessageSquare, href: "/writer?tab=chat" },
  ] : [
    { label: "My Orders", icon: FileText, href: "/dashboard" },
    { label: "Start New Order", icon: Plus, href: "/packages" },
    { label: "Messages", icon: MessageSquare, href: "/dashboard?tab=messages" },
  ];

  return (
    <WidgetWrapper widget={widget} onRemove={onRemove}>
      <div className="grid grid-cols-1 gap-2">
        {shortcuts.map((shortcut, i) => (
          <Button
            key={i}
            variant="outline"
            className="justify-start gap-2 h-10"
            onClick={() => window.location.href = shortcut.href}
            data-testid={`shortcut-${shortcut.label.toLowerCase().replace(/\s/g, "-")}`}
          >
            <shortcut.icon className="w-4 h-4" />
            {shortcut.label}
            <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
          </Button>
        ))}
      </div>
    </WidgetWrapper>
  );
}

function RevenueChartWidget({ widget, onRemove }: WidgetProps) {
  const { data: orders = [] } = useOrders();
  
  const totalRevenue = orders.reduce((sum: number, o: any) => 
    o.paymentStatus === "paid" ? sum + o.price : sum, 0);
  const pendingRevenue = orders.reduce((sum: number, o: any) => 
    o.paymentStatus !== "paid" ? sum + o.price : sum, 0);

  return (
    <WidgetWrapper widget={widget} onRemove={onRemove}>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium">Collected</span>
          </div>
          <span className="text-lg font-bold text-green-600">${totalRevenue}</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium">Pending</span>
          </div>
          <span className="text-lg font-bold text-yellow-600">${pendingRevenue}</span>
        </div>
      </div>
    </WidgetWrapper>
  );
}

function ActivityWidget({ widget, onRemove }: WidgetProps) {
  const { data: orders = [] } = useOrders();
  
  const recentActivity = orders
    .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4)
    .map((order: any) => ({
      id: order.id,
      text: `Order ${order.packageType} - ${order.status}`,
      time: new Date(order.updatedAt).toLocaleDateString(),
    }));

  return (
    <WidgetWrapper widget={widget} onRemove={onRemove}>
      {recentActivity.length === 0 ? (
        <p className="text-center text-muted-foreground py-4">No recent activity</p>
      ) : (
        <div className="space-y-2">
          {recentActivity.map((activity: any) => (
            <div key={activity.id} className="flex items-start gap-2 p-2 bg-muted/50 rounded-lg">
              <div className="w-2 h-2 bg-primary rounded-full mt-1.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{activity.text}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </WidgetWrapper>
  );
}

function WidgetWrapper({ widget, onRemove, children }: { widget: WidgetConfig; onRemove: (id: string) => void; children: React.ReactNode }) {
  return (
    <Card className="h-full shadow-sm border hover:shadow-md transition-shadow" data-testid={`widget-${widget.id}`}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
          <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onRemove(widget.id)} data-testid={`remove-widget-${widget.id}`}>
          <X className="w-3 h-3" />
        </Button>
      </CardHeader>
      <CardContent className="pt-2">
        {children}
      </CardContent>
    </Card>
  );
}

const WIDGET_TYPES = [
  { type: "stats", title: "Quick Stats", roles: ["admin", "writer", "client"] },
  { type: "orders", title: "Recent Orders", roles: ["admin", "writer", "client"] },
  { type: "leads", title: "Recent Leads", roles: ["admin"] },
  { type: "shortcuts", title: "Quick Actions", roles: ["admin", "writer", "client"] },
  { type: "chart", title: "Revenue Overview", roles: ["admin"] },
  { type: "activity", title: "Recent Activity", roles: ["admin", "writer", "client"] },
] as const;

export function getDefaultWidgets(role: string): WidgetConfig[] {
  const defaults: WidgetConfig[] = [];
  let x = 0;
  let y = 0;
  
  WIDGET_TYPES.filter(w => w.roles.includes(role as any)).forEach((w, i) => {
    defaults.push({
      id: `${w.type}-${Date.now()}-${i}`,
      type: w.type as any,
      title: w.title,
      x: x,
      y: y,
      w: w.type === "stats" || w.type === "chart" ? 2 : 1,
      h: 1,
      visible: true,
    });
    
    x += (w.type === "stats" || w.type === "chart") ? 2 : 1;
    if (x >= 3) {
      x = 0;
      y += 1;
    }
  });
  
  return defaults;
}

export function renderWidget(widget: WidgetConfig, onRemove: (id: string) => void, userRole: string) {
  const props = { widget, onRemove, userRole };
  
  switch (widget.type) {
    case "stats":
      return <StatsWidget key={widget.id} {...props} />;
    case "orders":
      return <RecentOrdersWidget key={widget.id} {...props} />;
    case "leads":
      return <RecentLeadsWidget key={widget.id} {...props} />;
    case "shortcuts":
      return <ShortcutsWidget key={widget.id} {...props} />;
    case "chart":
      return <RevenueChartWidget key={widget.id} {...props} />;
    case "activity":
      return <ActivityWidget key={widget.id} {...props} />;
    default:
      return null;
  }
}

interface AddWidgetMenuProps {
  onAdd: (type: string, title: string) => void;
  userRole: string;
  existingTypes: string[];
}

export function AddWidgetMenu({ onAdd, userRole, existingTypes }: AddWidgetMenuProps) {
  const availableWidgets = WIDGET_TYPES.filter(
    w => w.roles.includes(userRole as any) && !existingTypes.includes(w.type)
  );

  if (availableWidgets.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" data-testid="add-widget-button">
          <Plus className="w-4 h-4" /> Add Widget
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {availableWidgets.map((w) => (
          <DropdownMenuItem
            key={w.type}
            onClick={() => onAdd(w.type, w.title)}
            data-testid={`add-widget-${w.type}`}
          >
            <LayoutDashboard className="w-4 h-4 mr-2" />
            {w.title}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
