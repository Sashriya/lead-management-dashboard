import jwt, { Secret } from 'jsonwebtoken';

const generateToken = (id: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return jwt.sign({ id }, secret as Secret, { expiresIn: '7d' });
};

export default generateToken;