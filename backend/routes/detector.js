import express from 'express'
import multer from "multer";
import { detectEmail, detectSms, detectPhone, report } from '../controllers/detectorController.js';

const upload = multer({ dest: "uploads/" });

const router = express.Router()

router.post('/detect-sms', detectSms)

router.post('/detect-email', detectEmail)

router.post("/detect-phone", upload.single("audio"), detectPhone);

router.post('/detect-report', report)

export default router