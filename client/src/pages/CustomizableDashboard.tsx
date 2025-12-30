import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { useWidgetLayout, useSaveWidgetLayout } from "@/lib/hooks";
import { renderWidget, getDefaultWidgets, AddWidgetMenu } from "@/components/widgets/DashboardWidgets";
import type { WidgetConfig } from "@/lib/api";
import { LayoutDashboard, Save, RotateCcw, GripVertical, Loader2 } from "lucide-react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { toast } from "sonner";

export default function CustomizableDashboard() {
  const { user } = useAuth();
  const { data: savedLayout, isLoading } = useWidgetLayout();
  const saveLayout = useSaveWidgetLayout();
  const [widgets, setWidgets] = useState<WidgetConfig[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (savedLayout) {
      setWidgets(savedLayout);
    } else if (!isLoading && user) {
      setWidgets(getDefaultWidgets(user.role));
    }
  }, [savedLayout, isLoading, user]);

  const handleRemoveWidget = useCallback((id: string) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
    setHasChanges(true);
  }, []);

  const handleAddWidget = useCallback((type: string, title: string) => {
    const maxY = Math.max(...widgets.map(w => w.y + w.h), 0);
    const newWidget: WidgetConfig = {
      id: `${type}-${Date.now()}`,
      type: type as any,
      title,
      x: 0,
      y: maxY,
      w: type === "stats" || type === "chart" ? 2 : 1,
      h: 1,
      visible: true,
    };
    setWidgets(prev => [...prev, newWidget]);
    setHasChanges(true);
  }, [widgets]);

  const handleSaveLayout = useCallback(async () => {
    try {
      await saveLayout.mutateAsync(widgets);
      setHasChanges(false);
      toast.success("Dashboard layout saved!");
    } catch (error) {
      toast.error("Failed to save layout");
    }
  }, [widgets, saveLayout]);

  const handleResetLayout = useCallback(() => {
    if (user) {
      setWidgets(getDefaultWidgets(user.role));
      setHasChanges(true);
    }
  }, [user]);

  const handleReorder = useCallback((newOrder: WidgetConfig[]) => {
    setWidgets(newOrder);
    setHasChanges(true);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-muted-foreground">Please log in to view your dashboard</p>
      </div>
    );
  }

  const existingTypes = widgets.map(w => w.type);

  return (
    <div className="p-6 max-w-7xl mx-auto" data-testid="customizable-dashboard">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">My Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Drag and drop widgets to customize your view
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AddWidgetMenu 
            onAdd={handleAddWidget} 
            userRole={user.role} 
            existingTypes={existingTypes}
          />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleResetLayout}
            className="gap-2"
            data-testid="reset-layout-button"
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </Button>
          <Button 
            size="sm" 
            onClick={handleSaveLayout}
            disabled={!hasChanges || saveLayout.isPending}
            className="gap-2"
            data-testid="save-layout-button"
          >
            {saveLayout.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Layout
          </Button>
        </div>
      </div>

      {widgets.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center h-[40vh] bg-muted/30 rounded-xl border-2 border-dashed"
        >
          <LayoutDashboard className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No widgets yet</h3>
          <p className="text-muted-foreground mb-4">Add widgets to customize your dashboard</p>
          <AddWidgetMenu 
            onAdd={handleAddWidget} 
            userRole={user.role} 
            existingTypes={existingTypes}
          />
        </motion.div>
      ) : (
        <Reorder.Group 
          axis="y" 
          values={widgets} 
          onReorder={handleReorder}
          className="space-y-4"
        >
          <AnimatePresence mode="popLayout">
            {widgets.map((widget) => (
              <Reorder.Item
                key={widget.id}
                value={widget}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className={`${widget.w === 2 ? "col-span-2" : ""}`}
                whileDrag={{ 
                  scale: 1.02, 
                  boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                  cursor: "grabbing"
                }}
              >
                {renderWidget(widget, handleRemoveWidget, user.role)}
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>
      )}

      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
        >
          <span className="text-sm">You have unsaved changes</span>
          <Button size="sm" variant="secondary" onClick={handleSaveLayout} disabled={saveLayout.isPending}>
            {saveLayout.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
          </Button>
        </motion.div>
      )}
    </div>
  );
}
