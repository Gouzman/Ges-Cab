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