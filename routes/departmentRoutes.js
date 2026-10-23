
const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");

// CREATE department
router.post("/", async (req, res) => {
  try {
    const { name, code } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Department name is required" });
    }

    const department = await prisma.department.create({
      data: { name: name.trim(), code }
    });

    res.status(201).json(department);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        message: "Department name or code already exists"
      });
    }
    console.error(error);
    res.status(500).json({ message: "Failed to create department" });
  }
});

// READ all departments
router.get("/", async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      include: { students: true }
    });
    res.json(departments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch departments" });
  }
});

// READ department by ID — FIX
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const department = await prisma.department.findUnique({
      where: { id },
      include: { students: true }
    });

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    res.json(department);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch department" });
  }
});

// UPDATE department
router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const data = {};
    if (req.body.name !== undefined) data.name = req.body.name;
    if (req.body.code !== undefined) data.code = req.body.code;

    const department = await prisma.department.update({
      where: { id },
      data
    });

    res.json(department);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Department not found" });
    }
    if (error.code === "P2002") {
      return res.status(409).json({ message: "Department name or code already exists" });
    }
    console.error(error);
    res.status(500).json({ message: "Failed to update department" });
  }
});

// DELETE department
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    await prisma.department.delete({ where: { id } });
    res.json({ message: "Department deleted successfully" });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Department not found" });
    }
    if (error.code === "P2003") {
      return res.status(409).json({ message: "Department is linked to students" });
    }
    console.error(error);
    res.status(500).json({ message: "Failed to delete department" });
  }
});

module.exports = router;
