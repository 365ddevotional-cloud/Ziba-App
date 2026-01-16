import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Users, Plus, Car, Phone, Mail, FileText, CheckCircle, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TripPassenger {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  notes?: string;
  createdAt: string;
}

export default function CoordinatorHome() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPassengerDialog, setShowPassengerDialog] = useState(false);
  const [showBookRideDialog, setShowBookRideDialog] = useState(false);
  const [passengerForm, setPassengerForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    notes: "",
  });
  const [rideForm, setRideForm] = useState({
    passengerId: "",
    pickupLocation: "",
    dropoffLocation: "",
    fareEstimate: "",
  });

  // Fetch passengers
  const { data: passengers = [], isLoading: passengersLoading } = useQuery<TripPassenger[]>({
    queryKey: ["/api/coordinator/passengers"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/coordinator/passengers");
      return res.json();
    },
  });

  // Fetch user info to check phone verification
  const { data: userInfo } = useQuery({
    queryKey: ["/api/rider/me"],
    queryFn: async () => {
      const res = await fetch("/api/rider/me", { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
  });

  // Create passenger mutation
  const createPassengerMutation = useMutation({
    mutationFn: async (data: typeof passengerForm) => {
      const res = await apiRequest("POST", "/api/coordinator/passengers", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coordinator/passengers"] });
      setShowPassengerDialog(false);
      setPassengerForm({ fullName: "", phone: "", email: "", notes: "" });
      toast({
        title: "Passenger created",
        description: "New passenger has been added successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create passenger",
        variant: "destructive",
      });
    },
  });

  // Book ride mutation
  const bookRideMutation = useMutation({
    mutationFn: async (data: typeof rideForm) => {
      const res = await apiRequest("POST", "/api/coordinator/request-ride", {
        pickupLocation: data.pickupLocation,
        dropoffLocation: data.dropoffLocation,
        fareEstimate: data.fareEstimate ? parseFloat(data.fareEstimate) : undefined,
        passengerId: data.passengerId || undefined,
      });
      return res.json();
    },
    onSuccess: () => {
      setShowBookRideDialog(false);
      setRideForm({ passengerId: "", pickupLocation: "", dropoffLocation: "", fareEstimate: "" });
      toast({
        title: "Ride requested",
        description: "Ride has been requested successfully. Searching for driver...",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to request ride",
        variant: "destructive",
      });
    },
  });

  // Verify phone mutation
  const verifyPhoneMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/verify-phone", {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rider/me"] });
      toast({
        title: "Phone verified",
        description: "Your phone number has been verified.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to verify phone",
        variant: "destructive",
      });
    },
  });

  const handleCreatePassenger = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passengerForm.fullName || !passengerForm.phone) {
      toast({
        title: "Validation error",
        description: "Full name and phone are required",
        variant: "destructive",
      });
      return;
    }
    createPassengerMutation.mutate(passengerForm);
  };

  const handleBookRide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rideForm.pickupLocation || !rideForm.dropoffLocation) {
      toast({
        title: "Validation error",
        description: "Pickup and dropoff locations are required",
        variant: "destructive",
      });
      return;
    }
    bookRideMutation.mutate(rideForm);
  };

  const phoneVerified = userInfo?.phoneVerified || false;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Trip Coordinator Dashboard</h1>
          <p className="text-muted-foreground">Manage passengers and book rides</p>
        </div>

        {/* Phone verification banner */}
        {!phoneVerified && (
          <Card className="mb-6 border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium">Phone verification required</p>
                    <p className="text-sm text-muted-foreground">
                      Please verify your phone number before booking rides
                    </p>
                  </div>
                </div>
                <Button onClick={() => verifyPhoneMutation.mutate()} disabled={verifyPhoneMutation.isPending}>
                  {verifyPhoneMutation.isPending ? "Verifying..." : "Verify Phone"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Passengers Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Passengers
                  </CardTitle>
                  <CardDescription>Manage your passenger list</CardDescription>
                </div>
                <Dialog open={showPassengerDialog} onOpenChange={setShowPassengerDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Passenger
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Passenger</DialogTitle>
                      <DialogDescription>Enter passenger details</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreatePassenger} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="passengerName">Full Name *</Label>
                        <Input
                          id="passengerName"
                          value={passengerForm.fullName}
                          onChange={(e) =>
                            setPassengerForm({ ...passengerForm, fullName: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="passengerPhone">Phone *</Label>
                        <Input
                          id="passengerPhone"
                          value={passengerForm.phone}
                          onChange={(e) =>
                            setPassengerForm({ ...passengerForm, phone: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="passengerEmail">Email (Optional)</Label>
                        <Input
                          id="passengerEmail"
                          type="email"
                          value={passengerForm.email}
                          onChange={(e) =>
                            setPassengerForm({ ...passengerForm, email: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="passengerNotes">Notes (Optional)</Label>
                        <Textarea
                          id="passengerNotes"
                          value={passengerForm.notes}
                          onChange={(e) =>
                            setPassengerForm({ ...passengerForm, notes: e.target.value })
                          }
                          rows={3}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowPassengerDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createPassengerMutation.isPending}>
                          {createPassengerMutation.isPending ? "Creating..." : "Create Passenger"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {passengersLoading ? (
                <p className="text-muted-foreground">Loading passengers...</p>
              ) : passengers.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No passengers yet. Add your first passenger to get started.
                </p>
              ) : (
                <div className="space-y-3">
                  {passengers.map((passenger) => (
                    <div
                      key={passenger.id}
                      className="flex items-start justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{passenger.fullName}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {passenger.phone}
                          </span>
                          {passenger.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {passenger.email}
                            </span>
                          )}
                        </div>
                        {passenger.notes && (
                          <p className="text-sm text-muted-foreground mt-2 flex items-start gap-1">
                            <FileText className="h-3 w-3 mt-0.5" />
                            {passenger.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Book Ride Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Book Ride
              </CardTitle>
              <CardDescription>Request a ride for a passenger</CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={showBookRideDialog} onOpenChange={setShowBookRideDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full" disabled={!phoneVerified}>
                    <Plus className="h-4 w-4 mr-2" />
                    Book New Ride
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Book Ride for Passenger</DialogTitle>
                    <DialogDescription>Enter ride details</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleBookRide} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="ridePassenger">Passenger (Optional - leave blank for yourself)</Label>
                      <Select
                        value={rideForm.passengerId}
                        onValueChange={(value) =>
                          setRideForm({ ...rideForm, passengerId: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select passenger or leave blank" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None (Book for yourself)</SelectItem>
                          {passengers.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.fullName} - {p.phone}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pickupLocation">Pickup Location *</Label>
                      <Input
                        id="pickupLocation"
                        value={rideForm.pickupLocation}
                        onChange={(e) =>
                          setRideForm({ ...rideForm, pickupLocation: e.target.value })
                        }
                        placeholder="Enter pickup address"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dropoffLocation">Dropoff Location *</Label>
                      <Input
                        id="dropoffLocation"
                        value={rideForm.dropoffLocation}
                        onChange={(e) =>
                          setRideForm({ ...rideForm, dropoffLocation: e.target.value })
                        }
                        placeholder="Enter destination address"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fareEstimate">Fare Estimate (Optional)</Label>
                      <Input
                        id="fareEstimate"
                        type="number"
                        step="0.01"
                        value={rideForm.fareEstimate}
                        onChange={(e) =>
                          setRideForm({ ...rideForm, fareEstimate: e.target.value })
                        }
                        placeholder="0.00"
                      />
                    </div>
                    {!phoneVerified && (
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-500 rounded-lg">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          Please verify your phone number first before booking rides.
                        </p>
                      </div>
                    )}
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowBookRideDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={bookRideMutation.isPending || !phoneVerified}>
                        {bookRideMutation.isPending ? "Requesting..." : "Request Ride"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
