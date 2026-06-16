const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();

// security and logging
if (process.env.NODE_ENV === 'production') {
    app.use(helmet());
    app.use(compression());
}
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// configure CORS origin from env (e.g. your Hostinger domain) or allow all in dev
const corsOptions = {
    origin: process.env.CORS_ORIGIN || '*',
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// Import database (which connects to MongoDB)
require('./database');

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const employeeRoutes = require('./routes/employee');
const projectRoutes = require('./routes/project');
const Visitor = require('./models/Visitor'); // Import Visitor model

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/employee', employeeRoutes);

// --- Visitor Tracking API ---
app.get('/api/visitors', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0]; // Get YYYY-MM-DD

        // 1. Increment today's visitor count
        await Visitor.findOneAndUpdate(
            { date: today },
            { $inc: { count: 1 } },
            { upsert: true, new: true }
        );

        // 2. Calculate statistics
        const allStats = await Visitor.find().sort({ date: -1 });

        const todayCount = allStats.find(s => s.date === today)?.count || 0;

        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterday = yesterdayDate.toISOString().split('T')[0];
        const yesterdayCount = allStats.find(s => s.date === yesterday)?.count || 0;

        const currentMonthPrefix = today.substring(0, 7); // YYYY-MM
        const currentMonthCount = allStats
            .filter(s => s.date.startsWith(currentMonthPrefix))
            .reduce((sum, s) => sum + s.count, 0);

        const currentYearPrefix = today.substring(0, 4); // YYYY
        const currentYearCount = allStats
            .filter(s => s.date.startsWith(currentYearPrefix))
            .reduce((sum, s) => sum + s.count, 0);

        const totalCount = allStats.reduce((sum, s) => sum + s.count, 0);

        res.json({
            today: todayCount,
            yesterday: yesterdayCount,
            thisMonth: currentMonthCount,
            thisYear: currentYearCount,
            total: totalCount
        });
    } catch (error) {
        console.error("Visitor tracking error:", error);
        res.status(500).json({ error: "Failed to track visitor" });
    }
});

// serve frontend when in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/dist')));
    // fallback for client-side routing: regular middleware avoids path-to-regexp
    app.use((req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
    });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} (env=${process.env.NODE_ENV})`);
});
