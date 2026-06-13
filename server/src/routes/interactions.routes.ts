import { Router } from 'express';
import { saveInteraction } from '../controllers/interactions.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.post('/interact', authMiddleware, saveInteraction);

export default router;
