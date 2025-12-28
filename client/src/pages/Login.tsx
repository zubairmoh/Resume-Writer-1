import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle } from "lucide-react";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { login } = useApp();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    // Validation
    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    if (!captchaChecked) {
      newErrors.password = "Please verify you are not a robot";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    // Mock Login Logic
    if (email === "admin@resumepro.com") {
      login(email, "admin");
      navigate("/admin");
    } else if (email.includes("writer")) {
      login(email, "writer");
      navigate("/writer");
    } else {
      login(email, "client");
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <h1 className="text-2xl font-bold font-display text-primary">ProResumes.ca</h1>
          <p className="text-muted-foreground">Welcome back</p>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.email}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={errors.password && !password ? "border-red-500" : ""}
              />
              {errors.password && !password && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.password}
                </p>
              )}
            </div>

            {/* reCAPTCHA Mockup */}
            <div className="border rounded-lg p-4 bg-secondary/20 space-y-3">
              <div className="flex items-start gap-3">
                <Checkbox 
                  id="captcha"
                  checked={captchaChecked}
                  onCheckedChange={(checked) => {
                    setCaptchaChecked(!!checked);
                    if (checked) {
                      const newErrors = { ...errors };
                      delete newErrors.password;
                      setErrors(newErrors);
                    }
                  }}
                />
                <div className="flex-1">
                  <Label htmlFor="captcha" className="cursor-pointer font-normal">
                    <span className="font-medium">I'm not a robot</span>
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    reCAPTCHA (mock) • Privacy Policy
                  </p>
                </div>
              </div>
              {errors.password && !password && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.password}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" data-testid="button-signin">Sign In</Button>
            
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Demo Access</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 w-full">
              <Button type="button" variant="outline" size="sm" onClick={() => { setEmail("admin@resumepro.com"); setPassword("demo"); }}>
                Admin
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => { setEmail("writer@proresumes.ca"); setPassword("demo"); }}>
                Writer
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => { setEmail("user@example.com"); setPassword("demo"); }}>
                Client
              </Button>
            </div>
            
            <div className="text-xs text-center text-muted-foreground mt-2">
              <p>Click a role above to pre-fill credentials</p>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
