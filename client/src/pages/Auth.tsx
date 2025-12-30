import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

export function AuthPage() {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [signupData, setSignupData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(loginData.username, loginData.password);
      navigate("/dashboard");
      toast({ title: "Welcome back!", description: "Successfully logged in." });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Invalid credentials",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const username = signupData.email.split("@")[0];
      await signup({
        username,
        email: signupData.email,
        password: signupData.password,
        fullName: `${signupData.firstName} ${signupData.lastName}`,
        role: "client",
      });
      navigate("/checkout");
      toast({ title: "Account created!", description: "Welcome to ProResumes.ca" });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Signup failed",
        description: error.message || "Could not create account",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (role: "admin" | "writer" | "client") => {
    setIsLoading(true);
    try {
      if (role === "admin") {
        await login("admin", "admin123");
        navigate("/admin");
      } else if (role === "writer") {
        await login("writer", "writer123");
        navigate("/writer");
      } else {
        await login("client", "client123");
        navigate("/dashboard");
      }
      toast({ title: "Quick login successful" });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Quick login failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <div className="hidden md:flex flex-1 bg-primary text-primary-foreground flex-col justify-between p-12">
        <div>
          <h1 className="text-2xl font-bold font-display mb-2">ProResumes.ca</h1>
          <p className="opacity-90">Canada's #1 Resume Writing Service</p>
        </div>
        <div className="space-y-6">
          <h2 className="text-4xl font-bold leading-tight">
            Land your dream job with a resume that stands out.
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span>ATS-Optimized Templates</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span>Expert Canadian Writers</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span>60-Day Interview Guarantee</span>
            </div>
          </div>
        </div>
        <p className="text-sm opacity-70">
          © 2025 ProResumes.ca. All rights reserved.
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-none shadow-none bg-transparent">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signup" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Username or Email</Label>
                    <Input 
                      id="email" 
                      type="text" 
                      placeholder="john@example.com" 
                      value={loginData.username}
                      onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                      required 
                      data-testid="input-username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required 
                      data-testid="input-password"
                    />
                  </div>
                  <Button className="w-full" type="submit" disabled={isLoading} data-testid="button-login">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Sign In"}
                  </Button>
                  
                  <div className="relative w-full py-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Quick Login (Demo)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 w-full">
                    <Button type="button" variant="outline" size="sm" onClick={() => handleQuickLogin("admin")} disabled={isLoading}>
                      Admin
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => handleQuickLogin("writer")} disabled={isLoading}>
                      Writer
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => handleQuickLogin("client")} disabled={isLoading}>
                      Client
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">First Name</Label>
                      <Input 
                        id="first-name" 
                        placeholder="John" 
                        value={signupData.firstName}
                        onChange={(e) => setSignupData({ ...signupData, firstName: e.target.value })}
                        required 
                        data-testid="input-firstname"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name">Last Name</Label>
                      <Input 
                        id="last-name" 
                        placeholder="Doe" 
                        value={signupData.lastName}
                        onChange={(e) => setSignupData({ ...signupData, lastName: e.target.value })}
                        required 
                        data-testid="input-lastname"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input 
                      id="signup-email" 
                      type="email" 
                      placeholder="john@example.com"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      required 
                      data-testid="input-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Create Password</Label>
                    <Input 
                      id="signup-password" 
                      type="password" 
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      required 
                      data-testid="input-create-password"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" required />
                    <label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I agree to the <a href="/terms" className="text-primary hover:underline">Terms and Conditions</a>
                    </label>
                  </div>
                  <Button className="w-full" type="submit" disabled={isLoading} data-testid="button-signup">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
