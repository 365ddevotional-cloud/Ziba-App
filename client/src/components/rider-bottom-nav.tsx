import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Car, History, Wallet, User } from "lucide-react";

type ActiveTab = "home" | "trips" | "wallet" | "profile";

interface RiderBottomNavProps {
  activeTab?: ActiveTab;
}

export function RiderBottomNav({ activeTab = "home" }: RiderBottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-card z-50">
      <div className="flex items-center justify-around p-2">
        <Link href="/rider/home">
          <Button variant="ghost" className="flex-col h-auto py-2 px-4" data-testid="nav-home">
            <Car className={`w-5 h-5 mb-1 ${activeTab === "home" ? "text-primary" : ""}`} />
            <span className={`text-xs ${activeTab === "home" ? "text-primary" : ""}`}>Home</span>
          </Button>
        </Link>
        <Link href="/rider/trip-history">
          <Button variant="ghost" className="flex-col h-auto py-2 px-4" data-testid="nav-trips">
            <History className={`w-5 h-5 mb-1 ${activeTab === "trips" ? "text-primary" : ""}`} />
            <span className={`text-xs ${activeTab === "trips" ? "text-primary" : ""}`}>Trips</span>
          </Button>
        </Link>
        <Link href="/rider/wallet">
          <Button variant="ghost" className="flex-col h-auto py-2 px-4" data-testid="nav-wallet">
            <Wallet className={`w-5 h-5 mb-1 ${activeTab === "wallet" ? "text-primary" : ""}`} />
            <span className={`text-xs ${activeTab === "wallet" ? "text-primary" : ""}`}>Wallet</span>
          </Button>
        </Link>
        <Link href="/rider/profile">
          <Button variant="ghost" className="flex-col h-auto py-2 px-4" data-testid="nav-profile">
            <User className={`w-5 h-5 mb-1 ${activeTab === "profile" ? "text-primary" : ""}`} />
            <span className={`text-xs ${activeTab === "profile" ? "text-primary" : ""}`}>Profile</span>
          </Button>
        </Link>
      </div>
    </nav>
  );
}
