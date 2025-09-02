import TimeSlot from '../model/timeslot.js';
import Professor from '../model/professor.js';

// Add availability 
const addAvailability = async (req, res) => {
    try {
        const { start, end } = req.body;
        const professorId = req.user._id;

        const startDate = new Date(start);
        const endDate = new Date(end);

      
        if (startDate >= endDate) {
            return res.status(400).json({ error: 'Start time must be before end time' });
        }

        if (startDate < new Date()) {
            return res.status(400).json({ error: 'Cannot set availability in the past' });
        }

        // Check for overlapping time slots
        const overlapping = await TimeSlot.findOne({
            professor: professorId,
            $or: [
                {
                    start: { $lt: endDate },
                    end: { $gt: startDate }
                }
            ]
        });

        if (overlapping) {
            return res.status(400).json({ error: 'Time slot overlaps with existing availability' });
        }

      
        const timeSlot = new TimeSlot({
            professor: professorId,
            start: startDate,
            end: endDate,
            isBooked: false
        });

        await timeSlot.save();
        await timeSlot.populate('professor', 'name email');

        res.status(201).json({
            message: 'Availability added successfully',
            timeSlot
        });
    } catch (error) {
        console.error('Error adding availability:', error);
        res.status(500).json({ error: 'Server error' });
    }
};


const getProfessorAvailability = async (req, res) => {
    try {
        const { professorId } = req.params;

      
        const professor = await Professor.findById(professorId);
        if (!professor) {
            return res.status(404).json({ error: 'Professor not found' });
        }

        const timeSlots = await TimeSlot.find({
            professor: professorId,
            isBooked: false,
            start: { $gte: new Date() } // Only future slots
        }).sort({ start: 1 });

        res.json({
            professor: {
                id: professor._id,
                name: professor.name,
                email: professor.email
            },
            availableSlots: timeSlots,
            count: timeSlots.length
        });
    } catch (error) {
        console.error('Error fetching availability:', error);
        res.status(500).json({ error: 'Server error' });
    }
};


const getAllProfessorsAvailability = async (req, res) => {
    try {
        const professors = await Professor.find().select('-password');
        const professorsWithAvailability = [];

        for (const professor of professors) {
            const availableSlots = await TimeSlot.find({
                professor: professor._id,
                isBooked: false,
                start: { $gte: new Date() }
            }).sort({ start: 1 });

            professorsWithAvailability.push({
                professor: {
                    id: professor._id,
                    name: professor.name,
                    email: professor.email
                },
                availableSlots,
                count: availableSlots.length
            });
        }

        res.json({
            professors: professorsWithAvailability
        });
    } catch (error) {
        console.error('Error fetching all availability:', error);
        res.status(500).json({ error: 'Server error' });
    }
};


const getMyAvailability = async (req, res) => {
    try {
        const professorId = req.user._id;

        const timeSlots = await TimeSlot.find({
            professor: professorId,
            start: { $gte: new Date() }
        }).sort({ start: 1 });

        res.json({
            timeSlots,
            count: timeSlots.length
        });
    } catch (error) {
        console.error('Error fetching my availability:', error);
        res.status(500).json({ error: 'Server error' });
    }
};


const removeAvailability = async (req, res) => {
    try {
        const { timeSlotId } = req.params;
        const professorId = req.user._id;

        const timeSlot = await TimeSlot.findOne({
            _id: timeSlotId,
            professor: professorId
        });

        if (!timeSlot) {
            return res.status(404).json({ error: 'Time slot not found' });
        }

        if (timeSlot.isBooked) {
            return res.status(400).json({ error: 'Cannot remove booked time slot' });
        }

        await TimeSlot.findByIdAndDelete(timeSlotId);

        res.json({
            message: 'Availability removed successfully'
        });
    } catch (error) {
        console.error('Error removing availability:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

export {
    addAvailability,
    getProfessorAvailability,
    getAllProfessorsAvailability,
    getMyAvailability,
    removeAvailability
};
