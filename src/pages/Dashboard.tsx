import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { LogOut, Upload, Sparkles, TrendingUp, FileText } from "lucide-react";
import UploadDataset from "@/components/UploadDataset";
import BusinessInsights from "@/components/BusinessInsights";
import AdGenerator from "@/components/AdGenerator";
import DatasetHistory from "@/components/DatasetHistory";
import { ThemeToggle } from "@/components/ThemeToggle";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);
      
      // Fetch profile
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
      } else {
        setProfile(profileData);
      }
      
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{ background: 'var(--gradient-mesh), linear-gradient(to bottom right, hsl(var(--background)), hsl(var(--background)))' }}>
      <nav className="border-b glass-effect sticky top-0 z-10 shadow-sm backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-2xl font-bold" style={{ color: 'hsl(var(--heading-primary))' }}>
              VentureMinds
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold" style={{ color: 'hsl(var(--heading-secondary))' }}>
                {profile?.business_name}
              </p>
              <p className="text-xs" style={{ color: 'hsl(var(--text-secondary))' }}>
                {profile?.owner_name}
              </p>
            </div>
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={handleLogout} className="hover:bg-muted">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-10">
        <div className="mb-10 animate-slide-in-up max-w-3xl">
          <h1 className="mb-3 flex items-center gap-3">
            Welcome back, {profile?.owner_name}! 
            <span className="inline-block animate-float">👋</span>
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: 'hsl(var(--text-secondary))' }}>
            Let's analyze your business data and grow your presence on social media
          </p>
        </div>

        <Tabs defaultValue="upload" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 max-w-3xl bg-muted/50 p-1.5 h-auto">
            <TabsTrigger value="upload" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Upload className="h-4 w-4" />
              <span className="font-medium">Upload Data</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <TrendingUp className="h-4 w-4" />
              <span className="font-medium">Insights</span>
            </TabsTrigger>
            <TabsTrigger value="ads" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <FileText className="h-4 w-4" />
              <span className="font-medium">Ad Content</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <FileText className="h-4 w-4" />
              <span className="font-medium">History</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4 animate-scale-in">
            <UploadDataset userId={user?.id || ""} />
          </TabsContent>

          <TabsContent value="insights" className="space-y-4 animate-scale-in">
            <BusinessInsights userId={user?.id || ""} />
          </TabsContent>

          <TabsContent value="ads" className="space-y-4 animate-scale-in">
            <AdGenerator userId={user?.id || ""} />
          </TabsContent>

          <TabsContent value="history" className="space-y-4 animate-scale-in">
            <Card className="border-l-4 border-l-accent shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-accent" />
                  <span style={{ color: 'hsl(var(--heading-secondary))' }}>Dataset History</span>
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  View all your uploaded datasets and analysis history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DatasetHistory userId={user?.id || ""} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
