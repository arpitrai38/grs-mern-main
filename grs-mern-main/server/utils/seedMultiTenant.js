const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const College = require('../models/College');
const Admin = require('../models/Admin');
const Student = require('../models/Student');
const Complaint = require('../models/Complaint');
const ComplaintType = require('../models/ComplaintType');

const seedMultiTenant = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB.');

        const salt = await bcrypt.genSalt(10);
        const adminHash = await bcrypt.hash('Admin@123', salt);
        const studentHash = await bcrypt.hash('Student@123', salt);

        // 1. Seed Categories if empty
        const defaultCategories = ['Hostel & Accommodation', 'Mess & Cafeteria', 'Academic & Faculty', 'Campus Infrastructure', 'Library & Research'];
        const categoryDocs = {};
        for (const cat of defaultCategories) {
            let existing = await ComplaintType.findOne({ name: cat, collegeId: null });
            if (!existing) {
                existing = await ComplaintType.create({ name: cat, description: `General category for ${cat}`, collegeId: null });
            }
            categoryDocs[cat] = existing._id;
        }
        console.log('Global categories verified.');

        // 2. Seed College 1: ABC College of Engineering (COL001)
        let college1 = await College.findOne({ code: 'COL001' });
        if (!college1) {
            college1 = await College.create({
                name: 'ABC College of Engineering',
                code: 'COL001',
                email: 'contact@col001.edu',
                contactNumber: '+91 98765 43210',
                address: '100 Knowledge Boulevard, Campus East, Tech City',
                description: 'Premier engineering and technology institution specializing in advanced computing and applied sciences.'
            });
        }
        console.log(`College 1 ready: ${college1.name} [${college1.code}]`);

        let admin1 = await Admin.findOne({ email: 'admin.abc@col001.edu' });
        if (!admin1) {
            admin1 = await Admin.create({
                name: 'Dr. Alok Verma (Dean ABC)',
                email: 'admin.abc@col001.edu',
                password: adminHash,
                collegeId: college1._id,
                contactNumber: '+91 98765 43211',
                role: 'admin'
            });
        } else {
            admin1.collegeId = college1._id;
            await admin1.save();
        }
        console.log(`Admin 1 ready: ${admin1.email}`);

        let student1 = await Student.findOne({ email: 'rahul@col001.edu' });
        if (!student1) {
            student1 = await Student.create({
                name: 'Rahul Sharma',
                fatherName: 'Rajesh Sharma',
                email: 'rahul@col001.edu',
                gender: 'Male',
                password: studentHash,
                collegeId: college1._id,
                course: 'B.Tech Computer Science',
                address: 'Boys Hostel 2, Room 304, ABC Campus',
                mobile: '9876500001',
                dob: '2003-05-12',
                city: 'Tech City',
                pincode: '400001'
            });
        } else {
            student1.collegeId = college1._id;
            await student1.save();
        }
        console.log(`Student 1 ready: ${student1.email}`);

        // Seed Complaint for College 1
        const comp1Exists = await Complaint.findOne({ studentId: student1._id });
        if (!comp1Exists) {
            await Complaint.create({
                collegeId: college1._id,
                studentId: student1._id,
                complaintType: categoryDocs['Mess & Cafeteria'],
                complaint: 'Mess food quality issue: Cold and undercooked food served repeatedly during evening dinner in Mess Hall B.',
                status: 'pending'
            });
            console.log('Sample complaint created for College 1 (COL001).');
        }

        // 3. Seed College 2: XYZ Institute of Technology (COL002)
        let college2 = await College.findOne({ code: 'COL002' });
        if (!college2) {
            college2 = await College.create({
                name: 'XYZ Institute of Technology',
                code: 'COL002',
                email: 'contact@col002.edu',
                contactNumber: '+91 98765 88888',
                address: '40 Innovation Park, University Avenue, Metro City',
                description: 'State-of-the-art technological university recognized for interdisciplinary engineering and research.'
            });
        }
        console.log(`College 2 ready: ${college2.name} [${college2.code}]`);

        let admin2 = await Admin.findOne({ email: 'admin.xyz@col002.edu' });
        if (!admin2) {
            admin2 = await Admin.create({
                name: 'Prof. Sunita Rao (Dean XYZ)',
                email: 'admin.xyz@col002.edu',
                password: adminHash,
                collegeId: college2._id,
                contactNumber: '+91 98765 88889',
                role: 'admin'
            });
        } else {
            admin2.collegeId = college2._id;
            await admin2.save();
        }
        console.log(`Admin 2 ready: ${admin2.email}`);

        let student2 = await Student.findOne({ email: 'priya@col002.edu' });
        if (!student2) {
            student2 = await Student.create({
                name: 'Priya Patel',
                fatherName: 'Mahesh Patel',
                email: 'priya@col002.edu',
                gender: 'Female',
                password: studentHash,
                collegeId: college2._id,
                course: 'B.Tech Information Technology',
                address: 'Girls Hostel A, Room 102, XYZ Campus',
                mobile: '9876500002',
                dob: '2003-08-20',
                city: 'Metro City',
                pincode: '500001'
            });
        } else {
            student2.collegeId = college2._id;
            await student2.save();
        }
        console.log(`Student 2 ready: ${student2.email}`);

        // Seed Complaint for College 2
        const comp2Exists = await Complaint.findOne({ studentId: student2._id });
        if (!comp2Exists) {
            await Complaint.create({
                collegeId: college2._id,
                studentId: student2._id,
                complaintType: categoryDocs['Campus Infrastructure'],
                complaint: 'Computer Lab 4 air conditioning and three workstations fail to power on during afternoon practical sessions.',
                status: 'notProcessed'
            });
            console.log('Sample complaint created for College 2 (COL002).');
        }

        console.log('\n===========================================');
        console.log('MULTI-TENANT SEEDING COMPLETED SUCCESSFULLY');
        console.log('===========================================');
        console.log('College 1: ABC College of Engineering (COL001)');
        console.log('  - Admin: admin.abc@col001.edu  | Password: Admin@123');
        console.log('  - Student: rahul@col001.edu    | Password: Student@123');
        console.log('College 2: XYZ Institute of Technology (COL002)');
        console.log('  - Admin: admin.xyz@col002.edu  | Password: Admin@123');
        console.log('  - Student: priya@col002.edu    | Password: Student@123');
        console.log('===========================================\n');

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
};

seedMultiTenant();
