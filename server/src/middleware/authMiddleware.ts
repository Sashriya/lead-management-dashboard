import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUserDocument } from '../models/User';

interface JwtPayload {
  id: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: IUserDocument;
    }
  }
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      if (!token) {
        res.status(401).json({ success: false, message: 'No token provided' });
        return;
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as JwtPayload;

      // ✅ FIX: Explicitly check decoded.id exists before querying
      if (!decoded?.id) {
        res.status(401).json({ success: false, message: 'Invalid token payload' });
        return;
      }

      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        res.status(401).json({ success: false, message: 'User not found — token invalid' });
        return;
      }

      // ✅ FIX: Verify _id exists on the found user document before attaching
      if (!user._id) {
        res.status(401).json({ success: false, message: 'User document malformed' });
        return;
      }

      req.user = user;
      console.log(`✅ Auth: user ${user.email} (${user.role}) | _id: ${user._id}`);
      next();
    } catch (error: any) {
      console.error('Auth middleware error:', error.message);
      if (error.name === 'TokenExpiredError') {
        res.status(401).json({ success: false, message: 'Token expired, please login again' });
      } else if (error.name === 'JsonWebTokenError') {
        res.status(401).json({ success: false, message: 'Invalid token' });
      } else {
        res.status(401).json({ success: false, message: 'Not authorized' });
      }
      return;
    }
  } else {
    res.status(401).json({ success: false, message: 'Not authorized, no token' });
    return;
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route`,
      });
      return;
    }

    next();
  };
};