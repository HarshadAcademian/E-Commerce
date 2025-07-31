// middleware/auth.js
import jwt from 'jsonwebtoken';

const SECRET_KEY = 'your_jwt_secret_key'; // move to .env in real project

export const authenticate = (req) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');

  if (!token) throw new Error('No token provided');

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    return decoded.userId;
  } catch (err) {
    throw new Error('Invalid or expired token');
  }
};
