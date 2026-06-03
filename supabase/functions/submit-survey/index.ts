import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const body = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const responseResult = await supabase
      .from("survey_responses")
      .insert({
        survey_id: body.survey_id
      })
      .select()
      .single();

    if (responseResult.error) {
       console.error("Response Insert Error:", responseResult.error);
       throw responseResult.error;
    }

    const responseId = responseResult.data.response_id;

    const answers = body.answers.map((answer: any) => ({
      response_id: responseId,
      question_id: answer.question_id,
      answer_value: answer.answer
    }));

    const answerResult = await supabase
      .from("survey_answers")
      .insert(answers);

    if (answerResult.error) {
      console.error("Answer Insert Error:", answerResult.error);
      throw answerResult.error;
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error) {
      console.error("FULL ERROR:", JSON.stringify(error, null, 2));

    return new Response(
      JSON.stringify({
        success: false,
        error: error
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
});