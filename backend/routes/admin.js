const express = require('express');
const { User, Task } = require('../database');
const { verifyToken, isAdmin } = require('../middleware');
const router = express.Router();

router.use(verifyToken, isAdmin);

// Create an Employee
router.post('/employees', async (req, res) => {
    try {
        const { name, email, designation, password } = req.body;
        const newEmployee = new User({ name, email, designation, password, role: 'Employee' });
        const response = await newEmployee.save();
        console.log("Employee data:",response)
        res.status(201).json({ message: 'Employee created successfully', employee: response });
    } catch (err) {
        console.log("error occurred while adding employee:", err);
        res.status(500).json({ error: err.message });
    }
});

// List all Employees
router.get('/employees', async (req, res) => {
    try {
        const employees = await User.find({ role: 'Employee' }).select('-password');
        res.json(employees);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Edit Employee Detail
router.put('/employees/:id', async (req, res) => {
    try {
        const { name, email, designation } = req.body;
        // Prevent editing admins or breaking roles
        const updatedUser = await User.findOneAndUpdate(
            { _id: req.params.id, role: 'Employee' },
            { name, email, designation },
            { new: true }
        ).select('-password');
        if (!updatedUser) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        res.json({ message: 'Employee updated successfully', user: updatedUser });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete Employee
router.delete('/employees/:id', async (req, res) => {
    try {
        const deletedUser = await User.findOneAndDelete({ _id: req.params.id, role: 'Employee' });
        if (!deletedUser) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        res.json({ message: 'Employee deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a Task and Assign
router.post('/tasks', async (req, res) => {
    try {
        const { title, description, assignedTo, dueDate } = req.body;
        const task = new Task({ title, description, assignedTo, dueDate });
        await task.save();
        res.status(201).json({ message: 'Task assigned successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// List all tasks
router.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.find().populate('assignedTo', 'name email designation');
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Edit specific Task
router.put('/tasks/:id', async (req, res) => {
    try {
        const { title, description, assignedTo, dueDate, status } = req.body;
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            { title, description, assignedTo, dueDate, status },
            { new: true }
        );
        if (!updatedTask) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json({ message: 'Task updated successfully', task: updatedTask });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a Task
router.delete('/tasks/:id', async (req, res) => {
    try {
        const deletedTask = await Task.findByIdAndDelete(req.params.id);
        if (!deletedTask) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json({ message: 'Task deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
