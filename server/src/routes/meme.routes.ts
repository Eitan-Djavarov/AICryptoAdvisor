import { Router } from 'express';
import { proxyMemeImage } from '../controllers/meme.controller';

const router = Router();

router.get('/proxy', proxyMemeImage);

export default router;
