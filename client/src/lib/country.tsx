import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Country {
  code: string;
  name: string;
  currency: string;
  symbol: string;
}

export const countries: Country[] = [
  { code: "NG", name: "Nigeria", currency: "NGN", symbol: "₦" },
  { code: "GH", name: "Ghana", currency: "GHS", symbol: "₵" },
  { code: "LR", name: "Liberia", currency: "LRD", symbol: "$" },
  { code: "ZA", name: "South Africa", currency: "ZAR", symbol: "R" },
  { code: "GB", name: "United Kingdom", currency: "GBP", symbol: "£" },
  { code: "US", name: "United States", currency: "USD", symbol: "$" },
  { code: "MX", name: "Mexico", currency: "MXN", symbol: "MX$" },
  { code: "FR", name: "France", currency: "EUR", symbol: "€" },
];

const STORAGE_KEY = "ziba-country";

interface CountryContextType {
  country: Country;
  setCountry: (country: Country) => void;
  formatCurrency: (amount: number) => string;
}

const CountryContext = createContext<CountryContextType | undefined>(undefined);

export function CountryProvider({ children }: { children: ReactNode }) {
  const [country, setCountryState] = useState<Country>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const found = countries.find((c) => c.code === parsed.code);
          if (found) return found;
        } catch {}
      }
    }
    return countries[0];
  });

  const setCountry = (newCountry: Country) => {
    setCountryState(newCountry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newCountry));
  };

  const formatCurrency = (amount: number): string => {
    return `${country.symbol}${amount.toLocaleString()}`;
  };

  return (
    <CountryContext.Provider value={{ country, setCountry, formatCurrency }}>
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry() {
  const context = useContext(CountryContext);
  if (context === undefined) {
    throw new Error("useCountry must be used within a CountryProvider");
  }
  return context;
}
