import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { markEmailOpened } from "../services/removalService.js";

const router = express.Router();

const pixel = Buffer.from(
  "R0lGODlhAQABAPAAAP///wAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==",
  "base64",
);

router.get(
  "/email/open/:token.png",
  asyncHandler(async (req, res) => {
    await markEmailOpened(req.params.token, {
      ip: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.set({
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Content-Type": "image/gif",
      Expires: "0",
      Pragma: "no-cache",
    });

    res.end(pixel);
  }),
);

export default router;
