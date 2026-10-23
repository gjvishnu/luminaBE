const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");

router.post("/", async (req, res) => {
  try {
    const { studentId, title, description, role, startDate, endDate, projectUrl, skillIds = [] } = req.body;
    if (!studentId || !title) return res.status(400).json({ message: "studentId and title are required" });
    if (!Array.isArray(skillIds)) return res.status(400).json({ message: "skillIds must be an array" });

    const project = await prisma.project.create({
      data: {
        studentId: Number(studentId), title, description, role,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        projectUrl,
        skills: { create: skillIds.map(id => ({ skill: { connect: { id: Number(id) } } })) }
      },
      include: { skills: { include: { skill: true } } }
    });
    res.status(201).json({ message: "Project created successfully", project });
  } catch (e) {
    if (e.code === "P2003" || e.code === "P2025") return res.status(400).json({ message: "Invalid studentId or skillId" });
    console.error(e);
    res.status(500).json({ message: "Failed to create project" });
  }
});

router.get("/", async (req, res) => {
  try {
    res.json(await prisma.project.findMany({ include: { student: true, skills: { include: { skill: true } } } }));
  } catch (e) { res.status(500).json({ message: "Failed to fetch projects" }); }
});

router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: "Invalid ID" });
    const project = await prisma.project.findUnique({ where: { id }, include: { skills: { include: { skill: true } } } });
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (e) { res.status(500).json({ message: "Failed to fetch project" }); }
});

router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: "Invalid ID" });
    const { title, description, role, projectUrl, startDate, endDate, skillIds } = req.body;
    const data = {};
    for (const key of ["title", "description", "role", "projectUrl"]) if (req.body[key] !== undefined) data[key] = req.body[key];
    if (startDate !== undefined) data.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) data.endDate = endDate ? new Date(endDate) : null;
    if (skillIds !== undefined) {
      if (!Array.isArray(skillIds)) return res.status(400).json({ message: "skillIds must be an array" });
      data.skills = {
        deleteMany: {},
        create: skillIds.map(skillId => ({ skill: { connect: { id: Number(skillId) } } }))
      };
    }
    const project = await prisma.project.update({ where: { id }, data, include: { skills: { include: { skill: true } } } });
    res.json({ message: "Project updated successfully", project });
  } catch (e) {
    if (e.code === "P2025") return res.status(404).json({ message: "Project or skill not found" });
    console.error(e);
    res.status(500).json({ message: "Failed to update project" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: "Invalid ID" });
    await prisma.project.delete({ where: { id } });
    res.json({ message: "Project deleted successfully" });
  } catch (e) {
    if (e.code === "P2025") return res.status(404).json({ message: "Project not found" });
    res.status(500).json({ message: "Failed to delete project" });
  }
});

module.exports = router;
