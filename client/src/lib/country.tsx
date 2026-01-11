import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Country {
  code: string;
  name: string;
  currency: string;
  symbol: string;
  locale: string;
}

export const countries: Country[] = [
  { code: "NG", name: "Nigeria", currency: "NGN", symbol: "₦", locale: "en-NG" },
  { code: "GH", name: "Ghana", currency: "GHS", symbol: "₵", locale: "en-GH" },
  { code: "LR", name: "Liberia", currency: "LRD", symbol: "$", locale: "en-LR" },
  { code: "ZA", name: "South Africa", currency: "ZAR", symbol: "R", locale: "en-ZA" },
  { code: "GB", name: "United Kingdom", currency: "GBP", symbol: "£", locale: "en-GB" },
  { code: "US", name: "United States", currency: "USD", symbol: "$", locale: "en-US" },
  { code: "MX", name: "Mexico", currency: "MXN", symbol: "$", locale: "es-MX" },
  { code: "FR", name: "France", currency: "EUR", symbol: "€", locale: "fr-FR" },
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
    try {
      return new Intl.NumberFormat(country.locale, {
        style: "currency",
        currency: country.currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch {
      return `${country.symbol}${amount.toLocaleString()}`;
    }
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
