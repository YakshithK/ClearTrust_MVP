import express from 'express'
import { detectScam } from "../controllers/detectorController.js"

const router = express.Router()

router.post('/detect', detectScam)

export default router