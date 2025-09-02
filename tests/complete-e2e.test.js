import request from 'supertest';
import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from '../src/routes/authRoutes.js';
import appointmentRoutes from '../src/routes/appointmentRoutes.js';
import availabilityRoutes from '../src/routes/availabilityRoutes.js';

// Get the directory name in ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.test') });




const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/availability', availabilityRoutes);

describe('Complete Appointment Booking E2E Test', () => {
    let studentA1Token, studentA2Token, professorP1Token;
    let studentA1Id, studentA2Id, professorP1Id;

    beforeAll(async () => {
        
        const uniqueDBName = `test_complete_${Date.now().toString().slice(-6)}`;
        const testURI = process.env.MONGODB_URI.replace('unque_cloudbook_test', uniqueDBName);
        await mongoose.connect(testURI);
    });

    afterAll(async () => {
       
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        
        await mongoose.connection.db.dropDatabase();
    });

    afterAll(async () => {
        // Close database connection
        await mongoose.connection.close();
    });

    test('Complete User Flow - All Requirements', async () => {
        // 1. Student A1 authenticates to access the system
        const studentA1Response = await request(app)
            .post('/api/v1/auth/register')
            .send({
                name: 'Student A1',
                email: 'student_a1@test.com',
                password: 'password123',
                role: 'student'
            });

        if (studentA1Response.status !== 201) {
            console.log('Student A1 registration failed:', studentA1Response.body);
        }

        expect(studentA1Response.status).toBe(201);
        studentA1Token = studentA1Response.body.token;
        studentA1Id = studentA1Response.body.user.id;

        // 2. Professor P1 authenticates to access the system
        const professorP1Response = await request(app)
            .post('/api/v1/auth/register')
            .send({
                name: 'Professor P1',
                email: 'professor_p1@test.com',
                password: 'password123',
                role: 'professor'
            });

        expect(professorP1Response.status).toBe(201);
        professorP1Token = professorP1Response.body.token;
        professorP1Id = professorP1Response.body.user.id;

        // 3. Professor P1 specifies availability
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Time slot T1: 10:00 AM - 11:00 AM
        const timeSlotT1Start = new Date(tomorrow);
        timeSlotT1Start.setHours(10, 0, 0, 0);
        const timeSlotT1End = new Date(tomorrow);
        timeSlotT1End.setHours(11, 0, 0, 0);

        const availabilityT1Response = await request(app)
            .post('/api/v1/availability/add')
            .set('Authorization', `Bearer ${professorP1Token}`)
            .send({
                start: timeSlotT1Start.toISOString(),
                end: timeSlotT1End.toISOString()
            });

        expect(availabilityT1Response.status).toBe(201);

        // Time slot T2: 2:00 PM - 3:00 PM  
        const timeSlotT2Start = new Date(tomorrow);
        timeSlotT2Start.setHours(14, 0, 0, 0);
        const timeSlotT2End = new Date(tomorrow);
        timeSlotT2End.setHours(15, 0, 0, 0);

        const availabilityT2Response = await request(app)
            .post('/api/v1/availability/add')
            .set('Authorization', `Bearer ${professorP1Token}`)
            .send({
                start: timeSlotT2Start.toISOString(),
                end: timeSlotT2End.toISOString()
            });

        expect(availabilityT2Response.status).toBe(201);

        // 4. Student A1 views available time slots for Professor P1
        const availabilityResponse = await request(app)
            .get(`/api/v1/availability/professor/${professorP1Id}`)
            .set('Authorization', `Bearer ${studentA1Token}`);

        expect(availabilityResponse.status).toBe(200);
        expect(availabilityResponse.body.availableSlots.length).toBe(2);

        // 5. Student A1 books an appointment with Professor P1 for time T1
        const bookingT1Time = new Date(tomorrow);
        bookingT1Time.setHours(10, 30, 0, 0); //  (with T1 slot)

        const bookingT1Response = await request(app)
            .post('/api/v1/appointments/book')
            .set('Authorization', `Bearer ${studentA1Token}`)
            .send({
                professorId: professorP1Id,
                timeSlot: bookingT1Time.toISOString()
            });

        expect(bookingT1Response.status).toBe(201);
        expect(bookingT1Response.body.message).toBe('Appointment booked successfully');
        const appointmentT1Id = bookingT1Response.body.appointment._id;

        // 6. Student A2 authenticates to access the system
        const studentA2Response = await request(app)
            .post('/api/v1/auth/register')
            .send({
                name: 'Student A2',
                email: 'student_a2@test.com',
                password: 'password123',
                role: 'student'
            });

        expect(studentA2Response.status).toBe(201);
        studentA2Token = studentA2Response.body.token;
        studentA2Id = studentA2Response.body.user.id;

        // 7. Student A2 books an appointment with Professor P1 for time T2
        const bookingT2Time = new Date(tomorrow);
        bookingT2Time.setHours(14, 30, 0, 0); //  (with T2 slot)

        const bookingT2Response = await request(app)
            .post('/api/v1/appointments/book')
            .set('Authorization', `Bearer ${studentA2Token}`)
            .send({
                professorId: professorP1Id,
                timeSlot: bookingT2Time.toISOString()
            });

        expect(bookingT2Response.status).toBe(201);
        expect(bookingT2Response.body.message).toBe('Appointment booked successfully');

        // 8. Professor P1 cancels the appointment with Student A1
        const cancelResponse = await request(app)
            .patch(`/api/v1/appointments/cancel/${appointmentT1Id}`)
            .set('Authorization', `Bearer ${professorP1Token}`);

        expect(cancelResponse.status).toBe(200);
        expect(cancelResponse.body.message).toBe('Appointment cancelled successfully');

        // 9. Student A1 checks their appointments and realizes they do not have any pending appointments
        const studentA1AppointmentsResponse = await request(app)
            .get('/api/v1/appointments/my-appointments')
            .set('Authorization', `Bearer ${studentA1Token}`);

        expect(studentA1AppointmentsResponse.status).toBe(200);
        expect(studentA1AppointmentsResponse.body.appointments.length).toBe(0);
        expect(studentA1AppointmentsResponse.body.count).toBe(0);

        //  verification Student A2 still has their appointment
        const studentA2AppointmentsResponse = await request(app)
            .get('/api/v1/appointments/my-appointments')
            .set('Authorization', `Bearer ${studentA2Token}`);

        expect(studentA2AppointmentsResponse.status).toBe(200);
        expect(studentA2AppointmentsResponse.body.appointments.length).toBe(1);
        expect(studentA2AppointmentsResponse.body.appointments[0].status).toBe('booked');

        // Verify professor can see remaining appointments
        const professorAppointmentsResponse = await request(app)
            .get('/api/v1/appointments/professor-appointments')
            .set('Authorization', `Bearer ${professorP1Token}`);

        expect(professorAppointmentsResponse.status).toBe(200);
        expect(professorAppointmentsResponse.body.appointments.length).toBe(1); // Only A2's appointment

        // Verify T1 time slot is available again after cancellation
        const updatedAvailabilityResponse = await request(app)
            .get(`/api/v1/availability/professor/${professorP1Id}`)
            .set('Authorization', `Bearer ${studentA1Token}`);

        expect(updatedAvailabilityResponse.status).toBe(200);
        expect(updatedAvailabilityResponse.body.availableSlots.length).toBe(1); // T1 available, T2 booked
    });

    test('Authentication and Authorization', async () => {
        // Test registration
        const studentResponse = await request(app)
            .post('/api/v1/auth/register')
            .send({
                name: 'Test Student',
                email: 'test@student.com',
                password: 'password123',
                role: 'student'
            });

        expect(studentResponse.status).toBe(201);
        expect(studentResponse.body.token).toBeDefined();

        //  unauthorized access
        const unauthorizedResponse = await request(app)
            .get('/api/v1/appointments/my-appointments');

        expect(unauthorizedResponse.status).toBe(401);

        //  protected route access
        const protectedResponse = await request(app)
            .get('/api/v1/auth/profile')
            .set('Authorization', `Bearer ${studentResponse.body.token}`);

        expect(protectedResponse.status).toBe(200);
        expect(protectedResponse.body.user.email).toBe('test@student.com');
    });

});
