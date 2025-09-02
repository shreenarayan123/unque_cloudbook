import express from 'express';
import {
    bookAppointment,
    getStudentAppointments,
    getProfessorAppointments,
    cancelAppointment,
} from '../controllers/appointmentController.js';
import { authenticateToken, authorize, validateRequest, schemas } from '../middleware/middleware.js';

const router = express.Router();

// Book appointment (Students only)
router.post('/book', 
    authenticateToken, 
    authorize(['student']), 
    validateRequest(schemas.appointmentSchema), 
    bookAppointment
);

// Get student's appointments
router.get('/my-appointments', 
    authenticateToken, 
    authorize(['student']), 
    getStudentAppointments
);

// Get professor's appointments
router.get('/professor-appointments', 
    authenticateToken, 
    authorize(['professor']), 
    getProfessorAppointments
);

// Cancel appointment (Professors only)
router.patch('/cancel/:appointmentId', 
    authenticateToken, 
    authorize(['professor']), 
    cancelAppointment
);


export default router;
