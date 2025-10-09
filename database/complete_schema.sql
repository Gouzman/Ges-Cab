-- ═══════════════════════════════════════════════════════════════════════════════
-- 🗄️ CRÉATION COMPLÈTE DE LA BASE DE DONNÉES GES-CAB
-- ═══════════════════════════════════════════════════════════════════════════════
-- Système de gestion de cabinet d'avocats
-- Version : 1.0.0
-- Date : 2024-10-09
-- ═══════════════════════════════════════════════════════════════════════════════

-- ┌───────────────────────────────────────────────────────────────────────────────┐
-- │ EXTENSIONS ET CONFIGURATIONS SYSTÈME                                          │
-- └───────────────────────────────────────────────────────────────────────────────┘

-- Extension pour la génération d'UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Extension pour la cryptographie (optionnel)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ┌───────────────────────────────────────────────────────────────────────────────┐
-- │ TABLES PRINCIPALES DU SYSTÈME                                                 │
-- └───────────────────────────────────────────────────────────────────────────────┘

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. TABLE PROFILES - Profils des utilisateurs du système
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT NOT NULL DEFAULT '',
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'manager')),
    email TEXT,
    phone TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les recherches
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_is_active ON profiles(is_active);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. TABLE CLIENTS - Clients du cabinet
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE clients (
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
    status TEXT DEFAULT 'actif' CHECK (status IN ('actif', 'inactif', 'suspendu')),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les recherches
CREATE INDEX idx_clients_name ON clients(name);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_created_by ON clients(created_by);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. TABLE CASES - Dossiers juridiques
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE cases (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    case_number TEXT UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'ouvert' CHECK (status IN ('ouvert', 'en_cours', 'ferme', 'archive', 'suspendu')),
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

-- Fonction pour générer automatiquement un numéro de dossier
CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.case_number IS NULL THEN
        NEW.case_number := 'DOSS-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('case_number_seq')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Séquence pour les numéros de dossier
CREATE SEQUENCE IF NOT EXISTS case_number_seq START 1;

-- Trigger pour générer automatiquement le numéro de dossier
CREATE TRIGGER trigger_generate_case_number
    BEFORE INSERT ON cases
    FOR EACH ROW
    EXECUTE FUNCTION generate_case_number();

-- Index pour optimiser les recherches
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_priority ON cases(priority);
CREATE INDEX idx_cases_type ON cases(type);
CREATE INDEX idx_cases_client_id ON cases(client_id);
CREATE INDEX idx_cases_assigned_to ON cases(assigned_to);
CREATE INDEX idx_cases_created_by ON cases(created_by);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. TABLE TASKS - Tâches liées aux dossiers
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE tasks (
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
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    attachments JSONB DEFAULT '[]',
    tags TEXT[] DEFAULT '{}',
    is_billable BOOLEAN DEFAULT true,
    billing_rate DECIMAL(8,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les recherches
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_assigned_to_id ON tasks(assigned_to_id);
CREATE INDEX idx_tasks_case_id ON tasks(case_id);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. TABLE EVENTS - Événements et rendez-vous
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT DEFAULT 'meeting' CHECK (event_type IN ('meeting', 'hearing', 'deadline', 'appointment', 'reminder')),
    location TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    all_day BOOLEAN DEFAULT false,
    recurrence_rule TEXT, -- Format iCal RRULE
    case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    created_by UUID REFERENCES profiles(id),
    attendees UUID[] DEFAULT '{}',
    external_attendees TEXT[], -- Emails d'invités externes
    notification_sent BOOLEAN DEFAULT false,
    is_cancelled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les recherches
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_end_date ON events(end_date);
CREATE INDEX idx_events_case_id ON events(case_id);
CREATE INDEX idx_events_client_id ON events(client_id);
CREATE INDEX idx_events_created_by ON events(created_by);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. TABLE DOCUMENTS - Documents attachés aux dossiers
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    document_type TEXT DEFAULT 'general',
    version INTEGER DEFAULT 1,
    is_confidential BOOLEAN DEFAULT false,
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    uploaded_by UUID REFERENCES profiles(id),
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les recherches
CREATE INDEX idx_documents_case_id ON documents(case_id);
CREATE INDEX idx_documents_task_id ON documents(task_id);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_documents_document_type ON documents(document_type);

-- ┌───────────────────────────────────────────────────────────────────────────────┐
-- │ TABLES SYSTÈME ET CONFIGURATION                                               │
-- └───────────────────────────────────────────────────────────────────────────────┘

-- ═══════════════════════════════════════════════════════════════════════════════
-- 7. TABLE ALERTS - Système d'alertes et notifications
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE alerts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    alert_type TEXT DEFAULT 'info' CHECK (alert_type IN ('info', 'warning', 'error', 'success')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    target_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    source_table TEXT, -- Table source qui a généré l'alerte
    source_id UUID, -- ID de l'enregistrement source
    is_read BOOLEAN DEFAULT false,
    is_dismissed BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE,
    action_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les recherches
CREATE INDEX idx_alerts_target_user_id ON alerts(target_user_id);
CREATE INDEX idx_alerts_is_read ON alerts(is_read);
CREATE INDEX idx_alerts_alert_type ON alerts(alert_type);
CREATE INDEX idx_alerts_created_at ON alerts(created_at);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 8. TABLE USER_PERMISSIONS - Permissions des utilisateurs
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE user_permissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    permissions JSONB DEFAULT '{}',
    granted_by UUID REFERENCES profiles(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id)
);

-- Index pour optimiser les recherches
CREATE INDEX idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX idx_user_permissions_is_active ON user_permissions(is_active);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 9. TABLE APP_METADATA - Métadonnées de l'application
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE app_metadata (
    id SERIAL PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value JSONB DEFAULT '{}',
    description TEXT,
    is_system BOOLEAN DEFAULT false,
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insérer les métadonnées par défaut
INSERT INTO app_metadata (id, key, value, description, is_system) VALUES
(1, 'task_categories', '["Administratif", "Contentieux", "Commercial", "Famille", "Pénal", "Immobilier", "Social", "Fiscal"]', 'Catégories de tâches disponibles', true),
(2, 'case_types', '["Contentieux", "Conseil", "Rédaction", "Famille", "Commercial", "Pénal", "Immobilier", "Social", "Fiscal", "Autre"]', 'Types de dossiers disponibles', true),
(3, 'app_settings', '{"default_billing_rate": 150, "currency": "EUR", "timezone": "Europe/Paris"}', 'Paramètres généraux de l''application', true);

-- Index pour optimiser les recherches
CREATE INDEX idx_app_metadata_key ON app_metadata(key);

-- ┌───────────────────────────────────────────────────────────────────────────────┐
-- │ TABLES POUR LA FACTURATION                                                    │
-- └───────────────────────────────────────────────────────────────────────────────┘

-- ═══════════════════════════════════════════════════════════════════════════════
-- 10. TABLE INVOICES - Factures
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE invoices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    invoice_number TEXT UNIQUE NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE RESTRICT,
    case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    payment_date DATE,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax_rate DECIMAL(5,2) DEFAULT 20.00,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'EUR',
    notes TEXT,
    payment_terms TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fonction pour générer automatiquement un numéro de facture
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.invoice_number IS NULL THEN
        NEW.invoice_number := 'FACT-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('invoice_number_seq')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Séquence pour les numéros de facture
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;

-- Trigger pour générer automatiquement le numéro de facture
CREATE TRIGGER trigger_generate_invoice_number
    BEFORE INSERT ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION generate_invoice_number();

-- Index pour optimiser les recherches
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_case_id ON invoices(case_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 11. TABLE INVOICE_ITEMS - Lignes de facture
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE invoice_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    quantity DECIMAL(8,2) DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    item_type TEXT DEFAULT 'service' CHECK (item_type IN ('service', 'expense', 'disbursement')),
    date_performed DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les recherches
CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX idx_invoice_items_task_id ON invoice_items(task_id);

-- ┌───────────────────────────────────────────────────────────────────────────────┐
-- │ TABLES POUR L'AUDIT ET LES LOGS                                               │
-- └───────────────────────────────────────────────────────────────────────────────┘

-- ═══════════════════════════════════════════════════════════════════════════════
-- 12. TABLE AUDIT_LOGS - Logs d'audit
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    user_id UUID REFERENCES profiles(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les recherches
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_record_id ON audit_logs(record_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ┌───────────────────────────────────────────────────────────────────────────────┐
-- │ CONFIGURATION ROW LEVEL SECURITY (RLS)                                        │
-- └───────────────────────────────────────────────────────────────────────────────┘

-- Activation de Row Level Security sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════════════════
-- POLITIQUES RLS POUR PROFILES
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- POLITIQUES RLS POUR CLIENTS
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE POLICY "Users can view all clients" ON clients FOR SELECT USING (true);
CREATE POLICY "Users can create clients" ON clients FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update clients" ON clients FOR UPDATE USING (true);
CREATE POLICY "Admins and managers can delete clients" ON clients FOR DELETE USING (
    auth.uid() = created_by OR 
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'manager'))
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- POLITIQUES RLS POUR CASES
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE POLICY "Users can view all cases" ON cases FOR SELECT USING (true);
CREATE POLICY "Users can create cases" ON cases FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update cases" ON cases FOR UPDATE USING (true);
CREATE POLICY "Admins and managers can delete cases" ON cases FOR DELETE USING (
    auth.uid() = created_by OR 
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'manager'))
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- POLITIQUES RLS POUR TASKS
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE POLICY "Users can view all tasks" ON tasks FOR SELECT USING (true);
CREATE POLICY "Users can create tasks" ON tasks FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update tasks" ON tasks FOR UPDATE USING (true);
CREATE POLICY "Admins and managers can delete tasks" ON tasks FOR DELETE USING (
    auth.uid() = created_by OR 
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'manager'))
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- POLITIQUES RLS POUR EVENTS
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE POLICY "Users can view relevant events" ON events FOR SELECT USING (
    auth.uid() = created_by OR 
    auth.uid() = ANY(attendees) OR
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'manager'))
);
CREATE POLICY "Users can create events" ON events FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own events" ON events FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete own events" ON events FOR DELETE USING (auth.uid() = created_by);

-- ═══════════════════════════════════════════════════════════════════════════════
-- POLITIQUES RLS POUR DOCUMENTS
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE POLICY "Users can view case documents" ON documents FOR SELECT USING (true);
CREATE POLICY "Users can upload documents" ON documents FOR INSERT WITH CHECK (auth.uid() = uploaded_by);
CREATE POLICY "Admins and managers can delete documents" ON documents FOR DELETE USING (
    auth.uid() = uploaded_by OR 
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'manager'))
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- POLITIQUES RLS POUR ALERTS
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE POLICY "Users can view own alerts" ON alerts FOR SELECT USING (auth.uid() = target_user_id);
CREATE POLICY "System can create alerts" ON alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own alerts" ON alerts FOR UPDATE USING (auth.uid() = target_user_id);
CREATE POLICY "Users can delete own alerts" ON alerts FOR DELETE USING (auth.uid() = target_user_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- POLITIQUES RLS POUR USER_PERMISSIONS
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE POLICY "Admins can manage user permissions" ON user_permissions FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Users can view own permissions" ON user_permissions FOR SELECT USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- POLITIQUES RLS POUR APP_METADATA
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE POLICY "Users can view app metadata" ON app_metadata FOR SELECT USING (true);
CREATE POLICY "Admins can manage app metadata" ON app_metadata FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- POLITIQUES RLS POUR INVOICES
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE POLICY "Users can view all invoices" ON invoices FOR SELECT USING (true);
CREATE POLICY "Users can create invoices" ON invoices FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update invoices" ON invoices FOR UPDATE USING (true);
CREATE POLICY "Admins and managers can delete invoices" ON invoices FOR DELETE USING (
    auth.uid() = created_by OR 
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'manager'))
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- POLITIQUES RLS POUR INVOICE_ITEMS
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE POLICY "Users can view invoice items" ON invoice_items FOR SELECT USING (true);
CREATE POLICY "Users can manage invoice items" ON invoice_items FOR ALL USING (true);

-- ═══════════════════════════════════════════════════════════════════════════════
-- POLITIQUES RLS POUR AUDIT_LOGS
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE POLICY "Admins can view audit logs" ON audit_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- ┌───────────────────────────────────────────────────────────────────────────────┐
-- │ TRIGGERS ET FONCTIONS AUTOMATIQUES                                            │
-- └───────────────────────────────────────────────────────────────────────────────┘

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
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_permissions_updated_at BEFORE UPDATE ON user_permissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_app_metadata_updated_at BEFORE UPDATE ON app_metadata FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════════
-- FONCTION POUR CRÉER AUTOMATIQUEMENT UN PROFIL LORS DE L'INSCRIPTION
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email, role)
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), 
        NEW.email,
        'user'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement un profil
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ═══════════════════════════════════════════════════════════════════════════════
-- FONCTION POUR L'AUDIT AUTOMATIQUE
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    old_data JSONB;
    new_data JSONB;
    changed_fields TEXT[];
