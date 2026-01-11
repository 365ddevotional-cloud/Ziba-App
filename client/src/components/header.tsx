import { Link, useLocation } from "wouter";
import { Menu, X, Users, Car, MapPin, Shield } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";

const navLinks = [
  { href: "/users", label: "Users", icon: Users },
  { href: "/drivers", label: "Drivers", icon: Car },
  { href: "/rides", label: "Rides", icon: MapPin },
  { href: "/admin", label: "Admin", icon: Shield },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();

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
          <div className="ml-2">
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
