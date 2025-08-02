// server/src/routes/issues.ts

import { Router } from "express";
import type { Request, Response } from "express";
import { AppDataSource } from "../db";
import { Issue } from "../models/Issue";
import { User } from "../models/User";

const router = Router();

/**
 * GET /api/issues
 * Query Params:
 *   lat, lng  – center point for radius filter (in decimal degrees)
 *   radius    – distance in km (default = 3)
 *   category  – optional issue category filter
 *   status    – optional issue status filter
 */
router.get("/", async (req: Request, res: Response) => {
  const lat = parseFloat(req.query.lat as string);
  const lng = parseFloat(req.query.lng as string);
  const km = parseFloat((req.query.radius as string) ?? "3");
  const category = req.query.category as string | undefined;
  const status = req.query.status as string | undefined;

  if (isNaN(lat) || isNaN(lng) || isNaN(km)) {
    return res.status(400).json({ error: "Invalid latitude, longitude, or radius" });
  }

  const radiusMeters = km * 1000;
  const issueRepo = AppDataSource.getRepository(Issue);

  const qb = issueRepo
    .createQueryBuilder("i")
    .leftJoinAndSelect("i.reporter", "u")
    .where(
      "ST_DWithin(i.location, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography, :radius)",
      { lat, lng, radius: radiusMeters }
    )
    .andWhere("i.status != :hidden", { hidden: "hidden" });

  if (category) {
    qb.andWhere("i.category = :category", { category });
  }
  if (status) {
    qb.andWhere("i.status = :status", { status });
  }

  const issues = await qb.orderBy("i.createdAt", "DESC").limit(200).getMany();
  return res.json(issues);
});

/**
 * POST /api/issues
 * Request Body (JSON):
 *   title: string
 *   description: string
 *   category: one of Issue.Category
 *   lat: number
 *   lng: number
 *   photoUrls?: string[]        // up to 35 URLs
 *   reporterId?: string         // optional user UUID
 */
router.post("/", async (req: Request, res: Response) => {
  const { title, description, category, lat, lng, photoUrls, reporterId } = req.body;

  if (
    typeof title !== "string" ||
    title.length < 3 ||
    typeof description !== "string" ||
    isNaN(lat) ||
    isNaN(lng)
  ) {
    return res.status(400).json({ error: "Invalid issue data" });
  }

  if (photoUrls && (!Array.isArray(photoUrls) || photoUrls.length > 35)) {
    return res
      .status(400)
      .json({ error: "photoUrls must be an array of max 35 URLs" });
  }

  const issueRepo = AppDataSource.getRepository(Issue);
  const userRepo = AppDataSource.getRepository(User);

  const newIssue = issueRepo.create({
    title,
    description,
    category,
    photoUrls: photoUrls ?? [],
    location: { type: "Point", coordinates: [lng, lat] },
    reporter: reporterId
      ? await userRepo.findOne({ where: { id: reporterId } })
      : undefined,
  });

  const saved = await issueRepo.save(newIssue);
  return res.status(201).json(saved);
});

export default router;
