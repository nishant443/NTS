const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');

// @desc Admin: create user (assign password)
// @route POST /api/users
exports.createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, designation, department, joiningDate, salary } = req.body;
  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error('A user with that email already exists');
  }
  const user = await User.create({
    name, email, password, role, phone, designation, department, joiningDate, salary,
  });
  res.status(201).json({ success: true, user: { ...user.toObject(), password: undefined, salary: undefined } });
});

// @desc Admin: list all users
// @route GET /api/users
exports.getUsers = asyncHandler(async (req, res) => {
  const { search, role, page = 1, limit = 20 } = req.query;
  const query = {};
  if (role) query.role = role;
  if (search) query.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];

  const users = await User.find(query)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort('-createdAt');
  const total = await User.countDocuments(query);
  res.json({ success: true, count: users.length, total, page: Number(page), users });
});

// @desc Get single user (self or admin)
// @route GET /api/users/:id
exports.getUser = asyncHandler(async (req, res) => {
  const isSelf = req.params.id === req.user.id;
  let query = User.findById(req.params.id);
  if (req.user.role !== 'admin' && isSelf) query = query.select('-salary');
  const user = await query;
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ success: true, user });
});

// @desc Update user (admin, or self for own profile fields)
// @route PUT /api/users/:id
exports.updateUser = asyncHandler(async (req, res) => {
  const isSelf = req.params.id === req.user.id;
  if (req.user.role !== 'admin' && !isSelf) {
    res.status(403);
    throw new Error('Forbidden');
  }
  const updates = { ...req.body };
  // Non-admins cannot change role/salary/isActive
  if (req.user.role !== 'admin') {
    delete updates.role;
    delete updates.salary;
    delete updates.isActive;
  }
  const user = await User.findById(req.params.id).select('+password');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  Object.assign(user, updates);
  await user.save();
  const safeUser = user.toObject();
  delete safeUser.password;
  delete safeUser.salary;
  res.json({ success: true, user: safeUser });
});

// @desc Admin: delete user
// @route DELETE /api/users/:id
exports.deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user.id) {
    res.status(400);
    throw new Error('You cannot delete your own account');
  }
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'User deleted' });
});
