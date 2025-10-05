-- Script minimal pour créer la table profiles
-- Copiez-collez ce code dans l'éditeur SQL de Supabase

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table profiles
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'User',
    function TEXT,
    phone TEXT,
    avatar_url TEXT,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Insérer le profil pour l'utilisateur existant
INSERT INTO public.profiles (id, name, email, role, function)
VALUES (
    '85cf7b41-6dac-4460-b69d-a7378b0ea100',
    'Admin',
    (SELECT email FROM auth.users WHERE id = '85cf7b41-6dac-4460-b69d-a7378b0ea100'),
    'Admin',
    'Gerant'
);