import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { inviteHandler, listSharesHandler, acceptShareHandler, revokeShareHandler, inviteByIdHandler } from "./shares.controller";

const router = Router();

router.use(authenticate);

router.post("/invite", inviteHandler);
router.post("/invite-by-id", inviteByIdHandler);
router.get("/", listSharesHandler);
router.post("/accept", acceptShareHandler);
router.delete("/:id", revokeShareHandler);

export default router;
