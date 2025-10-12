import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { datasetContent, problemStatement, datasetId } = await req.json();

    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Call Lovable AI Gateway
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const systemPrompt = `You are a business growth consultant and marketing expert. Analyze the provided business data and problem statement to:
1. Identify key insights and patterns in the data
2. Provide actionable recommendations for business growth
3. Generate 2-3 creative marketing posts for Instagram and LinkedIn

Format your response in two sections:
INSIGHTS: [Your detailed business analysis and recommendations]
INSTAGRAM_POST: [Engaging Instagram post with emojis and hashtags]
LINKEDIN_POST: [Professional LinkedIn post]`;

    const userPrompt = `Business Problem: ${problemStatement}

Dataset Content (first 2000 chars):
${datasetContent.substring(0, 2000)}

Please analyze this data and provide insights and marketing content.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errorText);
      throw new Error("Failed to get AI response");
    }

    const aiData = await aiResponse.json();
    const fullResponse = aiData.choices[0].message.content;

    // Parse response
    const insightsMatch = fullResponse.match(/INSIGHTS:(.*?)(?=INSTAGRAM_POST:|$)/s);
    const instagramMatch = fullResponse.match(/INSTAGRAM_POST:(.*?)(?=LINKEDIN_POST:|$)/s);
    const linkedinMatch = fullResponse.match(/LINKEDIN_POST:(.*?)$/s);

    const insights = insightsMatch ? insightsMatch[1].trim() : fullResponse;
    const instagramPost = instagramMatch ? instagramMatch[1].trim() : null;
    const linkedinPost = linkedinMatch ? linkedinMatch[1].trim() : null;

    // Store insights
    const { error: insightError } = await supabase
      .from("business_insights")
      .insert({
        user_id: user.id,
        dataset_id: datasetId,
        problem_statement: problemStatement,
        insights_text: insights,
      });

    if (insightError) throw insightError;

    // Store ad content
    if (instagramPost) {
      await supabase.from("ad_content").insert({
        user_id: user.id,
        platform: "instagram",
        ad_text: instagramPost,
        status: "draft",
      });
    }

    if (linkedinPost) {
      await supabase.from("ad_content").insert({
        user_id: user.id,
        platform: "linkedin",
        ad_text: linkedinPost,
        status: "draft",
      });
    }

    return new Response(
      JSON.stringify({ success: true, insights }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
