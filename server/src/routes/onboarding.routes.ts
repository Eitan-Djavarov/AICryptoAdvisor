import { Router } from 'express';
import {
  getPreferences,
  savePreferences,
  updatePreferences,
} from '../controllers/onboarding.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.get('/', authMiddleware, getPreferences);
router.post('/', authMiddleware, savePreferences);
router.put('/', authMiddleware, updatePreferences);

export default router;
