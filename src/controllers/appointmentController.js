import Appointment from '../model/appointment.js';
import TimeSlot from '../model/timeslot.js';
import Professor from '../model/professor.js';


const bookAppointment = async (req, res) => {
    try {
        const { professorId, timeSlot } = req.body;
        const studentId = req.user._id;

        // Check if professor exists
        const professor = await Professor.findById(professorId);
        if (!professor) {
            return res.status(404).json({ error: 'Professor not found' });
        }

        // Check if the time slot is available
        const availableSlot = await TimeSlot.findOne({
            professor: professorId,
            start: { $lte: new Date(timeSlot) },
            end: { $gte: new Date(timeSlot) },
            isBooked: false
        });

        if (!availableSlot) {
            return res.status(400).json({ error: 'Time slot not available' });
        }

        // Check if student already has an appointment at this time
        const existingAppointment = await Appointment.findOne({
            student: studentId,
            timeSlot: new Date(timeSlot),
            status: 'booked'
        });

        if (existingAppointment) {
            return res.status(400).json({ error: 'You already have an appointment at this time' });
        }

        // Create the appointment
        const appointment = new Appointment({
            professor: professorId,
            student: studentId,
            timeSlot: new Date(timeSlot),
            status: 'booked'
        });

        await appointment.save();

        // Mark the time slot as booked
        availableSlot.isBooked = true;
        await availableSlot.save();

        // Populate the appointment with user details
        await appointment.populate('professor', 'name email');
        await appointment.populate('student', 'name email');

        res.status(201).json({
            message: 'Appointment booked successfully',
            appointment
        });
    } catch (error) {
        console.error('Error booking appointment:', error);
        res.status(500).json({ error: 'Server error during booking' });
    }
};

// Get student's appointments
const getStudentAppointments = async (req, res) => {
    try {
        const studentId = req.user._id;

        const appointments = await Appointment.find({
            student: studentId,
            status: 'booked'
        }).populate('professor', 'name email')
          .sort({ timeSlot: 1 });

        res.json({
            appointments,
            count: appointments.length
        });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get professor's appointments
const getProfessorAppointments = async (req, res) => {
    try {
        const professorId = req.user._id;

        const appointments = await Appointment.find({
            professor: professorId,
            status: 'booked'
        }).populate('student', 'name email')
          .sort({ timeSlot: 1 });

        res.json({
            appointments,
            count: appointments.length
        });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Cancel appointment (Professor only)
const cancelAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const professorId = req.user._id;

        // Find the appointment
        const appointment = await Appointment.findOne({
            _id: appointmentId,
            professor: professorId,
            status: 'booked'
        });

        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found or already cancelled' });
        }

        // Update appointment status
        appointment.status = 'cancelled';
        await appointment.save();

        // Make the time slot available again
        await TimeSlot.findOneAndUpdate({
            professor: professorId,
            start: { $lte: appointment.timeSlot },
            end: { $gte: appointment.timeSlot }
        }, {
            isBooked: false
        });

        await appointment.populate('student', 'name email');

        res.json({
            message: 'Appointment cancelled successfully',
            appointment
        });
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        res.status(500).json({ error: 'Server error during cancellation' });
    }
};

// Get all appointments (for testing purposes)
const getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate('professor', 'name email')
            .populate('student', 'name email')
            .sort({ timeSlot: 1 });

        res.json({
            appointments,
            count: appointments.length
        });
    } catch (error) {
        console.error('Error fetching all appointments:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

export {
    bookAppointment,
    getStudentAppointments,
    getProfessorAppointments,
    cancelAppointment,
    getAllAppointments
};
