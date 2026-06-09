import { Router } from 'express';
import {
  getDashboard,
  submitFeedback,
} from '../controllers/dashboard.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.get('/', authMiddleware, getDashboard);

export const feedbackRouter = Router();
feedbackRouter.post('/', authMiddleware, submitFeedback);

export default router;
