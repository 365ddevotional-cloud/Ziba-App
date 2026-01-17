import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AdminGuard } from "@/components/admin-guard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  Loader2,
  Megaphone,
  Send,
  Users,
  Car,
  Globe,
} from "lucide-react";
import { format } from "date-fns";

interface Announcement {
  id: string;
  title: string;
  message: string;
  metadata: { targetAudience: string } | null;
  createdAt: string;
}

export default function AdminAnnouncementsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetAudience, setTargetAudience] = useState("all");

  const { data: history, isLoading: historyLoading } = useQuery<Announcement[]>({
    queryKey: ["/api/admin/announcements"],
    staleTime: 30000,
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/announcement", {
        title,
        message,
        targetAudience,
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/announcements"] });
      toast({
        title: "Announcement sent",
        description: `Sent to ${data.count} users`,
      });
      setTitle("");
      setMessage("");
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleSend = () => {
    if (!title.trim() || !message.trim()) {
      toast({
        title: "Missing fields",
        description: "Please enter both title and message",
        variant: "destructive",
      });
      return;
    }
    sendMutation.mutate();
  };

  const getAudienceIcon = (audience: string | undefined) => {
    switch (audience) {
      case "riders":
        return <Users className="h-3 w-3" />;
      case "drivers":
        return <Car className="h-3 w-3" />;
      default:
        return <Globe className="h-3 w-3" />;
    }
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <header className="p-4 flex items-center gap-3 border-b border-border">
          <Link href="/admin">
            <Button size="icon" variant="ghost" data-testid="button-back">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-primary" />
            <h1 className="font-semibold text-foreground">Announcements</h1>
          </div>
        </header>

        <main className="p-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Send Announcement</CardTitle>
              <CardDescription>
                Broadcast a message to users on the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter announcement title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  data-testid="input-title"
                />
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Enter your announcement message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  data-testid="input-message"
                />
              </div>

              <div>
                <Label>Target Audience</Label>
                <Select value={targetAudience} onValueChange={setTargetAudience}>
                  <SelectTrigger data-testid="select-audience">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        All Users
                      </div>
                    </SelectItem>
                    <SelectItem value="riders">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Riders Only
                      </div>
                    </SelectItem>
                    <SelectItem value="drivers">
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        Drivers Only
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleSend}
                disabled={sendMutation.isPending || !title.trim() || !message.trim()}
                className="w-full"
                data-testid="button-send"
              >
                {sendMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send Announcement
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Announcement History</CardTitle>
              <CardDescription>
                Recently sent announcements
              </CardDescription>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : !history || history.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No announcements sent yet
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 border border-border rounded-md"
                      data-testid={`announcement-${item.id}`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <p className="font-medium text-sm">{item.title}</p>
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getAudienceIcon(item.metadata?.targetAudience)}
                          {item.metadata?.targetAudience || "all"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(item.createdAt), "PPp")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </AdminGuard>
  );
}
