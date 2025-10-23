import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FileText, Sparkles, Send, Calendar } from "lucide-react";

interface AdGeneratorProps {
  userId: string;
}

interface AdContent {
  id: string;
  platform: string;
  ad_text: string;
  status: string;
  created_at: string;
}

const AdGenerator = ({ userId }: AdGeneratorProps) => {
  const [ads, setAds] = useState<AdContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAds();
  }, [userId]);

  const fetchAds = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("ad_content")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching ads:", error);
    } else {
      setAds(data || []);
    }
    setLoading(false);
  };

  const handleApprove = async (adId: string, platform: string) => {
    try {
      toast.loading("Posting to webhook...");
      
      const { data, error } = await supabase.functions.invoke("post-to-webhook", {
        body: { adId }
      });

      if (error) {
        toast.error(`Failed to post: ${error.message}`);
      } else {
        toast.success("Successfully posted to webhook!");
        fetchAds();
      }
    } catch (error) {
      console.error("Error posting:", error);
      toast.error("An error occurred while posting");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  if (ads.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Ad Content Yet</h3>
          <p className="text-muted-foreground">
            AI will generate marketing content when you analyze your data
          </p>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    if (status === "posted") {
      return <Badge className="bg-accent">Posted</Badge>;
    }
    return <Badge variant="secondary">Draft</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-8 animate-fade-in">
        <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-sm">
          <Sparkles className="h-7 w-7 text-primary animate-pulse" />
        </div>
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            AI Generated Content
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Your personalized ad campaigns</p>
        </div>
      </div>

      <div className="grid gap-6">
        {ads.map((ad, index) => (
          <Card
            key={ad.id}
            className="relative overflow-hidden glass-effect hover:shadow-elegant transition-all duration-300 animate-slide-in-up border-primary/20"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl -z-10" />
            
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold">Ad Campaign #{ad.id.slice(0, 8)}</CardTitle>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(ad.created_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
                {getStatusBadge(ad.status)}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-secondary to-accent rounded-full" />
                <div className="pl-6 pr-4 py-4 bg-muted/30 rounded-lg backdrop-blur-sm">
                  <p className="text-base leading-relaxed whitespace-pre-wrap font-medium">
                    {ad.ad_text}
                  </p>
                </div>
              </div>

              {ad.status === "draft" && (
                <Button 
                  onClick={() => handleApprove(ad.id, ad.platform)} 
                  variant="hero" 
                  className="w-full h-12 text-base font-semibold group"
                >
                  <Send className="h-5 w-5 mr-2 group-hover:translate-x-1 transition-transform" />
                  Post to Webhook
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdGenerator;
