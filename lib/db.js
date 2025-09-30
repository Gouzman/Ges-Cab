import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  user: process.env.VITE_POSTGRES_USER,
  host: process.env.VITE_POSTGRES_HOST,
  database: process.env.VITE_POSTGRES_DATABASE,
  password: process.env.VITE_POSTGRES_PASSWORD,
  port: process.env.VITE_POSTGRES_PORT || 5432,
});

// Fonction utilitaire pour les requêtes
export const query = async (text, params) => {
  try {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Temps d\'exécution de la requête:', duration, 'ms');
    return res;
  } catch (error) {
    console.error('Erreur dans la requête:', error);
    throw error;
  }
};

// Fonctions d'accès aux données
export const db = {
  // Clients
  async getClients() {
    const result = await query('SELECT * FROM clients ORDER BY nom');
    return result.rows;
  },
  
  async getClientById(id) {
    const result = await query('SELECT * FROM clients WHERE id = $1', [id]);
    return result.rows[0];
  },
  
  async createClient(clientData) {
    const { nom, email, telephone, adresse } = clientData;
    const result = await query(
      'INSERT INTO clients (nom, email, telephone, adresse) VALUES ($1, $2, $3, $4) RETURNING *',
      [nom, email, telephone, adresse]
    );
    return result.rows[0];
  },

  async updateClient(id, clientData) {
    const { nom, email, telephone, adresse } = clientData;
    const result = await query(
      'UPDATE clients SET nom = $1, email = $2, telephone = $3, adresse = $4 WHERE id = $5 RETURNING *',
      [nom, email, telephone, adresse, id]
    );
    return result.rows[0];
  },

  // Dossiers
  async getCases() {
    const result = await query(`
      SELECT c.*, cl.nom as client_nom 
      FROM cases c 
      LEFT JOIN clients cl ON c.client_id = cl.id 
      ORDER BY c.date_creation DESC
    `);
    return result.rows;
  },

  async getCaseById(id) {
    const result = await query(
      `SELECT c.*, cl.nom as client_nom 
       FROM cases c 
       LEFT JOIN clients cl ON c.client_id = cl.id 
       WHERE c.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  async createCase(caseData) {
    const { titre, description, client_id, status } = caseData;
    const result = await query(
      'INSERT INTO cases (titre, description, client_id, status, date_creation) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING *',
      [titre, description, client_id, status]
    );
    return result.rows[0];
  },

  // Factures
  async getInvoices() {
    const result = await query(`
      SELECT f.*, c.titre as case_titre, cl.nom as client_nom
      FROM factures f
      LEFT JOIN cases c ON f.case_id = c.id
      LEFT JOIN clients cl ON c.client_id = cl.id
      ORDER BY f.date_creation DESC
    `);
    return result.rows;
  },

  async createInvoice(invoiceData) {
    const { 
      case_id, 
      montant_ht,
      tva,
      montant_ttc,
      debours,
      honoraires,
      mode_paiement,
      provision,
      montant_provision
    } = invoiceData;
    
    const result = await query(
      `INSERT INTO factures (
        case_id, montant_ht, tva, montant_ttc, 
        debours, honoraires, mode_paiement, 
        provision, montant_provision, date_creation
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP) RETURNING *`,
      [
        case_id, montant_ht, tva, montant_ttc,
        debours, honoraires, mode_paiement,
        provision, montant_provision
      ]
    );
    return result.rows[0];
  },

  // Tâches
  async getTasks() {
    const result = await query(`
      SELECT t.*, c.titre as case_titre 
      FROM tasks t
      LEFT JOIN cases c ON t.case_id = c.id
      ORDER BY t.date_echeance ASC
    `);
    return result.rows;
  },

  async createTask(taskData) {
    const { titre, description, case_id, priorite, status, date_echeance } = taskData;
    const result = await query(
      'INSERT INTO tasks (titre, description, case_id, priorite, status, date_echeance, date_creation) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP) RETURNING *',
      [titre, description, case_id, priorite, status, date_echeance]
    );
    return result.rows[0];
  }
};

export default db;