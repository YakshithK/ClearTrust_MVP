import express from 'express';
import multer from 'multer';
import { detectPhone, detectSms, detectEmail, report } from '../controllers/detectorController.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });    

router.post('/detect-phone', upload.single('audio'), detectPhone); // Use multer for handling audio upload
router.post('/detect-sms', detectSms);
router.post('/detect-email', detectEmail);
router.post('/detect-report', report);

export default router;
