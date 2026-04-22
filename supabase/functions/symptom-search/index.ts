// AI symptom search: maps free-text symptoms (en/hi) to medical specialties + urgency.
// Uses Lovable AI Gateway. Returns structured JSON via tool calling.
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SPECIALTIES = [
  "Cardiology","Neurology","Pediatrics","Orthopedics","Ophthalmology",
  "Oncology","Gynecology","Dermatology","ENT","Urology","Gastroenterology",
  "Pulmonology","Psychiatry","General","Emergency",
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { symptoms, lang } = await req.json();
    if (typeof symptoms !== "string" || symptoms.trim().length < 2) {
      return new Response(JSON.stringify({ error: "Please describe symptoms." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sys = `You are a medical triage assistant for CareLink India. Given a user's symptoms (English or Hindi), you must:
1. Pick 1-3 most relevant specialties from this fixed list: ${SPECIALTIES.join(", ")}.
2. Estimate urgency: "emergency" (call 108 / go to ER now), "urgent" (see doctor today), or "routine" (book appointment).
3. Provide a brief, plain-language explanation (2-3 sentences) in ${lang === "hi" ? "Hindi" : "English"}.
4. Suggest 2-4 short self-care or red-flag tips in ${lang === "hi" ? "Hindi" : "English"}.
NEVER diagnose. Always recommend consulting a doctor. If life-threatening signs (chest pain, stroke signs, severe bleeding, breathing trouble, unconsciousness), mark urgency "emergency".`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: symptoms },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "triage_result",
              description: "Return structured triage result.",
              parameters: {
                type: "object",
                properties: {
                  specialties: {
                    type: "array",
                    items: { type: "string", enum: SPECIALTIES },
                    minItems: 1,
                    maxItems: 3,
                  },
                  urgency: { type: "string", enum: ["emergency", "urgent", "routine"] },
                  explanation: { type: "string" },
                  tips: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 4 },
                },
                required: ["specialties", "urgency", "explanation", "tips"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "triage_result" } },
      }),
    });

    if (resp.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a minute." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (resp.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!resp.ok) {
      const txt = await resp.text();
      console.error("AI gateway error:", resp.status, txt);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const call = data?.choices?.[0]?.message?.tool_calls?.[0];
    if (!call?.function?.arguments) {
      return new Response(JSON.stringify({ error: "AI returned no result" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const parsed = JSON.parse(call.function.arguments);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("symptom-search error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
