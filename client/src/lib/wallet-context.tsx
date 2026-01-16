import { createContext, useContext, useState, ReactNode } from "react";

export interface Wallet {
  ownerId: string;
  ownerType: "rider" | "driver" | "platform";
  balance: number;
}

interface WalletContextType {
  riderWallet: Wallet | null;
  driverWallets: Map<string, Wallet>;
  platformWallet: Wallet;
  getRiderWallet: () => Wallet;
  getDriverWallet: (driverId: string) => Wallet;
  updateRiderBalance: (amount: number) => void;
  updateDriverBalance: (driverId: string, amount: number) => void;
  updatePlatformBalance: (amount: number) => void;
  canAfford: (amount: number) => boolean;
}

const WalletContext = createContext<WalletContextType | null>(null);

const PLATFORM_COMMISSION_RATE = 0.1; // 10%

export function WalletProvider({ children }: { children: ReactNode }) {
  const [riderWallet, setRiderWallet] = useState<Wallet>({
    ownerId: "rider_default",
    ownerType: "rider",
    balance: 10000, // Mock initial balance
  });

  const [driverWallets, setDriverWallets] = useState<Map<string, Wallet>>(
    new Map([
      ["driver_1", { ownerId: "driver_1", ownerType: "driver", balance: 5000 }],
      ["driver_2", { ownerId: "driver_2", ownerType: "driver", balance: 3000 }],
      ["driver_3", { ownerId: "driver_3", ownerType: "driver", balance: 7500 }],
    ])
  );

  const [platformWallet, setPlatformWallet] = useState<Wallet>({
    ownerId: "platform",
    ownerType: "platform",
    balance: 0,
  });

  const getRiderWallet = () => {
    return riderWallet;
  };

  const getDriverWallet = (driverId: string) => {
    return driverWallets.get(driverId) || {
      ownerId: driverId,
      ownerType: "driver" as const,
      balance: 0,
    };
  };

  const updateRiderBalance = (amount: number) => {
    setRiderWallet((prev) => ({
      ...prev,
      balance: Math.max(0, prev.balance + amount),
    }));
  };

  const updateDriverBalance = (driverId: string, amount: number) => {
    setDriverWallets((prev) => {
      const newMap = new Map(prev);
      const current = newMap.get(driverId) || {
        ownerId: driverId,
        ownerType: "driver" as const,
        balance: 0,
      };
      newMap.set(driverId, {
        ...current,
        balance: Math.max(0, current.balance + amount),
      });
      return newMap;
    });
  };

  const updatePlatformBalance = (amount: number) => {
    setPlatformWallet((prev) => ({
      ...prev,
      balance: Math.max(0, prev.balance + amount),
    }));
  };

  const canAfford = (amount: number) => {
    return riderWallet.balance >= amount;
  };

  return (
    <WalletContext.Provider
      value={{
        riderWallet,
        driverWallets,
        platformWallet,
        getRiderWallet,
        getDriverWallet,
        updateRiderBalance,
        updateDriverBalance,
        updatePlatformBalance,
        canAfford,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return context;
}

export { PLATFORM_COMMISSION_RATE };
