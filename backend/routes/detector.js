import express from 'express'
import multer from "multer";
import { detectSms } from "../controllers/smsDetectorController.js"
import { detectEmail } from '../controllers/emailDetectorController.js'
import { detectPhone } from '../controllers/phoneDetectorController.js';

const upload = multer({ dest: "uploads/" });

const router = express.Router()

router.post('/detect-sms', detectSms)

router.post('/detect-email', detectEmail)

router.post("/detect-phone", upload.single("audio"), detectPhone);

export default router