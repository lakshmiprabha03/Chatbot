const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { projectSchema } = require('../validation/schemas');

// Note: authMiddleware applied in server.js

router.get('/', async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user._id }).sort({ createdAt: -1 });
    console.log(`🔍 DEBUG: Found ${projects.length} projects for user ${req.user._id}`);
    console.log('🔍 DEBUG: Project names:', projects.map(p => p.name));
    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    console.log('🆕 DEBUG: Creating project:', req.body.name, 'for user:', req.user._id);
    const { error } = projectSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const project = new Project({
      ...req.body,
      user: req.user._id
    });
    await project.save();
    console.log('✅ DEBUG: Project created with ID:', project._id);

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    console.log('❌ DEBUG: Project creation error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, user: req.user._id });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { error } = projectSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;