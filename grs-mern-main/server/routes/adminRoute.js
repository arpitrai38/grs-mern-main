const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', async (req, res) => {
    try {
        const { name, email, password, picture, collegeId, contactNumber } = req.body;
        
        if (!email || !password || !collegeId) {
            return res.status(400).json({ message: 'Email, password, and affiliated College ID are required.' });
        }

        const adminExists = await Admin.findOne({ email: email.toLowerCase().trim() });
        if (adminExists) {
            return res.status(400).json({ message: 'An administrator with this email already exists.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const admin = new Admin({
            name: name || 'Administrator',
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            picture: picture || '',
            collegeId,
            contactNumber: contactNumber || '',
            role: 'admin'
        });
        await admin.save();
        res.status(201).json({ message: 'Admin registered successfully' });
    } catch (error) {
        console.error('Error in admin register:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const admin = await Admin.findOne({ email: email.toLowerCase().trim() }).populate('collegeId');
        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials. Administrator not found.' });
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials. Password incorrect.' });
        }

        // Check if institution is active
        if (admin.collegeId && admin.collegeId.status === 'inactive') {
            return res.status(403).json({ message: 'Your affiliated institution account is currently inactive. Contact system administration.' });
        }

        const collegeIdStr = admin.collegeId ? admin.collegeId._id.toString() : '';
        const collegeCode = admin.collegeId ? admin.collegeId.code : '';
        const collegeName = admin.collegeId ? admin.collegeId.name : '';
        const collegeLogo = admin.collegeId ? admin.collegeId.logo : '';

        const token = jwt.sign(
            { 
                id: admin._id, 
                role: 'admin', 
                collegeId: collegeIdStr, 
                collegeCode 
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        res.status(200).json({
            msg: "Login successfull",
            token,
            admin: {
                id: admin._id,
                name: admin.name || 'Administrator',
                email: admin.email,
                picture: admin.picture || '',
                role: admin.role || 'admin',
                collegeId: collegeIdStr,
                collegeCode,
                collegeName,
                collegeLogo
            }
        });
    } catch (error) {
        console.error('Error in admin login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get current admin profile
router.get('/profile/me', authMiddleware, async (req, res) => {
    try {
        const admin = await Admin.findById(req.user.id).select('-password').populate('collegeId', 'name code email contactNumber address logo');
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.status(200).json(admin);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update admin profile details
router.put('/profile/update', authMiddleware, async (req, res) => {
    try {
        const { name, picture, email, contactNumber } = req.body;
        const admin = await Admin.findById(req.user.id);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        if (name) admin.name = name;
        if (picture !== undefined) admin.picture = picture;
        if (contactNumber !== undefined) admin.contactNumber = contactNumber;
        if (email && email !== admin.email) {
            const emailTaken = await Admin.findOne({ email });
            if (emailTaken) {
                return res.status(400).json({ message: 'Email is already in use by another administrator' });
            }
            admin.email = email;
        }

        await admin.save();

        const updatedAdmin = await Admin.findById(admin._id).select('-password').populate('collegeId', 'name code email contactNumber address logo');

        res.status(200).json({
            message: 'Profile updated successfully',
            admin: updatedAdmin
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Change admin password
router.put('/profile/change-password', authMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current password and new password are required' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters long' });
        }

        const admin = await Admin.findById(req.user.id);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password' });
        }

        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(newPassword, salt);
        await admin.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Verify token
router.get('/verify-token', async (req, res) => {
    try {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await Admin.findById(decodedToken.id);
        if (!admin) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        res.status(200).json({ message: 'Authorized' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;