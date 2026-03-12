-- Set instrument_type to Classical for models with C in the right position
-- AC prefix models = classical
UPDATE models SET instrument_type = 'Classical'
WHERE source_url LIKE '%alvarezguitars.com%'
AND (
  UPPER(model_name) LIKE 'AC%'
  OR LOWER(model_name) LIKE 'artist-ac%'
  OR UPPER(model_name) LIKE 'CY%'
  OR UPPER(model_name) LIKE 'CYM%'
);