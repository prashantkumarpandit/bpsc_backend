// run with `node seed.js` after setting environment variables
require('dotenv').config();
const { User } = require('./database');

async function seed() {
    try {
        const existingAdmin = await User.findOne({ role: 'Admin' });
        if (existingAdmin) {
            console.log('Admin already exists');
            process.exit(0);
        }

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPass = process.env.ADMIN_PASS;

        if (!adminEmail || !adminPass) {
            console.error('ADMIN_EMAIL and ADMIN_PASS must be provided in environment');
            process.exit(1);
        }

        const admin = new User({
            name: 'Admin',
            email: adminEmail,
            password: adminPass,
            role: 'Admin'
        });
        await admin.save();
        console.log('Admin created successfully');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
setTimeout(seed, 2000); // Wait for connection
