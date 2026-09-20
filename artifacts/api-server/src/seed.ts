import { count } from "drizzle-orm";
import { db, studentsTable } from "@workspace/db";

export async function seedStudents() {
  const [{ value }] = await db.select({ value: count() }).from(studentsTable);
  if (Number(value) > 0) return;

  await db.insert(studentsTable).values([
    { name: "Maya Patel", subject: "Research", score: 8.9 },
    { name: "Maya Patel", subject: "Presentation", score: 8.2 },
    { name: "Jon Bell", subject: "Research", score: 6.4 },
    { name: "Jon Bell", subject: "Collaboration", score: 7.1 },
    { name: "Priya Shah", subject: "Presentation", score: 9.2 },
    { name: "Priya Shah", subject: "Collaboration", score: 8.5 },
    { name: "Leo Martinez", subject: "Research", score: 5.8 },
    { name: "Leo Martinez", subject: "Collaboration", score: 6.3 },
  ]);
}