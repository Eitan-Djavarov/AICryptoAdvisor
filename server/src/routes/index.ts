import { Router } from 'express';
import authRoutes from './auth.routes';
import onboardingRoutes from './onboarding.routes';
import assetsRoutes from './assets.routes';
import dashboardRoutes, { feedbackRouter } from './dashboard.routes';
import memeRoutes from './meme.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/onboarding', onboardingRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/feedback', feedbackRouter);
router.use('/assets', assetsRoutes);
router.use('/meme', memeRoutes);

router.get('/', (_req, res) => {
  res.json({ message: 'AI Crypto Advisor API' });
});

export default router;
