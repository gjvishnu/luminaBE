const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");

// CREATE CATEGORY - POST
router.post("/", async (req, res, next) => {
  try {
    const { name } = req.body;

    const category = await prisma.category.create({
      data: { name }
    });

    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
});

// GET ALL CATEGORIES
router.get("/", async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany();
    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
});

// GET CATEGORY BY ID
router.get("/:id", async (req, res, next) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: Number(req.params.id) }
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(category);
  } catch (error) {
    next(error);
  }
});

// UPDATE CATEGORY - PUT
router.put("/:id", async (req, res, next) => {
  try {
    const { name } = req.body;

    const category = await prisma.category.update({
      where: { id: Number(req.params.id) },
      data: { name }
    });

    res.status(200).json(category);
  } catch (error) {
    next(error);
  }
});

// DELETE CATEGORY
router.delete("/:id", async (req, res, next) => {
  try {
    const category = await prisma.category.delete({
      where: { id: Number(req.params.id) }
    });

    res.status(200).json({
      message: "Category deleted successfully",
      category
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;