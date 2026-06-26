import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { upload } from "../../middleware/upload";
import { uploadFilesHandler, downloadAttachmentHandler } from "./uploads.controller";

const router = Router();

router.use(authenticate);

router.post("/", upload.array("files", 5), uploadFilesHandler);
router.get("/:id/download", downloadAttachmentHandler);

export default router;
