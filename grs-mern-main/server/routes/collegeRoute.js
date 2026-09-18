const express = require('express');
const router = express.Router();
const College = require('../models/College');
const Admin = require('../models/Admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');

// Helper to auto-generate college code if not provided
const generateCollegeCode = async () => {
    const count = await College.countDocuments();
    let num = count + 1;
    let code = `COL${String(num).padStart(3, '0')}`;
    while (await College.findOne({ code })) {
        num++;
        code = `COL${String(num).padStart(3, '0')}`;
    }
    return code;
};

// 1. Register College + Administrator (Public Onboarding)
router.post('/register', async (req, res) => {
    try {
        const {
            collegeName,
            collegeCode,
            collegeEmail,
            contactNumber,
            address,
            description,
            logo,
            collegeLogo,
            adminName,
            adminEmail,
            password
        } = req.body;

        if (!collegeName || !collegeEmail || !adminEmail || !password) {
            return res.status(400).json({ 
                message: 'College Name, College Email, Admin Email, and Password are required.' 
            });
        }

        // Determine unique college code
        let code = collegeCode ? collegeCode.trim().toUpperCase() : '';
        if (!code) {
            code = await generateCollegeCode();
        } else {
            const existingCode = await College.findOne({ code });
            if (existingCode) {
                return res.status(400).json({ 
                    message: `College Code '${code}' is already in use. Please select a unique identifier.` 
                });
            }
        }

        // Check if admin email already exists
        const existingAdmin = await Admin.findOne({ email: adminEmail.toLowerCase().trim() });
        if (existingAdmin) {
            return res.status(400).json({ 
                message: 'An administrator account with this email address already exists.' 
            });
        }

        // Create College
        const college = new College({
            name: collegeName.trim(),
            code,
            email: collegeEmail.toLowerCase().trim(),
            contactNumber: contactNumber ? contactNumber.trim() : '',
            address: address ? address.trim() : '',
            description: description ? description.trim() : `Institutional Grievance Portal for ${collegeName.trim()}`,
            logo: logo || collegeLogo || ''
        });
        await college.save();

        // Hash Password & Create Admin
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const admin = new Admin({
            name: adminName ? adminName.trim() : 'College Administrator',
            email: adminEmail.toLowerCase().trim(),
            password: hashedPassword,
            contactNumber: contactNumber ? contactNumber.trim() : '',
            collegeId: college._id,
            role: 'admin'
        });
        await admin.save();

        // Sign JWT Token with college tenant context
        const token = jwt.sign(
            { 
                id: admin._id, 
                role: 'admin', 
                collegeId: college._id.toString(), 
                collegeCode: college.code 
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        res.status(201).json({
            message: 'College and Master Administrator registered successfully!',
            token,
            college: {
                id: college._id,
                name: college.name,
                code: college.code,
                email: college.email,
                contactNumber: college.contactNumber,
                logo: college.logo
            },
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                collegeId: college._id,
                collegeCode: college.code,
                collegeName: college.name,
                collegeLogo: college.logo
            }
        });
    } catch (error) {
        console.error('Error in /college/register:', error);
        res.status(500).json({ message: 'Internal server error during college registration.' });
    }
});

// 2. Get all colleges (Public - for student registration dropdown & directory)
router.get('/get-all', async (req, res) => {
    try {
        const colleges = await College.find({ status: 'active' })
            .select('name code email description logo status')
            .sort({ name: 1 });
        res.status(200).json(colleges);
    } catch (error) {
        console.error('Error in /college/get-all:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// 3. Get currently authenticated college details
router.get('/my-college', authMiddleware, async (req, res) => {
    try {
        if (!req.user?.collegeId) {
            return res.status(400).json({ message: 'No college associated with this session' });
        }
        const college = await College.findById(req.user.collegeId);
        if (!college) {
            return res.status(404).json({ message: 'College record not found' });
        }
        res.status(200).json(college);
    } catch (error) {
        console.error('Error in /college/my-college:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// 4. Update currently authenticated college details (Admin only)
router.put('/update-my-college', authMiddleware, authMiddleware.requireAdmin, async (req, res) => {
    try {
        const { name, email, contactNumber, address, description, logo } = req.body;
        const college = await College.findById(req.user.collegeId);
        if (!college) {
            return res.status(404).json({ message: 'College record not found' });
        }

        if (name) college.name = name.trim();
        if (email) college.email = email.toLowerCase().trim();
        if (contactNumber !== undefined) college.contactNumber = contactNumber.trim();
        if (address !== undefined) college.address = address.trim();
        if (description !== undefined) college.description = description.trim();
        if (logo !== undefined) college.logo = logo;

        await college.save();
        res.status(200).json({ message: 'College details updated successfully', college });
    } catch (error) {
        console.error('Error in /college/update-my-college:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// 5. Legacy Create College (Admin)
router.post('/create', authMiddleware, async (req, res) => {
    try {
        const { name, description, code, email } = req.body;
        const assignedCode = code ? code.trim().toUpperCase() : await generateCollegeCode();
        const college = new College({
            name: name.trim(),
            description: description || '',
            code: assignedCode,
            email: email ? email.toLowerCase().trim() : `info@${assignedCode.toLowerCase()}.edu`
        });
        await college.save();
        res.status(201).json({ message: 'College created successfully', college });
    } catch (error) {
        console.error('Error in /college/create:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// 6. Delete college
router.delete('/delete/:id', authMiddleware, authMiddleware.requireAdmin, async (req, res) => {
    try {
        const college = await College.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'College deleted', college });
    } catch (error) {
        console.error('Error in /college/delete:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;