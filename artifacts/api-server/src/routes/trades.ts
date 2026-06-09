import { Router } from "express";
import { db } from "@workspace/db";
import { tradesTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
  next();
}

function serializeTrade(r: typeof tradesTable.$inferSelect) {
  return {
    id: r.id,
    date: r.date,
    pair: r.pair,
    direction: r.direction,
    session: r.session,
    setup: r.setup,
    rr: r.rr,
    outcome: r.outcome,
    notes: r.notes,
    screenshot: r.screenshot ?? null,
  };
}

router.get("/trades", requireAuth, async (req, res) => {
  const userId = req.session!.userId as number;
  try {
    const rows = await db.select().from(tradesTable).where(eq(tradesTable.userId, userId));
    res.json(rows.map(serializeTrade));
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: "Failed to fetch trades" });
  }
});

router.post("/trades", requireAuth, async (req, res) => {
  const userId = req.session!.userId as number;
  const { date, pair, direction, session, setup, rr, outcome, notes, screenshot } = req.body;
  if (!date || !pair || !direction || !session || !setup || !rr || !outcome) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    const [trade] = await db.insert(tradesTable).values({
      userId, date, pair, direction, session, setup, rr, outcome,
      notes: notes || "",
      screenshot: screenshot || null,
    }).returning();
    res.status(201).json(serializeTrade(trade));
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: "Failed to create trade" });
  }
});

router.put("/trades/:id", requireAuth, async (req, res) => {
  const userId = req.session!.userId as number;
  const id = parseInt(req.params.id);
  const { date, pair, direction, session, setup, rr, outcome, notes, screenshot } = req.body;
  try {
    const [trade] = await db.update(tradesTable).set({
      date, pair, direction, session, setup, rr, outcome,
      notes: notes || "",
      screenshot: screenshot !== undefined ? (screenshot || null) : undefined,
    }).where(and(eq(tradesTable.id, id), eq(tradesTable.userId, userId))).returning();
    if (!trade) return res.status(404).json({ error: "Trade not found" });
    res.json(serializeTrade(trade));
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: "Failed to update trade" });
  }
});

router.delete("/trades/:id", requireAuth, async (req, res) => {
  const userId = req.session!.userId as number;
  const id = parseInt(req.params.id);
  try {
    await db.delete(tradesTable).where(and(eq(tradesTable.id, id), eq(tradesTable.userId, userId)));
    res.status(204).send();
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: "Failed to delete trade" });
  }
});

export default router;