BEGIN
    -- Préparer les données pour l'audit
    IF TG_OP = 'DELETE' THEN
        old_data := to_jsonb(OLD);
        new_data := NULL;
    ELSIF TG_OP = 'UPDATE' THEN
        old_data := to_jsonb(OLD);
        new_data := to_jsonb(NEW);
        -- Identifier les champs modifiés
        SELECT array_agg(key) INTO changed_fields
        FROM jsonb_each(old_data) old_kv
        JOIN jsonb_each(new_data) new_kv ON old_kv.key = new_kv.key
        WHERE old_kv.value IS DISTINCT FROM new_kv.value;
    ELSIF TG_OP = 'INSERT' THEN
        old_data := NULL;
        new_data := to_jsonb(NEW);
    END IF;

    -- Insérer dans audit_logs
    INSERT INTO audit_logs (
        table_name,
        record_id,
        action,
        old_values,
        new_values,
        changed_fields,
        user_id
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        old_data,
        new_data,
        changed_fields,
        auth.uid()
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════════════════════
-- TRIGGERS D'AUDIT (optionnel - décommentez si vous voulez l'audit automatique)
-- ═══════════════════════════════════════════════════════════════════════════════
-- CREATE TRIGGER audit_cases_trigger AFTER INSERT OR UPDATE OR DELETE ON cases FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
-- CREATE TRIGGER audit_tasks_trigger AFTER INSERT OR UPDATE OR DELETE ON tasks FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
-- CREATE TRIGGER audit_clients_trigger AFTER INSERT OR UPDATE OR DELETE ON clients FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- ┌───────────────────────────────────────────────────────────────────────────────┐
-- │ VUES UTILES POUR L'APPLICATION                                                │
-- └───────────────────────────────────────────────────────────────────────────────┘

