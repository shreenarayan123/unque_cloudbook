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


router.post('/add', 
    authenticateToken, 
    authorize(['professor']), 
    validateRequest(schemas.timeSlotSchema), 
    addAvailability
);


router.get('/professor/:professorId', 
    authenticateToken,
    getProfessorAvailability
);


router.get('/all', 
    authenticateToken,
    getAllProfessorsAvailability
);


router.get('/my-availability', 
    authenticateToken, 
    authorize(['professor']), 
    getMyAvailability
);


router.delete('/remove/:timeSlotId', 
    authenticateToken, 
    authorize(['professor']), 
    removeAvailability
);

export default router;
