import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";

const router = express.Router();

router.get(
  "/",
  requireAuth,
  asyncHandler(async (_req, res) => {
    const brokers = await prisma.broker.findMany({
      where: { status: "ACTIVE" },
      orderBy: [{ country: "asc" }, { name: "asc" }],
    });

    res.json({ brokers });
  }),
);

export default router;
