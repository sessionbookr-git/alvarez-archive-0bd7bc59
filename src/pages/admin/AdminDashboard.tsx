import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, Guitar, Layers, FileText, Settings } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const AdminDashboard = () => {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [pendingRes, approvedRes, modelsRes, patternsRes, featuresRes] = await Promise.all([
        supabase.from("guitars").select("id", { count: "exact" }).eq("status", "pending"),
        supabase.from("guitars").select("id", { count: "exact" }).eq("status", "approved"),
        supabase.from("models").select("id", { count: "exact" }),
        supabase.from("serial_patterns").select("id", { count: "exact" }),
        supabase.from("identifying_features").select("id", { count: "exact" }),
      ]);
      
      return {
        pending: pendingRes.count ?? 0,
        approved: approvedRes.count ?? 0,
        models: modelsRes.count ?? 0,
        patterns: patternsRes.count ?? 0,
        features: featuresRes.count ?? 0,
      };
    },
  });

  const { data: recentActivity } = useQuery({
    queryKey: ["admin-recent-activity"],
    queryFn: async () => {
      const { data } = await supabase
        .from("guitars")
        .select("id, serial_number, status, created_at, approved_at")
        .order("created_at", { ascending: false })
        .limit(10);
      
      return data ?? [];
    },
  });

  const quickLinks = [
    { title: "Pending Submissions", href: "/admin/submissions", icon: ClipboardList, count: stats?.pending },
    { title: "Model Management", href: "/admin/models", icon: Guitar, count: stats?.models },
    { title: "Serial Patterns", href: "/admin/patterns", icon: Layers, count: stats?.patterns },
    { title: "Feature Library", href: "/admin/features", icon: FileText, count: stats?.features },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container-wide py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage the Alvarez Legacy Archive</p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/"><Settings className="mr-2 h-4 w-4" /> View Site</Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-amber-500/50 bg-amber-500/10">
            <CardHeader className="pb-2">
              <CardDescription>Pending Review</CardDescription>
              <CardTitle className="text-4xl text-amber-600">{stats?.pending ?? 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Approved Guitars</CardDescription>
              <CardTitle className="text-4xl">{stats?.approved ?? 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Models</CardDescription>
              <CardTitle className="text-4xl">{stats?.models ?? 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Serial Patterns</CardDescription>
              <CardTitle className="text-4xl">{stats?.patterns ?? 0}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickLinks.map((link) => (
            <Card key={link.href} className="hover:border-primary/50 transition-colors">
              <Link to={link.href}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <link.icon className="h-8 w-8 text-primary" />
                    {link.count !== undefined && (
                      <span className="text-2xl font-bold text-muted-foreground">{link.count}</span>
                    )}
                  </div>
                  <CardTitle className="text-lg">{link.title}</CardTitle>
                </CardHeader>
              </Link>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest guitar submissions and approvals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity?.map((guitar) => (
                <div key={guitar.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <span className="font-mono font-medium">{guitar.serial_number}</span>
                    <span className="ml-3 text-sm text-muted-foreground">
                      {new Date(guitar.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    guitar.status === "approved" 
                      ? "bg-green-500/20 text-green-700" 
                      : guitar.status === "pending"
                      ? "bg-amber-500/20 text-amber-700"
                      : "bg-red-500/20 text-red-700"
                  }`}>
                    {guitar.status}
                  </span>
                </div>
              ))}
              {(!recentActivity || recentActivity.length === 0) && (
                <p className="text-muted-foreground text-center py-4">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
