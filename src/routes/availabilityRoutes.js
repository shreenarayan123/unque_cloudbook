import express from 'express';
import {
    addAvailability,
    getProfessorAvailability,
    getAllProfessorsAvailability,
    getMyAvailability,
    removeAvailability
} from '../controllers/availabilityController.js';
import { authenticateToken, authorize, validateRequest, schemas } from '../middleware/middleware.js';

const router = express.Router();

// Add availability (Professors only)
router.post('/add', 
    authenticateToken, 
    authorize(['professor']), 
    validateRequest(schemas.timeSlotSchema), 
    addAvailability
);

// Get specific professor's availability (Public - for students to view)
router.get('/professor/:professorId', 
    authenticateToken,
    getProfessorAvailability
);

// Get all professors with their availability student
router.get('/all', 
    authenticateToken,
    getAllProfessorsAvailability
);

// Get own availability (Professors only)
router.get('/my-availability', 
    authenticateToken, 
    authorize(['professor']), 
    getMyAvailability
);

// Remove availability (Professors only)
router.delete('/remove/:timeSlotId', 
    authenticateToken, 
    authorize(['professor']), 
    removeAvailability
);

export default router;
