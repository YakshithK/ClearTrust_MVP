import express from 'express'
import { detectSms } from "../controllers/smsDetectorController.js"
import { detectEmail } from '../controllers/emailDetectorController.js'

const router = express.Router()

router.post('/detect-sms', detectSms)

router.post('/detect-email', detectEmail)

export default router