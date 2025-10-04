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