
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");

const allowedRoles = ["STUDENT", "PLACEMENT_OFFICER", "ADMIN"];

async function register(req, res, next) {
  try {
    const { email, password, role } = req.body;

    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      password.length < 8
    ) {
      return res.status(400).json({
        message: "Valid email and password of at least 8 characters are required"
      });
    }

    // Public registration must not allow users to assign privileged roles.
    if (role && role !== "STUDENT") {
      return res.status(403).json({
        message: "Privileged roles can only be assigned by an administrator"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        role: "STUDENT"
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    return res.status(201).json({
      message: "Registration successful",
      user
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "Email already registered" });
    }
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() }
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      throw new Error("JWT_SECRET must be configured with at least 32 characters");
    }

    const token = jwt.sign(
      { role: user.role },
      process.env.JWT_SECRET,
      {
        subject: String(user.id),
        expiresIn: "1h",
        issuer: "lumina-api",
        audience: "lumina-client"
      }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      expiresIn: 3600,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login };
