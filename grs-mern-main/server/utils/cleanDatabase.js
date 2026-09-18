const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const College = require('../models/College');
const Admin = require('../models/Admin');
const Student = require('../models/Student');
const Complaint = require('../models/Complaint');
const ComplaintType = require('../models/ComplaintType');

const cleanDatabase = async () => {
    try {
        console.log('Connecting to MongoDB database...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        console.log('\nPurging all dummy/test records...');

        // Delete all complaints
        const compRes = await Complaint.deleteMany({});
        console.log(`- Deleted ${compRes.deletedCount} complaint record(s).`);

        // Delete all students
        const stuRes = await Student.deleteMany({});
        console.log(`- Deleted ${stuRes.deletedCount} student record(s).`);

        // Delete all admins
        const adminRes = await Admin.deleteMany({});
        console.log(`- Deleted ${adminRes.deletedCount} administrator record(s).`);

        // Delete all colleges
        const colRes = await College.deleteMany({});
        console.log(`- Deleted ${colRes.deletedCount} college record(s).`);

        // Clean custom college complaint types (keep standard global categories)
        const typeDelRes = await ComplaintType.deleteMany({ collegeId: { $ne: null } });
        console.log(`- Deleted ${typeDelRes.deletedCount} custom college category record(s).`);

        // Ensure clean global default categories exist
        const standardCategories = [
            { name: 'Academic & Faculty', description: 'Curriculum, lectures, attendance, and faculty support issues' },
            { name: 'Hostel & Living', description: 'Room maintenance, electricity, plumbing, and accommodation concerns' },
            { name: 'Mess & Food Services', description: 'Dining hall hygiene, meal quality, and dietary grievances' },
            { name: 'Campus Infrastructure', description: 'Laboratories, classrooms, Wi-Fi connectivity, and facilities' },
            { name: 'Library & Learning Resources', description: 'Book availability, digital repository access, and study spaces' },
            { name: 'Examination & Evaluation', description: 'Admit cards, grading, mark sheets, and re-evaluation requests' },
            { name: 'Administrative & Accounts', description: 'Fees, documentation, bonafide certificates, and scholarship queries' }
        ];

        for (const cat of standardCategories) {
            const exists = await ComplaintType.findOne({ name: cat.name, collegeId: null });
            if (!exists) {
                await ComplaintType.create({ ...cat, collegeId: null });
            }
        }
        console.log(`- Verified ${standardCategories.length} standard institutional categories.`);

        console.log('\n=============================================');
        console.log('✨ DATABASE CLEANED & RESET TO FRESH STATE! ✨');
        console.log('=============================================');
        console.log('All dummy colleges, admins, students, and grievances have been removed.');
        console.log('The platform is 100% fresh and ready for real institutional registration.');
        console.log('=============================================\n');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error cleaning database:', error);
        process.exit(1);
    }
};

cleanDatabase();