-- ═══════════════════════════════════════════════════════════════════════════════
-- VUE: Statistiques du tableau de bord
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM cases WHERE status != 'archive') as active_cases,
    (SELECT COUNT(*) FROM tasks WHERE status NOT IN ('completed', 'cancelled')) as pending_tasks,
    (SELECT COUNT(*) FROM clients WHERE status = 'actif') as active_clients,
    (SELECT COUNT(*) FROM invoices WHERE status = 'overdue') as overdue_invoices,
    (SELECT SUM(total_amount) FROM invoices WHERE status = 'paid' AND EXTRACT(MONTH FROM payment_date) = EXTRACT(MONTH FROM CURRENT_DATE)) as monthly_revenue;

-- ═══════════════════════════════════════════════════════════════════════════════
-- VUE: Tâches avec informations complètes
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE VIEW tasks_detailed AS
SELECT 
    t.*,
    c.title as case_title,
    c.client_id,
    cl.name as client_name,
    p_assigned.name as assigned_to_name,
    p_created.name as created_by_name
FROM tasks t
LEFT JOIN cases c ON t.case_id = c.id
LEFT JOIN clients cl ON c.client_id = cl.id
LEFT JOIN profiles p_assigned ON t.assigned_to_id = p_assigned.id
LEFT JOIN profiles p_created ON t.created_by = p_created.id;

