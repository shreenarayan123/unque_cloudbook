import jwt from 'jsonwebtoken';
import { z } from 'zod';
import Student from '../model/student.js';
import Professor from '../model/professor.js';


const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; 

        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        
        let user;
        if (decoded.role === 'student') {
            user = await Student.findById(decoded.id).select('-password');
        } else if (decoded.role === 'professor') {
            user = await Professor.findById(decoded.id).select('-password');
        }

        if (!user) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        req.user = user;
        req.userRole = decoded.role;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};


const authorize = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.userRole)) {
            return res.status(403).json({ error: 'Access denied. Insufficient permissions' });
        }
        next();
    };
};


const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['student', 'professor'], 'Role must be either student or professor')
});

const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
    role: z.enum(['student', 'professor'], 'Role must be either student or professor')
});

const appointmentSchema = z.object({
    professorId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid professor ID'),
    timeSlot: z.string().datetime('Invalid datetime format')
});

const timeSlotSchema = z.object({
    start: z.string().datetime('Invalid start datetime format'),
    end: z.string().datetime('Invalid end datetime format')
});

// Validation 
const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            console.log(error);
            return res.status(400).json({
                error: 'Validation failed',
                details: error?.errors
            });
        }
    };
};

const schemas = {
    registerSchema,
    loginSchema,
    appointmentSchema,
    timeSlotSchema
};

export {
    authenticateToken,
    authorize,
    validateRequest,
    schemas
};