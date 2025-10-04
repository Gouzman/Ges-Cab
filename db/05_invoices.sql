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