-- Drop existing check constraint and add new one with expanded categories
ALTER TABLE identifying_features DROP CONSTRAINT IF EXISTS identifying_features_feature_category_check;

ALTER TABLE identifying_features ADD CONSTRAINT identifying_features_feature_category_check 
CHECK (feature_category IN ('tuner', 'truss_rod', 'bridge', 'label', 'body_shape', 'wood_top', 'wood_back_sides', 'construction', 'fingerboard', 'neck_profile', 'finish', 'electronics'));