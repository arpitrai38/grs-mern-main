const express = require('express')
const router = express.Router()
const Complaint = require('../models/Complaint')
const authMiddleware = require('../middleware/authMiddleware')

// Create a new complaint (Student)
router.post('/create', authMiddleware, async (req, res) => {
    try {
        const { complaintType, complaint } = req.body
        const studentId = req.user.id // From authMiddleware

        const newComplaint = new Complaint({
            complaintType,
            complaint,
            studentId
        })

        await newComplaint.save()
        res.status(201).json({ message: 'Complaint filed successfully' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})

// Get complaints for a specific student (Student)
router.get('/student-complaints', authMiddleware, async (req, res) => {
    try {
        const studentId = req.user.id
        const complaints = await Complaint.find({ studentId })
            .populate('complaintType', 'name')
            .sort({ createdAt: -1 })
        res.status(200).json(complaints)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})

// Get all complaints (Admin)
router.get('/get-all', authMiddleware, async (req, res) => {
    try {
        const complaints = await Complaint.find()
            .populate('studentId', 'name email collegeId')
            .populate('complaintType', 'name')
            .sort({ createdAt: -1 })
        res.status(200).json(complaints)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})

// Update complaint status (Admin)
router.put('/update-status/:id', authMiddleware, async (req, res) => {
    try {
        const { status } = req.body
        if (!['notProcessed', 'pending', 'closed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' })
        }

        const complaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        )

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' })
        }

        res.status(200).json({ message: 'Complaint status updated', complaint })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})

module.exports = router
