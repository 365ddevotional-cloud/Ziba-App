import { Link, useLocation } from "wouter";
import { Menu, X, Users, Car, MapPin, Shield, UserCog, LogIn, LogOut } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { useAuth } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { href: "/users", label: "Users", icon: Users },
  { href: "/drivers", label: "Drivers", icon: Car },
  { href: "/directors", label: "Directors", icon: UserCog },
  { href: "/rides", label: "Rides", icon: MapPin },
  { href: "/admin", label: "Admin", icon: Shield },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, logout, isLoading } = useAuth();

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-6xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">Z</span>
          </div>
          <span className="text-xl font-bold text-foreground" data-testid="text-logo">Ziba</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location === link.href || location.startsWith(link.href + "/");
            return (
              <Link key={link.href} href={link.href}>
                <Button 
                  variant={isActive ? "secondary" : "ghost"} 
                  size="sm"
                  data-testid={`nav-${link.label.toLowerCase()}`}
                >
                  <Icon className="h-4 w-4 mr-1" />
                  {link.label}
                </Button>
              </Link>
            );
          })}
          <div className="ml-2 flex items-center gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" data-testid="button-user-menu">
                    {user.email}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem disabled className="text-muted-foreground">
                    Logged in as {user.role}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()} data-testid="button-logout">
                    <LogOut className="h-4 w-4 mr-2" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" data-testid="button-login-menu">
                    <LogIn className="h-4 w-4 mr-1" />
                    Log In
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/login" data-testid="link-user-login">
                      <Users className="h-4 w-4 mr-2" />
                      User Login
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/director/login" data-testid="link-director-login">
                      <UserCog className="h-4 w-4 mr-2" />
                      Director Login
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/login" data-testid="link-admin-login">
                      <Shield className="h-4 w-4 mr-2" />
                      Admin Login
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <ThemeToggle />
          </div>
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
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location === link.href || location.startsWith(link.href + "/");
            return (
              <Link 
                key={link.href} 
                href={link.href} 
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button 
                  variant={isActive ? "secondary" : "ghost"} 
                  className="w-full justify-start"
                  data-testid={`nav-mobile-${link.label.toLowerCase()}`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {link.label}
                </Button>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
