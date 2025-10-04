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