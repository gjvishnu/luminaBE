const express = require("express");
const { Prisma } = require("@prisma/client");
const prisma = require("../lib/prisma");
const router = express.Router();

const resources = {
  semesterPerformance: ["studentId", "semester", "cgpa", "attendance", "backlogs", "marksheetUrl"],
  resume: ["studentId", "fileName", "fileUrl", "isDefault"],
  studentActivity: ["studentId", "title", "description"],
  studentSport: ["studentId", "sportName", "achievement"],
  studentAward: ["studentId", "title", "issuer", "awardDate", "certificateUrl"]
};

const routeConfigs = {
  semesterPerformance: ["studentId", "semester"],
  resume: ["studentId", "fileName", "fileUrl"],
  studentActivity: ["studentId", "title"],
  studentSport: ["studentId", "sportName"],
  studentAward: ["studentId", "title"]
};

function makeRouter(modelName) {
  const r = express.Router();
  const required = routeConfigs[modelName];
  const fields = resources[modelName];
  const model = prisma[modelName];

  r.post("/", async (req, res, next) => {
    try {
      for (const field of required) {
        if (req.body[field] === undefined || req.body[field] === null || req.body[field] === "") {
          return res.status(400).json({ message: `${field} is required` });
        }
      }

      const data = {};
      for (const field of fields) {
        if (req.body[field] !== undefined) data[field] = req.body[field];
      }

      if (data.studentId !== undefined) data.studentId = Number(data.studentId);
      if (data.semester !== undefined) data.semester = Number(data.semester);
      if (data.backlogs !== undefined) data.backlogs = Number(data.backlogs);
      if (data.cgpa !== undefined) data.cgpa = Number(data.cgpa);
      if (data.attendance !== undefined) data.attendance = Number(data.attendance);
      if (data.isDefault !== undefined) data.isDefault = Boolean(data.isDefault);
      if (data.awardDate) data.awardDate = new Date(data.awardDate);

      const record = await model.create({ data });
      res.status(201).json({ message: "Record created successfully", record });
    } catch (error) { next(error); }
  });

  r.get("/", async (req, res, next) => {
    try {
      const records = await model.findMany({ orderBy: { id: "desc" } });
      res.json(records);
    } catch (error) { next(error); }
  });

  r.get("/:id", async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: "Invalid ID" });
      const record = await model.findUnique({ where: { id } });
      if (!record) return res.status(404).json({ message: "Record not found" });
      res.json(record);
    } catch (error) { next(error); }
  });

  r.put("/:id", async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: "Invalid ID" });
      const data = {};
      for (const field of fields) {
        if (req.body[field] !== undefined) data[field] = req.body[field];
      }
      for (const field of ["studentId", "semester", "backlogs"]) {
        if (data[field] !== undefined) data[field] = Number(data[field]);
      }
      for (const field of ["cgpa", "attendance"]) {
        if (data[field] !== undefined) data[field] = Number(data[field]);
      }
      if (data.isDefault !== undefined) data.isDefault = Boolean(data.isDefault);
      if (data.awardDate) data.awardDate = new Date(data.awardDate);

      const record = await model.update({ where: { id }, data });
      res.json({ message: "Record updated successfully", record });
    } catch (error) { next(error); }
  });

  r.delete("/:id", async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: "Invalid ID" });
      await model.delete({ where: { id } });
      res.json({ message: "Record deleted successfully" });
    } catch (error) { next(error); }
  });

  return r;
}

module.exports = { makeRouter };
