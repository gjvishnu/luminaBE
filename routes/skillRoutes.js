
const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");

// CREATE skill
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        message: "Skill name is required"
      });
    }

    const skill = await prisma.skill.create({
      data: { name: name.trim() }
    });

    return res.status(201).json({
      message: "Skill created successfully",
      skill
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        message: "Skill already exists"
      });
    }

    console.error("Create skill error:", error);
    return res.status(500).json({
      message: "Failed to create skill"
    });
  }
});

// READ all skills
router.get("/", async (req, res) => {
  try {
    const skills = await prisma.skill.findMany();
    return res.status(200).json(skills);
  } catch (error) {
    console.error("Fetch skills error:", error);
    return res.status(500).json({
      message: "Failed to fetch skills"
    });
  }
});

// READ skill by ID
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        message: "Invalid ID"
      });
    }

    const skill = await prisma.skill.findUnique({
      where: { id }
    });

    if (!skill) {
      return res.status(404).json({
        message: "Skill not found"
      });
    }

    return res.status(200).json(skill);
  } catch (error) {
    console.error("Fetch skill by ID error:", error);
    return res.status(500).json({
      message: "Failed to fetch skill"
    });
  }
});

// UPDATE skill
router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name } = req.body;

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        message: "Invalid ID"
      });
    }

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        message: "Skill name is required"
      });
    }

    const skill = await prisma.skill.update({
      where: { id },
      data: { name: name.trim() }
    });

    return res.status(200).json({
      message: "Skill updated successfully",
      skill
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        message: "Skill not found"
      });
    }

    if (error.code === "P2002") {
      return res.status(409).json({
        message: "Skill already exists"
      });
    }

    console.error("Update skill error:", error);
    return res.status(500).json({
      message: "Failed to update skill"
    });
  }
});

// DELETE skill
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        message: "Invalid ID"
      });
    }

    await prisma.skill.delete({
      where: { id }
    });

    return res.status(200).json({
      message: "Skill deleted successfully"
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        message: "Skill not found"
      });
    }

    if (error.code === "P2003") {
      return res.status(409).json({
        message: "Skill is linked to other records"
      });
    }

    console.error("Delete skill error:", error);
    return res.status(500).json({
      message: "Failed to delete skill"
    });
  }
});

module.exports = router;
