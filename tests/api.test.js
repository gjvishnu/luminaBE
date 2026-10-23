
const assert = require("node:assert/strict");
const prisma = require("../lib/prisma");

const BASE_URL = "http://localhost:5000";
let passed = 0;
let failed = 0;

async function request(method, path, body) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {})
  });

  const text = await response.text();
  let data;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  return { status: response.status, data };
}

async function test(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`PASS: ${name}`);
  } catch (error) {
    failed++;
    console.log(`FAIL: ${name} — ${error.message}`);
  }
}

function expectStatus(result, expected) {
  assert.equal(
    result.status,
    expected,
    `Expected HTTP ${expected}, got ${result.status}: ${JSON.stringify(result.data)}`
  );
}

function getRecord(data, recordKey) {
  if (!data) return null;
  if (recordKey && data[recordKey]) return data[recordKey];

  for (const key of [
    "record", "student", "department", "skill", "project",
    "internship", "resume", "semesterPerformance",
    "activity", "sport", "award"
  ]) {
    if (data[key] && typeof data[key] === "object") return data[key];
  }

  return data;
}

async function testResource({
  name,
  path,
  createBody,
  updateBody,
  recordKey
}) {
  let id;

  await test(`${name}: GET all`, async () => {
    const result = await request("GET", path);
    expectStatus(result, 200);
    assert.ok(Array.isArray(result.data), "Expected an array");
  });

  await test(`${name}: reject invalid ID`, async () => {
    const result = await request("GET", `${path}/invalid`);
    expectStatus(result, 400);
  });

  await test(`${name}: CREATE`, async () => {
    const result = await request("POST", path, createBody);
    expectStatus(result, 201);

    id = getRecord(result.data, recordKey)?.id;
    assert.ok(id != null, "Create response did not contain a record ID");
  });

  if (id == null) return;

  try {
    await test(`${name}: GET by ID`, async () => {
      const result = await request("GET", `${path}/${id}`);
      expectStatus(result, 200);
    });

    await test(`${name}: UPDATE`, async () => {
      const result = await request("PUT", `${path}/${id}`, updateBody);
      expectStatus(result, 200);
    });
  } finally {
    await test(`${name}: DELETE test record`, async () => {
      const result = await request("DELETE", `${path}/${id}`);
      expectStatus(result, 200);
    });

    await test(`${name}: deleted record returns 404`, async () => {
      const result = await request("GET", `${path}/${id}`);
      expectStatus(result, 404);
    });
  }
}

async function testStudents(unique) {
  let testUserId;
  let testStudentId;

  await test("Students: GET all", async () => {
    const result = await request("GET", "/api/students");
    expectStatus(result, 200);
    assert.ok(Array.isArray(result.data), "Expected an array");
  });

  await test("Students: reject invalid ID", async () => {
    const result = await request("GET", "/api/students/invalid");
    expectStatus(result, 400);
  });

  try {
    const department = await prisma.department.findFirst();
    assert.ok(department, "No department exists for Student testing");

    // Create an isolated user for this test.
    const user = await prisma.user.create({
      data: {
        email: `api-test-${unique}@example.com`,
        passwordHash: "test-only-not-a-real-password"
      }
    });

    testUserId = user.id;

    await test("Students: CREATE", async () => {
      const result = await request("POST", "/api/students", {
        userId: testUserId,
        departmentId: department.id,
        registrationNumber: `TEST${unique}`,
        fullName: "Temporary API Test Student",
        program: "AIML",
        batchYear: 2026,
        phone: "9000000000"
      });

      expectStatus(result, 201);
      testStudentId = result.data?.student?.id;
      assert.ok(testStudentId != null, "Student ID missing from response");
    });

    if (testStudentId != null) {
      await test("Students: GET by ID", async () => {
        const result = await request("GET", `/api/students/${testStudentId}`);
        expectStatus(result, 200);
        assert.equal(result.data.id, testStudentId);
      });

      await test("Students: UPDATE", async () => {
        const result = await request("PUT", `/api/students/${testStudentId}`, {
          fullName: "Updated Temporary API Test Student",
          bio: "Updated by automated test"
        });

        expectStatus(result, 200);
        assert.equal(
          result.data?.student?.fullName,
          "Updated Temporary API Test Student"
        );
      });

      await test("Students: DELETE test record", async () => {
        const result = await request("DELETE", `/api/students/${testStudentId}`);
        expectStatus(result, 200);
      });

      await test("Students: deleted record returns 404", async () => {
        const result = await request("GET", `/api/students/${testStudentId}`);
        expectStatus(result, 404);
      });
    }
  } catch (error) {
    console.error("Student test setup error:", error.message);
    failed++;
  } finally {
    // Clean up only the temporary records created by this test.
    if (testStudentId != null) {
      try {
        await prisma.student.deleteMany({ where: { id: testStudentId } });
      } catch (error) {
        console.error("Student cleanup warning:", error.message);
      }
    }

    if (testUserId != null) {
      try {
        await prisma.user.deleteMany({ where: { id: testUserId } });
      } catch (error) {
        console.error("Test user cleanup warning:", error.message);
      }
    }
  }
}

