const express = require('express');
const { verifyToken, isAdmin } = require('../middleware');
const Project = require('../models/Project');
const router = express.Router();

// All routes require Admin auth
router.use(verifyToken, isAdmin);

// List all projects
router.get('/', async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        res.json(projects);
        console.log("Projects:",projects)
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error fetching projects:", err);
    }
});

// Create a project
router.post('/', async (req, res) => {
    try {
        const { name, description, status, startDate, dueDate } = req.body;

        // Validation: Due Date cannot be before Start Date
        if (new Date(dueDate) < new Date(startDate)) {
            return res.status(400).json({ error: 'Due Date cannot be before Start Date' });
        }

        const project = new Project({ name, description, status, startDate, dueDate });
        await project.save();
        res.status(201).json({ message: 'Project created successfully', project });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update a project
router.put('/:id', async (req, res) => {
    try {
        const { name, description, status, startDate, dueDate } = req.body;

        // Validation: Due Date cannot be before Start Date
        if (startDate && dueDate && new Date(dueDate) < new Date(startDate)) {
            return res.status(400).json({ error: 'Due Date cannot be before Start Date' });
        }

        const updated = await Project.findByIdAndUpdate(
            req.params.id,
            { name, description, status, startDate, dueDate },
            { new: true, runValidators: true }
        );
        if (!updated) return res.status(404).json({ error: 'Project not found' });
        res.json({ message: 'Project updated successfully', project: updated });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a project
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Project.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Project not found' });
        res.json({ message: 'Project deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
