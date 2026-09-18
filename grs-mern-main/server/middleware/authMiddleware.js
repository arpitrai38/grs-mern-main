const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Student = require('../models/Student');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'Authorization token required' });
        }

        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();
        if (!token) {
            return res.status(401).json({ message: 'Malformed authorization token' });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (jwtErr) {
            return res.status(401).json({ message: 'Invalid or expired session token. Please log in again.' });
        }

        req.user = decoded;

        // Ensure collegeId is present for tenant isolation
        if (!req.user.collegeId) {
            if (req.user.role === 'admin') {
                const adminDoc = await Admin.findById(req.user.id).select('collegeId role');
                if (adminDoc && adminDoc.collegeId) {
                    req.user.collegeId = adminDoc.collegeId.toString();
                    req.user.role = adminDoc.role || 'admin';
                }
            } else {
                const studentDoc = await Student.findById(req.user.id).select('collegeId role');
                if (studentDoc && studentDoc.collegeId) {
                    req.user.collegeId = studentDoc.collegeId.toString();
                    req.user.role = 'student';
                }
            }
        }

        next();
    } catch (error) {
        console.error('authMiddleware error:', error);
        res.status(500).json({ message: 'Internal server error in authorization' });
    }
};

const requireAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied: Administrator privileges required' });
    }
    next();
};

const requireCollege = (req, res, next) => {
    if (!req.user?.collegeId) {
        return res.status(403).json({ message: 'Access denied: Institution context missing' });
    }
    next();
};

authMiddleware.requireAdmin = requireAdmin;
authMiddleware.requireCollege = requireCollege;

module.exports = authMiddleware;