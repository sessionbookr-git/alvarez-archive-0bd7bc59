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
    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!FIRECRAWL_API_KEY) {
      throw new Error('FIRECRAWL_API_KEY is not configured');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Get request body for optional model filter
    const body = await req.json().catch(() => ({}));
    const modelFilter = body.model_name;

    // Fetch models from database
    let query = supabase.from('models').select('id, model_name, photo_url, description');
    if (modelFilter) {
      query = query.eq('model_name', modelFilter);
    }
    
    const { data: models, error: modelsError } = await query;
    
    if (modelsError) {
      throw new Error(`Failed to fetch models: ${modelsError.message}`);
    }

    console.log(`Found ${models?.length || 0} models to process`);

    const results: Array<{
      model_name: string;
      status: string;
      photo_url?: string;
      description?: string;
      error?: string;
    }> = [];

    // Process each model
    for (const model of models || []) {
      console.log(`Processing model: ${model.model_name}`);
      
      try {
        // Search for the model on alvarez website
        const searchUrl = `https://alvarezguitars.com/?s=${encodeURIComponent(model.model_name)}`;
        
        console.log(`Searching: ${searchUrl}`);
        
        // First, search for the model
        const searchResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: searchUrl,
            formats: ['markdown', 'links'],
            onlyMainContent: true,
          }),
        });

        if (!searchResponse.ok) {
          const errorText = await searchResponse.text();
          console.error(`Search failed for ${model.model_name}: ${errorText}`);
          results.push({
            model_name: model.model_name,
            status: 'search_failed',
            error: `Search failed: ${searchResponse.status}`,
          });
          continue;
        }

        const searchData = await searchResponse.json();
        const links = searchData.data?.links || [];
        
        // Find product page link that matches the model
        const productLink = links.find((link: string) => 
          link.includes('/product/') && 
          link.toLowerCase().includes(model.model_name.toLowerCase().replace(/\s+/g, '-'))
        ) || links.find((link: string) => 
          link.includes('/product/') && 
          link.toLowerCase().includes(model.model_name.toLowerCase())
        );

        if (!productLink) {
          console.log(`No product page found for ${model.model_name}`);
          results.push({
            model_name: model.model_name,
            status: 'no_product_page',
            error: 'Could not find product page',
          });
          continue;
        }

        console.log(`Found product page: ${productLink}`);

        // Scrape the product page
        const productResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: productLink,
            formats: ['markdown', 'html'],
            onlyMainContent: true,
          }),
        });

        if (!productResponse.ok) {
          console.error(`Product scrape failed for ${model.model_name}`);
          results.push({
            model_name: model.model_name,
            status: 'scrape_failed',
            error: 'Failed to scrape product page',
          });
          continue;
        }

        const productData = await productResponse.json();
        const html = productData.data?.html || '';
        const markdown = productData.data?.markdown || '';

        // Extract product image from HTML
        let photoUrl = null;
        const imgMatch = html.match(/<img[^>]+class="[^"]*wp-post-image[^"]*"[^>]+src="([^"]+)"/i) ||
                         html.match(/<img[^>]+src="([^"]+)"[^>]+class="[^"]*wp-post-image[^"]*"/i) ||
                         html.match(/data-large_image="([^"]+)"/i) ||
                         html.match(/<img[^>]+src="(https:\/\/alvarezguitars\.com\/wp-content\/uploads[^"]+)"/i);
        
        if (imgMatch) {
          photoUrl = imgMatch[1];
        }

        // Extract description from markdown - look for product description section
        let description = null;
        const descriptionPatterns = [
          /## Description\s*\n+([\s\S]*?)(?=\n##|\n\*\*|$)/i,
          /Product Description[:\s]*\n+([\s\S]*?)(?=\n##|\n\*\*|$)/i,
          /^(The [A-Z][^\n]+(?:\n[^\n#*]+)*)/m,
        ];

        for (const pattern of descriptionPatterns) {
          const match = markdown.match(pattern);
          if (match && match[1]) {
            description = match[1].trim()
              .replace(/\n+/g, ' ')
              .replace(/\s+/g, ' ')
              .substring(0, 1000); // Limit length
            break;
          }
        }

        // If no structured description, take first meaningful paragraph
        if (!description) {
          const paragraphs = markdown.split('\n\n').filter((p: string) => 
            p.length > 50 && 
            !p.startsWith('#') && 
            !p.startsWith('*') &&
            !p.includes('Add to cart')
          );
          if (paragraphs.length > 0) {
            description = paragraphs[0].trim().substring(0, 1000);
          }
        }

        // Update the model in database
        const updates: { photo_url?: string; description?: string } = {};
        if (photoUrl && !model.photo_url) {
          updates.photo_url = photoUrl;
        }
        if (description && !model.description) {
          updates.description = description;
        }

        if (Object.keys(updates).length > 0) {
          const { error: updateError } = await supabase
            .from('models')
            .update(updates)
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
        }

        results.push({
          model_name: model.model_name,
          status: 'success',
          photo_url: photoUrl || undefined,
          description: description ? description.substring(0, 100) + '...' : undefined,
        });

        console.log(`Successfully processed ${model.model_name}`);

        // Rate limiting - wait between requests
        await new Promise(resolve => setTimeout(resolve, 1000));

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

    console.log('Scraping complete:', summary);

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in scrape-alvarez-models:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
