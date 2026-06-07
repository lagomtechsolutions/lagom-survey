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
        .from("survey_question_options")
        .select(`
          option_id,
          option_text,
          option_value,
          display_order,
          is_active,
          survey_questions (
            question_text
          )
        `)
        .order("display_order");

    if (error) throw error;

    return new Response(
      JSON.stringify(data),
      {
        headers: {
          ...corsHeaders,
          "Content-Type":"application/json"
        }
      }
    );

  } catch (error) {

    return new Response(
      JSON.stringify({
        success:false,
        error
      }),
      {
        status:500,
        headers:{
          ...corsHeaders,
          "Content-Type":"application/json"
        }
      }
    );

  }

});