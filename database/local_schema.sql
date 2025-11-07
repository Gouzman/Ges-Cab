-- ═══════════════════════════════════════════════════════════════════════════════
-- 🗄️ SCHÉMA POSTGRESQL LOCAL POUR GES-CAB
-- ═══════════════════════════════════════════════════════════════════════════════

-- Extension pour la génération d'UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. TABLE PROFILES - Profils des utilisateurs du système
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL DEFAULT '',
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'manager')),
    email TEXT UNIQUE,
    phone TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. TABLE CLIENTS - Clients du cabinet
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS clients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    postal_code TEXT,
    city TEXT,
    country TEXT DEFAULT 'France',
    company TEXT,
    siret TEXT,
    client_type TEXT DEFAULT 'particulier' CHECK (client_type IN ('particulier', 'entreprise', 'association')),
    notes TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. TABLE CASES - Dossiers juridiques
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS cases (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    case_number TEXT UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived', 'suspended')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    type TEXT DEFAULT 'general',
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    opposing_party TEXT,
    court TEXT,
    judge TEXT,
    start_date DATE,
    expected_end_date DATE,
    actual_end_date DATE,
    budget_amount DECIMAL(12,2),
    hours_spent DECIMAL(8,2) DEFAULT 0,
    created_by UUID REFERENCES profiles(id),
    assigned_to UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. TABLE TASKS - Tâches liées aux dossiers
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'seen', 'in-progress', 'completed', 'cancelled')),
    category TEXT DEFAULT 'general',
    estimated_hours DECIMAL(6,2),
    actual_hours DECIMAL(6,2),
    deadline TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    assigned_to_id UUID REFERENCES profiles(id),
    assigned_to_name TEXT,
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    created_by_id UUID REFERENCES profiles(id),
    created_by_name TEXT,
    assigned_at TIMESTAMP WITH TIME ZONE,
    attachments JSONB DEFAULT '[]',
    tags TEXT[] DEFAULT '{}',
    is_billable BOOLEAN DEFAULT true,
    billing_rate DECIMAL(8,2),
    completion_comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. TABLE ALERTS - Système d'alertes et notifications
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS alerts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    text TEXT NOT NULL,
    author_id UUID REFERENCES profiles(id),
    author_name TEXT,
    alert_type TEXT DEFAULT 'info' CHECK (alert_type IN ('info', 'warning', 'error', 'success')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- FONCTION POUR METTRE À JOUR AUTOMATIQUEMENT LE CHAMP updated_at
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════════════════════
-- TRIGGERS POUR updated_at
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON cases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════════
-- DONNÉES DE TEST
-- ═══════════════════════════════════════════════════════════════════════════════

-- Insérer un utilisateur par défaut
INSERT INTO profiles (name, email, role) VALUES 
('Administrateur', 'admin@ges-cab.com', 'admin'),
('Elie Gouzou', 'elie.gouzou@gmail.com', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insérer un client de test
INSERT INTO clients (name, email, phone, status, created_by) VALUES 
('Martin & Associés', 'contact@martin-associes.fr', '01.23.45.67.89', 'active', 
 (SELECT id FROM profiles WHERE email = 'admin@ges-cab.com' LIMIT 1))
ON CONFLICT DO NOTHING;

-- Insérer un dossier de test
INSERT INTO cases (title, description, status, client_id, created_by) VALUES 
('Contentieux Commercial - Contrat de prestation', 'Litige concernant l''exécution d''un contrat de prestation de services', 'active', 
 (SELECT id FROM clients WHERE name = 'Martin & Associés' LIMIT 1),
 (SELECT id FROM profiles WHERE email = 'admin@ges-cab.com' LIMIT 1))
ON CONFLICT DO NOTHING;

-- Créer les index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to_id ON tasks(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_tasks_case_id ON tasks(case_id);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by_id ON tasks(created_by_id);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);

CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_client_id ON cases(client_id);

CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_alerts_author_id ON alerts(author_id);