const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const generateToken = require("../utils/generateToken");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

// ================= Register =================

const register = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  // Validation
  if (!name || !email || !password) {
    throw new AppError("All fields are required", 400);
  }

  if (!validator.isEmail(email)) {
    throw new AppError("Invalid email", 400);
  }

  if (password.length < 6) {
    throw new AppError("Password must be at least 6 characters", 400);
  }

  // Check existing user
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError("User already exists", 409);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  // Generate JWT
  const token = generateToken(user.id);

  res.status(201).json({
    success: true,
    message: "Registration successful",
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    },
  });
});

// ================= Login =================

const login = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body || {};

  // Validation
  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new AppError("Invalid credentials", 401);
  }

  // Generate JWT
  const token = generateToken(user.id);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    },
  });
});

module.exports = {
  register,
  login,
};