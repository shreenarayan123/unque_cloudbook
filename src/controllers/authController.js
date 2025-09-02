import jwt from 'jsonwebtoken';
import Student from '../model/student.js';
import Professor from '../model/professor.js';


const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
};

// user signup
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

       
        let existingUser;
        if (role === 'student') {
            existingUser = await Student.findOne({ email });
        } else if (role === 'professor') {
            existingUser = await Professor.findOne({ email });
        }

        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }

       
        let newUser;
        if (role === 'student') {
            newUser = new Student({ name, email, password });
        } else if (role === 'professor') {
            newUser = new Professor({ name, email, password });
        }

        await newUser.save();

        
        const token = generateToken(newUser._id, role);

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error during registration' });
    }
};

// Login user
const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

       
        let user;
        if (role === 'student') {
            user = await Student.findOne({ email });
        } else if (role === 'professor') {
            user = await Professor.findOne({ email });
        }

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

       
        const token = generateToken(user._id, role);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error during login' });
    }
};


const getProfile = async (req, res) => {
    try {
        res.json({
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.userRole
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

export {
    register,
    login,
    getProfile
};
