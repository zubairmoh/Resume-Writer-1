import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/lib/store";
import { toast } from "@/hooks/use-toast";

export function AdminSettings() {
  const { settings, updateSettings } = useApp();
  const [formData, setFormData] = useState(settings);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateSettings(formData);
    setSaved(true);
    toast({
      title: "Settings saved",
      description: "Your configuration has been updated.",
    });
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Stripe Integration */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Gateways</CardTitle>
          <CardDescription>Configure Stripe and PayPal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="stripe">Stripe API Key (Publishable)</Label>
            <Input
              id="stripe"
              placeholder="pk_test_..."
              value={formData.stripeKey}
              onChange={(e) => setFormData({ ...formData, stripeKey: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="paypal-client">PayPal Client ID</Label>
            <Input
              id="paypal-client"
              placeholder="Sb-..."
              onChange={() => {}} // Mock
            />
          </div>
           <div className="space-y-2">
            <Label htmlFor="paypal-secret">PayPal Secret</Label>
            <Input
              id="paypal-secret"
              type="password"
              placeholder="Ep-..."
              onChange={() => {}} // Mock
            />
          </div>
        </CardContent>
      </Card>

      {/* Email Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Email Configuration</CardTitle>
          <CardDescription>Set up email notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email-from">From Email Address</Label>
            <Input
              id="email-from"
              type="email"
              value={formData.emailFrom}
              onChange={(e) => setFormData({ ...formData, emailFrom: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="provider">Email Provider</Label>
            <Select value={formData.emailProvider} onValueChange={(value: any) => setFormData({ ...formData, emailProvider: value })}>
              <SelectTrigger id="provider">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gmail">Gmail</SelectItem>
                <SelectItem value="sendgrid">SendGrid</SelectItem>
                <SelectItem value="mailgun">Mailgun</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Business Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Business Settings</CardTitle>
          <CardDescription>Configure revision and service terms</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="revision-days">Revision Period (Days)</Label>
            <Input
              id="revision-days"
              type="number"
              min="7"
              max="365"
              value={formData.revisionDays}
              onChange={(e) => setFormData({ ...formData, revisionDays: parseInt(e.target.value) })}
            />
            <p className="text-xs text-muted-foreground">
              How many days clients can request revisions after completion
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Security & Spam */}
      <Card>
        <CardHeader>
          <CardTitle>Security & Spam Filtering</CardTitle>
          <CardDescription>Protect your platform from abuse</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <p className="font-medium text-sm">Keyword Filtering</p>
              <p className="text-xs text-muted-foreground">Block messages with banned words</p>
            </div>
            <Button size="sm" variant="outline">Configure</Button>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <p className="font-medium text-sm">IP Rate Limiting</p>
              <p className="text-xs text-muted-foreground">Prevent DOS attacks and spam</p>
            </div>
            <Button size="sm" variant="outline">Enabled</Button>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <p className="font-medium text-sm">reCAPTCHA v3</p>
              <p className="text-xs text-muted-foreground">Invisible bot protection on forms</p>
            </div>
            <Button size="sm" variant="outline">Enabled</Button>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Features */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Features</CardTitle>
          <CardDescription>Optional integrations and settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <p className="font-medium text-sm">reCAPTCHA Protection</p>
              <p className="text-xs text-muted-foreground">Prevent spam signups</p>
            </div>
            <Button size="sm" variant="outline">Enable</Button>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <p className="font-medium text-sm">Webhook Notifications</p>
              <p className="text-xs text-muted-foreground">Receive updates via webhooks</p>
            </div>
            <Button size="sm" variant="outline">Configure</Button>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <p className="font-medium text-sm">SMS Notifications</p>
              <p className="text-xs text-muted-foreground">Send SMS to clients (Twilio)</p>
            </div>
            <Button size="sm" variant="outline">Setup</Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button onClick={handleSave} className="w-full" size="lg">
        {saved ? "✓ Settings Saved" : "Save Changes"}
      </Button>
    </div>
  );
}
