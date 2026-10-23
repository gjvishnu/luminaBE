const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");

router.post("/", async (req, res) => {
  try {
    const { studentId, companyName, role, description, startDate, endDate, certificateUrl, skillIds = [] } = req.body;
    if (!studentId || !companyName || !role) return res.status(400).json({ message: "studentId, companyName and role are required" });
    if (!Array.isArray(skillIds)) return res.status(400).json({ message: "skillIds must be an array" });

    const internship = await prisma.internship.create({
      data: {
        studentId: Number(studentId), companyName, role, description,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        certificateUrl,
        skills: { create: skillIds.map(id => ({ skill: { connect: { id: Number(id) } } })) }
      },
      include: { skills: { include: { skill: true } } }
    });
    res.status(201).json({ message: "Internship created successfully", internship });
  } catch (e) {
    if (e.code === "P2003" || e.code === "P2025") return res.status(400).json({ message: "Invalid studentId or skillId" });
    console.error(e);
    res.status(500).json({ message: "Failed to create internship" });
  }
});

router.get("/", async (req, res) => {
  try {
    res.json(await prisma.internship.findMany({ include: { student: true, skills: { include: { skill: true } } } }));
  } catch (e) { res.status(500).json({ message: "Failed to fetch internships" }); }
});

router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: "Invalid ID" });
    const internship = await prisma.internship.findUnique({ where: { id }, include: { skills: { include: { skill: true } } } });
    if (!internship) return res.status(404).json({ message: "Internship not found" });
    res.json(internship);
  } catch (e) { res.status(500).json({ message: "Failed to fetch internship" }); }
});

router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: "Invalid ID" });
    const { companyName, role, description, startDate, endDate, certificateUrl, skillIds } = req.body;
    const data = {};
    for (const key of ["companyName", "role", "description", "certificateUrl"]) if (req.body[key] !== undefined) data[key] = req.body[key];
    if (startDate !== undefined) data.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) data.endDate = endDate ? new Date(endDate) : null;
    if (skillIds !== undefined) {
      if (!Array.isArray(skillIds)) return res.status(400).json({ message: "skillIds must be an array" });
      data.skills = {
        deleteMany: {},
        create: skillIds.map(skillId => ({ skill: { connect: { id: Number(skillId) } } }))
      };
    }
    const internship = await prisma.internship.update({ where: { id }, data, include: { skills: { include: { skill: true } } } });
    res.json({ message: "Internship updated successfully", internship });
  } catch (e) {
    if (e.code === "P2025") return res.status(404).json({ message: "Internship or skill not found" });
    console.error(e);
    res.status(500).json({ message: "Failed to update internship" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: "Invalid ID" });
    await prisma.internship.delete({ where: { id } });
    res.json({ message: "Internship deleted successfully" });
  } catch (e) {
    if (e.code === "P2025") return res.status(404).json({ message: "Internship not found" });
    res.status(500).json({ message: "Failed to delete internship" });
  }
});

module.exports = router;
