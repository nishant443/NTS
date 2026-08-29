// Run with: node seed/addShivaKumarWork.js
// Adds daily work entries for Shiva Kumar at San Engineering
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Customer = require('../models/Customer');
const DailyWork = require('../models/DailyWork');

const shivaKumarWorkEntries = [
  {
    date: '18/08/2026',
    companyVisited: 'San Engineering and Locomotive',
    machine: 'Mazak integrex I-200',
    workDescription: `Mazak integrex I-200 machine axis lock check
• Some locks not available, made it
• One part turn and checked accuracy (for 200 length 25microne found)`,
  },
  {
    date: '19/08/2026',
    companyVisited: 'San Engineering and Locomotive',
    machine: 'Mazak integrex I-200',
    workDescription: `Machine fully cleaned
• Mazak integrex I-200 machine axis locked
• Coolant connections removed
• Coolant tank removed`,
  },
  {
    date: '20/08/2026',
    companyVisited: 'San Engineering and Locomotive',
    machine: 'Mazak integrex I-200',
    workDescription: `Machine all parts cleaned
• Bed lock nut removed
• Door lock made and locked
• All connections removed and disconnected
• Grease applied
• Pendant wrapped and locked`,
  },
  {
    date: '21/08/2026',
    companyVisited: 'San Engineering and Locomotive',
    machine: 'Mazak VNC',
    workDescription: `Mazak VNC relay module installed
• Mazak variaxis-730 machine geometry checked and noted`,
  },
  {
    date: '22/08/2026',
    companyVisited: 'San Engineering and Locomotive',
    machine: 'Mazak variaxis-730',
    workDescription: `Mazak variaxis-730 machine cleaning and axis lock manufacturing`,
  },
  {
    date: '24/08/2026',
    companyVisited: 'San Engineering and Locomotive',
    machine: 'Mazak variaxis-730 & HMC',
    workDescription: `Mazak variaxis-730 machine cleaned
• Coolant tank dismantled and disconnected
• Mazak HMC machine spindle remove preparation`,
  },
  {
    date: '25/08/2026',
    companyVisited: 'San Engineering and Locomotive',
    machine: 'Mazak HMC',
    workDescription: `Mazak HMC machine spindle all connections disconnected
• Spindle removed
• New spindle preparation done`,
  },
];

const run = async () => {
  try {
    await connectDB();

    // Find or create San Engineering customer
    let customer = await Customer.findOne({
      companyName: { $regex: /San Engineering/i },
    });

    if (!customer) {
      customer = await Customer.create({
        companyName: 'San Engineering and Locomotive',
        country: 'India',
        status: 'Customer',
      });
      console.log('✓ Created customer: San Engineering and Locomotive');
    } else {
      console.log('✓ Found customer: San Engineering and Locomotive');
    }

    // Find Shiva Kumar
    let shivaKumar = await User.findOne({
      name: { $regex: /Shiva Kumar/i },
    });

    if (!shivaKumar) {
      // Create Shiva Kumar if doesn't exist
      shivaKumar = await User.create({
        name: 'Shiva Kumar',
        email: 'shivakumar@nutantechsolutions.com',
        password: 'Password@123',
        role: 'employee',
        designation: 'Service Technician',
        department: 'Field Service',
        joiningDate: new Date('2026-01-01'),
        isActive: true,
      });
      console.log('✓ Created employee: Shiva Kumar');
    } else {
      console.log('✓ Found employee: Shiva Kumar');
    }

    // Add daily work entries
    const workEntries = shivaKumarWorkEntries.map((entry) => ({
      employee: shivaKumar._id,
      date: new Date(entry.date.split('/').reverse().join('-')),
      customer: customer._id,
      companyVisited: entry.companyVisited,
      productsDiscussed: entry.machine,
      servicePerformed: entry.workDescription,
      workDescription: entry.workDescription,
      status: 'Completed',
      remarks: 'San Engineering maintenance and repair work',
    }));

    const createdWorks = await DailyWork.insertMany(workEntries);
    console.log(`✓ Added ${createdWorks.length} daily work entries for Shiva Kumar`);

    console.log('\n✅ All work entries have been successfully added for Shiva Kumar!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
};

run();
