-- Script SQL RAPIDE pour Ges-Cab
-- Copiez-collez ce code dans l'éditeur SQL de Supabase et cliquez sur "Run"

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table profiles (si pas déjà créée)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'Admin',
    function TEXT DEFAULT 'Gerant',
    phone TEXT,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table clients
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table cases
CREATE TABLE IF NOT EXISTS public.cases (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'Open',
    priority TEXT DEFAULT 'Medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table tasks
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'Pending',
    priority TEXT DEFAULT 'Medium',
    assigned_to_id UUID,
    deadline TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table alerts
CREATE TABLE IF NOT EXISTS public.alerts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT,
    type TEXT DEFAULT 'info',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table user_permissions
CREATE TABLE IF NOT EXISTS public.user_permissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID UNIQUE,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS désactivé temporairement pour simplifier
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions DISABLE ROW LEVEL SECURITY;

-- Créer le profil pour votre utilisateur
INSERT INTO public.profiles (id, name, email, role, function)
VALUES (
    '85cf7b41-6dac-4460-b69d-a7378b0ea100',
    'Admin',
    (SELECT email FROM auth.users WHERE id = '85cf7b41-6dac-4460-b69d-a7378b0ea100' LIMIT 1),
    'Admin',
    'Gerant'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    function = EXCLUDED.function;

-- Créer les permissions
INSERT INTO public.user_permissions (user_id, permissions)
VALUES (
    '85cf7b41-6dac-4460-b69d-a7378b0ea100',
    '{"isAdmin": true, "canManageTeam": true}'::jsonb
) ON CONFLICT (user_id) DO UPDATE SET
    permissions = EXCLUDED.permissions;