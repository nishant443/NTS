// Run with: npm run seed
// Replaces all business data with the transactions supplied for NTS.
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Payment = require('../models/Payment');
const DailyWork = require('../models/DailyWork');
const Document = require('../models/Document');
const FollowUp = require('../models/FollowUp');
const Invoice = require('../models/Invoice');
const Notification = require('../models/Notification');
const PurchaseOrder = require('../models/PurchaseOrder');
const Quotation = require('../models/Quotation');

const customers = [
  'MULTI TECK ENGINEERING SOLUTIONS', 'San Engineering and Locomotive', 'JRVD DEFSPACE TECHNOLOGIES',
  'WENDT (INDIA) LIMITED', 'NIHARIKA AEROSPACE', 'ORDNANCE FACTORY KANPUR', 'VPI INNOVATIVE SOLUTIONS',
  'Nova International Tools', 'LOKESH MACHINES LIMITED', 'Pragati Automation Pvt. Ltd.', 'Meril health care',
  'Yamazaki Mazak India Pvt Ltd', 'IFB INDUSTRIES LTD', 'RIPPLE TECHNOLOGIES', 'Sphoorti Machine Tools Pvt. Ltd',
];

const transactions = [
  ['23/08/2026', 26, customers[0], 16520, 16520], ['18/08/2026', 25, customers[1], 18290, 18290],
  ['14/08/2026', 24, customers[2], 25016, 25016], ['14/08/2026', 23, customers[0], 23010, 0],
  ['14/08/2026', 22, customers[3], 17700, 17700], ['10/08/2026', 21, customers[4], 67378, 0],
  ['05/08/2026', 20, customers[0], 33040, 0], ['01/08/2026', 19, customers[0], 199656, 55706],
  ['01/08/2026', 18, customers[2], 135700, 15700], ['25/07/2026', 17, customers[5], 5074, 5074],
  ['24/07/2026', 16, customers[6], 17700, 0], ['22/07/2026', 15, customers[7], 4720, 4720],
  ['15/07/2026', 14, customers[8], 345740, 0], ['25/06/2026', 13, customers[9], 18880, 80],
  ['19/06/2026', 12, customers[10], 522175, 0], ['13/06/2026', 11, customers[2], 0, 0],
  ['13/06/2026', 10, customers[2], 0, 0], ['11/06/2026', 9, customers[0], 16520, 280],
  ['09/06/2026', 8, customers[7], 19470, 320], ['29/05/2026', 7, customers[11], 60910, 545],
  ['19/05/2026', 6, customers[7], 18880, 0], ['15/05/2026', 5, customers[14], 11800, 0],
  ['06/05/2026', 4, customers[12], 78718, 600], ['06/05/2026', 3, customers[13], 14160, 14160],
  ['19/04/2026', 2, customers[9], 18880, 0], ['07/04/2026', 1, customers[11], 300660, 2570],
];

