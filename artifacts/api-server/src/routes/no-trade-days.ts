import { Router } from "express";
import { db } from "@workspace/db";
import { noTradeDaysTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
  next();
}

router.get("/no-trade-days", requireAuth, async (req, res) => {
  const userId = req.session!.userId as number;
  try {
    const rows = await db.select().from(noTradeDaysTable).where(eq(noTradeDaysTable.userId, userId));
    res.json(rows.map(r => ({ id: r.id, date: r.date, note: r.note })));
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: "Failed to fetch no-trade days" });
  }
});

router.post("/no-trade-days", requireAuth, async (req, res) => {
  const userId = req.session!.userId as number;
  const { date, note } = req.body;
  if (!date) return res.status(400).json({ error: "Date required" });
  try {
    const [row] = await db.insert(noTradeDaysTable).values({
      userId, date, note: note || "",
    }).returning();
    res.status(201).json({ id: row.id, date: row.date, note: row.note });
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: "Failed to log no-trade day" });
  }
});

router.delete("/no-trade-days/:id", requireAuth, async (req, res) => {
  const userId = req.session!.userId as number;
  const id = parseInt(req.params.id);
  try {
    await db.delete(noTradeDaysTable).where(and(eq(noTradeDaysTable.id, id), eq(noTradeDaysTable.userId, userId)));
    res.status(204).send();
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: "Failed to delete no-trade day" });
  }
});

export default router;
