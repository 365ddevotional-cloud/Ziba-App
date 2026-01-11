import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCountry, countries } from "@/lib/country";

export function CountrySelector() {
  const { country, setCountry } = useCountry();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" data-testid="button-country-selector">
          <Globe className="h-4 w-4" />
          <span>{country.name}</span>
          <span className="text-muted-foreground">({country.symbol})</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {countries.map((c) => (
          <DropdownMenuItem
            key={c.code}
            onClick={() => setCountry(c)}
            className={country.code === c.code ? "bg-accent" : ""}
            data-testid={`country-option-${c.code}`}
          >
            <span className="flex-1">{c.name}</span>
            <span className="text-muted-foreground ml-2">{c.symbol}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
