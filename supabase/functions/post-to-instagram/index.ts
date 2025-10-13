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
      .select("ad_text")
      .eq("id", adId)
      .eq("user_id", user.id)
      .single();

    if (adError || !ad) {
      throw new Error("Ad not found");
    }

    // Get user's Instagram API key
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("instagram_api_key")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.instagram_api_key) {
      throw new Error("Instagram API key not found");
    }

    // Post to Instagram using Graph API
    const instagramResponse = await fetch(
      `https://graph.instagram.com/me/media`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_token: profile.instagram_api_key,
          caption: ad.ad_text,
        })
      }
    );

    if (!instagramResponse.ok) {
      const errorText = await instagramResponse.text();
      console.error("Instagram API error:", instagramResponse.status, errorText);
      throw new Error("Failed to post to Instagram");
    }

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
      JSON.stringify({ success: true, message: "Posted to Instagram successfully" }),
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
