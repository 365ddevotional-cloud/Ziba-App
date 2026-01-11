import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { useAuth } from "@/lib/auth";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-6xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">Z</span>
          </div>
          <span className="text-xl font-bold text-foreground" data-testid="text-logo">Ziba</span>
        </Link>

        <nav className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <>
              <span className="text-muted-foreground text-sm mr-2" data-testid="text-user-name">
                Hi, {user.name}
              </span>
              <Button 
                variant="ghost" 
                onClick={handleLogout}
                data-testid="button-logout"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" data-testid="button-login">
                  Log In
                </Button>
              </Link>
              <Link href="/register">
                <Button data-testid="button-register">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </nav>

        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-background border-b border-border p-4 flex flex-col gap-2">
          {user ? (
            <>
              <span className="text-muted-foreground text-sm px-4 py-2">
                Hi, {user.name}
              </span>
              <Button 
                variant="ghost" 
                className="justify-start"
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                data-testid="button-mobile-logout"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start" data-testid="button-mobile-login">
                  Log In
                </Button>
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full" data-testid="button-mobile-register">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
