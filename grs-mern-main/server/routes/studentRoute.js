const express = require('express');
const Student = require('../models/Student');
const College = require('../models/College');
const router = express.Router();
const bcrypt = require('bcrypt');
const authMiddleware = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');

// Register a new student (Enforces valid College ID)
router.post('/register', async (req, res) => {
    try {
        const { 
            name, fatherName, email, gender, password, address, 
            mobile, dob, sessionId, city, pincode, course, collegeId, picture 
        } = req.body;

        if (!name || !email || !password || !collegeId) {
            return res.status(400).json({ message: 'Name, Email, Password, and College selection are required.' });
        }

        // Validate College exists & is active
        const college = await College.findById(collegeId);
        if (!college || college.status === 'inactive') {
            return res.status(400).json({ message: 'Selected college is invalid or inactive.' });
        }

        const studentExists = await Student.findOne({ email: email.toLowerCase().trim() });
        if (studentExists) {
            return res.status(400).json({ message: 'A student account with this email already exists.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const student = new Student({
            name: name.trim(),
            fatherName: fatherName ? fatherName.trim() : '',
            email: email.toLowerCase().trim(),
            gender: gender || 'Male',
            password: hashedPassword,
            address: address ? address.trim() : '',
            mobile: mobile ? mobile.trim() : '',
            dob: dob || '',
            sessionId: sessionId || null,
            city: city ? city.trim() : '',
            pincode: pincode ? pincode.trim() : '',
            course: course ? course.trim() : '',
            collegeId,
            picture: picture || ''
        });
        await student.save();
        res.status(201).json({ message: 'Student registered successfully' });
    } catch (error) {
        console.error('Error in student register:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Student Login (Encodes tenant context in JWT)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const student = await Student.findOne({ email: email.toLowerCase().trim() }).populate('collegeId', 'name code status logo');
        if (!student) {
            return res.status(401).json({ message: 'Invalid credentials. Student not found.' });
        }

        const isPasswordValid = await bcrypt.compare(password, student.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials. Password incorrect.' });
        }

        if (student.collegeId && student.collegeId.status === 'inactive') {
            return res.status(403).json({ message: 'Your institution account is inactive. Please contact administration.' });
        }

        const collegeIdStr = student.collegeId ? student.collegeId._id.toString() : '';
        const collegeCode = student.collegeId ? student.collegeId.code : '';
        const collegeName = student.collegeId ? student.collegeId.name : '';
        const collegeLogo = student.collegeId ? student.collegeId.logo : '';

        const token = jwt.sign(
            { 
                id: student._id, 
                role: 'student', 
                collegeId: collegeIdStr, 
                collegeCode 
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        res.status(200).json({
            msg: "Login successfull",
            token,
            student: {
                id: student._id,
                name: student.name,
                email: student.email,
                picture: student.picture,
                role: 'student',
                collegeId: collegeIdStr,
                collegeCode,
                collegeName,
                collegeLogo
            }
        });
    } catch (error) {
        console.error('Error in student login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get students for Admin (STRICT TENANT ISOLATION: Scoped to req.user.collegeId)
router.get('/all', authMiddleware, async (req, res) => {
    try {
        if (!req.user?.collegeId) {
            return res.status(403).json({ message: 'Access denied: No institution context found' });
        }

        const students = await Student.find({ collegeId: req.user.collegeId })
            .select('-password')
            .populate('collegeId', 'name code')
            .populate('sessionId', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json(students);
    } catch (error) {
        console.error('Error in /student/all:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// get current authenticated student profile
router.get('/profile/me', authMiddleware, async (req, res) => {
    try {
        const student = await Student.findById(req.user.id)
            .select('-password')
            .populate('collegeId', 'name code email logo')
            .populate('sessionId', 'name');
        if (!student) {
            return res.status(404).json({ message: 'Student profile not found' });
        }
        res.status(200).json(student);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// update current authenticated student profile
router.put('/profile/update', authMiddleware, async (req, res) => {
    try {
        const { name, fatherName, gender, address, mobile, dob, city, pincode, course, picture } = req.body;
        const student = await Student.findById(req.user.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        if (name) student.name = name;
        if (fatherName) student.fatherName = fatherName;
        if (gender) student.gender = gender;
        if (address) student.address = address;
        if (mobile) student.mobile = mobile;
        if (dob) student.dob = dob;
        if (city) student.city = city;
        if (pincode) student.pincode = pincode;
        if (course) student.course = course;
        if (picture !== undefined) student.picture = picture;

        await student.save();

        const updatedStudent = await Student.findById(student._id)
            .select('-password')
            .populate('collegeId', 'name code logo')
            .populate('sessionId', 'name');

        res.status(200).json({
            message: 'Profile updated successfully',
            student: {
                id: updatedStudent._id,
                name: updatedStudent.name,
                email: updatedStudent.email,
                picture: updatedStudent.picture || ''
            },
            profile: updatedStudent
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// change student password
router.put('/profile/change-password', authMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current password and new password are required' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters long' });
        }

        const student = await Student.findById(req.user.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, student.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password' });
        }

        const salt = await bcrypt.genSalt(10);
        student.password = await bcrypt.hash(newPassword, salt);
        await student.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// get particular student
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const student = await Student.findById(req.params.id).populate('collegeId', 'name').populate('sessionId', 'name')
        res.status(200).json(student)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})
// update student
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true })
        res.status(200).json(student)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})
// soft delete student
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true })
        res.status(200).json({ message: 'Student deleted' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})
// verify students
router.put('/:id/verify', authMiddleware, async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true })
        res.status(200).json({ message: 'Student verified' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})
// unverify students
router.put('/:id/unverify', authMiddleware, async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(req.params.id, { isVerified: false }, { new: true })
        res.status(200).json({ message: 'Student unverified' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})
// get unverified students
router.get('/unverified', authMiddleware, async (req, res) => {
    try {
        const students = await Student.find({ isVerified: false })
        res.status(200).json(students)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})
// get verified students
router.get('/verified', authMiddleware, async (req, res) => {
    try {
        const students = await Student.find({ isVerified: true })
        res.status(200).json(students)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})
// get deleted students
router.get('/deleted', authMiddleware, async (req, res) => {
    try {
        const students = await Student.find({ isDeleted: true })
        res.status(200).json(students)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})
// get active students
router.get('/active', authMiddleware, async (req, res) => {
    try {
        const students = await Student.find({ status: 'active' })
        res.status(200).json(students)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})
// get inactive students
router.get('/inactive', authMiddleware, async (req, res) => {
    try {
        const students = await Student.find({ status: 'inactive' })
        res.status(200).json(students)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})
// get students by college id
router.get('/college/:id', authMiddleware, async (req, res) => {
    try {
        const students = await Student.find({ collegeId: req.params.id })
        res.status(200).json(students)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})
// get students by session id
router.get('/session/:id', authMiddleware, async (req, res) => {
    try {
        const students = await Student.find({ sessionId: req.params.id })
        res.status(200).json(students)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})
module.exports = router