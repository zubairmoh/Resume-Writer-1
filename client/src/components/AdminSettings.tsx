import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAdminSettings, useUpdateAdminSettings } from "@/lib/hooks";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export function AdminSettings() {
  const { data: settings, isLoading } = useAdminSettings();
  const updateSettings = useUpdateAdminSettings();
  
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
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        stripePublishableKey: settings.stripePublishableKey || "",
        stripeSecretKey: settings.stripeSecretKey || "",
        paypalClientId: settings.paypalClientId || "",
        paypalClientSecret: settings.paypalClientSecret || "",
        businessEmail: settings.businessEmail || "",
        businessPhone: settings.businessPhone || "",
        businessAddress: settings.businessAddress || "",
        fomoEnabled: settings.fomoEnabled ?? true,
        chatWidgetEnabled: settings.chatWidgetEnabled ?? true,
        notificationEmail: settings.notificationEmail || "",
        smtpHost: settings.smtpHost || "",
        smtpPort: settings.smtpPort?.toString() || "",
        smtpUser: settings.smtpUser || "",
        smtpPass: settings.smtpPass || "",
        browseNotificationsEnabled: settings.browseNotificationsEnabled ?? false,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      const dataToSave = {
        ...formData,
        smtpPort: formData.smtpPort ? parseInt(formData.smtpPort) : undefined,
      };
      await updateSettings.mutateAsync(dataToSave);
      toast({
        title: "Settings saved",
        description: "Your configuration has been updated.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error saving settings",
        description: error.message,
      });
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Payment Gateways</CardTitle>
          <CardDescription>Configure Stripe and PayPal for payment processing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="stripe-pub">Stripe Publishable Key</Label>
            <Input
              id="stripe-pub"
              placeholder="pk_test_..."
              value={formData.stripePublishableKey}
              onChange={(e) => setFormData({ ...formData, stripePublishableKey: e.target.value })}
              data-testid="input-stripe-publishable"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stripe-secret">Stripe Secret Key</Label>
            <Input
              id="stripe-secret"
              type="password"
              placeholder="sk_test_..."
              value={formData.stripeSecretKey}
              onChange={(e) => setFormData({ ...formData, stripeSecretKey: e.target.value })}
              data-testid="input-stripe-secret"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paypal-client">PayPal Client ID</Label>
            <Input
              id="paypal-client"
              placeholder="Sb-..."
              value={formData.paypalClientId}
              onChange={(e) => setFormData({ ...formData, paypalClientId: e.target.value })}
              data-testid="input-paypal-client"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paypal-secret">PayPal Secret</Label>
            <Input
              id="paypal-secret"
              type="password"
              placeholder="Ep-..."
              value={formData.paypalClientSecret}
              onChange={(e) => setFormData({ ...formData, paypalClientSecret: e.target.value })}
              data-testid="input-paypal-secret"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>Your company contact details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="business-email">Business Email</Label>
            <Input
              id="business-email"
              type="email"
              placeholder="contact@proresumes.ca"
              value={formData.businessEmail}
              onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
              data-testid="input-business-email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="business-phone">Business Phone</Label>
            <Input
              id="business-phone"
              placeholder="+1 (555) 123-4567"
              value={formData.businessPhone}
              onChange={(e) => setFormData({ ...formData, businessPhone: e.target.value })}
              data-testid="input-business-phone"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="business-address">Business Address</Label>
            <Input
              id="business-address"
              placeholder="123 Main St, Toronto, ON"
              value={formData.businessAddress}
              onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
              data-testid="input-business-address"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Website Features</CardTitle>
          <CardDescription>Toggle site features on or off</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>FOMO Popup</Label>
              <p className="text-sm text-muted-foreground">Show recent purchase notifications</p>
            </div>
            <Switch
              checked={formData.fomoEnabled}
              onCheckedChange={(checked) => setFormData({ ...formData, fomoEnabled: checked })}
              data-testid="switch-fomo"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Live Chat Widget</Label>
              <p className="text-sm text-muted-foreground">Enable chat widget for visitors</p>
            </div>
            <Switch
              checked={formData.chatWidgetEnabled}
              onCheckedChange={(checked) => setFormData({ ...formData, chatWidgetEnabled: checked })}
              data-testid="switch-chat"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>Configure SMTP settings for email notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notification-email">Notification Email</Label>
            <Input
              id="notification-email"
              type="email"
              placeholder="admin@proresumes.ca"
              value={formData.notificationEmail}
              onChange={(e) => setFormData({ ...formData, notificationEmail: e.target.value })}
              data-testid="input-notification-email"
            />
            <p className="text-xs text-muted-foreground">Receive notifications about new orders and visitors</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtp-host">SMTP Host</Label>
              <Input
                id="smtp-host"
                placeholder="smtp.gmail.com"
                value={formData.smtpHost}
                onChange={(e) => setFormData({ ...formData, smtpHost: e.target.value })}
                data-testid="input-smtp-host"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-port">SMTP Port</Label>
              <Input
                id="smtp-port"
                placeholder="587"
                value={formData.smtpPort}
                onChange={(e) => setFormData({ ...formData, smtpPort: e.target.value })}
                data-testid="input-smtp-port"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtp-user">SMTP Username</Label>
              <Input
                id="smtp-user"
                placeholder="your-email@gmail.com"
                value={formData.smtpUser}
                onChange={(e) => setFormData({ ...formData, smtpUser: e.target.value })}
                data-testid="input-smtp-user"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-pass">SMTP Password</Label>
              <Input
                id="smtp-pass"
                type="password"
                placeholder="App password"
                value={formData.smtpPass}
                onChange={(e) => setFormData({ ...formData, smtpPass: e.target.value })}
                data-testid="input-smtp-pass"
              />
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="space-y-0.5">
              <Label>Browse Notifications</Label>
              <p className="text-sm text-muted-foreground">Get notified when visitors browse your site</p>
            </div>
            <Switch
              checked={formData.browseNotificationsEnabled}
              onCheckedChange={(checked) => setFormData({ ...formData, browseNotificationsEnabled: checked })}
              data-testid="switch-browse-notifications"
            />
          </div>
        </CardContent>
      </Card>

      <Button 
        onClick={handleSave} 
        className="w-full" 
        disabled={updateSettings.isPending}
        data-testid="button-save-settings"
      >
        {updateSettings.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        Save Settings
      </Button>
    </div>
  );
}
