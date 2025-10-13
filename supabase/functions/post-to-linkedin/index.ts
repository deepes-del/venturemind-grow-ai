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

    // Get user's LinkedIn API key
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("linkedin_api_key")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.linkedin_api_key) {
      throw new Error("LinkedIn API key not found");
    }

    // Post to LinkedIn using the API key
    const linkedinResponse = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${profile.linkedin_api_key}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        author: "urn:li:person:YOUR_PERSON_ID",
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: {
              text: ad.ad_text
            },
            shareMediaCategory: "NONE"
          }
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
        }
      })
    });

    if (!linkedinResponse.ok) {
      const errorText = await linkedinResponse.text();
      console.error("LinkedIn API error:", linkedinResponse.status, errorText);
      throw new Error("Failed to post to LinkedIn");
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
      JSON.stringify({ success: true, message: "Posted to LinkedIn successfully" }),
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
