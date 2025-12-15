import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search, Eye, FileText, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, subDays } from "date-fns";

const AdminAnalytics = () => {
  const [dateRange] = useState(30); // Last 30 days

  const { data: stats, isLoading } = useQuery({
    queryKey: ['analytics-stats', dateRange],
    queryFn: async () => {
      const since = subDays(new Date(), dateRange).toISOString();

      // Get event counts by type
      const { data: events, error } = await supabase
        .from('analytics_events')
        .select('event_type, event_data')
        .gte('created_at', since);

      if (error) throw error;

      const eventCounts: Record<string, number> = {};
      const failedSearches: Record<string, number> = {};
      const modelViews: Record<string, number> = {};

      events?.forEach((event) => {
        eventCounts[event.event_type] = (eventCounts[event.event_type] || 0) + 1;
        
        const eventData = event.event_data as Record<string, unknown> | null;
        
        if (event.event_type === 'serial_lookup_failed' && eventData?.serial) {
          const serial = String(eventData.serial);
          failedSearches[serial] = (failedSearches[serial] || 0) + 1;
        }
        
        if (event.event_type === 'model_view' && eventData?.model_name) {
          const modelName = String(eventData.model_name);
          modelViews[modelName] = (modelViews[modelName] || 0) + 1;
        }
      });

      return {
        eventCounts,
        failedSearches: Object.entries(failedSearches)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10),
        modelViews: Object.entries(modelViews)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10),
        totalEvents: events?.length || 0
      };
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/admin" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Last {dateRange} days of activity</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Serial Lookups
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.eventCounts['serial_lookup'] || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Failed Searches
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.eventCounts['serial_lookup_failed'] || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Model Views
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.eventCounts['model_view'] || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Submissions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.eventCounts['submission_completed'] || 0}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tables */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Failed Searches */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Failed Searches</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Serial numbers users searched but found no match
                  </p>
                </CardHeader>
                <CardContent>
                  {stats?.failedSearches.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No failed searches yet</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Serial Number</TableHead>
                          <TableHead className="text-right">Searches</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stats?.failedSearches.map(([serial, count]) => (
                          <TableRow key={serial}>
                            <TableCell className="font-mono">{serial}</TableCell>
                            <TableCell className="text-right">{count}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              {/* Popular Models */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Popular Models</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Most viewed model pages
                  </p>
                </CardHeader>
                <CardContent>
                  {stats?.modelViews.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No model views yet</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Model</TableHead>
                          <TableHead className="text-right">Views</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stats?.modelViews.map(([model, count]) => (
                          <TableRow key={model}>
                            <TableCell>{model}</TableCell>
                            <TableCell className="text-right">{count}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default AdminAnalytics;
