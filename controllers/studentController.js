const prisma = require("../lib/prisma");

exports.createStudent = async (req, res) => {
  try {
    const {
      userId, departmentId, registrationNumber, fullName,
      program, batchYear, phone, email
    } = req.body;

    if (
      userId == null || departmentId == null ||
      !registrationNumber || !fullName ||
      !program || batchYear == null
    ) {
      return res.status(400).json({
        message: "userId, departmentId, registrationNumber, fullName, program and batchYear are required"
      });
    }

    const student = await prisma.student.create({
      data: {
        userId: Number(userId),
        departmentId: Number(departmentId),
        registrationNumber,
        fullName,
        program,
        batchYear: Number(batchYear),
        phone
      }
    });

    res.status(201).json({ message: "Student created successfully", student });
  } catch (error) {
    if (error.code === "P2002")
      return res.status(409).json({ message: "A unique field already exists" });
    if (error.code === "P2003")
      return res.status(400).json({ message: "Invalid userId or departmentId" });
    console.error(error);
    res.status(500).json({ message: "Failed to create student" });
  }
};

exports.getStudents = async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      include: { department: true, skills: { include: { skill: true } } }
    });
    res.status(200).json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch students" });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1)
      return res.status(400).json({ message: "Invalid student ID" });

    const student = await prisma.student.findUnique({
      where: { id },
      include: { department: true, skills: { include: { skill: true } }, projects: true, internships: true }
    });

    if (!student) return res.status(404).json({ message: "Student not found" });
    res.status(200).json(student);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch student" });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1)
      return res.status(400).json({ message: "Invalid student ID" });

    const allowed = [
      "departmentId", "registrationNumber", "fullName", "phone",
      "dateOfBirth", "gender", "address", "city", "state",
      "program", "batchYear", "currentSemester", "bio",
      "linkedinUrl", "githubUrl", "portfolioUrl"
    ];

    const data = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) data[key] = req.body[key];
    }

    if (data.departmentId !== undefined) data.departmentId = Number(data.departmentId);
    if (data.batchYear !== undefined) data.batchYear = Number(data.batchYear);
    if (data.currentSemester !== undefined && data.currentSemester !== null)
      data.currentSemester = Number(data.currentSemester);
    if (data.dateOfBirth) data.dateOfBirth = new Date(data.dateOfBirth);

    const student = await prisma.student.update({ where: { id }, data });
    res.status(200).json({ message: "Student updated successfully", student });
  } catch (error) {
    if (error.code === "P2025")
      return res.status(404).json({ message: "Student not found" });
    if (error.code === "P2002")
      return res.status(409).json({ message: "A unique field already exists" });
    if (error.code === "P2003")
      return res.status(400).json({ message: "Invalid departmentId" });
    console.error(error);
    res.status(500).json({ message: "Failed to update student" });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1)
      return res.status(400).json({ message: "Invalid student ID" });

    await prisma.student.delete({ where: { id } });
    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    if (error.code === "P2025")
      return res.status(404).json({ message: "Student not found" });
    console.error(error);
    res.status(500).json({ message: "Failed to delete student" });
  }
};