async function main() {
  const unique = Date.now();
  const studentId = 1;

  await test("Home endpoint", async () => {
    const result = await request("GET", "/");
    expectStatus(result, 200);
  });

  await test("Database health", async () => {
    const result = await request("GET", "/api/health/db");
    expectStatus(result, 200);
  });

  await testResource({
    name: "Departments",
    path: "/api/departments",
    createBody: {
      name: `API Test Department ${unique}`,
      code: `T${String(unique).slice(-8)}`
    },
    updateBody: { name: `Updated API Department ${unique}` },
    recordKey: "department"
  });

  await testResource({
    name: "Skills",
    path: "/api/skills",
    createBody: { name: `API Test Skill ${unique}` },
    updateBody: { name: `Updated API Test Skill ${unique}` },
    recordKey: "skill"
  });

  await testResource({
    name: "Projects",
    path: "/api/projects",
    createBody: {
      studentId,
      title: `API Test Project ${unique}`,
      description: "Temporary automated test record",
      role: "Tester"
    },
    updateBody: {
      title: `Updated Test Project ${unique}`,
      description: "Updated by automated test"
    },
    recordKey: "project"
  });

  await testResource({
    name: "Internships",
    path: "/api/internships",
    createBody: {
      studentId,
      companyName: `API Test Company ${unique}`,
      role: "Test Intern",
      description: "Temporary automated test record"
    },
    updateBody: {
      companyName: `Updated Test Company ${unique}`,
      role: "Updated Test Intern"
    },
    recordKey: "internship"
  });

  await testResource({
    name: "Semester Performance",
    path: "/api/semester-performance",
    createBody: {
      studentId,
      semester: 99,
      cgpa: 8.5,
      attendance: 95,
      backlogs: 0,
      marksheetUrl: "https://example.com/test-marksheet.pdf"
    },
    updateBody: { cgpa: 8.7, attendance: 96 },
    recordKey: "semesterPerformance"
  });

  await testResource({
    name: "Resumes",
    path: "/api/resumes",
    createBody: {
      studentId,
      fileName: `api-test-${unique}.pdf`,
      fileUrl: "https://example.com/test-resume.pdf",
      isDefault: false
    },
    updateBody: { fileName: `updated-api-test-${unique}.pdf` },
    recordKey: "resume"
  });

  await testResource({
    name: "Activities",
    path: "/api/activities",
    createBody: {
      studentId,
      title: `API Test Activity ${unique}`,
      description: "Temporary automated test record"
    },
    updateBody: {
      title: `Updated API Test Activity ${unique}`,
      description: "Updated test description"
    },
    recordKey: "record"
  });

  await testResource({
    name: "Sports",
    path: "/api/sports",
    createBody: {
      studentId,
      sportName: `API Test Sport ${unique}`,
      achievement: "Test achievement"
    },
    updateBody: {
      sportName: `Updated API Test Sport ${unique}`,
      achievement: "Updated test achievement"
    },
    recordKey: "record"
  });

  await testResource({
    name: "Awards",
    path: "/api/awards",
    createBody: {
      studentId,
      title: `API Test Award ${unique}`,
      issuer: "Automated Test",
      awardDate: "2026-10-23",
      certificateUrl: "https://example.com/test-certificate.pdf"
    },
    updateBody: {
      title: `Updated API Test Award ${unique}`,
      issuer: "Updated Automated Test"
    },
    recordKey: "record"
  });

  await testStudents(unique);

  console.log("\n========== TEST SUMMARY ==========");
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total:  ${passed + failed}`);
  console.log("==================================");

  process.exitCode = failed === 0 ? 0 : 1;
}

main()
  .catch(error => {
    console.error("Test runner error:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
