import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Loader2, Calculator, ArrowLeft, Save, Globe, DollarSign, Car, Clock, Percent } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/header";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { countries, useCountry } from "@/lib/country";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FareConfig {
  id: string;
  countryCode: string;
  countryName: string;
  currency: string;
  currencySymbol: string;
  baseFare: number;
  pricePerKm: number;
  pricePerMinute: number;
  minimumFare: number;
  driverCommission: number;
  platformCommission: number;
  updatedAt: string;
  updatedBy: string | null;
}

const defaultFareConfigs: Record<string, Partial<FareConfig>> = {
  NG: { baseFare: 500, pricePerKm: 120, pricePerMinute: 30, minimumFare: 300 },
  GH: { baseFare: 8, pricePerKm: 2, pricePerMinute: 0.5, minimumFare: 5 },
  LR: { baseFare: 5, pricePerKm: 1.5, pricePerMinute: 0.3, minimumFare: 3 },
  ZA: { baseFare: 25, pricePerKm: 12, pricePerMinute: 2, minimumFare: 20 },
  GB: { baseFare: 3, pricePerKm: 1.5, pricePerMinute: 0.25, minimumFare: 5 },
  US: { baseFare: 2.5, pricePerKm: 1.2, pricePerMinute: 0.2, minimumFare: 5 },
  MX: { baseFare: 25, pricePerKm: 8, pricePerMinute: 1.5, minimumFare: 20 },
  FR: { baseFare: 3, pricePerKm: 1.5, pricePerMinute: 0.25, minimumFare: 5 },
};

function adminApiRequest(method: string, url: string, body?: any) {
  const options: any = { method };
  if (body !== undefined) {
    options.body = JSON.stringify({ ...body, previewAdmin: true });
    options.headers = { "Content-Type": "application/json", "X-Preview-Admin": "true" };
  } else {
    options.headers = { "X-Preview-Admin": "true" };
  }
  return fetch(url, options).then(async (res) => {
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "Request failed" }));
      throw new Error(err.message);
    }
    return res.json();
  });
}

