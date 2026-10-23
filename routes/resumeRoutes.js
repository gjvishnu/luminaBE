
const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");

// CREATE resume
router.post("/", async (req, res, next) => {
  try {
    const { studentId, fileName, fileUrl, isDefault } = req.body;

    if (!studentId || !fileName || !fileUrl) {
      return res.status(400).json({
        message: "studentId, fileName and fileUrl are required"
      });
    }

    const resume = await prisma.resume.create({
      data: {
        studentId: Number(studentId),
        fileName,
        fileUrl,
        isDefault: isDefault ?? false
      }
    });

    res.status(201).json({
      message: "Resume created successfully",
      resume
    });
  } catch (error) {
    next(error);
  }
});

// GET all resumes
router.get("/", async (req, res, next) => {
  try {
    const resumes = await prisma.resume.findMany({
      orderBy: { id: "desc" }
    });
    res.json(resumes);
  } catch (error) {
    next(error);
  }
});

// GET resume by ID
router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ message: "Invalid resume ID" });
    }

    const resume = await prisma.resume.findUnique({ where: { id } });
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    res.json(resume);
  } catch (error) {
    next(error);
  }
});

// UPDATE resume
router.put("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ message: "Invalid resume ID" });
    }

    const data = {};
    for (const field of ["studentId", "fileName", "fileUrl", "isDefault"]) {
      if (req.body[field] !== undefined) data[field] = req.body[field];
    }
    if (data.studentId !== undefined) data.studentId = Number(data.studentId);

    const resume = await prisma.resume.update({ where: { id }, data });
    res.json({ message: "Resume updated successfully", resume });
  } catch (error) {
    next(error);
  }
});

// DELETE resume
router.delete("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ message: "Invalid resume ID" });
    }

    await prisma.resume.delete({ where: { id } });
    res.json({ message: "Resume deleted successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