-- ═══════════════════════════════════════════════════════════════════════════════
-- VUE: Dossiers avec informations clients
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE VIEW cases_detailed AS
SELECT 
    c.*,
    cl.name as client_name,
    cl.email as client_email,
    cl.company as client_company,
    p_assigned.name as assigned_to_name,
    p_created.name as created_by_name,
    (SELECT COUNT(*) FROM tasks WHERE case_id = c.id) as tasks_count,
    (SELECT COUNT(*) FROM tasks WHERE case_id = c.id AND status = 'completed') as completed_tasks_count
FROM cases c
LEFT JOIN clients cl ON c.client_id = cl.id
LEFT JOIN profiles p_assigned ON c.assigned_to = p_assigned.id
LEFT JOIN profiles p_created ON c.created_by = p_created.id;

-- ┌───────────────────────────────────────────────────────────────────────────────┐
-- │ CONFIGURATION DES BUCKETS STORAGE                                             │
-- └───────────────────────────────────────────────────────────────────────────────┘

-- ═══════════════════════════════════════════════════════════════════════════════
-- BUCKETS SUPABASE STORAGE
-- ═══════════════════════════════════════════════════════════════════════════════

-- Bucket pour les pièces jointes des tâches
INSERT INTO storage.buckets (id, name, public) VALUES ('attachments', 'attachments', false);

