-- 1. Table clients
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255),
    contact_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);

-- 2. Table cases (dossiers)
CREATE TABLE IF NOT EXISTS cases (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    client_id INTEGER REFERENCES clients(id),
    status VARCHAR(50) NOT NULL DEFAULT 'en_cours',
    assigned_to INTEGER REFERENCES users(id),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table tasks
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    case_id INTEGER REFERENCES cases(id),
    assigned_to INTEGER REFERENCES users(id),
    status VARCHAR(50) NOT NULL DEFAULT 'a_faire',
    priority VARCHAR(50) NOT NULL DEFAULT 'normale',
    deadline TIMESTAMP WITH TIME ZONE,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 4. Table calendar_events
CREATE TABLE IF NOT EXISTS calendar_events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    all_day BOOLEAN DEFAULT false,
    case_id INTEGER REFERENCES cases(id),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Table invoices
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    number VARCHAR(50) UNIQUE NOT NULL,
    case_id INTEGER REFERENCES cases(id),
    client_id INTEGER REFERENCES clients(id),
    amount_ht DECIMAL(15,2) NOT NULL,
    tva_rate DECIMAL(5,2) DEFAULT 18.00,
    amount_ttc DECIMAL(15,2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'en_attente',
    payment_method VARCHAR(50),
    payment_date TIMESTAMP WITH TIME ZONE,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    details JSONB DEFAULT '{}'::jsonb
);

-- 6. Table user_permissions
CREATE TABLE IF NOT EXISTS user_permissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) UNIQUE,
    permissions JSONB NOT NULL DEFAULT '{
        "canManageClients": false,
        "canManageCases": false,
        "canManageTasks": false,
        "canManageTeam": false,
        "canViewReports": false,
        "canManageSettings": false
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Table app_metadata
CREATE TABLE IF NOT EXISTS app_metadata (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Données initiales pour app_metadata
INSERT INTO app_metadata (key, value) 
VALUES ('task_categories', '["Administratif", "Juridique", "Financier", "Commercial"]'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 9. Index pour les performances
CREATE INDEX IF NOT EXISTS idx_cases_client_id ON cases(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_case_id ON tasks(case_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_invoices_case_id ON invoices(case_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_case_id ON calendar_events(case_id);