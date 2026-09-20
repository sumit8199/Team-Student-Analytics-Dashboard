import { Router, type IRouter } from "express";
import { asc, eq } from "drizzle-orm";
import {
  CreateStudentBody,
  GetStudentParams,
  UpdateStudentBody,
  UpdateStudentParams,
} from "@workspace/api-zod";
import { db, studentsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/students", async (req, res) => {
  try {
    const students = await db
      .select()
      .from(studentsTable)
      .orderBy(asc(studentsTable.createdAt));
    res.json(students);
  } catch (error) {
    req.log.error({ error }, "Failed to list students");
    res.status(500).json({ error: "Unable to load student records" });
  }
});

router.post("/students", async (req, res) => {
  const parsed = CreateStudentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Name, subject, and a score from 0 to 10 are required" });
    return;
  }

  try {
    const [student] = await db.insert(studentsTable).values(parsed.data).returning();
    res.status(201).json(student);
  } catch (error) {
    req.log.error({ error }, "Failed to create student");
    res.status(500).json({ error: "Unable to save student record" });
  }
});

router.get("/students/:id", async (req, res) => {
  const parsed = GetStudentParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid student id" });
    return;
  }

  const [student] = await db
    .select()
    .from(studentsTable)
    .where(eq(studentsTable.id, parsed.data.id));
  if (!student) {
    res.status(404).json({ error: "Student record not found" });
    return;
  }
  res.json(student);
});

router.patch("/students/:id", async (req, res) => {
  const params = UpdateStudentParams.safeParse(req.params);
  const body = UpdateStudentBody.safeParse(req.body);
  if (!params.success || !body.success || Object.keys(body.data).length === 0) {
    res.status(400).json({ error: "Provide valid student fields to update" });
    return;
  }

  try {
    const [student] = await db
      .update(studentsTable)
      .set({ ...body.data, updatedAt: new Date() })
      .where(eq(studentsTable.id, params.data.id))
      .returning();
    if (!student) {
      res.status(404).json({ error: "Student record not found" });
      return;
    }
    res.json(student);
  } catch (error) {
    req.log.error({ error }, "Failed to update student");
    res.status(500).json({ error: "Unable to update student record" });
  }
});

router.delete("/students/:id", async (req, res) => {
  const parsed = GetStudentParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid student id" });
    return;
  }

  const deleted = await db
    .delete(studentsTable)
    .where(eq(studentsTable.id, parsed.data.id))
    .returning({ id: studentsTable.id });
  if (deleted.length === 0) {
    res.status(404).json({ error: "Student record not found" });
    return;
  }
  res.status(204).send();
});

export default router;