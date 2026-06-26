import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { getTagsHandler } from "./tags.controller";

const router = Router();

router.use(authenticate);
router.get("/", getTagsHandler);

export default router;
