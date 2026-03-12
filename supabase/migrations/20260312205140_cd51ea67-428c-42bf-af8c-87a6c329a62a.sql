-- Fix country for imported Alvarez models (non-Yairi are made in China)
UPDATE models SET country_of_manufacture = 'China' 
WHERE country_of_manufacture IS NULL 
AND series IS NOT NULL 
AND series != 'Yairi Series';

-- Fix production year for imported models that have source_url (from alvarez scrape) but no year
UPDATE models SET production_start_year = 2024 
WHERE production_start_year IS NULL 
AND source_url LIKE '%alvarezguitars.com%';