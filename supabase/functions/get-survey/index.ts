import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":
    "POST, OPTIONS",
};

Deno.serve(async (req) => {

  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {

    const body = await req.json();

    const surveyId =
      body.survey_id;

    const supabase =
      createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

    const { data, error } =
      await supabase
        .from("vw_survey_builder")
        .select("*")
        .eq("survey_id", surveyId)
        .order("display_order");

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {

      return new Response(
        JSON.stringify({
          success:false,
          message:"Survey not found"
        }),
        {
          status:404,
          headers:{
            ...corsHeaders,
            "Content-Type":
              "application/json"
          }
        }
      );

    }

    const survey = {
      survey_id:
        data[0].survey_id,

      survey_name:
        data[0].survey_name,

      questions:[]
    };

    const questionMap =
      new Map();

    data.forEach(row => {

      if (
        !questionMap.has(
          row.question_id
        )
      ) {

        questionMap.set(
          row.question_id,
          {
            question_id:
              row.question_id,

            question_text:
              row.question_text,

            question_type:
              row.question_type_code,

            display_order:
              row.display_order,

            is_required:
              row.is_required,

            help_text:
              row.help_text,

            options:[]
          }
        );

      }

      if (
        row.option_id
      ) {

        questionMap
          .get(
            row.question_id
          )
          .options
          .push({
            option_id:
              row.option_id,

            option_text:
              row.option_text,

            option_value:
              row.option_value
          });

      }

    });

    survey.questions =
      Array.from(
        questionMap.values()
      );

    return new Response(
      JSON.stringify(survey),
      {
        headers:{
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
        success:false,
        error
      }),
      {
        status:500,
        headers:{
          ...corsHeaders,
          "Content-Type":
            "application/json"
        }
      }
    );

  }

});