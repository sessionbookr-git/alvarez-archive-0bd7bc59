import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ArchiveModel {
  name: string;
  url: string;
  thumbnail?: string;
  description?: string;
}

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

    console.log('Step 1: Scraping archive page for model list...');

    // Scrape the archive page to get all models
    const archiveResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: 'https://alvarezguitars.com/guitar-archive/',
        formats: ['html', 'links'],
        onlyMainContent: false,
      }),
    });

    if (!archiveResponse.ok) {
      const errorText = await archiveResponse.text();
      throw new Error(`Failed to scrape archive: ${archiveResponse.status} - ${errorText}`);
    }

    const archiveData = await archiveResponse.json();
    const archiveHtml = archiveData.data?.html || '';
    const archiveLinks = archiveData.data?.links || [];

    console.log(`Archive page scraped. Found ${archiveLinks.length} total links`);

    // Extract guitar product URLs from archive
    const guitarUrls = archiveLinks.filter((link: string) => 
      link.includes('/guitar/') && 
      !link.includes('/guitar-archive') &&
      !link.includes('?')
    );

    console.log(`Found ${guitarUrls.length} guitar product URLs`);

    // Build a map of model names to URLs from the archive
    const archiveModels: ArchiveModel[] = [];
    for (const url of guitarUrls) {
      // Extract model name from URL: /guitar/artist-ab60ce/ -> artist-ab60ce
      const match = url.match(/\/guitar\/([^\/]+)\/?$/);
      if (match) {
        const slug = match[1];
        // Convert slug to model name variants for matching
        const normalizedName = slug.replace(/-/g, ' ').toUpperCase();
        archiveModels.push({
          name: slug,
          url: url,
        });
      }
    }

    console.log(`Parsed ${archiveModels.length} models from archive`);

    // Fetch our database models
    let query = supabase.from('models').select('id, model_name, photo_url, description');
    if (modelFilter) {
      query = query.eq('model_name', modelFilter);
    }
    
    const { data: dbModels, error: modelsError } = await query;
    
    if (modelsError) {
      throw new Error(`Failed to fetch models: ${modelsError.message}`);
    }

    console.log(`Found ${dbModels?.length || 0} models in database to match`);

    const results: Array<{
      model_name: string;
      status: string;
      matched_url?: string;
      photo_url?: string;
      description?: string;
      error?: string;
    }> = [];

    // Match and process each database model
    for (const dbModel of dbModels || []) {
      console.log(`Processing: ${dbModel.model_name}`);

      // Normalize model name for matching
      const modelNameNormalized = dbModel.model_name.toLowerCase().replace(/[\s-]/g, '');
      
      // Find matching archive model
      const matchedArchiveModel = archiveModels.find(am => {
        const archiveSlugNormalized = am.name.replace(/-/g, '');
        // Try exact match first
        if (archiveSlugNormalized === modelNameNormalized) return true;
        // Try partial match (archive contains our model name)
        if (archiveSlugNormalized.includes(modelNameNormalized)) return true;
        // Try reverse partial match
        if (modelNameNormalized.includes(archiveSlugNormalized)) return true;
        return false;
      });

      if (!matchedArchiveModel) {
        console.log(`No archive match for: ${dbModel.model_name}`);
        results.push({
          model_name: dbModel.model_name,
          status: 'no_archive_match',
          error: 'Model not found in Alvarez archive',
        });
        continue;
      }

      console.log(`Matched to: ${matchedArchiveModel.url}`);

      try {
        // Scrape the product page
        const productResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: matchedArchiveModel.url,
            formats: ['markdown', 'html'],
            onlyMainContent: true,
          }),
        });

        if (!productResponse.ok) {
          console.error(`Scrape failed for ${dbModel.model_name}`);
          results.push({
            model_name: dbModel.model_name,
            status: 'scrape_failed',
            matched_url: matchedArchiveModel.url,
            error: `HTTP ${productResponse.status}`,
          });
          // Rate limit
          await new Promise(resolve => setTimeout(resolve, 500));
          continue;
        }

        const productData = await productResponse.json();
        const html = productData.data?.html || '';
        const markdown = productData.data?.markdown || '';

        // Extract product image from HTML - try multiple patterns
        let photoUrl = null;
        const imgPatterns = [
          /<img[^>]+class="[^"]*wp-post-image[^"]*"[^>]+src="([^"]+)"/i,
          /<img[^>]+src="([^"]+)"[^>]+class="[^"]*wp-post-image[^"]*"/i,
          /data-large_image="([^"]+)"/i,
          /<img[^>]+src="(https:\/\/alvarezguitars\.com\/wp-content\/uploads\/[^"]+\.(?:jpg|png|webp)[^"]*)"/i,
          /src="(https:\/\/alvarezguitars\.com\/wp-content\/uploads\/[^"]+\.(?:jpg|png|webp)[^"]*)"/i,
        ];
        
        for (const pattern of imgPatterns) {
          const match = html.match(pattern);
          if (match && match[1]) {
            photoUrl = match[1];
            break;
          }
        }

        // Extract description from markdown
        let description = null;
        const descriptionPatterns = [
          /## Description\s*\n+([\s\S]*?)(?=\n##|\n\*\*|$)/i,
          /Product Description[:\s]*\n+([\s\S]*?)(?=\n##|\n\*\*|$)/i,
          /^((?:The |This |Featuring |With |Built |Crafted )[^\n]+(?:\n[^\n#*]+)*)/m,
        ];

        for (const pattern of descriptionPatterns) {
          const match = markdown.match(pattern);
          if (match && match[1]) {
            description = match[1].trim()
              .replace(/\n+/g, ' ')
              .replace(/\s+/g, ' ')
              .substring(0, 1000);
            break;
          }
        }

        // If no structured description, take first meaningful paragraph
        if (!description) {
          const paragraphs = markdown.split('\n\n').filter((p: string) => 
            p.length > 50 && 
            !p.startsWith('#') && 
            !p.startsWith('*') &&
            !p.startsWith('[') &&
            !p.includes('Add to cart') &&
            !p.includes('SKU:')
          );
          if (paragraphs.length > 0) {
            description = paragraphs[0].trim().substring(0, 1000);
          }
        }

        // Update the model in database (only if we have new data)
        const updates: { photo_url?: string; description?: string } = {};
        if (photoUrl && !dbModel.photo_url) {
          updates.photo_url = photoUrl;
        }
        if (description && !dbModel.description) {
          updates.description = description;
        }

        if (Object.keys(updates).length > 0) {
          const { error: updateError } = await supabase
            .from('models')
            .update(updates)
            .eq('id', dbModel.id);

          if (updateError) {
            console.error(`Update failed for ${dbModel.model_name}: ${updateError.message}`);
            results.push({
              model_name: dbModel.model_name,
              status: 'update_failed',
              matched_url: matchedArchiveModel.url,
              error: updateError.message,
            });
            continue;
          }
        }

        results.push({
          model_name: dbModel.model_name,
          status: 'success',
          matched_url: matchedArchiveModel.url,
          photo_url: photoUrl || undefined,
          description: description ? description.substring(0, 100) + '...' : undefined,
        });

        console.log(`Success: ${dbModel.model_name} - photo: ${!!photoUrl}, desc: ${!!description}`);

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (err) {
        console.error(`Error processing ${dbModel.model_name}:`, err);
        results.push({
          model_name: dbModel.model_name,
          status: 'error',
          matched_url: matchedArchiveModel.url,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    const summary = {
      total: results.length,
      success: results.filter(r => r.status === 'success').length,
      no_match: results.filter(r => r.status === 'no_archive_match').length,
      failed: results.filter(r => !['success', 'no_archive_match'].includes(r.status)).length,
      archive_models_found: archiveModels.length,
      results,
    };

    console.log('Scraping complete:', JSON.stringify(summary, null, 2));

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
