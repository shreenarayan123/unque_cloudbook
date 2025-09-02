
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const professorSchema = new mongoose.Schema(
    {
        email:{
            type:String,
            required:true,
            unique:true
        },
        name:{
            type:String,
            required:true
        },
        password: {
            type: String,
            required: true
        },
        role: {
            type: String,
            default: 'professor',
            enum: ['professor']
        }
    }
);

// Hash password before saving
professorSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare password method
professorSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('Professor', professorSchema);