-- Bucket pour les documents des dossiers
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- Bucket pour les avatars des utilisateurs
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- ═══════════════════════════════════════════════════════════════════════════════
-- POLITIQUES STORAGE
-- ═══════════════════════════════════════════════════════════════════════════════

-- Politiques pour le bucket attachments
CREATE POLICY "Users can upload attachments" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'attachments' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view attachments" ON storage.objects FOR SELECT USING (
    bucket_id = 'attachments'
);

CREATE POLICY "Users can delete own attachments" ON storage.objects FOR DELETE USING (
    bucket_id = 'attachments' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Politiques pour le bucket documents
CREATE POLICY "Users can upload documents" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view documents" ON storage.objects FOR SELECT USING (
    bucket_id = 'documents'
);

CREATE POLICY "Users can delete own documents" ON storage.objects FOR DELETE USING (
    bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Politiques pour le bucket avatars
CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE USING (
    bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ┌───────────────────────────────────────────────────────────────────────────────┐
-- │ FINALISATION ET COMMENTAIRES                                                  │
-- └───────────────────────────────────────────────────────────────────────────────┘

-- ═══════════════════════════════════════════════════════════════════════════════
-- COMMENTAIRES SUR LES TABLES
-- ═══════════════════════════════════════════════════════════════════════════════

COMMENT ON TABLE profiles IS 'Profils des utilisateurs du système';
COMMENT ON TABLE clients IS 'Clients du cabinet d''avocats';
COMMENT ON TABLE cases IS 'Dossiers juridiques';
COMMENT ON TABLE tasks IS 'Tâches liées aux dossiers';
COMMENT ON TABLE events IS 'Événements et rendez-vous';
COMMENT ON TABLE documents IS 'Documents attachés aux dossiers';
COMMENT ON TABLE alerts IS 'Système d''alertes et notifications';
COMMENT ON TABLE user_permissions IS 'Permissions spécifiques des utilisateurs';
COMMENT ON TABLE app_metadata IS 'Métadonnées de configuration de l''application';
COMMENT ON TABLE invoices IS 'Factures émises';
COMMENT ON TABLE invoice_items IS 'Lignes de détail des factures';
COMMENT ON TABLE audit_logs IS 'Logs d''audit des modifications';

-- ═══════════════════════════════════════════════════════════════════════════════
-- FIN DU SCRIPT DE CRÉATION DE LA BASE DE DONNÉES GES-CAB
-- ═══════════════════════════════════════════════════════════════════════════════

-- 🎉 Base de données Ges-Cab créée avec succès !
-- 
-- TABLES CRÉÉES:
-- - profiles (utilisateurs)
-- - clients (clients du cabinet)
-- - cases (dossiers juridiques)
-- - tasks (tâches)
-- - events (événements/rdv)
-- - documents (fichiers)  
-- - alerts (notifications)
-- - user_permissions (permissions)
-- - app_metadata (configuration)
-- - invoices (factures)
-- - invoice_items (lignes facture)
-- - audit_logs (audit)
--
-- FONCTIONNALITÉS:
-- ✅ Row Level Security (RLS) configuré
-- ✅ Triggers pour updated_at automatique
-- ✅ Génération automatique des numéros
-- ✅ Audit trail (optionnel)
-- ✅ Storage buckets configurés
-- ✅ Vues pour les requêtes complexes
-- ✅ Index pour les performances
--
-- Prêt pour la production ! 🚀