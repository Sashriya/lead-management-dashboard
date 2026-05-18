"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const protect = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            if (!token) {
                res.status(401).json({ success: false, message: 'No token provided' });
                return;
            }
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            // ✅ FIX: Explicitly check decoded.id exists before querying
            if (!(decoded === null || decoded === void 0 ? void 0 : decoded.id)) {
                res.status(401).json({ success: false, message: 'Invalid token payload' });
                return;
            }
            const user = yield User_1.default.findById(decoded.id).select('-password');
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
        }
        catch (error) {
            console.error('Auth middleware error:', error.message);
            if (error.name === 'TokenExpiredError') {
                res.status(401).json({ success: false, message: 'Token expired, please login again' });
            }
            else if (error.name === 'JsonWebTokenError') {
                res.status(401).json({ success: false, message: 'Invalid token' });
            }
            else {
                res.status(401).json({ success: false, message: 'Not authorized' });
            }
            return;
        }
    }
    else {
        res.status(401).json({ success: false, message: 'Not authorized, no token' });
        return;
    }
});
exports.protect = protect;
const authorize = (...roles) => {
    return (req, res, next) => {
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
exports.authorize = authorize;
