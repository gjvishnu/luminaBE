
const express = require("express");
const router = express.Router();

const { register, login } = require("../controllers/authController");

// Register a new student account
router.post("/register", register);

// Login and generate a JWT token
router.post("/login", login);

module.exports = router;
