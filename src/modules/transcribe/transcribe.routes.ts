import { Router } from "express";
import multer from "multer";
import { authenticate } from "../../middleware/auth";
import { transcribeAudio } from "./transcribe.controller";

const memUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^audio\//.test(file.mimetype)) cb(null, true);
    else cb(new Error(`Unsupported audio type: ${file.mimetype}`));
  },
});

const router = Router();
router.post("/", authenticate, memUpload.single("audio"), transcribeAudio);
export default router;
