import { Router, type IRouter } from "express";
import { db, profilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateProfileBody,
  UpdateProfileBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/profiles", async (_req, res) => {
  try {
    const profiles = await db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.active, true))
      .orderBy(profilesTable.createdAt);
    res.json(
      profiles.map((p) => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
        photoUrl: p.photoUrl,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/profiles/all", async (_req, res) => {
  try {
    const profiles = await db
      .select()
      .from(profilesTable)
      .orderBy(profilesTable.createdAt);
    res.json(
      profiles.map((p) => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/profiles/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    const [profile] = await db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.id, id));
    if (!profile) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }
    res.json({ ...profile, createdAt: profile.createdAt.toISOString() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/profiles", async (req, res) => {
  try {
    const parsed = CreateProfileBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid data" });
      return;
    }
    const data = parsed.data;
    const [created] = await db
      .insert(profilesTable)
      .values({
        name: data.name,
        age: data.age,
        location: data.location,
        bio: data.bio,
        interests: data.interests ?? [],
        whatsapp: data.whatsapp,
        photoUrl: data.photoUrl,
        active: data.active ?? true,
        verified: data.verified ?? false,
      })
      .returning();
    res.status(201).json({ ...created, createdAt: created.createdAt.toISOString() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/profiles/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    const parsed = UpdateProfileBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid data" });
      return;
    }
    const data = parsed.data;
    const [updated] = await db
      .update(profilesTable)
      .set({
        name: data.name,
        age: data.age,
        location: data.location,
        bio: data.bio,
        interests: data.interests ?? [],
        whatsapp: data.whatsapp,
        photoUrl: data.photoUrl,
        active: data.active,
        verified: data.verified,
      })
      .where(eq(profilesTable.id, id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }
    res.json({ ...updated, createdAt: updated.createdAt.toISOString() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/profiles/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    const [deleted] = await db
      .delete(profilesTable)
      .where(eq(profilesTable.id, id))
      .returning();
    if (!deleted) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/profiles/:id/toggle", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    const [existing] = await db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.id, id));
    if (!existing) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }
    const [updated] = await db
      .update(profilesTable)
      .set({ active: !existing.active })
      .where(eq(profilesTable.id, id))
      .returning();
    res.json({ ...updated, createdAt: updated.createdAt.toISOString() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
