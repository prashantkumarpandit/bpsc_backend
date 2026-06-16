const express = require('express');
const { Task } = require('../database');
const { verifyToken } = require('../middleware');
const router = express.Router();

router.use(verifyToken);

// Employee can view their own tasks
router.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.find({ assignedTo: req.userId }).populate('assignedTo', 'name email');
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Employee can update task status
router.put('/tasks/:taskId', async (req, res) => {
    try {
        const { status } = req.body;
        const task = await Task.findOneAndUpdate(
            { _id: req.params.taskId, assignedTo: req.userId },
            { status },
            { new: true }
        );
        if (!task) return res.status(404).json({ error: 'Task not found' });
        res.json(task);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