const serviceReports = [
  ['01/08/2026', 'Wendt India', '', 'Machine all parts disconnected\nMachine shifted to another place\nAll disconnected parts connected\nMachine leveling done\nMachine all functions checked\nMachine handover to customer'],
  ['03/08/2026', 'Niharika Aerospace', '', 'Powerpack screws tightened and cover assembled\nRotary table, ATC arm, ATC slide oil changed\nATC door cylinder arm new lock spacer made and screw tightened\nATC alignment checked\nService report submitted\nMachine handover to customer'],
  ['03/08/2026', 'Multi Teck', '', 'Service report submitted\nSpindle heat and noise checked - OK'],
  ['05/08/2026', 'Niharika Aerospace', '', 'UPS fixed to the machine\nFunction checked - OK'],
  ['05/08/2026', 'Sphoorti', '', 'Machine service parts marked and discussed'],
  ['06/08/2026', 'GE BE', 'Hardinge', 'Machine geometry checked\nY-direction correction done in turret\nMachine handover to customer'],
  ['06/08/2026', 'GE BE', 'Mazak', 'Machine geometry checked\nY-direction correction to be done\nTurret parts removed'],
  ['07/08/2026', 'GE BE', 'Mazak', 'Turret alignment done and removed parts assembled\nMachine handover to customer for component trial'],
  ['07/08/2026', 'GE BE', 'Hardinge', 'Component trial done and measuring arm correction done in parameter'],
  ['08/08/2026', 'GE BE', 'Mazak', 'Component trial check\nNo variation in size\nMachine handover to customer'],
  ['10/08/2026', 'Niharika Aerospace', 'Jyoti', 'Coolant motor trip\nChecked MCB, contactor, wiring\nWiring fault found, spare wire changed\nFunction checked and handover to customer'],
  ['11/08/2026', 'GE BE', 'Mazak', 'Oil leakage complaint\nMilling unit removed and checked - no leaks found\nTurret close plate O-ring not sitting properly, O-ring fixed\nChecked function - no leaks found'],
  ['12/08/2026', 'JJG Aero', 'Mazak VC-Ez410', 'Machine installation completed'],
  ['13/08/2026', 'JJG Aero', 'Mazak VC-Ez410', 'Machine installation completed'],
  ['13/08/2026', 'JJG Aero', '', '2nd machine - 4th axis installed'],
  ['14/08/2026', 'JRVD', '', 'New magazine drive battery changed\nVTC150 magazine encoder changed to VTC200 machine\nMazak 200 machine magazine reference done\nTool change function checked\nSpindle motor issue not solved - motor to be repaired\n2 days tax invoice, last service balance invoice and service report given'],
  ['15/08/2026', 'Ripple Technology', '', 'Mandrel runout checked and informed to customer'],
  ['15/08/2026', 'TMS', '', 'Turn-mill spindle alarm checked\nSensor details given to sellers'],
  ['17/08/2026', 'Inventory', 'Mazak', 'Y-axis ballscrew removed\nSupport end bearings found damaged'],
];

const run = async () => {
  await connectDB();
  await Promise.all([
    User.deleteMany({}), Customer.deleteMany({}), Payment.deleteMany({}), DailyWork.deleteMany({}),
    Document.deleteMany({}), FollowUp.deleteMany({}), Invoice.deleteMany({}), Notification.deleteMany({}),
    PurchaseOrder.deleteMany({}), Quotation.deleteMany({}),
  ]);

  const admin = await User.create({
    name: 'NTS Admin', email: 'admin@nutantechsolutions.com', password: 'Admin@123', role: 'admin',
    designation: 'Founder', department: 'Management',
  });
  const employee = await User.create({
    name: 'NTS Employee', email: 'employee@nutantechsolutions.com', password: 'Employee@123', role: 'employee',
    designation: 'Sales Executive', department: 'Sales',
  });
  const customerDocuments = await Customer.insertMany(customers.map((companyName) => ({
    companyName, country: 'India', status: 'Customer', createdBy: admin._id,
  })));
  const customerIds = new Map(customerDocuments.map((customer) => [customer.companyName, customer._id]));

  await Payment.insertMany(transactions.map(([date, invoice, companyName, invoiceAmount, balanceAmount]) => ({
    customer: customerIds.get(companyName), invoiceNumber: `NTS/26-27/${invoice}`,
    invoiceDate: new Date(date.split('/').reverse().join('-')), invoiceAmount,
    amountReceived: invoiceAmount - balanceAmount, balanceAmount,
    paymentStatus: invoiceAmount === 0 ? 'Cancelled' : balanceAmount <= 0 ? 'Paid' : (invoiceAmount - balanceAmount) > 0 ? 'Partial' : 'Pending',
    paymentDueDate: new Date(date.split('/').reverse().join('-')), mode: 'NEFT', createdBy: admin._id,
  })));
  await DailyWork.insertMany(serviceReports.map(([date, companyVisited, machine, workDescription]) => ({
    employee: employee._id,
    date: new Date(date.split('/').reverse().join('-')),
    companyVisited,
    productsDiscussed: machine,
    servicePerformed: workDescription,
    workDescription,
    status: 'Completed',
    remarks: 'Imported from August 2026 field service report',
  })));
  console.log(`Seed complete: ${customerDocuments.length} customers, ${transactions.length} payments, ${serviceReports.length} service reports`);
  console.log('  Admin login: admin@nutantechsolutions.com / Admin@123');
  console.log('  Employee login: employee@nutantechsolutions.com / Employee@123');
  await mongoose.connection.close();
};

run().catch(async (err) => {
  console.error(err);
  await mongoose.connection.close();
  process.exitCode = 1;
});
