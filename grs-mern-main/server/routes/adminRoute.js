const express = require('express')
const router = express.Router()
const Admin = require('../models/Admin')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body
        const adminExists = await Admin.findOne({ email })
        if (adminExists) {
            return res.status(400).json({ message: 'Admin already exists' })
        }
        // if already have atleast one admin then return error
        const adminCount = await Admin.countDocuments()
        if (adminCount > 0) {
            return res.status(400).json({ message: 'Admin already exists' })
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        const admin = await new Admin({
            name,
            email,
            password: hashedPassword
        })
        await admin.save()
        res.status(201).json({ message: 'Admin registered' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body
        const admin = await Admin.findOne({ email })
        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }
        const isPasswordValid = await bcrypt.compare(password, admin.password)
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }
        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1d' })
        res.status(200).json({
            msg: "Login successfull",
            token,
            admin: {
                id: admin._id,
                email: admin.email
            }
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})
// get verify token with the timeline
router.get('/verify-token', async (req, res) => {
    try {
        const token = req.headers.authorization
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' })
        }
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
        const admin = await Admin.findById(decodedToken.id)
        if (!admin) {
            return res.status(401).json({ message: 'Unauthorized' })
        }
        res.status(200).json({ message: 'Authorized' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})
module.exports = router