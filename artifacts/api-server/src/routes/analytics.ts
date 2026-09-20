import { Router, type IRouter } from "express";
import { asc } from "drizzle-orm";
import { db, studentsTable } from "@workspace/db";

type StudentRecord = typeof studentsTable.$inferSelect;

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function buildAnalytics(students: StudentRecord[]) {
  const subjectMap = new Map<string, StudentRecord[]>();
  const memberMap = new Map<string, StudentRecord[]>();
  for (const student of students) {
    const subjectRows = subjectMap.get(student.subject) ?? [];
    subjectRows.push(student);
    subjectMap.set(student.subject, subjectRows);
    const memberRows = memberMap.get(student.name) ?? [];
    memberRows.push(student);
    memberMap.set(student.name, memberRows);
  }

  const subjectAverages = [...subjectMap.entries()]
    .map(([subject, rows]) => ({
      subject,
      average: round(rows.reduce((sum, row) => sum + row.score, 0) / rows.length),
      count: rows.length,
    }))
    .sort((a, b) => b.average - a.average);
  const memberAverages = [...memberMap.entries()]
    .map(([name, rows]) => ({
      name,
      average: round(rows.reduce((sum, row) => sum + row.score, 0) / rows.length),
      contributionCount: rows.length,
    }))
    .sort((a, b) => b.average - a.average);
  const heatmap = [...memberMap.entries()].map(([name, rows]) => ({
    name,
    subjects: Object.fromEntries(
      rows.map((row) => [row.subject, round(row.score)]),
    ),
  }));
  const scores = students.map((student) => ({ name: student.name, score: student.score }));
  const overallAverage = students.length
    ? round(students.reduce((sum, student) => sum + student.score, 0) / students.length)
    : 0;

  return {
    overview: {
      totalStudents: students.length,
      overallAverage,
      topScore: students.length ? Math.max(...students.map((student) => student.score)) : 0,
      subjectAverages,
      studentScores: scores,
      radarData: subjectAverages.map(({ subject, average }) => ({ subject, average })),
      heatmap,
    },
    team: {
      groupAverage: overallAverage,
      totalContributors: memberMap.size,
      subjectAverages,
      memberAverages,
      heatmap,
    },
  };
}

const router: IRouter = Router();

router.get("/analytics/overview", async (req, res) => {
  try {
    const students = await db.select().from(studentsTable).orderBy(asc(studentsTable.createdAt));
    res.json(buildAnalytics(students).overview);
  } catch (error) {
    req.log.error({ error }, "Failed to build overview analytics");
    res.status(500).json({ error: "Unable to load overview analytics" });
  }
});

router.get("/analytics/team", async (req, res) => {
  try {
    const students = await db.select().from(studentsTable).orderBy(asc(studentsTable.createdAt));
    res.json(buildAnalytics(students).team);
  } catch (error) {
    req.log.error({ error }, "Failed to build team analytics");
    res.status(500).json({ error: "Unable to load team analytics" });
  }
});

export default router;