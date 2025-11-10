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
    const { adId } = await req.json();

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Get ad content
    const { data: ad, error: adError } = await supabase
      .from("ad_content")
      .select("ad_text, platform")
      .eq("id", adId)
      .eq("user_id", user.id)
      .single();

    if (adError || !ad) {
      throw new Error("Ad not found");
    }

    // Slack webhook URL
    const slackWebhookUrl = "https://hooks.slack.com/services/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";

    console.log(`Posting ad content to Slack`);
    console.log(`Platform: ${ad.platform}`);
    console.log(`Ad text length: ${ad.ad_text.length}`);

    // Post to Slack with correct format
    const webhookResponse = await fetch(slackWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: `🚀 *New Ad Campaign Posted*\n\n*Platform:* ${ad.platform}\n\n*Content:*\n${ad.ad_text}\n\n_Posted at: ${new Date().toISOString()}_`
      })
    });

    console.log(`Webhook response status: ${webhookResponse.status}`);

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error("Webhook error:", webhookResponse.status, errorText);
      throw new Error(`Failed to post to webhook: ${webhookResponse.status}`);
    }

    console.log("Successfully posted to webhook");

    // Update ad status
    const { error: updateError } = await supabase
      .from("ad_content")
      .update({ 
        status: "posted",
        posted_at: new Date().toISOString()
      })
      .eq("id", adId);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ success: true, message: "Posted to webhook successfully" }),
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
