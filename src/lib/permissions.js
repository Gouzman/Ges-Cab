// Utilitaire pour vérifier les permissions utilisateur
export const checkPermission = (userPermissions, module, action = null) => {
  if (!userPermissions || !userPermissions[module]) {
    return false;
  }

  const modulePerms = userPermissions[module];

  // Si on vérifie juste la visibilité du module
  if (!action) {
    return modulePerms.visible === true;
  }

  // Si on vérifie une action spécifique
  return modulePerms.visible === true && modulePerms.actions && modulePerms.actions[action] === true;
};

// Vérifier si l'utilisateur est administrateur
export const isAdmin = (user) => {
  return user && (
    user.function === 'Gerant' || 
    user.function === 'Associe Emerite' || 
    (user.role && user.role.toLowerCase() === 'admin')
  );
};

// Vérifier si l'utilisateur peut gérer les permissions
export const canManagePermissions = (user) => {
  return isAdmin(user);
};

// Obtenir le niveau d'accès de l'utilisateur
export const getUserAccessLevel = (user) => {
  if (!user) return 'none';
  
  if (user.function === 'Gerant') return 'manager';
  if (user.function === 'Associe Emerite') return 'senior';
  if (user.role === 'Admin') return 'admin';
  if (user.role === 'Avocat') return 'lawyer';
  if (user.role === 'Secretaire') return 'secretary';
  if (user.role === 'Stagiaire') return 'intern';
  
  return 'user';
};

// Permissions par défaut selon le rôle
export const getDefaultPermissionsByRole = (role) => {
  const basePermissions = {
    dashboard: { visible: true, actions: {} },
    tasks: { visible: true, actions: { create: false, edit: false, delete: false, reassign: false } },
    clients: { visible: true, actions: { create: false, edit: false, delete: false } },
    cases: { visible: true, actions: { create: false, edit: false, delete: false } },
    calendar: { visible: true, actions: { create: false, edit: false, delete: false } },
    documents: { visible: true, actions: { upload: false, delete: false } },
    billing: { visible: false, actions: { create: false, edit: false, delete: false } },
    team: { visible: false, actions: { create: false, edit: false, delete: false } },
    reports: { visible: true, actions: {} },
    settings: { visible: false, actions: {} }
  };

  switch (role?.toLowerCase()) {
    case 'gerant':
    case 'associe emerite':
      // Accès complet
      return Object.keys(basePermissions).reduce((acc, module) => {
        acc[module] = {
          visible: true,
          actions: Object.keys(basePermissions[module].actions).reduce((actAcc, action) => {
            actAcc[action] = true;
            return actAcc;
          }, {})
        };
        return acc;
      }, {});

    case 'admin':
      // Accès étendu sauf gestion d'équipe
      const adminPerms = { ...basePermissions };
      adminPerms.billing.visible = true;
      adminPerms.settings.visible = true;
      Object.keys(adminPerms).forEach(module => {
        if (module !== 'team') {
          Object.keys(adminPerms[module].actions).forEach(action => {
            adminPerms[module].actions[action] = true;
          });
        }
      });
      return adminPerms;

    case 'avocat':
      // Accès avocat standard
      const lawyerPerms = { ...basePermissions };
      lawyerPerms.tasks.actions = { create: true, edit: true, delete: false, reassign: false };
      lawyerPerms.clients.actions = { create: true, edit: true, delete: false };
      lawyerPerms.cases.actions = { create: true, edit: true, delete: false };
      lawyerPerms.calendar.actions = { create: true, edit: true, delete: false };
      lawyerPerms.documents.actions = { upload: true, delete: false };
      return lawyerPerms;

    case 'secretaire':
      // Accès secrétaire
      const secretaryPerms = { ...basePermissions };
      secretaryPerms.tasks.actions = { create: true, edit: false, delete: false, reassign: false };
      secretaryPerms.clients.actions = { create: true, edit: true, delete: false };
      secretaryPerms.calendar.actions = { create: true, edit: true, delete: false };
      secretaryPerms.documents.actions = { upload: true, delete: false };
      return secretaryPerms;

    case 'stagiaire':
      // Accès stagiaire limité
      const internPerms = { ...basePermissions };
      internPerms.tasks.actions = { create: false, edit: false, delete: false, reassign: false };
      internPerms.clients.actions = { create: false, edit: false, delete: false };
      internPerms.cases.actions = { create: false, edit: false, delete: false };
      internPerms.calendar.actions = { create: false, edit: false, delete: false };
      internPerms.documents.actions = { upload: false, delete: false };
      return internPerms;

    default:
      return basePermissions;
  }
};