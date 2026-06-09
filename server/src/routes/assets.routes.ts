import { Router } from 'express';
import { searchAssets } from '../controllers/assets.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.get('/search', authMiddleware, searchAssets);

export default router;
