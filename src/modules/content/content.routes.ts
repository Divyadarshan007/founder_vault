import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import {
  createContentHandler,
  listContentHandler,
  getContentHandler,
  updateContentHandler,
  deleteContentHandler,
  getStatsHandler,
} from "./content.controller";

const router = Router();

router.use(authenticate);

router.get("/stats", getStatsHandler);
router.post("/", createContentHandler);
router.get("/", listContentHandler);
router.get("/:id", getContentHandler);
router.put("/:id", updateContentHandler);
router.delete("/:id", deleteContentHandler);

export default router;
