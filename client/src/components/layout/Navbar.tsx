import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/store";
import { NotificationBell } from "@/components/NotificationBell";

export function Navbar() {
  const { user, logout } = useApp();
  const location = useLocation();

  // Prevents the navbar from showing on dashboard or admin routes
  if (location.pathname.includes("/admin") || location.pathname.includes("/dashboard")) {
    return null; 
  }

  return (
    <nav className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Updated Logo: Changed ResumePro to ProResumes */}
        <Link to="/" className="text-xl font-bold font-display tracking-tight text-primary">
          ProResumes
        </Link>

        {/* Updated Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How it Works</a>
          <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          <a href="#ats-scanner" className="text-muted-foreground hover:text-foreground transition-colors">Resume Review</a>
          <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
          <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</a>
        </div>

        <div className="flex items-center gap-4">
          {user && <NotificationBell />}
          {user ? (
            <>
              <Link to={user.role === "admin" ? "/admin" : "/dashboard"}>
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Button 
                onClick={() => { logout(); window.location.href = "/"; }} 
                variant="outline" 
                data-testid="button-logout"
              >
                Logout
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button className="font-semibold">Client Login</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