export default function AdminFaresPage() {
  const { toast } = useToast();
  const { country: selectedGlobalCountry } = useCountry();
  const [selectedCountryCode, setSelectedCountryCode] = useState(selectedGlobalCountry.code);
  
  const { data: fareConfigs, isLoading } = useQuery<FareConfig[]>({
    queryKey: ["/api/fare-configs"],
    queryFn: async () => {
      const res = await fetch("/api/fare-configs", {
        headers: { "X-Preview-Admin": "true" },
      });
      if (!res.ok) throw new Error("Failed to fetch fare configs");
      return res.json();
    },
  });

  const selectedCountry = countries.find(c => c.code === selectedCountryCode) || countries[0];
  const existingConfig = fareConfigs?.find(fc => fc.countryCode === selectedCountryCode);
  const defaults = defaultFareConfigs[selectedCountryCode] || defaultFareConfigs.NG;

  const [formData, setFormData] = useState({
    baseFare: defaults.baseFare || 500,
    pricePerKm: defaults.pricePerKm || 120,
    pricePerMinute: defaults.pricePerMinute || 30,
    minimumFare: defaults.minimumFare || 300,
    driverCommission: 0.85,
    platformCommission: 0.15,
  });

  useEffect(() => {
    if (existingConfig) {
      setFormData({
        baseFare: existingConfig.baseFare,
        pricePerKm: existingConfig.pricePerKm,
        pricePerMinute: existingConfig.pricePerMinute,
        minimumFare: existingConfig.minimumFare,
        driverCommission: existingConfig.driverCommission,
        platformCommission: existingConfig.platformCommission,
      });
    } else {
      const defaults = defaultFareConfigs[selectedCountryCode] || defaultFareConfigs.NG;
      setFormData({
        baseFare: defaults.baseFare || 500,
        pricePerKm: defaults.pricePerKm || 120,
        pricePerMinute: defaults.pricePerMinute || 30,
        minimumFare: defaults.minimumFare || 300,
        driverCommission: 0.85,
        platformCommission: 0.15,
      });
    }
  }, [selectedCountryCode, existingConfig]);

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return adminApiRequest("POST", "/api/fare-configs", {
        countryCode: selectedCountryCode,
        countryName: selectedCountry.name,
        currency: selectedCountry.currency,
        currencySymbol: selectedCountry.symbol,
        ...data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fare-configs"] });
      toast({ title: "Fare settings saved", description: `Fare configuration for ${selectedCountry.name} has been updated.` });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleSave = () => {
    if (formData.driverCommission + formData.platformCommission !== 1) {
      toast({ 
        title: "Invalid commission split", 
        description: "Driver and platform commissions must add up to 100%", 
        variant: "destructive" 
      });
      return;
    }
    saveMutation.mutate(formData);
  };

  const formatLocalCurrency = (amount: number) => {
    try {
      return new Intl.NumberFormat(selectedCountry.locale, {
        style: "currency",
        currency: selectedCountry.currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch {
      return `${selectedCountry.symbol}${amount.toLocaleString()}`;
    }
  };

  const calculateFarePreview = (distanceKm: number, durationMinutes: number) => {
    const rawFare = formData.baseFare + (distanceKm * formData.pricePerKm) + (durationMinutes * formData.pricePerMinute);
    const fare = Math.max(rawFare, formData.minimumFare);
    const driverEarnings = fare * formData.driverCommission;
    const platformEarnings = fare * formData.platformCommission;
    return { fare, driverEarnings, platformEarnings };
  };

  const preview = calculateFarePreview(10, 20);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Calculator className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold" data-testid="text-page-title">Admin – Fare Settings</h1>
          </div>
          <p className="text-muted-foreground">Configure how rides are priced for each country</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-primary" />
                      <CardTitle>Select Country</CardTitle>
                    </div>
                    <Select value={selectedCountryCode} onValueChange={setSelectedCountryCode}>
                      <SelectTrigger className="w-[200px]" data-testid="select-country">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((c) => (
                          <SelectItem key={c.code} value={c.code} data-testid={`option-country-${c.code}`}>
                            {c.name} ({c.symbol})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <CardDescription>
                    {existingConfig 
                      ? `Last updated: ${new Date(existingConfig.updatedAt).toLocaleString()}${existingConfig.updatedBy ? ` by ${existingConfig.updatedBy}` : ""}`
                      : "No configuration set. Using default values."
                    }
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <CardTitle>Pricing Configuration</CardTitle>
                  </div>
                  <CardDescription>Set the fare structure for {selectedCountry.name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="baseFare">Base Fare ({selectedCountry.symbol})</Label>
                      <Input
                        id="baseFare"
                        type="number"
                        step="0.01"
                        value={formData.baseFare}
                        onChange={(e) => setFormData(prev => ({ ...prev, baseFare: parseFloat(e.target.value) || 0 }))}
                        data-testid="input-base-fare"
                      />
                      <p className="text-xs text-muted-foreground">Starting fare for every ride</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pricePerKm">Price per KM ({selectedCountry.symbol})</Label>
                      <Input
                        id="pricePerKm"
                        type="number"
                        step="0.01"
                        value={formData.pricePerKm}
                        onChange={(e) => setFormData(prev => ({ ...prev, pricePerKm: parseFloat(e.target.value) || 0 }))}
                        data-testid="input-price-per-km"
                      />
                      <p className="text-xs text-muted-foreground">Rate per kilometer traveled</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pricePerMinute">Price per Minute ({selectedCountry.symbol})</Label>
                      <Input
                        id="pricePerMinute"
                        type="number"
                        step="0.01"
                        value={formData.pricePerMinute}
                        onChange={(e) => setFormData(prev => ({ ...prev, pricePerMinute: parseFloat(e.target.value) || 0 }))}
                        data-testid="input-price-per-minute"
                      />
                      <p className="text-xs text-muted-foreground">Rate per minute of ride duration</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="minimumFare">Minimum Fare ({selectedCountry.symbol})</Label>
                      <Input
                        id="minimumFare"
                        type="number"
                        step="0.01"
                        value={formData.minimumFare}
                        onChange={(e) => setFormData(prev => ({ ...prev, minimumFare: parseFloat(e.target.value) || 0 }))}
                        data-testid="input-minimum-fare"
                      />
                      <p className="text-xs text-muted-foreground">Minimum amount charged for any ride</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Percent className="h-5 w-5 text-primary" />
                    <CardTitle>Commission Split</CardTitle>
                  </div>
                  <CardDescription>How the fare is divided between driver and platform</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="driverCommission">Driver Commission (%)</Label>
                      <Input
                        id="driverCommission"
                        type="number"
                        step="1"
                        min="0"
                        max="100"
                        value={Math.round(formData.driverCommission * 100)}
                        onChange={(e) => {
                          const driver = (parseFloat(e.target.value) || 0) / 100;
                          setFormData(prev => ({ 
                            ...prev, 
                            driverCommission: driver,
                            platformCommission: 1 - driver
                          }));
                        }}
                        data-testid="input-driver-commission"
                      />
                      <p className="text-xs text-muted-foreground">Percentage driver keeps from fare</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="platformCommission">Platform Commission (%)</Label>
                      <Input
                        id="platformCommission"
                        type="number"
                        step="1"
                        min="0"
                        max="100"
                        value={Math.round(formData.platformCommission * 100)}
                        onChange={(e) => {
                          const platform = (parseFloat(e.target.value) || 0) / 100;
                          setFormData(prev => ({ 
                            ...prev, 
                            platformCommission: platform,
                            driverCommission: 1 - platform
                          }));
                        }}
                        data-testid="input-platform-commission"
                      />
                      <p className="text-xs text-muted-foreground">Percentage Ziba takes as fee</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button 
                onClick={handleSave} 
                disabled={saveMutation.isPending}
                className="w-full md:w-auto"
                data-testid="button-save-fares"
              >
                {saveMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Fare Settings
              </Button>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-primary" />
                    <CardTitle>Live Fare Preview</CardTitle>
                  </div>
                  <CardDescription>Estimated fare for a sample ride</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>10 KM / 20 minutes</span>
                    </div>
                    <div className="pt-2 border-t space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Rider Pays</span>
                        <span className="text-xl font-bold" data-testid="text-preview-fare">
                          {formatLocalCurrency(preview.fare)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Driver Earns</span>
                        <span className="font-medium text-green-500" data-testid="text-preview-driver">
                          {formatLocalCurrency(preview.driverEarnings)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Platform Fee</span>
                        <span className="font-medium text-blue-500" data-testid="text-preview-platform">
                          {formatLocalCurrency(preview.platformEarnings)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <p className="font-medium">Fare Formula:</p>
                    <p className="font-mono text-xs bg-muted p-2 rounded">
                      base + (km × rate) + (min × rate)
                    </p>
                    <p className="mt-2">
                      = {formatLocalCurrency(formData.baseFare)} + (10 × {formatLocalCurrency(formData.pricePerKm)}) + (20 × {formatLocalCurrency(formData.pricePerMinute)})
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Configured Countries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {fareConfigs && fareConfigs.length > 0 ? (
                      fareConfigs.map((fc) => (
                        <div 
                          key={fc.countryCode} 
                          className={`flex items-center justify-between p-2 rounded text-sm ${fc.countryCode === selectedCountryCode ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50'}`}
                        >
                          <span>{fc.countryName}</span>
                          <span className="font-medium">{fc.currencySymbol}{fc.baseFare} base</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No countries configured yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
