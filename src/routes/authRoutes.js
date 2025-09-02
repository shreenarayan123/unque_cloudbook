import express from 'express';
import { register, login, getProfile } from '../controllers/authController.js';
import { authenticateToken, validateRequest, schemas } from '../middleware/middleware.js';

const router = express.Router();


router.post('/register', validateRequest(schemas.registerSchema), register);
router.post('/login', validateRequest(schemas.loginSchema), login);
router.get('/profile', authenticateToken, getProfile);

export default router;
