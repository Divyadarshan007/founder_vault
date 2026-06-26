import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { getProfileHandler, updateProfileHandler, getUserByIdHandler, listAgenciesHandler } from "./users.controller";

const router = Router();

router.use(authenticate);

router.get("/profile", getProfileHandler);
router.put("/profile", updateProfileHandler);
router.get("/agencies", listAgenciesHandler);
router.get("/:id", getUserByIdHandler);

export default router;
