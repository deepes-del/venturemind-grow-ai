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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Lovble
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{profile?.business_name}</p>
              <p className="text-xs text-muted-foreground">{profile?.owner_name}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {profile?.owner_name}! 👋</h2>
          <p className="text-muted-foreground">
            Let's analyze your business data and grow your presence on social media
          </p>
        </div>

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl">
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Data
            </TabsTrigger>
            <TabsTrigger value="insights" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="ads" className="gap-2">
              <FileText className="h-4 w-4" />
              Ad Content
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <UploadDataset userId={user?.id || ""} />
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <BusinessInsights userId={user?.id || ""} />
          </TabsContent>

          <TabsContent value="ads" className="space-y-4">
            <AdGenerator userId={user?.id || ""} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
