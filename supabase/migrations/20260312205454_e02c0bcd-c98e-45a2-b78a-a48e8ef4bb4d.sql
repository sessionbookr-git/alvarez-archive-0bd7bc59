-- Fix yairi- prefixed models still in Artist Elite
UPDATE models
SET series = 'Yairi Series',
    country_of_manufacture = 'Japan'
WHERE source_url LIKE '%alvarezguitars.com%'
AND LOWER(model_name) LIKE 'yairi-%';