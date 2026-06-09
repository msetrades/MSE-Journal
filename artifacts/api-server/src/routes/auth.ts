import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/auth/me", (req, res) => {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  res.json({ id: req.session.userId, username: req.session.username });
});

router.post("/auth/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }
  try {
    const existing = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
    if (existing.length > 0) {
      return res.status(400).json({ error: "Username already taken" });
    }
    const hash = await bcrypt.hash(password, 10);
    const [user] = await db.insert(usersTable).values({ username, password: hash }).returning();
    req.session!.userId = user.id;
    req.session!.username = user.username;
    res.status(201).json({ id: user.id, username: user.username });
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/auth/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });
    req.session!.userId = user.id;
    req.session!.username = user.username;
    res.json({ id: user.id, username: user.username });
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: "Login failed" });
  }
});

router.post("/auth/logout", (req, res) => {
  req.session?.destroy(() => {});
  res.status(204).send();
});

export default router;
