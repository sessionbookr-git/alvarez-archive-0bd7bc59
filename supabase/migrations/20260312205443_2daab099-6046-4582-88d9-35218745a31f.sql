-- Fix series based on model name prefix rules:
-- AE prefix = Artist Elite Series
-- A prefix (but not AE) = Artist Guitars Series  
-- M prefix = Masterworks Series
-- L prefix = Laureate Series
-- R prefix = Regent Series
-- Others keep existing series

-- First fix models that have lowercase names starting with 'ae' -> Artist Elite
-- Then fix models starting with 'a' (but not 'ae') -> Artist Guitars
-- Then fix models starting with 'm' -> Masterworks
-- Then fix models starting with 'l' -> Laureate
-- Then fix models starting with 'r' -> Regent

-- Artist Guitars: starts with A but NOT AE (case insensitive), currently mislabeled
UPDATE models 
SET series = 'Artist Guitars Series'
WHERE source_url LIKE '%alvarezguitars.com%'
AND series = 'Artist Elite Series'
AND UPPER(SPLIT_PART(model_name, '-', 1)) ~ '^A[^E]'
AND UPPER(model_name) NOT LIKE 'AE%';

-- Also fix "artist-" prefixed archived models -> Artist Guitars Series
UPDATE models
SET series = 'Artist Guitars Series'
WHERE source_url LIKE '%alvarezguitars.com%'
AND series = 'Artist Elite Series'
AND LOWER(model_name) LIKE 'artist-%';

-- Masterworks: starts with M
UPDATE models
SET series = 'Masterworks Series'
WHERE source_url LIKE '%alvarezguitars.com%'
AND series = 'Artist Elite Series'
AND UPPER(SPLIT_PART(model_name, '-', 1)) ~ '^M';

-- Laureate: starts with L
UPDATE models
SET series = 'Laureate Series'
WHERE source_url LIKE '%alvarezguitars.com%'
AND series = 'Artist Elite Series'
AND UPPER(SPLIT_PART(model_name, '-', 1)) ~ '^L';

-- Regent: starts with R
UPDATE models
SET series = 'Regent Series'
WHERE source_url LIKE '%alvarezguitars.com%'
AND series = 'Artist Elite Series'
AND UPPER(SPLIT_PART(model_name, '-', 1)) ~ '^R';

-- Yairi: starts with DY, FY, GY, JY or similar Y-pattern
UPDATE models
SET series = 'Yairi Series',
    country_of_manufacture = 'Japan'
WHERE source_url LIKE '%alvarezguitars.com%'
AND series = 'Artist Elite Series'
AND UPPER(model_name) ~ '^[A-Z]Y';

-- Delta models -> Artist Guitars Series
UPDATE models
SET series = 'Artist Guitars Series'
WHERE source_url LIKE '%alvarezguitars.com%'
AND series = 'Artist Elite Series'
AND LOWER(model_name) LIKE 'delta%';

-- CY models (classical) -> Artist Guitars Series
UPDATE models
SET series = 'Artist Guitars Series'
WHERE source_url LIKE '%alvarezguitars.com%'
AND series = 'Artist Elite Series'
AND UPPER(model_name) LIKE 'CY%';