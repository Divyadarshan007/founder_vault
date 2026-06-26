import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { searchHandler } from "./search.controller";

const router = Router();

router.use(authenticate);
router.get("/", searchHandler);

export default router;
