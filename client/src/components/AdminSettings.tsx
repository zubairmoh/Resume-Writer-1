import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAdminSettings, useUpdateAdminSettings, useCreateUser } from "@/lib/hooks";
import { toast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function AdminSettings() {
  const { data: settings, isLoading } = useAdminSettings();
  const updateSettings = useUpdateAdminSettings();
  const createUser = useCreateUser();
  
  const [formData, setFormData] = useState({
    stripePublishableKey: "",
    stripeSecretKey: "",
    paypalClientId: "",
    paypalClientSecret: "",
    businessEmail: "",
    businessPhone: "",
    businessAddress: "",
    fomoEnabled: true,
    chatWidgetEnabled: true,
    notificationEmail: "",
    smtpHost: "",
    smtpPort: "",
    smtpUser: "",
    smtpPass: "",
    browseNotificationsEnabled: false,
    packages: [
      { id: "basic", name: "Basic", price: 99, description: "Professional Resume", features: [] as string[] },
      { id: "pro", name: "Professional", price: 199, description: "Resume + Cover Letter", features: [] as string[] },
      { id: "exec", name: "Executive", price: 299, description: "Full Career Suite", features: [] as string[] }
    ],
    newAdmin: { username: "", password: "", fullName: "" }
  });

  const [newFeature, setNewFeature] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (settings) {
      setFormData(prev => ({
        ...prev,
        ...settings,
        smtpPort: settings.smtpPort?.toString() || "",
        packages: (settings.packages as any[])?.map(p => ({
          ...p,
          features: p.features || []
        })) || prev.packages,
      }));
    }
  }, [settings]);

  const handlePriceChange = (id: string, newPrice: string) => {
    const updatedPackages = formData.packages.map(pkg => 
      pkg.id === id ? { ...pkg, price: parseInt(newPrice) || 0 } : pkg
    );
    setFormData({ ...formData, packages: updatedPackages });
  };

  const handleDescriptionChange = (id: string, newDesc: string) => {
    const updatedPackages = formData.packages.map(pkg => 
      pkg.id === id ? { ...pkg, description: newDesc } : pkg
    );
    setFormData({ ...formData, packages: updatedPackages });
  };

  const addFeature = (pkgId: string) => {
    const feature = newFeature[pkgId];
    if (!feature?.trim()) return;

    const updatedPackages = formData.packages.map(pkg => {
      if (pkg.id === pkgId) {
        const features = [...(pkg.features || []), feature.trim()];
        return { ...pkg, features };
      }
      return pkg;
    });

    setFormData({ ...formData, packages: updatedPackages });
    setNewFeature({ ...newFeature, [pkgId]: "" });
  };

  const removeFeature = (pkgId: string, index: number) => {
    const updatedPackages = formData.packages.map(pkg => {
      if (pkg.id === pkgId) {
        const features = (pkg.features || []).filter((_, i) => i !== index);
        return { ...pkg, features };
      }
      return pkg;
    });
    setFormData({ ...formData, packages: updatedPackages });
  };

  const handleSave = async () => {
    try {
      const { newAdmin, ...settingsData } = formData;
      const dataToSave = {
        ...settingsData,
        smtpPort: formData.smtpPort ? parseInt(formData.smtpPort) : undefined,
      };
      await updateSettings.mutateAsync(dataToSave);
      toast({ title: "Settings saved", description: "Pricing and configuration updated." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error saving settings", description: error.message });
    }
  };

  const handleInviteAdmin = async () => {
    if (!formData.newAdmin.username || !formData.newAdmin.password || !formData.newAdmin.fullName) {
      toast({ variant: "destructive", title: "Missing fields", description: "Please fill in all admin details." });
      return;
    }

    try {
      await createUser.mutateAsync({
        ...formData.newAdmin,
        email: `${formData.newAdmin.username}@proresumes.ca`,
        role: "admin"
      });
      toast({ title: "Admin Created", description: `${formData.newAdmin.fullName} is now an administrator.` });
      setFormData({ ...formData, newAdmin: { username: "", password: "", fullName: "" } });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error creating admin", description: error.message });
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 max-w-4xl pb-20">
      {/* SECTION 1: PACKAGE PRICING & FEATURES */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardHeader>
          <CardTitle>Package Management</CardTitle>
          <CardDescription>Control your pricing and feature lists</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {formData.packages.map((pkg) => (
            <div key={pkg.id} className="space-y-4 border-b pb-6 last:border-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold">{pkg.name} Price ($)</Label>
                  <Input 
                    type="number" 
                    value={pkg.price} 
                    onChange={(e) => handlePriceChange(pkg.id, e.target.value)}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label className="font-bold">Display Description</Label>
                  <Input 
                    value={pkg.description} 
                    onChange={(e) => handleDescriptionChange(pkg.id, e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Features Included</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(pkg.features || []).map((feature, idx) => (
                    <Badge key={idx} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
                      {feature}
                      <button onClick={() => removeFeature(pkg.id, idx)} className="hover:text-destructive">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Add a feature (e.g. 24h Delivery)" 
                    value={newFeature[pkg.id] || ""}
                    onChange={(e) => setNewFeature({ ...newFeature, [pkg.id]: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && addFeature(pkg.id)}
                  />
                  <Button size="sm" variant="outline" onClick={() => addFeature(pkg.id)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* SECTION 2: ADMIN USER MANAGEMENT */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle>Admin User Management</CardTitle>
          <CardDescription>Create additional accounts with administrative access</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input 
                  placeholder="John Doe"
                  value={formData.newAdmin.fullName}
                  onChange={(e) => setFormData({...formData, newAdmin: {...formData.newAdmin, fullName: e.target.value}})}
                />
              </div>
              <div className="space-y-2">
                <Label>Username</Label>
                <Input 
                  placeholder="johndoe_admin"
                  value={formData.newAdmin.username}
                  onChange={(e) => setFormData({...formData, newAdmin: {...formData.newAdmin, username: e.target.value}})}
                />
              </div>
           </div>
           <div className="space-y-2">
              <Label>Password</Label>
              <Input 
                type="password"
                value={formData.newAdmin.password}
                onChange={(e) => setFormData({...formData, newAdmin: {...formData.newAdmin, password: e.target.value}})}
              />
           </div>
           <Button 
             variant="secondary" 
             className="w-full" 
             onClick={handleInviteAdmin}
             disabled={createUser.isPending}
           >
             {createUser.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
             Invite Administrator
           </Button>
        </CardContent>
      </Card>

      {/* SECTION 3: BUSINESS & NOTIFICATIONS */}
      <Card>
        <CardHeader>
          <CardTitle>Business Configuration</CardTitle>
          <CardDescription>Contact info and notification settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Business Email</Label>
              <Input value={formData.businessEmail} onChange={e => setFormData({...formData, businessEmail: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Business Phone</Label>
              <Input value={formData.businessPhone} onChange={e => setFormData({...formData, businessPhone: e.target.value})} />
            </div>
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label>FOMO Popups</Label>
              <p className="text-xs text-muted-foreground">Show recent purchase notifications to visitors</p>
            </div>
            <Switch checked={formData.fomoEnabled} onCheckedChange={v => setFormData({...formData, fomoEnabled: v})} />
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label>Live Chat Widget</Label>
              <p className="text-xs text-muted-foreground">Enable the chat bubble on the landing page</p>
            </div>
            <Switch checked={formData.chatWidgetEnabled} onCheckedChange={v => setFormData({...formData, chatWidgetEnabled: v})} />
          </div>
        </CardContent>
      </Card>

      <Button 
        onClick={handleSave} 
        className="w-full sticky bottom-4 shadow-lg" 
        disabled={updateSettings.isPending}
      >
        {updateSettings.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
        Save All Changes
      </Button>
    </div>
  );
}
