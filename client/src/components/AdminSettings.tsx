import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAdminSettings, useUpdateAdminSettings, useCreateUser } from "@/lib/hooks";
import { toast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2 } from "lucide-react";

export function AdminSettings() {
  const { data: settings, isLoading } = useAdminSettings();
  const updateSettings = useUpdateAdminSettings();
  const createUser = useCreateUser();
  
  const [formData, setFormData] = useState({
    // ... your existing fields ...
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
    
    // NEW FIELDS FOR PRICING
    packages: [
      { id: "basic", name: "Basic", price: 99, description: "Professional Resume" },
      { id: "pro", name: "Professional", price: 199, description: "Resume + Cover Letter" },
      { id: "exec", name: "Executive", price: 299, description: "Full Career Suite" }
    ],
    // NEW FIELDS FOR ADMIN MANAGEMENT
    newAdmin: { username: "", password: "", fullName: "" }
  });

  useEffect(() => {
    if (settings) {
      setFormData(prev => ({
        ...prev,
        ...settings,
        smtpPort: settings.smtpPort?.toString() || "",
        packages: settings.packages || prev.packages,
      }));
    }
  }, [settings]);

  const handlePriceChange = (id: string, newPrice: string) => {
    const updatedPackages = formData.packages.map(pkg => 
      pkg.id === id ? { ...pkg, price: parseInt(newPrice) || 0 } : pkg
    );
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
        email: `${formData.newAdmin.username}@proresumes.ca`, // Placeholder email
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
    <div className="space-y-6 max-w-3xl pb-20">
      {/* SECTION 1: PACKAGE PRICING */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardHeader>
          <CardTitle>Package Pricing</CardTitle>
          <CardDescription>Update the prices shown on your landing page</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.packages.map((pkg) => (
            <div key={pkg.id} className="grid grid-cols-3 gap-4 items-end border-b pb-4 last:border-0">
              <div className="space-y-2">
                <Label>{pkg.name} Package ($)</Label>
                <Input 
                  type="number" 
                  value={pkg.price} 
                  onChange={(e) => handlePriceChange(pkg.id, e.target.value)}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Description</Label>
                <Input value={pkg.description} readOnly className="bg-slate-100" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* SECTION 2: ADD NEW ADMINS */}
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

      {/* REMAINDER OF YOUR EXISTING CARDS (Payment, Business Info, etc.) */}
      {/* ... keep the rest of your original code here ... */}

      <Button 
        onClick={handleSave} 
        className="w-full sticky bottom-4 shadow-lg" 
        disabled={updateSettings.isPending}
      >
        {updateSettings.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        Save All Changes
      </Button>
    </div>
  );
}
