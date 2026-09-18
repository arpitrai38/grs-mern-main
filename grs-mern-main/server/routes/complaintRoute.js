const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const Student = require('../models/Student');
const authMiddleware = require('../middleware/authMiddleware');

// 1. Create a new complaint (Student - inherits student's collegeId)
router.post('/create', authMiddleware, async (req, res) => {
    try {
        const { complaintType, complaint, image } = req.body;
        const studentId = req.user.id;

        if (!complaint || !complaint.trim()) {
            return res.status(400).json({ message: 'Grievance description is required' });
        }

        // Securely resolve collegeId from token or database
        let collegeId = req.user.collegeId;
        if (!collegeId) {
            const student = await Student.findById(studentId).select('collegeId');
            if (student && student.collegeId) {
                collegeId = student.collegeId;
            }
        }

        if (!collegeId) {
            return res.status(400).json({ message: 'Student is not affiliated with a valid college institution.' });
        }

        const newComplaint = new Complaint({
            collegeId,
            studentId,
            complaintType,
            complaint: complaint.trim(),
            image: image || ''
        });

        await newComplaint.save();

        const populatedComplaint = await Complaint.findById(newComplaint._id)
            .populate('complaintType', 'name')
            .populate('collegeId', 'name code');

        res.status(201).json({ 
            message: 'Complaint filed successfully', 
            complaint: populatedComplaint 
        });
    } catch (error) {
        console.error('Error in /complaint/create:', error);
        res.status(500).json({ message: 'Internal server error while filing complaint' });
    }
});

// 2. Get complaints for authenticated student
router.get('/student-complaints', authMiddleware, async (req, res) => {
    try {
        const studentId = req.user.id;
        const complaints = await Complaint.find({ studentId })
            .populate('complaintType', 'name')
            .populate('collegeId', 'name code')
            .sort({ createdAt: -1 });

        res.status(200).json(complaints);
    } catch (error) {
        console.error('Error in /complaint/student-complaints:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// 3. Get all complaints for Admin (STRICT TENANT ISOLATION: Scoped to req.user.collegeId)
router.get('/get-all', authMiddleware, async (req, res) => {
    try {
        if (!req.user?.collegeId) {
            return res.status(403).json({ message: 'Access denied: No institution context available' });
        }

        const complaints = await Complaint.find({ collegeId: req.user.collegeId })
            .populate('studentId', 'name email mobile course collegeId')
            .populate('complaintType', 'name')
            .populate('collegeId', 'name code')
            .sort({ createdAt: -1 });

        res.status(200).json(complaints);
    } catch (error) {
        console.error('Error in /complaint/get-all:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// 4. Update complaint status (Admin - STRICT TENANT ISOLATION)
router.put('/update-status/:id', authMiddleware, async (req, res) => {
    try {
        const { status } = req.body || {};
        if (!status || !['notProcessed', 'pending', 'closed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Must be notProcessed, pending, or closed.' });
        }

        if (!req.user?.collegeId) {
            return res.status(403).json({ message: 'Access denied: No institution context available' });
        }

        // Tenant-scoped lookup: only allow updating complaints belonging to the admin's college
        const complaint = await Complaint.findOne({
            _id: req.params.id,
            collegeId: req.user.collegeId
        });

        if (!complaint) {
            return res.status(404).json({ 
                message: 'Complaint not found or you do not have permission to modify this grievance.' 
            });
        }

        complaint.status = status;
        await complaint.save();

        const updatedComplaint = await Complaint.findById(complaint._id)
            .populate('studentId', 'name email collegeId')
            .populate('complaintType', 'name')
            .populate('collegeId', 'name code');

        res.status(200).json({ 
            message: 'Complaint status updated successfully', 
            complaint: updatedComplaint 
        });
    } catch (error) {
        console.error('Error in /complaint/update-status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
