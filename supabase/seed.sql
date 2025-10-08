-- Données de test pour Ges-Cab
-- Ce fichier sera exécuté pour peupler la base avec des données de démonstration

-- Insertion de profils de test (ces utilisateurs devront d'abord s'inscrire via l'interface)
-- Les profils seront créés automatiquement lors de l'inscription

-- Insertion de clients de test
INSERT INTO clients (id, name, email, phone, address, company) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Société Alpha SARL', 'contact@alpha.com', '+33 1 23 45 67 89', '123 Rue de la République, 75001 Paris', 'Alpha SARL'),
    ('22222222-2222-2222-2222-222222222222', 'Jean Dupont', 'jean.dupont@email.com', '+33 6 12 34 56 78', '456 Avenue des Champs, 69001 Lyon', NULL),
    ('33333333-3333-3333-3333-333333333333', 'Entreprise Beta', 'info@beta.fr', '+33 4 56 78 90 12', '789 Boulevard Saint-Michel, 13001 Marseille', 'Beta SAS'),
    ('44444444-4444-4444-4444-444444444444', 'Marie Martin', 'marie.martin@gmail.com', '+33 2 34 56 78 90', '321 Place de la Mairie, 44000 Nantes', NULL),
    ('55555555-5555-5555-5555-555555555555', 'Gamma Industries', 'contact@gamma-industries.com', '+33 5 67 89 01 23', '654 Rue du Commerce, 31000 Toulouse', 'Gamma Industries SA');

-- Insertion de dossiers de test
INSERT INTO cases (id, title, description, status, type, client_id) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Contentieux commercial - Alpha SARL', 'Litige avec un fournisseur concernant une livraison non conforme. Montant en jeu : 50 000€', 'en_cours', 'Contentieux', '11111111-1111-1111-1111-111111111111'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Divorce amiable - Jean Dupont', 'Procédure de divorce par consentement mutuel. Accord sur la garde des enfants et le partage des biens.', 'ouvert', 'Famille', '22222222-2222-2222-2222-222222222222'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Création société - Entreprise Beta', 'Accompagnement juridique pour la création d une SAS. Rédaction des statuts et formalités administratives.', 'ferme', 'Société', '33333333-3333-3333-3333-333333333333'),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Accident du travail - Marie Martin', 'Accompagnement suite à un accident du travail. Négociation avec l assurance et l employeur.', 'en_cours', 'Social', '44444444-4444-4444-4444-444444444444'),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Contrat commercial - Gamma Industries', 'Révision et négociation d un contrat de distribution exclusive sur le territoire français.', 'ouvert', 'Commercial', '55555555-5555-5555-5555-555555555555');

-- Insertion de tâches de test
INSERT INTO tasks (id, title, description, priority, status, deadline, case_id) VALUES
    ('t1111111-1111-1111-1111-111111111111', 'Analyse du contrat de fourniture', 'Examiner les clauses du contrat initial pour identifier les manquements du fournisseur', 'high', 'completed', NOW() + INTERVAL '5 days', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
    ('t2222222-2222-2222-2222-222222222222', 'Rédaction de la mise en demeure', 'Préparer la mise en demeure à envoyer au fournisseur défaillant', 'high', 'in-progress', NOW() + INTERVAL '3 days', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
    ('t3333333-3333-3333-3333-333333333333', 'Préparation convention divorce', 'Rédiger la convention de divorce en tenant compte des accords des époux', 'medium', 'pending', NOW() + INTERVAL '10 days', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
    ('t4444444-4444-4444-4444-444444444444', 'Rendez-vous notaire', 'Organiser le rendez-vous chez le notaire pour la signature finale', 'medium', 'pending', NOW() + INTERVAL '15 days', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
    ('t5555555-5555-5555-5555-555555555555', 'Expertise médicale', 'Organiser l expertise médicale pour évaluer les séquelles de l accident', 'urgent', 'seen', NOW() + INTERVAL '7 days', 'dddddddd-dddd-dddd-dddd-dddddddddddd'),
    ('t6666666-6666-6666-6666-666666666666', 'Négociation assurance', 'Négocier avec l assurance pour obtenir une indemnisation juste', 'high', 'pending', NOW() + INTERVAL '20 days', 'dddddddd-dddd-dddd-dddd-dddddddddddd'),
    ('t7777777-7777-7777-7777-777777777777', 'Révision clauses contrat', 'Analyser et proposer des modifications aux clauses de distribution', 'medium', 'pending', NOW() + INTERVAL '12 days', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee');

-- Insertion d'événements de test
INSERT INTO events (id, title, description, start_date, end_date) VALUES
    ('e1111111-1111-1111-1111-111111111111', 'Audience tribunal de commerce', 'Audience pour l affaire Alpha SARL contre son fournisseur', NOW() + INTERVAL '8 days', NOW() + INTERVAL '8 days' + INTERVAL '2 hours'),
    ('e2222222-2222-2222-2222-222222222222', 'Rendez-vous client - Jean Dupont', 'Point sur l avancement de la procédure de divorce', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days' + INTERVAL '1 hour'),
    ('e3333333-3333-3333-3333-333333333333', 'Expertise médicale - Marie Martin', 'Rendez-vous avec l expert médical mandaté par le tribunal', NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days' + INTERVAL '3 hours'),
    ('e4444444-4444-4444-4444-444444444444', 'Négociation contrat - Gamma', 'Réunion de négociation avec les représentants de Gamma Industries', NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days' + INTERVAL '2 hours'),
    ('e5555555-5555-5555-5555-555555555555', 'Formation équipe', 'Formation sur les nouvelles procédures judiciaires', NOW() + INTERVAL '14 days', NOW() + INTERVAL '14 days' + INTERVAL '4 hours');

-- Note: Les foreign keys created_by, assigned_to, etc. devront être mises à jour
-- une fois que les utilisateurs se seront inscrits et que leurs profils auront été créés