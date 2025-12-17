import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Get request body for optional filters
    const body = await req.json().catch(() => ({}));
    const modelId = body.model_id;
    const overwrite = body.overwrite || false; // Only overwrite if explicitly requested

    // Fetch models - either specific one or all without descriptions
    let query = supabase.from('models').select('*');
    
    if (modelId) {
      query = query.eq('id', modelId);
    } else if (!overwrite) {
      // Only get models that need descriptions (no description or very short)
      query = query.or('description.is.null,description.eq.');
    }
    
    const { data: models, error: modelsError } = await query.order('model_name');
    
    if (modelsError) {
      throw new Error(`Failed to fetch models: ${modelsError.message}`);
    }

    console.log(`Found ${models?.length || 0} models to process`);

    const results: Array<{
      model_name: string;
      status: string;
      description?: string;
      error?: string;
    }> = [];

    // Process each model
    for (const model of models || []) {
      console.log(`Generating description for: ${model.model_name}`);
      
      try {
        // Build the prompt with ONLY known data
        const specs: string[] = [];
        
        if (model.series) specs.push(`Series: ${model.series}`);
        if (model.body_shape) specs.push(`Body Shape: ${model.body_shape}`);
        if (model.country_of_manufacture) specs.push(`Made in: ${model.country_of_manufacture}`);
        if (model.production_start_year && model.production_end_year) {
          specs.push(`Production Years: ${model.production_start_year}-${model.production_end_year}`);
        } else if (model.production_start_year) {
          specs.push(`Production Started: ${model.production_start_year}`);
        }
        
        const specsText = specs.length > 0 ? specs.join('\n') : 'Limited information available';

        const systemPrompt = `You are writing product descriptions for vintage and modern Alvarez guitars. 

CRITICAL RULES:
1. ONLY use the information provided below. Do NOT invent features, specifications, or history.
2. If information is limited, write a shorter description. Do NOT pad with assumptions.
3. Do NOT claim specific wood types, electronics, or features unless explicitly provided.
4. Keep descriptions factual and professional - 2-4 sentences maximum.
5. Start with "The [model name]" or "The Alvarez [model name]"`;

        const userPrompt = `Write a brief product description for this Alvarez guitar model using ONLY the following information:

Model Name: ${model.model_name}
${specsText}

Remember: Only state facts from the data above. If limited data, write a brief 1-2 sentence description.`;

        const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`AI request failed for ${model.model_name}: ${errorText}`);
          
          if (response.status === 429) {
            results.push({
              model_name: model.model_name,
              status: 'rate_limited',
              error: 'Rate limited - try again later',
            });
            // Wait longer before continuing
            await new Promise(resolve => setTimeout(resolve, 5000));
            continue;
          }
          
          results.push({
            model_name: model.model_name,
            status: 'ai_failed',
            error: `AI request failed: ${response.status}`,
          });
          continue;
        }

        const aiData = await response.json();
        const description = aiData.choices?.[0]?.message?.content?.trim();

        if (!description) {
          results.push({
            model_name: model.model_name,
            status: 'no_content',
            error: 'AI returned empty response',
          });
          continue;
        }

        // Update the model in database
        const { error: updateError } = await supabase
          .from('models')
          .update({ description })
          .eq('id', model.id);

        if (updateError) {
          console.error(`Failed to update ${model.model_name}: ${updateError.message}`);
          results.push({
            model_name: model.model_name,
            status: 'update_failed',
            error: updateError.message,
          });
          continue;
        }

        results.push({
          model_name: model.model_name,
          status: 'success',
          description: description.substring(0, 100) + (description.length > 100 ? '...' : ''),
        });

        console.log(`Successfully generated description for ${model.model_name}`);

        // Rate limiting - wait between requests
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (err) {
        console.error(`Error processing ${model.model_name}:`, err);
        results.push({
          model_name: model.model_name,
          status: 'error',
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    const summary = {
      total: results.length,
      success: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status !== 'success').length,
      results,
    };

    console.log('Generation complete:', summary);

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-model-descriptions:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
