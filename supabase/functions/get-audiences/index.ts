import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":
    "GET, OPTIONS",
};

Deno.serve(async (req) => {

  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data, error } =
      await supabase
        .from("survey_audiences")
        .select(`
          audience_id,
          audience_name,
          is_active
        `)
        .eq("is_active", true)
        .order("audience_name");

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify(data),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json"
        }
      }
    );

  } catch (error) {

    console.error(error);

    return new Response(
      JSON.stringify({
        success: false,
        error
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json"
        }
      }
    );

  }

});