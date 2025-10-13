import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FileText, Instagram, Linkedin, Check } from "lucide-react";

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

  const handleApprove = async (adId: string) => {
    const { error } = await supabase
      .from("ad_content")
      .update({ status: "approved" })
      .eq("id", adId);

    if (error) {
      toast.error("Failed to approve ad");
    } else {
      toast.success("Ad approved!");
      fetchAds();
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

  const getPlatformIcon = (platform: string) => {
    if (platform === "instagram") {
      return <Instagram className="h-4 w-4" />;
    }
    return <Linkedin className="h-4 w-4" />;
  };

  const getStatusBadge = (status: string) => {
    if (status === "approved") {
      return <Badge className="bg-accent">Approved</Badge>;
    }
    return <Badge variant="secondary">Draft</Badge>;
  };

  return (
    <div className="space-y-4">
      {ads.map((ad, index) => (
        <Card 
          key={ad.id}
          className="shadow-xl hover:shadow-2xl transition-all duration-300 animate-slide-in-up"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {getPlatformIcon(ad.platform)}
                <CardTitle className="text-lg capitalize">{ad.platform} Post</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(ad.status)}
                <Badge variant="outline">
                  {new Date(ad.created_at).toLocaleDateString()}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{ad.ad_text}</p>
            </div>
            {ad.status === "draft" && (
              <Button onClick={() => handleApprove(ad.id)} variant="hero" className="w-full">
                <Check className="h-4 w-4 mr-2" />
                Approve Post
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdGenerator;
