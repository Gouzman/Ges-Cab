/**
 * Mock Supabase pour tests et développement
 * Utilisé quand le serveur Supabase principal n'est pas disponible
 */

// Données mock pour les tests
const mockUsers = [
  {
    id: '1',
    email: 'elie.gouzou@gmail.com',
    name: 'Elie Gouzou',
    role: 'admin',
    function: 'Gerant'
  },
  {
    id: '2', 
    email: 'user@ges-cab.com',
    name: 'Utilisateur Test',
    role: 'user',
    function: 'Avocat'
  }
];

const mockClients = [
  {
    id: '1',
    first_name: 'Jean',
    last_name: 'Dupont',
    email: 'jean.dupont@example.com',
    phone: '+226 70 12 34 56',
    company: 'SARL Exemple',
    type: 'company'
  }
];

const mockCases = [
  {
    id: '1',
    title: 'Affaire Test',
    status: 'en-cours',
    priority: 'high',
    client_id: '1',
    created_at: new Date().toISOString()
  }
];

/**
 * Crée un client Supabase mock pour les tests
 */
export function createMockSupabaseClient() {
  console.warn('🧪 Utilisation du client Supabase Mock pour les tests');
  
  return {
    auth: {
      // Mock de l'authentification
      signInWithPassword: async ({ email, password }) => {
        console.log('🔐 Mock SignIn:', email);
        
        const user = mockUsers.find(u => u.email === email);
        if (user && password) {
          return {
            data: {
              user: user,
              session: {
                access_token: 'mock-token',
                user: user
              }
            },
            error: null
          };
        }
        
        return {
          data: { user: null, session: null },
          error: { message: 'Invalid credentials' }
        };
      },
      
      signUp: async ({ email, password, options }) => {
        console.log('📝 Mock SignUp:', email);
        return {
          data: {
            user: { id: Date.now().toString(), email },
            session: null
          },
          error: null
        };
      },
      
      signOut: async () => {
        console.log('🚪 Mock SignOut');
        return { error: null };
      },
      
      getUser: async () => {
        const user = mockUsers[0]; // Utilisateur par défaut
        return {
          data: { user },
          error: null
        };
      },
      
      getSession: async () => {
        const user = mockUsers[0];
        return {
          data: {
            session: {
              access_token: 'mock-token',
              user: user
            }
          },
          error: null
        };
      },
      
      onAuthStateChange: (callback) => {
        // Simuler un utilisateur connecté après un délai
        setTimeout(() => {
          callback('SIGNED_IN', {
            access_token: 'mock-token',
            user: mockUsers[0]
          });
        }, 100);
        
        return {
          data: { subscription: { unsubscribe: () => {} } }
        };
      }
    },
    
    // Mock des requêtes de base de données
    from: (table) => ({
      select: (columns = '*') => ({
        eq: (column, value) => {
          const query = {
            single: async () => {
              console.log(`🗄️  Mock Query: SELECT ${columns} FROM ${table} WHERE ${column} = ${value}`);
              
              switch (table) {
                case 'profiles':
                  const user = mockUsers.find(u => u[column] === value);
                  return user ? { data: user, error: null } : { data: null, error: { message: 'Not found' } };
                
                case 'clients':
                  const client = mockClients.find(c => c[column] === value);
                  return client ? { data: client, error: null } : { data: null, error: { message: 'Not found' } };
                
                case 'cases':
                  const case_ = mockCases.find(c => c[column] === value);
                  return case_ ? { data: case_, error: null } : { data: null, error: { message: 'Not found' } };
                
                default:
                  return { data: null, error: { message: 'Table not mocked' } };
              }
            }
          };
          
          // Ajouter une méthode then pour la compatibilité
          query.then = async (callback) => {
            console.log(`🗄️  Mock Query: SELECT ${columns} FROM ${table} WHERE ${column} = ${value}`);
            
            let results = [];
            switch (table) {
              case 'profiles':
                results = mockUsers.filter(u => u[column] === value);
                break;
              case 'clients':
                results = mockClients.filter(c => c[column] === value);
                break;
              case 'cases':
                results = mockCases.filter(c => c[column] === value);
                break;
            }
            
            const response = { data: results, error: null };
            if (callback) callback(response);
            return response;
          };
          
          return query;
        }
      }),
      
      insert: (data) => ({
        select: () => ({
          then: async (callback) => {
            console.log(`🗄️  Mock Insert into ${table}:`, data);
            const newRecord = { ...data, id: Date.now().toString() };
            const response = { data: [newRecord], error: null };
            if (callback) callback(response);
            return response;
          }
        })
      }),
      
      update: (data) => ({
        eq: (column, value) => ({
          select: () => ({
            then: async (callback) => {
              console.log(`🗄️  Mock Update ${table} SET ... WHERE ${column} = ${value}:`, data);
              const response = { data: [{ ...data, [column]: value }], error: null };
              if (callback) callback(response);
              return response;
            }
          })
        })
      }),
      
      delete: () => ({
        eq: (column, value) => ({
          then: async (callback) => {
            console.log(`🗄️  Mock Delete from ${table} WHERE ${column} = ${value}`);
            const response = { data: [], error: null };
            if (callback) callback(response);
            return response;
          }
        })
      })
    }),
    
    // Mock pour le storage
    storage: {
      from: (bucket) => ({
        upload: async (path, file) => {
          console.log(`📁 Mock Upload to ${bucket}/${path}:`, file.name);
          return {
            data: { path },
            error: null
          };
        },
        
        getPublicUrl: (path) => {
          console.log(`🔗 Mock GetPublicUrl: ${bucket}/${path}`);
          return {
            data: { publicUrl: `https://mock-storage.com/${bucket}/${path}` }
          };
        }
      })
    },
    
    // Mock pour les fonctions
    functions: {
      invoke: async (functionName, options) => {
        console.log(`⚡ Mock Function ${functionName}:`, options);
        return {
          data: { message: 'Mock function response' },
          error: null
        };
      }
    }
  };
}

export default createMockSupabaseClient;