const express = require('express');
const router = express.Router();
const ComplaintType = require('../models/ComplaintType');
const authMiddleware = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');

// Create complaint category / department (Admin - scopes to their college)
router.post('/create', authMiddleware, async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Category / Department name is required' });
        }

        const complaintType = new ComplaintType({
            name: name.trim(),
            description: description ? description.trim() : '',
            collegeId: req.user?.collegeId || null
        });
        await complaintType.save();
        res.status(201).json({ message: 'Complaint type created successfully', complaintType });
    } catch (error) {
        console.error('Error in /complaintType/create:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get complaint types (Returns global system types + college specific types)
router.get('/get-all', async (req, res) => {
    try {
        let userCollegeId = null;
        const authHeader = req.headers.authorization;
        if (authHeader) {
            try {
                const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userCollegeId = decoded.collegeId;
            } catch (e) {
                // Token parse failed, continue as guest
            }
        }

        const query = userCollegeId 
            ? { $or: [{ collegeId: null }, { collegeId: userCollegeId }] }
            : {};

        const complaintTypes = await ComplaintType.find(query).sort({ name: 1 });
        res.status(200).json(complaintTypes);
    } catch (error) {
        console.error('Error in /complaintType/get-all:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update complaint type
router.put('/update/:id', authMiddleware, async (req, res) => {
    try {
        const { name, description } = req.body;
        const query = req.user.collegeId 
            ? { _id: req.params.id, $or: [{ collegeId: req.user.collegeId }, { collegeId: null }] }
            : { _id: req.params.id };

        const complaintType = await ComplaintType.findOne(query);
        if (!complaintType) {
            return res.status(404).json({ message: 'Category not found or access denied' });
        }

        if (name) complaintType.name = name.trim();
        if (description !== undefined) complaintType.description = description.trim();
        await complaintType.save();

        res.status(200).json({ message: 'Complaint type updated successfully', complaintType });
    } catch (error) {
        console.error('Error in /complaintType/update:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete complaint type
router.delete('/delete/:id', authMiddleware, async (req, res) => {
    try {
        const query = req.user.collegeId 
            ? { _id: req.params.id, collegeId: req.user.collegeId }
            : { _id: req.params.id };

        const complaintType = await ComplaintType.findOneAndDelete(query);
        if (!complaintType) {
            return res.status(404).json({ message: 'Category not found or default system category cannot be deleted' });
        }

        res.status(200).json({ message: 'Complaint type deleted successfully' });
    } catch (error) {
        console.error('Error in /complaintType/delete:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;