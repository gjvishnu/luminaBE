const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");

// CREATE DOMAIN
router.post("/", async (req, res, next) => {
  try {
    const { name } = req.body;

    const domain = await prisma.domain.create({
      data: { name }
    });

    res.status(201).json(domain);
  } catch (error) {
    next(error);
  }
});

// GET ALL DOMAINS
router.get("/", async (req, res, next) => {
  try {
    const domains = await prisma.domain.findMany();
    res.status(200).json(domains);
  } catch (error) {
    next(error);
  }
});

// GET DOMAIN BY ID
router.get("/:id", async (req, res, next) => {
  try {
    const domain = await prisma.domain.findUnique({
      where: { id: Number(req.params.id) }
    });

    if (!domain) {
      return res.status(404).json({ message: "Domain not found" });
    }

    res.status(200).json(domain);
  } catch (error) {
    next(error);
  }
});

// UPDATE DOMAIN
router.put("/:id", async (req, res, next) => {
  try {
    const { name } = req.body;

    const domain = await prisma.domain.update({
      where: { id: Number(req.params.id) },
      data: { name }
    });

    res.status(200).json(domain);
  } catch (error) {
    next(error);
  }
});

// DELETE DOMAIN
router.delete("/:id", async (req, res, next) => {
  try {
    const domain = await prisma.domain.delete({
      where: { id: Number(req.params.id) }
    });

    res.status(200).json({
      message: "Domain deleted successfully",
      domain
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;