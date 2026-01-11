import { useQuery } from "@tanstack/react-query";
import { Loader2, UserCog, Calendar, MapPin, Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";

interface Director {
  id: string;
  fullName: string;
  email: string;
  role: "OPERATIONS" | "FINANCE" | "COMPLIANCE";
  region: string;
  createdAt: string;
}

const roleConfig = {
  OPERATIONS: { color: "bg-blue-600", label: "Operations" },
  FINANCE: { color: "bg-green-600", label: "Finance" },
  COMPLIANCE: { color: "bg-purple-600", label: "Compliance" },
};

export default function DirectorsPage() {
  const { data: directors, isLoading } = useQuery<Director[]>({
    queryKey: ["/api/directors"],
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <UserCog className="h-6 w-6 text-primary" />
              <div>
                <CardTitle data-testid="text-page-title">Directors</CardTitle>
                <CardDescription>View all directors overseeing platform operations</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : directors && directors.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {directors.map((director) => (
                    <TableRow key={director.id} data-testid={`row-director-${director.id}`}>
                      <TableCell className="font-medium">{director.fullName}</TableCell>
                      <TableCell className="text-muted-foreground">{director.email}</TableCell>
                      <TableCell>
                        <Badge className={roleConfig[director.role].color}>
                          <Briefcase className="h-3 w-3 mr-1" />
                          {roleConfig[director.role].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {director.region}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(director.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <UserCog className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No directors registered yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
