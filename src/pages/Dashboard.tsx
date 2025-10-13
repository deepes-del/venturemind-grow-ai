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
      <nav className="border-b glass-effect sticky top-0 z-10 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary animate-float" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-gradient">
              AutoGrow
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
        <div className="mb-8 animate-slide-in-up">
          <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Welcome back, {profile?.owner_name}! 👋
          </h2>
          <p className="text-muted-foreground text-lg">
            Let's analyze your business data and grow your presence on social media
          </p>
        </div>

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-3xl glass-effect shadow-xl">
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
            <TabsTrigger value="history" className="gap-2">
              <FileText className="h-4 w-4" />
              History
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
            <Card className="border-l-4 border-l-accent shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-accent" />
                  Dataset History
                </CardTitle>
                <CardDescription>
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
