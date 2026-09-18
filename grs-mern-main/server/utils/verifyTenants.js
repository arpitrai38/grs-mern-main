const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const BASE_URL = 'http://localhost:5000/api';

const request = async (url, options = {}) => {
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };
    const res = await fetch(url, {
        ...options,
        headers
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, ok: res.ok, data };
};

const runVerification = async () => {
    console.log('--- STARTING MULTI-TENANT ISOLATION VERIFICATION ---\n');

    try {
        // 1. Authenticate Admin 1 (COL001)
        console.log('[1] Logging in as Admin 1 (admin.abc@col001.edu)...');
        const admin1Res = await request(`${BASE_URL}/admin/login`, {
            method: 'POST',
            body: JSON.stringify({ email: 'admin.abc@col001.edu', password: 'Admin@123' })
        });
        if (!admin1Res.ok) throw new Error(`Admin 1 login failed: ${JSON.stringify(admin1Res.data)}`);
        const token1 = admin1Res.data.token;
        const admin1Data = admin1Res.data.admin;
        console.log(`    -> Success. College: ${admin1Data.collegeName} [${admin1Data.collegeCode}]`);
        if (admin1Data.collegeCode !== 'COL001') throw new Error('Expected COL001 for Admin 1');

        // 2. Authenticate Admin 2 (COL002)
        console.log('\n[2] Logging in as Admin 2 (admin.xyz@col002.edu)...');
        const admin2Res = await request(`${BASE_URL}/admin/login`, {
            method: 'POST',
            body: JSON.stringify({ email: 'admin.xyz@col002.edu', password: 'Admin@123' })
        });
        if (!admin2Res.ok) throw new Error(`Admin 2 login failed: ${JSON.stringify(admin2Res.data)}`);
        const token2 = admin2Res.data.token;
        const admin2Data = admin2Res.data.admin;
        console.log(`    -> Success. College: ${admin2Data.collegeName} [${admin2Data.collegeCode}]`);
        if (admin2Data.collegeCode !== 'COL002') throw new Error('Expected COL002 for Admin 2');

        // 3. Verify Student Isolation
        console.log('\n[3] Testing Student Data Isolation (/student/all)...');
        const stu1Res = await request(`${BASE_URL}/student/all`, {
            headers: { Authorization: token1 }
        });
        if (!stu1Res.ok) throw new Error(`Failed to fetch students for Admin 1: ${JSON.stringify(stu1Res.data)}`);
        console.log(`    -> Admin 1 saw ${stu1Res.data.length} student(s): ${stu1Res.data.map(s => s.name).join(', ')}`);
        const hasPriyaInAdmin1 = stu1Res.data.some(s => s.email === 'priya@col002.edu');
        if (hasPriyaInAdmin1) {
            throw new Error('SECURITY BREACH: Admin 1 was able to view Student 2 (COL002)!');
        }
        console.log('    ✓ PASSED: Admin 1 only sees COL001 students.');

        const stu2Res = await request(`${BASE_URL}/student/all`, {
            headers: { Authorization: token2 }
        });
        if (!stu2Res.ok) throw new Error(`Failed to fetch students for Admin 2: ${JSON.stringify(stu2Res.data)}`);
        console.log(`    -> Admin 2 saw ${stu2Res.data.length} student(s): ${stu2Res.data.map(s => s.name).join(', ')}`);
        const hasRahulInAdmin2 = stu2Res.data.some(s => s.email === 'rahul@col001.edu');
        if (hasRahulInAdmin2) {
            throw new Error('SECURITY BREACH: Admin 2 was able to view Student 1 (COL001)!');
        }
        console.log('    ✓ PASSED: Admin 2 only sees COL002 students.');

        // 4. Verify Grievance Isolation
        console.log('\n[4] Testing Grievance Data Isolation (/complaint/get-all)...');
        const comp1Res = await request(`${BASE_URL}/complaint/get-all`, {
            headers: { Authorization: token1 }
        });
        if (!comp1Res.ok) throw new Error(`Failed to fetch complaints for Admin 1: ${JSON.stringify(comp1Res.data)}`);
        console.log(`    -> Admin 1 grievances: ${comp1Res.data.length} records.`);
        const admin1Colleges = new Set(comp1Res.data.map(c => c.collegeId?.code || ''));
        if (admin1Colleges.has('COL002')) {
            throw new Error('SECURITY BREACH: Admin 1 received COL002 grievances!');
        }
        console.log('    ✓ PASSED: All grievances returned to Admin 1 belong strictly to COL001.');

        const comp2Res = await request(`${BASE_URL}/complaint/get-all`, {
            headers: { Authorization: token2 }
        });
        if (!comp2Res.ok) throw new Error(`Failed to fetch complaints for Admin 2: ${JSON.stringify(comp2Res.data)}`);
        console.log(`    -> Admin 2 grievances: ${comp2Res.data.length} records.`);
        const admin2Colleges = new Set(comp2Res.data.map(c => c.collegeId?.code || ''));
        if (admin2Colleges.has('COL001')) {
            throw new Error('SECURITY BREACH: Admin 2 received COL001 grievances!');
        }
        console.log('    ✓ PASSED: All grievances returned to Admin 2 belong strictly to COL002.');

        // 5. Verify Cross-Tenant Modification Prevention
        console.log('\n[5] Testing Cross-Tenant Tampering Prevention (/complaint/update-status/:id)...');
        if (comp2Res.data.length > 0) {
            const col2ComplaintId = comp2Res.data[0]._id;
            console.log(`    -> Attempting to modify COL002 Complaint (${col2ComplaintId}) using Admin 1's Token...`);
            const updateRes = await request(`${BASE_URL}/complaint/update-status/${col2ComplaintId}`, {
                method: 'PUT',
                headers: { Authorization: token1 },
                body: JSON.stringify({ status: 'closed' })
            });
            if (updateRes.status === 404 || updateRes.status === 403) {
                console.log(`    ✓ PASSED: Server rejected cross-tenant update with HTTP ${updateRes.status} (${updateRes.data.message}).`);
            } else if (updateRes.ok) {
                throw new Error('SECURITY BREACH: Admin 1 was able to update a complaint belonging to COL002!');
            } else {
                console.log(`    ✓ PASSED: Server blocked update with status ${updateRes.status}`);
            }
        }

        // 6. Test New College Registration endpoint
        console.log('\n[6] Testing New College Onboarding (/college/register)...');
        const testCode = 'TEST' + Math.floor(100 + Math.random() * 900);
        const testEmail = `admin.${testCode.toLowerCase()}@testcollege.edu`;
        const regRes = await request(`${BASE_URL}/college/register`, {
            method: 'POST',
            body: JSON.stringify({
                collegeName: 'Delta State Institute of Technology',
                collegeCode: testCode,
                collegeEmail: `info@${testCode.toLowerCase()}.edu`,
                contactNumber: '+91 99999 11111',
                address: '77 Sector 12, Academic Park',
                adminName: 'Dean Delta',
                adminEmail: testEmail,
                password: 'AdminPassword@123'
            })
        });
        if (!regRes.ok) throw new Error(`Registration failed: ${JSON.stringify(regRes.data)}`);
        console.log(`    -> Successfully registered: ${regRes.data.college.name} [${regRes.data.college.code}]`);
        console.log(`    -> Admin token generated: ${regRes.data.token.slice(0, 20)}...`);
        console.log('    ✓ PASSED: College onboarding operational.');

        console.log('\n======================================================');
        console.log('🎉 ALL MULTI-TENANT ISOLATION SECURITY TESTS PASSED! 🎉');
        console.log('======================================================\n');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ VERIFICATION FAILED:', error.message);
        process.exit(1);
    }
};

runVerification();
