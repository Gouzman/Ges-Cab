import { db } from './db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const authService = {
  async validateCredentials(email, password) {
    const { rows } = await db.query(
      'SELECT id, email, password, full_name, profile_picture_url FROM users WHERE email = $1',
      [email]
    );

    if (rows.length === 0) {
      return null;
    }

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      profilePicture: user.profile_picture_url
    };
  },

  async validateMetaId(metaId) {
    const { rows } = await db.query(
      'SELECT id, meta_id, full_name, profile_picture_url FROM users WHERE meta_id = $1',
      [metaId]
    );

    return rows[0] || null;
  },

  generateToken(user) {
    return jwt.sign(
      { 
        id: user.id,
        email: user.email,
        fullName: user.fullName
      },
      process.env.VITE_JWT_SECRET,
      { expiresIn: '24h' }
    );
  },

  async getUserPermissions(userId) {
    const { rows } = await db.query(
      'SELECT permissions FROM user_permissions WHERE user_id = $1',
      [userId]
    );

    return rows[0]?.permissions || {
      canManageClients: false,
      canManageCases: false,
      canManageTasks: false,
      canManageTeam: false,
      canViewReports: false,
      canManageSettings: false
    };
  },

  async createUser({ email, password, fullName, metaId = null, profilePicture = null }) {
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const { rows } = await db.query(
      `INSERT INTO users (
        email, 
        password, 
        meta_id, 
        full_name, 
        profile_picture_url
      ) VALUES ($1, $2, $3, $4, $5) 
      RETURNING id, email, full_name, profile_picture_url`,
      [email, hashedPassword, metaId, fullName, profilePicture]
    );

    return rows[0];
  }
};

export default authService;