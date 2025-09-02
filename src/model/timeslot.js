import mongoose from 'mongoose';

const timeSlotSchema = new mongoose.Schema({
  professor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professor',
    required: true
  },
  start: {
    type: Date,
    required: true
  },
  end: {
    type: Date,
    required: true
  },
  isBooked: {
    type: Boolean,
    default: false
  }
});

export default mongoose.model('TimeSlot', timeSlotSchema);
