import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  user: process.env.VITE_PG_USER,
  host: process.env.VITE_PG_HOST,
  database: process.env.VITE_PG_DATABASE,
  password: process.env.VITE_PG_PASSWORD,
  port: parseInt(process.env.VITE_PG_PORT || '5432'),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export const query = async (text, params) => {
  try {
    const result = await pool.query(text, params);
    return { data: result.rows, error: null };
  } catch (error) {
    console.error('Database error:', error);
    return { data: null, error };
  }
};

export const getClient = async () => {
  const client = await pool.connect();
  const query = client.query.bind(client);
  const release = () => client.release();
  return { query, release };
};