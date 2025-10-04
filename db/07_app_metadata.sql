CREATE TABLE IF NOT EXISTS app_metadata (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Données initiales
INSERT INTO app_metadata (key, value) 
VALUES ('task_categories', '["Administratif", "Juridique", "Financier", "Commercial"]'::jsonb)
ON CONFLICT (key) DO NOTHING;