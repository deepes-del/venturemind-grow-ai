import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Lightbulb } from "lucide-react";

interface BusinessInsightsProps {
  userId: string;
}

interface Insight {
  id: string;
  problem_statement: string;
  insights_text: string;
  created_at: string;
}

const BusinessInsights = ({ userId }: BusinessInsightsProps) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, [userId]);

  const fetchInsights = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("business_insights")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching insights:", error);
    } else {
      setInsights(data || []);
    }
    setLoading(false);
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

  if (insights.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Insights Yet</h3>
          <p className="text-muted-foreground">
            Upload your business data and AI will generate insights here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {insights.map((insight) => (
        <Card key={insight.id} className="border-l-4 border-l-primary">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Business Growth Ideas</CardTitle>
              </div>
              <Badge variant="secondary">
                {new Date(insight.created_at).toLocaleDateString()}
              </Badge>
            </div>
            <CardDescription className="text-base font-medium text-foreground mt-2">
              Problem: {insight.problem_statement}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {insight.insights_text}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default BusinessInsights;
