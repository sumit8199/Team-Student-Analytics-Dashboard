import { Router, type IRouter } from "express";
import {
  GenerateStudentReportBody,
  GenerateTeamReportBody,
} from "@workspace/api-zod";

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function recommendationsForScore(score: number) {
  if (score >= 8.5) {
    return [
      "Keep the current challenge level and add one stretch task to maintain momentum.",
      "Invite the student to explain their approach so the strength becomes transferable.",
      "Pair this learner with a peer who is building confidence in the same subject.",
    ];
  }
  if (score >= 6) {
    return [
      "Use a short retrieval check before the next session to reinforce the current skill.",
      "Break the next task into one measurable milestone and review it quickly.",
      "Ask for one example and one correction in the learner's own words.",
    ];
  }
  return [
    "Schedule a focused follow-up with one worked example and immediate practice.",
    "Reduce the next task to a smaller checkpoint so progress is visible quickly.",
    "Use a brief one-to-one check-in to identify the exact concept causing friction.",
  ];
}

const router: IRouter = Router();

router.post("/ai/student-report", (req, res) => {
  const parsed = GenerateStudentReportBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "A valid student record is required" });
    return;
  }
  const { name, subject, score } = parsed.data;
  const normalized = round(score);
  const level = normalized >= 8.5 ? "leading" : normalized >= 6 ? "steady" : "developing";
  res.json({
    headline: `${name} is ${level} in ${subject}`,
    summary: `${name} is currently tracking at ${normalized}/10 in ${subject}. The strongest next move is to pair the existing signal with one focused action and a quick follow-up check.`,
    recommendations: recommendationsForScore(normalized),
    generatedAt: new Date(),
  });
});

router.post("/ai/team-report", (req, res) => {
  const parsed = GenerateTeamReportBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "A valid team summary is required" });
    return;
  }
  const { groupAverage, totalContributors, subjectAverages } = parsed.data;
  const strongest = subjectAverages[0]?.subject ?? "the leading subject";
  const needsAttention = [...subjectAverages].sort((a, b) => a.average - b.average)[0]?.subject ?? "the next focus area";
  res.json({
    headline: `The team is building from a ${round(groupAverage)}/10 baseline`,
    summary: `${totalContributors} contributors are represented. ${strongest} is currently the strongest shared signal, while ${needsAttention} is the clearest opportunity for a coordinated follow-up.`,
    recommendations: [
      `Share the approach behind ${strongest} as a lightweight peer-learning example.`,
      `Create a short practice loop around ${needsAttention} and review progress at the next checkpoint.`,
      "Use the contribution heatmap to make support specific to people and subjects rather than broad.",
    ],
    generatedAt: new Date(),
  });
});

export default router;