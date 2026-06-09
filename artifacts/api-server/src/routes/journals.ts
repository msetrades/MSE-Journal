import { Router } from "express";
import { db } from "@workspace/db";
import { journalsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
  next();
}

router.get("/journals", requireAuth, async (req, res) => {
  const userId = req.session!.userId as number;
  try {
    const rows = await db.select().from(journalsTable).where(eq(journalsTable.userId, userId));
    res.json(rows.map(r => ({
      id: r.id,
      date: r.date,
      type: r.type,
      mood: r.mood,
      followed_plan: r.followedPlan,
      best_trade: r.bestTrade,
      mistakes: r.mistakes,
      lessons: r.lessons,
      mental_score: r.mentalScore,
      discipline_score: r.disciplineScore,
    })));
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: "Failed to fetch journals" });
  }
});

router.post("/journals", requireAuth, async (req, res) => {
  const userId = req.session!.userId as number;
  const { date, type, mood, followed_plan, best_trade, mistakes, lessons, mental_score, discipline_score } = req.body;
  if (!date || !mood) return res.status(400).json({ error: "Missing required fields" });
  try {
    const [j] = await db.insert(journalsTable).values({
      userId, date, type: type || "daily", mood,
      followedPlan: followed_plan ?? true,
      bestTrade: best_trade || "",
      mistakes: mistakes || "",
      lessons: lessons || "",
      mentalScore: mental_score ?? 7,
      disciplineScore: discipline_score ?? 7,
    }).returning();
    res.status(201).json({
      id: j.id, date: j.date, type: j.type, mood: j.mood,
      followed_plan: j.followedPlan, best_trade: j.bestTrade,
      mistakes: j.mistakes, lessons: j.lessons,
      mental_score: j.mentalScore, discipline_score: j.disciplineScore,
    });
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: "Failed to create journal" });
  }
});

router.put("/journals/:id", requireAuth, async (req, res) => {
  const userId = req.session!.userId as number;
  const id = parseInt(req.params.id);
  const { date, type, mood, followed_plan, best_trade, mistakes, lessons, mental_score, discipline_score } = req.body;
  try {
    const [j] = await db.update(journalsTable).set({
      date, type, mood,
      followedPlan: followed_plan,
      bestTrade: best_trade || "",
      mistakes: mistakes || "",
      lessons: lessons || "",
      mentalScore: mental_score,
      disciplineScore: discipline_score,
    }).where(and(eq(journalsTable.id, id), eq(journalsTable.userId, userId))).returning();
    if (!j) return res.status(404).json({ error: "Journal not found" });
    res.json({
      id: j.id, date: j.date, type: j.type, mood: j.mood,
      followed_plan: j.followedPlan, best_trade: j.bestTrade,
      mistakes: j.mistakes, lessons: j.lessons,
      mental_score: j.mentalScore, discipline_score: j.disciplineScore,
    });
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: "Failed to update journal" });
  }
});

router.delete("/journals/:id", requireAuth, async (req, res) => {
  const userId = req.session!.userId as number;
  const id = parseInt(req.params.id);
  try {
    await db.delete(journalsTable).where(and(eq(journalsTable.id, id), eq(journalsTable.userId, userId)));
    res.status(204).send();
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: "Failed to delete journal" });
  }
});

export default router;
