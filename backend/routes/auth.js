const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../database');
const router = express.Router();

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret123', { expiresIn: '1d' });
        res.json({ token, user: { id: user._id, name: user.name, role: user.role, email: user.email, designation: user.designation } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Seed an initial Admin
router.post('/seed-admin', async (req, res) => {
    try {
        const existingAdmin = await User.findOne({ role: 'Admin' });
        if (existingAdmin) return res.json({ message: 'Admin already exists' });

        const admin = new User({
            name: 'Admin',
            email: 'admin@bpsc.bihar.gov.in',
            password: 'admin123', // Hardcoded for simplified seed
            role: 'Admin'
        });
        await admin.save();
        res.json({ message: 'Admin created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
