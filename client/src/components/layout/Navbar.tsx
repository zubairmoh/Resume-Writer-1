import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/store";

export function Navbar() {
  const { user, logout } = useApp();
  const location = useLocation();

  if (location.pathname.includes("/admin") || location.pathname.includes("/dashboard")) {
    return null; // Don't show main navbar on dashboard pages, they'll have their own or sidebar
  }

  return (
    <nav className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold font-display tracking-tight text-primary">
          ResumePro
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to={user.role === "admin" ? "/admin" : "/dashboard"}>
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Button onClick={logout} variant="outline">Logout</Button>
            </>
          ) : (
            <Link to="/login">
              <Button>Client Login</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
